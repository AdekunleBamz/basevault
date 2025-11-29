import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useStore } from '../stores/useStore';

export function Leaderboard() {
  const { leaderboard } = useStore();
  const { address } = useAccount();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div 
      className="p-6 rounded-2xl bg-base-card border border-base-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🏆</span>
        <h3 className="text-xl font-bold">Top Depositors</h3>
      </div>

      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No depositors yet. Be the first!
          </div>
        ) : (
          leaderboard.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.address}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                entry.address.toLowerCase() === address?.toLowerCase()
                  ? 'bg-base-blue/20 border border-base-blue/30'
                  : 'bg-base-dark'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-8 text-center font-bold">
                {index < 3 ? medals[index] : `#${index + 1}`}
              </div>
              <div className="flex-1 font-mono text-sm">
                {formatAddress(entry.address)}
                {entry.address.toLowerCase() === address?.toLowerCase() && (
                  <span className="ml-2 text-base-accent">(You)</span>
                )}
              </div>
              <div className="font-bold font-mono">
                {parseFloat(entry.deposited).toFixed(4)} ETH
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
