---
title: 'Auditorías de código que se convierten en proyectos'
summary: 'Evalúo las bases de código de potenciales clientes en Designli y convierto los hallazgos en propuestas sobre las que un founder puede actuar.'
kind: 'case-study'
role: 'Asesor Técnico de Soluciones y Líder Técnico, Designli'
period: 'Ene 2026 - Actualidad'
order: 1
tech:
  - 'SonarQube'
  - 'TypeScript'
  - 'Java'
  - '.NET'
  - 'Swift'
  - 'Kotlin'
  - 'C++'
  - 'Python'
metrics:
  - value: '40+'
    label: 'bases de código auditadas'
  - value: '~2 / semana'
    label: 'ritmo de evaluación'
  - value: '~15 días'
    label: 'tiempo promedio entre nuevos clientes firmados'
  - value: '2 sem → 4 d'
    label: 'tiempo de entrega de propuestas'
---

## El trabajo

Una empresa llega a Designli con un producto existente y una pregunta: ¿arreglarlo, ampliarlo o reconstruirlo? Antes de que alguien pueda responder, alguien tiene que leer el código. Ese alguien soy yo.

Los proyectos llegan en tres formatos (Impact Week, Solution Lab y Traction Lab), y la profundidad de la evaluación corresponde al formato. Las bases de código abarcan web, mobile y backend: JavaScript y TypeScript, Java, .NET, Swift, Kotlin, C++ y Python.

## Cómo hago una auditoría

**Primero la evidencia, después la opinión.** Cada hallazgo apunta a un archivo y una línea específicos, así que nadie tiene que creerme solo por mi palabra.

1. **Pasada automatizada.** El análisis estático con SonarQube da una línea base: confiabilidad, puntos críticos de seguridad, duplicación y puntos críticos de complejidad.
2. **Revisión manual de arquitectura.** Las herramientas no ven lo importante: cómo dependen los módulos entre sí, dónde el modelo de datos choca con el producto, qué integraciones (incluidos los pagos) tienen un riesgo real y qué se va a romper primero cuando el producto crezca. Cuando hace falta, consulto el modelo de datos directamente con SQL.
3. **Traducción.** El informe que lee un CTO y la propuesta que firma un founder son documentos distintos. Planteo las recomendaciones en función de los objetivos, los KPI y el riesgo del cliente, no de preferencias de ingeniería.

## Qué cambió

Los informes se volvieron uno de los principales motores de nuevos negocios: en promedio, se firmó un nuevo cliente cada 15 días aproximadamente, como resultado directo de las propuestas entregadas. También automaticé el flujo de evaluación y de reportes, lo que redujo la entrega de propuestas de dos semanas a cuatro días.

## Lo que no puedo mostrar

Los clientes son confidenciales, así que aquí no hay nombres ni capturas de pantalla. De lo que sí puedo hablar es del método, de la variedad de lenguajes y de las cifras de arriba.
