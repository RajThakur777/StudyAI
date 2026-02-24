import React, { useState, useEffect } from "react";
import { Plus, Trash2, X, FileText } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService";
import aiService from "../../services/aiService";

import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import QuizCard from "./QuizCard";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(data.data);
    } catch (error) {
      toast.error("Failed to fetch quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchQuizzes();
  }, [documentId]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions });
      toast.success("Quiz generated successfully!");
      setIsGenerateModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz.");
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success("Quiz deleted.");
      setIsDeleteModalOpen(false);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id));
    } catch (error) {
      toast.error("Failed to delete quiz.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner /></div>;

  return (
    /* Main Wrapper: Uses the light off-white bg from the images to provide contrast for the cards */
    <div className="bg-[#fcfcfc] border border-slate-100 rounded-[2.5rem] p-10 shadow-sm min-h-[500px]">
      
      {/* Top Header Section: Aligns the "Generate Quiz" button to the far right as per image ac53d3 */}
      <div className="flex justify-end mb-10">
        <button 
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 px-6 h-12 bg-[#00c2a0] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(0,194,160,0.25)] hover:bg-[#00ad8e] transition-all active:scale-95 text-[14px]"
        >
          <Plus size={18} strokeWidth={3} />
          Generate Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        /* Empty State: Perfectly centered dashed box alignment */
        <div className="relative border-2 border-dashed border-slate-200 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#eff3f9] flex items-center justify-center mb-6 border border-[#d1fae5]">
            <FileText className="w-8 h-8 text-[#1e293b]" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">No Quizzes Yet</h3>
          <p className="text-slate-400 font-medium text-[15px] max-w-sm">
            Generate a quiz from your document to test your knowledge and track your learning progress.
          </p>
        </div>
      ) : (
        /* Quiz Grid: Correct column alignment matching the Documents view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onDelete={() => { setSelectedQuiz(quiz); setIsDeleteModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Generate Modal: Standardized alignment with Auth/Profile inputs */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
            <button onClick={() => setIsGenerateModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
              <X size={26} strokeWidth={2.5} />
            </button>
            <h2 className="text-[26px] font-bold text-slate-900 mb-1 tracking-tight">Generate New Quiz</h2>
            <p className="text-slate-500 text-[14px] mb-10 font-medium tracking-tight">Configure your AI-powered quiz</p>
            
            <form onSubmit={handleGenerateQuiz} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Number of Questions</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#00c2a0] focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-700 font-medium text-lg"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="flex-1 h-14 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={generating} className="flex-1 h-14 bg-[#00c2a0] text-white rounded-2xl font-bold shadow-lg shadow-[#00c2a0]/20 active:scale-95 transition-all">
                  {generating ? "Creating..." : "Generate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl text-center border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-rose-500" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Quiz?</h2>
            <p className="text-slate-500 text-[14px] font-medium mb-10 leading-relaxed">This action cannot be undone. All results will be lost.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
              <button onClick={handleConfirmDelete} disabled={deleting} className="flex-1 h-12 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-100 active:scale-95 transition-all">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManager;