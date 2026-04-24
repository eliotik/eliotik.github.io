---
author: Alexander
pubDatetime: 2026-04-23T09:03:00-04:00
modDatetime: 2026-04-23T09:03:00-04:00
title: The Delivery System
slug: ems-the-delivery-system
featured: false
draft: false
thread: Five Systems of Engineering Management
tags:
    - engineering management
    - agile
    - scrum
    - kanban
    - retrospectives
    - incident response
    - product engineering
    - delivery
    - systems thinking
    - engineering leadership
description: How work actually moves through a team - workflows, retros, incidents and the product-engineering handshake.
relatedPosts:
    - ems-why-systems-not-processes
    - ems-the-people-system
    - ems-the-technology-system
    - ems-the-information-system
    - ems-the-decision-system
    - ems-connecting-the-systems
---

A developer on my team took ownership of a critical initiative - fixing how UserAgents were parsed from incoming requests. A small script running as a Cloudflare worker. Clear scope. They were visibly excited.

Then I found out the script wasn't in any repository. It had been deployed by hand, directly to Cloudflare, by this same developer years before.

My ask expanded. Fix the UA parsing, create a repo, put the config in Terraform, add a CI/CD pipeline. I offered to split the work - I'd handle infra, they'd handle the fix and tests. No, they wanted to own the whole thing. We agreed on five days.

Five days later, no code. Just a verbal report that they needed more time. I asked to see the local work. Local only. Push to a repo, I said. Silence. I created the repo myself and asked again. Nothing.

They were a contractor. My manager had a friendly relationship with them. It took real effort to land the message that this wasn't working. Eventually we terminated the contract. Another engineer picked it up and delivered in the agreed window.

The work wasn't the problem. The delivery system around the work was. One person could bypass the repository. One person could hoard the initiative. One person could burn five days with nothing to show and nothing in the system caught it in time.

## Table of contents

## Delivery slows from the inside

Another version. The Platform team at one company accumulated rules - good reasons behind each one - until they became the bottleneck for every other team. Adding a user. Elevated permissions to debug an issue. New ETL pipelines that could only be created manually, not through IAC. Inbound requests piled up.

Platform hadn't set out to be a blocker. They got there one reasonable rule at a time.

Delivery slows when the system stops noticing what's slowing it. Sometimes it's one person. Sometimes it's an accumulated layer of gates nobody sized against the cost.

## Product and engineering is a partnership or a problem

Years ago I introduced a Mindmap process in a small engineering org that had no real ownership of what it delivered. The goal was simple - question PM requirements, surface risks, align on the implementation path before code. It brought order to chaos. When the org scaled up, the strong Tech Leads outgrew the process. I didn't force it on them. For engineers, I had less trust in, I kept it in place. Building the muscle still mattered.

One team had no Tech Lead, but a strong senior engineer acted as one. High velocity, low defects, low rework. But when I talked to the PMs, they were unhappy. The engineer rarely challenged them on roadmap or epics. Just shipped what was asked. PMs wanted pushback. They wanted clarity, predictability, a buffer for adhoc work.

I worked with the engineer on how they communicated. A few months later they were a real partner to their PM. Roadmap got more predictable. Team burnout dropped.

You need drivers in the team - engineers who feel responsibility for what they deliver and how. Without them, the product-engineering handshake degrades into order-taking.

> When was the last time an engineer on your team pushed back on product - and the outcome was better for it?

## Retros are where the system speaks or stays silent

When I joined one company as a manager, I sat in on team retros. A month later I got private feedback that engineers felt intimidated when I was there. Retros were their safe place. Too them - I was an EM, not a team member.

The feedback came from the lower-performing teams - the ones where I'd occasionally ask about incidents, missed deliveries or cards that said "too many meetings". Once, I shared my calendar on screen and we counted meetings per engineer. After that, "too many meetings" mostly stopped coming from people it wasn't really true for. The Tech Leads who actually were in too many - I never questioned them. They were the glue of the org.

The bigger change in retro energy came from a different move. I asked teams to spend 30 minutes at the end of Sprint Review on engineering efficiency metrics - velocity, DX signals, flow. Team-level only, never individual. Observations written down. In the Retro, they picked one action. One.

Sixty percent of teams improved their metrics. Retros got productive. The other forty percent kept running theater - share feedback, document actions, never act, repeat. Always a reason not to act, plenty of reasons to keep complaining.

The difference between the 60% and the 40% comes down to an attitude. Japanese has a term for it, _hansei_ [1] - honest reflection on weakness, not celebration of success. Continuous improvement without _hansei_ is busywork. The 40% that stayed in theater weren't lacking actions. They were skipping the step before the actions.

## Fit the workflow to the team

Operations-driven teams - platform, infra, data, research - run well on Kanban. Feature delivery teams tend to run better on Scrum. Both should share the ceremonies that matter across the org - Sprint Review, Retro - so business outcomes stay visible on the same cadence for everyone.

Teams occasionally switch. Usually when a new PM, EM or Tech Lead joins. Try it for a cycle. Keep it or revert.

A few practices have held up across companies. A weekly Focus Day - no meetings, mostly off the radio, only on-call stays available. It worked with strong engineers. Some used it as a vacation, so I added the rule: at the end of a Focus Day, produce an artifact - a PR, a doc, an ADR, an epic split. No artifact, no Focus Day next week.

