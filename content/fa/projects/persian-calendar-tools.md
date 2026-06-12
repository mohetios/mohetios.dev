---
title: ابزارهای تقویم فارسی
description: یادداشت پروژه‌ای درباره چند تجربه کوچک Vue برای تقویم فارسی؛ بررسی Jalali date UI، RTL layout، و جزئیات interaction محلی.
date: 2023-12-16
updated: 2024-03-07
status: آرشیو
tags:
  - vue
  - persian-calendar
  - jalali
  - date-picker
repo: https://github.com/mehotkhan/zcalendar
website: https://mehotkhan.github.io/zcalendar/
---

ابزارهای تقویم فارسی دو تجربه مرتبط Vue را کنار هم نگه می‌دارد: `simple-taghvim` و `zcalendar`. پروژه‌ها کوچک‌اند، اما داخل مسئله بزرگ‌تری قرار می‌گیرند که من زیاد به آن برمی‌گردم: رابط فارسی نباید حس یک component چپ‌به‌راست ترجمه‌شده را بدهد.

تقویم این مسئله را خیلی زود نشان می‌دهد. grid ساده است. انتظارهای کاربر ساده نیست.

Repositoryها:

- [mehotkhan/zcalendar](https://github.com/mehotkhan/zcalendar)
- [mehotkhan/simple-taghvim](https://github.com/mehotkhan/simple-taghvim)

## چرا وجود دارد

خیلی از date componentها localization را به تعویض labelها کاهش می‌دهند. نام ماه‌ها را عوض کن، شاید direction را هم تغییر بده، و کار تمام به نظر می‌رسد.

برای UI تقویم فارسی معمولاً این کافی نیست. Jalali date، خواندن RTL، متن فارسی-انگلیسی، layout فشرده موبایل، و interaction با keyboard یا pointer همگی روی حس طبیعی بودن component اثر می‌گذارند.

این تجربه‌ها برای بررسی همین لایه کوچک اما مهم کیفیت محصول بودند.

## چه چیزی را بررسی می‌کند

پروژه‌ها calendar UI را مثل یک primitive محلی‌شده بررسی می‌کنند:

- labelهای ماه و روز که با زبان جور باشند،
- نمایش تاریخ Jalali،
- grid فشرده اما خوانا در RTL،
- الگوهای interaction که فرض ذهنی Gregorian ندارند،
- component کوچکی که بعداً بتواند در travel، publishing، reminder، یا ابزارهای شخصی استفاده شود.

هدف claim کردن یک date library کامل نیست. هدف نگه داشتن lessonهایی است که وقتی یک component معمولی با یک زبان واقعی برخورد می‌کند ظاهر می‌شوند.

## چطور کار می‌کند

هر دو پروژه از Vue استفاده می‌کنند تا لایه interaction مستقیم و قابل بررسی بماند. خروجی قابل دیدن، calendar یا date picker است؛ اما کار اصلی در decisionهای display اتفاق می‌افتد: نام‌گذاری تاریخ‌ها، خوانایی grid، رفتار controlهای compact، و قابل فهم ماندن متن mixed-direction.

## چه چیزی یاد گرفتم

localized tooling اغلب در جاهای آرام شکست می‌خورد.

مسئله فقط ترجمه نیست. font rhythm، direction، spacing، labelها، defaultها، و assumptionهای کوچک هم مهم‌اند. تقویم آزمون خوبی است چون هر فرض غلطی در یک صفحه دیده می‌شود.

## وضعیت فعلی

آرشیو. repositoryها به‌عنوان تجربه‌های تاریخی UI و ورودی برای componentهای فارسی‌محور آینده مفیدند، اما نباید مثل toolkit فعال تقویم معرفی شوند.

## قدم‌های بعدی

- [ ] تصمیم درباره اینکه `simple-taghvim` و `zcalendar` در یک صفحه مشترک بمانند یا جدا شوند.
- [ ] اضافه کردن نکته‌های implementation درباره date conversion و display logic.
- [ ] ثبت demo عمومی `zcalendar` به‌عنوان reference تصویری.
- [ ] استخراج lessonهای قابل استفاده دوباره برای lab note درباره date interface محلی.
