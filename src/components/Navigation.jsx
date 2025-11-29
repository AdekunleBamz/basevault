import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';

export function Navigation() {
  const { activeTab, setActiveTab } = useStore();

  const tabs = [
    { id: 'vault', label: 'Vault', icon: '🔐' },
    { id: 'lottery', label: 'Lottery', icon: '🎰' },
    { id: 'circles', label: 'Circles', icon: '👥' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-base-card border border-base-border">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-base-blue to-base-accent text-white'
              : 'text-gray-400 hover:text-white hover:bg-base-dark'
          }`}
          whileHover={{ scale: activeTab === tab.id ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
