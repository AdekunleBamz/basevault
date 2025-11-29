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
