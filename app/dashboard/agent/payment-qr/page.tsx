"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Upload, Loader2, Check, AlertCircle } from "lucide-react";

export default function PaymentQrPage() {
    const [user, setUser] = useState<any>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (parsedUser.payment_qr) {
                setPreview(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/storage/${parsedUser.payment_qr}`);
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('payment_qr', file);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/upload-qr`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'QR Code uploaded successfully!' });
                // Update local user data
                const updatedUser = { ...user, payment_qr: data.payment_qr };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setMessage({ type: 'error', text: data.message || 'Upload failed' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Something went wrong.' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your payment QR?")) return;

        setUploading(true);
        setMessage(null);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/upload-qr`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'QR Code deleted successfully!' });
                setPreview(null);
                // Update local user data
                const updatedUser = { ...user, payment_qr: null };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setMessage({ type: 'error', text: data.message || 'Delete failed' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Something went wrong.' });
        } finally {
            setUploading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white font-serif mb-2 flex items-center gap-3">
                    <QrCode className="text-emerald-500" /> Payment QR
                </h1>
                <p className="text-slate-400">Upload QR Code TNG/DuitNow anda untuk memudahkan member bayar servis.</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
                <div className="relative w-64 h-64 mx-auto bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center overflow-hidden group">
                    {preview ? (
                        <img src={preview} alt="Payment QR" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-slate-600 flex flex-col items-center">
                            <QrCode size={48} className="mb-2 opacity-50" />
                            <p>No QR Code</p>
                        </div>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 justify-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-center">
                        <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <Upload size={18} />
                            {uploading ? 'Uploading...' : 'Upload New QR'}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </label>
                    </div>

                    {preview && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleDelete}
                                disabled={uploading}
                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center gap-1"
                            >
                                Remove QR Code
                            </button>
                        </div>
                    )}

                    <p className="text-xs text-slate-500">Supported formats: JPG, PNG, SVG (Max 2MB)</p>
                </div>
            </div>
        </div>
    );
}
