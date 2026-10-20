'use client'

import Logo from './Logo'

interface WhatsAppMessageProps {
  sender?: string
  role?: string
  summary?: string
  suggested?: string
  timer?: string
  className?: string
}

export default function WhatsAppMessage({
  sender = 'Tosin Adeyemi',
  role = 'Operations Manager',
  summary = 'Tosin is requesting approval to reorder 50kg of rice for the kitchen before Friday\'s service.',
  suggested = 'Approved. Please ensure the order is logged in the system and a receipt submitted to accounts before close of work today.',
  timer = '10 minutes',
  className = '',
}: WhatsAppMessageProps) {
  return (
    <div className={`max-w-sm ${className}`}>
      {/* Phone frame */}
      <div className="bg-[#0D1B2A] rounded-3xl p-3 shadow-elevated">
        {/* WhatsApp header */}
        <div className="bg-[#25D366] rounded-2xl rounded-b-none px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xs">
            <Logo showWordmark={false} size="sm" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Haelo</p>
            <p className="text-white/70 text-xs">AI Chief of Staff</p>
          </div>
          <div className="ml-auto flex gap-1.5">
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="w-1 h-1 bg-white/50 rounded-full" />
          </div>
        </div>

        {/* Chat area */}
        <div className="bg-[#1a2535] rounded-2xl rounded-t-none px-4 py-4 space-y-3 min-h-[200px]">
          {/* Haelo message bubble */}
          <div className="flex flex-col gap-2">
            <div className="bg-[#0D1B2A] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
              <p className="text-[#25D366] text-xs font-bold uppercase tracking-wide mb-2">New Internal Email</p>
              <p className="text-white/60 text-xs mb-1">
                <span className="text-white font-bold">From:</span> {sender}
              </p>
              <p className="text-white/60 text-xs mb-2">
                <span className="text-white font-bold">Role:</span> {role}
              </p>
              <p className="text-white/80 text-xs mb-3 leading-relaxed">
                <span className="text-white font-bold">Summary:</span> {summary}
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
                <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-1">Suggested reply</p>
                <p className="text-white text-xs leading-relaxed italic">&ldquo;{suggested}&rdquo;</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <span className="bg-[#25D366]/20 text-[#25D366] text-xs font-bold px-3 py-1 rounded-full">Reply YES to send</span>
                  <span className="bg-white/10 text-white/70 text-xs font-bold px-3 py-1 rounded-full">Reply NO to edit</span>
                </div>
                <p className="text-white/40 text-xs">Auto-sends in {timer}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-[#162338] rounded-2xl rounded-t-none px-4 py-3 flex items-center gap-2">
          <div className="flex-1 bg-[#0D1B2A] rounded-full px-4 py-2 text-xs text-white/30">
            Reply YES or NO...
          </div>
          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
