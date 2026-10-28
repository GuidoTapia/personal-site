---
title: 'Encontrando la fuga en un funnel inmobiliario'
summary: 'Instrumenté dos funnels críticos en una plataforma inmobiliaria DIY, encontré un bloqueo escondido al final del flujo y rediseñé el peor paso.'
kind: 'case-study'
role: 'Ingeniero de Software, RAVN Development'
period: 'En RAVN, 2021 - 2025'
order: 3
tech:
  - 'Event instrumentation'
  - 'Funnel analysis'
  - 'A/B testing'
  - 'Feature flags'
metrics:
  - value: '2'
    label: 'funnels críticos instrumentados'
  - value: '1'
    label: 'problema bloqueante encontrado y eliminado'
---

## El problema

El tráfico entraba, pero no salían publicaciones ni ventas cerradas. Todos tenían una teoría. Nadie tenía datos.

## Lo que hice

- **Instrumenté los funnels.** Agregué eventos de paso completado a los dos flujos que más importaban: el onboarding de publicaciones y las ofertas y contraofertas. Eso mostró la caída real en cada paso en lugar de una sola cifra de conversión.
- **Eliminé un bloqueo.** Los datos revelaron un problema crítico: una restricción de los Términos de Servicio que solo se comunicaba al final del flujo, y que invalidaba la forma asistida por asesores en la que muchos usuarios realmente operaban.
- **Iteré sobre la evidencia.** Agrupamos las preguntas en bloques lógicos, ajustamos la UI en los pasos con mayor caída y rediseñamos el paso más conflictivo como un flujo híbrido asistido por un asesor interno de la plataforma.
- **Validé antes de lanzar.** Hicimos una beta cerrada antes del despliegue a producción.

## En qué quedó

La medición del impacto en la caída por paso y en las nuevas publicaciones seguía en curso cuando dejé el proyecto, así que no voy a afirmar una cifra aquí. Lo que este proyecto muestra es el método: medir el funnel paso a paso, encontrar la fuga y arreglar primero la más grande.
