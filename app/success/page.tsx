"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Home } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const agentName = searchParams.get("agent") || "Agent";
    const agentPhone = searchParams.get("phone") || "";

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2 font-serif">Pendaftaran Berjaya!</h1>
                <p className="text-slate-400 mb-6">
                    Mantap! <span className="text-amber-400 font-bold">{agentName}</span> dah dapat notifikasi.
                    Tunggu je call waktu sahur nanti.
                </p>

                {agentPhone && (
                    <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-900/50 mb-6">
                        <p className="text-xs text-amber-500 uppercase tracking-wider mb-2 font-bold">Simpan Nombor Agent Ni:</p>
                        <p className="text-2xl font-mono text-white mb-4">{agentPhone}</p>

                        <a
                            href={`https://wa.me/60${agentPhone.replace(/^0+/, '')}?text=Salam%20${agentName},%20saya%20baru%20register%20KejutSahur!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all w-full"
                        >
                            WhatsApp Agent Sekarang
                        </a>
                    </div>
                )}

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-8">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        Awaiting Sahur Call
                    </p>
                </div>

                <Link
                    href="/"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-2 group"
                >
                    <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Balik Home
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
