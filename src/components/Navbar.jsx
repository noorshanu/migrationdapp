import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import ConnectButton from './ConnectButton.jsx'

function IconLink({ href, children, label }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-zinc-700 text-white hover:bg-zinc-800"
    >
      {children}
    </a>
  )
}

export default function Navbar() {
  return (
    <div className="flex items-center justify-between gap-3 py-3 sticky top-0 bg-black z-10 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg"><img src="/logo.png" alt="Lunex" className="h-10 object-contain" /></div>
        <div className="hidden" aria-hidden />
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden" aria-hidden />
        <div className="flex gap-2">
          <IconLink href="https://twitter.com" label="Twitter">
            <FaTwitter size={16} />
          </IconLink>
          <IconLink href="https://discord.com" label="Discord">
            <FaDiscord size={16} />
          </IconLink>
          <IconLink href="https://github.com" label="GitHub">
            <FaGithub size={16} />
          </IconLink>
        </div>
        <ConnectButton />
      </div>
    </div>
  )
}


