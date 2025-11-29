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
