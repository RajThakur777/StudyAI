import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import moment from "moment";

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards.filter(
    (card) => card.lastReviewed
  ).length;

  const totalCards = flashcardSet.cards.length;

  const progressPercentage =
    totalCards > 0
      ? Math.round((reviewedCount / totalCards) * 100)
      : 0;

  return (
    <div
      onClick={handleStudyNow}
      className="group relative bg-white/80 backdrop-blur-xl border-2 border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="space-y-4">

        {/* Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <BookOpen
              className="w-6 h-6 text-emerald-600"
              strokeWidth={2}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold text-slate-900 line-clamp-2 mb-1"
              title={flashcardSet?.documentId?.title}
            >
              {flashcardSet?.documentId?.title}
            </h3>

            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Created {moment(flashcardSet.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-2">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-sm font-semibold text-slate-700">
              {totalCards} {totalCards === 1 ? "Card" : "Cards"}
            </span>
          </div>

          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <TrendingUp
                className="w-3.5 h-3.5 text-emerald-600"
                strokeWidth={2.5}
              />
              <span className="text-sm font-semibold text-emerald-700">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">
                Progress
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {reviewedCount}/{totalCards} reviewed
              </span>
            </div>

            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mt-6 pt-4 border-t border-slate-100">

          {/* Study Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStudyNow();
            }}
            className="group/btn relative w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Sparkles
                className="w-4 h-4"
                strokeWidth={2.5}
              />
              Study Now
            </span>

            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardSetCard;