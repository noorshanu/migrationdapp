import { useAccount } from 'wagmi'
import { appKit } from '../lib/appkit'

function truncate(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function ConnectButton() {
  const { address, isConnected } = useAccount()

  return (
    <button
      onClick={() => appKit?.open?.()}
      className="relative inline-flex items-center"
      aria-label="Connect wallet"
    >
      <span className="absolute -left-3">
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-5 w-5 rounded-full border-2 border-white/80"></span>
          <span className={`inline-flex h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`}></span>
        </span>
      </span>

      <span className="outline outline-2 outline-emerald-400 rounded-md p-1">
        <span className="rounded-md border border-zinc-700 bg-black px-4 py-2 text-white font-semibold">
          {isConnected ? truncate(address) : 'Connect Wallet'}
        </span>
      </span>
    </button>
  )
}


