"use client";

import { useEffect, useState } from "react";
import { Clock, Save, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MemberDashboard() {
    const [user, setUser] = useState<any>(null);
    const [sahurTime, setSahurTime] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            setSahurTime(parsed.sahur_time || "05:00");
        }
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/member/sahur-time`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                },
                body: JSON.stringify({ sahur_time: sahurTime }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Masa sahur berjaya dikemaskini! ✅");
                // Update local storage
                const updatedUser = { ...user, sahur_time: sahurTime };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setMessage(data.message || "Gagal kemaskini.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Ralat sistem.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="max-w-md mx-auto space-y-8">

            {/* Welcome Card */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Salam Ramadan, {user.name} 🌙</h1>
                <p className="text-slate-400">Pastikan member kejut kau tepat pada masanya.</p>
            </div>

            {/* Sahur Time Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                        <Clock size={32} />
                    </div>

                    <h2 className="text-lg font-medium text-slate-300 mb-6">Waktu Sahur Pilihan</h2>

                    <form onSubmit={handleUpdate} className="w-full space-y-6">
                        <div className="relative">
                            <input
                                type="time"
                                value={sahurTime}
                                onChange={(e) => setSahurTime(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Updating..." : <><Save size={18} /> Simpan Waktu </>}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-4 text-sm font-medium ${message.includes("Gagal") ? "text-red-400" : "text-emerald-400"} animate-in fade-in slide-in-from-bottom-2`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>

            {/* Agent Info */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                    <User size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Agent Pengejut Anda</p>
                    <p className="text-sm font-medium text-white">
                        {/* We might need to store agent name in user object or fetch it, for now generic or from migration if we added it */}
                        Member (ID: {user.admin_id})
                    </p>
                </div>
            </div>

        </div>
    );
}
