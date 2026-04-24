---
author: Alexander
pubDatetime: 2026-04-23T09:00:00-04:00
modDatetime: 2026-04-23T09:00:00-04:00
title: Why Systems, Not Processes
slug: ems-why-systems-not-processes
featured: false
draft: false
thread: Five Systems of Engineering Management
tags:
    - engineering management
    - systems thinking
    - leadership
    - organizational design
    - management philosophy
    - ripple effects
    - engineering leadership
description: Why engineering management is a systems problem, not a process problem. The opening article of a seven-part series.
relatedPosts:
    - ems-the-people-system
    - ems-the-technology-system
    - ems-the-delivery-system
    - ems-the-information-system
    - ems-the-decision-system
    - ems-connecting-the-systems
---

Early in a job I ran, I designed a three-step hiring process. HR screen, one tech interview with me, one with the CEO. On paper it was clean. It worked. We moved candidates through fast.

Then I became the bottleneck.

My calendar ran out of slots. HR struggled to book tech interviews inside a week. I was spending more time interviewing than leading engineering. So I patched it. I wrote a guide for other engineers to run tech interviews. I added a scoring rubric to reduce bias. I had other engineers shadow me until they were calibrated. That part worked and it still works.

But the real lesson wasn't "add more interviewers". The real lesson is that fixing the three-step process didn't solve anything. It moved the problem. And if I had only kept patching steps, I would have kept moving the problem forever.

## Table of contents

## What process thinking actually is

Process thinking is the reflex to patch what's in front of you. Velocity is down - shorten the sprint. PRs are slow - add a review SLA. Too many bugs - add a QA gate. It's the work of a tactical manager and it's not wrong. Sometimes a patch is exactly what you need.

Thing is, every patch is local. You fix the thing you see and the thing you didn't see gets worse somewhere else. Three months later, someone else - or you - is fixing that downstream thing and the patch trail grows.

I've met people who run whole careers like this. They're busy. They're useful. They ship. But nothing ever really changes. The same problems come back.

## What systems thinking is

A system is the set of parts that produce an outcome together. People, technology, delivery, information, decisions. Hiring isn't a process. It's a system that touches onboarding, which touches retention, which touches capacity, which loops back to hiring.

Systems thinking is stepping back to see the whole shape. You stop asking "how do I fix this step" and start asking "what is producing this outcome and where does a small change ripple?"

Process thinking is low-level patching. Systems thinking is investment. You can still have processes - you need them to implement a system - but you design them to support a system, not replace it. It's a holistic approach to a problem, built to scale and stay in place.

The tactical manager fixes the step. The strategic leader reshapes the system so the step works.

> When you "fix" something at work, do you actually know what you just moved?

## Ripples are the hidden tax

A few years ago I moved teams to async standups. Engineers liked it. Product managers were lukewarm. A quarter later, about 20% of engineers told me they missed the live ones. Some teams added sync standups back on top of the async ones. A couple of quarters after that, in the engineering health survey, engineers told me they were confused about why they needed both.

The async standup wasn't the problem. The problem was that I changed one thing in the delivery system and didn't see the ripple into the information system - how teams share context, build a sense of each other, unstick each other in five minutes instead of a day.

Another one. I've always tried to build teams that feel like a good sports team. Open, supportive, safe to ask for help. At one company, that culture landed too hard. People stopped feeling okay saying "I'm busy, ask me later". Everyone answered every ping. Everyone helped. And the department ground to a crawl. Random asks, no organization, constant defocus, slow delivery. Pure psychological safety with no balance. It looked like a healthy culture system right up until the moment the delivery system collapsed. I didn't see that coming.

One more. I introduced an ADR process to capture big architectural decisions. For a while it worked as designed. Then engineers started using it for every decision - small ones, reversible ones, team-level ones. The process diluted. The high-leverage decisions got buried in the noise. I had to go back and write a guide separating the non-reversible calls from the reversible ones and walk the tech leads through it. A good process isn't automatically a good system. If you don't guard what flows through it, it slowly starts doing the opposite of what you built it for.

> What's the last change you shipped - and what did it quietly cost you somewhere else?

## Delays are what make this hard

If ripples were instant, we'd all be systems thinkers. The problem is the lag.

I tried to convince a devops team to adopt Docker years before it was obvious. They pushed back. So my product team used it locally, got comfortable and demoed it to the rest of engineering. Months later, devops came around on their own. When Kubernetes arrived, they were already warmed up and adoption was quick. The full arc took years. That's fine - that's what a healthy technology system looks like.

I hired an engineer who scored low in their interview. I had a gut feeling about them. For the first three months they were slow. Around month five, I gave them a real initiative to own. They bloomed. Strong organization, clean communication, stakeholders praising them. Between the signal and the outcome: five months.

I introduced AI coding tools for developers. At first, great. Then interns started producing AI slop without really understanding what they'd written. I added a rule: explain every change in your PR. For seniors, same problem with a different face - blind trust in AI-generated bug fixes, which ended up adding more bugs to the backlog. I added a rule: a human reviews every AI-written change. The lag between "this tool helps" and "this tool hurts in a new way" was about three months.

Every serious change has a lag. If you don't build that lag into your thinking, you will congratulate yourself for things that weren't ready yet and blame yourself for things that needed more time.

## Something I still get wrong

I still get pulled into architecture details when I shouldn't be. I see a messy corner of the system and I want to fix that corner today. What I should be doing is working with tech leads and staff engineers on a technology strategy that will make that corner - and ten other corners I haven't looked at yet - unmessy over the next year.

I catch myself. Sometimes. Not always. Old habits are strong and fixing one thing feels productive. It isn't. It's process thinking wearing leadership clothes.

> What do you keep fixing that a healthier system would fix for you?

## What I want you to do after reading this

Stop for a minute.

Look at the last three problems you fixed. For each one, ask:

-   Did I solve it or did I move it?
-   And what system was the real source - people, technology, delivery, information or decisions?

If you read that list and feel something like "yeah, I've been there" - good. That feeling is the start of the shift. No title, no level, no company size matters for this. As soon as you start seeing your work as five connected systems, you start to see where you actually fit in the puzzle and where a small thing you change will really move the whole shape.

The rest of this series walks through those five systems one at a time and then how they connect. But this is the first move. Seeing them at all.

_One note before you go on. The Toyota Way is a book I keep coming back to. A few Japanese terms from it - *hansei*, *genchi genbutsu*, *nemawashi*, *hourensou*, *obeya* - show up across the rest of this series, because some of those concepts name things that don't translate cleanly into English. Where one fits the situation, I've used it. A short definition is always included at the bottom of the article it appears in._
