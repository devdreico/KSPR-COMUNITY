import { motion } from 'framer-motion';

const features = [
  {
    icon: '∞',
    title: 'Sin suscripciones',
    desc: 'Un solo pago, para siempre',
  },
  {
    icon: '@',
    title: 'Entrega al correo',
    desc: 'Recibe la KEY automáticamente',
  },
  {
    icon: '⌘',
    title: 'Listo para tu CLI',
    desc: 'Activa y empieza a crear',
  },
];

export default function FeaturesBar() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16">
      <div className="glass rounded-3xl p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 text-lg font-bold shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