Async standups - I introduced them where standups had turned into multitasking sessions or unplanned deep-dives. Slack bots collected reports into a team channel. But async only worked when people actually read the reports. Roughly a third engaged with it as designed. The rest did it because they were asked. Managed badly, async standups kill the team vibe.

Estimation is the single biggest lever. If your engineers can give a grounded, detailed estimate, you save hours with the product team. Sprint Grooming is what builds that habit. Many teams skip it. The ones whose PMs use it to talk through upcoming changes stay predictable.

> Is your workflow shaped to your team - or is your team being shaped to fit the workflow?

## Pace is a decision, not a default

One CTO ranted that we shipped too fast. Product Manager and I were fine with the pace. Risky? Yes. We didn't have everything covered by tests and feature flags. But the CTO was hands-on and the PR volume was overwhelming them personally. The pace wasn't wrong. The review system wasn't built for it.

Other direction. A team was asked to POC a simple UI widget - a hardcoded list with images, placed manually on a few pages to test impressions. They instead built a dynamic widget with an injected iframe, an API endpoint and dynamic content loading. Two months. We delayed the real test. The quality wasn't even at MVP - it was still a POC, still going to get thrown away.

Pace is a decision. Usually made without being labeled as one.

## Incidents are feedback loops or they aren't

Incident documentation exists in most places I've worked. Detailed guidelines, roles, flows for commanders and responders. That's not the problem. Nobody cares about it until an incident actually happens.

I once ran a chaos test on a team that owned a microservice. I asked infra to drop one environment variable and redeploy. The service started crashing. The Datadog alert fired. I got the email. The team got the email. Nobody responded. An hour in, I called the team. It was intense. After that, their incident response got real.

Going to the source is what separates an incident discussion from theater. The five-whys technique everyone knows has a known failure mode - in a room of anxious leaders, "why" slides into "who". Five rounds of blame instead of five rounds of cause. The fix is the same every time: go to where the work happened, talk to the people who were there, observe the actual conditions. There's a Japanese name for this - _genchi genbutsu_ [2].

You need champions. Someone who runs the process enough times to teach the next person. Then a junior shadows. Then they run it. Without that chain, incident response is a document, not a system.

Teams usually add every action from a learning session to the backlog, act on the critical immediate items and let medium and low priority ones sit there forever.

> If a chaos test fired on your team tomorrow, would anyone respond in the first hour?

## Something I still get wrong

I assume what's easy for me is easy for others.

When we migrated from three clouds to one, the Platform team's plan included a Kubernetes cluster and abstraction templates so developers could write their cloud config in TypeScript instead of raw Terraform. Brilliant, I thought. Anyone can pick it up. What we actually needed was a heavy pre-education phase - Kubernetes, Terraform, Istio, the specifics of the new cloud. We shipped. Adoption was harder than it should have been because I hadn't budgeted enough teaching in front of it.

I also have a natural pull to move fast. I can forget to stop and look at the full picture - security, compliance, third-party dependencies, data pipelines. I made a template of questions across those domains to force myself to pause.

And I've learned not to be too hands-off. Let them cook, but check the menu. Otherwise, you get surprised six weeks later with work pointed in a direction you never agreed to.

## What to do after reading this

Write down how your team estimates work. Not the process - how it actually happens. Walk it through the team and through product. Look for gaps between how engineering sees it and how product sees it. That gap is where delivery goes wrong most often.

Think about the last healthy conflict your team had with product. A real one, where both sides pushed and the outcome was better for it. If you can't find one recently, that's a signal.

Finally, describe the feedback loop in your delivery system - what gets written down, what gets discussed, what gets acted on, what gets ignored. Pick one small change that would make the loop tighter. Write down which other systems it will touch when you make it.

---

## Terms

[1] _hansei_ - Japanese for "reflection". Specifically, honest reflection on what went wrong, not celebration of what went right. Treated as the foundation of real improvement - without it, "continuous improvement" is just busywork.

[2] _genchi genbutsu_ - Japanese for "go to the actual place". The practice of going to where work happens and observing directly, rather than deciding from a conference room or from secondhand reports.

---

## Appendix: Delivery System Diagnostic Reference

| Parameter                   | Value                                                                                                                                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inputs**                  | Workflow (Scrum / Kanban / Scrumban), estimation practices, planning cadence, grooming, PR review norms, product-engineering contract, team structure, cross-team dependencies                                                                                                               |
| **Signals**                 | Cycle and lead time, velocity trend, PR review time, estimate accuracy, retro-action completion rate, standup engagement, incident-during-release rate, cross-team dependency count, missed-deadline frequency                                                                               |
| **Helpful questions**       | Which ceremony is a habit and which is a muscle? <br/>Is the workflow shaped to your team or is your team being shaped to the workflow? <br/>When did an engineer last push back on product and was the outcome better? <br/>What percent of last quarter's retro actions actually got done? |
| **Processes commonly used** | - Sprint planning / review / retro <br/>- backlog grooming <br/>- standups (sync or async) <br/>- Focus Day with artifact rule <br/>- estimation practice <br/>- chaos tests <br/>- team OKRs <br/>- dependency mapping                                                                      |
