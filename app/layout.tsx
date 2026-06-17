import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Signature — Untitled Studio',
  description: 'Signez votre contrat en ligne',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f5', color: '#1a1a1a' }}>
        {children}
      </body>
    </html>
  )
}
