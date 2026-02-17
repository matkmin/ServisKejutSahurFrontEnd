"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Loader2, Moon } from "lucide-react";

interface Props {
    savedLocation?: { latitude: number; longitude: number } | null;
}

export default function ImsyakCountdown({ savedLocation }: Props) {
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [locationName, setLocationName] = useState<string>("Detecting Location...");
    const [loading, setLoading] = useState<boolean>(true);
    const [nextPrayer, setNextPrayer] = useState<string>("");

    // Function to save location to DB
    const saveLocationToDB = async (lat: number, long: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/location`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ latitude: lat, longitude: long })
            });
        } catch (error) {
            console.error("Failed to save location", error);
        }
    };

    const requestLocation = () => {
        // 1. Use Saved Location if available
        if (savedLocation?.latitude && savedLocation?.longitude) {
            setLoading(true);
            setLocationName("Loading Saved Location...");
            fetchPrayerTimes(savedLocation.latitude, savedLocation.longitude);
            setLocationName(`Lat: ${savedLocation.latitude.toFixed(2)}, Long: ${savedLocation.longitude.toFixed(2)} (Saved)`);
            return;
        }

        setLoading(true);
        setLocationName("Detecting Location...");

        // Safety timeout: If geolocation takes too long (ignoring browser's own timeout which can be flaky)
        const locationTimer = setTimeout(() => {
            console.warn("Manual geolocation timeout triggered");
            // Fallback to IP Location
            fetchIPLocation();
        }, 11000); // 11s

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(locationTimer);
                    fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
                    setLocationName(`Lat: ${position.coords.latitude.toFixed(2)}, Long: ${position.coords.longitude.toFixed(2)}`);

                    // Auto-save this location
                    saveLocationToDB(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    clearTimeout(locationTimer);
                    console.warn("Geolocation error:", error.message);
                    fetchIPLocation(); // Fallback to IP Location
                },
                { timeout: 10000, maximumAge: 10000 } // 10s
            );
        } else {
            clearTimeout(locationTimer);
            fetchIPLocation(); // Fallback to IP Location
        }
    };

    const fetchIPLocation = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s IP Timeout

        try {
            setLocationName("Locating by IP...");

            // Use our own backend proxy to avoid CORS
            const token = localStorage.getItem("token");
            const headers: any = { "Accept": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8032"}/api/agent/ip-location`, {
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("IP API failed");

            const data = await res.json();

            if (data.latitude && data.longitude) {
                fetchPrayerTimes(data.latitude, data.longitude);
                setLocationName(`${data.city || 'IP Location'}, ${data.country_name || 'MY'}`);

                // Optional: Save this as verified location? maybe not, better to let GPS overwrite it later.
            } else {
                throw new Error("Invalid IP data");
            }
        } catch (error) {
            console.warn("IP Location failed, defaulting to KL (JAKIM)", error);
            await fetchBackupPrayerTimes();
        }
    };

    useEffect(() => {
        requestLocation();
    }, [savedLocation]); // Re-run if savedLocation loads late

    const fetchPrayerTimes = async (lat: number, long: number) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s API Timeout

        try {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1000);

            // Method 11 is JAKIM (Malaysia)
            const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${long}&method=11`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("API request failed");

            const data = await res.json();

            if (data.code === 200) {
                setPrayerTimes(data.data.timings);
                setLoading(false); // Success!
            } else {
                throw new Error("API returned error code");
            }
        } catch (error) {
            console.error("Failed to fetch primary prayer times (Aladhan), trying backup...", error);
            await fetchBackupPrayerTimes();
        }
    };

    const fetchBackupPrayerTimes = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Backup Timeout

        try {
            // WLY01 = Kuala Lumpur, Putrajaya
            const res = await fetch('https://api.waktusolat.app/v2/solat/WLY01', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error("Backup API failed");

            const data = await res.json();

            // WaktuSolat v2 returns "prayerTime": [{ "day": 18, "fajr": 1777..., ... }] (Unix Timestamps)
            const today = new Date();
            const currentDay = today.getDate();

            if (data.prayerTime && Array.isArray(data.prayerTime)) {
                const todayData = data.prayerTime.find((p: any) => p.day === currentDay);

                if (todayData) {
                    // Helper to format timestamp to HH:mm
                    const formatTime = (ts: number) => {
                        const date = new Date(ts * 1000);
                        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    };

                    const fajrTime = formatTime(todayData.fajr);
                    const dhuhrTime = formatTime(todayData.dhuhr);
                    const asrTime = formatTime(todayData.asr);
                    const maghribTime = formatTime(todayData.maghrib);
                    const ishaTime = formatTime(todayData.isha);

                    setPrayerTimes({
                        Imsyak: null, // Let fallback logic handle calculation
                        Fajr: fajrTime,
                        Dhuhr: dhuhrTime,
                        Asr: asrTime,
                        Maghrib: maghribTime,
                        Isha: ishaTime,
                    });
                    setLocationName("Kuala Lumpur (JAKIM)");
                }
            }
        } catch (backupError) {
            console.error("Backup API also failed:", backupError);
            setLocationName("Services Unavailable");
        } finally {
            setLoading(false); // Always stop loading after backup attempt
        }
    };

    useEffect(() => {
        if (!prayerTimes) return;

        const updateTimer = () => {
            const now = new Date();
            const imsyakTime = new Date();

            // Check if Imsyak exists, otherwise use Fajr (Subuh) - 10 mins or just Fajr
            const timeString = prayerTimes.Imsyak || prayerTimes.Fajr;

            if (!timeString) {
                console.warn("No Imsyak or Fajr time found", prayerTimes);
                return;
            }

            const [hours, minutes] = timeString.split(':');
            imsyakTime.setHours(parseInt(hours), parseInt(minutes), 0);

            // If using Fajr as fallback, maybe subtract 10 mins for Imsyak?
            if (!prayerTimes.Imsyak && prayerTimes.Fajr) {
                imsyakTime.setMinutes(imsyakTime.getMinutes() - 10);
            }

            // Calculate formatted Imsyak time for display
            let imsyakDisplay = prayerTimes.Imsyak;

            if (!imsyakDisplay && prayerTimes.Fajr) {
                // Manually subtract 10 minutes from Fajr for display
                const [fHours, fMinutes] = prayerTimes.Fajr.split(':');
                const fDate = new Date();
                fDate.setHours(parseInt(fHours), parseInt(fMinutes), 0);
                fDate.setMinutes(fDate.getMinutes() - 10);

                // Format to HH:mm
                const iHours = fDate.getHours().toString().padStart(2, '0');
                const iMinutes = fDate.getMinutes().toString().padStart(2, '0');
                imsyakDisplay = `${iHours}:${iMinutes}`;
            }

            // If Imsyak passed, show for tomorrow? Or show "Sahur Ended"
            if (now > imsyakTime) {
                setTimeLeft("Sahur Ended");
                setNextPrayer(`Subuh: ${prayerTimes.Fajr}`);
            } else {
                const diff = imsyakTime.getTime() - now.getTime();
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(`${h}h ${m}m ${s}s`);
                setNextPrayer(`Imsyak: ${imsyakDisplay || 'N/A'}`);
            }
        };

        updateTimer(); // Run immediately
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [prayerTimes]);

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <MapPin size={12} />
                        {locationName}
                        {(locationName.includes("Default") || locationName.includes("Error")) && (
                            <button
                                onClick={requestLocation}
                                className="ml-2 text-emerald-500 hover:text-emerald-400 underline decoration-dotted"
                            >
                                Retry
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Moon size={20} className="text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">Waktu Sahur</h3>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                        {timeLeft === "Sahur Ended" ? "Status" : "Tamat Dalam"}
                    </p>
                    <p className={`text-3xl font-mono font-bold ${timeLeft === "Sahur Ended" ? "text-slate-500" : "text-emerald-400"}`}>
                        {timeLeft}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {nextPrayer} | Subuh: {prayerTimes?.Fajr}
                    </p>
                </div>
            </div>
        </div>
    );
}
