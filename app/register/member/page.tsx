"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Moon, Sparkles, Zap, Heart, MessageSquare, Phone, CheckCircle2 } from "lucide-react";

function RegisterContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Auto-fill form from URL query params if available
    const urlReferralCode = searchParams.get("code");

    const [loading, setLoading] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [error, setError] = useState("");
    const [agent, setAgent] = useState<{ name: string, payment_qr: string | null } | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone_number: "",
        referral_code: urlReferralCode || "",
        sahur_time: "05:00",
    });

    const [baseService, setBaseService] = useState("1_call");
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

    const baseServices = [
        {
            id: '1_call',
            name: '1 Kali Call',
            price: 'RM 3',
            desc: 'Cukup untuk yang senang bangun.',
            icon: Phone,
            color: 'text-slate-400',
        },
        {
            id: '2_call',
            name: '2 Kali Call',
            price: 'RM 6',
            desc: 'Confirm sedar. Jarak 5 minit.',
            icon: CheckCircle2,
            color: 'text-emerald-400',
        }
    ];

    const addons = [
        {
            id: 'mak_mak',
            name: 'Suara Mak-mak',
            price: 'RM 2',
            desc: 'Garang & Efektif.',
            icon: Zap,
            color: 'text-amber-500',
            border: 'border-amber-500/50'
        },
        {
            id: 'manja',
            name: 'Suara Manja',
            price: 'RM 5',
            desc: 'Lembut tapi bangun.',
            icon: Heart,
            color: 'text-pink-400',
            border: 'border-pink-500/50'
        },
        {
            id: 'kaki',
            name: 'Pakej Mintak Kaki',
            price: 'RM 7',
            desc: 'Untuk yang liat bangun.',
            icon: MessageSquare,
            color: 'text-red-500',
            border: 'border-red-500/50'
        }
    ];

    const toggleAddon = (id: string) => {
        if (selectedAddons.includes(id)) {
            setSelectedAddons(selectedAddons.filter(a => a !== id));
        } else {
            setSelectedAddons([...selectedAddons, id]);
        }
    };

    // Update form if URL param changes
    useEffect(() => {
        if (urlReferralCode) {
            setForm(prev => ({ ...prev, referral_code: urlReferralCode }));
        }
    }, [urlReferralCode]);

    // Agent Lookup Effect
    useEffect(() => {
        const lookupAgent = async () => {
            if (form.referral_code.length < 3) {
                setAgent(null);
                return;
            }

            setLookupLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/lookup?referral_code=${form.referral_code}`);
                if (res.ok) {
                    const data = await res.json();
                    setAgent(data);
                    setError("");
                } else {
                    setAgent(null);
                }
            } catch (err) {
                console.error("Lookup failed", err);
                setAgent(null);
            } finally {
                setLookupLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (form.referral_code) lookupAgent();
        }, 500); // Debounce

        return () => clearTimeout(timeoutId);
    }, [form.referral_code]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const packageData = JSON.stringify({
            base: baseService,
            addons: selectedAddons
        });

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/register/member`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ ...form, package: packageData }),
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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12">
            <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2">
                <ArrowLeft size={16} /> Kembali
            </Link>

            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center">
                    <Moon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white font-serif">Saya Nak Dikejutkan</h2>
                    <p className="text-slate-400 mt-2">Pilih pakej, daftar, dan tidur lena.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Base Service Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Phone size={14} /> Pilih Servis Asas
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {baseServices.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        onClick={() => setBaseService(pkg.id)}
                                        className={`cursor-pointer border rounded-xl p-4 transition-all relative overflow-hidden flex items-center gap-4 ${baseService === pkg.id
                                            ? 'border-amber-500 bg-slate-800 ring-1 ring-amber-500/50'
                                            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full ${baseService === pkg.id ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                                            <pkg.icon className={`w-5 h-5 ${pkg.color}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-medium">{pkg.name}</h3>
                                                <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-amber-400">{pkg.price}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-tight mt-1">{pkg.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add-ons Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles size={14} /> Tambah Add-on (Suka-suka)
                            </label>
                            <div className="space-y-3">
                                {addons.map((addon) => (
                                    <div
                                        key={addon.id}
                                        onClick={() => toggleAddon(addon.id)}
                                        className={`cursor-pointer border rounded-xl p-4 transition-all relative overflow-hidden flex items-center justify-between ${selectedAddons.includes(addon.id)
                                            ? `${addon.border} bg-slate-800 ring-1 ring-offset-1 ring-offset-slate-900 ring-amber-500/20`
                                            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${selectedAddons.includes(addon.id) ? 'bg-slate-700' : 'bg-slate-800'}`}>
                                                <addon.icon className={`w-5 h-5 ${addon.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium">{addon.name}</h3>
                                                <p className="text-xs text-slate-400 leading-tight mt-0.5">{addon.desc}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-bold ${selectedAddons.includes(addon.id) ? 'text-amber-400' : 'text-slate-500'}`}>{addon.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                            <div className="space-y-4">
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

                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email (Optional)</label>
                                    <input
                                        type="email"
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                                        placeholder="email@example.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Referral Code (Agent)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 uppercase"
                                        placeholder="CODE"
                                        value={form.referral_code}
                                        onChange={(e) => setForm({ ...form, referral_code: e.target.value.toUpperCase() })}
                                    />
                                    {/* Agent Lookup Result */}
                                    <div className="mt-2 min-h-[20px]">
                                        {lookupLoading && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Checking agent...</span>}
                                        {!lookupLoading && agent && (
                                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                <Sparkles size={12} /> Agent: {agent.name}
                                            </span>
                                        )}
                                        {!lookupLoading && form.referral_code.length >= 3 && !agent && (
                                            <span className="text-xs text-red-400">Agent not found</span>
                                        )}
                                    </div>
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
                        </div>

                        {/* Payment QR Display */}
                        {agent && agent.payment_qr && (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-top-4">
                                <p className="text-sm text-slate-400 mb-4">Scan QR untuk bayar kepada Agent <strong>{agent.name}</strong></p>
                                <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 shadow-xl shadow-black/50">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/storage/${agent.payment_qr}`}
                                        alt="Agent QR"
                                        className="w-72 h-72 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 items-center">
                                    <p className="text-xs text-slate-500 font-mono">Reference: <span className="text-amber-500 font-bold">gerak sahur</span></p>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/storage/${agent.payment_qr}`}
                                        download={`payment-qr-${agent.name}.png`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-amber-500 hover:text-amber-400 underline decoration-dotted underline-offset-4 flex items-center gap-1"
                                    >
                                        <div className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                            Download QR
                                        </div>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Total Price Summary */}
                        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-xl p-4 flex justify-between items-center backdrop-blur-sm">
                            <div>
                                <p className="text-amber-200 text-sm font-medium uppercase tracking-wider">Total Harga</p>
                                <p className="text-amber-500/60 text-xs">Bayar cash/QR kat agent.</p>
                            </div>
                            <div className="text-3xl font-bold text-amber-400 font-mono">
                                RM {(() => {
                                    let total = 0;
                                    // Base
                                    if (baseService === '2_call') total += 6;
                                    else total += 3;

                                    // Add-ons
                                    if (selectedAddons.includes('mak_mak')) total += 2;
                                    if (selectedAddons.includes('manja')) total += 5;
                                    if (selectedAddons.includes('kaki')) total += 7;

                                    return total;
                                })()}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (form.referral_code.length > 0 && !agent)}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Confirm Kejut Aku & Daftar"}
                        </button>
                    </form>
                </div>
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
