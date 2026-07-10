---
title: WebAssembly با Nuxt و TinyGo
description: یادداشت‌هایی از تجربه‌های TinyGo و Nuxt برای آموزش WASM با مثال‌های کوچک و browser-first.
date: 2023-09-09
updated: 2024-06-12
status: Exploring
tags:
  - webassembly
  - tinygo
  - nuxt
  - go
  - wasm
---

مسیر WebAssembly برای من از یک سؤال آموزشی شروع شد:

اولین مثال مفید WASM چقدر می‌تواند کوچک باشد؟

Repositoryهای مرتبط:

- [mohetios/tinygo-wasm-tuts](https://github.com/mohetios/tinygo-wasm-tuts)
- private `nuxt-wasm` experiments

## شکل آموزشی مسئله

WASM خیلی زود abstract می‌شود. هم‌زمان باید درباره‌ی binary module، import، memory، runtime، toolchain و APIهای مرورگر فکر کرد. برای شروع یادگیری، این حجم از مفهوم می‌تواند مسیر را سنگین کند.

TinyGo کمک می‌کند چون مسیر کوتاهی از کد Go تا یک module قابل load در مرورگر می‌دهد. Nuxt لایه‌ی دوم را اضافه می‌کند: یک اپ واقعی چطور module WASM را load، isolate و call کند، بدون اینکه صفحه تبدیل به چند script tag پراکنده شود؟

مسیر آموزشی مفید برای من این است:

- یک تابع کوچک Go بنویس.
- آن را با TinyGo کامپایل کن.
- خروجی را در مرورگر load کن.
- داده را از مرز JavaScript/WASM عبور بده.
- نتیجه را داخل یک UI واقعی نشان بده.
- مسیر build و debug را مستند کن.

## یادداشت محصولی

WASM باید جای خودش را به‌دست بیاورد. برای بیشتر UIها JavaScript کافی است. WASM وقتی معنی دارد که مرورگر به سرعت بیشتر، portability، استفاده‌ی دوباره از کد غیر JavaScript، یا runtime محدود برای یک کار مشخص نیاز داشته باشد.

پروژه‌های جالب WASM همان‌هایی هستند که مرزشان روشن است: پردازش تصویر، پردازش متن، simulation، parsing، cryptography یا کارهای compute-heavy دیگر.

برای من، ارزش این مسیر فقط در «اجرای Go در مرورگر» نیست. ارزشش در فهمیدن این مرز است: کدام بخش باید در JavaScript بماند و کدام بخش واقعاً از WASM سود می‌برد؟

## کارهای بعدی

- [ ] `tinygo-wasm-tuts` را به یک lab series مرحله‌به‌مرحله تبدیل کن.
- [ ] یک نمونه‌ی Nuxt اضافه کن که WASM module را از app runtime load کند.
- [ ] commandهای build، فایل‌های تولیدشده و مسیر load در مرورگر را مستند کن.
- [ ] یک کار واقعی در پردازش متن فارسی یا visualization پیدا کن که استفاده از WASM را توجیه کند.
