---
title: Learning Vulkan
date: 2026-03-22
thumbnail: /content/learning-vulkan-cover.webp
description: یادداشت‌هایی از مقدمه عملی پارمیندر سینگ به Vulkan و پایه‌های برنامه‌نویسی صریح GPU.
tags:
  - books
  - vulkan
  - gpu-programming
  - graphics
---

## یادداشت‌های مطالعه

_Learning Vulkan_ مسیر قابل‌فهم‌تری به یک API سخت است. Vulkan منحنی راه‌اندازی تندی دارد و کتابی که قطعات را قدم‌به‌قدم راه می‌برد خیلی از مطالعه پراکنده جلو می‌زند.

هدف فقط کشیدن مثلث نیست. هدف فهمیدن است که چرا این همه object، buffer، descriptor و نقطه synchronization وجود دارد.

## ایده‌های مفید

### راه‌اندازی مدل را آموزش می‌دهد

مسیر طولانی initialization تصادفی نیست. نشان می‌دهد Vulkan چطور به سخت‌افزار، queue، حافظه، surface و presentation فکر می‌کند.

### منابع به ownership نیاز دارند

buffer، image، descriptor و command buffer همه به مدیریت صریح lifetime نیاز دارند. ownership نگرانی طراحی اصلی می‌شود.

### rendering هماهنگی است

یک frame نتیجه کار هماهنگ CPU و GPU است. Vulkan این هماهنگی را visible می‌کند.

## چرا نزدیک نگهش می‌دارم

همراه مفید وقتی می‌خواهم مدل ذهنی Vulkan را از پایه دوباره بسازم.

## دریافت کتاب

- Google Books: [Learning Vulkan](https://books.google.com/books/about/Learning_Vulkan.html?id=eczcDgAAQBAJ)
