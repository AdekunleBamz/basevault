#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║              BaseVault Update: WalletConnect + ETH Balance                   ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

cd ~/basevault-app

echo "🔄 Updating BaseVault with WalletConnect..."

# ═══════════════════════════════════════════════════════════════════════════════
# Update package.json with new dependencies
# ═══════════════════════════════════════════════════════════════════════════════

cat > package.json << 'EOF'
{
  "name": "basevault-app",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.1.2",
    "@tanstack/react-query": "^5.28.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "viem": "^2.9.6",
    "wagmi": "^2.5.11",
    "framer-motion": "^10.16.16",
    "react-hot-toast": "^2.4.1",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.10",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0"
  }
}
EOF

echo "📦 Installing new dependencies (RainbowKit, wagmi, viem)..."
npm install

# ═══════════════════════════════════════════════════════════════════════════════
# Create Web3 Provider config
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/utils/wagmiConfig.js << 'EOF'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// Get contract address from env
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const config = getDefaultConfig({
  appName: 'BaseVault',
  projectId: 'basevault-app-001', // WalletConnect Cloud Project ID (get free one at cloud.walletconnect.com)
  chains: [base],
  ssr: false,
});

export const CONTRACT_ADDRESS = contractAddress;

// Contract ABI
export const CONTRACT_ABI = [
  // Read functions
  "function getUserStats(address user) view returns (uint256 deposited, uint256 tickets, uint256 totalWinnings, uint256 referralEarnings, uint256 pendingRewards, uint256 referralCount, uint256 achievementFlags)",
  "function getCurrentRound() view returns (uint256 id, uint256 startTime, uint256 endTime, uint256 roundTickets, uint256 prize, bool finalized)",
  "function getProtocolStats() view returns (uint256 totalUsers, uint256 totalDeposits, uint256 totalTickets, uint256 totalProtocolFees, uint256 totalPrizesDistributed, uint256 totalCircles, uint256 currentPrizePool)",
  "function getLeaderboard() view returns (address[100], uint256[])",
  "function getCircleInfo(uint256 circleId) view returns (string name, address creator, uint256 targetAmount, uint256 currentAmount, uint256 deadline, uint256 memberCount, uint256 maxMembers, bool active, bool completed)",
  "function getCircleMembers(uint256 circleId) view returns (address[])",
  "function getUserCircles(address user) view returns (uint256[])",
  "function hasAchievement(address user, uint256 achievementId) view returns (bool)",
  "function getAchievementCount(address user) view returns (uint256)",
  "function totalCircles() view returns (uint256)",
  
  // Write functions
  "function deposit(address referrer) payable",
  "function withdraw(uint256 amount)",
  "function claimRewards()",
  "function finalizeLottery()",
  "function createCircle(string name, uint256 targetAmount, uint256 durationDays, uint256 maxMembers) returns (uint256)",
  "function joinCircle(uint256 circleId)",
  "function contributeToCircle(uint256 circleId) payable",
  "function withdrawFromCircle(uint256 circleId)",
  
  // Events
  "event Deposited(address indexed user, uint256 amount, uint256 tickets, address indexed referrer)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event LotteryFinalized(uint256 indexed roundId, address indexed winner, uint256 prize)",
  "event ReferralPaid(address indexed referrer, address indexed referee, uint256 amount)",
  "event AchievementUnlocked(address indexed user, uint256 achievementId, string name)",
  "event CircleCreated(uint256 indexed circleId, string name, address indexed creator, uint256 target)",
];

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 0, name: 'First Deposit', icon: '🎯', description: 'Made your first deposit' },
  { id: 1, name: 'Committed', icon: '💪', description: 'Deposited 0.1+ ETH' },
  { id: 2, name: 'Serious', icon: '🔥', description: 'Deposited 1+ ETH' },
  { id: 3, name: 'Whale', icon: '🐋', description: 'Deposited 10+ ETH' },
  { id: 4, name: 'Influencer', icon: '⭐', description: 'Referred 5+ users' },
  { id: 5, name: 'Lottery Winner', icon: '🏆', description: 'Won a lottery round' },
  { id: 6, name: 'Circle Creator', icon: '👥', description: 'Created a savings circle' },
];
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Create Web3Provider component
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/Web3Provider.jsx << 'EOF'
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../utils/wagmiConfig';

