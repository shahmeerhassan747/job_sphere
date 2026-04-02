"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, MapPin, Clock, ChevronRight, 
  ExternalLink, Search, Filter, Loader2,
  CheckCircle2, Clock3, XCircle, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role !== 'seeker') {
      setError("This page is only accessible to job seekers.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/get_user_applications/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setApplications(data.applications || []);
        } else {
          setError(data.message || "Failed to load applications");
        }
      })
      .catch(() => setError("A network error occurred while fetching your applications."))
      .finally(() => setLoading(false));
  }, [router]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': 
        return { 
          bg: 'bg-amber-50', 
          text: 'text-amber-600', 
          border: 'border-amber-100', 
          icon: <Clock3 className="w-4 h-4" />,
          label: 'Pending'
        };
      case 'accepted':
      case 'shortlisted':
        return { 
          bg: 'bg-green-50', 
          text: 'text-green-600', 
          border: 'border-green-100', 
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: 'Shortlisted'
        };
      case 'rejected':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-600', 
          border: 'border-red-100', 
          icon: <XCircle className="w-4 h-4" />,
          label: 'Rejected'
        };
      default:
        return { 
          bg: 'bg-slate-50', 
          text: 'text-slate-600', 
          border: 'border-slate-100', 
          icon: <AlertCircle className="w-4 h-4" />,
          label: status
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12 px-4 mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">My Applications</h1>
            <p className="text-slate-500 font-medium text-lg">Track and manage your career opportunities in one place.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search your applications..."
                className="pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-64 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
              />
            </div>
            <button className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition shadow-sm">
                <Filter className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
             <p className="text-slate-400 font-bold animate-pulse">Retrieving your applications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center max-w-2xl mx-auto shadow-sm">
             <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h2>
             <p className="text-slate-600 font-medium mb-8 leading-relaxed">{error}</p>
             <button 
               onClick={() => window.location.reload()}
               className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-900/10"
             >
               Try Again
             </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-slate-200 p-16 rounded-[3rem] text-center shadow-sm">
             <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Briefcase className="w-12 h-12" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-3">No applications found</h2>
             <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">You haven't applied to any jobs yet. Start your journey by exploring the latest opportunities.</p>
             <Link 
               href="/jobs"
               className="inline-flex items-center gap-2 px-10 py-5 bg-primary text-white rounded-2xl font-black hover:opacity-90 transition shadow-2xl shadow-primary/20"
             >
               Explore Jobs <ChevronRight className="w-5 h-5" />
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {applications.map((app, idx) => {
                const status = getStatusStyle(app.status);
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white border border-slate-200 p-6 md:p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                      {/* Company Image/Logo */}
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shrink-0 shadow-inner">
                        {app.job.company_logo && app.job.company_logo !== "string" ? (
                           <img src={app.job.company_logo} alt={app.job.company_name} className="w-12 h-12 object-contain rounded-xl" />
                        ) : (
                           <span className="text-3xl font-black text-primary">{app.job.company_name?.charAt(0) || "?"}</span>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col md:flex-row justify-between gap-6 w-full">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3 mb-1">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${status.bg} ${status.text} ${status.border} flex items-center gap-2 shadow-sm`}>
                                 {status.icon} {status.label}
                              </span>
                              <span className="text-slate-300">•</span>
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                 <Clock className="w-3.5 h-3.5" /> {new Date(app.created_at).toLocaleDateString()}
                              </div>
                           </div>
                           <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{app.job.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 font-bold">
                               <Link href={`/companies/${app.job.company_id}`} className="flex items-center gap-2 group/comp hover:text-primary transition-colors">
                                  <span className="text-slate-900 group-hover/comp:text-primary transition-colors">{app.job.company_name || 'Anonymous Company'}</span>
                               </Link>
                              <div className="flex items-center gap-2">
                                 <MapPin className="w-4 h-4 text-slate-300" />
                                 <span className="text-sm">{app.job.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Briefcase className="w-4 h-4 text-slate-300" />
                                 <span className="text-sm">{app.job.type}</span>
                              </div>
                           </div>
                           
                           {/* Cover Letter Preview */}
                           {app.cover_letter && (
                             <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group-hover:bg-white transition-colors duration-500">
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">My Application Note</div>
                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic font-medium">"{app.cover_letter}"</p>
                             </div>
                           )}
                        </div>

                        <div className="flex flex-row md:flex-col justify-end items-center md:items-end gap-3 shrink-0">
                           <Link 
                             href={`/jobs/${app.job_id}`}
                             className="p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm"
                           >
                             <ExternalLink className="w-5 h-5" />
                           </Link>
                           <button className="flex-1 md:flex-none px-6 py-4 bg-white text-slate-900 rounded-2xl border border-slate-200 font-black text-sm hover:border-primary transition-all shadow-sm">
                              Withdraw
                           </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtle Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/5 transition-all duration-700" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
