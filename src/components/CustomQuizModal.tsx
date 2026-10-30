import React, { useState } from 'react';
import { Plus, Trash2, X, Check, Save, Image as ImageIcon } from 'lucide-react';
import { Question, QuizPack } from '../questions';
import { ImageUploader } from './ImageUploader';

interface CustomQuizModalProps {
  onClose: () => void;
  onSavePack: (pack: QuizPack) => void;
  existingCustomPack?: QuizPack | null;
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  onClose,
  onSavePack,
  existingCustomPack,
}) => {
  const [packTitle, setPackTitle] = useState(existingCustomPack?.title || 'Bộ Câu Hỏi Của Bạn');
  const [packDescription, setPackDescription] = useState(
    existingCustomPack?.description || 'Bộ câu hỏi tự biên soạn thỏa thích cho bạn bè cùng chơi'
  );
  const [questions, setQuestions] = useState<Question[]>(
    existingCustomPack?.questions?.length
      ? existingCustomPack.questions
      : [
          {
            id: 'custom-1',
            question: 'Bạn thích ăn món nào hơn vào mùa đông?',
            optionA: 'Bún riêu cua nóng hổi',
            optionB: 'Lẩu thái chua cay',
            correct: 'left',
            category: 'Ẩm thực',
          },
          {
            id: 'custom-2',
            question: 'Sông Mê Kông chảy qua bao nhiêu quốc gia?',
            optionA: '6 quốc gia',
            optionB: '5 quốc gia',
            correct: 'left',
            explanation: 'Trung Quốc, Myanmar, Lào, Thái Lan, Campuchia, Việt Nam.',
            category: 'Địa lý',
          },
        ]
  );

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>(undefined);
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionAImage, setNewOptionAImage] = useState<string | undefined>(undefined);
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionBImage, setNewOptionBImage] = useState<string | undefined>(undefined);
  const [newCorrect, setNewCorrect] = useState<'left' | 'right'>('left');
  const [newCategory, setNewCategory] = useState('Đố vui');
  const [newExplanation, setNewExplanation] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !newOptionA.trim() || !newOptionB.trim()) {
      return;
    }

    const newQ: Question = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      question: newQuestionText.trim(),
      imageUrl: newImageUrl || undefined,
      optionA: newOptionA.trim(),
      optionAImage: newOptionAImage || undefined,
      optionB: newOptionB.trim(),
      optionBImage: newOptionBImage || undefined,
      correct: newCorrect,
      category: newCategory.trim() || 'Đố vui',
      explanation: newExplanation.trim() || undefined,
    };

    setQuestions([...questions, newQ]);
    setNewQuestionText('');
    setNewImageUrl(undefined);
    setNewOptionA('');
    setNewOptionAImage(undefined);
    setNewOptionB('');
    setNewOptionBImage(undefined);
    setNewExplanation('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSaveAll = () => {
    if (questions.length === 0) return;

    const pack: QuizPack = {
      id: existingCustomPack?.id || `custom-pack-${Date.now()}`,
      title: packTitle.trim() || 'Bộ Câu Hỏi Tự Tạo',
      description: packDescription.trim() || 'Bộ câu hỏi cá nhân hóa',
      icon: '🎨',
      color: 'from-purple-600 to-indigo-600',
      questions,
    };

    onSavePack(pack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Tự Tạo Bộ Câu Hỏi Nghiêng Đầu</h2>
            <p className="text-xs text-slate-400">
              Nhập câu hỏi và 2 đáp án Trái / Phải để thử thách bạn bè
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Pack Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tên Bộ Câu Hỏi:
              </label>
              <input
                type="text"
                value={packTitle}
                onChange={(e) => setPackTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="VD: Đố Bạn Cùng Lớp..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Mô tả ngắn:</label>
              <input
                type="text"
                value={packDescription}
                onChange={(e) => setPackDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="VD: Cười bể bụng cùng đám bạn thân..."
              />
            </div>
          </div>

          {/* New Question Form */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-sky-400">
              + Thêm Câu Hỏi Mới
            </span>

            <div>
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="mt-2">
                <ImageUploader
                  label="Ảnh minh họa câu hỏi (tùy chọn):"
                  value={newImageUrl}
                  onChange={setNewImageUrl}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-sky-300 mb-1">
                    Đáp án A (Nghiêng Trái):
                  </label>
                  <input
                    type="text"
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    placeholder="Lựa chọn bên trái..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <ImageUploader
                  compact
                  label="Ảnh cho đáp án A (tùy chọn):"
                  value={newOptionAImage}
                  onChange={setNewOptionAImage}
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-rose-300 mb-1">
                    Đáp án B (Nghiêng Phải):
                  </label>
                  <input
                    type="text"
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    placeholder="Lựa chọn bên phải..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <ImageUploader
                  compact
                  label="Ảnh cho đáp án B (tùy chọn):"
                  value={newOptionBImage}
                  onChange={setNewOptionBImage}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Đáp án nào đúng?
                </label>
                <select
                  value={newCorrect}
                  onChange={(e) => setNewCorrect(e.target.value as 'left' | 'right')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="left">Đáp án Trái (A)</option>
                  <option value="right">Đáp án Phải (B)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Giải thích ngắn (tùy chọn):
                </label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Lý do hoặc bình luận vui..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddQuestion}
              disabled={!newQuestionText.trim() || !newOptionA.trim() || !newOptionB.trim()}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm vào danh sách câu hỏi
            </button>
          </div>

          {/* Question List Preview */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh Sách Câu Hỏi ({questions.length})
            </span>

            {questions.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-950/40 rounded-xl">
                Chưa có câu hỏi nào. Hãy thêm ít nhất 1 câu hỏi ở trên.
              </p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-white mb-1">
                        #{idx + 1}. {q.question}
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className={q.correct === 'left' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          ◄ Trái: {q.optionA} {q.correct === 'left' && '✓'}
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className={q.correct === 'right' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          Phải: {q.optionB} {q.correct === 'right' && '✓'} ►
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSaveAll}
            disabled={questions.length === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu & Chọn Chơi Bộ Này
          </button>
        </div>
      </div>
    </div>
  );
};
