"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Crown, Coins, Timer, Trophy, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Assume environment variables are provided)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(168); // Defaults to 02:48
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [contractAddress, setContractAddress] = useState("PumpFunContract1234567890abcdef");
  const [prizePool, setPrizePool] = useState(12.45);
  const [currentKing, setCurrentKing] = useState("71ADK...xYz9");
  const [isActive, setIsActive] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateRemainingSeconds = (endsAtMs: number) => {
    const now = new Date().getTime();
    return Math.max(0, Math.floor((endsAtMs - now) / 1000));
  };

  // Fetch initial state & subscribe to DB changes
  useEffect(() => {
    const fetchGameState = async () => {
      const { data, error } = await supabase
        .from("game_state")
        .select("*")
        .eq("id", 1)
        .single();
      
      if (data && !error) {
        if (data.current_king) setCurrentKing(data.current_king);
        if (data.prize_pool !== undefined) setPrizePool(data.prize_pool);
        if (data.contract_address) setContractAddress(data.contract_address);
        if (data.is_active !== undefined) setIsActive(data.is_active);
        
        if (data.timer_ends_at) {
          const endsAtMs = new Date(data.timer_ends_at).getTime();
          setTimerEndsAt(endsAtMs);
          setTimeLeft(calculateRemainingSeconds(endsAtMs));
        }
      }
    };

    fetchGameState();

    const channel = supabase
      .channel("game_state_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_state",
        },
        (payload) => {
          const newData = payload.new;
          if (newData.id === 1) {
            if (newData.current_king) setCurrentKing(newData.current_king);
            if (newData.prize_pool !== undefined) setPrizePool(newData.prize_pool);
            if (newData.contract_address) setContractAddress(newData.contract_address);
            if (newData.is_active !== undefined) setIsActive(newData.is_active);
            
            if (newData.timer_ends_at) {
              const endsAtMs = new Date(newData.timer_ends_at).getTime();
              setTimerEndsAt(endsAtMs);
              setTimeLeft(calculateRemainingSeconds(endsAtMs));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update timer every second based on `timerEndsAt`
  useEffect(() => {
    if (!timerEndsAt) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingSeconds(timerEndsAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [timerEndsAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime = timeLeft <= 30 && timeLeft > 0;

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans text-gray-200 py-12 px-4 sm:px-8 bg-[#030303] selection:bg-white/20">
      
      {/* BACKGROUND (The part the user liked) - Subtle neon blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-neon-purple)] mix-blend-screen opacity-[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-neon-cyan)] mix-blend-screen opacity-[0.07] blur-[120px] pointer-events-none" />
      
      {/* Vercel-style micro-dot grid for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1000px] flex flex-col items-center z-10 gap-16 mt-8 sm:mt-16">
        
        {/* HERO SECTION - Minimal & Elegant */}
        <section className="text-center space-y-6 flex flex-col items-center w-full">
          <div className="px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md flex items-center gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-[0.2em] uppercase font-medium">Verified Protocol</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 leading-[1.1] pb-2 drop-shadow-sm">
            LASTBUYER
          </h1>
          
          <p className="text-gray-400/80 text-sm sm:text-base max-w-lg mt-2 font-medium tracking-wide leading-relaxed">
            Satın al, 3 dakikalık süreyi sıfırla. Süre dolduğunda son alım yapan kişi havuzdaki tüm ödülü alır.
          </p>
        </section>

        {/* MAIN GAME CARD - "The Titanium Wallet" */}
        <section className="w-full sm:w-[520px] rounded-3xl p-[1px] bg-gradient-to-b from-white/[0.12] to-white/[0.02] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8)] transition-all duration-700">
          <div className="bg-[#080808]/90 backdrop-blur-2xl rounded-[23px] p-8 sm:p-10 flex flex-col items-center gap-10 w-full h-full relative overflow-hidden">
            
            {/* Subtle inner top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {isActive ? (
              <>
                {/* Prize Pool Display */}
                <div className="w-full flex justify-between items-center bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-5 shadow-inner">
                  <span className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2">
                    <Trophy size={14} className="text-gray-500" /> Ödül Havuzu
                  </span>
                  <div className="text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-baseline gap-1.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    {prizePool.toFixed(2)}
                    <span className="text-base sm:text-lg text-gray-500 font-medium pt-1">SOL</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                {/* High-End Precision Timer */}
                <div className={`w-full flex justify-center py-4 ${isLowTime ? 'animate-pulse' : ''}`}>
                  <div className={`font-mono text-6xl sm:text-7xl font-light tracking-tight tabular-nums ${isLowTime ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]' : 'text-gray-200'}`}>
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Current King Tag */}
                <div className="w-full flex-col flex items-center gap-3">
                  <span className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-medium flex items-center gap-2">
                    <Crown size={12} className="text-gray-400" />
                    Aktif Kral
                  </span>
                  <div className="px-5 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] w-full flex justify-center shadow-inner">
                    <span className="font-mono text-sm tracking-widest text-gray-300 truncate">{currentKing}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full py-8 flex flex-col items-center gap-8 relative">
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-red-400/80 text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Oyun Tamamlandı</div>
                  <div className="text-4xl sm:text-5xl font-medium tracking-tighter text-white">
                    GAME OVER
                  </div>
                </div>
                
                <div className="w-full flex flex-col items-center gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
                  <span className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-medium">KAZANAN CÜZDAN</span>
                  <div className="font-mono text-base tracking-widest text-white truncate w-full text-center">
                    {currentKing}
                  </div>
                  <div className="text-gray-400 mt-2 text-sm flex items-center gap-2">
                    <Trophy size={14} className="text-gray-500" /> +{prizePool.toFixed(2)} SOL
                  </div>
                </div>

                <div className="text-gray-500 text-[10px] font-medium tracking-[0.3em] uppercase mt-4">
                  Yeni Sezon Bekleniyor
                </div>
              </div>
            )}

            {/* Smart Contract CA */}
            <div className="w-full mt-2 pt-6 border-t border-white/[0.06] flex items-center justify-between group">
              <span className="text-gray-600 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium whitespace-nowrap hidden sm:block">CA</span>
              <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                <code className="text-gray-400 text-[10px] sm:text-xs font-mono tracking-widest break-all truncate">
                  {contractAddress}
                </code>
                <button 
                  onClick={handleCopy} 
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer rounded-md p-1 hover:bg-white/5"
                  aria-label="Copy CA"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Info Grid - Linear App Style */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-2 mt-4">
          <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col gap-4">
            <div className="w-8 h-8 rounded-full border border-white/[0.1] flex items-center justify-center bg-black">
              <Coins size={14} className="text-gray-300" />
            </div>
            <h4 className="text-gray-200 font-medium text-sm">Gerçek SOL Ödülü</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Pump.fun yaratıcı ücretleri bu kasada otomatik olarak SOL cinsinden birikir.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col gap-4">
            <div className="w-8 h-8 rounded-full border border-white/[0.1] flex items-center justify-center bg-black">
              <Timer size={14} className="text-gray-300" />
            </div>
            <h4 className="text-gray-200 font-medium text-sm">Adil Sistem</h4>
            <p className="text-gray-500 text-xs leading-relaxed">0.5+ SOL alım yaptığınız an Kral olur ve sayacı 3 dakikaya eşitlersiniz.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col gap-4">
            <div className="w-8 h-8 rounded-full border border-white/[0.1] flex items-center justify-center bg-black">
              <Trophy size={14} className="text-gray-300" />
            </div>
            <h4 className="text-gray-200 font-medium text-sm">Efsanevi Kazanç</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Süre sona erdiğinde havuzdaki bütün SOL doğrudan son Kral'a aktarılır.</p>
          </div>
        </section>

        {/* Minimalist CTA */}
        {isActive && (
          <a 
            href={`https://pump.fun/coin/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 mb-20 px-8 py-3.5 rounded-full bg-white text-black font-medium text-sm sm:text-base flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] no-underline cursor-pointer"
          >
            Pump.fun'da Satın Al
            <ExternalLink size={16} className="text-gray-500 group-hover:text-black transition-colors" />
          </a>
        )}

      </main>
      
      {/* Minimal Footer */}
      <footer className="w-full text-center p-6 text-gray-600 text-[10px] uppercase tracking-[0.3em] font-medium mt-auto border-t border-white/[0.03]">
        LASTBUYER &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
