import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

// ✅ Dynamic metadata for SEO
export const metadata: Metadata = {
  title: 'Home',
  description:
    'Diverce helps you seamlessly migrate your Next.js projects from Vercel to Cloudflare with zero configuration hassle.',
}

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-background-secondary px-4 pt-20 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
            Move from{' '}
            <span className="text-vercel bg-clip-text text-transparent bg-gradient-to-r from-[#000] to-[#555]">
              Vercel
            </span>{' '}
            to{' '}
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
              Cloudflare
            </span>{' '}
            seamlessly
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground-secondary max-w-3xl mx-auto">
            Diverce automatically converts your Next.js projects from Vercel to
            Cloudflare — no manual config, no stress, just one smooth migration.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="btn-primary py-3 px-8 text-base font-medium"
            >
              Get Started
            </Link>
            <a
              href="https://github.com/ygwyg/diverce"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-3 px-8 text-base font-medium"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-background-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Simple Migration Process
            </h2>
            <p className="mt-4 text-lg text-foreground-secondary">
              Let Diverce handle all the configuration so you can focus on your
              code.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="card hover:shadow-medium transition-shadow duration-300 p-6 rounded-2xl bg-white">
              <div className="h-12 w-12 rounded-full bg-primary-lighter flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Automated Conversion
              </h3>
              <p className="text-foreground-secondary">
                Diverce automatically updates your dependencies and config to
                use <code>@opennextjs/cloudflare</code>.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card hover:shadow-medium transition-shadow duration-300 p-6 rounded-2xl bg-white">
              <div className="h-12 w-12 rounded-full bg-secondary-lighter flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Zero Code Changes
              </h3>
              <p className="text-foreground-secondary">
                Move to Cloudflare without modifying your existing code — all
                migration handled automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card hover:shadow-medium transition-shadow duration-300 p-6 rounded-2xl bg-white">
              <div className="h-12 w-12 rounded-full bg-success-lighter flex items-center justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Secure & Private
              </h3>
              <p className="text-foreground-secondary">
                Your code never leaves your local environment. Diverce performs
                all transformations securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-foreground-secondary">
              Three easy steps to move your Next.js app from Vercel to
              Cloudflare.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                step: 1,
                title: 'Connect Your Vercel Account',
                text: 'Sign in with your Vercel account to access your projects.',
              },
              {
                step: 2,
                title: 'Select a Project',
                text: 'Choose the Next.js project you want to migrate to Cloudflare.',
              },
              {
                step: 3,
                title: 'Start Conversion',
                text: 'Click convert and let Diverce handle the entire process automatically.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="card hover:shadow-medium transition-all duration-300 p-6 rounded-2xl bg-background-secondary relative">
                  <div className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">
                    {item.title}
                  </h3>
                  <p className="text-foreground-secondary">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/dashboard"
              className="btn-primary py-3 px-8 text-base font-medium"
            >
              Try It Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 sm:py-28 text-center text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            Ready to migrate your Next.js projects?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Diverce makes it simple, safe, and fast to move from Vercel to
            Cloudflare.
          </p>
          <Link
            href="/dashboard"
            className="bg-white text-primary font-medium hover:bg-background py-3 px-8 rounded-lg shadow-medium hover:shadow-large transition-all"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}
