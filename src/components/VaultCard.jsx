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
