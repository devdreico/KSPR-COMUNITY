import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white/60" />
            </span>
            <span className="text-xs font-semibold tracking-widest text-white/50 uppercase">
              Compra tu acceso permanente
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-8"
          >
            Tu licencia.
            <br />
            <span className="gradient-text">Para siempre.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-white/40 max-w-lg leading-relaxed mb-10"
          >
            Compra la licencia permanente de KSPR CLI y recibe tu clave de activación en el correo que indiques, con pago único y entrega automática.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-6"
          >
            {[
              { num: '01', text: 'Pago único' },
              { num: '02', text: 'Activación permanente' },
              { num: '03', text: 'Entrega automática' },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-3">
                <span className="text-xs font-bold text-white/70 mt-0.5">{item.num}</span>
                <span className="text-sm font-medium text-white/50">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Decorative orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="relative w-80 h-80">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute inset-4 rounded-full border border-white/[0.06] animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            {/* Inner glow */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] animate-pulse-slow" />
            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img
                src="/kspr-logo.png"
                alt="KSPR CLI"
                className="w-28 h-28 rounded-3xl shadow-2xl grayscale"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
