/**
 * Real-time Head Tilt Detection Engine
 * Uses @mediapipe/tasks-vision with seamless fallback to canvas-based feature tracking,
 * plus keyboard/touch overrides.
 */

import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export interface HeadPoseData {
  tiltAngle: number; // Angle in degrees relative to calibrated zero (- = left, + = right)
  rawAngle: number; // Raw measured angle
  direction: 'left' | 'right' | 'center';
  confidence: number; // 0 to 1
  isFaceDetected: boolean;
  landmarks?: { x: number; y: number }[];
  mode: 'mediapipe' | 'fallback' | 'manual';
}

export type SensitivityLevel = 'low' | 'normal' | 'high';

export class HeadTracker {
  private videoElement: HTMLVideoElement | null = null;
  private faceLandmarker: FaceLandmarker | null = null;
  private isModelLoading: boolean = false;
  private modelLoadError: boolean = false;
  private stream: MediaStream | null = null;
  private animFrameId: number | null = null;

  // Calibration and sensitivity
  private zeroOffsetAngle: number = 0;
  private sensitivity: SensitivityLevel = 'normal';
  private smoothedAngle: number = 0;
  private isMirrored: boolean = true;

  // Listeners
  private onPoseCallback: ((data: HeadPoseData) => void) | null = null;
  private lastProcessedTimestamp: number = -1;

  // Fallback canvas for image analysis
  private fallbackCanvas: HTMLCanvasElement | null = null;
  private fallbackCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.fallbackCanvas = document.createElement('canvas');
      this.fallbackCanvas.width = 160;
      this.fallbackCanvas.height = 120;
      this.fallbackCtx = this.fallbackCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public setSensitivity(level: SensitivityLevel) {
    this.sensitivity = level;
  }

  public getSensitivity(): SensitivityLevel {
    return this.sensitivity;
  }

  public setMirrored(mirrored: boolean) {
    this.isMirrored = mirrored;
  }

  public getMirrored(): boolean {
    return this.isMirrored;
  }

  public calibrate() {
    this.zeroOffsetAngle = this.smoothedAngle;
  }

  public resetCalibration() {
    this.zeroOffsetAngle = 0;
  }

  private lastDirection: 'left' | 'right' | 'center' = 'center';

  public getThreshold(): { enter: number; exit: number } {
    switch (this.sensitivity) {
      case 'high':
        return { enter: 6, exit: 3.5 };
      case 'low':
        return { enter: 12, exit: 7 };
      case 'normal':
      default:
        return { enter: 8, exit: 4.5 };
    }
  }

