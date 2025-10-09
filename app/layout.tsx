import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Diverce',
    template: '%s | Diverce',
  },
  description: 'Convert Next.js projects from Vercel to Cloudflare easily.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col bg-background`}>
        <header className="border-b border-accents-2 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/" className="text-foreground hover:text-foreground">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-vercel">Di</span>
                    <span className="text-vercel">verce</span>
                  </span>
                </Link>
              </div>
              <nav className="flex items-center space-x-8">
                <Link href="/dashboard" className="text-foreground-secondary hover:text-foreground transition-colors">
                  Projects
                </Link>
                <a 
                  href="https://github.com/yourusername/diverce" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground-secondary hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t border-accents-2 py-6 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-foreground-tertiary text-sm">
                &copy; {new Date().getFullYear()} Diverce. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-foreground-tertiary text-sm">
                  Built with Next.js and Tailwind CSS
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 