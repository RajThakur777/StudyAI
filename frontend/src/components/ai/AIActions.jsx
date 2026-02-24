import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";

const AIActions = () => {
  const { id: documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Generated Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }
    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(documentId, concept);
      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        {/* Header Section: Exact Proportions for Screenshot 2026-02-22 231241 */}
        <div className="px-6 py-5 border-b border-slate-50 bg-[#fcfcfc]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#00c2a0] flex items-center justify-center shadow-[0_5px_15px_rgba(0,194,160,0.25)]">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                AI Assistant
              </h3>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate Summary Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#00c2a0]/20">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                    <BookOpen className="w-4.5 h-4.5 text-blue-500" strokeWidth={2.2} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Generate Summary
                  </h4>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Get a concise summary of the entire document.
                </p>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="h-10 px-6 bg-[#00c2a0] hover:bg-[#00ad8e] text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(0,194,160,0.2)] transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingAction === "summary" ? "Summarizing..." : "Summarize"}
              </button>
            </div>
          </div>

          {/* Explain Concept Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#00c2a0]/20">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                <Lightbulb className="w-4.5 h-4.5 text-amber-500" strokeWidth={2.2} />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Explain a Concept
              </h4>
            </div>

            <p className="text-sm text-slate-500 font-medium mb-5 leading-relaxed">
              Enter a topic or concept from the document to get a detailed explanation.
            </p>

            <form onSubmit={handleExplainConcept} className="flex items-center gap-3">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., 'React Hooks'"
                className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00c2a0] transition-all text-slate-700 text-sm font-medium"
                disabled={loadingAction === "explain"}
              />

              <button
                type="submit"
                disabled={loadingAction === "explain" || !concept.trim()}
                className="shrink-0 h-11 px-8 bg-[#00c2a0] hover:bg-[#00ad8e] text-white rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(0,194,160,0.2)] transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingAction === "explain" ? "Thinking..." : "Explain"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto px-1 py-2">
          <div className="prose prose-slate prose-sm max-w-none prose-p:text-slate-600 prose-headings:font-bold">
            <MarkdownRenderer content={modalContent} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIActions;