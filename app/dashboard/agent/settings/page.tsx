"use client";

import { useState, useEffect } from "react";
import { User, Shield, Info, LogOut, Check, Copy, Share2, MessageCircle, Twitter, AtSign } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
    }, []);

    const handleCopyReferral = () => {
        if (!user?.referral_code) return;
        navigator.clipboard.writeText(user.referral_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Manage your account and preferences.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">

                {/* Profile Section */}
                <div className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-slate-800 rounded-full text-slate-300">
                        <User size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-medium">Profile</h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 uppercase">Nama</label>
                                <p className="text-slate-300 font-mono bg-slate-950/50 p-2 rounded border border-slate-800/50">{user?.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase">Nombor Telefon</label>
                                <p className="text-slate-300 font-mono bg-slate-950/50 p-2 rounded border border-slate-800/50">{user?.phone_number}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase">Referral Code</label>
                                <p className="text-emerald-400 font-mono bg-emerald-900/10 p-2 rounded border border-emerald-900/20">{user?.referral_code}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Section */}
                <div className="p-6">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Share2 size={20} className="text-indigo-400" />
                        Ajak Member
                    </h3>

                    {/* Referral Code Box */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Referral Code</p>
                            <p className="text-2xl font-bold text-white tracking-widest">{user?.referral_code}</p>
                        </div>
                        <button
                            onClick={handleCopyReferral}
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        >
                            {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                        </button>
                    </div>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                const text = `Wei bangun sahur! Join group aku kat KejutSahur. Guna code ni: *${user?.referral_code}*. Register sini: ${window.location.origin}/register/member?code=${user?.referral_code}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="flex flex-col items-center justify-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
                        >
                            <MessageCircle size={20} className="text-green-400" />
                            <span className="text-xs font-medium text-slate-300">WhatsApp</span>
                        </button>
                        <button
                            onClick={() => {
                                const text = `Nak aku kejut sahur? Join KejutSahur guna code *${user?.referral_code}*! #KejutSahur 🌙`;
                                window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)} ${encodeURIComponent(`${window.location.origin}/register/member?code=${user?.referral_code}`)}`, '_blank');
                            }}
                            className="flex flex-col items-center justify-center gap-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
                        >
                            <AtSign size={20} className="text-white" />
                            <span className="text-xs font-medium text-slate-300">Threads</span>
                        </button>
                        <button
                            onClick={async () => {
                                if (navigator.share) {
                                    try {
                                        await navigator.share({
                                            title: 'KejutSahur',
                                            text: `Join group aku kat KejutSahur! Code: ${user?.referral_code}`,
                                            url: `${window.location.origin}/register/member?code=${user?.referral_code}`
                                        });
                                    } catch (err) {
                                        console.log("Share canceled", err);
                                    }
                                } else {
                                    alert("Browser tak support share function ni, copy link manual k.");
                                }
                            }}
                            className="col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            <Share2 size={16} /> Share Link
                        </button>
                    </div>
                </div>

                {/* App Info */}
                <div className="p-6 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                    <div className="p-3 bg-slate-800 rounded-full text-slate-300">
                        <Info size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">App Version</h3>
                        <p className="text-sm text-slate-400">v1.0.0 (Ramadan Edition)</p>
                    </div>
                </div>

                {/* Security / Logout */}
                <div className="p-6 flex items-center gap-4 hover:bg-red-900/10 transition-colors cursor-pointer group" onClick={handleLogout}>
                    <div className="p-3 bg-slate-800 rounded-full text-red-400 group-hover:bg-red-900/20 transition-colors">
                        <LogOut size={24} />
                    </div>
                    <div>
                        <h3 className="text-red-400 font-medium group-hover:text-red-300">Log Out</h3>
                        <p className="text-sm text-slate-500">Sign out from this device.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
