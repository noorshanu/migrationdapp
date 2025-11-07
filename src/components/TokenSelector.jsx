import { formatUnits } from 'viem'

export default function TokenSelector({ selectedToken, onChange, tokenASymbol, tokenADecimals, tokenAUserBal }) {
  const tokenALabel = tokenASymbol || 'TokenA'
  const tokenABalance =
    tokenADecimals != null && tokenAUserBal != null ? ` - Balance: ${formatUnits(tokenAUserBal, tokenADecimals)}` : ''

  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-300">Token to swap</span>
      <select
        value={selectedToken}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-[#141a23] px-4 py-4 text-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <option value="tokenA">
          {tokenALabel}
          {tokenABalance}
        </option>
      </select>
    </label>
  )
}


