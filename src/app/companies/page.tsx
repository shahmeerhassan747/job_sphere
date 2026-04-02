"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, Building2, MapPin, ArrowRight, Plus, X, Globe, Mail, Briefcase, FileText, CheckCircle2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Modal & User States
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState("");
  const [successSubmit, setSuccessSubmit] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    industry: "",
    location: "",
    website: "",
    description: "",
    logo: ""
  });

  useEffect(() => {
    // 1. Fetch Companies
    fetch("http://localhost:8000/get_list_companies")
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Fetch User for Modal Auth
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user data");
      }
    }
  }, []);

  const handlePostCompanyClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setFormData({ name: "", email: "", industry: "", location: "", website: "", description: "", logo: "" });
    setErrorSubmit("");
    setSuccessSubmit(false);
    setIsModalOpen(true);
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoadingSubmit(true);
    setErrorSubmit("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        logo: formData.logo || "NULL",
        industry: formData.industry,
        location: formData.location,
        website: formData.website,
        description: formData.description
      };
      
      const res = await fetch("http://localhost:8000/add_companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success || data.status === "success" || res.ok) {
        setSuccessSubmit(true);
        // Prepend to list directly on UI for real-time magic
        const newCompany = {
          id: data.data?.company_id || Date.now(),
          ...payload,
          created_at: new Date().toISOString()
        };
        setCompanies(prev => [newCompany, ...prev]);
        
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessSubmit(false);
        }, 2000);
      } else {
        setErrorSubmit(data.error || data.detail || "Failed to create company");
      }
    } catch (err) {
      setErrorSubmit("A network error occurred while submitting.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const query = searchQuery.toLowerCase();
      return (
        company.name?.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query) ||
        company.location?.toLowerCase().includes(query)
      );
    });
  }, [companies, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white border-b py-20 relative overflow-hidden">
          <div className="container text-center relative z-10 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-slate-900"
            >
              Explore Top <span className="text-primary">Companies</span>
            </motion.h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium mb-10">
              Read reviews, compare salaries, and find the company that perfectly fits your career goals.
            </p>
          </div>
          
          {/* Decorative background gradients */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        </section>

        <section className="container py-16 px-4 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Featured Employers</h2>
              <p className="text-slate-500 font-medium">Discover organizations hiring right now.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={handlePostCompanyClick}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
              >
                <Plus className="w-5 h-5" /> Post a Company
              </button>
            </div>
          </div>

          <div className="mb-12 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
               type="text"
               placeholder="Search by company name, industry, or location..."
               className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && filteredCompanies.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No companies found</h3>
              <p className="text-slate-500">Try adjusting your search or be the first to post!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCompanies.map((company: any, idx: number) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all group flex flex-col items-start h-full"
              >
                <div className="flex flex-col sm:flex-row gap-6 w-full mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                    {company.logo && company.logo !== "string" && company.logo !== "NULL" ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-3xl font-extrabold text-primary">
                        {company.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-primary font-bold text-sm bg-primary/10 inline-block px-3 py-1 rounded-full">{company.industry}</p>
                      </div>
                      <div className="flex justify-start sm:justify-end items-center gap-1 bg-yellow-400/10 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-bold shrink-0 self-start">
                        <Star className="w-4 h-4 fill-yellow-600" /> 4.5
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 font-medium mb-6 w-full">
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> <span className="truncate">{company.location}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" /> <span className="truncate">{company.website}</span>
                  </div>
                </div>

                <p className="text-slate-500 leading-relaxed line-clamp-2 mb-8 flex-1">
                  {company.description}
                </p>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between w-full mt-auto">
                  <div className="text-slate-400 text-sm font-medium">
                    Added {new Date(company.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <button
                    className="text-primary font-bold hover:underline flex items-center gap-2 group/btn"
                    onClick={() => router.push(`/jobs?company_id=${company.id}`)}
                  >
                    View Jobs <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 text-white py-24 rounded-[3rem] mx-4 mb-24 overflow-hidden relative max-w-7xl md:mx-auto">
          <div className="container relative z-10 px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold mb-4">Browse by Industry</h2>
              <p className="text-slate-400 text-lg">Discover companies in the sectors you care about most.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {["Technology", "Finance", "Healthcare", "Education", "Marketing", "Retail", "Energy", "Entertainment"].map(
                (industry, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
                    className="p-8 border border-white/10 rounded-2xl text-center cursor-pointer transition-colors bg-white/5"
                  >
                    <Building2 className="w-8 h-8 mx-auto mb-4 text-primary" />
                    <h4 className="font-bold text-lg">{industry}</h4>
                  </motion.div>
                )
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </section>
      </main>
      <Footer />

      {/* Create Company Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative my-auto"
            >
              <button 
                onClick={() => !loadingSubmit && !successSubmit && setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400 disabled:opacity-50"
                disabled={loadingSubmit || successSubmit}
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create a Company</h2>
              <p className="text-slate-500 font-medium mb-8">Fill in the details to register your organization.</p>

              {errorSubmit && (
                <div className="bg-red-50 text-red-600 px-4 py-4 rounded-xl mb-8 text-sm font-bold border border-red-100 text-center">
                  {errorSubmit}
                </div>
              )}

              {successSubmit ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 flex flex-col items-center justify-center py-16 rounded-3xl border border-green-100 my-8"
                >
                  <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
                  <p className="text-green-700 font-extrabold text-2xl mb-2">Company Created!</p>
                  <p className="text-green-600/80 font-medium text-center max-w-xs">Your organization has been successfully registered on the platform.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitCompany} className="space-y-6">
                  {/* Photo Upload Section */}
                  <ImageUpload 
                    label="Company Logo"
                    value={formData.logo}
                    onChange={(base64) => setFormData({ ...formData, logo: base64 })}
                    className="mb-8"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Company Name *</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          placeholder="Acme Corp"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={loadingSubmit}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Contact Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="email"
                          placeholder="hello@acmecorp.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={loadingSubmit}
                        />
                      </div>
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Industry *</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          placeholder="Technology, Finance, etc."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          disabled={loadingSubmit}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          placeholder="New York, NY"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          disabled={loadingSubmit}
                        />
                      </div>
                    </div>

                    {/* Website */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Website URL *</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="url"
                          placeholder="https://acmecorp.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          disabled={loadingSubmit}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Company Description *</label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-[1.1rem] w-5 h-5 text-slate-400" />
                        <textarea
                          required
                          placeholder="Tell us about your company mission, culture, and goals..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none min-h-[120px]"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          disabled={loadingSubmit}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={loadingSubmit}
                      className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingSubmit}
                      className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                      {loadingSubmit ? (
                         <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Registering...
                         </>
                      ) : (
                        "Create Company"
                      )}
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
