"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Phone, MessageCircle, Clock, Bell, Copy, Check, Loader2, Zap, Activity, Share2, AtSign, CheckSquare } from "lucide-react";
// import ImsyakCountdown from "@/app/components/ImsyakCountdown";

export default function AgentDashboard() {
    const [members, setMembers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<'today' | 'custom'>('today');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
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

                // Fetch User Profile (for Location)
                const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/user`, { headers });
                if (userRes.ok) {
                    setUser(await userRes.json());
                }

                // Fetch Members
                const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/members`, { headers });
                if (membersRes.ok) {
                    setMembers(await membersRes.json());
                }

                // Calculate date range based on filter
                let query = '';
                const today = new Date().toISOString().split('T')[0];

                if (filter === 'today') {
                    query = `?start_date=${today}&end_date=${today}`;
                } else if (filter === 'custom' && customRange.start && customRange.end) {
                    query = `?start_date=${customRange.start}&end_date=${customRange.end}`;
                }

                // Fetch Stats
                const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/stats${query}`, { headers });
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
    }, [router, filter, customRange]);


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
                // Ensure proper WhatsApp format (60...)
                let waNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digits
                if (waNumber.startsWith('0')) {
                    waNumber = '6' + waNumber;
                }
                window.open(`https://wa.me/${waNumber}?text=Bangun%20sahur%20oi!%20Dah%20pukul%20berapa%20ni!`, '_blank');
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

    const handleTogglePayment = async (memberId: number) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/member/${memberId}/toggle-payment`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });

            if (res.ok) {
                const data = await res.json();
                // Update local state
                setMembers(prev => prev.map(m =>
                    m.id === memberId ? { ...m, payment_status: data.member.payment_status } : m
                ));
            }
        } catch (error) {
            console.error("Failed to toggle payment", error);
        }
    };

    const handleToggleComplete = async (memberId: number) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/member/${memberId}/toggle-complete`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            });

            if (res.ok) {
                const data = await res.json();
                setMembers(prev => prev.map(m =>
                    m.id === memberId ? { ...m, last_completed_at: data.member.last_completed_at } : m
                ));
            }
        } catch (error) {
            console.error("Failed to toggle completion", error);
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-start">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-serif">Dashboard Pengejut</h1>
                        <p className="text-slate-400">Senarai member yang perlu dikejutkan.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start">
                            <button
                                onClick={() => setFilter('today')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'today' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Hari Ini
                            </button>
                            <button
                                onClick={() => setFilter('custom')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'custom' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Custom
                            </button>
                        </div>

                        {filter === 'custom' && (
                            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="date"
                                    className="bg-slate-950 text-white border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                                    value={customRange.start}
                                    onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                />
                                <span className="text-slate-500">-</span>
                                <input
                                    type="date"
                                    className="bg-slate-950 text-white border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-blue-500"
                                    value={customRange.end}
                                    onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
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

            {/* Imsyak Countdown */}
            <div className="animate-in slide-in-from-top-4 duration-700">
                {/* <ImsyakCountdown
                    savedLocation={user ? {
                        latitude: user.latitude,
                        longitude: user.longitude
                    } : null}
                /> */}
            </div>

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
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 shrink-0">
                                <Activity size={24} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-slate-400 text-sm">Last Activity</p>
                                <p className="text-sm font-medium text-white truncate">
                                    {stats.recent_activity?.[0] ? `${stats.recent_activity[0].action_type} - ${stats.recent_activity[0].member_name}` : "No activity"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {stats.recent_activity?.[0] ? stats.recent_activity[0].created_at : ''}
                                </p>
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
                                <div key={member.id} className={`bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-slate-700 transition-all ${member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString() ? 'opacity-50 grayscale' : ''
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg relative">
                                            {member.name.charAt(0)}
                                            {member.payment_status === 'paid' && (
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-slate-900">
                                                    <Check size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold text-white text-lg ${member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString() ? 'line-through text-slate-500' : ''
                                                    }`}>{member.name}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${member.payment_status === 'paid'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    }`}>
                                                    {member.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                                                </span>
                                                {/* Price Display */}
                                                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                                    RM {(() => {
                                                        let total = 0;
                                                        // Base Price
                                                        if (member.package === '2_call' || member.package === 'premium') total += 6;
                                                        else total += 3; // default '1_call'/'asas' is RM 3

                                                        // Add-ons Price
                                                        if (Array.isArray(member.add_on)) {
                                                            if (member.add_on.includes('mak_mak')) total += 2;
                                                            if (member.add_on.includes('manja')) total += 5;
                                                            if (member.add_on.includes('kaki')) total += 7;

                                                            // Legacy support if old keys exist
                                                            if (member.add_on.includes('1_call')) total += 2; // Treat as extra call
                                                            if (member.add_on.includes('3_call')) total += 5;
                                                            if (member.add_on.includes('motivational_quote')) total += 7;
                                                        }
                                                        return total;
                                                    })()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                <p className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-amber-500" />
                                                    {member.sahur_time}
                                                </p>
                                                <span className="text-slate-700">•</span>
                                                <p className="capitalize text-slate-500">{member.package?.replace('_', ' ') || 'Asas'}</p>

                                                {/* Add-ons Display */}
                                                {Array.isArray(member.add_on) && member.add_on.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {member.add_on.map((addon: string, index: number) => (
                                                            <span key={index} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                                                                {addon.replace('_', ' ')}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleTogglePayment(member.id)}
                                            disabled={!!(member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString())}
                                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all border ${member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString()
                                                ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed opacity-50'
                                                : member.payment_status === 'paid'
                                                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                                    : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                                                }`}
                                            title={member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString() ? "Mark Incomplete first to change payment status" : ""}
                                        >
                                            {member.payment_status === 'paid' ? 'Revert Pending' : 'Mark Paid'}
                                        </button>

                                        <div className="w-px h-8 bg-slate-800 mx-1 hidden sm:block"></div>

                                        <button
                                            onClick={() => handleToggleComplete(member.id)}
                                            disabled={member.payment_status !== 'paid'}
                                            className={`p-2 rounded-lg transition-all border ${member.payment_status !== 'paid'
                                                ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed opacity-50'
                                                : member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString()
                                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20'
                                                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                                                }`}
                                            title={
                                                member.payment_status !== 'paid'
                                                    ? "Payment Pending - Cannot Mark Complete"
                                                    : member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString()
                                                        ? "Mark Incomplete"
                                                        : "Mark Complete"
                                            }
                                        >
                                            <CheckSquare size={18} />
                                        </button>

                                        <div className="w-px h-8 bg-slate-800 mx-1 hidden sm:block"></div>

                                        <button
                                            onClick={() => handleAction(member.id, member.phone_number, 'call')}
                                            disabled={!!(member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString()) || member.payment_status !== 'paid'}
                                            className={`p-2 rounded-lg transition-all border ${member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString() || member.payment_status !== 'paid'
                                                ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed opacity-50'
                                                : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-400'
                                                }`}
                                            title="Call Now"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(member.id, member.phone_number, 'whatsapp')}
                                            disabled={!!(member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString()) || member.payment_status !== 'paid'}
                                            className={`p-2 rounded-lg transition-all border ${member.last_completed_at && new Date(member.last_completed_at).toDateString() === new Date().toDateString() || member.payment_status !== 'paid'
                                                ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed opacity-50'
                                                : 'bg-slate-800 text-green-400 border-slate-700 hover:bg-green-500 hover:text-white hover:border-green-400'
                                                }`}
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
