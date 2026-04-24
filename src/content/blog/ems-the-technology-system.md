---
author: Alexander
pubDatetime: 2026-04-23T09:02:00-04:00
modDatetime: 2026-04-23T09:02:00-04:00
title: The Technology System
slug: ems-the-technology-system
featured: false
draft: false
thread: Five Systems of Engineering Management
tags:
    - engineering management
    - technical debt
    - software architecture
    - code quality
    - ADR
    - monorepo
    - technology strategy
    - systems thinking
    - engineering leadership
description: Tech debt as a system outcome. Quality as a loop. Architecture as a ripple.
relatedPosts:
    - ems-why-systems-not-processes
    - ems-the-people-system
    - ems-the-delivery-system
    - ems-the-information-system
    - ems-the-decision-system
    - ems-connecting-the-systems
---

There was a SQL database at one of my past companies that collected critical user events. Ten million events a day. The engineer who built it had moved on years before. The database engine was outdated. The GraphQL API on top of it ran on old packages. Nobody owned it.

When I joined, I put it on my list. I worked with the existing engineers to understand the flow and mapped out migration options. We had a plan. We didn't have capacity. And Product couldn't see the problem - from their side, the database worked.

Then one of my engineers needed to add a column. Manual SQL wouldn't work - it would lock the table for hours. The ORM's migration tool needed a specific Node container with a specific version. He set it up, ran the migration and production alerts started firing on one of our main products.

The schema updated. The API layer was out of sync. The fix itself was quick. The lesson wasn't. Nobody on the team really knew how to maintain this stack. We'd been running a critical piece of the business on a system with no real owner and it took a failed migration in production to make that visible.

That's what tech debt actually is. Not a shortcut we took. A system we stopped maintaining.

## Table of contents

## Tech debt is a system outcome, not a trade-off

People talk about tech debt like it's a loan. "We took a shortcut, we'll pay it back later". That framing is tidy and mostly wrong.

Debt builds up because something in the system stopped working. The engineer who built the thing left. Product couldn't see the problem. Ownership rotated until nobody remembered who was on the hook. Packages deprecated while we shipped features. The test that told you something was broken has been disabled for a year. The knowledge that kept it alive was in someone's head and that person now works somewhere else.

At one company I joined as a founding engineer for a new department. I inherited a Python script written by seven different engineers borrowed from other teams over two years. No owner. It worked until it didn't. Crashed with out-of-memory errors. Silently lost data. I spent a few months patching it the same way those borrowed engineers did, keeping notes on the side. Then I used those notes to make the real case - this wasn't a script, it was an unmaintained system running a whole department - and got approval to rebuild it with real ownership and architecture.

Another company, different flavor. A React Native mobile app three major versions behind, including one version that introduced a breaking architecture change. We couldn't use new iOS or Android features. The library kept moving. We kept shipping custom work for enterprise customers. Debt wasn't the real problem. The absence of a maintenance rhythm was. When we finally upgraded - about six months of mobile engineering work - we didn't just fix the version. We built the routines that stop it from happening again: CI/CD checks on package changes, a vendor and package evaluation process, a cadence for upgrades.

The upgrade was the tactical fix. The routines were the system fix.

> What part of your stack works today only because one specific person hasn't left yet?

## Quality is a system, not a rule

A company I worked at set a blanket rule: 80% unit test coverage on every repo. Sounded reasonable. When I reviewed the tests later with tech leads and staff engineers, the quality was flat. Tests covered class properties. We had piles of snapshot tests that didn't validate any real logic. The coverage number went up. The product didn't get better.

Another one: a rule that every PR needed two reviewers. The intent was good. The effect was slower reviews, PRs sitting for days, debates happening in review comments instead of in a five-minute offline chat.

Both rules failed the same way. They treated quality as a number to hit instead of a set of feedback loops - tests that catch real regressions, reviews that sharpen design, incidents that teach the team something, monitoring that actually reaches the right person. If you change one of those loops in isolation, the others need to adjust with it or the system tilts somewhere else.

Quality is a system. Tune one knob on its own and you'll make the scoreboard look better while the product feels worse.

## Architecture ripples further than you think

I once decided to build a new service in NestJS with Redis-based jobs. My team had the expertise. It shipped fast. Business was happy.

The rest of the engineering org used Go and Temporal.

My team became an island. Integration help from other teams was slow. Nobody wanted to borrow into our stack. Hiring was against a mismatched profile. The short-term speed cost us in every dimension except the launch date.

