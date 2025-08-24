import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Arena of Consciousness',
  description: 'An experimental platform where consciousness is contested and ephemeral',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
