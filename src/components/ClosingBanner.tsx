import { motion } from 'framer-motion';

export default function ClosingBanner() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-kspr-dark-2 to-kspr-dark-3 border border-white/5 p-10 md:p-16"
      >
        {/* Background decorative K */}
        <div className="absolute right-10 md:right-20 top-[-40px] text-[200px] md:text-[300px] font-black text-white/[0.02] leading-none select-none pointer-events-none">
          K
        </div>

        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest text-white/40 mb-6">
            HECHO PARA CONSTRUIR
          </p>
          <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-8">
            Una licencia que
            <br />
            <span className="text-white/80">no caduca.</span>
          </h2>
          <a
            href="#comprar"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors duration-300 group"
          >
            Obtener KSPR CLI
            <span className="text-white/60 group-hover:translate-x-1 transition-transform duration-300">↗</span>
          </a>
        </div>

        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}
