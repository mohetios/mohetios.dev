---
title: توسعه مدرن وب با JAMstack
date: 2021-08-11T12:29:12.649Z
thumbnail: /content/Modern-Web-Development-on-the-JAMstack.webp
description: 'یادداشتی درباره کتاب Modern Web Development on the JAMstack؛ مرور عملی معماری JAMstack، محتوای پیش‌تولیدشده، APIها و استقرار ساده‌تر وب.'
tags:
  - کتاب
  - jamstack
  - static-sites
  - معماری-وب

cat: library
toc: true
intro: false
comments: true
newsletter: true
---

## یادداشت خواندن

**Modern Web Development on the JAMstack** کتاب کوتاهی است، اما سؤال درستی می‌پرسد.

ارزش JAMstack برای من در وعده‌های بزرگش نیست. در این است که می‌گوید کدام بخش از سیستم می‌تواند از قبل ساخته شود، کدام بخش واقعاً به runtime نیاز دارد، و چطور می‌شود مسیر انتشار را ساده‌تر کرد.

## مدل ذهنی

سؤال اصلی JAMstack این است:

آیا این صفحه باید هنگام هر request ساخته شود، یا می‌تواند پیش از آن آماده باشد؟

اگر پاسخ دوم است، build-time rendering و CDN خیلی از پیچیدگی‌های runtime را حذف می‌کنند. اگر پاسخ اول است، باید API، serverless function یا backend واقعی وارد مسیر شود. ارزش معماری در همین مرزبندی است، نه در اسم stack.

## چیزی که کتاب خوب نشان می‌دهد

کتاب از ابزارها و مثال‌ها عبور می‌کند، اما بخش مفیدش برای من این است که JAMstack را به چند تصمیم عملی خرد می‌کند:

- محتوا کجا ساخته می‌شود؟
- CMS یا فایل‌ها source of truth هستند؟
- API فقط برای چه بخش‌هایی لازم است؟
- deploy چطور قابل تکرار می‌ماند؟
- migration از سیستم قدیمی چقدر تدریجی است؟

این سؤال‌ها هنوز برای پروژه‌هایی مثل Mohetios.dev، Totoro و Mamoochi زنده‌اند. ابزارها عوض می‌شوند، اما مرز بین content، build، deploy و runtime همان چیزی است که معماری را شکل می‌دهد.

## محدودیت

JAMstack اگر بی‌دقت استفاده شود، فقط پیچیدگی را جابه‌جا می‌کند. ممکن است build طولانی شود، preview سخت شود، یا بخش‌های پویا بین چند سرویس پراکنده شوند.

برای همین باید ساده شروع کرد: محتوای پایدار در build، تعامل‌های محدود در API، و فقط وقتی لازم شد state جدی‌تر.

## منابع

- **Netlify (PDF)**: [Modern Web Development on the JAMstack](https://www.netlify.com/pdf/oreilly-modern-web-development-on-the-jamstack.pdf)
