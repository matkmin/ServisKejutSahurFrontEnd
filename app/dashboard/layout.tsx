"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, User, LayoutDashboard, QrCode } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Basic Client-side Auth Check
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/");
            return;
        }

        setUser(JSON.parse(userData));
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    if (!user) return null; // loading state

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
            {/* Sidebar (Mobile Topbar / Desktop Sidebar) */}
            <aside className="w-full md:w-64 bg-slate-900 border-b md:border-r border-slate-800 p-4 flex flex-col justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-500 mb-8 font-serif">
                        Kejut Sahur
                    </Link>

                    <nav className="space-y-2">
                        <div className="px-4 py-3 bg-slate-800/50 rounded-lg text-slate-200 flex items-center gap-3">
                            <User size={18} />
                            <div>
                                <p className="text-sm font-semibold">{user.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                            </div>
                        </div>

                        <Link href={`/dashboard/${user.role}`} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>

                        <Link href="/dashboard/agent/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors">
                            <User size={18} /> Settings
                        </Link>

                        {user.role === 'agent' && (
                            <Link href="/dashboard/agent/payment-qr" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors">
                                <QrCode size={18} /> Payment QR
                            </Link>
                        )}
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors mt-auto"
                >
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
