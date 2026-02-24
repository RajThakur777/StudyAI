import React from "react";
import { FileText, Plus } from "lucide-react";

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      
      {/* Icon Container */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-6">
        <FileText className="w-8 h-8 text-slate-400" strokeWidth={2} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="group relative inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {buttonText}
          </span>

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;