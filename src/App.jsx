import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Web3Provider } from './components/Web3Provider';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Stats } from './components/Stats';
import { VaultCard } from './components/VaultCard';
import { LotteryCard } from './components/LotteryCard';
import { Leaderboard } from './components/Leaderboard';
import { RewardsCard } from './components/RewardsCard';
import { CirclesSection } from './components/CirclesSection';
import { useContract } from './hooks/useContract';
import { useStore } from './stores/useStore';

function AppContent() {
  const { address } = useAccount();
  const { fetchUserStats, fetchProtocolStats, fetchCurrentRound, fetchLeaderboard } = useContract();
  const { activeTab } = useStore();

  // Fetch data on mount
  useEffect(() => {
    fetchProtocolStats();
    fetchCurrentRound();
    fetchLeaderboard();
  }, []);

  // Fetch user data when address changes
  useEffect(() => {
    if (address) {
      fetchUserStats(address);
    }
  }, [address]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProtocolStats();
      fetchCurrentRound();
      fetchLeaderboard();
      if (address) {
        fetchUserStats(address);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [address]);

  // Check for referral in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referrer', ref);
    }
  }, []);

  return (
    <div className="min-h-screen bg-animated">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#111214',
            color: '#fff',
            border: '1px solid #1E2025',
          },
        }}
      />
      
      <Header />

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-base-blue/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-base-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="gradient-text">No-Loss</span> Savings
            <br />on Base Chain
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Deposit ETH, earn lottery tickets, win weekly prizes. 
            Your principal is always safe. Built on Base.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-8">
          <Stats />
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <VaultCard />
              <Leaderboard />
            </motion.div>
          )}

          {activeTab === 'lottery' && (
            <motion.div
              key="lottery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <LotteryCard />
              <Leaderboard />
            </motion.div>
          )}

          {activeTab === 'circles' && (
            <motion.div
              key="circles"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CirclesSection />
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <RewardsCard />
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer 
          className="mt-16 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>BaseVault Protocol • Built on Base Chain</p>
          <p className="mt-1">
            <a 
              href={`https://basescan.org/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-blue hover:underline"
            >
              View Contract on BaseScan →
            </a>
          </p>
        </motion.footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;
