"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import JobCard from "@/components/JobCard";
import Footer from "@/components/Footer";
import Link from "next/link";

const categories = [
  { icon: '🚀', name: 'Engineering', count: '1.2k+ jobs' },
  { icon: '🎨', name: 'Design', count: '800+ jobs' },
  { icon: '📈', name: 'Marketing', count: '500+ jobs' },
  { icon: '💼', name: 'Business', count: '300+ jobs' },
];

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/get_all_jobs")
      .then(res => res.json())
      .then(data => {
        const fetchedJobs = data.data?.jobs || [];
        setJobs(fetchedJobs.slice(0, 4)); // Show latest 4 on homepage
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      <main>
        {/* Categories Section */}
        <section className="py-24">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Explore by Categories</h2>
              <p className="text-slate-500 max-w-lg mx-auto">Browse through our most popular job industries and find the right fit for your career.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((cat, idx) => (
                <CategoryCard key={idx} {...cat} delay={idx * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="py-24 bg-slate-50/50">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-4xl font-bold mb-4">Latest Job Openings</h2>
                <p className="text-slate-500 max-w-lg">Handpicked opportunities for you from high-growth companies.</p>
              </div>
              <Link href="/jobs" className="text-primary font-bold flex items-center gap-2 group">
                View All Jobs <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium">
                No jobs available at the moment. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {jobs.map((job: any, idx: number) => (
                  <JobCard
                    key={job.id}
                    id={String(job.id)}
                    title={job.title}
                    company={job.company_name}
                    company_id={job.company_id}
                    logo={job.company_logo || ""}
                    location={job.location}
                    salary={
                      job.min_salary && job.max_salary
                        ? `${job.currency || "$"} ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}`
                        : "Salary Disclosed"
                    }
                    type={job.type}
                    posted={job.created_at || new Date().toISOString()}
                    rating={4.8}
                    reviews={0}
                    delay={idx * 0.1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <div className="bg-primary relative overflow-hidden rounded-[2rem] p-12 md:p-24 text-center text-white">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to take the next step?</h2>
                <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                  Join 50,000+ professionals who found their dream job through JobSphere. Your next career move is just a click away.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <Link href="/jobs" className="btn-primary bg-white text-primary hover:bg-slate-50 w-full sm:w-auto text-center">
                     Get Started Now
                   </Link>
                   <Link href="/jobs" className="px-8 py-3 rounded-xl border border-white/30 font-bold hover:bg-white/10 transition-colors w-full sm:w-auto text-center">
                     Browse Jobs
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
