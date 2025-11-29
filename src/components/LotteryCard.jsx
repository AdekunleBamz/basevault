import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { useStore } from '../stores/useStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';

export function LotteryCard() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { isConnected } = useAccount();
  const { finalizeLottery } = useContract();
  const { currentRound, userStats, isLoading } = useStore();

  useEffect(() => {
    if (!currentRound) return;

    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(currentRound.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound]);

  const handleFinalize = async () => {
    const result = await finalizeLottery();
    if (result.success) {
      toast.success('Lottery finalized! Check if you won!');
    } else {
      toast.error(result.error || 'Could not finalize lottery');
    }
  };

  const isEnded = timeLeft.days === 0 && timeLeft.hours === 0 && 
                  timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const winChance = userStats && currentRound && parseInt(currentRound.totalTickets) > 0
    ? ((parseInt(userStats.tickets) / parseInt(currentRound.totalTickets)) * 100).toFixed(2)
    : '0.00';

  return (
    <motion.div 
      className="p-6 rounded-2xl bg-base-card border border-base-border relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-base-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🎰</span>
          <h3 className="text-xl font-bold">Weekly Lottery</h3>
          <span className="ml-auto px-3 py-1 rounded-full bg-base-accent/20 text-base-accent text-sm font-semibold">
            Round #{currentRound?.id || '-'}
          </span>
        </div>

        {/* Prize Pool */}
        <div className="text-center py-6">
          <div className="text-sm text-gray-400 mb-1">Current Prize Pool</div>
          <div className="text-4xl font-bold font-mono gradient-text">
            {currentRound ? parseFloat(currentRound.prizePool).toFixed(4) : '-.----'} ETH
          </div>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-base-dark">
              <div className="text-2xl font-bold font-mono">{String(item.value).padStart(2, '0')}</div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Win chance */}
        {userStats && (
          <div className="p-4 rounded-xl bg-base-dark mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Win Chance</span>
              <span className="font-bold text-base-accent">{winChance}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-base-border overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-base-blue to-base-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(parseFloat(winChance), 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        )}

        {/* Finalize button */}
        {isEnded && currentRound && !currentRound.finalized && (
          isConnected ? (
            <motion.button
              onClick={handleFinalize}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-base-warning to-orange-500 font-bold text-black disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? 'Finalizing...' : '�� Finalize & Pick Winner'}
            </motion.button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-base-warning to-orange-500 font-bold text-black"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Connect to Finalize
                </motion.button>
              )}
            </ConnectButton.Custom>
          )
        )}
      </div>
    </motion.div>
  );
}
