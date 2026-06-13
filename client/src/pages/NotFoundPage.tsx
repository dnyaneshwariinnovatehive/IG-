import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="flex flex-col items-center text-center max-w-lg">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 shadow-inner"
        >
          <SearchX size={44} className="text-accent opacity-70" />
        </motion.div>

        {/* 404 number */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-sora font-bold text-9xl leading-none bg-gradient-to-r from-[#2563EB] via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="font-sora font-bold text-2xl text-[#0F172A] mb-3"
        >
          Page not found
        </motion.h2>

        {/* Sub-text */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.28 }}
          className="text-slate-500 text-base mb-8 leading-relaxed"
        >
          The page you're looking for doesn't exist or may have been moved.
          <br className="hidden sm:block" />
          Head back home and explore our project catalogue.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.36 }}
          className="flex items-center gap-3"
        >
          <Button asChild variant="primary" size="lg">
            <Link to="/">
              <Home size={16} />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/browse">Browse Projects</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
