---
author: Alexander
pubDatetime: 2026-04-23T09:04:00-04:00
modDatetime: 2026-04-23T09:04:00-04:00
title: The Information System
slug: ems-the-information-system
featured: false
draft: false
thread: Five Systems of Engineering Management
tags:
    - engineering management
    - engineering leadership
    - systems thinking
    - communication
    - documentation
    - metrics
description: Drivers, documentation, managing upward and metrics as signal.
relatedPosts:
    - ems-why-systems-not-processes
    - ems-the-people-system
    - ems-the-technology-system
    - ems-the-delivery-system
    - ems-the-decision-system
    - ems-connecting-the-systems
---

A few years ago I was on a four-person software team inside a company that made both hardware and the software to manage it. Direct line to the CTO. Our goal was to ship a POC of a portal where users could manage devices, watch signals, see trends.

Iteration was fast. Decisions happened in Slack. Many ideas got green-lit by the CTO with eyes closed. We delivered the POC. Then we threw it away. We had learned what actually needed to be built and how to build it the right way for the market.

Small team. Quick decisions. No documentation. A simple ticket tracker. That was it. Passionate, engaged, on the same page.

That was pure information flow. It also doesn't scale.

## Drivers make information visible

In a more recent company I had one larger team owning integrations across two separate verticals. Two drivers - the most senior engineers, one per vertical - used the rest of the devs as the work required.

What made it work was the routine. For each initiative, the team spun up a dedicated temporary Slack channel, pulled in the necessary stakeholders and the driver posted a short daily message - current state, problems, risks, what's next. Tags for awareness. Tags when blocked.

Transparent, clear organized. Everyone was on the same page about progress, all the time.

The pattern isn't "document more" or "write a wiki". The pattern is: make information visible at the rhythm of the work and assign someone to keep it visible.

This pattern has a physical ancestor. In manufacturing, there's a concept called _obeya_ [1] - "big room" - a project war room where everything about the project lives on the walls: schedule, quality signals, design choices, open risks. Anyone walking in sees the state of the work in ten seconds. A temporary Slack channel with a daily driver update is the distributed, remote version of the same idea. Same function. Different medium.

Water-cooler talks count too. Some of my best POCs started in kitchen chats or virtual side threads - laughing, brainstorming, then an engineer goes off and hacks a prototype that gets adopted a week later. The information system isn't only formal channels.

> If you disappeared for a week, how much of your team's work would still be visible to everyone else?

## Information can break at the top, too

One morning a CEO shared good news - we'd be partnering with a third-party company to source inventory of products we couldn't get anywhere else. A shared Slack Connect channel was spun up. Dedicated people joined. I took the lead on communication with their reps.

Plenty of questions. Plenty of answers. And at some point it became clear the third party couldn't actually provide the inventory everyone expected. A legal issue prevented it. The miscommunication was at the C-team level, between their execs and ours, before any channel existed.

By then we'd spent a week on back-and-forth. Integration steps. A data engineer starting to design a pipeline. All of it paused.

A shared channel can't save you from a miscommunication that happened before the channel existed. Information flow is only as good as the quality of the signals at the source.

## Channels, threads, docs - the mechanics

A few habits I keep coming back to.

Move conversations out of DMs. I push almost every substantive DM into a team channel. Involves more people, spreads knowledge, kills bus factors, breaks siloed understanding.

Threads over noise. In any busy channel, use a designated emoji to open a thread on a topic. For bigger initiatives, spin up a temporary channel - scoped, stakeholder-inclusive, archivable when the work closes.

Documentation as a sprint artifact. During Sprint Review, tech lead, EM or PM asks the team: what should we document from this sprint? A ticket gets added with a documentation label and planned into the sprint. The cost of documentation becomes visible and deliberate, instead of a vague wish.

Onboarding docs as a living task. Every new hire refreshes the onboarding doc they just used. The doc improves. Onboarding speeds up.

The one thing I haven't solved: people ask questions instead of searching. Write a doc once and many people - engineers and business folks both - will still ask before they look. I don't have a fix, just a habit: when the same question comes twice, pin the doc, reply with a link, make the doc the default path.

The practice underneath all of this is cheap to describe. Model it in one place. Document what works. Share what you wrote. Don't mandate. Let it spread at the pace teams can actually absorb it.

> How many of today's decisions are still living in someone's DMs?

## Metrics are information, not decoration

Dashboards become wallpaper fast. What actually moved behavior for me was combining three things.

One: give every engineer access to the tooling - DX, Swarmia, CC Velocity dashboards. Not just managers. Gatekept metrics produce theater.

Two: tie them to OKRs. PR review time became a company-level OKR for a couple of quarters. A few quarters later, engineering teams had improved their metrics.

Three: build them into the team rhythm. In Sprint Review, the team captures the state of the metrics. In Sprint Retro, they pick one action to improve one metric. One. Only one.

Roughly 60% of teams picked it up seriously. The other 40% stayed in theater. A cross-team competitive instinct also kicked in for some of them, which I didn't plan for.

