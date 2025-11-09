import { useCallback, useEffect, useMemo, useState } from 'react'
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
import ApproveAction from './components/ApproveAction.jsx'

function App() {
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()
  const chainId = useChainId()
  const FALLBACK_MIGRATE_GAS = 400000n
  const TARGET_CHAIN_ID = 11155111 // Sepolia

  // Debug logging
  const [debugOpen, setDebugOpen] = useState(true)
  const [logs, setLogs] = useState([])
  const jsonReplacer = (key, value) => (typeof value === 'bigint' ? value.toString() : value)
  const log = useCallback((message, data) => {
    const time = new Date().toISOString()
    try {
      console.log('[MIGRATION]', message, data ?? '')
      const entry = `${time} | ${message}${data !== undefined ? ' ' + JSON.stringify(data, jsonReplacer) : ''}`
      setLogs((prev) => [...prev.slice(-400), entry])
    } catch {
      console.log('[MIGRATION]', message)
      setLogs((prev) => [...prev.slice(-400), `${time} | ${message}`])
    }
  }, [])

  const [contractAddress] = useState('0x6189955C71682aBE37CC24da51A6D55EfCD5Cf3c')
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

  // Trace important reads when they change
  useEffect(() => { if (tokenAAddress) log('read tokenA', tokenAAddress) }, [tokenAAddress, log])

  const { data: tokenBAddress } = useReadContract({
    address: contractAddress || undefined,
    abi: MIGRATION_ABI,
    functionName: 'tokenB',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) }
  })
  useEffect(() => { if (tokenBAddress) log('read tokenB', tokenBAddress) }, [tokenBAddress, log])

  const { data: contractBalances } = useReadContract({
    address: contractAddress || undefined,
    abi: MIGRATION_ABI,
    functionName: 'contractBalances',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(contractAddress) }
  })
  useEffect(() => { if (contractBalances) log('read contractBalances', contractBalances) }, [contractBalances, log])

  const { data: tokenADecimals } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress) }
  })
  useEffect(() => { if (tokenADecimals != null) log('read tokenA decimals', tokenADecimals) }, [tokenADecimals, log])

  const { data: tokenASymbol } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress) }
  })
  useEffect(() => { if (tokenASymbol) log('read tokenA symbol', tokenASymbol) }, [tokenASymbol, log])

  const { data: tokenBDecimals } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenBAddress) }
  })
  useEffect(() => { if (tokenBDecimals != null) log('read tokenB decimals', tokenBDecimals) }, [tokenBDecimals, log])

  const { data: tokenBSymbol } = useReadContract({
    address: tokenBAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenBAddress) }
  })
  useEffect(() => { if (tokenBSymbol) log('read tokenB symbol', tokenBSymbol) }, [tokenBSymbol, log])

  const { data: tokenAUserBal } = useReadContract({
    address: tokenAAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: TARGET_CHAIN_ID,
    query: { enabled: Boolean(tokenAAddress && address) }
  })
  useEffect(() => { if (tokenAUserBal != null) log('read user tokenA balance', tokenAUserBal) }, [tokenAUserBal, log])

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
  useEffect(() => { if (allowance != null) log('read allowance', allowance) }, [allowance, log])

  const { writeContractAsync } = useWriteContract()

  const hasAllowance = useMemo(() => {
    if (!amountWei || allowance == null) return false
    try {
      return allowance >= amountWei
    } catch {
      return false
    }
  }, [allowance, amountWei])
  useEffect(() => { if (amountWei != null) log('computed amountWei', amountWei) }, [amountWei, log])
  useEffect(() => { log('computed hasAllowance', hasAllowance) }, [hasAllowance, log])
  useEffect(() => { log('connection', { isConnected, chainId }) }, [isConnected, chainId, log])

  async function handleApprove() {
    try {
      log('approve:start', { amountWei })
      if (!isConnected) return
      if (!tokenAAddress || !contractAddress) {
        toast.error('Contract not configured')
        log('approve:error:not-configured')
        return
      }
      if (!amountWei || amountWei <= 0n) {
        toast.error('Enter a valid amount > 0')
        log('approve:error:invalid-amount')
        return
      }
      setBusy(true)
      toast.info('Approving tokenA... Confirm in wallet')
      try {
        log('approve:simulate')
        const approveSim = await simulateContract(wagmiConfig, {
          address: tokenAAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress, amountWei],
          account: address
        })
        log('approve:send', approveSim.request)
        const approveHash = await writeContractAsync(approveSim.request)
        log('approve:hash', approveHash)
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash, chainId })
      } catch {
        // Reset to 0 then set amount
        log('approve:fallback:reset-0')
        const resetSim = await simulateContract(wagmiConfig, {
          address: tokenAAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress, 0n],
          account: address
        })
        const resetHash = await writeContractAsync(resetSim.request)
        log('approve:fallback:reset-0-hash', resetHash)
        await waitForTransactionReceipt(wagmiConfig, { hash: resetHash, chainId })

        log('approve:fallback:set-amount')
        const setSim = await simulateContract(wagmiConfig, {
          address: tokenAAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress, amountWei],
          account: address
        })
        const setHash = await writeContractAsync(setSim.request)
        log('approve:fallback:set-amount-hash', setHash)
        await waitForTransactionReceipt(wagmiConfig, { hash: setHash, chainId })
      }
      await refetchAllowance()
      toast.success('Approval confirmed')
      log('approve:done')
    } catch (err) {
      const message = (err && err.message) || 'Approval failed'
      toast.error(message)
      log('approve:error', { message })
    } finally {
      setBusy(false)
    }
  }

  async function handleMigrate() {
    try {
      log('migrate:start', { amountWei })
      if (!isConnected) return
      if (!contractAddress) {
        toast.error('Migration contract not configured')
        log('migrate:error:not-configured')
        return
      }
      await refetchTokenA()
      if (!tokenAAddress) {
        toast.error('Could not read tokenA from contract')
        log('migrate:error:no-tokenA')
        return
      }
      if (!amountWei || amountWei <= 0n) {
        toast.error('Enter a valid amount > 0')
        log('migrate:error:invalid-amount')
        return
      }
      // Check user has enough Token A
      if (tokenAUserBal != null && tokenAUserBal < amountWei) {
        toast.error('Insufficient Token A balance for this amount')
        log('migrate:error:insufficient-user-tokenA', { tokenAUserBal })
        return
      }
      // Check pool has enough Token B
      if (tokenBBalance != null && tokenBBalance < amountWei) {
        toast.error('Contract has insufficient Token B liquidity for this amount')
        log('migrate:error:insufficient-tokenB', { tokenBBalance })
        return
      }
      // Require prior approval step
      if (!hasAllowance) {
        toast.error('Please approve the amount first')
        log('migrate:error:no-allowance')
        return
      }
      // Preflight simulations to pinpoint token-side reverts
      try {
        log('preflight:tokenA.transferFrom simulate', { from: address, to: contractAddress, amountWei })
        await simulateContract(wagmiConfig, {
          address: tokenAAddress,
          abi: ERC20_ABI,
          functionName: 'transferFrom',
          args: [address, contractAddress, amountWei],
          // simulate as if called by migration contract
          account: contractAddress,
          chainId: TARGET_CHAIN_ID
        })
      } catch (e) {
        const message = (e && e.message) || 'tokenA transferFrom blocked'
        log('preflight:tokenA.transferFrom FAILED', { message })
        toast.error(`Token A transferFrom blocked: ${message}`)
        return
      }
      try {
        log('preflight:tokenB.transfer simulate', { to: address, amountWei })
        await simulateContract(wagmiConfig, {
          address: tokenBAddress,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [address, 1n],
          account: contractAddress,
          chainId: TARGET_CHAIN_ID
        })
      } catch (e) {
        const message = (e && e.message) || 'tokenB transfer blocked'
        log('preflight:tokenB.transfer FAILED', { message })
        toast.error(`Token B transfer blocked: ${message}`)
        return
      }
      setBusy(true)

      toast.info('Migrating... Confirm in wallet')
      let migrateHash
      try {
        log('migrate:simulate')
        const migrateSim = await simulateContract(wagmiConfig, {
          address: contractAddress,
          abi: MIGRATION_ABI,
          functionName: 'migrate',
          args: [amountWei],
          account: address
        })
        log('migrate:send', migrateSim.request)
        migrateHash = await writeContractAsync(migrateSim.request)
      } catch {
        // Fallback: some RPCs revert on eth_call though on-chain send succeeds (e.g., gated flags in modifiers)
        toast.info('Submitting migrate without simulation...')
        log('migrate:fallback:send-with-gas', { gas: FALLBACK_MIGRATE_GAS })
        migrateHash = await writeContractAsync({
          address: contractAddress,
          abi: MIGRATION_ABI,
          functionName: 'migrate',
          args: [amountWei],
          gas: FALLBACK_MIGRATE_GAS
        })
      }
      log('migrate:hash', migrateHash)
      await waitForTransactionReceipt(wagmiConfig, { hash: migrateHash, chainId })
      toast.success('Migration complete')
      log('migrate:done')
    } catch (err) {
      const message = (err && err.message) || 'Transaction failed'
      toast.error(message)
      log('migrate:error', { message })
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

        <div className="grid gap-3 sm:grid-cols-2">
          <ApproveAction
            onClick={handleApprove}
            busy={busy && !hasAllowance}
            disabled={!isConnected || busy || !amountWei || (amountWei && amountWei <= 0n) || hasAllowance}
          />
          <MigrateAction
            onClick={handleMigrate}
            busy={busy && hasAllowance}
            disabled={!isConnected || busy || !amountWei || (amountWei && amountWei <= 0n) || exceedsPool || !hasAllowance}
          />
        </div>

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

      {/* <div className="mt-6">
        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-white"
        >
          {debugOpen ? 'Hide' : 'Show'} Debug
        </button>
      </div> */}

    {/*  {debugOpen ? (
        <div className="mt-3 grid gap-2 rounded-xl border border-zinc-800 p-4 text-xs text-zinc-300">
          <div className="grid gap-1 md:grid-cols-2">
            <div>ChainId: {chainId ?? '—'} (target {TARGET_CHAIN_ID})</div>
            <div>Connected: {String(isConnected)}</div>
            <div>Contract: {contractAddress}</div>
            <div>Address: {address ?? '—'}</div>
            <div>tokenA: {tokenAAddress ?? '—'}</div>
            <div>tokenB: {tokenBAddress ?? '—'}</div>
            <div>tokenA decimals: {tokenADecimals ?? '—'}</div>
            <div>tokenB decimals: {tokenBDecimals ?? '—'}</div>
            <div>user tokenA: {tokenAUserBalFormatted ?? '—'}</div>
            <div>tokenB liquidity: {tokenBBalanceFormatted ?? '—'}</div>
            <div>allowance: {allowance != null ? allowance.toString() : '—'}</div>
            <div>amountWei: {amountWei != null ? amountWei.toString() : '—'}</div>
            <div>hasAllowance: {String(hasAllowance)}</div>
            <div>exceedsPool: {String(exceedsPool)}</div>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-800 bg-black/40 p-2 font-mono">
            {logs.length === 0 ? (
              <div className="text-zinc-500">No logs yet</div>
            ) : (
              logs.map((l, i) => (
                <div key={i}>{l}</div>
              ))
            )}
          </div>
        </div>
      ) : null} */}
    </div>
  )
}

export default App
