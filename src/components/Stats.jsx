import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';

export function Stats() {
  const { protocolStats } = useStore();

  const stats = [
    {
      label: 'Total Value Locked',
      value: protocolStats ? `${parseFloat(protocolStats.totalDeposits).toFixed(4)} ETH` : '-.--',
      icon: '🔒',
      color: 'from-base-blue to-blue-400',
    },
    {
      label: 'Current Prize Pool',
      value: protocolStats ? `${parseFloat(protocolStats.currentPrizePool).toFixed(4)} ETH` : '-.--',
      icon: '🎰',
      color: 'from-base-accent to-green-400',
    },
    {
      label: 'Total Users',
      value: protocolStats ? parseInt(protocolStats.totalUsers).toLocaleString() : '-',
      icon: '👥',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Prizes Distributed',
      value: protocolStats ? `${parseFloat(protocolStats.totalPrizesDistributed).toFixed(4)} ETH` : '-.--',
      icon: '🏆',
      color: 'from-base-warning to-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="relative p-4 rounded-2xl bg-base-card border border-base-border overflow-hidden group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Gradient background on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
          
          <div className="relative">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
            <div className="text-xl font-bold font-mono">{stat.value}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
