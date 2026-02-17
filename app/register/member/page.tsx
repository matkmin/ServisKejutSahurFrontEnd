"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Moon } from "lucide-react";

function RegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Auto-fill form from URL query params if available
    const urlReferralCode = searchParams.get("code");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        phone_number: "",
        referral_code: urlReferralCode || "",
        sahur_time: "05:00",
    });

    // Update form if URL param changes
    useEffect(() => {
        if (urlReferralCode) {
            setForm(prev => ({ ...prev, referral_code: urlReferralCode }));
        }
    }, [urlReferralCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/register/member`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed. Check referral code.");
            }

            router.push(`/success?agent=${data.agent}`);
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
                    <Moon className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white font-serif">Saya Nak Dikejutkan</h2>
                    <p className="text-slate-400 text-sm mt-2">Daftar bawah member kau, biar dia call.</p>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nama</label>
                        <input
                            type="text"
                            required
                            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="Nama Kau"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nombor Telefon</label>
                        <input
                            type="tel"
                            required
                            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                            placeholder="0123456789"
                            value={form.phone_number}
                            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Referral Code</label>
                            <input
                                type="text"
                                required
                                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 uppercase"
                                placeholder="AZMI123"
                                value={form.referral_code}
                                onChange={(e) => setForm({ ...form, referral_code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Waktu Sahur</label>
                            <input
                                type="time"
                                required
                                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                                value={form.sahur_time}
                                onChange={(e) => setForm({ ...form, sahur_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Confirm Kejut Aku"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function RegisterMember() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
