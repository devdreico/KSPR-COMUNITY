# KSPR CLI — pasarela de compra y pago

Este repositorio funciona como storefront o pasarela de compra para la herramienta KSPR CLI. Permite vender una licencia permanente con checkout de Mercado Pago, validar la confirmación del pago y entregar la clave al cliente de forma automática.

## Qué incluye

- Landing page para promocionar la licencia de KSPR CLI
- Formulario de compra con nombre y correo
- Integración con Mercado Pago Checkout Pro
- Validación de webhook y verificación de pago aprobado
- Control de inventario de claves de licencia
- Envío de confirmación por Formspree
- Página de resultado con visualización de la clave una vez confirmada

## Requisitos

- Node.js 18.18 o superior
- Una cuenta de Mercado Pago con credenciales válidas
- Un dominio HTTPS público para producción
- Un endpoint de Formspree configurado para recibir correos

## Instalación local

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en el puerto configurado en `.env` (por defecto `3000`) y la interfaz Vite corre en el puerto estándar del proyecto.

## Variables de entorno

Configura estas variables en tu archivo `.env` antes de publicar:

```bash
NODE_ENV=production
PORT=3000
APP_URL=https://tu-dominio.com
MP_ACCESS_TOKEN=tu_access_token
MP_WEBHOOK_SECRET=tu_webhook_secret
LICENSE_PRICE=21000
LICENSE_CURRENCY=COP
PRODUCT_NAME=KSPR CLI — Licencia permanente
FORMSPREE_ENDPOINT=https://formspree.io/f/tu-form-id
```

Opcionalmente puedes cargar licencias desde `LICENSE_KEYS` o desde un archivo `access-codes.md` con este formato:

```text
<!-- LICENSE_KEYS_START -->
KSPR-KEY-001
KSPR-KEY-002
<!-- LICENSE_KEYS_END -->
```

## Flujo de venta

1. El usuario llena nombre y correo.
2. El backend crea una preferencia de pago en Mercado Pago.
3. El comprador completa el pago.
4. Mercado Pago envía un webhook a `/api/webhooks/mercadopago`.
5. El backend valida la firma, confirma el pago y entrega una clave disponible.
6. Se registra la orden y se envía un mensaje a Formspree con la confirmación.
7. La página de resultado muestra la clave solo cuando el pago quedó confirmado.

## Datos y seguridad

- `data/orders.json` almacena el historial de órdenes para evitar reutilizar licencias.
- No subas tu `.env` ni tus tokens reales al repositorio.
- En producción, `MP_WEBHOOK_SECRET` es obligatorio.
- Para una sola instancia, el almacenamiento JSON es suficiente; si se escala, conviene migrarlo a una base de datos compartida.

## Despliegue

Para despliegue en producción:

```bash
npm install
npm run build
npm run start
```

Esto compila la app y sirve el proyecto con el backend Express en modo producción. Asegúrate de que la URL pública de tu hosting coincida con `APP_URL` y que el webhook de Mercado Pago apunte a:

```text
https://TU_DOMINIO/api/webhooks/mercadopago
```

## Referencias

- Mercado Pago Checkout Pro: https://www.mercadopago.com.co/developers/es/reference/online-payments/checkout-pro-preferences/overview
- Webhooks de pago: https://www.mercadopago.com.co/developers/es/docs/checkout-pro-preferences/payment-notifications
- Formspree HTML forms: https://formspree.io/html/
