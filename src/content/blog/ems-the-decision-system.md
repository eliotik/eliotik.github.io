---
author: Alexander
pubDatetime: 2026-04-23T09:05:00-04:00
modDatetime: 2026-04-23T09:05:00-04:00
title: The Decision System
slug: ems-the-decision-system
featured: false
draft: false
thread: Five Systems of Engineering Management
tags:
    - engineering management
    - engineering leadership
    - systems thinking
    - decision making
    - strategy
    - architecture decision records
description: Who decides, how decisions get recorded and what a strategy actually commits you to.
relatedPosts:
    - ems-why-systems-not-processes
    - ems-the-people-system
    - ems-the-technology-system
    - ems-the-delivery-system
    - ems-the-information-system
    - ems-connecting-the-systems
---

Early in my career I built a single-page web app to replace an offline desktop application that was manually updated across every branch of a bank. Cleaner, less brittle. Branches with an internet connection could migrate first.

One problem. Every computer in the bank ran Internet Explorer and IE ran my SPA painfully slow. Chrome on the same computer was instant. Branch computers were old and underpowered. Headquarters computers were modern, so on those, IE looked fine.

I needed a bank-wide order from the CEO to migrate to Chrome. A few branch chiefs were pushing back. I needed the problem to reach the one person whose "yes" would unlock everything.

Before my meeting with the CEO, I added a timeout operation to the SPA that only triggered in IE when accessed from the headquarters network. I walked in, explained the problem, asked him to try it himself. Slow. Very slow. He understood in about ninety seconds. The order went out.

I cheated a little. I also learned something I've used for twenty years - a decision isn't just the call. It's the environment the decider is standing in when they make it. If you want a different decision, sometimes you change the environment.

There's a Japanese term for this kind of work - _nemawashi_ [1]. The practice of preparing the ground before a meeting: talking to stakeholders, gathering input, building alignment so the formal decision is almost a formality. How you arrive at a decision matters more than the decision itself. A shortcut to a good outcome draws more scrutiny than a careful process that lands on a bad one. The CEO meeting was the moment. The nemawashi was the work that made the moment go the way it did.

## Who decides what

Not every decision belongs at the same level. In my most recent org I introduced a Type 1 / Type 2 framework on top of the ADR process.

Type 1 decisions - hard to reverse, touch multiple products or teams, affect architecture beyond a single team - require an ADR. Research, options, a written trade-off analysis, a record that outlives the people who made the call.

Type 2 decisions - reversible, local, team-level - are the team's call. ADR optional. Don't burn the org's attention on small, recoverable things.

One habit worth calling out inside Type 1 decisions - good ADRs are set-based. Survey three or four alternatives before committing to one. The opposite is point-based - pick an approach early, then fight through iterations when you find the problems. Set-based is slower up front. It saves weeks on the back end.

The line is cheap to draw and expensive to ignore. Earlier in the series I described what happens when the line blurs - the ADR dilution. Small decisions entered the same process as non-reversible ones. The non-reversible ones got buried.

The opposite failure is just as common. A team makes a "local" decision that quietly becomes everyone else's problem. One team moving fast and owning "the whole thing" is how a decision that should have been cross-team quietly turns into a cross-team cleanup.

> When did a "local" decision on your team last become everyone else's problem?

## Decisions that went right

A migration from three cloud providers down to one. We had to pick between two. I pushed for the one where I had more experience - but also and more importantly, where we had the biggest strategic footprint. Bigger account, more visibility with the provider, more doors we could open. A year later, when we needed to engage with another team inside that same ecosystem, our rep was already in place. A conversation that would have taken six weeks took six minutes.

Not every decision shows its value in the moment you make it. Some investments are in optionality. You don't know which door you'll need until you're standing in front of it.

Another, quieter one. At a previous company, SRE owned every push to staging and production. The funnel was a bottleneck and the bottleneck was their team. I sat with the SRE engineers and tech leads from other teams, framed the problem as shared - velocity was capped by a stage we controlled together - and asked to pilot CI/CD on two of my teams. Pushback at first, around quality and security. We aligned on a scoped experiment: GitLab triggers Jenkins, tests, lints, push to staging. Once it worked inside two teams, SRE itself helped roll it out across the org.

The decision wasn't "move to CI/CD". The decision was "let's run a scoped experiment together and make the answer visible". That's how most real organizational decisions get made - not in a meeting, but in a small agreement to learn together.

## Saying no (and when I should have)

I don't have one dramatic pushback story. The form of "no" I use most is "no, but" - here's why not, here's what we could do instead, here are the trade-offs you'd accept to unlock the original thing. A flat no is a wall. A no with an alternative is a conversation.

What I think about more is the shape of a well-structured no. Some are about constraints - the team literally cannot do the ask right now. Some are about velocity - we could, but it costs three months on something more important. Some are about priorities - we shouldn't, regardless of capacity, because it pulls us off course. Some are about the relationship - doing this specific thing in this specific way would damage the trust the team runs on.

The most useful move I've found is shifting the argument from "can we do it" to "what would we not do to do it?". The ask becomes concrete. Rejection becomes negotiation.

Where I've failed is holding the no when it gets rolled. Earlier in the series I wrote about an ambitious engineer who pushed hard to become a Tech Lead. I raised the concerns. I said no. My manager's manager overruled me. I didn't fight hard enough to hold the line. Three months later the team was underperforming, every concern I'd raised had accelerated and we ended up on a PIP that led to their departure.

