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

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();

    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;

    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${nextTab.id}`)?.focus?.();
    });
  };

  return (
    <div
      className="flex gap-2 p-1 rounded-xl bg-base-card border border-base-border"
      role="tablist"
      aria-label="Primary navigation"
      onKeyDown={onKeyDown}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          id={`tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-base-blue/60 focus:ring-offset-2 focus:ring-offset-base-darker ${
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
