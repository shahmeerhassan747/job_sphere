"use client";

import { motion } from "framer-motion";

interface CategoryCardProps {
  icon: string;
  name: string;
  count: string;
  delay?: number;
}

export default function CategoryCard({ icon, name, count, delay = 0 }: CategoryCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:border-primary/30 hover:shadow-xl transition-all"
    >
      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-800">{name}</h3>
      <p className="text-slate-500 font-medium">{count}</p>
    </motion.div>
  );
}
