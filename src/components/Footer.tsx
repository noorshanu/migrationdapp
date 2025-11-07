import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-[#2D2C2D] mt-12">
      {/* Stage 1: Align elements using a strict 12-col grid (borders minimal) */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Row 1: Logo left, Stores right */}
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-12 md:col-span-6 flex items-center space-x-3 py-6">
           <img src="/logo.png" alt="Lunex" className="h-10 object-contain" />
          </div>
          <div className="col-span-12 md:col-span-6 md:justify-self-end py-6 text-right">
            <p className="text-base mb-3 text-gray-200">Available Soon On</p>
            <div className="flex md:justify-end gap-3">
              <img src="/images/google.png" alt="Google Play" className="h-8 object-contain" />
              <img src="/images/app.png" alt="App Store" className="h-8 object-contain" />
            </div>
          </div>
        </div>

        {/* Row 2: CTA button under logo area, socials on right */}
        <div className="grid grid-cols-12 items-center pb-2 pt-1 px-2 border border-[#2D2C2D]">
          <div className="col-span-12 md:col-span-6">
            <div className="inline-block relative">
              <button className="group relative z-10 border border-emerald-400 px-6 py-3 text-sm font-semibold tracking-widest flex items-center gap-3">
                <span>JOIN PRESALE</span>
                <span className="-mr-1">→</span>
              </button>
              {/* offset underline accent like screenshot */}
              <span className="absolute left-3 right-0 -bottom-2 h-1 bg-emerald-400"></span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-6 md:justify-self-end">
            <div className="flex items-center gap-5">
              <span className="text-emerald-300 font-medium">// Socials</span>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-500">
                  <img src="/images/xxx.png" alt="X" className="h-4" />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-500">
                  <img src="/images/tele.png" alt="Telegram" className="h-4" />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-500">
                  <img src="/images/media.png" alt="Medium" className="h-4" />
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-500">
                  <img src="/images/insta.png" alt="Instagram" className="h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Contact emails three columns */}
        <div className="py-10 border border-[#2D2C2D]">
          <div className="grid grid-cols-12 gap-6">
            {/* Technical Support */}
            <div className="col-span-12 md:col-span-4 flex items-start gap-3">
              <svg className="w-4 h-4 text-white mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div>
                <p className="text-emerald-300 text-sm font-semibold">Technical Support:</p>
                <p className="text-gray-200 text-sm">support@lunexnetwork.com</p>
              </div>
            </div>
            
            {/* Marketing */}
            <div className="col-span-12 md:col-span-4 flex items-start gap-3">
              <svg className="w-4 h-4 text-white mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div>
                <p className="text-emerald-300 text-sm font-semibold">Marketing:</p>
                <p className="text-gray-200 text-sm">marketing@lunexnetwork.com</p>
              </div>
            </div>
            
            {/* Investors */}
            <div className="col-span-12 md:col-span-4 flex items-start gap-3">
              <svg className="w-4 h-4 text-white mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div>
                <p className="text-emerald-300 text-sm font-semibold">InvestorsMarketing:</p>
                <p className="text-gray-200 text-sm">investors@lunexnetwork.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Disclaimer left, links right */}
        <div className="py-10">
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left side - Disclaimer */}
            <div className="col-span-12 md:col-span-8 pr-6">
              <p className="text-emerald-300 text-sm font-semibold mb-2">Disclaimer:</p>
              <p className="text-gray-200 text-sm leading-relaxed">
                Digital currencies may be unregulated in your jurisdiction. The value of digital currencies may go down as well as up. Profits may be subject to capital gains or other taxes applicable in your jurisdiction.
              </p>
            </div>
            
            {/* Right side - Links */}
            <div className="col-span-12 md:col-span-4 md:justify-self-end flex gap-6">
              <a href="#" className="text-gray-200 text-sm underline hover:text-gray-300">Privacy</a>
              <a href="#" className="text-gray-200 text-sm underline hover:text-gray-300">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
