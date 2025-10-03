import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MANA2',
  description: 'MANA2 - Your Ultimate Food Experience',
  generator: 'MANA2',
  icons: {
    icon: '/images/MANA2-logo.jpeg', 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
