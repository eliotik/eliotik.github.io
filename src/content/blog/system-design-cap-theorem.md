---
author: Alexander
pubDatetime: 2024-01-23T11:24:20-05:00
modDatetime: 2024-01-23T11:24:20-05:00
title: CAP theorem
slug: system-design-cap-theorem
featured: false
draft: false
tags:
    - system design
    - distributed systems
    - software architecture
    - cap theorem
description: How Brewer's theorem plays role in designing a distributed system
---

I read about the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem) yesterday. It usually shows up on a computer science track.

It covers three things:

-   Consistency
-   Availability
-   Partition Tolerance

Here's my attempt to simplify it.

## Table of contents

## Starbucks example

I'll use Starbucks as the example. How does the theorem apply to a chain of coffee shops?

#### Consistency

Every coffee shop shows the same menu. Same pages. Same items. A customer in one city sees exactly what a customer in another city sees.

#### Availability

Coffee shops are always open. Whatever happens, customers can access the menu and buy products whenever they want.

#### Partition Tolerance

This one is trickier. Starbucks is a big chain. Shops are spread across cities and countries. Sometimes a shop in one region can't communicate with shops in another - network issues, weather, something else.

Partition tolerance means the company keeps operating even when some locations can't talk to the rest. Customers still walk into an open shop and get their coffee.

#### The rule of CAP

Here's the trick. You can only focus on two of the three at once. A perfect balance across all three is either impossible or prohibitively costly.

**Consistency + Availability.** Every menu matches. Every shop is open. But communication between shops in different locations can break.

**Consistency + Partition Tolerance.** Same menu everywhere. Communication holds. But shops aren't always open.

**Availability + Partition Tolerance.** Shops are always open. Communication holds. The menu varies from shop to shop.

As CEO of Starbucks, you choose which two matter most for how the chain runs.

## Social Media Platform example

Let's switch to a social media platform.

#### Consistency

When a user creates an event - posts a message, reacts to something - all other users see the change instantly. Same information for everyone at the same time.

#### Availability

The platform is always accessible. Up 24/7. Users can interact with content at any time.

#### Partition Tolerance

A global platform hits network delays and failures. Partition tolerance means users in one region can still reach the platform even when another region has a network issue.

#### Applying CAP

Social media was harder to map than Starbucks. Let me try.

**Consistency + Availability.** Something like Twitter (X). When a user tweets, their followers see it immediately. During outages or peak hours, you see delays or empty feeds - availability is prioritized, but the cost shows up.

**Consistency + Partition Tolerance.** Finance systems - banks, payment operators. A network glitch shouldn't leave user data wrong. Data must stay accurate and consistent across nodes, even at the cost of availability.

**Availability + Partition Tolerance.** CDNs. You can always reach your files. Edges all over the world. The trade-off shows up in consistency - cached content may lag behind the origin.

## Two more words

It's a useful frame when you're designing a distributed system. It applies beyond software too - businesses make the same trade-offs.

You pick two. That pick reflects the priorities of the business.

_A cup of coffee `c[_]` for you.\_