The no was right. I let it get rolled. That's the mistake.

> What "no" are you still paying for because you didn't hold it?

## Policy, not exceptions

The cost of policy is real. You narrow your opportunity space on purpose and when an opportunity you would've loved comes along, you don't take it - because taking it undermines the thing that made the policy valuable.

The cost of exceptions is higher. The first one is reasonable. The tenth one has quietly unwritten the policy. Leaders start spending their week writing exception letters for rules they wrote themselves. That's exception debt. The escape isn't to issue more exceptions. It's to treat each exception request as an input to the next version of the policy. Collect them. Batch them. Refresh the policy on a deliberate cadence. Between refreshes, the default answer is "the policy applies" - even when it's locally inconvenient.

A related frame I use a lot - every policy shifts freedoms. A positive freedom is the freedom to do something (pick your own language, pick your own infra). A negative freedom is the freedom from things happening to you (not being forced to support five more languages other teams picked). Almost every decision about centralizing or decentralizing is really a decision about which set of freedoms you're shifting and from whom.

Done well, centralizing can increase positive freedom for most people - the ones who'd rather have a sensible default than a fifth decision on their plate today. Done poorly, you get a group that reduces both freedoms for everyone.

> Which of your policies is quietly being unwritten, one exception at a time?

## Strategy is what you commit to not debating anymore

I've written strategies a few times. Two versions at my most recent company - first pass identifying the immediate problems and how we'd solve them, second pass by domain: product, ML, platform, data. Per domain, the problems and the solutions - hiring, architecture, processes.

If I wrote a short manifesto for an engineering department today, it'd have four lines on it.

-   No single-person dependencies.

-   We only use boring technology.

-   We are a one-stack shop.

-   Engineers own the "how". PMs own the "what".

And for every domain, one more line that does more work than all the others combined: **we believe X is so important that we will deliberately slow down, spend money or ignore Y to achieve it.**

That sentence saves months of re-litigation. Every time a team asks why we're paying for a managed service or skipping a shortcut, the answer is already written. Strategy isn't what you will do. It's what you refuse to debate anymore because the trade-off has already been made and documented.

A simple test for whether a strategy is real - would a new engineer, six months from now, use it to make an actual decision? If no, it's a vision document. If yes, it's a strategy.

> What debate does your team keep having that a written strategy would end?

## The invisible ripple

Centralized decision-making groups - architecture councils, platform reviews, product guilds - are classic ripple generators. You create one to increase consistency. Then, quietly, four things can go wrong.

The group becomes domineering - making calls without feeling the consequences. Or bottlenecked - helpful but overwhelmed, with a structured backlog that slows everyone down. Or status-oriented - where being in the group matters more than what the group does. Or inert - it just meets and nothing moves.

I've been inside each flavor. The one that surprised me most was the shift from helpful to bottlenecked. A group that started as an unblocker became a calendar problem teams had to plan around. The decision to create the group was local and obvious. The ripple into delivery six months later wasn't.

The original decision was right. The decision not to periodically audit the group was the one that cost us.

## Something I still get wrong

I still want to decide fast.

The reflex isn't always wrong, but I've lost more by deciding in the first twenty minutes than I've ever gained by moving quickly. Unless something is actively on fire, most decisions can wait a day. Walk. Think. Meditate. Come back with a plan.

Fast is cheap. Fast on the wrong decision is expensive.

## What to do after reading this

Next time you make a real decision, ask what systems it will touch. People, technology, delivery, information, decisions. Write them down before you act.

Now look at your decision-making system as it is today. Where are decisions actually being made? Who's making them? What's getting written down and what's living only in someone's memory?

Find one gap. One place where decisions are being made without the right people, the right context or the right record. Close that gap this month.

If a decision isn't visible, it isn't really a decision. It's a guess that happened to work this time.

---

## Terms

[1] _nemawashi_ - Japanese for "going around the roots". The practice of talking to stakeholders, gathering input and building alignment before a formal decision meeting - so the decision is almost already made by the time the meeting starts. The saying is: how you arrive at a decision matters more than the decision itself.

---

## Appendix: Decision System Diagnostic Reference

| Parameter                   | Value                                                                                                                                                                                                                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inputs**                  | Decision framework (Type 1 / Type 2), ADR and RFC process, authority and scope, escalation paths, centralized groups (architecture / platform / product), strategy documents, policies and refresh cadence                                                                                   |
| **Signals**                 | Reopened-decision rate, exception-request trend, decision-to-action time, documented vs tribal decision ratio, ADR quality (alternatives surveyed), decision-group bottlenecks, re-litigated trade-off frequency                                                                             |
| **Helpful questions**       | When did a "local" decision become everyone else's problem? <br/>What no have you given that got rolled? <br/>Which policy is being unwritten one exception at a time? <br/>What debate keeps coming back that a written strategy would end? <br/>Where does a decision get stuck right now? |
| **Processes commonly used** | - ADRs / RFCs <br/>- Type 1 / Type 2 framework <br/>- architecture councils <br/>- nemawashi-style pre-alignment <br/>- strategy docs per domain <br/>- policy refresh cadence <br/>- exception tracking <br/>- set-based decision practice                                                  |
