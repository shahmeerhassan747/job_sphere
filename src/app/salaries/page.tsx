"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DollarSign, TrendingUp, Briefcase, ChevronRight, BarChart3, Plus, Trash2, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const highSalariesStatic = [
  { job_title: "Staff Software Engineer", company_name: "TechFlow", min_salary: 180000, max_salary: 240000, currency: "$", change: "+12%" },
  { job_title: "Senior Data Scientist", company_name: "InnoCorp", min_salary: 160000, max_salary: 210000, currency: "$", change: "+15%" },
  { job_title: "UX Director", company_name: "Creative Peak", min_salary: 150000, max_salary: 200000, currency: "$", change: "+8%" },
  { job_title: "Product Manager", company_name: "Peak Labs", min_salary: 140000, max_salary: 190000, currency: "$", change: "+10%" },
];

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Add Salary States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const [addFormData, setAddFormData] = useState({
    id: "", // For Edit
    min_salary: "",
    max_salary: "",
    currency: "$",
    location: "",
    job_id: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 1. Fetch Salaries
    fetchSalaries();

    // 2. Fetch User
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // 3. Fetch Jobs for dropdown
    fetch("http://localhost:8000/get_all_jobs")
      .then(res => res.json())
      .then(data => setJobs(data.data?.jobs || []))
      .catch(() => {});
  }, []);

  const fetchSalaries = () => {
    setLoading(true);
    fetch("http://localhost:8000/get_all_salaries")
      .then(res => res.json())
      .then(data => {
        // data.data.salaries is the new standardized format
        // data.data is the old raw list format (if middleware wrapped a list)
        // data is the fallback
        const items = data.data?.salaries || data.data || (Array.isArray(data) ? data : []);
        setSalaries(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleEditSalaryClick = async (id: number) => {
    try {
      setAddLoading(true);
      const res = await fetch(`http://localhost:8000/get_specific_salary/${id}`);
      const data = await res.json();
      
      if (data.success && data.data?.salary) {
        const s = data.data.salary;
        setAddFormData({
          id: s.id,
          min_salary: String(s.min_salary),
          max_salary: String(s.max_salary),
          currency: s.currency || "$",
          location: s.location || "",
          job_id: String(s.job_id || "") // Note: Ensure job_id is returned by the API if possible, or use fallback
        });
        setIsEditing(true);
        setIsAddModalOpen(true);
      }
    } catch (err) {
      alert("Failed to fetch fresh salary data.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteSalary = async (id: number) => {
    if (!confirm("Are you sure you want to delete this salary record?")) return;
    try {
      const res = await fetch(`http://localhost:8000/delete_salary/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSalaries(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) { alert("Failed to delete salary"); }
  };

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      const endpoint = isEditing 
        ? `http://localhost:8000/update_salary/${addFormData.id}`
        : "http://localhost:8000/add_salary";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_salary: parseInt(addFormData.min_salary),
          max_salary: parseInt(addFormData.max_salary),
          currency: addFormData.currency,
          location: addFormData.location,
          job_id: parseInt(addFormData.job_id)
        })
      });
      const data = await res.json();
      if (res.ok || data.status === "success" || data.id) {
        setAddSuccess(true);
        fetchSalaries();
        setTimeout(() => { 
          setIsAddModalOpen(false); 
          setAddSuccess(false); 
          setIsEditing(false);
        }, 1500);
      } else {
        setAddError(data.detail || data.error || "Failed to save salary");
      }
    } catch (err) { setAddError("Network error occurred"); }
    finally { setAddLoading(false); }
  };

  const filteredSalaries = salaries.filter(s => 
    s.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 4);

  const displaySalaries = filteredSalaries.length > 0 ? filteredSalaries : highSalariesStatic;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main>
        {/* Salary Hero */}
        <section className="bg-white border-b py-24">
          <div className="container overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-16 mx-auto">
              <div className="flex-1 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold"
                >
                  <TrendingUp className="w-4 h-4" /> Market Trends 2026
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-6xl font-extrabold leading-tight"
                >
                  Know Your Value in the <span className="text-primary italic">Market</span>
                </motion.h1>
                <p className="text-slate-500 text-lg max-w-xl">
                  Get personalized salary estimates based on your experience, location, and skills with our real-time data explorer.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:ring-2 ring-primary/20 transition-all">
                      <Briefcase className="text-slate-400 w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Filter by Job Title..." 
                        className="bg-transparent border-none outline-none w-full font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <button className="btn-primary whitespace-nowrap">Explore Salaries</button>
                    {user?.role === 'employer' && (
                     <button 
                       onClick={() => {
                         setIsEditing(false);
                         setAddFormData({ id: "", min_salary: "", max_salary: "", currency: "$", location: "", job_id: "" });
                         setIsAddModalOpen(true);
                       }}
                       className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition flex items-center gap-2"
                     >
                       <Plus className="w-4 h-4" /> Add Salary
                     </button>
                   )}
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-1 bg-slate-900 rounded-[3rem] p-10 md:p-12 text-white relative w-full"
              >
                 <div className="absolute top-12 right-12 text-primary font-bold text-6xl opacity-10 font-serif">$</div>
                 <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                   <BarChart3 className="text-primary" /> {searchTerm ? "Search Results" : "Top Paid Roles"}
                 </h3>
                 <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      displaySalaries.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all border border-transparent hover:border-white/10 group/item relative">
                           <div className="flex-1">
                              <div className="font-bold text-lg">{s.job_title}</div>
                              <div className="text-sm text-slate-400">{s.company_name}</div>
                           </div>
                           <div className="text-right flex items-center gap-4">
                              <div>
                                <div className="text-primary font-bold text-lg">
                                  {s.currency || "$"} {(s.min_salary/1000).toFixed(0)}k - {(s.max_salary/1000).toFixed(0)}k
                                </div>
                                <div className="text-xs text-green-400 font-bold uppercase tracking-widest">{s.change || "+10%"} YoY</div>
                              </div>
                              {user?.role === 'employer' && s.id && (
                                <>
                                <button 
                                 onClick={(e) => { e.stopPropagation(); handleEditSalaryClick(s); }}
                                 className="p-2 bg-blue-500/10 text-blue-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-blue-500/20"
                               >
                                 <Plus className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDeleteSalary(s.id); }}
                                 className="p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-500/20"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </>
                           )}
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="container py-24">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-12 md:p-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="col-span-1 md:col-span-1 space-y-6">
                    <h2 className="text-3xl font-bold">Salary Calculator</h2>
                    <p className="text-slate-500">Enter your details to see how much you could be making.</p>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Location</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary">
                             <option>New York, NY</option>
                             <option>San Francisco, CA</option>
                             <option>Remote</option>
                             <option>Austin, TX</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Experience</label>
                          <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary">
                             <option>0 - 2 Years</option>
                             <option>3 - 5 Years</option>
                             <option>5 - 10 Years</option>
                             <option>10+ Years</option>
                          </select>
                       </div>
                    </div>
                 </div>
                 
                 <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-center space-y-8 bg-slate-50 rounded-3xl p-12">
                    <div className="text-slate-500 font-medium">Estimated Annual Salary</div>
                    <div className="text-6xl md:text-8xl font-black text-slate-900">$145,000</div>
                    <div className="flex gap-4">
                       <div className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-bold">Top 10% of Market</div>
                       <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-bold">+18% vs Last Year</div>
                    </div>
                    <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
                      View full report <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />

      {/* Add Salary Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative my-auto"
            >
              <button 
                onClick={() => !addLoading && setIsAddModalOpen(false)}
                className="absolute top-8 right-8 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">{isEditing ? "Update Salary Data" : "Contribute Salary Data"}</h2>
              <p className="text-slate-500 font-medium mb-10 text-center">{isEditing ? "Modify existing market information." : "Help build the most accurate market database."}</p>

              {addError && (
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl mb-8 text-sm font-bold border border-red-100 text-center">
                  {addError}
                </div>
              )}

              {addSuccess ? (
                <div className="bg-green-50 flex flex-col items-center justify-center py-12 rounded-3xl border border-green-100">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <p className="text-green-700 font-black text-2xl">{isEditing ? "Data Updated!" : "Data Added!"}</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSalary} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest">Select Job Position</label>
                        <select
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none focus:bg-white appearance-none transition-all"
                          value={addFormData.job_id}
                          onChange={e => setAddFormData({ ...addFormData, job_id: e.target.value })}
                        >
                          <option value="">Choose a job listing...</option>
                          {jobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title} at {j.company_name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest">Min Salary (Annual)</label>
                        <input
                          required
                          type="number"
                          placeholder="e.g. 120000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none focus:bg-white transition-all shadow-inner"
                          value={addFormData.min_salary}
                          onChange={e => setAddFormData({ ...addFormData, min_salary: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest">Max Salary (Annual)</label>
                        <input
                          required
                          type="number"
                          placeholder="e.g. 180000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none focus:bg-white transition-all shadow-inner"
                          value={addFormData.max_salary}
                          onChange={e => setAddFormData({ ...addFormData, max_salary: e.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-black text-slate-700 mb-2 block uppercase tracking-widest">Location</label>
                        <input
                          required
                          placeholder="e.g. San Francisco (Remote)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:border-primary outline-none focus:bg-white transition-all shadow-inner"
                          value={addFormData.location}
                          onChange={e => setAddFormData({ ...addFormData, location: e.target.value })}
                        />
                      </div>
                   </div>
                   <button
                    type="submit"
                    disabled={addLoading}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
                  >
                    {addLoading ? "Saving..." : (isEditing ? "Update Salary Info" : "Submit Salary Info")}
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
