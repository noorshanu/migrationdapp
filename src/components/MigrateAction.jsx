export default function MigrateAction({ onClick, disabled, busy }) {
  const isDisabled = Boolean(disabled)
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="w-full rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:bg-emerald-400/60 px-6 py-4 text-lg font-semibold text-black disabled:cursor-not-allowed"
    >
      {busy ? 'Processing...' : 'Migrate'}
    </button>
  )
}


