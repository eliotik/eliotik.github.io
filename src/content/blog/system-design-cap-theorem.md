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
description:
  How Brewer's theorem plays role in designing a distributed system
---

Yesterday I read about CAP theorem [here](https://en.wikipedia.org/wiki/CAP_theorem), usually folks learn about it in Computer Science track.

This theorem covers the use of main three things:
- Consistency
- Availability
- Partition Tolerance

Here is my attempt to simplify this theorem explanation.

## Table of contents

## Starbucks example

I will use Starbucks as an example entity. Let's review how this theorem applies to the chain of coffee shops.

#### Consistency

We use it to make sure that everyone in the Starbucks chain sees the same Menu. We really want to make sure that everyone reads the same Menu content, the same pages, the same items in it.

#### Availability

When it comes to Availability, we can think of ensuring that coffee shop is always open to run business. No matter what happens, you want clients to access the Menu and services in the coffee shop. Always open coffee shop, and people can buy products whenever they want.

#### Partition Tolerance

This one is tricky, I will try my best to make up an example. If you think about Starbucks - it's a big chain of coffee shops, they are located in different geo graphical locations around the world.

Sometimes coffee shops from different locations/cities/countries cannot communicate with each other.

We use Partition Tolerance to make sure that Starbucks company still can operate, even if some locations are not available, maybe affected by weather conditions or other means. However, customers can still go to other locations to buy their favourite coffee.

#### Rule of the CAP theorem

I hope the example above sounds clear at this point. But there is a trick in this theorem.

According to this theorem, you can only focus on two of these things at the same time. You may try to have a perfect balance between all three things, but it's either impossible or highly complicated and costly.

Let's imagine we want to prioritize **Consistency and Availability**, that would mean that all clients will see the same menu and all coffee shops always open, but you can have issues with communication between coffee shops in different locations.

On the other hand, if we focus on **Consistency and Partition Tolerance**, we get the same menu everywhere and no communication issue between coffee shops, but our coffee shops are not available 7/24.  

Let's combine one more example, if we want to have **Availability and Partition Tolerance** as our main priority, we get our coffee shops open 24/7, our shops have a stable communication. But we don't have a consistent Menu across all our shops (you guessed it right).

As CEO of Starbucks, we should decide which two things are the most important so our coffee shop chain works well.

## Social Media Platform example

This time I will use some random or real Social Media Platform as an example.

#### Consistency

In Social Media Platform, consistency means that when a user creates an event (posts a message, reacts on something, etc.), all the other users in the Platform should see the changes instantly. Our main focus is to ensure that everyone sees the same information at the same time.

#### Availability

Availability for the Social Media Platform means that it is always accessible to its users. We want our platform to be up and running 24/7, allowing users to interact with content at any time.

#### Partition Tolerance

When you are building a Global Social Media Platform, you can experience difficulties with network such as delays or failures, and it can cause different parts of your Platform to stop working. With Partition Tolerance, our goal is to ensure that Platform is still accessible for our users from a different region while we have a network issue. 

#### Applying Rule of the CAP theorem

I will be honest, somehow using Social Media Platform as an example was more difficult compared to Starbucks. Let's mix things the same way as we did for Starbucks example.

Reviewing Twitter (`X`), we can assume that for this SMP it's important to have **Consistency and Availability**, so when users tweet, the message is visible to all user's followers immediately. You can see some delays and some pages show you empty feeds when Twitter has outages or peak hours.

Mixing **Consistency and Partition Tolerance**, I can think about Finance Systems like Banks or Payment operators as a good example. No communication with main API or Server - not a problem, user's data will stay the same and accurate.

Lastly, when you use CDNs (Content Delivery Network), you have access to your files (media, static scripts, etc.) 24/7. It's because CDNs focus on **Availability and Partition Tolerance**, it's important for users around the world to have constant access to their files.

## Two more words

It's a good theorem to keep in mind when you are designing a distributed system. You can apply it not only for Software but also in a business. 

We should keep in mind that we often make tradeoffs based on the business priorities, so you focus on consistency, availability, or partition tolerance accordingly.

_A cup of coffee `c[_]` for you._