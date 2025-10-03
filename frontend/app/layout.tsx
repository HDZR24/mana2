import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NutriAI',
  description: 'NutriAI - Your Ultimate Food Experience',
  generator: 'NutriAI',
  icons: {
    icon: '/images/NutriAI-logo.jpeg', 
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
