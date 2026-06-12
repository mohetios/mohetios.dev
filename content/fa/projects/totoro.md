---
title: توتورو
description: یادداشت پروژه‌ای درباره starter Jamstack با Nuxt و Decap CMS؛ بررسی Git-backed publishing، static deployment، و مالکیت پایدار محتوا.
date: 2023-08-24
updated: 2023-09-09
status: آرشیو
tags:
  - nuxt
  - jamstack
  - decap-cms
  - cloudflare-pages
  - static-blog
repo: https://github.com/mehotkhan/totoro
website: https://totoro.alizemani.ir/
---

Totoro یک starter کوچک Jamstack برای publishing بود: Nuxt برای application shell، Decap CMS برای ویرایش Git-backed، و Cloudflare Pages برای deploy.

این فقط یک template دیگر برای portfolio نبود. ثبت یک ایده مشخص درباره publishing بود: سایت شخصی یا تیم کوچک باید قابل ویرایش باشد، بدون اینکه به محصولی database-backed تبدیل شود.

Repository:

- [mehotkhan/totoro](https://github.com/mehotkhan/totoro)

## چرا وجود دارد

Publishing systemها معمولاً drift می‌کنند.

اول یک پوشه Markdown وجود دارد.  
بعد CMS اضافه می‌شود.  
بعد CMS source of truth می‌شود.  
بعد جابه‌جایی سایت از نوشتن برای آن سخت‌تر می‌شود.

Totoro تلاشی بود برای نگه داشتن یک خط کوچک‌تر: editor یک interface قابل استفاده داشته باشد، اما محتوا نزدیک repository بماند.

## چه چیزی را بررسی می‌کند

پروژه فضای بین Markdown دستی و CMS کامل را بررسی می‌کند.

از این‌ها استفاده می‌کند:

- Nuxt برای routing، layout، و application layer،
- Decap CMS برای ویرایش Git از داخل browser،
- Cloudflare Pages برای static deployment،
- content فایل‌محور تا archive قابل انتقال بماند.

سؤال محصولی ساده است: یک سایت چقدر می‌تواند راحتی ویرایش بگیرد، بدون اینکه محتوا پشت runtime service پنهان شود؟

## چطور کار می‌کند

Totoro runtime را نازک نگه می‌دارد. سایت می‌تواند به‌عنوان سطح عمومی static deploy شود، و Decap CMS روی Git یک interface نوشتن راحت‌تر فراهم کند.

به این شکل source of truth قابل بررسی می‌ماند. postها هنوز file هستند. repository هنوز داستان سایت را نشان می‌دهد. CMS workflow را بهتر می‌کند، اما مالک archive نمی‌شود.

## چه چیزی یاد گرفتم

یک publishing system نباید migration آینده خودش را سخت کند.

اگر یک سایت شخصی قرار است سال‌ها بماند، محتوا باید portable بماند، حتی وقتی interface اطراف آن تغییر می‌کند. Totoro این ایده را برای من روشن‌تر کرد، و Mohetios.dev نسخه بعدی همین دغدغه با pipeline محتوایی متفاوت است.

## وضعیت فعلی

آرشیو. Totoro به‌عنوان پروژه تاریخی publishing system و زمینه‌ای برای معماری محتوای فعلی Mohetios.dev مفید است.

## قدم‌های بعدی

- [ ] مستند کردن content model و folder layout اولیه.
- [ ] مقایسه Totoro با pipeline محتوای فعلی Mohetios.dev.
- [ ] اضافه کردن screenshot یا archive link اگر سایت deploy شده هنوز در دسترس است.
- [ ] تصمیم درباره اینکه این صفحه historical project page بماند یا وارد یادداشت گسترده‌تر publishing systems شود.
