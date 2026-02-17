"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Phone, MessageCircle, Clock, Bell, Copy, Check, Loader2, Zap, Activity, Share2, Twitter, AtSign } from "lucide-react";

export default function AgentDashboard() {
    const [members, setMembers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const headers = {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                };

                // Fetch Members
                const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/members`, { headers });
                if (membersRes.ok) {
                    setMembers(await membersRes.json());
                }

                // Fetch Stats
                const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/stats`, { headers });
                if (statsRes.ok) {
                    setStats(await statsRes.json());
                }

                // Fetch Notifications
                const notifRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/notifications`, { headers });
                if (notifRes.ok) {
                    setNotifications(await notifRes.json());
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);


    const handleAction = async (memberId: number, phoneNumber: string, action: 'call' | 'whatsapp') => {
        try {
            // Log the action to backend
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/action-log`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    member_id: memberId,
                    action_type: action,
                    status: 'completed'
                })
            });

            if (action === 'call') {
                window.location.href = `tel:${phoneNumber}`;
            } else {
                window.open(`https://wa.me/${phoneNumber}?text=Bangun%20sahur%20oi!%20Dah%20pukul%20berapa%20ni!`, '_blank');
            }
        } catch (error) {
            console.error("Failed to log action", error);
        }
    };

    const markAsRead = async () => {
        const token = localStorage.getItem("token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/notifications/read`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });
        setNotifications([]);
    }

    const simulateSahurTime = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/test/trigger-reminders`, {
            method: 'POST'
        });
        alert("Simulated! Check notifications.");
        window.location.reload();
    }

    const unreadCount = notifications.length;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">Dashboard Pengejut</h1>
                    <p className="text-slate-400">Senarai member yang perlu dikejutkan.</p>
                </div>

                <div className="flex gap-4">
                    {/* Simulation Button (Dev Only) */}
                    <button onClick={simulateSahurTime} className="p-3 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 transition" title="Simulate Sahur">
                        <Zap size={20} />
                    </button>

                    <div className="relative">
                        <button className="p-3 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 transition">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-slate-950"></span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {unreadCount > 0 && (
                            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                                    <button onClick={markAsRead} className="text-xs text-emerald-500 hover:text-emerald-400">Mark all read</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map((notif: any) => (
                                        <div key={notif.id} className="p-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                                            <p className="text-sm text-white font-medium">{notif.data.title}</p>
                                            <p className="text-xs text-slate-400 mt-1">{notif.data.message}</p>
                                            <p className="text-xs text-slate-500 mt-2">{new Date(notif.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Members</p>
                                <p className="text-2xl font-bold text-white">{stats.total_members}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Total Kejut (Calls)</p>
                                <p className="text-2xl font-bold text-white">{stats.total_calls}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Last Activity</p>
                                <p className="text-sm font-medium text-white truncate w-32">
                                    {stats.recent_activity?.[0] ? `${stats.recent_activity[0].action_type} - ${stats.recent_activity[0].member_name}` : "No activity"}
                                </p>
                                <p className="text-xs text-slate-500">{stats.recent_activity?.[0]?.created_at}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Member List (Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Senarai Member</h2>
                        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-300 flex items-center gap-2">
                            <Copy size={12} />
                            Code: <span className="font-mono font-bold text-emerald-400">
                                {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').referral_code : '...'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Share Buttons */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <button
                            onClick={() => {
                                const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
                                const text = `Wei bangun sahur! Join group aku kat KejutSahur. Guna code ni: *${user?.referral_code}*. Register sini: ${window.location.origin}/register/member?code=${user?.referral_code}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors group"
                        >
                            <MessageCircle size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-slate-300">WhatsApp</span>
                        </button>
                        <button
                            onClick={() => {
                                const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
                                const text = `Nak aku kejut sahur? Join KejutSahur guna code *${user?.referral_code}*! #KejutSahur 🌙`;
                                window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)} ${encodeURIComponent(`${window.location.origin}/register/member?code=${user?.referral_code}`)}`, '_blank');
                            }}
                            className="flex items-center justify-center gap-2 p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors group"
                        >
                            <AtSign size={18} className="text-white group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-slate-300">Threads</span>
                        </button>
                        <button
                            onClick={async () => {
                                const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
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
                            className="lg:col-span-2 flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg shadow-indigo-900/20"
                        >
                            <Share2 size={16} /> Share Invite Link
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-emerald-500" />
                        </div>
                    ) : members.length === 0 ? (
                        <p className="text-slate-500">Belum ada member. Share code kau!</p>
                    ) : (
                        <div className="grid gap-4">
                            {members.map((member) => (
                                <div key={member.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-slate-700 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{member.name}</p>
                                            <p className="text-sm text-slate-400 flex items-center gap-2">
                                                <Clock size={12} className="text-amber-500" />
                                                Sahur: {member.sahur_time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(member.id, member.phone_number, 'call')}
                                            className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors"
                                            title="Call Now"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(member.id, member.phone_number, 'whatsapp')}
                                            className="p-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Recent Activity Feed */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-purple-400" /> Recent Activity
                    </h3>

                    {!stats?.recent_activity?.length ? (
                        <p className="text-sm text-slate-500">No recent activity.</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.recent_activity.map((log: any) => (
                                <div key={log.id} className="flex gap-3 items-start border-b border-slate-800/50 pb-3 last:border-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${log.action_type === 'call' ? 'bg-emerald-500' : 'bg-green-500'}`} />
                                    <div>
                                        <p className="text-sm text-slate-300">
                                            <span className="font-bold capitalize text-white">{log.action_type}</span> to {log.member_name}
                                        </p>
                                        <span className="text-xs text-slate-500">{log.created_at}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
