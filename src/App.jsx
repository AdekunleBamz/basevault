import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Web3Provider } from './components/Web3Provider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Stats } from './components/Stats';
import { VaultCard } from './components/VaultCard';
import { LotteryCard } from './components/LotteryCard';
import { Leaderboard } from './components/Leaderboard';
import { RewardsCard } from './components/RewardsCard';
import { CirclesSection } from './components/CirclesSection';
import { TransactionHistory } from './components/TransactionHistory';
import { BackToTop } from './components/BackToTop';
import { ConfigBanner } from './components/ConfigBanner';
import { useContract } from './hooks/useContract';
import { useStore } from './stores/useStore';
import { useCopyToClipboard, useInterval } from './hooks/useUtils';
import { TOAST_CONFIG, BASESCAN_ADDRESS_URL, STORAGE_KEYS, REFRESH_INTERVALS, SOCIAL_LINKS, SUPPORTED_CHAIN_NAME } from './utils/constants';
import { isValidAddress } from './utils/helpers';

function AppContent() {
  const { address } = useAccount();
  const { fetchUserStats, fetchProtocolStats, fetchCurrentRound, fetchLeaderboard } = useContract();
  const { activeTab } = useStore();
  const { copy, hasCopied } = useCopyToClipboard();
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const isContractAddressValid = isValidAddress(contractAddress);

  // Fetch data on mount
  useEffect(() => {
    fetchProtocolStats();
    fetchCurrentRound();
    fetchLeaderboard();
  }, [fetchProtocolStats, fetchCurrentRound, fetchLeaderboard]);

  // Fetch user data when address changes
  useEffect(() => {
    if (address) {
      fetchUserStats(address);
    }
  }, [address, fetchUserStats]);

  // Auto-refresh
  useInterval(() => {
    fetchProtocolStats();
    fetchCurrentRound();
    fetchLeaderboard();
    if (address) {
      fetchUserStats(address);
    }
  }, REFRESH_INTERVALS.PROTOCOL_STATS);

  // Check for referral in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && isValidAddress(ref)) {
      localStorage.setItem(STORAGE_KEYS.REFERRER, ref);
    }
  }, []);

  return (
    <div className="min-h-screen bg-animated">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-base-card focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to content
      </a>
      <Toaster 
        position={TOAST_CONFIG.position}
        toastOptions={TOAST_CONFIG}
      />
      
      <Header />

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-base-blue/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-base-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <main id="main-content" className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {!isContractAddressValid && (
          <ConfigBanner
            title="Contract address is not configured"
            description="Set VITE_CONTRACT_ADDRESS in your environment to enable on-chain reads and writes."
          />
        )}
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="gradient-text">No-Loss</span> Savings
            <br />on {SUPPORTED_CHAIN_NAME} Chain
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
              className="space-y-6"
            >
              <div className="grid lg:grid-cols-2 gap-6">
                <RewardsCard />
                <TransactionHistory />
              </div>
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
          <p>BaseVault Protocol • Built on {SUPPORTED_CHAIN_NAME} Chain</p>
          <p className="mt-1">
            <a 
              href={`${BASESCAN_ADDRESS_URL}/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View contract on BaseScan"
              className="text-base-blue hover:underline"
            >
              View Contract on BaseScan →
            </a>
          </p>
          {contractAddress && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => copy(contractAddress)}
                aria-label="Copy contract address"
                title={contractAddress}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {hasCopied ? 'Copied contract address' : 'Copy contract address'}
              </button>
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <a href={SOCIAL_LINKS.DOCS} target="_blank" rel="noopener noreferrer" aria-label="BaseVault documentation" className="hover:text-white">
              Docs
            </a>
            <a href={SOCIAL_LINKS.TWITTER} target="_blank" rel="noopener noreferrer" aria-label="BaseVault Twitter" className="hover:text-white">
              Twitter
            </a>
            <a href={SOCIAL_LINKS.DISCORD} target="_blank" rel="noopener noreferrer" aria-label="BaseVault Discord" className="hover:text-white">
              Discord
            </a>
          </div>
        </motion.footer>
      </main>
      <BackToTop />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </ErrorBoundary>
  );
}

export default App;
