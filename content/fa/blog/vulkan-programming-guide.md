---
title: Vulkan Programming Guide
date: 2026-03-22
thumbnail: /content/vulkan-programming-guide-cover.webp
description: یادداشت‌هایی از راهنمای گراهام سلرز و جان کسنیچ برای Vulkan، برنامه‌نویسی گرافیکی صریح، pipeline رندر و کنترل GPU.
tags:
- book-notes
- vulkan
- gpu-programming
- graphics-pipeline
- explicit-apis
---

## یادداشت‌های مطالعه

_Vulkan Programming Guide_ درباره‌ی برنامه‌نویسی گرافیکی صریح است. Vulkan کنترلی بیشتر از APIهای گرافیکی قدیمی‌تر می‌دهد، اما این کنترل مسئولیت بیشتری هم می‌آورد.

کتاب rendering را یک سیستم می‌بیند: instance، device، queue، command buffer، حافظه، synchronization، shader و presentation همه باید با هم جور شوند.

## ایده‌های مفید

### کنترل صریح هزینه دارد

Vulkan خیلی از تصمیم‌های پنهان را حذف می‌کند. این قدرت می‌دهد، اما یعنی برنامه باید جزئیاتی را خودش مدیریت کند که APIهای دیگر پشت صحنه حل می‌کردند.

### synchronization در مرکز است

باگ گرافیکی اغلب باگ timing است. Vulkan synchronization را از همان اول بخشی از طراحی می‌کند.

### pipeline خودش برنامه است

rendering فقط کد shader نیست؛ کل pipeline است: داده، state، command و اجرای GPU.

## چرا نزدیک نگهش می‌دارم

مرجعی برای فهم کار گرافیکی زیر لایه‌ی engine؛ به‌خصوص وقتی performance، کنترل یا debug عمیق مهم است.

## دریافت کتاب

- Khronos: [Vulkan Programming Guide](https://www.khronos.org/news/permalink/vulkan-programming-guide-the-official-guide-to-learning-vulkan)