  public async initMediaPipe(): Promise<boolean> {
    if (this.faceLandmarker) return true;
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      this.isModelLoading = false;
      return true;
    } catch (err) {
      console.warn('MediaPipe initialization warning (using high-speed fallback):', err);
      this.modelLoadError = true;
      this.isModelLoading = false;
      return false;
    }
  }

  public async startCamera(videoEl: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoEl;

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      // Attempt to load MediaPipe model asynchronously in background
      this.initMediaPipe().catch(() => {});

      this.startLoop();
      return true;
    } catch (err) {
      console.error('Failed to start camera:', err);
      return false;
    }
  }

  public stopCamera() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }

  public onPose(cb: (data: HeadPoseData) => void) {
    this.onPoseCallback = cb;
  }

  private startLoop() {
    const loop = () => {
      this.processFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private processFrame() {
    if (!this.videoElement || this.videoElement.readyState < 2) return;

    const currentTime = performance.now();
    if (currentTime - this.lastProcessedTimestamp < 30) {
      // Throttle to ~30fps for smooth performance without battery drain
      return;
    }
    this.lastProcessedTimestamp = currentTime;

    let computedRawAngle = 0;
    let isDetected = false;
    let confidence = 0;
    let landmarksOut: { x: number; y: number }[] | undefined;
    let mode: 'mediapipe' | 'fallback' = 'fallback';

    if (this.faceLandmarker && !this.modelLoadError) {
      try {
        const results = this.faceLandmarker.detectForVideo(this.videoElement, currentTime);
        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          // Outer eye corners: 33 (player right eye / left side of face), 263 (player left eye / right side of face)
          // Also chin #152 and nose #1
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];

          if (leftEye && rightEye) {
            // Delta y / delta x
            const dx = rightEye.x - leftEye.x;
            const dy = rightEye.y - leftEye.y;
            // Angle in degrees
            let rad = Math.atan2(dy, dx);
            let deg = (rad * 180) / Math.PI;

            // Normalize so 0 is horizontal eyes
            computedRawAngle = deg;
            isDetected = true;
            confidence = 0.95;
            mode = 'mediapipe';

            landmarksOut = [
              { x: leftEye.x, y: leftEye.y },
              { x: rightEye.x, y: rightEye.y },
              { x: landmarks[1]?.x ?? 0.5, y: landmarks[1]?.y ?? 0.5 }, // nose
            ];
          }
        }
      } catch {
        // Fallback to canvas
      }
    }

    // If MediaPipe is not ready yet or didn't detect, use smart lightweight optical/face centroid fallback
    if (!isDetected && this.fallbackCanvas && this.fallbackCtx) {
      const fbResult = this.calculateFallbackAngle();
      if (fbResult.isDetected) {
        computedRawAngle = fbResult.angle;
        isDetected = true;
        confidence = fbResult.confidence;
        mode = 'fallback';
      }
    }

    if (isDetected) {
      // Invert if mirrored so leaning right moves angle towards right
      if (this.isMirrored) {
        computedRawAngle = -computedRawAngle;
      }

      // Smooth with Exponential Moving Average (EMA) to prevent jitter
      const smoothingFactor = 0.5;
      this.smoothedAngle = this.smoothedAngle * (1 - smoothingFactor) + computedRawAngle * smoothingFactor;
    } else {
      // Gradually decay to zero if face temporarily lost
      this.smoothedAngle = this.smoothedAngle * 0.85;
    }

    const effectiveTilt = this.smoothedAngle - this.zeroOffsetAngle;
    const { enter, exit } = this.getThreshold();

    let direction: 'left' | 'right' | 'center' = 'center';
    if (this.lastDirection === 'left') {
      // Stay left unless tilted back past exit threshold
      direction = effectiveTilt < -exit ? 'left' : (effectiveTilt > enter ? 'right' : 'center');
    } else if (this.lastDirection === 'right') {
      // Stay right unless tilted back past exit threshold
      direction = effectiveTilt > exit ? 'right' : (effectiveTilt < -enter ? 'left' : 'center');
    } else {
      // From center, need to exceed enter threshold
      if (effectiveTilt < -enter) {
        direction = 'left';
      } else if (effectiveTilt > enter) {
        direction = 'right';
      }
    }
    this.lastDirection = direction;

    if (this.onPoseCallback) {
      this.onPoseCallback({
        tiltAngle: Math.round(effectiveTilt * 10) / 10,
        rawAngle: Math.round(computedRawAngle * 10) / 10,
        direction,
        confidence: Math.round(confidence * 100) / 100,
        isFaceDetected: isDetected,
        landmarks: landmarksOut,
        mode,
      });
    }
  }

  /**
   * Fast canvas fallback: detects face region centroid and tilt gradient
   * by analyzing skin-tone / brightness distribution in upper central viewport
   */
  private calculateFallbackAngle(): { angle: number; isDetected: boolean; confidence: number } {
    if (!this.fallbackCanvas || !this.fallbackCtx || !this.videoElement) {
      return { angle: 0, isDetected: false, confidence: 0 };
    }

    const w = this.fallbackCanvas.width;
    const h = this.fallbackCanvas.height;

    this.fallbackCtx.drawImage(this.videoElement, 0, 0, w, h);
    const imgData = this.fallbackCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let leftMass = 0;
    let rightMass = 0;
    let topMass = 0;
    let bottomMass = 0;
    let totalScore = 0;

    // Scan central 70% where face is located
    const startX = Math.floor(w * 0.15);
    const endX = Math.floor(w * 0.85);
    const startY = Math.floor(h * 0.1);
    const endY = Math.floor(h * 0.8);
    const midX = w / 2;
    const midY = h / 2;

    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Skin & luminance check (simple heuristic)
        const isSkin = r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 10;
        if (isSkin) {
          totalScore++;
          if (x < midX) leftMass += (midX - x);
          else rightMass += (x - midX);

          if (y < midY) topMass += (midY - y);
          else bottomMass += (y - midY);
        }
      }
    }

    if (totalScore < 120) {
      return { angle: 0, isDetected: false, confidence: 0 };
    }

    // Head tilt causes an asymmetric shift of mass in the upper portion
    const massDiff = (rightMass - leftMass) / (rightMass + leftMass + 1);
    const approximateAngle = massDiff * 45; // map to roughly -30 to +30 deg

    return {
      angle: approximateAngle,
      isDetected: true,
      confidence: 0.65,
    };
  }
}
