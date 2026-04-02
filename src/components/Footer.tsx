import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-20 mt-20">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
            <span className="text-3xl">🎯</span>
            JobSphere
          </div>
          <p className="text-slate-400 max-w-sm mb-8">
            The leading platform for professionals to find their next great opportunity. We connect talent with innovation across the globe.
          </p>
          <div className="flex gap-4">
             {/* Simple social icon placeholders */}
             {[1,2,3,4].map(i => (
               <div key={i} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                 {/* Lucide icons could go here */}
               </div>
             ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-bold mb-6">Platform</h4>
          <ul className="space-y-4 text-slate-400">
            <li><Link href="/jobs" className="hover:text-white transition-colors">Find Jobs</Link></li>
            <li><Link href="/companies" className="hover:text-white transition-colors">Find Companies</Link></li>
            <li><Link href="/salaries" className="hover:text-white transition-colors">Market Salaries</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Post a Job</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-slate-400">
            <li><Link href="/profile" className="hover:text-white transition-colors">Account</Link></li>
            <li><Link href="/applications" className="hover:text-white transition-colors">My Applications</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} JobSphere Inc. All rights reserved.
      </div>
    </footer>
  );
}
