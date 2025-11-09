import { useAccount } from 'wagmi'
import { motion as Motion } from 'framer-motion'
import { appKit } from '../lib/appkit'

function truncate(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const connectedLabel = isConnected ? truncate(address) : 'Connect Wallet'

  return (
    <Motion.button
      onClick={() => appKit?.open?.()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-linear-to-r from-cyan-500 to-green-500 text-black px-4 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-green-600 transition-all duration-200 flex items-center justify-center space-x-2 border border-green-400"
      aria-label="Connect wallet"
    >
      <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-black' : 'bg-black/60'}`}></div>
      </div>
      <span>{connectedLabel}</span>
    </Motion.button>
  )
}


