import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Title */}
          <div className="mb-6 pr-8">
            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>

          {/* Body */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