const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#0052FF',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update Header component with WalletConnect and ETH balance
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/Header.jsx << 'EOF'
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { useStore } from '../stores/useStore';

export function Header() {
  const { address, isConnected } = useAccount();
  const { userStats } = useStore();
  
  // Fetch ETH balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  const formatBalance = (balance) => {
    if (!balance) return '0.0000';
    return parseFloat(balance.formatted).toFixed(4);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-base-blue to-base-accent flex items-center justify-center">
              <span className="text-xl">🔐</span>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Base</span>Vault
            </span>
          </motion.div>

          {/* Right side - Balance & Connect */}
          <div className="flex items-center gap-3">
            {/* ETH Balance Display */}
            {isConnected && balanceData && (
              <motion.div 
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-base-card border border-base-border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold">Ξ</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Balance</div>
                    <div className="font-mono font-bold text-sm">
                      {formatBalance(balanceData)} ETH
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tickets Display */}
            {isConnected && userStats && (
              <motion.div 
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-base-card border border-base-border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎟️</span>
                  <div>
                    <div className="text-xs text-gray-400">Tickets</div>
                    <div className="font-mono font-bold text-sm text-base-accent">
                      {parseInt(userStats.tickets).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RainbowKit Connect Button */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <motion.button
                            onClick={openConnectModal}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-semibold text-white hover:opacity-90 transition-opacity"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Connect Wallet
                          </motion.button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <motion.button
                            onClick={openChainModal}
                            className="px-6 py-2.5 rounded-xl bg-base-danger font-semibold text-white hover:opacity-90 transition-opacity"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Wrong Network
                          </motion.button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={openChainModal}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-base-card border border-base-border hover:border-base-blue transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 20,
                                  height: 20,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 20, height: 20 }}
                                  />
                                )}
                              </div>
                            )}
                            <span className="text-sm font-medium">{chain.name}</span>
                          </motion.button>

                          <motion.button
                            onClick={openAccountModal}
                            className="px-4 py-2.5 rounded-xl bg-base-card border border-base-border font-medium hover:border-base-blue transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="font-mono">
                              {account.displayName}
                            </span>
                          </motion.button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>

      {/* Mobile Balance Bar */}
      {isConnected && balanceData && (
        <motion.div 
          className="sm:hidden border-t border-base-border px-4 py-2 flex justify-center gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Balance:</span>
            <span className="font-mono font-bold text-sm">{formatBalance(balanceData)} ETH</span>
          </div>
          {userStats && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Tickets:</span>
              <span className="font-mono font-bold text-sm text-base-accent">
                {parseInt(userStats.tickets).toLocaleString()}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update useContract hook to use wagmi
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/hooks/useContract.js << 'EOF'
import { useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther, getContract } from 'viem';
import { useStore } from '../stores/useStore';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/wagmiConfig';

export function useContract() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const { 
    setUserStats, 
    setProtocolStats, 
    setCurrentRound,
    setLeaderboard,
    setLoading 
  } = useStore();

  // Fetch user stats
  const fetchUserStats = useCallback(async (userAddress) => {
    if (!userAddress || !publicClient) return;
    try {
      const contract = getContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        client: publicClient,
      });
      
      const stats = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getUserStats',
        args: [userAddress],
      });
      
      setUserStats({
        deposited: formatEther(stats[0]),
        tickets: stats[1].toString(),
        totalWinnings: formatEther(stats[2]),
        referralEarnings: formatEther(stats[3]),
        pendingRewards: formatEther(stats[4]),
        referralCount: stats[5].toString(),
        achievementFlags: stats[6].toString(),
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, [publicClient, setUserStats]);

  // Fetch protocol stats
  const fetchProtocolStats = useCallback(async () => {
    if (!publicClient) return;
    try {
      const stats = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getProtocolStats',
      });
      
      setProtocolStats({
        totalUsers: stats[0].toString(),
        totalDeposits: formatEther(stats[1]),
        totalTickets: stats[2].toString(),
        totalProtocolFees: formatEther(stats[3]),
        totalPrizesDistributed: formatEther(stats[4]),
        totalCircles: stats[5].toString(),
        currentPrizePool: formatEther(stats[6]),
      });
    } catch (err) {
      console.error('Error fetching protocol stats:', err);
    }
  }, [publicClient, setProtocolStats]);

  // Fetch current lottery round
  const fetchCurrentRound = useCallback(async () => {
    if (!publicClient) return;
    try {
      const round = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCurrentRound',
      });
      
      setCurrentRound({
        id: round[0].toString(),
        startTime: new Date(Number(round[1]) * 1000),
        endTime: new Date(Number(round[2]) * 1000),
        totalTickets: round[3].toString(),
        prizePool: formatEther(round[4]),
        finalized: round[5],
      });
    } catch (err) {
      console.error('Error fetching current round:', err);
    }
  }, [publicClient, setCurrentRound]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    if (!publicClient) return;
    try {
      const [addresses, deposits] = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getLeaderboard',
      });
      
      const leaderboard = addresses
        .map((addr, i) => ({
          address: addr,
          deposited: formatEther(deposits[i]),
        }))
        .filter(item => item.address !== '0x0000000000000000000000000000000000000000')
        .slice(0, 20);
      setLeaderboard(leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  }, [publicClient, setLeaderboard]);

  // Deposit
  const deposit = useCallback(async (amount, referrer = '0x0000000000000000000000000000000000000000') => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'deposit',
        args: [referrer],
        value: parseEther(amount),
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchUserStats(address);
      await fetchProtocolStats();
      await fetchCurrentRound();
      return { success: true, hash };
    } catch (err) {
      console.error('Error depositing:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, address, fetchUserStats, fetchProtocolStats, fetchCurrentRound, setLoading]);

  // Withdraw
  const withdraw = useCallback(async (amount) => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'withdraw',
        args: [parseEther(amount)],
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchUserStats(address);
      await fetchProtocolStats();
      return { success: true, hash };
    } catch (err) {
      console.error('Error withdrawing:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, address, fetchUserStats, fetchProtocolStats, setLoading]);

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'claimRewards',
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchUserStats(address);
      return { success: true, hash };
    } catch (err) {
      console.error('Error claiming rewards:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, address, fetchUserStats, setLoading]);

  // Finalize lottery
  const finalizeLottery = useCallback(async () => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'finalizeLottery',
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchCurrentRound();
      await fetchProtocolStats();
      return { success: true, hash };
    } catch (err) {
      console.error('Error finalizing lottery:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, fetchCurrentRound, fetchProtocolStats, setLoading]);

  // Create circle
  const createCircle = useCallback(async (name, targetAmount, durationDays, maxMembers) => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createCircle',
        args: [name, parseEther(targetAmount), BigInt(durationDays), BigInt(maxMembers)],
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      await fetchProtocolStats();
      return { success: true, hash };
    } catch (err) {
      console.error('Error creating circle:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, fetchProtocolStats, setLoading]);

  // Join circle
  const joinCircle = useCallback(async (circleId) => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'joinCircle',
        args: [BigInt(circleId)],
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      return { success: true, hash };
    } catch (err) {
      console.error('Error joining circle:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, setLoading]);

  // Contribute to circle
  const contributeToCircle = useCallback(async (circleId, amount) => {
    if (!walletClient) return { success: false, error: 'Wallet not connected' };
    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'contributeToCircle',
        args: [BigInt(circleId)],
        value: parseEther(amount),
      });
      
      await publicClient.waitForTransactionReceipt({ hash });
      return { success: true, hash };
    } catch (err) {
      console.error('Error contributing:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [walletClient, publicClient, setLoading]);

  return {
    fetchUserStats,
    fetchProtocolStats,
    fetchCurrentRound,
    fetchLeaderboard,
    deposit,
    withdraw,
    claimRewards,
    finalizeLottery,
    createCircle,
    joinCircle,
    contributeToCircle,
  };
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update VaultCard to use wagmi
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/VaultCard.jsx << 'EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { useStore } from '../stores/useStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';

export function VaultCard() {
  const [amount, setAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);
  const [referrer, setReferrer] = useState('');
  const { address, isConnected } = useAccount();
  const { deposit, withdraw } = useContract();
  const { userStats, isLoading } = useStore();

  // Get ETH balance
  const { data: balanceData } = useBalance({ address });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check if user has enough balance for deposit
    if (isDeposit && balanceData) {
      if (parseFloat(amount) > parseFloat(balanceData.formatted)) {
        toast.error('Insufficient ETH balance');
        return;
      }
    }

    const result = isDeposit 
      ? await deposit(amount, referrer || undefined)
      : await withdraw(amount);

    if (result.success) {
      toast.success(
        <div>
          <div className="font-bold">{isDeposit ? 'Deposit' : 'Withdrawal'} successful!</div>
          <a 
            href={`https://basescan.org/tx/${result.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-base-blue hover:underline"
          >
            View transaction →
          </a>
        </div>
      );
      setAmount('');
    } else {
      toast.error(result.error || 'Transaction failed');
    }
  };

  const quickAmounts = ['0.01', '0.05', '0.1', '0.5'];

  const setMaxAmount = () => {
    if (isDeposit && balanceData) {
      // Leave some for gas
      const max = Math.max(0, parseFloat(balanceData.formatted) - 0.001);
      setAmount(max.toFixed(4));
    } else if (!isDeposit && userStats) {
      setAmount(userStats.deposited);
    }
  };

  return (
    <motion.div 
      className="p-6 rounded-2xl bg-base-card border border-base-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Toggle */}
      <div className="flex gap-2 p-1 rounded-xl bg-base-dark mb-6">
        <button
          onClick={() => setIsDeposit(true)}
          className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
            isDeposit 
              ? 'bg-gradient-to-r from-base-blue to-base-accent text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setIsDeposit(false)}
          className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
            !isDeposit 
              ? 'bg-gradient-to-r from-base-blue to-base-accent text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Wallet Balance */}
      {isConnected && balanceData && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-base-blue/10 to-base-accent/10 border border-base-blue/20">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Wallet Balance</span>
            <span className="font-mono font-bold text-lg">
              {parseFloat(balanceData.formatted).toFixed(4)} ETH
            </span>
          </div>
        </div>
      )}

      {/* Vault Balance */}
      {userStats && (
        <div className="mb-6 p-4 rounded-xl bg-base-dark">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Vault Balance</span>
            <span className="font-mono font-bold text-lg">
              {parseFloat(userStats.deposited).toFixed(4)} ETH
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-400">Your Tickets</span>
            <span className="font-mono font-bold text-base-accent">
              {parseInt(userStats.tickets).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Amount Input */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-400">Amount (ETH)</label>
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-xs text-base-blue hover:text-base-accent transition-colors"
            >
              MAX
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-3 rounded-xl bg-base-dark border border-base-border focus:border-base-blue outline-none font-mono text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              ETH
            </span>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2 mb-4">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              type="button"
              onClick={() => setAmount(qa)}
              className="flex-1 py-2 rounded-lg bg-base-dark border border-base-border hover:border-base-blue transition-colors text-sm font-mono"
            >
              {qa}
            </button>
          ))}
        </div>

        {/* Referrer input (only for deposit) */}
        <AnimatePresence>
          {isDeposit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <label className="block text-sm text-gray-400 mb-2">
                Referrer Address (optional)
              </label>
              <input
                type="text"
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-xl bg-base-dark border border-base-border focus:border-base-blue outline-none font-mono text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <motion.button
                type="button"
                onClick={openConnectModal}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-bold text-lg"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Connect Wallet
              </motion.button>
            )}
          </ConnectButton.Custom>
        ) : (
          <motion.button
            type="submit"
            disabled={isLoading || !amount}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              isDeposit ? 'Deposit & Get Tickets' : 'Withdraw'
            )}
          </motion.button>
        )}
      </form>

      {/* Info */}
      {isDeposit && (
        <div className="mt-4 p-3 rounded-lg bg-base-blue/10 border border-base-blue/20">
          <p className="text-sm text-gray-300">
            <span className="text-base-accent font-semibold">10,000 tickets</span> per ETH deposited. 
            More tickets = higher chance to win the weekly lottery!
          </p>
        </div>
      )}
    </motion.div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update LotteryCard to use wagmi
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/LotteryCard.jsx << 'EOF'
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
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update Leaderboard to use wagmi
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/Leaderboard.jsx << 'EOF'
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
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update RewardsCard to use wagmi
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/RewardsCard.jsx << 'EOF'
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { useStore } from '../stores/useStore';
import { ACHIEVEMENTS } from '../utils/wagmiConfig';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';

export function RewardsCard() {
  const { address, isConnected } = useAccount();
  const { claimRewards } = useContract();
  const { userStats, isLoading } = useStore();

  const handleClaim = async () => {
    const result = await claimRewards();
    if (result.success) {
      toast.success('Rewards claimed successfully!');
    } else {
      toast.error(result.error || 'Failed to claim rewards');
    }
  };

  const pendingRewards = userStats ? parseFloat(userStats.pendingRewards) : 0;
  const referralLink = address 
    ? `${window.location.origin}?ref=${address}`
    : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  // Get unlocked achievements
  const unlockedAchievements = userStats 
    ? ACHIEVEMENTS.filter((_, i) => (BigInt(userStats.achievementFlags) & BigInt(1 << i)) !== BigInt(0))
    : [];

  return (
    <motion.div 
      className="p-6 rounded-2xl bg-base-card border border-base-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🎁</span>
        <h3 className="text-xl font-bold">Your Rewards</h3>
      </div>

      {/* Pending Rewards */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-base-blue/20 to-base-accent/20 border border-base-blue/30 mb-4">
        <div className="text-sm text-gray-400 mb-1">Pending Rewards</div>
        <div className="text-3xl font-bold font-mono">
          {pendingRewards.toFixed(4)} <span className="text-lg">ETH</span>
        </div>
        {pendingRewards > 0 && (
          isConnected ? (
            <motion.button
              onClick={handleClaim}
              disabled={isLoading}
              className="mt-3 w-full py-2 rounded-lg bg-base-accent font-semibold text-black disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Claiming...' : 'Claim Rewards'}
            </motion.button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <motion.button
                  onClick={openConnectModal}
                  className="mt-3 w-full py-2 rounded-lg bg-base-accent font-semibold text-black"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect to Claim
                </motion.button>
              )}
            </ConnectButton.Custom>
          )
        )}
      </div>

      {/* Stats Grid */}
      {userStats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-base-dark">
            <div className="text-xs text-gray-400">Total Winnings</div>
            <div className="font-bold font-mono">{parseFloat(userStats.totalWinnings).toFixed(4)} ETH</div>
          </div>
          <div className="p-3 rounded-xl bg-base-dark">
            <div className="text-xs text-gray-400">Referral Earnings</div>
            <div className="font-bold font-mono">{parseFloat(userStats.referralEarnings).toFixed(4)} ETH</div>
          </div>
        </div>
      )}

      {/* Referral Link */}
      {isConnected && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Your Referral Link</div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-3 py-2 rounded-lg bg-base-dark border border-base-border font-mono text-xs truncate"
            />
            <motion.button
              onClick={copyReferralLink}
              className="px-4 py-2 rounded-lg bg-base-blue font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Copy
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Earn 0.5% on every deposit from your referrals!
          </p>
        </div>
      )}

      {/* Achievements */}
      <div>
        <div className="text-sm text-gray-400 mb-2">Achievements</div>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedAchievements.find(a => a.id === achievement.id);
            return (
              <motion.div
                key={achievement.id}
                className={`px-3 py-2 rounded-lg ${
                  isUnlocked 
                    ? 'bg-base-accent/20 border border-base-accent/30' 
                    : 'bg-base-dark opacity-50'
                }`}
                title={achievement.description}
                whileHover={{ scale: 1.05 }}
              >
                <span className="mr-1">{achievement.icon}</span>
                <span className="text-sm">{achievement.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update CirclesSection to use wagmi
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/components/CirclesSection.jsx << 'EOF'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useContract } from '../hooks/useContract';
import { useStore } from '../stores/useStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';

export function CirclesSection() {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    durationDays: '30',
    maxMembers: '10',
  });
  const { isConnected } = useAccount();
  const { createCircle } = useContract();
  const { protocolStats, isLoading } = useStore();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const result = await createCircle(
      formData.name,
      formData.targetAmount,
      parseInt(formData.durationDays),
      parseInt(formData.maxMembers)
    );

    if (result.success) {
      toast.success('Circle created successfully!');
      setShowCreate(false);
      setFormData({ name: '', targetAmount: '', durationDays: '30', maxMembers: '10' });
    } else {
      toast.error(result.error || 'Failed to create circle');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Savings Circles</h2>
          <p className="text-gray-400">Group savings goals with friends</p>
        </div>
        {isConnected ? (
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showCreate ? 'Cancel' : '+ Create Circle'}
          </motion.button>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <motion.button
                onClick={openConnectModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Connect to Create
              </motion.button>
            )}
          </ConnectButton.Custom>
        )}
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="p-6 rounded-2xl bg-base-card border border-base-border overflow-hidden"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Circle Name</label>
                <input
                  type="text"
                  maxLength={32}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Vacation Fund"
                  className="w-full px-4 py-3 rounded-xl bg-base-dark border border-base-border focus:border-base-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Amount (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="1.0"
                  className="w-full px-4 py-3 rounded-xl bg-base-dark border border-base-border focus:border-base-blue outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Duration (Days)</label>
                <select
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-base-dark border border-base-border focus:border-base-blue outline-none"
                >
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                  <option value="90">3 Months</option>
                  <option value="180">6 Months</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Members</label>
                <input
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-base-dark border border-base-border focus:border-base-blue outline-none font-mono"
                />
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-base-blue to-base-accent font-bold disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? 'Creating...' : 'Create Circle'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="p-6 rounded-2xl bg-base-card border border-base-border">
        <div className="text-center">
          <div className="text-4xl font-bold gradient-text mb-2">
            {protocolStats?.totalCircles || '0'}
          </div>
          <div className="text-gray-400">Active Circles</div>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-base-dark text-center">
          <p className="text-sm text-gray-400">
            Create a savings circle to pool funds with friends towards a common goal. 
            All contributions are tracked on-chain and distributed when the goal is reached!
          </p>
        </div>
      </div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Update main App.jsx
# ═══════════════════════════════════════════════════════════════════════════════

cat > src/App.jsx << 'EOF'
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
EOF

# ═══════════════════════════════════════════════════════════════════════════════
# Remove old files that are no longer needed
# ═══════════════════════════════════════════════════════════════════════════════

rm -f src/hooks/useWallet.js
rm -f src/utils/config.js

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo "   ✅ Update Complete!"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "   New features added:"
echo "   ✅ WalletConnect support (MetaMask, Coinbase, Rainbow, etc.)"
echo "   ✅ Wallet approval popup for all connections"
echo "   ✅ ETH balance display in header"
echo "   ✅ Mobile balance bar"
echo "   ✅ Better wallet connection UI"
echo ""
echo "   Now restart the dev server:"
echo ""
echo "      npm run dev"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
