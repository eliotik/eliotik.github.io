---
author: Alexander
pubDatetime: 2024-01-19T13:29:14-05:00
modDatetime: 2024-01-19T13:29:14-05:00
title: Make your blog, it will be fun!
slug: this-blog
featured: false
draft: false
tags:
    - astro
    - sharp
    - github pages
    - hurdles
    - godaddy
    - cloudflare
description: My path of overcoming hurdles and challenges around bringing this blog to live
---

Overview of my hurdles while setting up things for this blog.

## Table of contents

## Inspiration

I'd like to say thank you to my co-worker Harish, he inspired me to start this blog.

One day he shared news about his [first article](https://quartile.ca/blog/dependency-injection-samber-do/) (good content right there!).

I checked it, and I thought: _- Why shouldn't I try it either?_

## No code idea

My idea was to spin up blog as fast as possible as cheap as it can be. I didn't want to code my own solution or code anything at all to enable content posting.

Harish used [Astro](https://astro.build/) framework to build his own blog.

After checking their site, it sounded pretty simple to use it for blogs:

-   run cli command
-   add template
-   focus on adding articles using md/mdx
-   publish

And I underestimated things...

## Infra layer setup

### Hosting

I didn't want to pay for hosting. I checked GitHub pages, it's still **free** with public repository.

I won't go into details of repository creation, GitHub has pretty good up-to-date docs.

### Domain

#### Part 1

Nowadays, there are plenty of registrars and web-hosting companies you can pick one to buy a domain name.

I used in the past Namecheap, Godaddy, Google Domains(deprecated) and Cloudflare.

Somehow I decided to go with Godaddy again.

> If you want to buy a new domain, to check its availability use [ICANN Lookup](https://lookup.icann.org/en/lookup). Services like Godaddy can trick your search on their site.

I will be frank with you, it's not an easy task to come up with a domain name, similar to naming variable in your code.
I didn't want `firstname.lastname.com` type of site. I wanted something fancy or foolish.

The purchasing process at Godaddy is pretty straightforward, you click-n-clack through multiple steps, skip multiple extra features and doubly confirm you don't want MX and web-hosting.

Once I had my domain available for me, I went to GitHub, my newly created repository, and under Settings > Pages I added my apex domain name and set Publish action on Merge to the `main` branch.

Ah yes, I also enabled `HTTPS force` option on the same page.

When you set up custom domain for GitHub pages, GitHub will create `CNAME` file in your repository with only one line - your domain name.

I checked `novifyx.com` and it worked, showed content of `README.md` file from my repository.

Ran `dig` to see if records for my domain are correct:

```bash
❯ dig novifyx.com +nostats +nocomments +nocmd

; <<>> DiG 9.10.6 <<>> novifyx.com +nostats +nocomments +nocmd
;; global options: +cmd
;novifyx.com.			IN	A
novifyx.com.		88	IN	A	185.199.111.153
novifyx.com.		88	IN	A	3.33.130.190
novifyx.com.		88	IN	A	15.197.148.33
novifyx.com.		88	IN	A	185.199.108.153
novifyx.com.		88	IN	A	185.199.109.153
novifyx.com.		88	IN	A	185.199.110.153
```

Looked good, except two IPs `3.*` and `15.*` but I didn't give it any of my attention.

It was a pretty simple experience, and here is where I started to complicate things.

#### Part 2

Instead of `novifyx.com` I wanted `www.novifyx.com` by default. For that, you need to change a few things.

On Godaddy side, under DNS settings for my domain name I changed `CNAME` with `www` to value equal to my repository name.

On the GitHub side I changed custom domain name from `novifyx.com` to `www.novifyx.com`, file CNAME in repository was updated automatically.

And somewhat pushed me to set up Forwarding on Godaddy for the non-www HTTP URL to the www HTTPS version under Forwarding tab at DNS settings.

I checked site, tried to open the site without www, and saw in Networking permanent redirect to the HTTPS www version.

Looked good, until it wasn't.

In a few hours my site stopped to work. Instead of GitHub pages content, it was showing Godaddy Parked static page.

I checked `dig` again, and it didn't have GitHub ips:

```bash
❯ dig www.novifyx.com +nostats +nocomments +nocmd

; <<>> DiG 9.10.6 <<>> www.novifyx.com +nostats +nocomments +nocmd
;; global options: +cmd
;www.novifyx.com.		IN	A
www.novifyx.com.	2880	IN	CNAME	novifyx.com.
novifyx.com.		527	IN	A	3.33.152.147
novifyx.com.		527	IN	A	15.197.142.173
```

And `CNAME` was pointing to `novifyx.com` instead of my pages at GitHub.

That was a pickle for me.

#### Part 4

After a few attempts to clean up dns records at Godaddy and waiting 1-2-3 hours to check if it works, I was not able to figure out why Godaddy was constantly reverting back records for A to `@`/`Parked`.

That was a moment when I decided to set up my site in Cloudflare.

> You cannot transfer your newly purchased domain name from one Registrar to another within the first 60 days

But you can use `Nameservers` from Cloudflare under DNS settings page in Godaddy for your site.

Basically, Cloudflare will work as a `proxy` temporary, until I will be able to move domain completely from Godaddy.

The process of setting up site in Cloudflare is straightforward, you will follow wizard-like steps, and it will import DNS records for you, also it will have by default flatten structure.

I didn't check output of `dig` this time, but site was available and I went sleeping ( -\_-)旦~ only to find in the morning infinite redirect loop of network requests when you open site.

This time I checked `dig`:

```bash
❯ dig www.novifyx.com +nostats +nocomments +nocmd

; <<>> DiG 9.10.6 <<>> www.novifyx.com +nostats +nocomments +nocmd
;; global options: +cmd
;www.novifyx.com.		IN	A
www.novifyx.com.	257	IN	A	172.64.80.1
```

I checked this IP address for my `A` record, and it was pointing to Cloudflare. As you can see no other `A` records or `CNAME` present in the report. Which was, mmm, weird.

_This was a frustrating moment, my goal was to do it within one evening and have something serving articles quickly, second day and I had issues with dns._

Google time.

Few StackOverflow and multiple other tech sites articles I found a lead to try out. Under DNS settings in Cloudflare, all my records had `Proxied` setting enabled. After disabling it and waiting an hour or so I checked `dig`:

```bash
❯ dig www.novifyx.com +noall +answer -t A

; <<>> DiG 9.10.6 <<>> www.novifyx.com +noall +answer -t A
;; global options: +cmd
www.novifyx.com.	68	IN	CNAME	eliotik.github.io.
eliotik.github.io.	3068	IN	A	185.199.108.153
eliotik.github.io.	3068	IN	A	185.199.109.153
eliotik.github.io.	3068	IN	A	185.199.110.153
eliotik.github.io.	3068	IN	A	185.199.111.153
```

Look who is back! `A`, `CNAME` records are correct. My site again was rendering stub content from readme file.

Apex address redirects to `www` correctly, `http` to `https`, it's alive!

#### Part 5

I wish I didn't go with Godaddy from the beginning. Experience was not the best. Also, since my Godaddy account has extra auth steps, for each DNS record change, I was required to pass authorization.

On the other hand, I could stop at using apex domain name, focus on setting up blog and adding content, and after a while improve dns setup.

Some lessons learned.

## Blog engine

As mentioned in the beginning, I followed example and decided to use Astro. I picked `Astro-papper` template, you can find it [here](https://github.com/satnaing/astro-paper/blob/main/README.md).

Installation was smooth for `no-template` option. I played with the default template a bit and then tried to create this project using the mentioned above template.

The installation process failed at the very end of the attempt to install npm dependencies, so I installed them manually after.

After playing with articles, format, deployment, linting and Typescript configuration, and removing all demo articles, the site was not working locally.

### No blog files issue

Astro expects to have files under `content/blog` folder. If this folder is empty, opening site in browser will show you an error (unfortunately, I didn't capture the exact error).

I checked code for the error, and in the `utils` folder (it's from template), multiple `ContentEntity` related functions didn't check that input array can be empty.

I added a few checks, and the site was working locally, showing empty Posts page and my About page.

That was good for me to push changes to GitHub.

I expected that site will break since I added a new GHA deployment config, `CNAME` file was moved to another folder, and also `_config` file was removed.

Thankfully, it was an easy fix, under repository Settings > Pages, you need to turn on deployment from Actions and set again your custom domain (field was empty).

And it didn't help. Deployment pipeline failed on `build` step.

### Generated types

Under `build` step I saw Typescript errors, like 50+ errors. After running this step locally, I was still surprised to see them.

```bash
src/layouts/PostDetails.astro:28:27 - error ts(18046): 'post' is of type 'unknown'.
```

In this file, TS was complaining about `post` variable of type `CollectionEntry<'blog'>` being `unknown`.

`CollectionEntry` was imported as a `type` from astro generated types.

```typescript
import type { CollectionEntry } from 'astro:content';
```

Astro generates types under `root/.astro` folder when you run `astro sync` command.

The problem was with missing blog files. Honestly, I didn't dig into astro types, but because I had no article files, `blog` enum property was pointing to `unknown` type.

I added `under construction` post, and this helped to resolve issue with types.

Commit, Push, `build` failed again.

### Image optimization with `sharp`

This time I had the next error in the logs:

```bash
Error: Could not load the "sharp" module using the linux runtime

error sharp@0.33.2: The engine "node" is incompatible with this module. Expected version "^18.17.0 || ^20.3.0 || >=21.0.0". Got "18.14.1"
warning sharp@0.33.2: The engine "libvips" appears to be invalid.
```

`Astro-papper` template uses `jampack` to optimize images from `src/assets` folder. To do it, this package uses `sharp` library.

By default, it installs `sharp@0.33.2`, on that day this version had incompatibility issue with `node@18.19.0` - GitHub action used this Node.js version. I later explicitly set this version for action.

Google search led me to GitHub issue under Node.js repo where folks had the same problem. Recommended solution was to use `sharp@0.32.6` with `node@18.19.0`.

Following this finding, I added under `resolutions` in `package.json`:

```json
"resolutions": {
  "sharp": "0.32.6"
}
```

And Voilà! It worked.

## Epilogue

> The only free cheese is in the mousetrap.

I cannot say this experience was a breath, but even taking issues from above, I had some fun and learned a trick or two.

Hopefully future me or You can find these notes useful to resolve similar issues.

Thank you for reading (人๑ʾ◡ʿ๑)
