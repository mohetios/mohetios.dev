---
title: الگوهای معماری نرم‌افزار برای سیستم‌های بدون سرور
date: 2024-09-17T16:33:46.294Z
thumbnail: /content/SoftwareArchitecture-Patterns-for-Serverless-Systems.webp
description: 'یادداشتی درباره کتاب Software Architecture Patterns for Serverless Systems؛ مرور الگوهای serverless، event-driven و داده‌محور برای سیستم‌هایی که باید کوچک شروع شوند و قابل رشد بمانند.'
tags:
- book-notes
- serverless-architecture
- event-driven-systems
- autonomous-services
- cqrs

cat: library
toc: true
intro: false
comments: true
newsletter: true
---

## یادداشت خواندن

**Software Architecture Patterns for Serverless Systems** را به خاطر یک نکته نگه می‌دارم: serverless فقط چند function جداگانه نیست.

نقطه مفید کتاب برای من این است که معماری را از مسیر event، داده، استقلال سرویس‌ها و عملیات نگاه می‌کند. یعنی همان جاهایی که یک سیستم کوچک، اگر بی‌فکر رشد کند، خیلی زود سنگین و شکننده می‌شود.

## مسئله‌ی اصلی

serverless وقتی فقط به deploy ساده کاهش پیدا کند، خیلی زود گمراه‌کننده می‌شود. function کوچک است، اما سیستم فقط function نیست. event دارد، داده دارد، retry دارد، مرز ownership دارد، و بعد از مدتی عملیات هم دارد.

کتاب از همین نقطه مفید می‌شود. به‌جای اینکه serverless را مثل مجموعه‌ای از ابزارها معرفی کند، درباره‌ی الگوهایی حرف می‌زند که کمک می‌کنند یک سیستم بدون سرور شکل قابل نگه‌داری پیدا کند.

## چیزهایی که باید زودتر روشن شوند

برای من چند محور کتاب مهم‌تر از بقیه‌اند:

- مرز سرویس‌ها و استقلال واقعی آن‌ها
- event-driven design و هزینه‌ی trace کردن جریان‌ها
- ارتباط ناهمزمان و failure modeهای آن
- CQRS و Event Sourcing وقتی داده فقط CRUD ساده نیست
- migration تدریجی از سیستم‌های قدیمی‌تر
- observability، تست و امنیت به‌عنوان بخش معماری، نه کار آخر پروژه

این‌ها همان موضوع‌هایی‌اند که در پروژه‌های edge و Cloudflare هم به شکل دیگری دیده می‌شوند. runtime فرق می‌کند، اما سؤال ثابت است: چطور سیستم را کوچک نگه داریم، بدون اینکه جریان داده و عملیات مبهم شود؟

## trade-off

مزیت serverless این نیست که معماری را حذف می‌کند. فقط بعضی نگرانی‌ها را از server management به طراحی event، data ownership و operation منتقل می‌کند.

اگر این جابه‌جایی را نبینی، سیستم ظاهراً ساده شروع می‌شود و بعد با functionهای زیاد، eventهای نامشخص و داده‌ی پراکنده سخت‌تر از چیزی می‌شود که قرار بود جایگزینش کند.

## منابع

- **Amazon**: [Software Architecture Patterns for Serverless Systems](https://www.amazon.com/Software-Architecture-Patterns-Serverless-Systems/dp/1800207034)
