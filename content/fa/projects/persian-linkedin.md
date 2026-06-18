---
title: لینکدین فارسی
description: یادداشت پروژه‌ای درباره extension مرورگر برای خواناتر کردن فارسی در LinkedIn با RTL fix و کنترل font.
date: 2017-12-07
updated: 2018-01-03
status: آرشیو پایدار
tags:
  - browser-extension
  - persian
  - rtl
  - typography
  - linkedin
repo: https://github.com/mohetios/persian-linkedin
---

Persian LinkedIn یک extension کوچک مرورگر برای یک آزار مشخص بود: متن فارسی در LinkedIn می‌تواند از نظر فنی نمایش داده شود، اما هنوز خواندنش راحت نباشد.

extension از ایده Persian Twitter adaptation گرفت. کارش محدود بود: بهتر کردن رفتار right-to-left و دادن انتخاب font بهتر به خواننده فارسی در محصولی که برای او طراحی نشده بود.

Repository:

- [mohetios/persian-linkedin](https://github.com/mohetios/persian-linkedin)

## چرا وجود دارد

Localization معمولاً به‌عنوان ترجمه توضیح داده می‌شود، اما UX فارسی در وب اغلب یک لایه پایین‌تر خراب می‌شود.

direction غلط است.  
ریتم خط خوب نیست.  
font پیش‌فرض خواندن را سخت می‌کند.  
متن فارسی-انگلیسی بی‌نظم می‌شود.

Persian LinkedIn بیشتر یک کار ترمیمی بود. از LinkedIn نمی‌خواست به محصول Persian-first تبدیل شود. فقط سطح مرورگر را آن‌قدر تغییر می‌داد که محصول موجود برای خواننده فارسی قابل تحمل‌تر و خواناتر شود.

## چه چیزی را بررسی می‌کند

پروژه extension مرورگر را به‌عنوان ابزار کوچک محلی برای language support بررسی می‌کند.

این نوع ابزار شاید پرزرق‌وبرق نباشد، اما practical است. یک browser extension می‌تواند interface شخص ثالث را برای یک جامعه خواندن خاص patch کند، بدون اینکه منتظر priority آن platform بماند.

## چطور کار می‌کند

در سطح کلی، extension تغییرهای scoped برای RTL و typography را روی صفحه‌های LinkedIn اعمال می‌کند. بخش حساس، scope است: fixی که به متن فارسی کمک می‌کند، اگر selector یا direction rule بیش از حد وسیع باشد، می‌تواند متن mixed-language را خراب کند.

سؤال‌های فنی مفید این‌ها بودند:

- RTL behavior کجا باید اعمال شود؟
- کدام سطح‌های متنی به font control نیاز دارند؟
- متن فارسی-انگلیسی چطور خوانا بماند؟
- وقتی DOM محصول شخص ثالث تغییر می‌کند، چه چیزی می‌شکند؟

## چه چیزی یاد گرفتم

ابزارهای کوچک می‌توانند assumptionهای بزرگ محصول را آشکار کنند.

Persian LinkedIn پروژه بزرگی نیست، اما به یک درس ماندگار اشاره می‌کند: language support از layout شروع می‌شود، نه فقط از copy. Typography و direction بخشی از usability هستند.

## وضعیت فعلی

آرشیو پایدار. پروژه باید تاریخی در نظر گرفته شود، مگر اینکه دوباره با DOM فعلی LinkedIn بررسی شود.

## قدم‌های بعدی

- [ ] بررسی اینکه extension هنوز روی DOM فعلی LinkedIn کار می‌کند یا نه.
- [ ] اضافه کردن screenshot قبل/بعد از repository آرشیوی.
- [ ] مستند کردن selector strategy و چیزهایی که در طول زمان شکستند.
- [ ] وصل کردن این صفحه به lab note گسترده‌تر درباره Persian text tooling.
