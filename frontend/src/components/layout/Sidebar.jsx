import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BrainCircuit,
  BookOpen,
  X,
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-100">
              <BrainCircuit className="text-white" size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              AI Learning <br/> Assistant
            </h1>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-5 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-[#00c2a0] text-white shadow-xl shadow-emerald-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {/* Pass the function here to access isActive for the icon as well */}
              {({ isActive }) => (
                <>
                  <link.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 mt-auto border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-4 w-full px-5 py-4 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <LogOut size={20} strokeWidth={2.5} className="transition-transform group-hover:scale-110" />
            </div>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;