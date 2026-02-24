import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, Lock, ArrowRight, User } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../../services/authService";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);

    try {
      await authService.register(username, email, password);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to register.");
      toast.error(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] relative overflow-hidden py-12">
      
      {/* Background Pattern - Matching Login.jsx */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>

      <div className="relative w-full max-w-[440px] px-6">
        {/* Card - Matching Login.jsx padding and radius */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            {/* Icon Box - Emerald Gradient/Solid Mix */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10b981] mb-6 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
              <BrainCircuit className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>

            <h1 className="text-[28px] font-semibold text-slate-900 tracking-tight mb-2">
              Create an account
            </h1>
            <p className="text-slate-500 text-[15px]">
              Start your AI-powered learning experience
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === "username" ? "text-[#10b981]" : "text-slate-400"}`}>
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="yourusername"
                  className="w-full h-[54px] pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10b981] transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === "email" ? "text-[#10b981]" : "text-slate-400"}`}>
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="w-full h-[54px] pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10b981] transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === "password" ? "text-[#10b981]" : "text-slate-400"}`}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full h-[54px] pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10b981] transition-all text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                <p className="text-xs text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            {/* Submit Button - Matching Login.jsx */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-[54px] bg-[#10b981] hover:bg-[#0da371] text-white rounded-2xl font-semibold shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Creating account..." : "Create account"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-[15px] text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#10b981] hover:underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Legal Text */}
        <p className="text-center text-[12px] text-slate-400 mt-8">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> & <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;