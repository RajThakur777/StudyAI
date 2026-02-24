import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFlashcardSets();
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Set deleted!");
      setIsDeleteModalOpen(false);
      fetchFlashcardSets();
    } catch (error) {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const renderSetList = () => {
    if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>;

    if (flashcardSets.length === 0) {
      return (
        /* Empty State: Exact match for Screenshot 2026-02-22 231246 centered layout */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#ecfdf5] flex items-center justify-center mb-5 border border-[#d1fae5]">
            <Brain className="w-7 h-7 text-[#00c2a0]" strokeWidth={2} />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">
            No Flashcards Yet
          </h3>

          <p className="text-slate-500 text-[13px] mb-8 max-w-xs font-medium leading-relaxed opacity-80">
            Generate flashcards from your document to start learning and
            reinforce your knowledge.
          </p>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 px-6 h-11 bg-[#00c2a0] text-white rounded-xl font-bold shadow-[0_8px_20px_rgba(0,194,160,0.25)] hover:bg-[#00ad8e] transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} strokeWidth={2.5} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Your Flashcard Sets</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">
              {flashcardSets.length} sets available
            </p>
          </div>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-[#00c2a0] text-white rounded-lg font-bold shadow-sm text-[12px] transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            Generate New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="group relative bg-white border border-slate-100 rounded-2xl p-6 cursor-pointer shadow-sm hover:border-[#00c2a0]/40 transition-all"
            >
              <button
                onClick={(e) => { e.stopPropagation(); setSetToDelete(set); setIsDeleteModalOpen(true); }}
                className="absolute top-4 right-4 p-1 text-slate-300 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>

              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <Brain className="text-[#00c2a0]" size={18} />
              </div>

              <h4 className="text-[14px] font-bold text-slate-800 mb-0.5">Flashcard Set</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {moment(set.createdAt).format("MMM D, YYYY")}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-50">
                <span className="text-[11px] font-bold text-[#00c2a0] bg-emerald-50 px-3 py-1 rounded-md">
                  {set.cards.length} cards
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFlashcardViewer = () => {
    const currentCard = selectedSet.cards[currentCardIndex];
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <button
          onClick={() => setSelectedSet(null)}
          className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
        >
          <ArrowLeft size={13} strokeWidth={3} /> Back to Sets
        </button>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl mb-8">
            <Flashcard flashcard={currentCard} onToggleStar={() => {}} />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentCardIndex((prev) => (prev - 1 + selectedSet.cards.length) % selectedSet.cards.length)}
              className="flex items-center gap-2 px-4 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs"
            >
              <ChevronLeft size={16} strokeWidth={3} /> Prev
            </button>

            <div className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-[12px] font-bold text-slate-600 shadow-sm">
              {currentCardIndex + 1} / {selectedSet.cards.length}
            </div>

            <button
              onClick={() => setCurrentCardIndex((prev) => (prev + 1) % selectedSet.cards.length)}
              className="flex items-center gap-2 px-4 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-lg text-xs"
            >
              Next <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Container: Matches Screenshot 2026-02-22 231246 white bg with round corners */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] min-h-[400px]">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Set?">
        <div className="p-1">
          <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">This action cannot be undone. All cards will be permanently removed.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-400 font-bold text-sm">Cancel</button>
            <button onClick={handleConfirmDelete} disabled={deleting} className="px-5 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl">
              {deleting ? "Deleting..." : "Delete Set"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;