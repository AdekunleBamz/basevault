import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { parseAbi } from 'viem';

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
export const CONTRACT_ABI = parseAbi([
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
]);

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
