---
author: Alexander
pubDatetime: 2026-04-23T09:06:00-04:00
modDatetime: 2026-04-23T09:06:00-04:00
title: Connecting the Systems
slug: ems-connecting-the-systems
featured: false
draft: false
thread: Five Systems of Engineering Management
tags:
    - engineering management
    - engineering leadership
    - leadership
    - systems thinking
    - organizational design
description: A diagnostic framework and worked example for seeing all five systems at once.
relatedPosts:
    - ems-why-systems-not-processes
    - ems-the-people-system
    - ems-the-technology-system
    - ems-the-delivery-system
    - ems-the-information-system
    - ems-the-decision-system
---

Every time I've joined a new company, I've run the same accidental ritual for the first two weeks. I watch, mostly. I take notes on what people tell me. And separately, I take notes on what I actually see.

The notes diverge.

At one company, engineers told me the deployment process was fine. Then I watched a release. A single push to production needed three people, two approvals and an SRE on the other side of the world. Nobody had called it painful because it had been that way long enough to stop being visible as pain.

At another, leadership told me onboarding was in good shape - they'd written the docs. When I sat with a new hire, the docs hadn't been updated since the previous year's restructure. Half the tools referenced no longer existed.

At a third, the team said they hated meetings. We counted them. Half the people complaining had an average calendar. The other half were carrying the whole org. The same sentence meant two different things depending on who said it.

Each of those observations lived in a different system. Delivery. People. Information. Each was leaking into the others in ways nobody had mapped.

That's the shape of this article. Not how to fix any one system - we spent six articles on that - but how to see the five at once, how to read the ripples between them and how to pick the smallest change that moves the most.

## The systems aren't separate

Every story from the first six articles was a cross-system story, even when I wrote about it as if it belonged to one system alone.

I hired a senior engineer who shifted what the team thought was normal. The move lived in the People system. The ripple showed up in Delivery - velocity went up. In Technology - architecture conversations got sharper. In Retention - two peers chose to leave and the rest leveled up. One hire. Four systems touched.

