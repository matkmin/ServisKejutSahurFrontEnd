"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, AlarmClock, Star, ArrowRight, Sparkles, CloudMoon, Coffee, Music, Zap, Phone } from "lucide-react";

export default function Home() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'agent') {
          // Optional: verify token validity with API here if needed, but for speed we redirect
          window.location.href = "/dashboard/agent";
          return;
        }
      } catch (e) {
        localStorage.clear();
      }
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8032'}/api/public/stats`)
      .then(res => res.json())
      .then(data => setTotalUsers(data.total_users))
      .catch(err => console.error("Failed to load stats", err));
  }, []);

  return (
    <main className="relative min-h-screen bg-[#0f0518] text-white selection:bg-amber-500/30 font-sans overflow-x-hidden">

      {/* --- Background Atmosphere --- */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.03] mix-blend-screen" />

        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] right-[-20%] h-[600px] w-[600px] rounded-full bg-amber-600/10 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 py-12 md:py-20 mx-auto max-w-7xl">

        {/* --- Header / Nav --- */}
        <nav className="flex justify-between items-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl rotate-3 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Moon className="text-white fill-white" size={20} />
            </div>
            <span className="text-xl font-bold font-serif tracking-tight">Kejut<span className="text-amber-500">Sahur</span></span>
          </div>

          <Link href="/login" className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium backdrop-blur-sm">
            Login Agent
          </Link>
        </nav>

        {/* --- Hero Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
          <div className="lg:col-span-7 text-center lg:text-left animate-in slide-in-from-left-8 duration-1000 delay-100">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Sparkles size={12} className="text-amber-400" /> Edisi Ramadan 1447H
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif leading-[1.1] mb-8">
              Bangun <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                Tanpa Terlepas.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
              Sistem kejut sahur <span className="text-white font-semibold">paling moden</span>.
              Daftar member, set masa, dan kami pastikan tiada siapa yang "tak bersahur bulan puasa".
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register/agent" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-indigo-950 font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3">
                <AlarmClock size={20} /> Jadi Pengejut
              </Link>
              <Link href="/register/member" className="px-8 py-4 bg-indigo-900/50 hover:bg-indigo-800/50 text-white font-bold rounded-2xl border border-indigo-700/50 transition-all hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-3">
                <Moon size={20} /> Nak Dikejutkan
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative animate-in zoom-in-50 duration-1000 delay-300">
            {/* Abstract Hero Visualization */}
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-purple-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
              <div className="absolute inset-10 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-20 border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>

              {/* Floating Card Simulation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-indigo-950/80 backdrop-blur-xl border border-indigo-700/50 rounded-3xl p-6 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-500 cursor-pointer group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Phone size={20} /></div>
                  <div>
                    <div className="h-2 w-20 bg-slate-700 rounded mb-1"></div>
                    <div className="h-2 w-12 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-16 w-full bg-indigo-900/50 rounded-xl border border-indigo-800 flex items-center justify-center text-amber-500 font-mono text-2xl group-hover:scale-105 transition-transform">
                    05:00 AM
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded"></div>
                  <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                  <div className="mt-4 inline-block px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">Incoming Call...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Bento Grid Features/Pricing --- */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-16">
            Pakej <span className="text-amber-500">Ramadan</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">

            {/* Large Featured Card */}
            <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 relative overflow-hidden group border border-white/5 hover:border-amber-500/30 transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                <AlarmClock size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mb-4 text-indigo-950">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Servis Asas</h3>
                  <p className="text-indigo-200">Kejut bangun sahur standard. Confirm sedar.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <span>1 Kali Call</span>
                    <span className="font-bold text-amber-400">RM 3</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                    <span>2 Kali Call</span>
                    <span className="font-bold text-amber-400">RM 6</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-on 1 */}
            <div className="bg-[#1a103c] rounded-3xl p-6 border border-white/5 hover:bg-[#231555] transition-colors flex flex-col justify-between group">
              <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">Suara Mak-mak</h4>
                <p className="text-xs text-slate-400 mt-1">Garang & Efektif.</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">RM 2</span>
              </div>
            </div>

            {/* Add-on 2 */}
            <div className="bg-[#1a103c] rounded-3xl p-6 border border-white/5 hover:bg-[#231555] transition-colors flex flex-col justify-between group">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Music size={20} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">Suara Manja</h4>
                <p className="text-xs text-slate-400 mt-1">Lembut tapi bangun.</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-white">RM 5</span>
              </div>
            </div>

            {/* Add-on 3 (Wide) */}
            <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 border border-white/5 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <h4 className="font-bold text-xl text-white">Pakej "Mintak Maki"</h4>
                </div>
                <p className="text-sm text-slate-400 max-w-xs">Untuk yang betul-betul liat. Kami tak tanggungjawab kalau gaduh.</p>
              </div>
              <div className="relative z-10 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xl shadow-lg shadow-red-900/50">
                RM 7
              </div>
            </div>

            {/* Filler / Decorative */}
            <div className="bg-amber-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-indigo-950">
              <Coffee size={32} className="mb-2" />
              <span className="font-bold leading-tight">Jangan<br />Skip<br />Sahur!</span>
            </div>

          </div>
        </div>

        {/* Sedekah / Support Section */}
        <section className="mt-24 mb-24 text-center space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm mx-auto">
              <h3 className="text-xl font-bold text-white font-serif mb-2">Support Developer</h3>
              <p className="text-slate-400 text-sm mb-6">Nak bagi duit raya atau sedekah? Scan QR ni. Moga murah rezeki!</p>

              <div className="bg-white p-4 rounded-xl mb-4">
                <img src="/qr-sedekah.png" alt="QR Sedekah" className="w-full h-auto rounded-lg" />
              </div>

              <p className="text-xs text-slate-500 font-mono">GXBank</p>
            </div>
          </div>
        </section>

        {/* --- Footer --- */}
        <footer className="mt-24 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm p-8 flex flex-col items-center gap-6">
          <div className="flex justify-between items-center w-full max-w-4xl mx-auto flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 opacity-50">
              <Moon size={16} /> <span className="font-serif font-bold">KejutSahur</span>
            </div>

            {/* Total User Stat */}
            {totalUsers !== null && (
              <div className="bg-slate-800/50 border border-slate-700 px-4 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs text-slate-300 font-mono">
                  <span className="font-bold text-white">{totalUsers}</span> Orang Sedia Dikejut
                </span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-sm">
                &copy; 1447H / 2026M
              </p>
            </div>
          </div>

          {/* Terms & Conditions / Disclaimer */}
          <div className="max-w-2xl text-center border-t border-white/5 pt-6">
            <p className="text-[10px] text-slate-600 leading-relaxed uppercase tracking-widest font-bold mb-2">Penafian & Terma (TNC)</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Servis Kejut Sahur adalah inisiatif komuniti sukarela. Pihak pembangun & agent <strong>tidak bertanggungjawab</strong> atas sebarang kegagalan bangun sahur, terlepas waktu imsyak, atau sebarang kerugian yang timbul akibat penggunaan sistem ini. <br />
              Gunakan sebagai ikhtiar tambahan sahaja. Sila pasang alarm sendiri sebagai langkah berjaga-jaga utama. Tidur awal itu sunnah.
            </p>
          </div>
        </footer>


      </div >
    </main >
  );
}
