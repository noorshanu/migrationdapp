export default function ApproveAction({ onClick, disabled, busy }) {
  const isDisabled = Boolean(disabled)
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/70 px-6 py-4 text-lg font-semibold text-white disabled:cursor-not-allowed border border-zinc-700"
    >
      {busy ? 'Approving...' : 'Approve Token'}
    </button>
  )
}



