import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, User, Menu } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-white border-b border-slate-100 flex items-center">
      <div className="flex items-center justify-between w-full px-8">
        <button onClick={toggleSidebar} className="md:hidden text-slate-500 p-2">
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={22} strokeWidth={2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 tracking-tight leading-none uppercase">
                {user?.username || "Alex"}
              </p>
              <p className="text-[11px] text-slate-400 font-bold tracking-tight mt-1">
                {user?.email || "alex@timetoprogram.com"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#00c2a0] flex items-center justify-center shadow-lg shadow-emerald-100">
              <User size={20} strokeWidth={2.5} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;