"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, X, Search, MapPin, Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";

function JobsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyIdParam = searchParams.get("company_id");

  // Data States
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  // Auth State
  const [user, setUser] = useState<any>(null);

  // Search States
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [errorPost, setErrorPost] = useState("");
  const [successPost, setSuccessPost] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "Full-time",
    company_id: "",
    min_salary: "",
    max_salary: "",
    currency: "USD",
    image: ""
  });

  // ─── Initial Data Load ──────────────────────────────────
  useEffect(() => {
    // 1. Initial Fetch (All Jobs)
    fetchJobs();

    // 2. Initial Fetch (Companies for dropdown)
    fetch("http://localhost:8000/get_list_companies")
      .then(res => res.json())
      .then(data => setCompanies(data.companies || []))
      .catch(() => {});

    // 3. Auth Check
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
  }, []);

  // ─── Search Handlers ────────────────────────────────────
  const fetchJobs = () => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (searchTitle) params.append("title", searchTitle);
    if (searchLocation) params.append("location", searchLocation);
    if (searchType) params.append("type", searchType);
    
    // We use get_all_jobs initially, then jobs/search if filters applied
    const endpoint = (searchTitle || searchLocation || searchType)
      ? `http://localhost:8000/jobs/search?${params.toString()}`
      : "http://localhost:8000/get_all_jobs";

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        // Now both get_all_jobs and jobs/search return the same structure
        const fetchedJobs = data.data?.jobs || [];
        setJobs(fetchedJobs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJobs();
    }, 500); // Debounce search
    return () => clearTimeout(delayDebounce);
  }, [searchTitle, searchLocation, searchType]);

  // ─── Job Post Handlers ──────────────────────────────────
  const handleOpenPostModal = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setFormData({ 
      title: "", 
      description: "", 
      location: "", 
      type: "Full-time", 
      company_id: "",
      min_salary: "",
      max_salary: "",
      currency: "USD",
      image: ""
    });
    setErrorPost("");
    setSuccessPost(false);
    setIsPostModalOpen(true);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.company_id) return;
    setLoadingPost(true);
    setErrorPost("");

    try {
      const res = await fetch("http://localhost:8000/add_jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          type: formData.type,
          company_id: parseInt(formData.company_id),
          posted_by: user.id,
          min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
          max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
          currency: formData.currency,
          image: formData.image || null
        })
      });
      const data = await res.json();
      
      if (data.status === "success" || res.ok) {
        setSuccessPost(true);
        fetchJobs(); // Refresh grid
        setTimeout(() => {
          setIsPostModalOpen(false);
          setSuccessPost(false);
        }, 1500);
      } else {
        setErrorPost(data.error || data.detail || "Failed to post job");
      }
    } catch (err) {
      setErrorPost("A network error occurred.");
    } finally {
      setLoadingPost(false);
    }
  };

  // ─── Filter Display Logic ───────────────────────────────
  const filteredJobs = useMemo(() => {
     // If companyIdParam is present, filter further
     if (!companyIdParam) return jobs;
     return jobs.filter(j => String(j.company_id) === String(companyIdParam));
  }, [jobs, companyIdParam]);

  const companyNameFilter = companyIdParam 
    ? (companies.find(c => String(c.id) === String(companyIdParam))?.name) 
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container py-12 px-4 mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Browse <span className="text-primary italic">Jobs</span></h1>
            <p className="text-slate-500 font-medium text-lg">Find the career opportunity that defines your next chapter.</p>
          </div>
          <button 
            onClick={handleOpenPostModal}
            className="flex items-center gap-2 bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-900/20"
          >
            <Plus className="w-5 h-5" /> Post a Job
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Job title, keywords..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700"
              value={searchTitle}
              onChange={e => setSearchTitle(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="City, region..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700"
              value={searchLocation}
              onChange={e => setSearchLocation(e.target.value)}
            />
          </div>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select 
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 appearance-none"
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div className="flex items-center px-6">
            <span className="text-slate-400 font-bold text-sm">Showing {filteredJobs.length} Results</span>
          </div>
        </div>

        {companyNameFilter && (
          <div className="mb-8 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Building2 className="text-primary w-6 h-6" />
               <span className="text-lg text-slate-700 font-bold">Showing jobs at <span className="text-primary underline decoration-2">{companyNameFilter}</span></span>
             </div>
             <button onClick={() => router.push('/jobs')} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition underline underline-offset-4">Clear filter</button>
          </div>
        )}

        {/* Results Section */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-200">
             <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <h3 className="text-2xl font-black text-slate-900 mb-2">No matching jobs</h3>
             <p className="text-slate-500 font-medium">Try adjusting your filters or keyword.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job: any, idx: number) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company_name}
              company_id={job.company_id}
              logo={job.company_logo || ""}
              location={job.location}
              salary={job.min_salary && job.max_salary
                ? `${job.currency || "$"} ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}`
                : "Salary Disclosed"}
              type={job.type}
              posted={job.created_at || new Date().toISOString()}
              rating={4.8}
              reviews={0}
              delay={idx * 0.05}
            />
          ))}
        </div>
      </main>

      {/* Post a Job Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 md:p-10 rounded-[3rem] shadow-2xl relative my-auto"
            >
               <button 
                onClick={() => !loadingPost && !successPost && setIsPostModalOpen(false)}
                className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                disabled={loadingPost || successPost}
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-black text-slate-900 mb-2">Post a New Job</h2>
              <p className="text-slate-500 font-medium mb-8">Reach thousands of talented candidates instantly.</p>

              {errorPost && (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl mb-8 text-sm font-bold border border-red-100 text-center animate-shake">
                  {errorPost}
                </div>
              )}

              {successPost ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 flex flex-col items-center justify-center py-16 rounded-[2.5rem] border border-green-100 my-8 shadow-inner"
                >
                  <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
                  <p className="text-green-700 font-black text-2xl mb-2 tracking-tight">Job Posted Successfully!</p>
                  <p className="text-green-600/80 font-bold text-center">We'll start matching candidates right away.</p>
                </motion.div>
              ) : (
                <form onSubmit={handlePostJob} className="space-y-6">
                  {/* Job Image Upload */}
                  <ImageUpload 
                    label="Job Banner / Image"
                    value={formData.image}
                    onChange={(base64) => setFormData({ ...formData, image: base64 })}
                    className="mb-8"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Job Title *</label>
                        <input
                          required
                          placeholder="e.g. Senior Frontend Developer"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white focus:ring-4 focus:ring-primary/10"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Location *</label>
                        <input
                          required
                          placeholder="e.g. Remote, NYC"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white"
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Employment Type *</label>
                        <select
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white appearance-none"
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Min Salary (Annual)</label>
                        <input
                          type="number"
                          placeholder="e.g. 80000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white"
                          value={formData.min_salary}
                          onChange={e => setFormData({ ...formData, min_salary: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Max Salary (Annual)</label>
                        <input
                          type="number"
                          placeholder="e.g. 120000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white"
                          value={formData.max_salary}
                          onChange={e => setFormData({ ...formData, max_salary: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Company *</label>
                        <select
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white appearance-none"
                          value={formData.company_id}
                          onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                        >
                          <option value="">Select your company</option>
                          {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                         <p className="text-xs text-slate-400 mt-2 font-bold px-1 italic">Don't see your company? <a href="/companies" className="text-primary underline">Join as a company first</a></p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-black text-slate-700 mb-3 block uppercase tracking-widest">Full Description *</label>
                        <textarea
                          required
                          placeholder="What makes this role amazing? What are the key responsibilities?"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:border-primary outline-none transition-all focus:bg-white resize-none min-h-[160px]"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                   </div>

                   <button
                    type="submit"
                    disabled={loadingPost}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-2xl shadow-slate-900/30 text-lg uppercase tracking-tighter"
                  >
                    {loadingPost ? (
                       <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Blast this posting live"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<p className="text-center py-32 text-slate-400 font-black animate-pulse">Initializing JobSpace...</p>}>
        <JobsList />
      </Suspense>
      <Footer />
    </div>
  );
}