I introduced an ADR process. The move lived in the Decision system. The ripple showed up in Technology (better architecture, real research, options documented), in Information (context became readable months later, even to LLM tooling) and in People (engineers who hadn't written down trade-offs before started doing it as a habit). Later the process diluted - small decisions crowded out the important ones - and the same three ripples reversed. A fix in the Decision system (a clarification guide plus tech lead re-alignment) pulled the other three back into place.

I watched a Platform team accumulate rules, each individually reasonable and quietly become the blocker for every other team. The accumulation lived in the Decision system. The cost showed up in Delivery (teams waiting for tickets) and in Information (nobody had a ledger of the aggregate cost of all those rules). Nobody made a bad decision. The system drifted.

Each of those is the same pattern. One system moves. Others respond - positively or negatively. Sometimes the response is immediate. More often it lags - weeks, months, in one case nearly a year.

The real question isn't "which system is broken?". It's "which system is producing the symptom I'm seeing and where is it rippling?"

> Which problem have you been solving in the wrong system?

## A diagnostic framework

Here's a framework that works whether you're joining a new org, running one you know or being asked to evaluate one where you have no authority.

For each of the five systems, ask three grounding questions.

**What's the public story?**

What does the org say about this system? Ask the CEO. Ask a staff engineer. Ask a new hire. Ask someone in support. Write down what they say - even the contradictions.

**What do you observe?**

Not what you're told. Go to the source. Sit in a standup. Read the last three retros. Watch PR review times for a week. Attend a decision meeting. Go into Slack on a Friday afternoon and read the last twenty messages in the busiest channel. Write down the signals, separately from the story.

**Where's the gap?**

The gap between told and observed is where the system is broken. When the story and the observation match, the system is probably healthy - even if imperfect. When they diverge sharply, you've found a fault line.

Do that for all five. It takes a couple of weeks to do honestly. It's worth it.

Then overlay.

**Which system's signals leak into another?**

For each gap you found, ask where else the symptom is appearing. The Platform team's accumulated rules lived in Decision. They were also visible in Delivery (teams waiting) and in Information (no shared cost ledger). Three systems. One root.

**Where's the leverage?**

The smallest change you can make in one system that addresses the root AND reduces the ripple. Leverage usually sits at the handoff between two systems, not deep inside one. The CI/CD pilot I ran at one company was a Decision-system move - pilot with two teams, align with SRE. It rippled into Delivery (faster releases), People (SRE moved from gatekeeper to partner) and Information (testing became visible earlier to PMs). Four systems for the price of one.

That's the framework. Five systems. Three questions each. One overlay. One leverage point.

A blank version of the grid, for your use:

| System      | What the org says | What you observe | Gap |
| ----------- | ----------------- | ---------------- | --- |
| People      |                   |                  |     |
| Technology  |                   |                  |     |
| Delivery    |                   |                  |     |
| Information |                   |                  |     |
| Decision    |                   |                  |     |

**Ripples observed across systems:**

_Write it down. The diagnostic only works if it's on paper._

> See **Appendix B** for a worked example - a filled-in grid, cross-system ripples and the leverage point that falls out of them.

## The ripples have a clock

Every ripple has a delay and the delay is roughly predictable by system.

People-system changes take about five months to show in the signal. I hired an engineer who scored low in their interview on a gut feeling. For three months, slow. At month five, I gave them a real initiative and they bloomed. That lag is normal. Changes to hiring, onboarding, growth plans, reviews - budget five months before you really know.

Technology-system changes land in two to three months. Introduce a new tool and the first honest signal arrives around month three. AI coding tools were great for three months, then interns started producing AI slop and seniors blindly merging generated fixes. Same tool, opposite effect, visible around month three.

Delivery-system changes land in weeks. A sprint reorganization, a new standup format, a focus day - you'll feel the effect within one to three sprints. The shortest feedback loop in the whole system.

Information-system changes land almost immediately, but their long effects surface slowly. Move a conversation from DMs to a team channel and the short effect is visible the same day. The long effect - who else got pulled in, what habits formed, what decisions got better because more people saw the context - that shows up three to six months out.

Decision-system changes have the longest tail. An ADR process, a policy, a strategy document - the first observable effect is when someone six months later uses it to make a real decision. If nobody ever does, it wasn't a strategy. It was a vision document.

The implication for diagnosis: when you see a symptom, let the timing tell you something about the source. A sudden drop in velocity is probably a Delivery problem. A slow erosion of architecture quality over a year is probably People, Technology or Decision - not Delivery.

> What change did you ship six months ago that you're only now paying for?

## When systems are in tension

The five systems aren't neutral peers. They fight.

Quality fights speed. A rule I've seen set more than once was "two reviewers on every PR". Quality intent, Delivery cost. The effect was slower reviews, debates in comments instead of a five-minute offline chat and PRs sitting for days. The Quality side won. The Delivery side paid. Neither side was wrong. The tension was predictable.

Psychological safety fights focus. I once leaned hard into open-door, supportive culture. It worked - until it worked too hard. People stopped feeling okay saying "I'm busy, ask me later". Everyone helped everyone. Delivery ground to a crawl. Pure culture win. Pure delivery loss.

Consistency fights autonomy. Centralizing a decision into an architecture group increases positive freedom for the many (they get a sensible default) and decreases positive freedom for the few (they can't pick their own stack). Every centralization is a redistribution of freedoms and the redistribution is permanent until you renegotiate it.

You don't resolve these tensions. You navigate them. The signal that a leader is navigating well isn't that the tensions disappear - it's that they're named and the costs of each setting are visible to the people who live with them.

> Which trade-off is your org making every day without anyone deciding it?

## What healthy looks like

It's never perfection. It's coherence.

When the five systems are pulling together, the signals are quiet.

In the People system, the right people are staying and the right people are growing. Exits feel like fit, not failure. Reviews don't produce surprise.

In the Technology system, debt is maintained, not avoided. Quality isn't a number on a dashboard - it's a set of feedback loops that catch regressions, sharpen design and teach the team something each time.

In the Delivery system, estimates are honest enough that planning conversations are short. Retros produce actions. Actions get done.

In the Information system, context reaches decisions in time. Announcements don't get missed. People search before they ask.

In the Decision system, decisions are visible. Reversible ones are fast. Non-reversible ones are recorded. Exceptions are rare and the rare ones become inputs to the next version of the policy.

Most companies have two or three of these in good shape and two or three that need work. The goal isn't five out of five. The goal is to know which two or three you're working on this quarter and to know what those changes will cost the other ones.

## Something I still get wrong

I still want to treat the systems as if I can fix them one at a time without the others reacting.

I move in the Decision system and pretend People will absorb it. I ship in Technology and pretend Delivery won't stretch. I tighten the Information system and pretend nobody will feel more watched.

The systems always react. Sometimes helpfully - a tighter information flow can lift three other systems at once. Sometimes painfully - a tightened policy can bury a team under friction I didn't budget for.

The discipline I'm still practicing is the pause before the move. Before I act inside one system, write down which of the other four will feel it and within what timeline. Even when I'm wrong - and I often am - the act of writing the prediction down makes me a better observer of the ripples when they arrive.

## What to do after reading seven articles

If you've made it this far, you've already done the hardest part. You've started seeing five systems instead of one mess.

Here's the next move.

Take a week. Ignore advice, including this series. Just watch your org.

Draw three columns. What people tell you about the five systems. What you observe yourself. Track the gaps.

Pick one gap - the one where the ripple would run the widest across the other systems. Not the biggest gap. The one with the most leverage.

Design a small experiment. Not a transformation program. A scoped change you can run in one team, with a clear question you're trying to answer. Give it three months minimum, five months if it's in People.

When the window closes, sit with what actually moved. Be honest about what didn't. Be honest about what you missed. Write it down before you decide what to do next.

Then do it again, in a different system.

That's the whole series, compressed. See the five. Read the gaps. Find the leverage. Run the experiment. Reflect honestly. Repeat.

No title, no level, no company size matters for this. What matters is that you stop patching steps and start reshaping the system that produces the steps. The patches feel productive. The reshaping is the work.

---

## Appendix A: System Diagnostic Reference

A reference card for applying the framework. For each system, the inputs are what shapes it, the signals are what to look at, the helpful questions prompt the observation pass and the processes are the instruments you'll find (or miss) when you look.

| System          | Inputs                                                                                                                                                                                                             | Signals                                                                                                                                                                                                                  | Helpful questions                                                                                                                                                                                                                                                                                                                 | Processes commonly used                                                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **People**      | Sourcing channels, interview rubric, onboarding plan, career ladder, review cycle, compensation, manager-to-IC ratios, exit process                                                                                | Time-to-hire, attrition by tenure and team and rating, internal-promotion rate, review-surprise frequency, onboarding ramp time, work-rerouting patterns around an individual, engagement scores                         | Who is being quietly worked around? <br/>Is the career ladder descriptive of this company or a fantasy? <br/>Are you growing leaders inside or buying them from outside? <br/>Who hasn't left that maybe should have? <br/>Are new hires productive by day 60?                                                                    | - Hiring rubric and calibrated loop <br/>- 30-60-90 plan with Foundation / Ownership / Impact <br/>- buddy system <br/>- 1:1 evidence board against the ladder <br/>- expanded ladder with examples <br/>- performance reviews with calibration <br/>- PIP process <br/>- exit interviews |
| **Technology**  | Languages and frameworks, infrastructure and deploy model, third-party dependencies, architecture shape (monolith / services / monorepo), testing and observability, security and compliance posture, debt backlog | Deploy frequency, change failure rate, MTTR, test coverage and test quality, disabled-test count, incident severity mix, package-upgrade lag, clear ownership across the stack, new-hire time-to-first-merge             | What works today only because one person hasn't left? <br/>Which test has been disabled "just for now" for longer than six months? <br/>Which architecture decision is quietly making you slower? <br/>What does "quality" actually mean in this codebase? <br/>Where would you be stuck if a key dependency deprecated tomorrow? | - ADRs and RFCs <br/>- architecture councils or reviews <br/>- postmortems and incident response <br/>- CI/CD with quality gates <br/>- package and vendor evaluation <br/>- migration playbooks <br/>- on-call rotations <br/>- security reviews <br/>- tech debt audits                 |
| **Delivery**    | Workflow (Scrum / Kanban / Scrumban), estimation practices, planning cadence, grooming, PR review norms, product-engineering contract, team structure, cross-team dependencies                                     | Cycle and lead time, velocity trend, PR review time, estimate accuracy, retro-action completion rate, standup engagement, incident-during-release rate, cross-team dependency count, missed-deadline frequency           | Which ceremony is a habit and which is a muscle? <br/>Is the workflow shaped to your team or is your team being shaped to the workflow? <br/>When did an engineer last push back on product and was the outcome better? <br/>What percent of last quarter's retro actions actually got done?                                      | - Sprint planning / review / retro <br/>- backlog grooming <br/>- standups (sync or async) <br/>- Focus Day with artifact rule <br/>- estimation practice <br/>- chaos tests <br/>- team OKRs <br/>- dependency mapping                                                                   |
| **Information** | Slack / email / docs, meeting cadence and types, documentation culture and location, dashboards, guild structure, onboarding content, announcement channels, ADR archive                                           | Same-question-repeat rate, DM-to-channel ratio, doc freshness (last edit date), search-before-ask rate, announcement-acknowledgment rate, guild attendance, async-standup read rate, context-travel time from exec to IC | If you disappeared for a week, how much of the team's work would still be visible? <br/>How many of today's decisions are living in someone's DMs? <br/>Which metric is wallpaper? <br/>When did the last major announcement definitely reach every affected person?                                                              | - Guilds and communities of learning <br/>- ADRs as shared record <br/>- newsletters <br/>- all-hands <br/>- async standup bots <br/>- sprint reviews <br/>- dashboard reviews in ceremonies <br/>- hourensou-style daily updates <br/>- obeya or temp Slack channels with driver updates |
| **Decision**    | Decision framework (Type 1 / Type 2), ADR and RFC process, authority and scope, escalation paths, centralized groups (architecture / platform / product), strategy documents, policies and refresh cadence         | Reopened-decision rate, exception-request trend, decision-to-action time, documented vs tribal decision ratio, ADR quality (alternatives surveyed), decision-group bottlenecks, re-litigated trade-off frequency         | When did a "local" decision become everyone else's problem? <br/>What no have you given that got rolled? <br/>Which policy is being unwritten one exception at a time? <br/>What debate keeps coming back that a written strategy would end? <br/>Where does a decision get stuck right now?                                      | - ADRs / RFCs - Type 1 / Type 2 framework <br/>- architecture councils <br/>- nemawashi-style pre-alignment <br/>- strategy docs per domain <br/>- policy refresh cadence <br/>- exception tracking <br/>- set-based decision practice                                                    |

Use the three-question pass first - for each system, record the public story, your own observation and the gap. Then apply the two overlay questions - which gap leaks into another system and which single change inside one system would move the widest ripple across the others.

---

## Appendix B: Example - A filled-in diagnostic

A composite example, drawn from patterns I've seen across multiple companies. The company is fictional. The observations are not.

**Context.** A ~150-engineer product company, two years past Series B, growing. A new VP Engineering has just joined and has spent two weeks watching before making any moves. The CEO says the company is "executing well".

### The grid

| System          | What the org says                                                                        | What you observe                                                                                                                                                                                                                                            | Gap                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **People**      | Hiring is going well. Onboarding is in good shape. Staff engineers are our tech leaders. | Half of new hires are still ramping at day 90. Three Staff engineers describe their jobs differently. One team's attrition is 3x the rest of the org. The career ladder was last updated two years ago.                                                     | Onboarding dies around day 40. The Staff role has no real definition. One team is actively broken and nobody is naming it. |
| **Technology**  | We follow good practices. CI/CD is in place. Tech debt is understood.                    | 120+ repos, about 25 actively maintained. Flaky tests in three core services. 40+ tests disabled. Two core services have no named owner. A critical Cloudflare worker isn't in version control.                                                             | Debt is structural, not tactical. Ownership is tribal. Quality gates exist on paper but get bypassed.                      |
| **Delivery**    | We deliver predictably. Teams estimate well. Retros work.                                | Estimate accuracy at best 60%. Standups average 25 minutes. Retro actions rarely complete. PR review p50 is 30 hours.                                                                                                                                       | Predictability is a story, not a reality. Retros are theater. The product-engineering handshake is strained.               |
| **Information** | We have channels, docs, weekly all-hands. People know what's going on.                   | A critical product-release announcement got buried - Sales and Support missed it. The same question was asked in Slack three times in one week. Key docs were last edited by someone who left six months ago. DMs carry the substantive context.            | Sent doesn't mean delivered. Knowledge is siloed in DMs. Documentation is archaeology, not live.                           |
| **Decision**    | We have an ADR process. Architecture decisions are documented. We move fast.             | 80+ ADRs, most covering small or reversible decisions. Three non-reversible architecture decisions this quarter aren't documented anywhere. Weekly exception requests to Platform's policies. The strategy document references problems from two years ago. | The ADR process is diluted. Non-reversible calls escape it. Platform policies are swiss cheese. Strategy is stale.         |

### Ripples observed across systems

- **Decision → Technology.** The ADR dilution means architecture calls for the two unowned core services aren't being made or recorded. What looks like a Technology problem (tech debt) is partly a Decision problem (the failure to surface the calls that create it).

- **People → Delivery.** The ambiguous Staff Engineer role means tech leads aren't senior enough in the room to challenge product during grooming. The weak estimates (Delivery) are partly a symptom of the unclear Staff definition (People).

- **Information → Decision.** Substantive decisions are living in DMs. The Decision system's "we document our decisions" story is technically true - they're written down somewhere - but because the Information system has no shared visibility, those decisions vanish the moment the person leaves.

- **Technology → People.** The un-versioned Cloudflare worker created a single-person dependency. That person has quietly become a bottleneck and peers are starting to reroute around them. A Technology gap is producing a People gap.

- **Delivery → Information.** 25-minute standups happen because the teams can't summarize. A tighter standup format doesn't just save time - it forces the Information system to produce clearer signal.

### Where's the leverage?

The ADR clarification move.

Write a guide separating Type 1 (non-reversible, cross-team) from Type 2 (reversible, local). Re-align tech leads on what requires an ADR and what doesn't. Three months later, non-reversible decisions start being captured. Six months later, the two unowned core services have named owners and documented decisions. The Staff Engineer role gets a natural forum to be defined through - who drafts ADRs, who reviews them, who challenges them. Decisions that had been living in DMs start migrating to the shared record because the shared record now has room for them.

One change, in the Decision system. Three ripples, minimum. Five-month horizon for the first real signal to show up in the other systems.

Every other gap still exists. But the ADR move shifts the pressure in four of the five systems at once, which is the shape of leverage.
