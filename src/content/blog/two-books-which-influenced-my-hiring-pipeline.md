---
author: Alexander
pubDatetime: 2026-07-30T10:15:00-04:00
modDatetime: 2026-07-30T10:15:00-04:00
title: Two books which influenced my hiring pipeline
slug: two-books-which-influenced-my-hiring-pipeline
featured: false
draft: false
tags:
    - hiring
    - recruiting
    - engineering management
    - engineering leadership
    - leadership
    - systems thinking
    - book review
description: The interview pipeline I keep rebuilding. Where I borrowed from "Who - The A Method for Hiring", where I borrowed from "Noise" and what I learned by running it.
relatedPosts:
    - ems-the-people-system
    - ems-the-decision-system
    - the-emotional-roller-coaster-of-hiring
    - ems-why-systems-not-processes
---

A few months ago I was interviewing for a job. Somewhere in the conversation I walked the recruiter through how I build interview pipelines for engineers - the panel, the scoring, the guide I write for other interviewers. He listened, then said his company preferred the approach in a book called ["Who: The A Method for Hiring"](https://www.amazon.ca/Who-Method-Hiring-Geoff-Smart/dp/0345504194) by Geoff Smart and Randy Street.

I noted it down and didn't read it for a while and I finally did.

It's a good book. The part I expected to disagree with is the part I mostly agreed with, the part I expected to steal from is the part I'd already solved differently, using a different book.

## Table of contents

## Three steps

My pipeline has three steps:
- HR screen,
- If the screen is green, the Panel,
- If the Panel is green, the person who signs the offer - CEO, VP, Head, whoever actually owns the culture of the organization.

That's it: no take-home, no second technical round, no "quick chat with the team" that turns into a fourth interview (although if candidate which passed through Panel segment wants to meet team - I welcome this).

In practice, if a candidate clears the Panel, they get an offer about 96% of the time. The last step is a double check, mostly a formality. I still wouldn't remove it - whoever owns the culture should sign off on who joins it.

The other book I keep going back to is ["Noise: A Flaw in Human Judgment"](https://www.amazon.ca/Noise-Human-Judgment-Daniel-Kahneman/dp/0316451401) by Daniel Kahneman, Olivier Sibony and Cass Sunstein. One popular example this book covers: Google at one point put candidates through as many as twenty-five interviews. A review of the data cut that to four, because interviews past the fourth added almost no predictive validity.

This example worth reading carefully, because it isn't "fewer rounds are better". Those four are four people forming four judgments and Google enforces that they score separately before they talk to each other. The gain comes from independence, not brevity. And that's the shape my Panel is built in - several assessors, one session, separate scores. Everything past that is cost: 
- your time, their time and 
- a longer window for a good candidate to take another offer.

## The panel is packed on purpose

One Panel session which has: 
- Whiteboard system design, 
- behaviours, 
- soft skills, 
- a few small coding gists. 

It runs long and it's dense and that's intentional. I don't care how elegantly they write code. I don't care how fast they can implement search in a binary tree. The gists are there to see someone touch a keyboard under mild pressure, not to rank them on syntax.

What I'm looking for is different: 
- Can I learn something from this person? 
- Do they have business sense or do they only see tickets? 
- Can they explain a solution while it's being pulled apart - by chaos, by pressure, by a manager pushing back? 
- Can they use modern tools? AI agents are allowed in my panel. Use them. Just show me how.

Everything that happens in the session becomes an artifact: the board, the gists, the notes. Those artifacts are what the interviewer and everyone shadowing them use afterwards to write the evaluation report - not a memory of the vibe in the room 😅

One line from "Noise" stuck with me: _work sample tests are among the best predictors of how someone will actually perform on the job_.

The whiteboard session is a work sample, not of typing, of the real job - thinking about a system out loud while someone argues with you.

> What does your interview actually sample - the work or the conversation about the work?

## No homework

I don't give take-homes for two reasons.

The first is respect for someone's personal time, they already have a job or they're deep in a search or both.

The second matters more. I'm not hiring a contractor to work alone on an isolated project, I'm hiring people who elevate teams. Can you solve a take-home? Almost certainly. Can you solve it live, with me, on the same whiteboard we use for real architecture design? Not everyone can.

"Who" lists habits it calls voodoo hiring, including the manager who leans on hypotheticals and the one who leans on brainteasers. Their line is that it's the walk that counts, not the talk - and the walk they mean is a documented track record you verify with reference calls.

To be fair to them: the book never discusses take-homes and I suspect its authors would count one as more "walk" vs. my whiteboard.

Work done alone, offstage, with unlimited time and whatever help the candidate quietly had, tells me almost nothing I need to know.

## Where the scoring came from

Both books are pro-structure, both would tell you to ask every candidate the same questions. The split/difference is what happens to the answers afterwards and that's where I like Noise' approach.

"Who" tells the interviewer to think like a biographer and they warn specifically against sounding like an investigative reporter. You walk the candidate's last fifteen years chronologically:
- What were you hired to do? 
- What are you proud of? 
- What were the low points?
- Who did you work with and what will they say about you when we call them?

Then you call multiple references and at the end the team grades the candidate against the scorecard, A, B or C.

"Noise" treats the interviewer as a measurement instrument that needs calibrating. Take two candidates, one of them interviewed better. How often is that the one who was better actually turns out to be better at the job? With an ordinary conversation-style interview it's a bit under six times out of ten, barely better than flipping a coin.

Run the same interview with structure - same questions, same tasks, scored against something written down and it goes up to roughly two times out of three.

Two out of three is not impressive. It's just much better than what most of us are doing and it's the entire reason to bother and building a better Interview process.

And even in panel interviews, where everyone watched the same candidate do the same things in the same room, two interviewers disagree about which of two candidates is better roughly a quarter of the time.

Another favorite finding in that chapter in Noise book is a lab study. Some of the people playing candidate were told to answer at random. Not a single interviewer noticed and they were just as confident they'd learned a lot about the person.

That's the part that got to me smile, not that interviewers are wrong sometimes, that the feeling of having read someone correctly shows up either way. Neither experience doesn't fix it nor a better gut doesn't fix it. The only thing that helps is moving the judgment out of your head and onto paper, before you start explaining yourself to anyone.

So the Panel has a script. The interviewer has a guide with the exercises, the expected solutions, the hints they're allowed to give and when and what a weak, average and strong answer looks like for each task. It's detailed enough that someone non-technical can run the session and still get real signal.

Post-interview has its own guide. Each task has a score. Each score has a written definition. The goal I want to achieve is that two people who sat in the same session land on the same number without talking to each other first and only then discuss.

That's the part people skip. Score independently, then talk and delay your intuition, don't ban it.

> If you and I sat in the same interview, would we write down the same number before we spoke?

I want to be honest about the limits, because [I've written something close to the opposite before](/posts/ems-the-people-system). Structure does improve your odds. It doesn't make them good. I've hired people who scored cleanly and turned out to be the wrong fit by month two. So the rubric does two jobs and only two: it keeps the bar the same regardless of who's in the room and it moves the odds. It doesn't replace probation and I've stopped expecting it to.

## Then I got in my own way

I've rebuilt some version of this pipeline at several companies. Each time it got tighter. Each time I was the one running it.

That's the failure, [a framework only one person can execute isn't a framework](/posts/ems-why-systems-not-processes).

So this time, at my current company, I did it differently from the start. I built three panels for three open roles and I put my engineers in the room as shadows from the very first interview - not after some readiness milestone. They watch, they take notes, they write their own evaluation report, they compare it to mine, we talk about the gaps.

"Noise" has a name for this, in a different context, about performance ratings, the authors note that anchored scales alone don't remove disagreement between raters - what helps is frame-of-reference training, putting raters through shared cases and showing them how their scores compare against a reference. I think it transfers. Shadowing is the cheapest version I've found.

We're early. The signal I'm watching for is three shadowed interviews and scores that stop drifting from mine. At that point the engineer runs the next panel and I go train someone else. Then we can interview several candidates in the same week instead of stacking them behind my calendar. We're not there yet, we just started.

"Who" recommends running interviews alongside a colleague too, including one who's there purely to learn the method by watching. I wish I'd taken that seriously three companies ago.

I wrote "[no single-person dependencies](/posts/ems-the-decision-system)" into a strategy manifesto years ago, took me a while to point it at myself.

> Which part of your hiring only works because you're in the room?

## The problem moved

Fixing the interview didn't solve hiring, it moved the constraint.

The pipeline is no longer blocked on me. It's blocked on finding candidates who clear the HR screen.

Which is exactly where "Who" is strongest and exactly the part I was quickest to skim. Their sourcing chapter reports that 77% of the leaders they interviewed named referrals as their top technique for generating candidate flow and that among average managers, it's the least practiced approach. That matches what I've seen. At a previous company most of our engineers came through employee referrals and about 7 out of 10 referred candidates cleared all three steps ion the interview process.

The screening step turns into a bottleneck fast and usually not because the recruiters are bad at their job. 
- Not enough people in talent acquisition. 
- Not enough activity. 
- No shared definition of what we're actually looking for. 
- And if nobody sources proactively, the panel gets fed candidates who were never going to make it.

So work with your recruiters from day one. Align on the bar before the first role goes live. Be clear that finding a good candidate is slow and finding a great one needs several things to line up at once - brand, money, culture, timing. Most of those aren't in the recruiter's control and if you are pretending it's otherwise it just burns the relationship.

> Does your recruiter know what a strong candidate looks like or just what the job title is?

## Something I still get wrong

I keep polishing the part I enjoy.

Building a panel is fun. Writing scoring anchors is fun. Watching an engineer I trained run a session better than I did is one of the better feelings in this job. Sourcing is not fun. "Who" prescribes exactly one habit for it - thirty minutes on your calendar every week to call talented people and ask who else you should be talking to. It's the simplest thing in the book and the one I skip most.

The Panel was never the bottleneck for long, I just liked working on it.

## What to do after reading this

Count your steps in the interview process. For each one, name what it decides that no other step decides. Drop the ones that can't answer.

Open your interview guide. If a competent engineer who isn't you couldn't run the session from it, it isn't a guide. It's a reminder for you.

Look at your last five hires. Ask who scored them and whether those scores were written down before the debrief or after. If it was after, you didn't get independent judgments. You got one judgment with witnesses.

Then put thirty minutes on your calendar this week to talk to someone talented who isn't looking for a job.

The interview you can't hand to someone else isn't a system, it's a habit with a calendar invite.
