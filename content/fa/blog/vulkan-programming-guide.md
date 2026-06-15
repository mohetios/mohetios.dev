---
title: Vulkan Programming Guide
date: 2026-03-22
thumbnail: /content/vulkan-programming-guide-cover.webp
description: یادداشت‌هایی از راهنمای گراهام سلرز و جان کسنیچ برای Vulkan، برنامه‌نویسی گرافیکی صریح، pipeline رندر و کنترل GPU.
tags:
  - books
  - vulkan
  - gpu-programming
  - graphics-api
---

## یادداشت‌های مطالعه

_Vulkan Programming Guide_ درباره برنامه‌نویسی گرافیکی صریح است. Vulkan کنترل بیشتری از APIهای گرافیکی قدیمی‌تر می‌دهد، اما آن کنترل با مسئولیت بیشتر همراه است.

مفید است چون rendering را سیستم می‌داند: راه‌اندازی instance، device، queue، command buffer، حافظه، synchronization، shader و presentation همه باید با هم جور شوند.

## ایده‌های مفید

### کنترل صریح هزینه دارد

Vulkan خیلی تصمیم‌های پنهان را برمی‌دارد. قدرتمند است، اما یعنی اپلیکیشن باید جزئیاتی را مدیریت کند که APIهای دیگر قبلاً نرم می‌کردند.

### synchronization مرکزی است

باگ گرافیکی اغلب باگ timing است. Vulkan synchronization را بخش اول طراحی می‌کند.

### pipeline خود برنامه است

rendering فقط کد shader نیست. کل pipeline داده، state، command و اجرای GPU است.

## چرا نزدیک نگهش می‌دارم

مرجع برای فهم کار گرافیکی زیر لایه engine. وقتی performance، کنترل یا debug عمیق مهم است مفید است.

## دریافت کتاب

- Khronos: [Vulkan Programming Guide](https://www.khronos.org/news/permalink/vulkan-programming-guide-the-official-guide-to-learning-vulkan)
