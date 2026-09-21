import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Completa tus datos',
    desc: 'Usaremos tu nombre y correo únicamente para identificar la compra y entregarte la KEY.',
  },
  {
    num: '02',
    title: 'Realiza el pago',
    desc: 'Mercado Pago procesa tu compra con los medios de pago disponibles en tu país.',
  },
  {
    num: '03',
    title: 'Recibe tu licencia',
    desc: 'Cuando el pago sea aprobado, enviamos tu KEY de uso permanente al correo indicado.',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24 items-start">
        {/* Heading */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold tracking-widest text-white/40 mb-6"
          >
            EL RECORRIDO
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black leading-tight tracking-tight"
          >
            De pago a terminal
            <br />
            <span className="gradient-text">en tres pasos.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6 md:p-8 group hover:border-white/15 transition-all duration-500"
            >
              <span className="text-xs font-bold text-white/50">{step.num}</span>
              <h3 className="text-base font-bold mt-5 mb-3 group-hover:text-white transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-xs text-white/35 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