Another one, smaller and personal. I built a clever query generator that produced search engine queries from input parameters. It worked. Nobody but me understood the logic. Two engineers eventually had to rewrite it.

And one that went the other direction. I introduced Node-RED internally so engineers could help marketing craft email pipelines. It saved time. Other teams started using it. I kept helping. Before long there was a whole unsanctioned Node-RED deployment I had created by accident - shadow IT that I owned by default. I worked with the real IT team to hand it over properly.

The principle across all three stories is the same. Technology should serve the people and the process around it, not the other way around. Pull technology to solve a real problem you've named. Don't push technology because it's the latest trend. And when you can, work out the process manually first - you'll know what you actually need before you reach for a tool to automate it.

Every architecture decision touches the people system, the delivery system and the decision system. Not eventually. Immediately.

> What architecture decision made you fast today and isolated you tomorrow?

## What good looks like inside this system

I mentioned earlier that the ADR process went through a dilution phase. Once we wrote the clarification guide and re-aligned tech leads, adoption finally worked.

At my most recent company I introduced an ADR process and enforced it. Some pushback. Most engineers onboarded. Then the results showed up - engineers doing real research, producing options, running POCs, talking to each other, leaving a record. Later that record made LLM-assisted work much more useful, because the context was there.

I also introduced an engineering guild. It took four iterations to find a format that worked for the culture of that company. Engineers need a forum - a place to raise current problems, propose technologies, share what they learned this month. If one doesn't exist, I build it.

The biggest one was a monorepo migration. We had 400-plus repositories, only about 30-plus of them active. Duplicated code across many of them. Big files with multiple teams as codeowners, which produced review chaos. Twenty-plus CI/CD pipelines to duplicate and maintain. Lint standards inconsistent between repos we didn't have capacity to align. This wasn't a task force - it was an objective for the Platform team, working alongside the teams that owned each application as they migrated. Separately, I ran a task force to split the big shared files into modular code with clean ownership.

Neither was smooth up front. Early migrations hit tooling breakage, broken e2e tests, permission and env var puzzles, change-detection problems in CI. We built our own tooling to speed migrations for teams ready to move. Over months, it came together.

## Something I still get wrong

I over-engineer when I should fail fast.

A team of mine had flaky tests. One engineer spent days trying to find the root cause. I pushed him to skip the tests and focus on product work. The skipped tests stayed skipped for months. Another engineer eventually found them while updating tests for a bug fix and we were right back in the loop I thought I'd saved time escaping.

And sometimes I still run a data migration for a hundred customers manually, with slight variations per customer, when I should have written a script. AI turns that into a half-hour task now and I still reach for manual first. Old habit.

> What test did you skip "just for now" - and when did "now" end?

## What to do after reading this

Sit down.

Ask yourself whether the technology system you run is only about code. If the answer is yes, you're missing most of it.

Define what **quality** means inside your technology system in plain words - not as a coverage number.

Map the feedback loops - tests, reviews, incidents, monitoring, ADRs, postmortems. Which are actually working? Which are theater?

Then look at one technology decision you made recently. What other systems did it touch - people, delivery, information, decisions? Did you know it was going to touch them?

Finally, find one small change inside the technology system that could create the biggest ripple. Write down which other systems it will touch when you make it.

If you can answer all of that honestly, you're seeing the whole system, not just the code.

---

## Appendix: Technology System Diagnostic Reference

| Parameter                   | Value                                                                                                                                                                                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inputs**                  | Languages and frameworks, infrastructure and deploy model, third-party dependencies, architecture shape (monolith / services / monorepo), testing and observability, security and compliance posture, debt backlog                                                                                                               |
| **Signals**                 | Deploy frequency, change failure rate, MTTR, test coverage and test quality, disabled-test count, incident severity mix, package-upgrade lag, clear ownership across the stack, new-hire time-to-first-merge                                                                                                                     |
| **Helpful questions**       | What works today only because one person hasn't left?<br/>Which test has been disabled "just for now" for longer than six months? <br/>Which architecture decision is quietly making you slower? <br/>What does "quality" actually mean in this codebase? <br/>Where would you be stuck if a key dependency deprecated tomorrow? |
| **Processes commonly used** | - ADRs and RFCs <br/>- architecture councils or reviews <br/>- postmortems and incident response <br/>- CI/CD with quality gates <br/>- package and vendor evaluation <br/>- migration playbooks <br/>- on-call rotations <br/>- security reviews <br/>- tech debt audits                                                        |
