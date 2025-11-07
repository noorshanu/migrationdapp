import { useMemo, useState } from 'react'
import './App.css'
import { useAccount, useReadContract, useWriteContract, useConfig, useChainId } from 'wagmi'
import { waitForTransactionReceipt, simulateContract } from 'wagmi/actions'
import { parseUnits, formatUnits } from 'viem'
import { MIGRATION_ABI } from './abi/migration'
import { ERC20_ABI } from './abi/erc20'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/Footer.tsx'
import Navbar from './components/Navbar.jsx'
import TokenSelector from './components/TokenSelector.jsx'
import AmountInput from './components/AmountInput.jsx'
import MigrateAction from './components/MigrateAction.jsx'

function App() {
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()
  const chainId = useChainId()
  const FALLBACK_MIGRATE_GAS = 400000n
  const TARGET_CHAIN_ID = 11155111 // Sepolia

  const [contractAddress] = useState('0xdb352e55DaAd68B632554410F2D392263fF22b06')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedToken, setSelectedToken] = useState('tokenA')

  // Contract address is fixed; no input/localStorage needed

  const {
    data: tokenAAddress,
    refetch: refetchTokenA
  } = useReadContract({
    address: contractAddress || undefined,
    abi: MIGRATION_ABI,
    functionName: 'tokenA',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) }
  })

  const { data: tokenBAddress } = useReadContract({
    address: contractAddress || undefined,
    abi: MIGRATION_ABI,
    functionName: 'tokenB',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) }
  })

  const { data: contractBalances } = useReadContract({
    address: contractAddress || undefined,
    abi: MIGRATION_ABI,
    functionName: 'contractBalances',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) }
  })

  const { data: tokenADecimals } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress) }
  })

  const { data: tokenASymbol } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress) }
  })

  const { data: tokenBDecimals } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenBAddress) }
  })

  const { data: tokenBSymbol } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenBAddress) }
  })

  const { data: tokenAUserBal } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress && address) }
  })

  const amountWei = useMemo(() => {
    try {
      if (!amount || !tokenADecimals) return null
      return parseUnits(amount, tokenADecimals)
    } catch {
      return null
    }
  }, [amount, tokenADecimals])

  const tokenBBalance = useMemo(() => {
    if (!contractBalances) return null
    // supports both struct-like object and tuple array returns
    return contractBalances?.tokenBBalance ?? contractBalances?.[1] ?? null
  }, [contractBalances])

  const tokenBBalanceFormatted = useMemo(() => {
    try {
      if (tokenBBalance == null || tokenBDecimals == null) return null
      return formatUnits(tokenBBalance, tokenBDecimals)
    } catch {
      return null
    }
  }, [tokenBBalance, tokenBDecimals])

  const tokenAUserBalFormatted = useMemo(() => {
    try {
      if (tokenAUserBal == null || tokenADecimals == null) return null
      return formatUnits(tokenAUserBal, tokenADecimals)
    } catch {
      return null
    }
  }, [tokenAUserBal, tokenADecimals])

  const exceedsPool = useMemo(() => {
    if (!amountWei || !tokenBBalance) return false
    try {
      return amountWei > tokenBBalance
    } catch {
      return false
    }
  }, [amountWei, tokenBBalance])

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && contractAddress ? [address, contractAddress] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress && address && contractAddress) }
  })

  const { writeContractAsync } = useWriteContract()

  async function handleMigrate() {
    try {
      if (!isConnected) return
      if (!contractAddress) {
        toast.error('Migration contract not configured')
        return
      }
      await refetchTokenA()
      if (!tokenAAddress) {
        toast.error('Could not read tokenA from contract')
        return
      }
      if (!amountWei || amountWei <= 0n) {
        toast.error('Enter a valid amount > 0')
        return
      }
      // Check user has enough Token A
      if (tokenAUserBal != null && tokenAUserBal < amountWei) {
        toast.error('Insufficient Token A balance for this amount')
        return
      }
      // Check pool has enough Token B
      if (tokenBBalance != null && tokenBBalance < amountWei) {
        toast.error('Contract has insufficient Token B liquidity for this amount')
        return
      }
      setBusy(true)
      // Ensure allowance; auto-approve if needed
      const latest = allowance ?? (await refetchAllowance())?.data ?? 0n
      if (latest < amountWei) {
        toast.info('Approving tokenA... Confirm in wallet')
        try {
          const approveSim = await simulateContract(wagmiConfig, {
            address: tokenAAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, amountWei],
            account: address
          })
          const approveHash = await writeContractAsync(approveSim.request)
          await waitForTransactionReceipt(wagmiConfig, { hash: approveHash, chainId })
          toast.success('Approval confirmed')
        } catch {
          // Fallback for tokens requiring resetting allowance to 0 first (e.g., USDT-style)
          toast.info('Retrying approval (reset to 0 then set)')
          const resetSim = await simulateContract(wagmiConfig, {
            address: tokenAAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, 0n],
            account: address
          })
          const resetHash = await writeContractAsync(resetSim.request)
          await waitForTransactionReceipt(wagmiConfig, { hash: resetHash, chainId })

          const setSim = await simulateContract(wagmiConfig, {
            address: tokenAAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, amountWei],
            account: address
          })
          const setHash = await writeContractAsync(setSim.request)
          await waitForTransactionReceipt(wagmiConfig, { hash: setHash, chainId })
          toast.success('Approval confirmed')
        }
      } else {
        toast.info('Allowance sufficient, skipping approval')
      }

      toast.info('Migrating... Confirm in wallet')
      let migrateHash
      try {
        const migrateSim = await simulateContract(wagmiConfig, {
          address: contractAddress,
          abi: MIGRATION_ABI,
          functionName: 'migrate',
          args: [amountWei],
          account: address
        })
        migrateHash = await writeContractAsync(migrateSim.request)
      } catch {
        // Fallback: some RPCs revert on eth_call though on-chain send succeeds (e.g., gated flags in modifiers)
        toast.info('Submitting migrate without simulation...')
        migrateHash = await writeContractAsync({
          address: contractAddress,
          abi: MIGRATION_ABI,
          functionName: 'migrate',
          args: [amountWei],
          gas: FALLBACK_MIGRATE_GAS
        })
      }
      await waitForTransactionReceipt(wagmiConfig, { hash: migrateHash, chainId })
      toast.success('Migration complete')
    } catch (err) {
      const message = (err && err.message) || 'Transaction failed'
      toast.error(message)
    }
    finally {
      setBusy(false)
    }
  }

  return (
    <div className=" mx-auto ">
      <Navbar />

      <div className="grid gap-3 mt-4 max-w-4xl mx-auto rounded-2xl border border-emerald-400/60 p-6 md:p-8">
        <TokenSelector
          selectedToken={selectedToken}
          onChange={setSelectedToken}
          tokenASymbol={tokenASymbol}
          tokenADecimals={tokenADecimals}
          tokenAUserBal={tokenAUserBal}
        />

        <AmountInput amount={amount} onChange={setAmount} symbol={tokenASymbol} />

        <MigrateAction
          onClick={handleMigrate}
          busy={busy}
          disabled={!isConnected || busy || !amountWei || (amountWei && amountWei <= 0n) || exceedsPool}
        />

        <div className="grid gap-1 text-xs text-zinc-400">
          <div>Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</div>
          <div>Token A: {tokenAAddress ? `${tokenAAddress.slice(0, 6)}...${tokenAAddress.slice(-4)}` : '—'}</div>
          <div>Token B: {tokenBAddress ? `${tokenBAddress.slice(0, 6)}...${tokenBAddress.slice(-4)}` : '—'}</div>
          <div>{tokenBSymbol || 'TokenB'} Liquidity: {tokenBBalanceFormatted ?? '—'}</div>
          <div>{tokenASymbol || 'TokenA'} Your Balance: {tokenAUserBalFormatted ?? '—'}</div>
          {exceedsPool ? (
            <div className="text-amber-300">Amount exceeds Token B liquidity in pool. Reduce amount or fund contract.</div>
          ) : null}
      </div>
      </div>

      <Footer />
      <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover theme="colored" />
    </div>
  )
}

export default App
