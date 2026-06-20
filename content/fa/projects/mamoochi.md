---
title: مَموچی
description: یادداشت پروژه‌ای درباره Mamoochi؛ فریم‌ورک Jamstack متن‌باز برای سیستم‌های محتوایی Nuxt، Vue، و Cloudflare-friendly.
date: 2024-10-31
updated: 2025-05-19
status: آرشیو فعال
tags:
  - jamstack
  - nuxt
  - vue
  - cloudflare
  - open-source
repo: https://github.com/bagche/mamoochi
website: https://mamoochi.mohetios.dev/
featured: true
---

Mamoochi یک فریم‌ورک Jamstack متن‌باز از فضای Bagche است. جایی بین starter template و product platform قرار می‌گیرد: از یک پروژه خام Nuxt opinionatedتر است، اما هنوز آن‌قدر کوچک هست که بتوان آن را بررسی کرد.

این پروژه هم‌خانواده Totoro و Mohetios.dev است. هر سه به محتوا، صفحه‌های عمومی، ساختار نزدیک به Git، و deploy بدون server سنگین اهمیت می‌دهند. Mamoochi این الگو را به سمت استفاده دوباره می‌برد.

Repository:

- [bagche/mamoochi](https://github.com/bagche/mamoochi)
- [mamoochi.mohetios.dev](https://mamoochi.mohetios.dev/)

## چرا وجود دارد

یک content system معمولاً دو بار ساخته می‌شود.

اول به شکل یک website.
بعد به شکل یک pattern.

Mamoochi نسخه دوم همین غریزه است: تصمیم‌هایی که در سایت‌های کوچک publishing و product تکرار می‌شوند را آن‌قدر روشن کند که پروژه بعدی بتواند از آن‌ها شروع کند.

## چه چیزی را بررسی می‌کند

پروژه بررسی می‌کند که یک فریم‌ورک Jamstack چقدر باید ساختار بدهد، پیش از اینکه بیش از حد سخت و بسته شود.

برای این چیزها اهمیت قائل است:

- Nuxt و Vue به‌عنوان لایه application،
- خروجی static یا edge-friendly،
- محتوایی که نزدیک repository می‌ماند،
- فرض‌های deploy سازگار با Cloudflare،
- conventionهایی که در سطح‌های مختلف Bagche قابل استفاده دوباره باشند.

جاه‌طلبی فریم‌ورکی بخش جالب پروژه است. starter کمک می‌کند یک پروژه شروع شود. framework تلاش می‌کند تصمیم‌ها را بین پروژه‌ها حفظ کند: layout، content rules، routing، deploy، و workflow ویرایش.

## چطور کار می‌کند

Mamoochi معماری را نزدیک به stack وب نگه می‌دارد، نه پشت یک CMS بزرگ. Nuxt routing و rendering را می‌دهد. Vue سطح component را می‌سازد. deploy سازگار با Cloudflare runtime را کوچک نگه می‌دارد.

این شکل برای محصول‌های محتوایی مفید است؛ جاهایی که به سطح عمومی و workflow ویرایش نیاز دارند، اما نمی‌خواهند یک application database-backed در مرکز همه چیز قرار بگیرد.

## چه چیزی یاد گرفتم

فریم‌ورک‌های publishing متن‌باز، شرط‌بندی‌های کوچک زیرساختی‌اند. نشان می‌دهند maintainer فکر می‌کند یک سایت به چه چیزهایی نیاز دارد و از چه چیزهایی باید دور بماند.

Mamoochi مفید است چون همین باورها را قابل دیدن می‌کند: source قابل بررسی بماند، مسیر deploy ساده بماند، و نوشتن یا iteration محصولی در مرکز کار بماند.

## وضعیت فعلی

آرشیو فعال. repository هنوز بخشی از داستان فنی Bagche است، اما این صفحه نباید پیش از روشن شدن API عمومی و usage story، آن را مثل یک اکوسیستم محصولی بزرگ نشان دهد.

## قدم‌های بعدی

- [ ] مستند کردن API فریم‌ورک و ساختار پروژه مورد انتظار.
- [ ] اضافه کردن مقایسه با Totoro و Mohetios.dev.
- [ ] ثبت فرض‌های deploy روی Cloudflare.
- [ ] تصمیم درباره اینکه Mamoochi داستان فنی اصلی Bagche است یا یکی از پروژه‌های داخل آن.
