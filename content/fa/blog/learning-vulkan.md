---
title: Learning Vulkan
date: 2026-03-22
thumbnail: /content/learning-vulkan-cover.webp
description: یادداشت‌هایی از مقدمه عملی پارمیندر سینگ به Vulkan و پایه‌های برنامه‌نویسی صریح GPU.
tags:
- book-notes
- vulkan
- gpu-programming
- graphics-pipeline
- resource-management
---

## یادداشت‌های مطالعه

_Learning Vulkan_ راه قابل‌فهم‌تری به یک API سخت باز می‌کند. راه‌اندازی Vulkan شیب تندی دارد و کتابی که قطعه‌ها را قدم‌به‌قدم کنار هم می‌گذارد، خیلی بهتر از خواندن پراکنده است.

هدف فقط کشیدن یک مثلث نیست؛ هدف این است که بفهمی چرا این همه object، buffer، descriptor و نقطه‌ی synchronization لازم است.

## ایده‌های مفید

### راه‌اندازی، مدل را یاد می‌دهد

مسیر طولانی initialization تصادفی نیست. نشان می‌دهد Vulkan سخت‌افزار، queue، حافظه، surface و presentation را چطور می‌بیند.

### هر منبع صاحب می‌خواهد

buffer، image، descriptor و command buffer همه مدیریت صریح lifetime می‌خواهند. ownership به یکی از دغدغه‌های اصلی طراحی تبدیل می‌شود.

### rendering یعنی هماهنگی

هر frame نتیجه‌ی کار هماهنگ CPU و GPU است و Vulkan این هماهنگی را پنهان نمی‌کند.

## چرا نزدیک نگهش می‌دارم

همراه خوبی است وقتی می‌خواهم مدل ذهنی Vulkan را از پایه دوباره بسازم.

## دریافت کتاب

- Google Books: [Learning Vulkan](https://books.google.com/books/about/Learning_Vulkan.html?id=eczcDgAAQBAJ)
