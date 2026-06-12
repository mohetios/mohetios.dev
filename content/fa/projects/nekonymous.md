---
title: نکونیموس
description: یادداشت پروژه‌ای درباره Nekonymous؛ تجربه پیام‌رسانی anonymous و Persian-first روی Telegram با Cloudflare Workers و Durable Objects.
date: 2024-08-19
updated: 2025-04-29
status: پروتوتایپ
tags:
  - cloudflare-workers
  - telegram
  - privacy
  - durable-objects
  - anonymous-messaging
repo: https://github.com/mehotkhan/Nekonymous
website: https://nekonymous.alizemani.ir/
---

Nekonymous یک تجربه پیام‌رسانی anonymous و Persian-first برای Telegram است. کاربر bot را start می‌کند، یک link اختصاصی می‌گیرد، و آن را با دیگران share می‌کند. کسانی که link را باز می‌کنند می‌توانند بدون آشکار شدن identity تلگرامی‌شان برای recipient پیام بفرستند.

جذابیت پروژه فقط ناشناس بودن پیام‌ها نیست. بخش سخت‌تر، مرز محصولی anonymity است: reply، block، abuse control، routing state، encryption at rest، و اینکه recipient دقیقاً چه چیزی باید بداند.

Repository:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
- [nekonymous.alizemani.ir](https://nekonymous.alizemani.ir/)

## چرا وجود دارد

Anonymous messaging از بیرون ساده به نظر می‌رسد.

یک نفر می‌فرستد.  
یک نفر می‌گیرد.  
نامی نشان داده نمی‌شود.

اما یک relay واقعی باید سؤال‌های دقیق‌تری را جواب بدهد. recipient می‌تواند reply کند؟ sender قابل block شدن است؟ اگر link سوءاستفاده شد چه می‌شود؟ کدام identifierها برای routing لازم‌اند و کدام‌ها نباید وارد سطح محصول شوند؟

Nekonymous راه کوچکی بود برای بررسی این سؤال‌ها در یک سطح آشنا برای کاربر ایرانی: Telegram.

## چه چیزی را بررسی می‌کند

پروژه anonymous messaging را به‌عنوان یک hosted relay بررسی می‌کند، نه یک سیستم کامل end-to-end encrypted messaging.

این تفاوت مهم است. messageها می‌توانند در storage رمز شوند و worker می‌تواند با دقت آن‌ها را handle کند، اما سیستم همچنان باید Telegram webhook را پردازش کند، پیام‌ها را route کند، و state کافی برای قابل استفاده بودن bot نگه دارد. قول‌های privacy باید دقیق و صادق بمانند.

## چطور کار می‌کند

پیاده‌سازی از Cloudflare Workers به‌عنوان edge runtime و Durable Objects برای state هماهنگ‌شده پیرامون user یا conversation استفاده می‌کند. Telegram webhook وارد Worker می‌شود، Worker traffic مورد انتظار را validate می‌کند، و flow bot تصمیم می‌گیرد link بسازد، پیام relay کند، reply را route کند، یا کنترل‌های recipient را اعمال کند.

در سطح کلی، سیستم باید این چیزها را مدیریت کند:

- linkهای عمومی اختصاصی،
- پیام‌های inbound anonymous،
- flow پاسخ از سمت recipient،
- block کردن sender،
- محدودیت‌های abuse،
- storage رمز‌شده پیام،
- validation webhook.

صفحه عمومی باید در همین سطح بماند. قانون‌های دقیق anti-abuse و جزئیات حساس پیاده‌سازی لازم نیست منتشر شوند.

## چه چیزی یاد گرفتم

قابلیت‌های privacy پیش از اینکه فنی باشند، محصولی‌اند.

اگر UI به کاربر وعده‌ای قوی‌تر از چیزی بدهد که سیستم واقعاً می‌تواند ثابت کند، محصول گمراه‌کننده می‌شود. Nekonymous یادآوری خوبی است که guaranteeها باید دقیق نام‌گذاری شوند: anonymous بودن برای recipient همان قول anonymous بودن برای همه systemها نیست.

## وضعیت فعلی

پروتوتایپ. پروژه به‌عنوان تجربه‌ای در privacy، bot UX، و edge state ارزش دارد، اما نباید مثل یک secure messaging platform کامل معرفی شود.

## قدم‌های بعدی

- [ ] مستند کردن boundaryهای Durable Object در سطح عمومی و غیرحساس.
- [ ] نوشتن checklist کوتاه abuse-control برای anonymous messaging.
- [ ] اضافه کردن یادداشت deploy برای Telegram webhook روی Cloudflare Workers.
- [ ] تصمیم درباره اینکه کدام جزئیات encryption به lab note جدا تبدیل شود.
