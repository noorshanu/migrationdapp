import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'

const projectId = '2f4da7b40d4f371ee01ffcee4851dff2'
// Put Sepolia first so default/public reads happen on Sepolia when no wallet is connected
const networks = [sepolia, mainnet]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: sepolia
})

// Optional: make available globally for debugging
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-undef
  window.appKit = appKit
}


