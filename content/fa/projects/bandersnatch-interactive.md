---
title: بندراسنچ اینتراکتیو
description: یادداشت پروژه‌ای درباره یک تجربه آرشیوی HTML5 video؛ بررسی branching playback، فایل local، و state machine در مرورگر.
date: 2019-01-16
updated: 2025-12-16
status: آرشیو پایدار
tags:
  - interactive-video
  - html5-video
  - javascript
  - branching-narrative
repo: https://github.com/mohetios/BandersnatchInteractive
website: https://mohetios.github.io/BandersnatchInteractive/
featured: true
---

Bandersnatch Interactive یک تجربه قدیمی و متن‌باز در مرورگر بود برای پخش یک داستان تعاملی از روی فایل ویدیویی local. پروژه حول _Black Mirror: Bandersnatch_ ساخته شد، اما محصول رسمی Netflix نیست، clone تجاری Netflix نیست، و پروژه توزیع محتوا هم نیست.

ایده محدود بود: اگر کاربر فایل ویدیویی طولانی را خودش داشته باشد، آیا می‌شود ساختار شاخه‌ای داستان را با primitiveهای ساده وب در مرورگر بازسازی کرد؟

Repository:

- [mohetios/BandersnatchInteractive](https://github.com/mohetios/BandersnatchInteractive)
- [Interactive demo](https://mohetios.github.io/BandersnatchInteractive/)

## چرا وجود دارد

Interactive video معمولاً مثل یک مسئله رسانه‌ای توضیح داده می‌شود، اما بخش جالب این تجربه بیشتر به state محصول نزدیک بود.

یک فایل خطی، زمان دارد.  
یک داستان شاخه‌ای، انتخاب دارد.  
player باید این دو را به هم وصل کند، بدون اینکه مالک media باشد.

همین محدودیت پروژه را کوچک، قابل ساختن، و هنوز قابل یادآوری کرد.

## چه چیزی را بررسی می‌کند

پروژه، branching playback را مثل یک state machine در مرورگر نگاه می‌کند.

هر انتخاب مشخص می‌کند segment بعدی کدام است. player زمان فعلی را دنبال می‌کند، در نقطه‌های تصمیم overlay نشان می‌دهد، ورودی keyboard را می‌گیرد، بین segmentها حرکت می‌کند، و سعی می‌کند مکانیک کار را از تجربه تماشا جدا نگه دارد.

محدودیت local-file مهم است. app فایل ویدیو را upload یا host نمی‌کند. مرورگر runtime می‌شود و لایه تعاملی کنار فایل خود کاربر قرار می‌گیرد.

## چطور کار می‌کند

پیاده‌سازی روی HTML5 video element ساخته شده است:

- کشیدن فایل ویدیویی local داخل صفحه،
- استفاده از timing map برای شناخت segmentهای داستان،
- نمایش overlay انتخاب‌ها در لحظه درست،
- seek به segment بعدی بعد از تصمیم،
- پشتیبانی از shortcutهای keyboard، fullscreen playback، و subtitle.

backend یا account system وجود ندارد. سختی کار در هماهنگی است: زمان، ورودی، subtitle، رفتار fullscreen، codecهای مرورگر، و graph داستان باید با هم سازگار بمانند.

## چه چیزی یاد گرفتم

درس ماندگار این بود که interactivity همیشه به platform بزرگ نیاز ندارد. گاهی به مدل دقیق state نیاز دارد.

این پروژه browser media را هم برای من ملموس‌تر کرد. codec، دسترسی به local file، timing subtitle، و UX fullscreen جزئیات جانبی نیستند. در چنین ابزاری، خود سطح محصول‌اند.

## وضعیت فعلی

آرشیو پایدار. پروژه هنوز به‌عنوان یک ثبت کوچک از فکر کردن به interactive video مفید است، اما باید آن را تجربه‌ای تاریخی دانست، نه محصول media فعال.

## قدم‌های بعدی

- [ ] نگه داشتن طراحی timing map در یک lab note جدا.
- [ ] اضافه کردن screenshot از choice overlay و flow فایل local.
- [ ] نوشتن اینکه APIهای media مرورگر از زمان انتشار پروژه چه تغییری کرده‌اند.
- [ ] تصمیم درباره اینکه پروژه آرشیو بماند یا یک maintenance pass کوچک بگیرد.
