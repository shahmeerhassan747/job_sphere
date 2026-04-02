"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
}

export default function SpecificUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8000/get_specific_users/${params.id}`);
        const data = await res.json();
        
        if (data.success && data.data && data.data.user) {
          setUser(data.data.user);
        } else {
          setError(data.error || data.message || "Failed to load user profile.");
        }
      } catch (err) {
        setError("Network error while connecting to the server.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [params.id]);

  const initials = user?.name && user.name !== "string" 
    ? user.name.slice(0, 2).toUpperCase() 
    : "US";

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link 
            href="/users" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-100 p-12 rounded-[2rem] text-center">
              <User className="w-16 h-16 text-red-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
              <p className="text-slate-500 mb-6">{error}</p>
              <button 
                onClick={() => router.push('/users')}
                className="bg-white text-slate-700 border border-slate-200 font-bold py-2 px-6 rounded-xl hover:bg-slate-50 transition"
              >
                Return to Directory
              </button>
            </div>
          )}

          {/* Profile Card */}
          {!loading && !error && user && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm"
            >
              {/* Cover Banner */}
              <div className="h-48 bg-gradient-to-r from-primary to-blue-600 relative">
                <div className="absolute inset-0 bg-white/10 opacity-20"></div>
              </div>

              {/* Profile Details Container */}
              <div className="px-6 md:px-10 pb-12 relative">
                {/* Avatar */}
                <div className="w-32 h-32 bg-white rounded-[2rem] p-2 -mt-16 relative z-10 shadow-lg mb-6">
                  <div className="w-full h-full bg-gradient-to-br from-primary to-blue-500 rounded-3xl flex items-center justify-center text-4xl font-extrabold text-white">
                    {initials}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
                       {user.name && user.name !== "string" ? user.name : "Anonymous User"}
                    </h1>
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-8 ${
                      user.role === 'employer' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-slate-700 font-medium bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                        <Mail className="w-5 h-5 text-slate-400" /> 
                        {user.email}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex items-center gap-4 text-slate-700 font-medium bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                          <MapPin className="w-5 h-5 text-slate-400" /> 
                          Location Unknown
                        </div>
                        <div className="flex-1 flex items-center gap-4 text-slate-700 font-medium bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                          <Calendar className="w-5 h-5 text-slate-400" /> 
                          Joined {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 w-full md:w-64 bg-slate-50 rounded-[2rem] p-8 border border-slate-100 text-center">
                    <Briefcase className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Public Profile</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">This user is successfully registered on the JobSphere platform.</p>
                    <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-md hover:shadow-lg">
                      Contact User
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
