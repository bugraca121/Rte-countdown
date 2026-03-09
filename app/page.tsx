"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
    const [timeLeft, setTimeLeft] = useState({ years: '00', days: '000', hours: '00', minutes: '00', seconds: '00' });
    const [progress, setProgress] = useState("0.000000%");
    const [progressWidth, setProgressWidth] = useState("0%");
    const [isFinished, setIsFinished] = useState(false);
    
    // Petition State
    const [signatures, setSignatures] = useState<any[]>([]);
    const [totalSignatures, setTotalSignatures] = useState(0);
    const [nameVal, setNameVal] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    
    useEffect(() => {
        const startDate = new Date('May 28, 2023 00:00:00').getTime();
        const endDate = new Date('May 14, 2028 23:59:59').getTime();
        const totalDuration = endDate - startDate;

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endDate - now;

            if (distance < 0) {
                setIsFinished(true);
                setTimeLeft({ years: '00', days: '000', hours: '00', minutes: '00', seconds: '00' });
                setProgress("100.000000%");
                setProgressWidth("100%");
                return;
            }

            let totalRemainingDays = Math.floor(distance / (1000 * 60 * 60 * 24));
            const y = Math.floor(totalRemainingDays / 365);
            const d = totalRemainingDays % 365;
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                years: String(y).padStart(2, '0'),
                days: String(d).padStart(3, '0'),
                hours: String(h).padStart(2, '0'),
                minutes: String(m).padStart(2, '0'),
                seconds: String(s).padStart(2, '0')
            });

            const elapsed = now - startDate;
            let prg = (elapsed / totalDuration) * 100;
            if (prg < 0) prg = 0;
            if (prg > 100) prg = 100;

            setProgressWidth(`${prg}%`);
            setProgress(`${prg.toFixed(6)}%`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 50);
        return () => clearInterval(interval);
    }, []);

    const fetchSignatures = async () => {
        try {
            const { count, error: countError } = await supabase
                .from('signatures')
                .select('*', { count: 'exact', head: true });
                
            if (countError) throw countError;
            setTotalSignatures(count || 0);

            const { data, error: listError } = await supabase
                .from('signatures')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (listError) throw listError;
            setSignatures(data || []);
        } catch (error) {
            console.error('İmzalar yüklenirken hata:', error);
        }
    };

    useEffect(() => {
        fetchSignatures();
        const interval = setInterval(fetchSignatures, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSign = async (e: React.FormEvent) => {
        e.preventDefault();
        const tName = nameVal.trim();
        if (!tName) return;

        setIsSubmitting(true);
        setSubmitStatus("idle");

        try {
            const { error } = await supabase
                .from('signatures')
                .insert([{ name: tName }]);

            if (!error) {
                setNameVal("");
                setSubmitStatus("success");
                fetchSignatures();
                setTimeout(() => setSubmitStatus("idle"), 2000);
            } else {
                setSubmitStatus("error");
                setTimeout(() => setSubmitStatus("idle"), 2000);
            }
        } catch (error) {
            setSubmitStatus("error");
            setTimeout(() => setSubmitStatus("idle"), 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    function formatTimeAgo(timestamp: number) {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        if (seconds < 60) return `${seconds} saniye önce`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} dakika önce`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} saat önce`;
        const days = Math.floor(hours / 24);
        return `${days} gün önce`;
    }

    let btnText = "İmzala";
    if (isSubmitting) btnText = "⏳ Gönderiliyor...";
    if (submitStatus === "success") btnText = "✅ İmzalandı";
    if (submitStatus === "error") btnText = "❌ Hata!";

    return (
        <>
            <div className="background-animation"></div>
            <div className="layout-wrapper">
                <main className="container main-container">
                    <header>
                        <div className="glow-orb"></div>
                        <h1>{isFinished ? "Vakit Tamamlandı" : "Büyük Değişime Kalan Süre"}</h1>
                        <p>14 Mayıs 2028 Cumhurbaşkanlığı Seçimleri</p>
                    </header>
                    <div className="glass-panel">
                        <div className="countdown-wrapper">
                            <div className="time-block">
                                <span className="number" id="years">{timeLeft.years}</span>
                                <span className="label">YIL</span>
                            </div>
                            <div className="separator">:</div>
                            <div className="time-block">
                                <span className="number" id="days">{timeLeft.days}</span>
                                <span className="label">GÜN</span>
                            </div>
                            <div className="separator">:</div>
                            <div className="time-block">
                                <span className="number" id="hours">{timeLeft.hours}</span>
                                <span className="label">SAAT</span>
                            </div>
                            <div className="separator">:</div>
                            <div className="time-block">
                                <span className="number" id="minutes">{timeLeft.minutes}</span>
                                <span className="label">DAKİKA</span>
                            </div>
                            <div className="separator">:</div>
                            <div className="time-block">
                                <span className="number" id="seconds">{timeLeft.seconds}</span>
                                <span className="label">SANİYE</span>
                            </div>
                        </div>
                        <div className="progress-wrapper">
                            <div className="progress-labels top-labels">
                                <span>28 Mayıs 2023</span>
                                <span>14 Mayıs 2028</span>
                            </div>
                            <div className="progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: progressWidth }}></div>
                                </div>
                            </div>
                            <div className="progress-labels bottom-labels">
                                <span>{progress}</span>
                            </div>
                        </div>
                    </div>
                    <footer>
                        <p>Adil, özgür ve demokratik bir gelecek için geri sayım.</p>
                    </footer>
                </main>

                <aside className="petition-container glass-panel">
                    <div className="petition-header">
                        <h2>🖋️ Hükümet İstifa</h2>
                        <p>Erken seçim ve istifa talebinizi imzalayın.</p>
                    </div>
                    <div className="signature-stats">
                        <span className="stat-number">{new Intl.NumberFormat('tr-TR').format(totalSignatures)}</span>
                        <span className="stat-label">Vatandaş İmzaladı</span>
                    </div>
                    <form className="signature-form" onSubmit={handleSign}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                placeholder="İsim veya Nickname" 
                                required 
                                autoComplete="off" 
                                maxLength={40}
                                value={nameVal}
                                onChange={e => setNameVal(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="sign-btn" 
                            disabled={isSubmitting}
                            style={{ background: submitStatus === "success" ? 'linear-gradient(135deg, #10b981, #059669)' : undefined }}
                        >
                            <span className="btn-text">{btnText}</span>
                            <div className="btn-glow"></div>
                        </button>
                    </form>
                    <div className="recent-signatures">
                        <h3>Son İmzalayanlar</h3>
                        <ul className="signatures-list">
                            {signatures.map(sig => (
                                <li className="signature-item" key={sig.id || sig.created_at}>
                                    <span className="sig-name">{sig.name}</span>
                                    <span className="sig-time">{formatTimeAgo(new Date(sig.created_at).getTime())}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>

            <section className="wiki-section">
                <a href="https://tr.wikipedia.org/wiki/Recep_Tayyip_Erdo%C4%9Fan" target="_blank" className="silhouette-link">
                    <img src="/erdogan.png" alt="Recep Tayyip Erdoğan Silüeti" className="silhouette-img" />
                </a>
                <h3 className="wiki-title">Neden mi istifa?</h3>
            </section>
        </>
    );
}
