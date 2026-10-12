---
title: Learning Domain-Driven Design
date: 2026-05-28
thumbnail: /content/learning-domain-driven-design.webp
description: یادداشت‌هایی از راهنمای عملی ولاد خونونوف برای هم‌راستا کردن معماری نرم‌افزار با دامنه‌های کسب‌وکار.
tags:
- book-notes
- domain-driven-design
- software-architecture
- bounded-contexts
- domain-modeling
---

## یادداشت‌های مطالعه

_Learning Domain-Driven Design_ پل عملی‌ای بین معماری و فهم کسب‌وکار است.

به کار می‌آید چون DDD را آیین یا تمرین واژه‌سازی معرفی نمی‌کند. مدل‌سازی دامنه را راهی می‌داند برای فهمیدن اینکه پیچیدگی نرم‌افزار از کجا می‌آید و کجا مدل‌های مختلف به مرز جداگانه نیاز دارند.

درس اصلی برای مهندسی محصول ساده است: معماری سیستم باید مسئله‌ی کسب‌وکار را بازتاب دهد، نه فقط لایه‌ها یا سرویس‌هایی را که تیم مهندسی دوست دارد.

## ایده‌های مفید

### از دامنه شروع کن

پیش از microservice، event sourcing، CQRS یا هر الگوی دیگری، تیم باید دامنه را بفهمد. کدام بخش‌ها core هستند؟ کدام supporting؟ کدام آن‌قدر generic‌اند که می‌شود خریدشان یا برون‌سپاری‌شان کرد؟

همین تفکیک جلوی دو خطا را می‌گیرد: overengineering در بخش‌های کم‌ارزش، و سرمایه‌گذاری کم در جایی که مزیت محصول ساخته می‌شود.

### مرز context مرز زبان است

bounded context فقط واحد deploy نیست؛ جایی است که واژه‌ها معنای مشخص دارند. اگر دو تیم یک واژه را با دو معنا به کار ببرند، نرم‌افزار احتمالاً به مرز ترجمه هم نیاز دارد.

### الگوهای tactical به context بستگی دارند

transaction script، active record، domain model، event-sourced model، CQRS و saga سطح بلوغ نیستند؛ ابزارند. الگوی درست به پیچیدگی و میزان تغییر منطق کسب‌وکار بستگی دارد.

## چرا نزدیک نگهش می‌دارم

وقتی به کار می‌آید که codebase مفاهیم کسب‌وکار را قاطی می‌کند و هر feature یک coupling تصادفی تازه می‌سازد. واژگانی می‌دهد برای جداکردن دغدغه‌ها، بدون اینکه معماری به نمودارکشی انتزاعی تبدیل شود.

## دریافت کتاب

- O'Reilly: [Learning Domain-Driven Design](https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/)
