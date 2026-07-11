---
title: ابر واژه فارسی
description: یادداشت پروژه‌ای درباره package پایتون برای ساخت word cloud فارسی و فارسی-انگلیسی، با توجه به script، font، و جزئیات rendering.
date: 2017-07-05
updated: 2021-12-20
status: آرشیو پایدار
tags:
  - python
  - nlp
  - persian
  - word-cloud
  - visualization
repo: https://github.com/mohetios/persian-word-cloud
featured: true
---

Persian Word Cloud یک package پایتون برای ساخت تصویر word cloud از متن فارسی است. پروژه روی ecosystem موجود `word_cloud` ساخته می‌شود، اما خروجی را برای متن فارسی و متن mixed فارسی-انگلیسی سازگارتر می‌کند.

شروع پروژه از یک gap عملی بود: خیلی از ابزارهای text visualization فرض می‌کنند متن left-to-right و لاتین است، مرز واژه‌ها ساده است، و رفتار font با فارسی مسئله خاصی ندارد.

Repository:

- [mohetios/persian-word-cloud](https://github.com/mohetios/persian-word-cloud)

## چرا وجود دارد

word cloud ساده به نظر می‌رسد.

واژه‌ها را بشمار.
واژه‌ها را بچین.
یک تصویر بساز.

بعد فارسی وارد سیستم می‌شود و فرض‌های پنهان دیده می‌شوند: direction، shaping، font، tokenization، متن mixed-language، و اینکه تصویر تولیدشده برای انسان چطور خوانده می‌شود.

Persian Word Cloud وجود دارد تا این workflow معمول برای متن فارسی قابل استفاده باشد، نه اینکه فارسی مثل edge case با آن رفتار شود.

## چه چیزی را بررسی می‌کند

package، localized text tooling را در لایه rendering بررسی می‌کند.

قرار نیست یک سیستم NLP کامل باشد. ارزشش کوچک‌تر و عملی‌تر است: یک workflow آشنای پایتون را برای مسیر رایج فارسی ساده‌تر کند.

تمرکز package روی این‌هاست:

- متن ورودی فارسی،
- خروجی mixed فارسی و انگلیسی،
- font handling خوانا،
- نتیجه تصویری شکل‌دار با mask،
- سازگاری با انتظارهای developerها در ecosystem word-cloud پایتون.

## چطور کار می‌کند

package تولید word cloud موجود را wrap و adapt می‌کند تا کاربر فارسی مجبور نباشد برای هر پروژه همان fixهای rendering را دوباره پیدا کند.

همین لایه compatibility مهم‌ترین بخش است. algorithm می‌تواند عمومی باشد، اما last mile باید به script احترام بگذارد.

## چه چیزی یاد گرفتم

ابزارهای developer محلی‌شده اغلب bridgeهای کوچک‌اند.

لازم نیست کل ecosystem را جایگزین کنند. باید یک workflow واقعی را برای کسانی ممکن کنند که زبانشان target پیش‌فرض طراحی نبوده. Persian Word Cloud ثبت خوبی از همین جنس کار است.

## وضعیت فعلی

آرشیو پایدار. پروژه هنوز به‌عنوان artifactی از Persian text tooling مفید و قابل دیدن است، اما پیش از معرفی به‌عنوان پروژه فعال باید با انتظارهای امروز packaging و visualization در پایتون دوباره بررسی شود.

## قدم‌های بعدی

- [ ] اضافه کردن minimal usage example جدید.
- [ ] مستند کردن font و mask handling برای خروجی فارسی.
- [ ] مقایسه package با tooling فعلی word-cloud در پایتون.
- [ ] وصل کردن پروژه به lab note ابزارهای متن فارسی.
