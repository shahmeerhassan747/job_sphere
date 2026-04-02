"use client";

import { Search, MapPin, User, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <span className="text-3xl">🎯</span>
          <Link href="/">JobSphere</Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link>
          <Link href="/companies" className="hover:text-primary transition-colors">Companies</Link>
          <Link href="/salaries" className="hover:text-primary transition-colors">Salaries</Link>
          {user?.role === 'seeker' && (
            <Link href="/applications" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> My Applications
            </Link>
          )}
          {user?.role === 'recruiter' && (
             <Link href="/dashboard" className="hover:text-primary transition-colors">Employer Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 font-medium hover:text-primary transition-colors px-1.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm group pr-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300 shadow-inner">
                  {user.avatar && user.avatar !== "NULL" ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                  )}
                </div>
                <span className="hidden sm:inline font-bold text-slate-700">{user.name || 'Profile'}</span>
              </Link>
              {user.role === 'recruiter' && (
                <Link href="/jobs/new" className="btn-primary">Post a Job</Link>
              )}
              <button 
                onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
                className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="font-medium hover:text-primary">Login</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
