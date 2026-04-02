"use client";

import { Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative py-24 md:py-32 bg-hero-pattern bg-cover bg-center overflow-hidden">
      <div className="container relative z-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
        >
          Find Your Dream Career <br className="hidden md:block"/> in One Place
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto"
        >
          Discover thousands of job opportunities from top companies worldwide with personalized recommendations.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white p-2 md:p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 max-w-4xl mx-auto"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Job title or keyword" 
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <MapPin className="text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Location" 
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>
          
          <button className="btn-primary flex items-center justify-center gap-2 group">
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Search Jobs</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