One framing that helped me get these metrics from "number on a slide" to "goal a team can visibly miss or achieve": every real metric goal needs four pieces - a target (where you want to reach), a baseline (where you are), a trend (the current velocity) and a time frame. "PR review time at p50 is 36 hours, trending up from 28 last quarter - we want it under 12 by end of Q3". That's a goal. "We'll improve PR review time" is a wish.

I never review individual engineer metrics in a group. Only in 1:1s and only about patterns, not scores.

> Which metric in your org is changing behavior - and which is just wallpaper?

## Managing upward is just information flow

In my most recent role, a new CTO asked me to start "managing upwards" - share what they needed to know from my side. I already did a version of this. But the term was new to me. Twenty-plus years in tech, twelve leading people and I'd never had it named.

I asked around. Definitions split. Some people said managing up is normal and healthy - keeping your manager current, building trust. Others said it was micromanaging in reverse, performing upward.

The version I use has three practices.

Don't surprise your manager. Surprises break trust faster than almost anything else. Each surprise is an incident to learn from.

Don't let your manager surprise you. Ask the questions that keep you current on what they're juggling. Don't assume they'll remember to tell you.

Feed their context. If teams are frustrated with a new policy, if tooling isn't scaling, if something shifted - send it up. Not as a problem to solve. As information they'll find useful.

In its useful form, managing up is about increasing bandwidth and reducing friction between you and your manager. It isn't about controlling what they see. It's about making sure they have enough to do their job without getting blindsided.

I introduced the same practice downward, asking tech leads and EMs to send short "what you should know" reports. Some started. Some skipped. I kept pushing.

The practice has a name I didn't know at the time - _hourensou_ [2]. Daily inform-and-consult. When Japanese companies first introduced it to American managers, the reaction was the same as the one my friends had: this is micromanagement. What shifted was practice. Once people did it, they found it was the opposite - a steady rhythm of small updates that replaced the surprises that actually break trust.

## The invisible ripple

Two teams in one company. Team A was building integrations against third-party APIs and handing data over to Team B, which owned data in the org. Team A decided to build reporting for their vertical - and split the report in two, one per integration, without consulting Team B.

The result: two reports. Desynced numbers. Stale figures. Leadership trying to manually reconcile both into one view of the vertical. Trust in Team B took the hit. Leadership started questioning data's competence.

Team B hadn't caused any of it. They'd been excluded from a decision that quietly became theirs to clean up.

The ripple was invisible because the decision looked local. It wasn't. One team moving fast and owning "the whole thing" is a classic information-system failure - a decision escapes the discussion it should have been part of.

> Whose work are you quietly cleaning up because they never asked you in?

## Something I still get wrong

I over-share. I'll ask too many questions. I'll dump too many key points into an executive update. I've started using a traffic-light system - red, yellow, green - to help me prioritize what matters inside a message.

The related one I got wrong - a high-traffic channel burying a critical announcement. A product release with implications for Sales and Support - posted, scrolled past. Both teams missed it. Issues followed. I had assumed sent meant delivered. Sent doesn't mean delivered. Important announcements need more than one channel, a pin and a direct tag on the accountable person.

## What to do after reading this

Ask yourself what kind of information flows upward from you to your manager. Only problems? Only status? Only when asked?

Now look at what flows downward into your teams. Are they getting enough context or only decisions?

Pick one change you could make at the bottom of the information flow that would ripple up. Write it down. Try it for a month. Watch whether the shape of the conversations you're having changes.

If the information system is clear, most other systems can correct themselves. If it's murky, nothing else can.

---

## Terms

[1] _obeya_ - Japanese for "big room". A project war room where all information about a project is visible on the walls: schedule, quality signals, design choices, open risks. The goal is instant shared context for anyone who enters.

[2] _hourensou_ - Japanese for "report, inform, consult". A daily rhythm of small updates from subordinates to manager, intended to replace surprises with continuous awareness. Often mistaken for micromanagement until practiced.

---

## Appendix: Information System Diagnostic Reference

| Parameter                   | Value                                                                                                                                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inputs**                  | Slack / email / docs, meeting cadence and types, documentation culture and location, dashboards, guild structure, onboarding content, announcement channels, ADR archive                                                                                                                  |
| **Signals**                 | Same-question-repeat rate, DM-to-channel ratio, doc freshness (last edit date), search-before-ask rate, announcement-acknowledgment rate, guild attendance, async-standup read rate, context-travel time from exec to IC                                                                  |
| **Helpful questions**       | If you disappeared for a week, how much of the team's work would still be visible? <br/>How many of today's decisions are living in someone's DMs? <br/>Which metric is wallpaper? <br/>When did the last major announcement definitely reach every affected person?                      |
| **Processes commonly used** | - Guilds and communities of learning <br/>- ADRs as shared record <br/>- newsletters <br/>- all-hands <br/>- async standup bots <br/>- sprint reviews <br/>- dashboard reviews in ceremonies <br/>- hourensou-style daily updates <br/>- obeya or temp Slack channels with driver updates |
