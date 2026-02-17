"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, User, LayoutDashboard, QrCode, Menu, X } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="min-h-screen bg-slate-950 flex">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 flex items-center justify-between px-4">
                <Link href="/" className="font-bold text-lg text-emerald-500 font-serif">
                    Kejut Sahur
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between md:block mb-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-500 font-serif">
                            Kejut Sahur
                        </Link>
                        {/* Mobile Close Button (inside sidebar) */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <div className="px-4 py-3 bg-slate-800/50 rounded-lg text-slate-200 flex items-center gap-3 mb-4">
                            <User size={18} />
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                            </div>
                        </div>

                        <Link
                            href={`/dashboard/${user.role}`}
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                        >
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>

                        <Link
                            href="/dashboard/agent/settings"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                        >
                            <User size={18} /> Settings
                        </Link>

                        {user.role === 'agent' && (
                            <Link
                                href="/dashboard/agent/payment-qr"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                <QrCode size={18} /> Payment QR
                            </Link>
                        )}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors mt-auto"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-20 md:pt-8 w-full">
                {children}
            </main>
        </div>
    );
}
