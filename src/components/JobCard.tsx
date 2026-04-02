"use client";

import { MapPin, Clock, ArrowUpRight, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface JobCardProps {
  id?: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  rating?: number;
  reviews?: number;
  delay?: number;
  company_id?: string | number;
  image?: string;
}

export default function JobCard({ 
  id = "1",
  title, 
  company, 
  logo, 
  location, 
  salary, 
  type, 
  posted,
  rating = 4.5,
  reviews = 12,
  delay = 0,
  company_id,
  image,
}: JobCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.01 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-2xl hover:border-primary/20 transition-all flex flex-col group relative overflow-hidden"
    >
      {image && (
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
      )}
      <div className="flex justify-between items-start mb-6">
        <div className="relative w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
            {logo ? (
        <img src={logo} alt={company} className="w-10 h-10 object-contain" />
)       : (
        <span className="text-xl font-bold text-primary">
        {company?.charAt(0) || "?"}
        </span>
)}
        </div>
        <div className="flex flex-col items-end gap-2">
            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {type}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
               <Star className="w-3 h-3 fill-yellow-600" /> {rating}
            </div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-1 text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
      {company_id ? (
        <Link href={`/companies/${company_id}`} className="text-slate-500 font-medium mb-6 hover:text-primary transition-colors block">
          {company}
        </Link>
      ) : (
        <span className="text-slate-500 font-medium mb-6 block">{company}</span>
      )}
      
      <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary/60" />
          {location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-primary/60" />
          {new Date(posted).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-primary/60" />
          {reviews} Comments
        </div>
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="text-lg font-bold text-slate-900">{salary}</div>
        <Link href={`/jobs/${id}`} className="flex items-center gap-1 text-primary font-bold hover:translate-x-1 transition-transform">
          View Details <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
