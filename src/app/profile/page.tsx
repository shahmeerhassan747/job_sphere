"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Settings, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  FileText,
  Bookmark,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const userStats = [
  { label: "Applied Jobs", value: "24", icon: <Briefcase className="w-5 h-5" />, color: "bg-blue-500" },
  { label: "Saved Jobs", value: "12", icon: <Bookmark className="w-5 h-5" />, color: "bg-purple-500" },
  { label: "Applied Events", value: "05", icon: <Calendar className="w-5 h-5" />, color: "bg-orange-500" },
  { label: "Profile Views", value: "156", icon: <User className="w-5 h-5" />, color: "bg-teal-500" },
];

const appliedJobs = [
  {
    title: "Senior Product Designer",
    company: "TechFlow Systems",
    status: "Interviewing",
    date: "Applied 2 days ago",
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
  },
  {
    title: "Full Stack Developer",
    company: "InnoCorp",
    status: "Reviewed",
    date: "Applied 1 week ago",
    icon: <Clock className="w-4 h-4 text-blue-500" />
  },
  {
    title: "Marketing Coordinator",
    company: "Creative Peak",
    status: "Offer",
    date: "Applied 3 weeks ago",
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal form state
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "jobseeker" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFormData({
          name: parsed.name || "",
          email: parsed.email || "",
          password: "",
          role: parsed.role || "jobseeker"
        });
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  const openEditModal = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "jobseeker"
      });
    }
    setError("");
    setSuccess(false);
    setIsDeleting(false);
    setIsEditing(true);
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password || "123456", // Fallback if empty
        role: formData.role,
        avatar: user.avatar || "NULL"
      };

      const res = await fetch(`http://localhost:8000/update_users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success || data.status === "success" || res.ok) {
        setSuccess(true);
        const updatedUser = { ...user, name: formData.name, email: formData.email, role: formData.role };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setTimeout(() => setIsEditing(false), 1500);
      } else {
        setError(data.error || data.detail || data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Something went wrong updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeleteLoading(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:8000/delete_users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (data.success || data.status === "success" || res.ok) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        // Clear cookies just in case
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        router.push("/login");
      } else {
        setError(data.error || data.detail || "Failed to delete account");
        setDeleteLoading(false);
      }
    } catch (err) {
      setError("Something went wrong deleting your account.");
      setDeleteLoading(false);
    }
  };

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "US";

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Navbar />
      
      <main className="container py-12 px-4 mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 text-center shadow-sm">
               <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl font-bold text-primary border-4 border-white shadow-xl">
                    {initials}
                  </div>
                  <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
               </div>
               <h2 className="text-2xl font-bold mb-1">{user?.name || "Loading..."}</h2>
               <p className="text-slate-500 font-medium mb-6 capitalize">{user?.role || "Job Seeker"}</p>
               
               <div className="space-y-4 text-left pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                     <Mail className="w-4 h-4 text-slate-400" /> {user?.email || "loading@example.com"}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                     <MapPin className="w-4 h-4 text-slate-400" /> New York, NY
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                     <Briefcase className="w-4 h-4 text-slate-400" /> 5+ Years Exp.
                  </div>
               </div>
               
               <button 
                 onClick={openEditModal}
                 className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
               >
                  <Settings className="w-4 h-4" /> Edit Profile
               </button>
            </div>

            <nav className="bg-white overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm divide-y divide-slate-100">
               <a href="#" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3 font-bold text-slate-700">
                     <Briefcase className="w-5 h-5 text-primary" /> My Applications
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
               </a>
               <a href="#" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                     <Bookmark className="w-5 h-5" /> Saved Jobs
                  </div>
               </a>
               <a href="#" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                     <Bell className="w-5 h-5" /> Notifications
                  </div>
               </a>
               <a href="#" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group text-slate-500 font-medium">
                  <div className="flex items-center gap-3">
                     <FileText className="w-5 h-5" /> My Resume
                  </div>
               </a>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {userStats.map((stat, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm"
                 >
                    <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                 </motion.div>
               ))}
            </div>

            {/* Application History */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Application History</h3>
                  <button className="text-primary font-bold text-sm hover:underline">View All</button>
               </div>
               
               <div className="divide-y divide-slate-50">
                  {appliedJobs.map((job, idx) => (
                    <div key={idx} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                             <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900">{job.title}</h4>
                             <p className="text-slate-500 text-sm font-medium">{job.company}</p>
                          </div>
                       </div>
                       
                       <div className="flex flex-col md:items-end gap-2">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                             {job.icon} {job.status}
                          </div>
                          <div className="text-xs text-slate-400">{job.date}</div>
                       </div>
                       
                       <button className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                          Details
                       </button>
                    </div>
                  ))}
               </div>
            </div>

            {/* Recommended for you banner */}
            <div className="bg-primary p-12 rounded-[2rem] text-white relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-md">
                     <h3 className="text-2xl font-bold mb-2">Complete your profile</h3>
                     <p className="text-white/80">Improve your visibility to recruiters by adding your latest projects and skills. Profile completion: 85%</p>
                  </div>
                  <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-slate-50 transition-colors">
                     Complete Now
                  </button>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Edit Profile</h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                  Profile updated successfully!
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Name</label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                    <User className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="flex-1 outline-none text-sm text-slate-800"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isDeleting}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Email</label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      className="flex-1 outline-none text-sm text-slate-800"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isDeleting}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">New Password (Optional)</label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave blank to keep same"
                      className="flex-1 outline-none text-sm text-slate-800"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={isDeleting}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} disabled={isDeleting}>
                      {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Role</label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <select
                      className="flex-1 outline-none text-sm text-slate-800 bg-transparent cursor-pointer disabled:opacity-50"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      disabled={isDeleting}
                    >
                      <option value="jobseeker">Jobseeker</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading || success || isDeleting || deleteLoading}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                
                <div className="pt-4 border-t border-slate-100">
                  {!isDeleting ? (
                    <button
                      onClick={() => setIsDeleting(true)}
                      className="w-full text-red-500 font-bold py-2 rounded-xl border border-transparent hover:bg-red-50 hover:border-red-100 transition"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-2 text-red-700 text-sm font-medium">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Are you sure you want to permanently delete your account? This cannot be undone.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsDeleting(false)}
                          disabled={deleteLoading}
                          className="flex-1 bg-white text-slate-600 font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-50 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
                        >
                          {deleteLoading ? "Deleting..." : "Yes, Delete"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
