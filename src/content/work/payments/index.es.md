---
title: 'Pagos con cinco proveedores en tres regiones'
summary: 'Integré y depuré pasarelas de pago para productos que venden en Estados Unidos, Latinoamérica y Arabia Saudita.'
kind: 'case-study'
role: 'Ingeniero de Software, RAVN Development'
period: 'May 2021 - Dic 2025'
order: 4
tech:
  - 'Stripe'
  - 'PayPal'
  - 'Mercado Pago'
  - 'Culqi'
  - 'Moyasar + Mada'
  - 'Node.js'
  - 'Webhooks'
metrics:
  - value: '5'
    label: 'proveedores de pago'
  - value: '3'
    label: 'regiones: EE. UU./UE, LATAM, Arabia Saudita'
---

## Los proveedores

- **Stripe** como pasarela principal para clientes de Estados Unidos y Europa
- **PayPal** como checkout alternativo
- **Mercado Pago** para Latinoamérica
- **Culqi** para el Perú
- **Moyasar + Mada** para Arabia Saudita, el más desafiante del grupo

## Lo que realmente importa en pagos

Lograr que pase un cobro de prueba es la parte fácil. En lo que trabajé:

- **Webhooks idempotentes.** La entrega de webhooks se concilia por ID de evento, así que un evento reintentado nunca cobra ni despacha dos veces.
- **Los rechazos son datos.** Interpreto los rechazos suaves y duros a través de los códigos de respuesta del emisor. Los rechazos suaves reciben reintentos inteligentes con backoff; los duros no se reintentan.
- **Mantener las tarjetas vigentes.** La tokenización de red de Stripe y Account Updater mantienen funcionando las tarjetas reemitidas, para que las renovaciones no fallen en silencio.
- **Los métodos locales le ganan a los ajustes del flujo de tarjeta.** Métodos de pago locales como Yape en el Perú y Mada en Arabia Saudita elevan la aprobación más que cualquier optimización del flujo de tarjeta.
- **Lo que monitoreo.** Tasa de aprobación segmentada por BIN, emisor y país; caída en el funnel y abandono de carrito; y latencia p95.

En Designli, aplico el mismo criterio a la inversa: cuando audito la base de código de un potencial cliente, la integración de pagos es uno de los primeros lugares donde busco riesgos.
