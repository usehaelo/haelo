import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haelo — Your AI Chief of Staff',
  description: 'Be everywhere. Miss nothing. Haelo reads your internal emails, summarises them, and sends you approved responses via WhatsApp.',
  keywords: 'AI executive assistant, email management, WhatsApp, business communication',
  openGraph: {
    title: 'Haelo — Your AI Chief of Staff',
    description: 'Be everywhere. Miss nothing.',
    url: 'https://usehaelo.com',
    siteName: 'Haelo',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo/halo-icon.png" type="image/png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
