"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Search } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8000/get_all_users");
        const data = await res.json();
        if (data.success && data.data && data.data.users) {
          setUsers(data.data.users);
        } else {
          setError("Failed to load users data.");
        }
      } catch (err) {
        setError("Network error while connecting to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    return (
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getInitials = (name: string) => {
    if (!name || name === "string") return "US"; // fallback for placeholder data
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Users Directory</h1>
              <p className="text-slate-500 font-medium">Browse system members, jobseekers, and employers.</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center font-bold">
              {error}
            </div>
          )}

          {/* Users Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                        {getInitials(user.name)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'employer' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">
                      {user.name && user.name !== "string" ? user.name : "Anonymous User"}
                    </h3>
                    
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium whitespace-nowrap overflow-hidden">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Joined {formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/users/${user.id}`}
                    className="border-t border-slate-100 p-4 bg-slate-50 text-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer mt-auto block"
                  >
                    View Full Profile
                  </Link>
                </motion.div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-500">We couldn't find anyone matching "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-primary font-bold hover:underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
