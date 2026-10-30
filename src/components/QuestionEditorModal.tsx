import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Save,
  RotateCcw,
  FileText,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { Question, QuizPack, DEFAULT_QUIZ_PACKS } from '../questions';
import { ImageUploader } from './ImageUploader';

interface QuestionEditorModalProps {
  quizPacks: QuizPack[];
  selectedPackId: string;
  onClose: () => void;
  onUpdatePacks: (packs: QuizPack[], newSelectedId?: string) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  quizPacks,
  selectedPackId,
  onClose,
  onUpdatePacks,
}) => {
  const [activePackId, setActivePackId] = useState<string>(selectedPackId);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Edit fields for currently active question
  const [editForm, setEditForm] = useState<{
    question: string;
    imageUrl?: string;
    optionA: string;
    optionAImage?: string;
    optionB: string;
    optionBImage?: string;
    correct: 'left' | 'right';
    category: string;
    explanation: string;
  }>({
    question: '',
    imageUrl: undefined,
    optionA: '',
    optionAImage: undefined,
    optionB: '',
    optionBImage: undefined,
    correct: 'left',
    category: 'Đố vui',
    explanation: '',
  });

  // Adding new question state
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [batchImportOpen, setBatchImportOpen] = useState<boolean>(false);
  const [batchText, setBatchText] = useState<string>('');
  const [batchError, setBatchError] = useState<string | null>(null);

  const currentPack = quizPacks.find((p) => p.id === activePackId) || quizPacks[0];

  const handleStartEdit = (q: Question) => {
    setIsAddingNew(false);
    setEditingQuestionId(q.id);
    setEditForm({
      question: q.question,
      imageUrl: q.imageUrl,
      optionA: q.optionA,
      optionAImage: q.optionAImage,
      optionB: q.optionB,
      optionBImage: q.optionBImage,
      correct: q.correct,
      category: q.category || 'Đố vui',
      explanation: q.explanation || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setIsAddingNew(false);
  };

  const handleSaveQuestion = () => {
    if (!editForm.question.trim() || !editForm.optionA.trim() || !editForm.optionB.trim()) {
      return;
    }

    if (isAddingNew) {
      // Add new question to current pack
      const newQuestion: Question = {
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: editForm.question.trim(),
        imageUrl: editForm.imageUrl || undefined,
        optionA: editForm.optionA.trim(),
        optionAImage: editForm.optionAImage || undefined,
        optionB: editForm.optionB.trim(),
        optionBImage: editForm.optionBImage || undefined,
        correct: editForm.correct,
        category: editForm.category.trim() || 'Đố vui',
        explanation: editForm.explanation.trim() || undefined,
      };

      const updatedPacks = quizPacks.map((pack) => {
        if (pack.id === activePackId) {
          return {
            ...pack,
            questions: [...pack.questions, newQuestion],
          };
        }
        return pack;
      });

      onUpdatePacks(updatedPacks, activePackId);
      setIsAddingNew(false);
    } else if (editingQuestionId) {
      // Update existing question
      const updatedPacks = quizPacks.map((pack) => {
        if (pack.id === activePackId) {
          return {
            ...pack,
            questions: pack.questions.map((q) => {
              if (q.id === editingQuestionId) {
                return {
                  ...q,
                  question: editForm.question.trim(),
                  imageUrl: editForm.imageUrl || undefined,
                  optionA: editForm.optionA.trim(),
                  optionAImage: editForm.optionAImage || undefined,
                  optionB: editForm.optionB.trim(),
                  optionBImage: editForm.optionBImage || undefined,
                  correct: editForm.correct,
                  category: editForm.category.trim() || 'Đố vui',
                  explanation: editForm.explanation.trim() || undefined,
                };
              }
              return q;
            }),
          };
        }
        return pack;
      });

      onUpdatePacks(updatedPacks, activePackId);
      setEditingQuestionId(null);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (currentPack.questions.length <= 1) {
      alert('Bộ câu hỏi cần có ít nhất 1 câu!');
      return;
    }

    const updatedPacks = quizPacks.map((pack) => {
      if (pack.id === activePackId) {
        return {
          ...pack,
          questions: pack.questions.filter((q) => q.id !== questionId),
        };
      }
      return pack;
    });

    onUpdatePacks(updatedPacks, activePackId);
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }
  };

  const handleStartAddNew = () => {
    setEditingQuestionId(null);
    setIsAddingNew(true);
    setEditForm({
      question: '',
      imageUrl: undefined,
      optionA: '',
      optionAImage: undefined,
      optionB: '',
      optionBImage: undefined,
      correct: 'left',
      category: currentPack.title || 'Đố vui',
      explanation: '',
    });
  };

  const handleResetToDefault = () => {
    if (confirm('Bạn có chắc muốn khôi phục toàn bộ các bộ câu hỏi về mặc định ban đầu?')) {
      onUpdatePacks(DEFAULT_QUIZ_PACKS, DEFAULT_QUIZ_PACKS[0].id);
      setActivePackId(DEFAULT_QUIZ_PACKS[0].id);
      setEditingQuestionId(null);
      setIsAddingNew(false);
    }
  };

  const handleProcessBatchImport = () => {
    if (!batchText.trim()) return;
    setBatchError(null);

    const lines = batchText.split('\n').filter((l) => l.trim().length > 0);
    const parsedQuestions: Question[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Format: Câu hỏi | Đáp án Trái | Đáp án Phải | Trái/Phải | Giải thích
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 3) {
        const qText = parts[0];
        const optA = parts[1];
        const optB = parts[2];
        const correctChoice =
          parts[3]?.toLowerCase().includes('phải') || parts[3]?.toLowerCase() === 'b' || parts[3]?.toLowerCase() === 'right'
            ? 'right'
            : 'left';
        const expl = parts[4] || undefined;

        parsedQuestions.push({
          id: `batch-${Date.now()}-${i}`,
          question: qText,
          optionA: optA,
          optionB: optB,
          correct: correctChoice,
          category: 'Tự nhập',
          explanation: expl,
        });
      }
    }

    if (parsedQuestions.length === 0) {
      setBatchError('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra định dạng phân cách bằng dấu |');
      return;
    }

    const updatedPacks = quizPacks.map((pack) => {
      if (pack.id === activePackId) {
        return {
          ...pack,
          questions: [...pack.questions, ...parsedQuestions],
        };
      }
      return pack;
    });

    onUpdatePacks(updatedPacks, activePackId);
    setBatchText('');
    setBatchImportOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Quản Lý & Chỉnh Sửa Câu Hỏi</h2>
              <p className="text-xs text-slate-400">
                Chỉnh sửa nội dung câu hỏi, đổi đáp án Trái / Phải hoặc thêm câu hỏi tùy ý
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Pack Selection Tabs */}
        <div className="py-3 flex items-center justify-between border-b border-slate-800/80 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {quizPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => {
                  setActivePackId(pack.id);
                  setEditingQuestionId(null);
                  setIsAddingNew(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activePackId === pack.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{pack.icon}</span>
                <span>{pack.title}</span>
                <span className="text-[10px] opacity-75">({pack.questions.length})</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleResetToDefault}
            title="Khôi phục toàn bộ câu hỏi về mặc định ban đầu"
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Top Actions: Add New / Batch Import */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh Sách Câu Hỏi ({currentPack.questions.length})
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBatchImportOpen(!batchImportOpen)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Nhập nhanh hàng loạt</span>
              </button>

              <button
                onClick={handleStartAddNew}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Câu Hỏi Mới</span>
              </button>
            </div>
          </div>

          {/* Batch Import Card if Open */}
          {batchImportOpen && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Dán câu hỏi nhanh theo định dạng
                </span>
                <button
                  onClick={() => setBatchImportOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Đóng
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Mỗi dòng một câu hỏi theo cấu trúc: <br />
                <code className="text-amber-300 font-mono">
                  Câu hỏi ? | Đáp án Trái | Đáp án Phải | Trái (hoặc Phải) | Lời giải thích (tùy chọn)
                </code>
              </p>

              <textarea
                rows={4}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="VD: Cây gì càng đốt càng dài? | Cây tre | Cây nến | Trái | Cây tre có nhiều đốt"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />

              {batchError && <p className="text-xs text-rose-400">{batchError}</p>}

              <button
                onClick={handleProcessBatchImport}
                disabled={!batchText.trim()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                Thêm danh sách này vào bộ câu hỏi
              </button>
            </div>
          )}

          {/* Form when Editing or Adding */}
          {(isAddingNew || editingQuestionId) && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-indigo-500/50 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {isAddingNew ? '+ THÊM CÂU HỎI MỚI' : '✏️ CHỈNH SỬA CÂU HỎI'}
                </span>
                <button
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nội dung câu hỏi:
                </label>
                <input
                  type="text"
                  value={editForm.question}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {/* Question Image Uploader */}
                <div className="mt-2.5">
                  <ImageUploader
                    label="Ảnh minh họa cho câu hỏi (tùy chọn):"
                    value={editForm.imageUrl}
                    onChange={(val) => setEditForm({ ...editForm, imageUrl: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-sky-400 mb-1">
                      Đáp án A (Nghiêng Trái):
                    </label>
                    <input
                      type="text"
                      value={editForm.optionA}
                      onChange={(e) => setEditForm({ ...editForm, optionA: e.target.value })}
                      placeholder="Lựa chọn bên trái..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  {/* Option A Image */}
                  <ImageUploader
                    compact
                    label="Ảnh cho đáp án A (tùy chọn):"
                    value={editForm.optionAImage}
                    onChange={(val) => setEditForm({ ...editForm, optionAImage: val })}
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-rose-400 mb-1">
                      Đáp án B (Nghiêng Phải):
                    </label>
                    <input
                      type="text"
                      value={editForm.optionB}
                      onChange={(e) => setEditForm({ ...editForm, optionB: e.target.value })}
                      placeholder="Lựa chọn bên phải..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  {/* Option B Image */}
                  <ImageUploader
                    compact
                    label="Ảnh cho đáp án B (tùy chọn):"
                    value={editForm.optionBImage}
                    onChange={(val) => setEditForm({ ...editForm, optionBImage: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Đáp án chính xác:
                  </label>
                  <select
                    value={editForm.correct}
                    onChange={(e) =>
                      setEditForm({ ...editForm, correct: e.target.value as 'left' | 'right' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="left">Đáp án Trái (A)</option>
                    <option value="right">Đáp án Phải (B)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chủ đề:</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Giải thích (khi hiện kết quả):
                  </label>
                  <input
                    type="text"
                    value={editForm.explanation}
                    onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                    placeholder="Lý do hoặc bình luận vui..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={!editForm.question.trim() || !editForm.optionA.trim() || !editForm.optionB.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAddingNew ? 'Lưu Câu Hỏi Mới' : 'Cập Nhật Câu Hỏi'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-2.5">
            {currentPack.questions.map((q, idx) => {
              const isSelectedForEdit = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelectedForEdit
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-snug">{q.question}</h4>
                        {q.imageUrl && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Ảnh câu hỏi
                          </span>
                        )}
                      </div>

                      {/* Question image preview in list if present */}
                      {q.imageUrl && (
                        <div className="my-2">
                          <img
                            src={q.imageUrl}
                            alt="Ảnh câu hỏi"
                            className="h-16 w-auto max-w-xs object-contain rounded-lg border border-slate-700 bg-slate-950 p-0.5"
                          />
                        </div>
                      )}

                      {/* Choices breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                        <div
                          className={`px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 ${
                            q.correct === 'left'
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {q.optionAImage && (
                              <img
                                src={q.optionAImage}
                                alt="A"
                                className="w-6 h-6 object-cover rounded border border-slate-700 flex-shrink-0"
                              />
                            )}
                            <span className="truncate">◄ Trái: {q.optionA}</span>
                          </div>
                          {q.correct === 'left' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] flex-shrink-0" />}
                        </div>

                        <div
                          className={`px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 ${
                            q.correct === 'right'
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {q.optionBImage && (
                              <img
                                src={q.optionBImage}
                                alt="B"
                                className="w-6 h-6 object-cover rounded border border-slate-700 flex-shrink-0"
                              />
                            )}
                            <span className="truncate">Phải: {q.optionB} ►</span>
                          </div>
                          {q.correct === 'right' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3] flex-shrink-0" />}
                        </div>
                      </div>

                      {q.explanation && (
                        <p className="mt-2 text-[11px] text-slate-400 italic">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(q)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        title="Chỉnh sửa câu hỏi này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Mọi thay đổi được tự động lưu vào bộ nhớ trình duyệt
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors cursor-pointer"
          >
            Hoàn Tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
