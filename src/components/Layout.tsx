import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob w-[600px] h-[600px] bg-white/[0.04] top-[-200px] left-[-200px] animate-float" />
        <div className="bg-blob w-[500px] h-[500px] bg-white/[0.03] top-[30%] right-[-150px] animate-float-slow" />
        <div className="bg-blob w-[400px] h-[400px] bg-white/[0.02] bottom-[-100px] left-[30%] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img
              src="/kspr-logo.png"
              alt="KSPR"
              className="w-10 h-10 rounded-xl grayscale"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight">KSPR</span>
              <span className="text-lg font-bold text-white/70">CLI</span>
              <span className="text-xs font-medium text-white/30 ml-1">STORE</span>
            </div>
          </Link>
          <a
            href="#como-funciona"
            className="text-sm font-semibold text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
          >
            Cómo funciona
            <span className="text-white/60">↘</span>
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-32">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-xs font-medium text-white/20">© KSPR CLI</span>
          <span className="text-xs font-medium text-white/20">Licencia digital · Entrega automática</span>
        </div>
      </footer>
    </div>
  );
}
