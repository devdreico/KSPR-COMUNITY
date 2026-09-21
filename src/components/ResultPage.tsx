import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import GlassCard from './ui/GlassCard';

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('external_reference');
  const { status, order, copied, copyKey } = useOrderStatus(orderId);

  const stateConfig = {
    pending: {
      eyebrow: 'CONFIRMANDO TU COMPRA',
      title: ['Estamos verificando', 'tu pago.'],
      copy: 'Mercado Pago está enviando la confirmación. Esta página se actualizará automáticamente.',
    },
    delivered: {
      eyebrow: 'PAGO CONFIRMADO',
      title: ['Tu acceso está', 'listo.'],
      copy: 'Guarda esta KEY para activar KSPR CLI. También la enviamos al correo que registraste.',
    },
    failed: {
      eyebrow: 'PAGO NO COMPLETADO',
      title: ['No se realizó', 'el pago.'],
      copy: 'No se generó ninguna licencia. Puedes volver al inicio e intentarlo nuevamente.',
    },
  };

  const current = stateConfig[status];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/kspr-logo.png" alt="KSPR" className="w-10 h-10 rounded-xl grayscale" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight">KSPR</span>
              <span className="text-lg font-bold text-white/70">CLI</span>
              <span className="text-xs font-medium text-white/30 ml-1">STORE</span>
            </div>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
          >
            Volver al inicio
            <span className="text-white/60">↗</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-lg">
          {/* Logo orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 mx-auto mb-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.03]
              flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.05)]"
          >
            <img src="/kspr-logo.png" alt="K" className="w-12 h-12 rounded-xl grayscale" />
          </motion.div>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-semibold tracking-widest text-white/40 mb-6"
          >
            {current.eyebrow}
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6"
          >
            {current.title[0]}
            <br />
            <span className="gradient-text">{current.title[1]}</span>
          </motion.h1>

          {/* Copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-white/40 leading-relaxed mb-10"
          >
            {!orderId
              ? 'No encontramos la referencia de la compra. Si el pago fue aprobado, escríbenos para revisar tu pedido.'
              : current.copy}
          </motion.p>

          {/* License reveal */}
          <AnimatePresence>
            {status === 'delivered' && order?.licenseKey && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <GlassCard className="p-6 md:p-8 mb-8" delay={0}>
                  <p className="text-xs font-semibold tracking-widest text-white/25 uppercase mb-4">
                    Tu KEY de uso permanente
                  </p>
                  <div className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <code className="flex-1 text-white/80 font-mono text-sm md:text-base font-bold break-all">
                      {order.licenseKey}
                    </code>
                    <button
                      onClick={copyKey}
                      className="shrink-0 px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-bold
                        hover:bg-white/15 active:scale-95 transition-all duration-200"
                    >
                      {copied ? 'Copiada' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-white/20 mt-4">También la enviamos al correo que registraste.</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loader */}
          {status === 'pending' && orderId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/50"
                  animate={{ scale: [0.65, 1, 0.65], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          )}

          {/* Back link */}
          {status !== 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors duration-300"
              >
                Volver al inicio
                <span className="text-white/60">↗</span>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-xs font-medium text-white/20">© KSPR CLI</span>
          <span className="text-xs font-medium text-white/20">Tu acceso, para siempre.</span>
        </div>
      </footer>
    </div>
  );
}
