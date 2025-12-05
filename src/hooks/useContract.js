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
      // Validate and normalize tuple
      if (!Array.isArray(stats) || stats.length < 7) {
        console.warn('Unexpected user stats shape:', stats);
        return;
      }
      setUserStats({
        deposited: formatEther(stats[0]),
        tickets: stats[1]?.toString?.() ?? '0',
        totalWinnings: formatEther(stats[2]),
        referralEarnings: formatEther(stats[3]),
        pendingRewards: formatEther(stats[4]),
        referralCount: stats[5]?.toString?.() ?? '0',
        achievementFlags: stats[6]?.toString?.() ?? '0',
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
