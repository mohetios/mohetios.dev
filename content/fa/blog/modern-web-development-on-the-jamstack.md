---
title: توسعه مدرن وب با JAMstack
date: 2021-08-11T12:29:12.649Z
thumbnail: /content/Modern-Web-Development-on-the-JAMstack.webp
description: 'یادداشتی درباره کتاب Modern Web Development on the JAMstack؛ مرور عملی معماری JAMstack، محتوای پیش‌تولیدشده، APIها و استقرار ساده‌تر وب.'
tags:
- book-notes
- jamstack
- static-sites
- apis
- web-performance

cat: library
toc: true
intro: false
comments: true
newsletter: true
---

«Modern Web Development on the JAMstack» مقدمه‌ای فشرده برای جداکردن آماده‌سازی محتوا، تحویل آن و رفتار زمان اجراست. سؤال مرکزی این است که صفحه برای هر بازدیدکننده دوباره ساخته شود یا پیش از رسیدن درخواست آماده باشد.

## مرز build و runtime

محتوای ازپیش‌ساخته‌شده، تحویل با CDN، JavaScript و API، مدیریت محتوا، مسیر انتشار و مهاجرت بررسی می‌شوند. محتوای پایدار در build آماده می‌شود و تعامل پویا مسیر اجرای جداگانه دارد.

این تفکیک در طراحی Mohetios.dev، Totoro و Mamoochi هم مطرح است. در Mohetios.dev، سورس محتوا Markdown است و Velite آن را در زمان build آماده می‌کند. فرم، کامنت و داده‌ی خصوصی همچنان به backend، کنترل دسترسی و تصمیم روشن درباره‌ی cache نیاز دارند.

## معماری پیش از ابزار

برای بررسی ابزار تولید سایت یا CMS، نقطه‌ی شروع کوتاه و مناسبی است. ابزارها تغییر کرده‌اند، اما تفکیک build و runtime هنوز مفید است. build طولانی، preview دشوار و پراکندگی قابلیت‌های پویا بین چند سرویس، هزینه‌هایی‌اند که کنار سادگی تحویل محتوا باید سنجیده شوند.

## دریافت کتاب

- **Netlify (PDF)**: [Modern Web Development on the JAMstack](https://www.netlify.com/pdf/oreilly-modern-web-development-on-the-jamstack.pdf)
