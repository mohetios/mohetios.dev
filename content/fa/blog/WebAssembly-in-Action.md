---
title: وب اسمبلی در عمل
date: 2023-09-01T16:33:46.294Z
thumbnail: /content/wasm-in-actions.webp
description: 'یادداشتی درباره کتاب WebAssembly in Action و مسیر آوردن کدهای C/C++/Rust به مرورگر با Wasm، با تمرکز روی کار عملکردی و اتصال به JavaScript.'
tags:
- book-notes
- webassembly
- browser-performance
- native-modules
- javascript-interop

cat: library
toc: true
intro: false
comments: true
newsletter: true
---

آوردن کد کامپایل‌شده به مرورگر، مرزی تازه برای حافظه، انتقال داده و اجرا ایجاد می‌کند. «WebAssembly in Action» این مرز را با مثال‌های C/C++ و اتصال به JavaScript و HTML توضیح می‌دهد. کتاب به ادغام module در اپلیکیشن، به اندازه‌ی کامپایل آن توجه دارد.

## کار با moduleها

مسیر از ساختار module و کامپایل شروع می‌شود و به استفاده‌ی دوباره از کد C++، فراخوانی JavaScript و ارتباط با function pointer می‌رسد. لینک‌کردن پویا، پردازش موازی با web worker و pthread، اجرا در Node.js، فرمت متنی WAT، debug و تست هم بررسی می‌شوند.

این ترتیب، قرارداد بین زبان‌ها را روشن می‌کند: ورودی و خروجی module چیست، حافظه چگونه مدیریت می‌شود و داده چطور منتقل می‌شود؟ برای پردازش تصویر، parsing، simulation یا cryptography، همین جزئیات اهمیت دارند. زبان‌هایی مثل Rust هم به Wasm کامپایل می‌شوند، اما تمرکز مثال‌های کتاب روی C/C++ است.

## پیش‌نیاز و محدوده

آشنایی مقدماتی با C/C++، JavaScript و HTML لازم است. کتاب برای انتقال کد موجود یا محاسبه‌ی مشخص به وب مفید است. نمونه‌ها باید کنار مستندات فعلی ابزارها خوانده شوند؛ بهبود سرعت هم به اندازه‌گیری نیاز دارد و هزینه‌ی ساخت و انتقال داده را باید حساب کرد.

## دریافت کتاب

- **Manning Publications**: [WebAssembly in Action](https://www.manning.com/library/webassembly-in-action)
