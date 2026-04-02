"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin, Briefcase, Clock, DollarSign,
  Share2, Bookmark, MessageSquare, Send, X, CheckCircle2,
  Trash2, Edit, Save, Building2, Globe, Mail, FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "@/components/JobCard";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Job State
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [relatedJobs, setRelatedJobs] = useState<any[]>([]);

  // User State
  const [user, setUser] = useState<any>(null);

  // Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyCoverLetter, setApplyCoverLetter] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // Edit Job States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "",
    company_id: "",
    min_salary: "",
    max_salary: "",
    currency: "",
    image: ""
  });

  // Delete Job States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Salary Modal States
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ id: "", min_salary: "", max_salary: "", currency: "USD" });
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [salarySuccess, setSalarySuccess] = useState(false);
  const [isSalaryEditing, setIsSalaryEditing] = useState(false);
  const [isSalaryDeleteConfirmOpen, setIsSalaryDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch Job
    fetch(`http://localhost:8000/get_specific_jobs/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJob(data.data.job);
        } else {
          setError("Job not found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load job");
        setLoading(false);
      });

    // 2. Fetch User from Local Storage
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try { 
        const parsed = JSON.parse(storedUser);
        if (parsed && (parsed.id || parsed.user_id)) {
          setUser(parsed);
        }
      } catch (e) {}
    }

    // 3. Fetch Companies (for Edit Dropdown)
    fetch("http://localhost:8000/get_list_companies")
      .then(res => res.json())
      .then(data => setCompanies(data.companies || []))
      .catch(() => {});

    // 4. Fetch Related Jobs
    fetch("http://localhost:8000/get_all_jobs")
      .then(res => res.json())
      .then(data => {
        const filtered = (data.data.jobs || [])
          .filter((j: any) => String(j.id) !== String(params.id))
          .slice(0, 4);
        setRelatedJobs(filtered);
      })
      .catch(() => {});
  }, [params.id]);

  // ─── Application Handlers ──────────────────────────────
  const handleApplyClick = () => {
    if (!user) { router.push("/login"); return; }
    setApplyCoverLetter("");
    setApplyError("");
    setApplySuccess(false);
    setIsApplyModalOpen(true);
  };

  // ─── Edit Job Handlers ─────────────────────────────────
  const handleEditClick = () => {
    setEditFormData({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      type: job.type || "Full-time",
      company_id: String(job.company_id || ""),
      min_salary: job.min_salary ? String(job.min_salary) : "",
      max_salary: job.max_salary ? String(job.max_salary) : "",
      currency: job.currency || "USD",
      image: job.image || ""
    });
    setEditError("");
    setEditSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      const res = await fetch(`http://localhost:8000/update_jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          company_id: parseInt(editFormData.company_id),
          posted_by: user.id,
          min_salary: editFormData.min_salary ? parseInt(editFormData.min_salary) : null,
          max_salary: editFormData.max_salary ? parseInt(editFormData.max_salary) : null,
          currency: editFormData.currency,
          image: editFormData.image || null
        })
      });
      const data = await res.json();
      if (data.status === "success" || res.ok) {
        setEditSuccess(true);
        // Refetch job data to ensure JOINs (salary, company) are fresh
        fetch(`http://localhost:8000/get_specific_jobs/${job.id}`)
          .then(res => res.json())
          .then(data => { if (data.success) setJob(data.data.job); });

        setTimeout(() => { setIsEditModalOpen(false); setEditSuccess(false); }, 1500);
      } else {
        setEditError(data.error || data.detail || "Failed to update job");
      }
    } catch (err) { setEditError("A network error occurred."); }
    finally { setEditLoading(false); }
  };

  // ─── Delete Job Handlers ───────────────────────────────
  const handleDeleteJob = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/delete_jobs/${job.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success" || res.ok) {
        router.push("/jobs");
      } else {
        alert("Failed to delete job: " + (data.error || data.detail));
        setDeleteLoading(false);
        setIsDeleteConfirmOpen(false);
      }
    } catch (err) {
      alert("A network error occurred.");
      setDeleteLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSalaryEditClick = () => {
    if (!job) return;
    setSalaryForm({
      id: String(job.salary_id || ""),
      min_salary: String(job.min_salary || ""),
      max_salary: String(job.max_salary || ""),
      currency: job.currency || "USD"
    });
    setIsSalaryEditing(true);
    setSalaryError("");
    setSalarySuccess(false);
    setIsSalaryModalOpen(true);
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSalaryLoading(true);
    setSalaryError("");
    try {
      const endpoint = isSalaryEditing 
        ? `http://localhost:8000/update_salary/${salaryForm.id}`
        : "http://localhost:8000/add_salary";
      const method = isSalaryEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_salary: parseInt(salaryForm.min_salary),
          max_salary: parseInt(salaryForm.max_salary),
          currency: salaryForm.currency,
          location: job.location,
          job_id: job.id
        })
      });
      const data = await res.json();
      if (data.status === "success" || data.id || res.ok) {
        setSalarySuccess(true);
        // Refetch job data to show new salary
        fetch(`http://localhost:8000/get_specific_jobs/${job.id}`)
          .then(res => res.json())
          .then(data => { if (data.success) setJob(data.data.job); });
        setTimeout(() => { 
          setIsSalaryModalOpen(false); 
          setSalarySuccess(false); 
          setIsSalaryEditing(false);
        }, 1500);
      } else {
        setSalaryError(data.error || data.detail || "Failed to save salary");
      }
    } catch (err) { setSalaryError("A network error occurred."); }
    finally { setSalaryLoading(false); }
  };

  const handleSalaryDelete = async () => {
    if (!job || !job.salary_id) return;
    setSalaryLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/delete_salary/${job.salary_id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success" || res.ok) {
        // Refetch job data to clear salary info
        fetch(`http://localhost:8000/get_specific_jobs/${job.id}`)
          .then(res => res.json())
          .then(data => { if (data.success) setJob(data.data.job); });
        setIsSalaryDeleteConfirmOpen(false);
      } else {
        alert("Failed to delete salary: " + (data.error || data.detail));
      }
    } catch (err) { alert("A network error occurred."); }
    finally { setSalaryLoading(false); }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !job) return;
    setApplyLoading(true);
    setApplyError("");
    try {
      const res = await fetch("http://localhost:8000/add_applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          user_id: parseInt(user.id),
          cover_letter: applyCoverLetter
        })
      });
      const data = await res.json();
      if (data.status === "success" || res.ok) {
        setApplySuccess(true);
        setTimeout(() => { setIsApplyModalOpen(false); setApplySuccess(false); setApplyCoverLetter(""); }, 2000);
      } else {
        setApplyError(data.detail || data.error || "Failed to submit application");
      }
    } catch (err) { setApplyError("A network error occurred."); }
    finally { setApplyLoading(false); }
  };

  const userId = user?.id ?? user?.user_id;
  const isOwner = !!(user && job && userId && job.posted_by && String(userId) === String(job.posted_by));
  const isSeeker = user && user.role === 'seeker';

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 px-4 mx-auto flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
      </main>
      <Footer />
    </div>
  );

  if (error || !job) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 px-4 mx-auto flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl max-w-lg w-full">
           <h2 className="text-2xl font-bold mb-2">Error Loading Job</h2>
           <p className="font-medium">{error || "Job not found"}</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Navbar />
      <main className="container py-12 px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {job.image && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-64 md:h-80 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-sm relative group"
              >
                <img src={job.image} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            )}
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100 shrink-0">
                    {job.company_logo && job.company_logo !== "string" ? (
                      <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-3xl font-extrabold text-primary">
                        {job.company_name?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2 leading-tight">{job.title}</h1>
                    <p className="text-primary font-bold text-lg">{job.company_name || "Company"}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 shrink-0">
                  {isOwner && (
                    <>
                      <button 
                        onClick={handleEditClick}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                    <Share2 className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  { icon: <MapPin />, label: "Location", value: job.location },
                  { icon: <Briefcase />, label: "Job Type", value: job.type },
                  { icon: <DollarSign />, label: "Salary", value: job.min_salary && job.max_salary ? `${job.currency || "$"} ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}` : "Not Disclosed" },
                  { icon: <Clock />, label: "Posted", value: new Date(job.created_at || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-transform hover:-translate-y-1">
                    <div className="text-primary w-5 h-5 mb-2">{item.icon}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                    <div className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.value}
                      {item.label === "Salary" && isOwner && (
                        <>
                          <button 
                            onClick={() => {
                              if (job.salary_id) handleSalaryEditClick();
                              else {
                                 setIsSalaryEditing(false);
                                 setSalaryForm({ id: "", min_salary: "", max_salary: "", currency: "USD" });
                                 setIsSalaryModalOpen(true);
                              }
                            }}
                            className="ml-2 text-primary text-[10px] hover:underline"
                          >
                            ({job.salary_id ? "Edit" : "Add"})
                          </button>
                          {job.salary_id && (
                            <button 
                              onClick={() => setIsSalaryDeleteConfirmOpen(true)}
                              className="ml-1 text-red-500 text-[10px] hover:underline"
                            >
                              (Delete)
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 relative z-10">
                <h3 className="text-2xl font-bold">Job Description</h3>
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <button 
                  onClick={handleApplyClick}
                  className="w-full md:w-auto bg-primary text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/30"
                  style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                >
                  Apply for Job
                </button>
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   Verified Posting
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-10">
                <MessageSquare className="text-primary" /> Reviews & Comments
              </h3>
              <div className="relative">
                <textarea
                  placeholder="Share your thoughts about this job..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[120px] outline-none focus:border-primary focus:bg-white transition-colors resize-none mb-4"
                />
                <button className="btn-primary flex items-center gap-2 absolute bottom-8 right-4 px-6">
                  <Send className="w-4 h-4" /> Post Comment
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl">
              <h4 className="text-xl font-bold mb-6 relative z-10">About Company</h4>
              <div className="flex gap-4 mb-8 relative z-10">
                <div className="w-16 h-16 bg-white overflow-hidden rounded-xl p-2 shrink-0 flex items-center justify-center">
                  {job.company_logo && job.company_logo !== "string" ? (
                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl font-extrabold text-primary">
                      {job.company_name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-lg">{job.company_name || "Company"}</div>
                  <div className="text-slate-400 text-sm italic">{job.company_industry || "Industry"}</div>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-8 relative z-10">
                {job.company_description || "No description available."}
              </p>
              <button 
                onClick={() => router.push(`/companies/${job.company_id}`)}
                className="w-full py-3.5 bg-white/10 rounded-xl border border-white/10 font-bold hover:bg-white/20 transition-all text-sm relative z-10"
              >
                View Company Profile
              </button>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/30 rounded-full blur-[60px]" />
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
               <h4 className="text-xl font-bold mb-8">Work Culture</h4>
               <div className="space-y-6">
                  {["Flexible Hours", "Remote Options", "Health Benefits"].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                       <div className="w-2 h-2 bg-primary rounded-full" />
                       <span className="font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
        {/* Related Jobs Section */}
        {relatedJobs.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-slate-900">Similar Opportunities</h2>
              <Link href="/jobs" className="text-primary font-bold hover:underline">Explore All Jobs</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedJobs.map((rj, idx) => (
                <JobCard key={rj.id} {...rj} company={rj.company_name} company_id={rj.company_id} salary={rj.min_salary && rj.max_salary ? `${rj.currency || "$"} ${rj.min_salary.toLocaleString()} - ${rj.max_salary.toLocaleString()}` : "Not Disclosed"} posted={rj.created_at} delay={idx * 0.1} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* Edit Job Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative my-auto"
            >
               <button 
                onClick={() => !editLoading && setIsEditModalOpen(false)}
                className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-2">Edit Job Posting</h2>
              <p className="text-slate-500 font-medium mb-8">Update the details for this position.</p>

              {editError && (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl mb-8 text-sm font-bold border border-red-100">
                  {editError}
                </div>
              )}

              {editSuccess ? (
                <div className="bg-green-50 flex flex-col items-center justify-center py-10 rounded-3xl border border-green-100">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <p className="text-green-700 font-black text-xl">Job Updated!</p>
                </div>
              ) : (
                <form onSubmit={handleUpdateJob} className="space-y-6">
                  {/* Job Image Upload */}
                  <ImageUpload 
                    label="Job Banner / Image"
                    value={editFormData.image}
                    onChange={(base64) => setEditFormData({ ...editFormData, image: base64 })}
                    className="mb-8"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase">Title</label>
                        <input
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                          value={editFormData.title}
                          onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase">Location</label>
                        <input
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                          value={editFormData.location}
                          onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase">Job Type</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none appearance-none"
                          value={editFormData.type}
                          onChange={e => setEditFormData({ ...editFormData, type: e.target.value })}
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase">Min Salary</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                          value={editFormData.min_salary}
                          onChange={e => setEditFormData({ ...editFormData, min_salary: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase">Max Salary</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none"
                          value={editFormData.max_salary}
                          onChange={e => setEditFormData({ ...editFormData, max_salary: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase">Description</label>
                        <textarea
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none min-h-[140px]"
                          value={editFormData.description}
                          onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                        />
                      </div>
                   </div>
                   <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:opacity-90 transition shadow-xl"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full p-8 rounded-3xl shadow-2xl text-center"
            >
              <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Job?</h2>
              <p className="text-slate-500 font-medium mb-8">This action is permanent and cannot be undone.</p>
              <div className="flex gap-4">
                 <button 
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteJob}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Salary Modal */}
      <AnimatePresence>
        {isSalaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl relative"
            >
              <button onClick={() => setIsSalaryModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X /></button>
              <h2 className="text-2xl font-black mb-2">{isSalaryEditing ? "Update Salary Info" : "Add Salary Info"}</h2>
              <p className="text-slate-500 mb-8 font-medium">{isSalaryEditing ? "Modify existing financial data." : "Contribute financial data for this position."}</p>

              {salaryError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold">{salaryError}</div>}
              {salarySuccess ? (
                <div className="bg-green-50 text-green-700 p-10 rounded-3xl text-center border border-green-100 italic font-bold">
                  Salary {isSalaryEditing ? "Updated" : "Added"} Successfully!
                </div>
              ) : (
                <form onSubmit={handleSalarySubmit} className="space-y-6 text-slate-400">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black uppercase mb-2 block">Min Salary</label>
                        <input 
                          type="number" required
                          className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-700" 
                          value={salaryForm.min_salary}
                          onChange={e => setSalaryForm({...salaryForm, min_salary: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black uppercase mb-2 block">Max Salary</label>
                        <input 
                          type="number" required
                          className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-700" 
                          value={salaryForm.max_salary}
                          onChange={e => setSalaryForm({...salaryForm, max_salary: e.target.value})}
                        />
                      </div>
                   </div>
                   <div>
                      <label className="text-xs font-black uppercase mb-2 block">Currency</label>
                      <input 
                        className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-700" 
                        value={salaryForm.currency}
                        onChange={e => setSalaryForm({...salaryForm, currency: e.target.value})}
                      />
                   </div>
                   <button 
                    type="submit" disabled={salaryLoading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:opacity-90 transition shadow-xl"
                   >
                    {salaryLoading ? "Saving..." : (isSalaryEditing ? "Update Salary Info" : "Save Salary Info")}
                   </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Salary Confirmation Modal */}
      <AnimatePresence>
        {isSalaryDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-sm w-full p-8 rounded-[2rem] shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black mb-2">Delete Salary Data?</h2>
              <p className="text-slate-500 mb-8 font-medium">This will remove the financial details from this job listing. This action cannot be undone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsSalaryDeleteConfirmOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSalaryDelete}
                  disabled={salaryLoading}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {salaryLoading ? "Deleting..." : "Delete Data"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-2xl w-full p-10 rounded-[2.5rem] shadow-2xl relative"
            >
              <button 
                onClick={() => !applyLoading && setIsApplyModalOpen(false)} 
                className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black mb-2">Apply for {job.title}</h2>
                <p className="text-slate-500 font-medium">Submit your interest to <span className="text-slate-900 font-bold">{job.company_name || "this company"}</span>.</p>
              </div>

              {applyError && (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-8 border border-red-100 font-bold italic text-center text-sm">
                  {applyError}
                </div>
              )}

              {applySuccess ? (
                <div className="py-16 text-center space-y-6">
                   <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-green-200/50">
                      <CheckCircle2 className="w-10 h-10" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-slate-900">Application Sent!</h3>
                     <p className="text-slate-500 font-medium">Your request has been delivered successfully.</p>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest block px-1">Cover Letter / Note</label>
                    <textarea 
                      required
                      placeholder="High-level overview of your experience and why you are a great fit..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 h-48 focus:border-primary outline-none focus:bg-white transition-all font-medium text-slate-700 shadow-inner"
                      value={applyCoverLetter}
                      onChange={e => setApplyCoverLetter(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={applyLoading}
                      className="flex-1 py-5 bg-primary text-white rounded-2xl font-black hover:opacity-90 transition disabled:opacity-50 shadow-xl shadow-primary/20"
                    >
                      {applyLoading ? "Sending application..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
