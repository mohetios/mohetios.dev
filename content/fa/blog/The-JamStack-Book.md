---
title: 'کتاب Jamstack'
date: 2024-09-17T16:33:46.294Z
thumbnail: /content/The-Jamstack-Book.webp
description: 'یادداشتی درباره کتاب The Jamstack Book و اینکه معماری Jamstack چطور با JavaScript، API و Markup مسیر ساخت سایت‌های سریع‌تر و ساده‌تر را توضیح می‌دهد.'
tags:
  - کتاب
  - jamstack
  - static-site-generators
  - headless-cms

cat: library
toc: true
intro: false
comments: true
newsletter: true
---

## یادداشت خواندن

این یادداشت نگاهی به کتاب **The Jamstack Book: Beyond Static Sites with JavaScript, APIs, and Markup** است؛ کتابی درباره ساخت سایت‌ها و اپلیکیشن‌هایی که بخش زیادی از کارشان در زمان build آماده می‌شود و برای بخش‌های پویا به API تکیه می‌کنند.

تمرکز من اینجا بیشتر روی مدل ذهنی کتاب است: چرا Jamstack برای پروژه‌های محتوایی، ابزارهای کوچک و تیم‌هایی که نمی‌خواهند درگیر زیرساخت سنگین شوند مفید است.

## نکته‌ی اصلی

Jamstack برای من قبل از اینکه یک stack باشد، یک مرز طراحی است:

چه چیزی می‌تواند پیش از request ساخته شود، و چه چیزی واقعاً باید هنگام تعامل کاربر زنده بماند؟

وقتی این مرز درست انتخاب شود، سایت محتوایی ساده‌تر می‌شود. build، CDN، Git و APIهای کوچک کنار هم می‌نشینند و پروژه لازم نیست برای هر صفحه یک server runtime سنگین نگه دارد.

## چه چیزی از کتاب می‌ماند

کتاب از سایت‌های static شروع می‌کند، اما همان‌جا نمی‌ماند. درباره‌ی static site generatorها، Headless CMS، APIها، serverless functionها، فرم‌ها، auth و migration حرف می‌زند. ارزشش در همین ترکیب است: Jamstack را نه مثل «فقط HTML»، بلکه مثل یک مدل عملی برای جدا کردن بخش‌های پایدار و پویا نشان می‌دهد.

برای پروژه‌هایی مثل سایت‌های شخصی، notebookهای فنی، landingهای کوچک، و ابزارهای محتوایی، این نگاه هنوز مفید است. مخصوصاً وقتی ownership محتوا و سادگی deploy مهم‌تر از داشتن admin panel بزرگ باشد.

## trade-off

Jamstack قرار نیست همه‌ی مسئله‌های وب را حل کند. اگر محصول پر از state زنده، permission پیچیده یا داده‌ی شدیداً پویا باشد، بخش‌های runtime دوباره برمی‌گردند.

اما برای محتوایی که می‌شود زودتر ساخت و با CDN تحویل داد، ساده‌کردن request path ارزش زیادی دارد. همین ایده در Mohetios.dev هم مهم است: محتوا تا جای ممکن build-time بماند و backend فقط جایی وارد شود که واقعاً نیاز است.

## منابع

- **Manning Publications**: [The Jamstack Book](https://www.manning.com/books/the-jamstack-book)
