import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useLocalStorage } from '../hooks/useUtils';
import { formatAddress, formatETH, formatRelativeTime, getTxUrl } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import { EmptyState } from './EmptyState';

/**
 * Transaction History Component
 * Displays recent user transactions from localStorage
 */
export function TransactionHistory({ maxItems = 5 }) {
  const { address } = useAccount();
  const [transactions] = useLocalStorage(STORAGE_KEYS.RECENT_TRANSACTIONS, []);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter transactions for current user
  const userTransactions = transactions
    .filter(tx => tx.address?.toLowerCase() === address?.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxItems);

  if (!address) {
    return null;
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return '📥';
      case 'withdraw': return '📤';
      case 'claim': return '🎁';
      case 'lottery': return '🎰';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'text-base-accent';
      case 'withdraw': return 'text-blue-400';
      case 'claim': return 'text-base-warning';
      case 'lottery': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const displayTransactions = isExpanded ? userTransactions : userTransactions.slice(0, 3);

  return (
    <motion.div
      className="p-6 rounded-2xl bg-base-card border border-base-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h3 className="text-xl font-bold">Recent Activity</h3>
        </div>
        {userTransactions.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-base-blue hover:text-base-accent transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All (${userTransactions.length})`}
          </button>
        )}
      </div>

      {userTransactions.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No activity yet"
          description="Your recent deposits, withdrawals, and claims will show up here."
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {displayTransactions.map((tx, index) => (
              <motion.a
                key={tx.hash}
                href={getTxUrl(tx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-base-dark hover:bg-base-border transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(tx.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{tx.type}</span>
                        {tx.amount && (
                          <span className={`font-mono text-sm ${getTypeColor(tx.type)}`}>
                            {tx.type === 'withdraw' || tx.type === 'claim' ? '+' : '-'}
                            {formatETH(tx.amount)} ETH
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatRelativeTime(tx.timestamp)}</span>
                        <span>•</span>
                        <span className="font-mono">{formatAddress(tx.hash, 8, 6)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Helper function to add a transaction to history
 * Call this after successful transactions
 */
export function addTransaction(type, hash, amount, address) {
  const storageKey = STORAGE_KEYS.RECENT_TRANSACTIONS;
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  const newTx = {
    type,
    hash,
    amount: amount?.toString(),
    address,
    timestamp: Date.now(),
  };
  
  // Keep only last 50 transactions
  const updated = [newTx, ...existing].slice(0, 50);
  localStorage.setItem(storageKey, JSON.stringify(updated));
}
