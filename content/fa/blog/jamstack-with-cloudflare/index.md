---
title: 'Jamstack با Cloudflare: توسعه وب مدرن (قسمت اول)'
date: 2025-04-18
thumbnail: /content/jamstack-with-cloudflare-intro.webp
description: بخش اول یک مسیر آموزشی برای ساخت ابزار وب با Jamstack، Cloudflare Pages، Nuxt و اکوسیستم serverless Cloudflare؛ با تمرکز روی مدل ذهنی، محدوده کار، و مسیر MVP.
tags:
- tutorial
- jamstack
- cloudflare-pages
- nuxt
- serverless-functions
- web-architecture
toc: true
intro: true
cat: tuts
comments: true
newsletter: true
---

## ساخت ابزارهای وب با معماری Jamstack

در این بخش، Jamstack را به‌عنوان یک مسیر ساده برای ساخت ابزارهای وب مرور می‌کنم: محتوایی که زودتر آماده می‌شود، CDN که تحویل را سبک می‌کند، و APIهایی که فقط وقتی لازم‌اند وارد مسیر می‌شوند.

هدف ساختن یک پروژه نمایشی بزرگ نیست. هدف این است که مسیر MVP با **Cloudflare Pages**، **Nuxt** و اکوسیستم serverless Cloudflare روشن شود.

## Jamstack چیست؟

**Jamstack**، مخفف **JavaScript**، **APIs** و **Markup**، یک مدل ساده برای جدا کردن بخش‌های پایدار و پویاست. صفحه‌هایی که می‌شود زودتر ساخت، در زمان build آماده می‌شوند؛ بخش‌هایی که واقعاً به تعامل، داده یا permission نیاز دارند، از مسیر API می‌آیند.

تفاوت اصلی با سیستم‌هایی مثل وردپرس این نیست که یکی «مدرن‌تر» است و دیگری نه. تفاوت در محل انجام کار است: چه چیزی پیش از request ساخته می‌شود، چه چیزی روی CDN تحویل داده می‌شود، و چه چیزی باید در runtime تصمیم بگیرد.

نکته‌ی اصلی این است که همه‌چیز نباید در لحظه‌ی request ساخته شود. اگر صفحه یا داده‌ای می‌تواند در build آماده شود، بهتر است از همان مسیر سبک‌تر برود. API فقط جایی وارد می‌شود که واقعاً تعامل، auth، ثبت داده یا محاسبه‌ی runtime لازم باشد.

## مرز MVP

برای یک ابزار وب کوچک، مسیر مفید معمولاً این است:

- صفحه‌های عمومی و محتوای پایدار در build ساخته شوند.
- frontend با Nuxt شکل بگیرد.
- داده یا عملیات پویا از API کوچک عبور کند.
- deploy از Git به Cloudflare Pages وصل باشد.
- اگر backend لازم شد، Workers و D1 فقط در همان نقطه وارد شوند.

این یعنی پروژه از اول شبیه یک پلتفرم بزرگ طراحی نمی‌شود. اول مسیر کاربر و داده روشن می‌شود، بعد primitiveهای Cloudflare به اندازه‌ی نیاز اضافه می‌شوند.

## Cloudflare در این مسیر

Cloudflare Pages برای سطح عمومی و deploy مناسب است. اگر API لازم شود، Workers مسیر طبیعی بعدی است. اگر داده‌ی رابطه‌ای لازم شود، D1 می‌تواند کافی باشد. اگر cache، فایل یا state خاص لازم شود، KV، R2 یا Durable Objects وارد بحث می‌شوند.

نکته این نیست که از همه‌ی این سرویس‌ها استفاده کنیم. برعکس، باید هر binding فقط وقتی اضافه شود که یک مسئله واقعی را حل می‌کند.

## Nuxt و Velite

Nuxt لایه‌ی application را می‌دهد: routing، rendering، componentها و مسیر اتصال به Nitro. Velite برای محتوای build-time مفید است، چون Markdown و داده‌های محتوایی را پیش از runtime به ساختار قابل استفاده تبدیل می‌کند.

این ترکیب برای Mohetios.dev هم مهم است. محتوای عمومی نباید برای هر request پردازش سنگین شود. اگر چیزی می‌تواند در build حل شود، همان‌جا باید حل شود.

## محدودیت‌ها

Jamstack برای همه‌چیز جواب پیش‌فرض نیست. اگر محصول realtime جدی، permission پیچیده، dashboard سنگین یا داده‌ی دائماً متغیر داشته باشد، باید بخشی از سیستم runtime بماند.

پس مرز درست این نیست که «همه‌چیز static باشد». مرز درست این است:

```txt
تا جایی که منطقی است build-time
هر جا لازم است runtime
هیچ binding اضافه‌ای بدون نیاز واقعی
```

## سرفصل‌های مسیر

این مسیر آموزشی می‌تواند به این ترتیب جلو برود:

1. ساخت shell پروژه با Nuxt و Cloudflare Pages
2. اضافه کردن محتوای build-time با Velite
3. ساخت API کوچک با Nitro/Workers
4. اضافه کردن D1 فقط وقتی داده‌ی relational لازم شد
5. ساخت dashboard محدود با auth و permission
6. بررسی performance، SEO و مسیر deploy

## لینک‌های مرتبط

- [Jamstack](https://www.jamstack.org/) - سایت رسمی Jamstack
- [Cloudflare Pages](https://pages.cloudflare.com/) - پلتفرم میزبانی Cloudflare
- [Nuxt](https://nuxt.com/) - فریم‌ورک Nuxt
- [Vue.js](https://vuejs.org/) - فریم‌ورک Vue
- [Velite](https://velite.js.org/) - ابزار مدیریت محتوای استاتیک
- [Cloudflare Workers](https://workers.cloudflare.com/) - پلتفرم سرورلس Cloudflare
