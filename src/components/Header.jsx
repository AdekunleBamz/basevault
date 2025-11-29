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
