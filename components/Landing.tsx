'use client';

import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-gray-900 dark:via-rose-950/20 dark:to-gray-900 flex flex-col">
      {/* Hero */}
      <header className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <nav className="flex items-center justify-between mb-10 sm:mb-16 gap-4">
          <span className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500 truncate min-w-0">
            Repeat
          </span>
          <div className="flex gap-2 sm:gap-4 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2.5 min-h-[44px] flex items-center rounded-full sm:rounded-none text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 font-medium transition-colors touch-manipulation"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 sm:px-5 py-2.5 min-h-[44px] flex items-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-rose-200 dark:hover:shadow-rose-900/50 transition-all touch-manipulation text-center"
            >
              Get started
            </Link>
          </div>
        </nav>

        <section className="text-center max-w-3xl mx-auto px-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            Master anything with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500">
              spaced repetition
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 px-1">
            Create flashcards, organize them in sets, and let smart scheduling help you remember forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-base sm:text-lg shadow-xl hover:shadow-rose-200 dark:hover:shadow-rose-900/50 transition-all touch-manipulation"
            >
              Start learning free
            </Link>
            <Link
              href="/login"
              className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] flex items-center justify-center rounded-full border-2 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-base sm:text-lg transition-colors touch-manipulation"
            >
              I have an account
            </Link>
          </div>
        </section>
      </header>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl flex-1">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-lg min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white text-xl font-bold mb-4">
              📚
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Flashcards & sets</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Create cards, group them in sets, and browse or import public sets from the community.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-lg min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white text-xl font-bold mb-4">
              🧠
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Smart scheduling</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Quiz mode with spaced repetition: Hard, Good, Easy—so you review at the right time.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 sm:p-8 border border-rose-100 dark:border-rose-900/50 shadow-lg min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white text-xl font-bold mb-4">
              📅
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">Track progress</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Calendar view and stats show what you’ve learned and what’s due today.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-200 dark:border-rose-900/50 bg-white/50 dark:bg-gray-900/50 py-6">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Repeat. By{' '}
            <a
              href="https://github.com/dannygarciadev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
            >
              dannygarciadev
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
