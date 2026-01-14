/**
 * Application-wide constants and configuration
 */

// Network configuration
export const SUPPORTED_CHAIN_ID = 8453; // Base Mainnet
export const SUPPORTED_CHAIN_NAME = 'Base';

// URLs
export const BASESCAN_URL = 'https://basescan.org';
export const BASESCAN_TX_URL = `${BASESCAN_URL}/tx`;
export const BASESCAN_ADDRESS_URL = `${BASESCAN_URL}/address`;

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

// Refresh intervals
export const REFRESH_INTERVALS = {
  PROTOCOL_STATS: 30 * TIME.SECOND,
  USER_STATS: 30 * TIME.SECOND,
  LEADERBOARD: 60 * TIME.SECOND,
  LOTTERY_ROUND: 10 * TIME.SECOND,
};

// Animation durations
export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5,
  PAGE_TRANSITION: 0.25,
};

// Toast configuration
export const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#111214',
    color: '#fff',
    border: '1px solid #1E2025',
    padding: '16px',
    borderRadius: '12px',
  },
  success: {
    iconTheme: {
      primary: '#00D395',
      secondary: '#111214',
    },
  },
  error: {
    iconTheme: {
      primary: '#FF3B5C',
      secondary: '#111214',
    },
  },
};

// Gas limits (in wei)
export const GAS_BUFFER = 0.001; // ETH to reserve for gas

// Deposit/Withdraw limits
export const LIMITS = {
  MIN_DEPOSIT: '0.001',
  MAX_DEPOSIT: '1000',
  MIN_WITHDRAW: '0.0001',
};

// Lottery constants
export const LOTTERY = {
  ROUND_DURATION_DAYS: 7,
  TICKETS_PER_ETH: 10000,
};

// Circle constants
export const CIRCLES = {
  MIN_DURATION_DAYS: 7,
  MAX_DURATION_DAYS: 365,
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 50,
  MIN_TARGET: '0.01',
};

// Referral constants
export const REFERRAL = {
  BONUS_PERCENT: 0.5,
  STORAGE_KEY: 'referrer',
};

// Local storage keys
export const STORAGE_KEYS = {
  REFERRER: 'referrer',
  THEME: 'basevault_theme',
  DISMISSED_BANNERS: 'basevault_dismissed_banners',
  RECENT_TRANSACTIONS: 'basevault_recent_txs',
};

// Leaderboard configuration
export const LEADERBOARD = {
  MAX_DISPLAY: 10,
  MEDALS: ['🥇', '🥈', '🥉'],
};

// Social links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/basevault',
  DISCORD: 'https://discord.gg/basevault',
  GITHUB: 'https://github.com/basevault',
  DOCS: 'https://docs.basevault.xyz',
};

// Navigation tabs
export const NAV_TABS = [
  { id: 'vault', label: 'Vault', icon: '🔐', description: 'Deposit and withdraw ETH' },
  { id: 'lottery', label: 'Lottery', icon: '🎰', description: 'View lottery rounds and prizes' },
  { id: 'circles', label: 'Circles', icon: '👥', description: 'Create group savings goals' },
  { id: 'rewards', label: 'Rewards', icon: '🎁', description: 'Claim rewards and referral earnings' },
];

// Quick deposit amounts
export const QUICK_AMOUNTS = ['0.01', '0.05', '0.1', '0.5', '1'];

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_BALANCE: 'Insufficient ETH balance',
  INVALID_AMOUNT: 'Please enter a valid amount',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  WRONG_NETWORK: `Please switch to ${SUPPORTED_CHAIN_NAME}`,
};

// Success messages
export const SUCCESS_MESSAGES = {
  DEPOSIT_SUCCESS: 'Deposit successful!',
  WITHDRAW_SUCCESS: 'Withdrawal successful!',
  CLAIM_SUCCESS: 'Rewards claimed successfully!',
  COPY_SUCCESS: 'Copied to clipboard!',
  CIRCLE_CREATED: 'Circle created successfully!',
};
