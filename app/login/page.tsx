"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        phone_number: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login gagal. Check nombor atau password.");
            }

            // Save token
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/dashboard/agent");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2">
                <ArrowLeft size={16} /> Kembali
            </Link>

            <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                <div className="text-center mb-8">
                    <KeyRound className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white font-serif">Log Masuk Agent</h2>
                    <p className="text-slate-400 text-sm mt-2">Masuk untuk tengok senarai member.</p>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nombor Telefon</label>
                        <input
                            type="tel"
                            required
                            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="0123456789"
                            value={form.phone_number}
                            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-purple-400 hover:text-purple-300"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Masuk Dashboard"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Belum daftar agent? <Link href="/register/agent" className="text-purple-400 hover:text-purple-300">Daftar sini</Link>
                </div>
            </div>
        </div>
    );
}
