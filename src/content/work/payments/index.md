---
title: 'Payments across five providers and three regions'
summary: 'Integrated and troubleshot payment gateways for products selling in the US, Latin America, and Saudi Arabia.'
kind: 'case-study'
role: 'Software Engineer, RAVN Development'
period: 'May 2021 - Dec 2025'
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
    label: 'payment providers'
  - value: '3'
    label: 'regions: US/EU, LATAM, Saudi Arabia'
---

## The providers

- **Stripe** as the primary gateway for US and European clients
- **PayPal** as an alternative checkout
- **Mercado Pago** for Latin America
- **Culqi** for Peru
- **Moyasar + Mada** for Saudi Arabia, the most challenging of the set

## What actually matters in payments

Getting a test charge through is the easy part. What I worked on:

- **Idempotent webhooks.** Webhook delivery is reconciled by event ID, so a retried event never charges or fulfills twice.
- **Declines are data.** I read soft and hard declines through issuer response codes. Soft declines get smart retries with backoff; hard declines don't get retried.
- **Keeping cards alive.** Stripe network tokenization and Account Updater keep reissued cards working, so renewals don't silently fail.
- **Local methods beat card-flow tweaks.** Local payment methods such as Yape in Peru and Mada in Saudi Arabia raise approval more than any optimization of the card flow.
- **What I watch.** Approval rate segmented by BIN, issuer, and country; funnel drop-off and cart abandonment; and p95 latency.

At Designli, the same lens applies in reverse: when I audit a prospect's codebase, the payment integration is one of the first places I look for risk.
