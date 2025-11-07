export default function AmountInput({ amount, onChange, symbol }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-300">Amount {symbol ? `(${symbol})` : ''}</span>
      <input
        type="number"
        min="0"
        step="any"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-[#141a23] px-4 py-4 text-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
      />
    </label>
  )
}


