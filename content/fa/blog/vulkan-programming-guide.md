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

«Vulkan Programming Guide» رندر را زیر لایه‌ی engine بررسی می‌کند. گراهام سلرز و جان کسنیچ توضیح می‌دهند تصمیم‌های صریح درباره‌ی منابع، دستورها و وضعیت چگونه مسیر داده‌ی اپلیکیشن تا اجرای GPU و نمایش تصویر را می‌سازند.

## مسیر کامل رندر

راه‌اندازی instance و device، صف‌ها، command buffer، حافظه، synchronization، shader، pipeline و نمایش تصویر، موضوع‌های کتاب‌اند. shader در کنار سیستمی بررسی می‌شود که داده و اجرای آن را فراهم می‌کند.

کنترل صریح، مسئولیت بیشتری به اپلیکیشن می‌دهد. عمر منابع، هماهنگی کارها و وضعیت روشن pipeline باید در طراحی دیده شوند. عملیات درست در زمان نامناسب هم می‌تواند فریم نادرست تولید کند.

## کار زیر لایه‌ی engine

برای فهم گرافیک سطح پایین، کنترل مستقیم منابع یا بررسی دقیق‌تر رفتار رندر، مرجع مفهومی مناسبی است. نسبت به آموزش کار با engine، توجه بیشتری به راه‌اندازی می‌خواهد. مشخصات و ابزارهای فعلی نسخه‌ی Vulkan مورد استفاده همچنان لازم‌اند.

## دریافت کتاب

- Khronos: [Vulkan Programming Guide](https://www.khronos.org/news/permalink/vulkan-programming-guide-the-official-guide-to-learning-vulkan)
