---
title: وب اسمبلی در عمل
date: 2023-09-01T16:33:46.294Z
thumbnail: /content/wasm-in-actions.webp
description: 'یادداشتی درباره کتاب WebAssembly in Action و مسیر آوردن کدهای C/C++/Rust به مرورگر با Wasm، با تمرکز روی کار عملکردی و اتصال به JavaScript.'
tags:
  - کتاب
  - webassembly
  - wasm
  - browser-performance

cat: library
toc: true
intro: false
comments: true
newsletter: true
---

## یادداشت خواندن

**WebAssembly in Action** برای فهمیدن مرز بین JavaScript و کدهای کامپایل‌شده مفید است.

مسئله اصلی این نیست که WebAssembly جای JavaScript را بگیرد. مسئله این است که وقتی بخشی از کار واقعاً محاسباتی است، یا کدی از C، C++ یا Rust از قبل وجود دارد، مرورگر فقط محیط UI نباشد؛ بتواند یک قطعه compute مشخص را هم با قرارداد روشن اجرا کند.

## نکته‌ای که برای من مهم است

Wasm وقتی جالب می‌شود که مرز کار روشن باشد.

اگر یک رابط معمولی می‌سازیم، JavaScript کافی است. اما وقتی بخشی از کار به پردازش تصویر، parsing، simulation، cryptography یا استفاده‌ی دوباره از کد موجود نزدیک می‌شود، WebAssembly شکل مسئله را عوض می‌کند. دیگر فقط درباره‌ی UI نیستیم؛ درباره‌ی مرز بین runtime مرورگر و کدی حرف می‌زنیم که از بیرون دنیای JavaScript آمده است.

این کتاب برای همین مرز مفید است. از module، memory، import/export، toolchain و debug حرف می‌زند و کمک می‌کند Wasm از یک buzzword به یک قطعه‌ی قابل طراحی تبدیل شود.

## مسیر کتاب

مسیر کلی کتاب از ساخت یک module ساده شروع می‌شود و بعد به اتصال آن با JavaScript، ابزارهای build، debug، پردازش موازی و اجرای خارج از مرورگر نزدیک می‌شود.

برای من، فهرست موضوع‌ها بیشتر از خود مثال‌ها ارزش دارد:

- ساختار module و فرمت متنی WAT
- کامپایل کد C/C++ به Wasm
- عبور داده از مرز JavaScript/Wasm
- memory و pointerها
- Emscripten، WASI و محیط‌های اجرایی
- debug و تست

این‌ها همان جاهایی‌اند که پروژه‌های کوچک WASM معمولاً مبهم می‌شوند. کد کامپایل می‌شود، اما معلوم نیست ownership حافظه کجاست، خطا را چطور باید دید، یا مرز API چقدر باید باریک بماند.

## چه زمانی سراغش بروم

اگر هدف فقط ساخت UI است، این کتاب احتمالاً زود است. اما اگر می‌خواهی بفهمی چطور یک قطعه‌ی compute-heavy را به مرورگر بیاوری، یا چرا مرز JavaScript/Wasm باید طراحی شود نه فقط glue code، خواندنش کمک می‌کند.

نکته‌ی مهم این است که Wasm راه‌حل پیش‌فرض نیست. باید هزینه‌ی toolchain، debug و مرز داده را هم حساب کرد. وقتی آن هزینه‌ها با مسئله جور باشد، تازه ارزشش دیده می‌شود.

## منابع

- **Manning Publications**: [WebAssembly in Action](https://www.manning.com/library/webassembly-in-action)
