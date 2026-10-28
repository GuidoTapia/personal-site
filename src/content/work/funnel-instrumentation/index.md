---
title: 'Finding the leak in a real-estate funnel'
summary: 'Instrumented two critical funnels on a DIY real-estate platform, found a blocker hiding at the end of the flow, and redesigned the worst step.'
kind: 'case-study'
role: 'Software Engineer, RAVN Development'
period: 'RAVN Development'
order: 3
tech:
  - 'Event instrumentation'
  - 'Funnel analysis'
  - 'A/B testing'
  - 'Feature flags'
metrics:
  - value: '2'
    label: 'critical funnels instrumented'
  - value: '1'
    label: 'blocking issue found and removed'
---

## The problem

Traffic was coming in, but listings and closed sales were not coming out. Everyone had a theory. Nobody had data.

## What I did

- **Instrumented the funnels.** I added step-completion events to the two flows that mattered most: listing onboarding, and offers and counteroffers. That showed true drop-off per step instead of a single conversion number.
- **Removed a blocker.** The data surfaced a critical issue: a Terms of Service restriction that was only communicated at the very end of the flow, which invalidated the advisor-assisted way many users actually operated.
- **Iterated on the evidence.** We grouped questions into logical blocks, adjusted the UI on the steps with the highest drop-off, and redesigned the most conflictive step as a hybrid flow assisted by an internal platform advisor.
- **Validated before shipping.** A closed beta came before the production rollout.

## Where it stands

Measuring the impact on step drop-off and new listings was still in progress when I moved on, so I'm not going to claim a number here. What this project shows is the method: measure the funnel step by step, find the leak, fix the largest one first.
