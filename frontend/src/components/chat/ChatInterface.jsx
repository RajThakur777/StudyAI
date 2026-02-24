import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";
    return (
      <div key={index} className={`flex items-start gap-4 my-8 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] flex items-center justify-center shrink-0 border border-[#d1fae5]">
            <Sparkles className="w-5 h-5 text-[#00c2a0]" strokeWidth={2} />
          </div>
        )}
        <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm leading-relaxed ${
          isUser ? "bg-[#00c2a0] text-white rounded-tr-none font-medium" : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
        }`}>
          {isUser ? <p className="text-[15px]">{msg.content}</p> : <MarkdownRenderer content={msg.content} />}
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[75vh] items-center justify-center bg-white border border-slate-100 rounded-[2.5rem]">
        <Spinner />
        <p className="text-slate-400 mt-4 font-medium tracking-tight">Preparing conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
      
      {/* Messages Area */}
      <div className="flex-1 p-10 overflow-y-auto bg-white">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Larger w-24 icon box matching Dashboard Page headers */}
            <div className="w-24 h-24 rounded-[2.5rem] bg-[#ecfdf5] flex items-center justify-center border border-[#d1fae5] shadow-sm shadow-emerald-50">
              <MessageSquare className="w-12 h-12 text-[#00c2a0]" strokeWidth={1.5} />
            </div>
            <h3 className="text-[28px] font-bold text-slate-800 mt-8 tracking-tight">
              Start a conversation
            </h3>
            <p className="text-slate-400 mt-2 text-[18px] font-medium opacity-80">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {history.map(renderMessage)}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-4 my-8">
            <div className="w-10 h-10 rounded-2xl bg-[#ecfdf5] flex items-center justify-center border border-[#d1fae5]">
              <Sparkles className="w-5 h-5 text-[#00c2a0]" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-3xl rounded-tl-none shadow-sm">
              <span className="w-2 h-2 bg-[#00c2a0]/30 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-[#00c2a0]/30 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-[#00c2a0]/30 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area: Matches the floating pill style at the bottom of the screen */}
      <div className="p-8 bg-white border-t border-slate-50">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="w-full h-16 pl-8 pr-20 bg-white border border-slate-200 rounded-[1.8rem] focus:outline-none focus:border-[#00c2a0] focus:ring-4 focus:ring-[#00c2a0]/5 transition-all text-slate-700 placeholder:text-slate-400 font-medium text-[16px] shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="absolute right-3 w-12 h-12 bg-[#00c2a0] text-white rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(0,194,160,0.3)] hover:bg-[#00ad8e] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;