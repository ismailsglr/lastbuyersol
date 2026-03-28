"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Crown, Coins, Timer, Trophy } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Easing for premium feel
const premiumEase = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1, ease: premiumEase } 
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: premiumEase } 
  }
};

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Defaults to 01:00
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

  const minutesStr = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secondsStr = (timeLeft % 60).toString().padStart(2, "0");
  const isLowTime = isActive && timeLeft <= 30 && timeLeft > 0;

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden font-sans text-gray-200 pt-6 pb-12 px-4 sm:px-8 bg-[#030303] selection:bg-white/20">
      
      {/* YOUTUBE BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/O5KoU0w5_ak?autoplay=1&mute=1&loop=1&playlist=O5KoU0w5_ak&controls=0&showinfo=0&rel=0&iv_load_policy=3&fs=0&disablekb=1"
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-40 pointer-events-none mix-blend-screen"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      
      {/* DARK OVERLAY FOR READABILITY */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none mix-blend-multiply" />

      {/* BACKGROUND Blobs */}
      <div className="absolute top-[-10%] z-0 left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-neon-purple)] mix-blend-screen opacity-[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] z-0 right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-neon-cyan)] mix-blend-screen opacity-[0.05] blur-[120px] pointer-events-none" />
      
      {/* Vercel-style micro-dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] z-0 pointer-events-none" />

      {/* Main Container with Stagger Animation */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 w-full max-w-[1000px] flex flex-col items-center z-10 gap-10 mt-4 sm:mt-6"
      >
        
        {/* HERO SECTION */}
        <motion.section variants={itemVariants} className="text-center space-y-6 flex flex-col items-center w-full">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md flex items-center gap-2 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-[0.2em] uppercase font-medium">Verified Protocol</span>
          </motion.div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/30 leading-[1.1] pb-2 drop-shadow-sm">
            LASTBUYER
          </h1>
          
          <p className="text-gray-400/80 text-sm sm:text-base max-w-lg mt-2 font-medium tracking-wide leading-relaxed">
            Buy to reset the 1-minute timer. When the time is up, the last buyer takes the entire reward pool.
          </p>
        </motion.section>

        {/* MAIN GAME CARD - High End Glassmorphism */}
        <motion.section 
          variants={cardVariants} 
          className="w-full sm:w-[500px] relative z-20 group"
        >
          {/* Ambient Glow Behind Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />
          
          <div className="rounded-[2.5rem] bg-white/[0.015] border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[40px] p-8 sm:p-10 flex flex-col items-center gap-8 w-full relative overflow-hidden transition-all duration-700 hover:border-white/[0.08] hover:bg-white/[0.025]">
            
            {/* Elegant Inner Top Highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent opacity-50" />

            {isActive ? (
              <>
                {/* Ultra-Minimal Prize Pool */}
                <motion.div variants={itemVariants} className="flex flex-col items-center gap-1.5 mt-2">
                  <span className="text-gray-500 text-[9px] uppercase tracking-[0.4em] font-semibold flex items-center gap-2">
                    <Trophy size={10} className="text-gray-400" />
                    Prize Pool
                  </span>
                  <div className="text-5xl font-extralight text-white tracking-widest flex items-baseline gap-2.5 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    {prizePool.toFixed(2)}
                    <span className="text-xl text-gray-500 font-medium">SOL</span>
                  </div>
                </motion.div>

                {/* Micro Divider */}
                <div className="w-12 h-[1px] bg-white/[0.06] rounded-full my-1" />

                {/* PREMIUM CLOCK TIMER - Floating UI */}
                <motion.div variants={itemVariants} className="w-full flex justify-center">
                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    
                    {/* MINUTES */}
                    <div className="flex flex-col items-center">
                      <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center
                          ${isLowTime 
                            ? 'bg-red-500/[0.02] border border-red-500/20 shadow-[inset_0_0_30px_rgba(248,113,113,0.05)]' 
                            : 'bg-white/[0.01] border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]'
                          } transition-all duration-700
                        `}>
                        <span className={`font-mono text-[80px] sm:text-[96px] leading-none font-extralight tracking-tighter tabular-nums
                          ${isLowTime ? 'text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.3)]' : 'text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'}
                        `}>
                          {minutesStr}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase tracking-[0.5em] mt-5 font-semibold ${isLowTime ? 'text-red-500/60' : 'text-gray-500'}`}>
                        Minutes
                      </span>
                    </div>
                    
                    {/* COLON */}
                    <span className={`text-5xl sm:text-6xl font-light mb-10 ${isLowTime ? 'text-red-500/40 animate-pulse' : 'text-gray-600/30'}`}>:</span>
                    
                    {/* SECONDS */}
                    <div className="flex flex-col items-center">
                      <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center overflow-hidden
                          ${isLowTime 
                            ? 'bg-red-500/[0.02] border border-red-500/20 shadow-[inset_0_0_30px_rgba(248,113,113,0.05)]' 
                            : 'bg-white/[0.01] border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]'
                          } transition-all duration-700
                        `}>
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={secondsStr}
                            initial={{ y: 30, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -30, opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={`font-mono text-[80px] sm:text-[96px] leading-none font-extralight tracking-tighter tabular-nums
                              ${isLowTime ? 'text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.3)]' : 'text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'}
                            `}
                          >
                            {secondsStr}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                      <span className={`text-[9px] uppercase tracking-[0.5em] mt-5 font-semibold ${isLowTime ? 'text-red-500/60' : 'text-gray-500'}`}>
                        Seconds
                      </span>
                    </div>

                  </div>
                </motion.div>

                {/* Floating King Pill */}
                <motion.div variants={itemVariants} className="mt-3 flex items-center gap-4 px-5 py-3 rounded-full bg-white/[0.015] border border-white/[0.04] shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] transition-colors hover:bg-white/[0.03]">
                  <span className="flex items-center gap-1.5 text-gray-400/80 text-[9px] uppercase tracking-[0.3em] font-semibold">
                    <Crown size={10} className="text-gray-400/80" />
                    King
                  </span>
                  <div className="w-[1px] h-3 bg-white/[0.1] rounded-full" />
                  <span className="font-mono text-sm tracking-widest text-gray-200 drop-shadow-sm">{currentKing}</span>
                </motion.div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: premiumEase }}
                className="w-full py-8 flex flex-col items-center gap-8 relative"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-red-400/60 text-[9px] uppercase tracking-[0.5em] font-bold animate-pulse">Protocol Ended</div>
                  <div className="text-6xl sm:text-7xl font-extralight tracking-tighter text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    ENDED
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <span className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-medium">Winning Wallet</span>
                  <div className="font-mono text-xl tracking-widest text-white/90 mt-2">
                    {currentKing}
                  </div>
                  <div className="px-5 py-2 rounded-full bg-emerald-500/[0.04] border border-emerald-500/10 text-emerald-400/80 mt-3 text-sm flex items-center gap-2 font-medium">
                    <Trophy size={14} /> +{prizePool.toFixed(2)} SOL
                  </div>
                </div>

                <div className="text-gray-600/60 text-[9px] font-semibold tracking-[0.4em] uppercase mt-4">
                  Preparing New Season
                </div>
              </motion.div>
            )}

            {/* Smart Contract CA - Minimal Footer */}
            <motion.div variants={itemVariants} className="w-full mt-4 flex items-center justify-between group px-2 max-w-[85%]">
              <span className="text-gray-600/60 text-[9px] uppercase tracking-[0.4em] font-semibold whitespace-nowrap">Contract</span>
              <div className="flex items-center gap-3">
                <code className="text-gray-400/60 text-[10px] sm:text-xs font-mono tracking-widest group-hover:text-gray-300 transition-colors duration-300">
                  {contractAddress}
                </code>
                <motion.button 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy} 
                  className="text-gray-500/40 hover:text-white/80 transition-colors cursor-pointer"
                  aria-label="Copy CA"
                >
                  {copied ? <Check size={14} className="text-green-400/80" /> : <Copy size={13} />}
                </motion.button>
              </div>
            </motion.div>

          </div>
        </motion.section>

        {/* Info Grid - Linear App Style */}
        <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-2 mt-4">
          <motion.div variants={itemVariants} className="p-8 rounded-[24px] border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] transition-colors flex flex-col gap-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] group hover:-translate-y-1 duration-300">
            <div className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500">
              <Coins size={16} className="text-gray-300" />
            </div>
            <h4 className="text-gray-200 font-medium text-sm">Real SOL Reward</h4>
            <p className="text-gray-500 text-xs leading-relaxed">Pump.fun creator fees are automatically accumulated in this vault in SOL.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="p-8 rounded-[24px] border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] transition-colors flex flex-col gap-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] group hover:-translate-y-1 duration-300">
            <div className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500">
              <Timer size={16} className="text-gray-300" />
            </div>
            <h4 className="text-gray-200 font-medium text-sm">Fair System</h4>
            <p className="text-gray-500 text-xs leading-relaxed">The moment you buy 0.5+ SOL you become the King and reset the timer to 1 minute.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="p-8 rounded-[24px] border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] transition-colors flex flex-col gap-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] group hover:-translate-y-1 duration-300">
            <div className="w-10 h-10 rounded-full border border-white/[0.1] flex items-center justify-center bg-black/50 group-hover:scale-110 transition-transform duration-500">
              <Trophy size={16} className="text-gray-300" />
            </div>
            <h4 className="text-gray-200 font-medium text-sm">Legendary Earnings</h4>
            <p className="text-gray-500 text-xs leading-relaxed">When the time is up, all the SOL in the pool is directly transferred to the last King.</p>
          </motion.div>
        </motion.section>

        {/* Minimalist CTA */}
        {isActive && (
          <motion.a 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://pump.fun/coin/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 mb-24 px-10 py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base flex items-center gap-3 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] no-underline cursor-pointer hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
          >
            Buy on Pump.fun
            <ExternalLink size={16} className="text-gray-500 group-hover:text-black transition-colors" />
          </motion.a>
        )}

      </motion.main>
      
      {/* Minimal Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="w-full text-center p-8 text-gray-600 text-[10px] uppercase tracking-[0.4em] font-medium mt-auto border-t border-white/[0.03]"
      >
        LASTBUYER &copy; {new Date().getFullYear()}
      </motion.footer>
    </div>
  );
}

