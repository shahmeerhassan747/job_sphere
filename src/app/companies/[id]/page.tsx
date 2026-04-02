"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { 
  Building2, MapPin, Globe, Mail, 
  Users, Briefcase, Star, Info,
  ArrowLeft
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompanyProfilePage({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch Company Details
    fetch(`http://localhost:8000/get_specific_companies/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCompany(data.data.company);
        } else {
          setError("Company not found");
        }
      })
      .catch(() => setError("Failed to load company details"));

    // Fetch Jobs by this Company
    // We'll use get_all_jobs and filter on the frontend for now, 
    // or assume the backend supports a filter if we added it specifically.
    // Based on previous work, we might need a specific endpoint or just filter get_all_jobs.
    fetch("http://localhost:8000/get_all_jobs")
      .then(res => res.json())
      .then(data => {
        const filtered = (data.data.jobs || []).filter(
          (j: any) => String(j.company_id) === String(params.id)
        );
        setJobs(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container py-32 flex justify-center"><div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div></div>
      <Footer />
    </div>
  );

  if (error || !company) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container py-32 text-center text-red-500 font-bold">{error || "Company not found"}</div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header Banner */}
      <div className="h-48 md:h-64 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <main className="container -mt-20 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Company Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl">
              <div className="w-24 h-24 bg-white rounded-2xl p-4 border border-slate-100 shadow-inner mb-6 mx-auto flex items-center justify-center">
                {company.logo && company.logo !== "string" ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl font-black text-primary">{company.name?.charAt(0)}</span>
                )}
              </div>
              
              <h1 className="text-3xl font-black text-center mb-2">{company.name}</h1>
              <p className="text-primary font-bold text-center mb-8">{company.industry || "Industry"}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{company.location || "Global"}</span>
                </div>
                {company.website && (
                  <a href={company.website} target="_blank" className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <span className="font-medium">Visit Website</span>
                  </a>
                )}
                <div className="flex items-center gap-3 text-slate-600">
                  <Users className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">50-100 Employees</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-slate-900">4.8</span>
                <span className="text-slate-500 text-sm">(124 Reviews)</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Company Pulse
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-2xl font-black text-primary">{jobs.length}</div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Open Roles</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="text-2xl font-black text-primary">98%</div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Recommended</div>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs & About Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black mb-6">About {company.name}</h2>
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {company.description || "Leading the industry with innovative solutions and a people-first culture."}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Active Openings</h2>
                <div className="bg-slate-200 h-[1px] flex-1 mx-8 hidden md:block" />
                <span className="text-slate-500 font-bold">{jobs.length} Jobs Available</span>
              </div>

              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((j, idx) => (
                    <JobCard key={j.id} {...j} company={j.company_name} company_id={j.company_id} salary={j.min_salary && j.max_salary ? `${j.currency || "$"} ${j.min_salary.toLocaleString()} - ${j.max_salary.toLocaleString()}` : "Not Disclosed"} posted={j.created_at} delay={idx * 0.1} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center">
                   <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-500 font-bold">No active job openings at the moment.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
