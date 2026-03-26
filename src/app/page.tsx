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
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans text-white py-12 px-4 sm:px-6">
      {/* Mesh Gradients & Grid Overlays */}
      <div className="fixed inset-0 bg-technical-grid opacity-20 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-noir-charcoal),_transparent_50%),_radial-gradient(ellipse_at_bottom_left,_rgba(75,0,130,0.12),_transparent_50%)] animate-mesh-pulse" />
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-neon-purple)] opacity-[0.04] blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-[var(--color-neon-cyan)] opacity-[0.03] blur-[150px] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center z-10 gap-10 mt-4 sm:mt-10">
        
        {/* AAA Hero Section */}
        <section className="text-center space-y-4 px-2 relative w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-[var(--color-noir-charcoal)]/60 border border-[var(--color-glass-border)] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-[var(--color-neon-green)] animate-pulse shadow-[0_0_8px_var(--color-neon-green)]" />
              <span className="font-mono text-xs text-gray-400 tracking-widest uppercase">Verified Open Protocol</span>
            </div>
          </div>
          <h1 className="text-6xl sm:text-7xl md:text-[8.5rem] font-black tracking-tighter text-metallic drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] pb-2 leading-none uppercase">
            LASTBUYER
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 font-sans text-sm sm:text-lg leading-relaxed mix-blend-screen opacity-90 font-medium">
            Buy to reset the 3-minute timer. The last buyer when the timer hits zero takes the entire decentralized prize pool.
          </p>
          <div className="mt-8 flex justify-center">
            <span className="text-[var(--color-neon-cyan)] font-mono text-xs sm:text-sm tracking-[0.3em] font-bold opacity-80 drop-shadow-[0_0_5px_var(--color-neon-cyan)]">
              LASTBUYERSOL.FUN
            </span>
          </div>
        </section>

        {/* Main Game Card (Fintech Jewel) */}
        <section className={`glass-panel-2 w-full sm:w-[540px] p-8 sm:p-10 flex flex-col items-center gap-8 relative transition-all duration-700 mt-6 ${isLowTime && isActive ? 'shadow-[0_15px_50px_-5px_rgba(255,0,60,0.2)] border-[var(--color-neon-crimson)]/30' : 'hover:shadow-[0_15px_50px_-5px_rgba(0,0,0,0.9)]'}`}>
          
          {isActive ? (
            <>
              {/* Prize Pool */}
              <div className="text-center space-y-2 w-full">
                <h2 className="text-gray-400 font-sans text-xs sm:text-sm md:text-[13px] uppercase tracking-[0.3em] font-bold mb-3">Accumulated Creator Fee</h2>
                <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-neon-gold)] to-[#b07b00] drop-shadow-[0_0_15px_rgba(255,170,0,0.3)] tabular-nums tracking-tight">
                  {prizePool.toFixed(2)} <span className="text-2xl sm:text-3xl font-bold text-gray-500 bg-clip-text text-transparent bg-gradient-to-t from-gray-500 to-gray-400">SOL</span>
                </div>
                <div className="text-gray-500 font-mono text-xs sm:text-sm font-medium pt-2 opacity-70">≈ ${(prizePool * 185).toFixed(2)} USD</div>
              </div>

              {/* Countdown Timer */}
              <div className={`w-full py-8 sm:py-10 rounded-2xl flex justify-center items-center relative overflow-hidden transition-all duration-500 ${isLowTime ? 'bg-[var(--color-noir-midnight)]/80 shadow-[inset_0_0_60px_rgba(255,0,60,0.15)] border border-[var(--color-neon-crimson)]/30' : 'bg-black/50 border border-[var(--color-glass-border)] shadow-inner'}`}>
                <div className={`font-mono text-7xl sm:text-8xl md:text-[5.5rem] font-black tracking-widest tabular-nums z-10 leading-none ${isLowTime ? 'animate-crimson-pulse' : 'text-gray-100 drop-shadow-[0_2px_15px_rgba(0,0,0,1)]'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Current King (VIP Display) */}
              <div className="flex flex-col items-center gap-4 w-full pt-4">
                <div className="flex items-center gap-3 text-[var(--color-neon-gold)] opacity-90">
                  <div className="p-1.5 bg-[var(--color-neon-gold)]/10 rounded-md border border-[var(--color-neon-gold)]/30 shadow-[0_0_10px_rgba(255,170,0,0.2)]">
                    <Crown size={16} className="fill-[var(--color-neon-gold)]/40" />
                  </div>
                  <span className="text-xs sm:text-sm font-sans uppercase tracking-[0.3em] font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-neon-gold)] to-yellow-200">Current King</span>
                  <div className="p-1.5 bg-[var(--color-neon-gold)]/10 rounded-md border border-[var(--color-neon-gold)]/30 shadow-[0_0_10px_rgba(255,170,0,0.2)]">
                    <Crown size={16} className="fill-[var(--color-neon-gold)]/40" />
                  </div>
                </div>
                <div className="w-full bg-gradient-to-r from-transparent via-[var(--color-neon-gold)]/20 to-transparent p-[1px] rounded-full mt-1">
                  <div className="bg-[#0b0f19]/90 backdrop-blur-md px-4 py-3 sm:px-8 sm:py-3.5 rounded-full w-full flex justify-center text-center inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                    <span className="font-mono font-bold text-sm sm:text-base md:text-lg tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 truncate w-full">{currentKing}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full py-8 sm:py-10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden gap-8">
              <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-black/80 z-0 pointer-events-none rounded-3xl" />
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ff3333] to-[#880000] drop-shadow-[0_0_20px_rgba(255,50,50,0.6)] animate-pulse z-10 leading-tight">
                GAME OVER
              </div>
              
              <div className="flex flex-col items-center gap-3 bg-[var(--color-neon-gold)]/5 px-6 py-5 rounded-2xl border border-[var(--color-neon-gold)]/20 shadow-[0_0_30px_rgba(255,170,0,0.1)] w-full text-center z-10 backdrop-blur-md mt-2">
                <div className="text-[var(--color-neon-gold)] font-sans text-xs sm:text-xs md:text-sm uppercase tracking-[0.3em] font-black drop-shadow-[0_0_8px_rgba(255,170,0,0.4)] flex items-center gap-3">
                  <div className="p-1 bg-[var(--color-neon-gold)]/10 rounded border border-[var(--color-neon-gold)]/30"><Crown size={14} className="fill-[var(--color-neon-gold)]/30" /></div>
                  THE FINAL KING
                  <div className="p-1 bg-[var(--color-neon-gold)]/10 rounded border border-[var(--color-neon-gold)]/30"><Crown size={14} className="fill-[var(--color-neon-gold)]/30" /></div>
                </div>
                <div className="font-mono font-black text-sm sm:text-base md:text-lg tracking-widest text-[#f1f3f5] truncate w-full block mt-2">
                  {currentKing}
                </div>
              </div>

              <div className="text-[var(--color-neon-green)] font-sans text-xl sm:text-2xl font-black drop-shadow-[0_0_15px_rgba(0,255,136,0.4)] mt-2 z-10 border-b border-[var(--color-neon-green)]/20 pb-4 w-3/4 text-center">
                +{prizePool.toFixed(2)} SOL
              </div>

              <div className="text-gray-500 font-sans text-xs sm:text-sm font-bold tracking-[0.3em] uppercase mt-2 animate-pulse z-10">
                AWAITING NEW SEASON...
              </div>
            </div>
          )}

          {/* Safe Box CA Location */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 bg-[#050814]/90 px-5 py-4 rounded-xl border border-[var(--color-glass-border)] w-full justify-between shadow-inner relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-neon-cyan)]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
             <span className="text-gray-500 text-xs sm:text-xs font-sans uppercase tracking-[0.2em] font-bold flex items-center gap-2">
               <ShieldCheck size={16} className="text-[var(--color-neon-cyan)]/70" />
               Official CA
             </span>
             <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
               <code className="text-gray-300 text-xs sm:text-sm font-mono tracking-widest font-medium opacity-90">
                 {contractAddress.substring(0,6)}...{contractAddress.substring(contractAddress.length-6)}
               </code>
               <button 
                 onClick={handleCopy}
                 className="bg-[#12151e] border border-[var(--color-glass-border)] hover:border-[var(--color-neon-cyan)]/50 hover:bg-[var(--color-neon-cyan)]/10 p-2 rounded-lg transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
                 aria-label="Copy CA"
               >
                 {copied ? <Check size={16} className="text-[var(--color-neon-green)] drop-shadow-[0_0_5px_rgba(0,255,136,0.6)]" /> : <Copy size={16} className="text-gray-400 group-hover:text-gray-200 transition-colors" />}
               </button>
             </div>
          </div>
        </section>

        {/* Call to Action */}
        {isActive && (
          <button className="mt-4 mb-4 relative group overflow-hidden bg-transparent border-0 cursor-pointer active:scale-[0.98] transition-all duration-300 rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-cyan)] opacity-80 blur-md group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
            <div className="relative bg-[#050814] border border-[var(--color-glass-border)] group-hover:border-[var(--color-neon-cyan)]/50 text-[#f1f3f5] font-bold font-sans text-lg sm:text-xl py-4 px-10 rounded-full flex items-center gap-4 shadow-xl z-10 transition-colors duration-300">
              <span className="tracking-wide">Buy on Pump.fun</span>
              <ExternalLink size={20} className="text-[var(--color-neon-cyan)]" />
            </div>
          </button>
        )}

        {/* AAA Info Section & Trust Badges */}
        <section className="w-full max-w-5xl mt-12 flex flex-col items-center gap-10 z-10 mb-16">
          <div className="flex items-center gap-4 w-full px-6 opacity-60">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[var(--color-glass-border)]" />
            <h3 className="text-gray-400 font-sans text-xs sm:text-xs uppercase tracking-[0.4em] font-bold">Protocol Mechanics</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[var(--color-glass-border)]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 sm:px-2">
            {/* Card 1 */}
            <div className="glass-panel-2 p-8 flex flex-col items-start gap-5 hover:-translate-y-1 transition-transform duration-300 group">
              <div className="bg-[#12151e] border border-[var(--color-neon-green)]/20 p-3.5 rounded-xl shadow-[inset_0_0_20px_rgba(0,255,136,0.05)] group-hover:border-[var(--color-neon-green)]/40 transition-colors">
                <Coins size={28} className="text-[var(--color-neon-green)] opacity-90" />
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-200 font-bold font-sans text-xl tracking-wide">Real SOL Yield</h4>
                <p className="text-gray-500 font-sans text-sm leading-relaxed font-medium">
                  The Pump.fun creator fee is automatically routed and accumulated in this vault as pristine SOL.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="glass-panel-2 p-8 flex flex-col items-start gap-5 hover:-translate-y-1 transition-transform duration-300 group">
              <div className="bg-[#12151e] border border-[var(--color-neon-cyan)]/20 p-3.5 rounded-xl shadow-[inset_0_0_20px_rgba(0,229,255,0.05)] group-hover:border-[var(--color-neon-cyan)]/40 transition-colors">
                <Timer size={28} className="text-[var(--color-neon-cyan)] opacity-90" />
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-200 font-bold font-sans text-xl tracking-wide">Tension Timer</h4>
                <p className="text-gray-500 font-sans text-sm leading-relaxed font-medium">
                  Every 0.5+ SOL buy makes you the King and resets the countdown precisely to 3 minutes.
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="glass-panel-2 p-8 flex flex-col items-start gap-5 hover:-translate-y-1 transition-transform duration-300 group">
              <div className="bg-[#12151e] border border-[var(--color-neon-purple)]/20 p-3.5 rounded-xl shadow-[inset_0_0_20px_rgba(122,0,255,0.05)] group-hover:border-[var(--color-neon-purple)]/40 transition-colors">
                <Trophy size={28} className="text-[var(--color-neon-purple)] opacity-90" />
              </div>
              <div className="space-y-2">
                <h4 className="text-gray-200 font-bold font-sans text-xl tracking-wide">Winner Takes All</h4>
                <p className="text-gray-500 font-sans text-sm leading-relaxed font-medium">
                  When the clock hits zero, the vault entirely drains to the wallet of the final King standing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-6 opacity-50 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-gray-400">
              <CheckCircle2 size={14} className="text-gray-500" /> AUDITED PROTOCOL
            </div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-gray-400">
              <Lock size={14} className="text-gray-500" /> IMMUTABLE CODE
            </div>
          </div>
        </section>

      </main>
      
      {/* Footer minimal */}
      <footer className="w-full text-center p-6 text-gray-600 font-mono text-xs z-10 mt-auto opacity-70 hover:opacity-100 transition-opacity tracking-widest uppercase">
        &copy; {new Date().getFullYear()} LASTBUYER PROTOCOL. DELETED BY DAWN.
      </footer>
    </div>
  );
}
