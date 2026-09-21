import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckout } from '@/hooks/useCheckout';
import { getConfig } from '@/lib/api';
import type { StoreConfig } from '@/types';
import GlassCard from './ui/GlassCard';
import AnimatedButton from './ui/AnimatedButton';

export default function PurchaseCard() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });
  const { checkout, loading, error, clearError } = useCheckout();

  useEffect(() => {
    getConfig().then(setConfig).catch(() => {});
  }, []);

  const nameValid = name.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = nameValid && emailValid && config?.canPurchase && !loading;

  const nameError = touched.name && !nameValid ? 'Escribe tu nombre y apellido' : '';
  const emailError = touched.email && !emailValid ? 'Escribe un correo electrónico válido' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    clearError();
    if (!canSubmit) return;
    await checkout(name.trim(), email.trim());
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'COP' ? 0 : 2,
    }).format(price);
  };

  return (
    <section className="relative max-w-7xl mx-auto px-6 -mt-4 mb-20">
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-md p-8 md:p-10" delay={0.2}>
          {/* Header */}
          <div className="text-xs font-semibold tracking-widest text-white/40 mb-4">
            LICENCIA PERMANENTE
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1">
            KSPR CLI
          </h2>
          <p className="text-sm text-white/30 mb-6">Una KEY. Acceso de por vida.</p>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-4xl font-black tracking-tight">
              {config ? formatPrice(config.price, config.currency) : '—'}
            </span>
            <span className="text-xs font-medium text-white/30">pago único</span>
          </div>

          {/* USD reference */}
          <div className="text-xs font-medium text-white/25 mb-5">
            Equivalente a <span className="text-white/80 font-bold">$5.00 USD</span>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 mb-8">
            <span className="relative flex h-2 w-2">
              {config?.inventoryAvailable ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white/60" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/20" />
              )}
            </span>
            <span className={`text-xs font-semibold ${config?.inventoryAvailable ? 'text-white/60' : 'text-white/30'}`}>
              {!config
                ? 'Comprobando disponibilidad…'
                : !config.paymentConfigured
                  ? 'Checkout pendiente de configuración'
                  : !config.inventoryAvailable
                    ? 'Licencias agotadas temporalmente'
                    : 'Disponible · entrega automática'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-white/50 mb-2">
                Nombre y apellido
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Tu nombre completo"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm
                  placeholder:text-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/10
                  transition-all duration-300 outline-none"
              />
              <AnimatePresence>
                {nameError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-white/40 mt-1.5"
                  >
                    {nameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-white/50 mb-2">
                Correo electrónico <span className="text-white/70">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm
                  placeholder:text-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/10
                  transition-all duration-300 outline-none"
              />
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-white/40 mt-1.5"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
              <p className="text-xs text-white/20 mt-1.5">Aquí enviaremos tu KEY de uso permanente.</p>
            </div>

            <AnimatedButton
              type="submit"
              loading={loading}
              disabled={!canSubmit}
              className="w-full h-14 text-sm"
            >
              <span className="flex items-center justify-between w-full">
                Continuar con Mercado Pago
                <span className="text-lg">↗</span>
              </span>
            </AnimatedButton>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-white/40 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-center text-[10px] text-white/15 font-medium">
              <span className="text-white/50 mr-1">⌁</span>
              Pago procesado de forma segura por Mercado Pago
            </p>
          </form>
        </GlassCard>
      </div>
    </section>
  );
}
