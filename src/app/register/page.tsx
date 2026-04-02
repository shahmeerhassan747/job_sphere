"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Briefcase } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("jobseeker");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [avatar, setAvatar] = useState("");

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:8000/add_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          avatar: avatar || "NULL"
        }),
      });

      const data = await res.json();

      if (data.success || data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Fallback for API response variations
        setError(data.error || data.detail || data.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md"
        >
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create an account</h1>
          <p className="text-slate-500 mb-8">Join JobSphere today</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
              User created successfully! Redirecting to login...
            </div>
          )}

          <div className="space-y-5">
            <ImageUpload 
              label="Profile Picture (Optional)"
              value={avatar}
              onChange={(base64) => setAvatar(base64)}
              className="mb-6"
            />
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Name *</label>
              <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="flex-1 outline-none text-sm text-slate-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Email *</label>
              <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-sm text-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Password *</label>
              <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="flex-1 outline-none text-sm text-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                />
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">I am a...</label>
              <div className="flex items-center border border-slate-200 rounded-xl px-4 py-3 gap-3 focus-within:border-primary transition">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <select
                  className="flex-1 outline-none text-sm text-slate-800 bg-transparent cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="jobseeker">Jobseeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || success}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
