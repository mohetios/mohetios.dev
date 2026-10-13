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

یک اپلیکیشن serverless فراتر از مجموعه‌ای از functionهاست. رفتار آن به مرز سرویس‌ها، مالکیت داده، تحویل رویداد و بازیابی پس از خطا بستگی دارد. جان گیلبرت در «Software Architecture Patterns for Serverless Systems» این تصمیم‌ها را به معماری سیستمی وصل می‌کند که بخش‌هایش بتوانند مستقل‌تر تغییر کنند.

## از function تا معماری سیستم

سرویس‌های مستقل، طراحی رویدادمحور، ارتباط ناهمزمان و محدودکردن دامنه‌ی خرابی، محورهای اصلی کتاب‌اند. CQRS و Event Sourcing، معماری microservice و micro frontend، امنیت، تست، observability، طراحی چندمنطقه‌ای و مهاجرت تدریجی با الگوی Strangler Fig هم بررسی می‌شوند.

ارزش کتاب در توضیح پیامد این انتخاب‌هاست. صف روی تحویل پیام اثر می‌گذارد، مالکیت جداگانه‌ی داده مسئله‌ی سازگاری را تغییر می‌دهد و انتشار مستقل به هماهنگی تیم‌ها نیاز دارد. سپردن مدیریت سرور به سرویس‌دهنده، این مسئولیت‌های طراحی را حذف نمی‌کند.

## جایگاه کتاب در مسیر مطالعه

برای مهندسی که functionهای serverless را می‌شناسد و می‌خواهد اپلیکیشن کامل طراحی کند، مطالعه‌ی مناسبی است. الگوها باید متناسب با نیاز انتخاب شوند؛ سیستم کوچک ممکن است به Event Sourcing یا چند منطقه نیاز نداشته باشد.

## دریافت کتاب

- **Amazon**: [Software Architecture Patterns for Serverless Systems](https://www.amazon.com/Software-Architecture-Patterns-Serverless-Systems/dp/1800207034)
