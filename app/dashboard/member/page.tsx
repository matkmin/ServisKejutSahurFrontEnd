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
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                    setSahurTime(userData.sahur_time || "05:00");
                    // Update local storage to keep it fresh
                    localStorage.setItem("user", JSON.stringify(userData));
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };

        fetchUserData();
    }, [router]);

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

            {/* Agent Payment QR Section */}
            {user?.admin?.payment_qr && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Bayar Servis Kejut</h2>
                    <p className="text-slate-400 text-sm mb-6">Scan QR di bawah untuk bayar kepada Agent <strong>{user.admin.name}</strong>.</p>

                    <div className="bg-white p-4 rounded-xl inline-block mb-4">
                        <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/storage/${user.admin.payment_qr}`}
                            alt="Agent Payment QR"
                            className="w-48 h-48 object-contain"
                        />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">TNG / DuitNow</p>
                </div>
            )}

            {/* Agent Info */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                    <User size={20} />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Agent Pengejut Anda</p>
                    <p className="text-sm font-medium text-white">
                        {user.admin ? user.admin.name : `Member (ID: ${user.admin_id})`}
                    </p>
                </div>
            </div>
        </div>
    );
}
