---
title: سفرناک
description: یادداشت پروژه‌ای درباره سفرناک؛ forkable AI trip workspace برای planهای قابل ویرایش، کارکرد offline، و قراردادهای مشترک TypeScript.
date: 2025-10-23
updated: 2026-05-14
status: فعال
tags:
  - travel
  - offline-first
  - react-native
  - ai
  - expo
repo: https://github.com/mehotkhan/safarnak.app
website: https://safarnak.app
featured: true
---

سفرناک یک forkable AI trip workspace است.

حلقه اصلی ساده است: یک سفر بساز، ویرایشش کن، share کن، fork کن، و برای خودت personalize کن. محصول قرار نیست به یک social network کامل برای سفر تبدیل شود. بیشتر می‌خواهد برنامه‌ریزی سفر را از یک chat یا itinerary یک‌بارمصرف، به یک workspace قابل استفاده دوباره نزدیک کند.

Repository:

- [mehotkhan/safarnak.app](https://github.com/mehotkhan/safarnak.app)
- [safarnak.app](https://safarnak.app)

## چرا وجود دارد

سفرها تکه‌تکه برنامه‌ریزی می‌شوند.

یک note در یک app.  
یک pin روی map.  
یک پیام از دوست.  
یک پاسخ نصفه‌مفید AI.  
یک محدودیت budget که همه چیز را عوض می‌کند.

سفرناک وجود دارد چون این تکه‌ها باید قابل ویرایش، قابل بررسی، و قابل استفاده دوباره باشند. یک plan خوب باید از network ناپایدار، sessionهای کوتاه، و لحظه‌ای که کسی می‌گوید «می‌توانم plan تو را بردارم و برای خودم تغییر بدهم؟» جان سالم به در ببرد.

## چه چیزی را بررسی می‌کند

محصول، travel planning را مثل یک workspace بررسی می‌کند:

- خروجی AI به‌عنوان draft، نه حقیقت پنهان،
- itineraryهایی که fork و personalize می‌شوند،
- رفتار local-first برای موقعیت‌های سفر با network ضعیف،
- پشتیبانی فارسی و انگلیسی به‌عنوان constraint محصولی،
- قراردادهای مشترک بین mobile app و edge backend.

سؤال مفید این نیست که «AI می‌تواند سفر بسازد؟» این بخش demo ساده‌ای دارد. سؤال سخت‌تر این است که آیا خروجی تولیدشده می‌تواند تبدیل به planی شود که آدم بفهمد، تغییر بدهد، همراه خودش ببرد، و دوباره استفاده کند.

## چطور کار می‌کند

معماری فعلی از Expo React Native برای app، Cloudflare Workers برای backend، GraphQL Yoga برای API surface، D1 و Drizzle برای داده structured، و قراردادهای مشترک TypeScript برای هماهنگ نگه داشتن client و server استفاده می‌کند.

primitiveهای storage در Cloudflare مثل KV، R2، Vectorize، و Durable Objects فقط جایی استفاده می‌شوند که به workflow بخورند. محصول باید آن‌قدر کوچک بماند که حلقه planning همچنان قابل دیدن باشد.

تصمیم مهم این است که data فقط remote-only دیده نشود. state local cache شده باید queryable و قابل فهم باشد، نه سایه‌ای شل از API.

## چه چیزی یاد گرفتم

محصول‌های AI planning بیشتر از magic به editing نیاز دارند.

اگر خروجی قابل بررسی، تغییر، استفاده دوباره، یا اصلاح نباشد، فقط یک جواب یک‌بارمصرف دیگر است. سفرناک برای من مهم است چون plan را artifact اصلی محصول نگه می‌دارد و AI را یکی از راه‌های شکل دادن به آن می‌داند.

## وضعیت فعلی

فعال. محصول و foundation فنی هنوز در حال refinement هستند، مخصوصاً در workflow عمومی، رفتار offline، و اینکه پیش از آماده شدن اولین flow پایدار، چه مقدار از سیستم باید نمایش داده شود.

## قدم‌های بعدی

- [ ] مستند کردن boundaryهای packageهای app و server.
- [ ] اضافه کردن یادداشت کوتاه درباره GraphQL schema و shared TypeScript types.
- [ ] ثبت مدل offline cache و sync در یک lab note.
- [ ] اضافه کردن screenshot عمومی وقتی اولین flow پایدار محصول آماده شد.
