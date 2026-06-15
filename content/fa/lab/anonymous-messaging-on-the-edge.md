---
title: نِکونیموس به‌عنوان یک anonymous relay کوچک
description: یادداشت فنی و محصولی درباره نِکونیموس؛ یک رله پیام ناشناس فارسی‌محور برای Telegram با Cloudflare Workers، KV، Durable Objects مبتنی بر SQLite، و مرز حریم خصوصی صادقانه.
thumbnail: /content/nekonymous-cover.webp
date: 2024-08-19
updated: 2026-06-15
status: Refining
tags:
  - cloudflare-workers
  - privacy
  - telegram
  - durable-objects
  - encryption
  - edge-architecture
  - product-ethics
---

## سؤال اصلی

چطور می‌شود یک ابزار پیام ناشناس ساخت، بدون اینکه وانمود کنیم همه مسئله‌های privacy را حل کرده‌ایم؟

سؤال مفید پشت نِکونیموس همین بود.

نه اینکه چطور یک Telegram bot بسازم.

نه اینکه چطور قوی‌ترین ادعای امنیتی ممکن را بنویسم.

نه اینکه چطور یک پلتفرم کامل پیام‌رسانی بسازم.

سؤال دقیق‌تر کوچک‌تر است: آیا می‌شود یک hosted relay ساخت که نشت هویت قابل مشاهده برای کاربر را کم کند، بدنه پیام را در storage به شکل plaintext نگه ندارد، و همچنان آن‌قدر ساده بماند که بتوان عملیاتی و قابل توضیح نگهش داشت؟

نِکونیموس جواب فعلی من به همین سؤال است.

منابع مرتبط:

- [صفحه پروژه نِکونیموس](/fa/projects/nekonymous)
- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)

## زمینه

پیام ناشناس شکل محصولی آشنایی دارد.

یک نفر لینک می‌گیرد. یک نفر دیگر لینک را باز می‌کند. پیام می‌رسد، بدون اینکه نام قابل مشاهده‌ای نشان داده شود.

این شکل برای کاربر Telegram خیلی کم‌اصطکاک است. لازم نیست app جدید نصب شود. لازم نیست فرم جدا ساخته شود. کاربر start می‌کند، متن یا media می‌فرستد، و از همان سطح آشنا جواب می‌گیرد.

اما پیام ناشناس همیشه دو لبه دارد.

فاصله می‌تواند کمک کند کسی حرفی را راحت‌تر بزند. همان فاصله می‌تواند سوءاستفاده را هم آسان‌تر کند. پس سیستم به کنترل گیرنده، block، pause، rate limit، و توضیح دقیق privacy نیاز دارد.

قسمت آخر برای من مهم‌ترین بخش است.

اگر UI بگوید «ناشناس»، اما معماری به Telegram، operator، secretهای runtime، و metadata مسیریابی وابسته باشد، محصول باید همین مرز را توضیح بدهد. اگر توضیح ندهد، کاربر مدل ذهنی اشتباه می‌گیرد.

## مرز محصول

نِکونیموس فقط یک bot نیست.

bot رابط است. محصول، relay است.

هر کاربر یک deep link شخصی Telegram می‌گیرد. فرستنده لینک را باز می‌کند و پیام می‌نویسد. گیرنده پیام‌های pending را با `/inbox` می‌خواند. گیرنده می‌تواند از داخل bot پاسخ بدهد، فرستنده را block یا unblock کند، دریافت پیام‌های جدید لینک‌محور را pause کند، و برای فرستنده‌های تکراری nickname خصوصی بگذارد.

سیستم عمداً چند چیز نیست:

شبکه اجتماعی نیست.

helpdesk نیست.

پیام‌رسان کامل encrypted نیست.

پلتفرم moderation نیست.

app پیچیده با frontend جدا نیست.

این مرز محصول را صادق‌تر می‌کند. همین مرز باعث می‌شود سؤال‌های abuse و privacy قابل بررسی‌تر شوند، چون سطح state کوچک می‌ماند.

## مرز حریم خصوصی

نِکونیموس یک رله پیام ناشناس میزبانی‌شده است.

end-to-end encrypted نیست.

در UI خود bot، فرستنده و گیرنده username تلگرام همدیگر را نمی‌بینند. بدنه پیام قبل از ذخیره‌شدن در KV یا Durable Object storage رمزنگاری می‌شود. مهاجمِ فقط دارای دسترسی به storage، اگر KV و rowهای DO را داشته باشد اما `APP_SECURE_KEY` را نداشته باشد، نمی‌تواند بدنه پیام را decrypt کند. بعد از تحویل `/inbox`، payload از KV پاک می‌شود. فقط metadata رمزنگاری‌شده connection باقی می‌ماند تا callbackهای reply، block، و nickname همچنان کار کنند.

این مفید است.

اما محدود است.

Telegram همچنان پیام اولیه را دریافت می‌کند، چون این یک Telegram bot است. Worker هنگام پردازش پیام plaintext را می‌بیند. حساب Cloudflare یا اپراتوری که بتواند کد Worker را تغییر دهد یا به secretهای runtime برسد، می‌تواند پیام‌های آینده را به خطر بیندازد. اپراتوری که `APP_SECURE_KEY`، `ticketId` و ciphertext ذخیره‌شده را با هم داشته باشد، از نظر فنی می‌تواند conversation ذخیره‌شده را decrypt کند. بخشی از metadata هم عمداً plaintext است: user recordها، map لینک UUID، block list، paused state، nickname map خصوصی، و draft فعال.

هدف صادقانه امنیتی برای من این است:

> کم کردن plaintext ذخیره‌شده و کاهش نشت هویت قابل مشاهده برای کاربر، بدون کند کردن relay و بدون پیچیده کردن عملیات.

این جمله از وعده‌های مبهم privacy هیجان کمتری دارد. اما امن‌تر و دقیق‌تر است.

## معماری

معماری عمداً کوچک است.

```txt
Telegram
  -> POST /bot روی یک Cloudflare Worker
  -> Grammy handlers
  -> KV برای profile، link map، stats، encrypted blobs
  -> Durable Object inbox مبتنی بر SQLite برای هر گیرنده
  -> خواندن پیام با /inbox
```

Worker تنها ورودی HTTP است. صفحه‌های کوچک عمومی را serve می‌کند و webhook تلگرام را می‌گیرد. Grammy فرمان‌های `/start`، `/inbox`، settings، پیام‌های ورودی، و inline callbackها را handle می‌کند. KV برای user recordها، map کردن UUID به user، stats تقریبی، و ciphertextهای AES-GCM زیر `conversation:{conversationId}` استفاده می‌شود. inbox هر گیرنده داخل یک Durable Object جدا زندگی می‌کند که با Telegram user ID همان گیرنده address می‌شود.

در نِکونیموس SPA نداریم. D1 نداریم. Queue نداریم. Worker دوم نداریم.

این به معنی بد بودن آن ابزارها نیست. D1 و Queues در سیستم درست بسیار مفیدند. فقط اینجا هنوز لازم نیستند. اضافه کردنشان سطح عملیاتی بیشتری می‌آورد، بدون اینکه وعده اصلی relay را بهتر کند.

قاعده اصلی این است: هر نوع state باید جایی زندگی کند که نیاز consistency آن همان‌جا معنا دارد.

profile کاربر می‌تواند eventual consistency در KV را تحمل کند. ordering inbox نمی‌تواند. بدنه پیام باید هر جا rest می‌کند encrypted باشد. callback refها باید کوتاه، opaque، و محدود به inbox گیرنده باشند.

## چرا Durable Object؟

inbox همان جایی است که ordering و coordination مهم می‌شود.

KV برای این نقش مناسب نیست. eventually consistent است و inbox نباید به بازنویسی کامل recordها در شرایط race وابسته باشد.

برای همین نِکونیموس برای هر گیرنده یک Durable Object مبتنی بر SQLite دارد.

address آن در Worker به این شکل است:

```txt
INBOX_DO.idFromName(recipientTelegramId)
```

داخل آن object، یک جدول کوچک SQLite entryهای inbox را نگه می‌دارد:

| فیلد | نقش |
| --- | --- |
| `ref` | reference کوتاه callback برای reply، block، unblock، nickname |
| `ticket_id` | ticket تصادفی ۲۵۶ بیتی برای salt در HKDF |
| `conversation_id` | suffix مشتق‌شده برای KV key |
| `ciphertext` | کپی encrypted payload تا وقتی پیام pending است |
| `delivered` | وضعیت pending یا delivered |
| `created_at` | ordering و pruning |

inbox سقف ۵۰ row دارد. قبل از رد کردن پیام جدید، DO referenceهای delivered قدیمی را prune می‌کند. اگر هر ۵۰ row هنوز pending باشند، فرستنده پیام inbox-full می‌گیرد و ciphertext تازه‌نوشته‌شده از KV حذف می‌شود.

این cap فقط تصمیم storage نیست. تصمیم محصولی هم هست. سیستم ناشناس باید failure mode محدود داشته باشد.

## چرا KV؟

KV جایی استفاده شده که شکلش مناسب است.

`user:{telegramId}` profile کاربر، display name، UUID شخصی، block list، pause state، nickname map خصوصی، و draft فعال را نگه می‌دارد. `userUUIDtoId:{uuid}` public link token را به Telegram ID صاحب لینک map می‌کند. `conversation:{conversationId}` ciphertext AES-GCM را به شکل text opaque نگه می‌دارد، نه JSON. stats هم به شکل daily و running counter ذخیره می‌شوند و تقریبی‌اند.

تقریبی بودن stats عمدی است. counterهای read-modify-write روی KV زیر concurrency می‌توانند increment از دست بدهند. برای عدد عمومی روی homepage قابل قبول است. برای billing، audit، یا analytics دقیق قابل قبول نیست.

نقشه ساده این است:

```txt
KV: lookup recordهای ساده و encrypted blobs
DO: ordering inbox هر گیرنده
Worker: validation، crypto، routing تلگرام
```

برای محصول فعلی همین کافی است.

## چرخه پیام

چرخه پیام کوتاه است، اما هر قدم دلیل دارد.

1. کاربر `/start` می‌زند و یک لینک Telegram شخصی می‌گیرد.
2. فرستنده `/start {uuid}` همان لینک را باز می‌کند.
3. سیستم شکل لینک را validate می‌کند، owner را پیدا می‌کند، self-message را رد می‌کند، block status و paused state را چک می‌کند.
4. فرستنده پیام را compose می‌کند.
5. قبل از پذیرش پیام، server-side checks دوباره اجرا می‌شوند.
6. payloadهای پشتیبانی‌نشده قبل از encryption رد می‌شوند.
7. conversation object با connection metadata و payload ساخته می‌شود.
8. برای پیام پذیرفته‌شده یک `ticketId` تصادفی ۲۵۶ بیتی ساخته می‌شود.
9. HKDF از `APP_SECURE_KEY` و ticket، AES key و `conversationId` را مشتق می‌کند.
10. AES-GCM با IV تصادفی ۱۲ بایتی conversation JSON را encrypt می‌کند.
11. ciphertext در KV ذخیره و در Durable Object inbox گیرنده کپی می‌شود.
12. گیرنده pending count می‌بیند و بعداً `/inbox` را اجرا می‌کند.
13. rowهای pending در DO decrypt و از طریق Telegram تحویل داده می‌شوند.
14. فرستنده یک اعلان best-effort برای seen دریافت می‌کند.
15. KV با همان connection metadata اما payload خالی دوباره encrypt می‌شود.
16. row در DO به delivered تغییر می‌کند و ciphertext آن `NULL` می‌شود.
17. callbackهای reply، block، unblock، و nickname با `ref`، `ticketId` و `conversationId` ادامه پیدا می‌کنند.

جزئیات مهم قدم ۱۵ است.

بعد از delivery، سیستم هنوز به metadata مسیریابی نیاز دارد. به بدنه پیام در storage نیاز ندارد. جدا کردن payload از connection metadata باعث می‌شود relay مفید بماند، بدون اینکه بیش از حد لازم محتوای حساس نگه دارد.

## تصمیم‌های امنیتی

طراحی crypto ticket-based است.

برای هر پیام پذیرفته‌شده، با `crypto.getRandomValues(32)` یک ticket تازه ساخته می‌شود. ticket خودش password نیست. به‌عنوان salt در HKDF استفاده می‌شود و `APP_SECURE_KEY` input key material است.

labelهای HKDF مقدارهای مشتق‌شده را جدا می‌کنند:

| مقدار مشتق‌شده | label |
| --- | --- |
| AES key | `nekonymous:aes:v1` |
| Conversation ID | `nekonymous:conversation:v1` |
| Sender alias | `nekonymous:label:v1:{senderId}` |

AES-GCM برای هر encryption یک IV تصادفی ۱۲ بایتی دارد. فرمت ciphertext این است:

```txt
{iv_base64url}.{ciphertext_base64url}
```

`APP_SECURE_KEY` در production باید حداقل ۳۲ بایت entropy داشته باشد. پیاده‌سازی از Web Crypto API استفاده می‌کند، نه Node `crypto`؛ برای همین با Cloudflare Workers سازگار می‌ماند.

authorization callback هم بخشی از مدل امنیتی است. وقتی کاربر روی reply، block، unblock، یا nickname می‌زند، handler آن `ref` کوتاه را در DO inbox همان کاربر resolve می‌کند، conversation رمز‌شده را از KV می‌خواند، با ticket ذخیره‌شده decrypt می‌کند، و بررسی می‌کند `conversation.connection.to` با Telegram user فعلی یکی باشد.

callback فقط چون روی یک button آمده قابل اعتماد نیست.

## tradeoffها

چند tradeoff عمداً پذیرفته شده‌اند.

آپدیت profileها در KV از نوع read-modify-write و eventually consistent است. برای این bot کوچک قابل قبول است. اگر editهای settings و block زیر concurrency زیاد شدند، authority قوی‌تری لازم می‌شود.

stats تقریبی‌اند. counter عمومی محصول‌اند، نه accounting دقیق.

metadata رمزنگاری‌شده connection بعد از delivery باقی می‌ماند تا callbackها کار کنند. حذف آن یعنی باید index جدا برای reply، block، و nickname طراحی شود.

referenceهای delivered قدیمی ممکن است با pruning سقف ۵۰ row از بین بروند. این قابل قبول است، چون inbox باید bounded بماند.

Telegram بخشی از trust boundary است. داخل یک Telegram bot نمی‌شود این را حذف کرد.

اعتماد به اپراتور هم بخشی از مدل است. این را نمی‌شود صادقانه با copy پنهان کرد.

## قدم‌های بعدی

بهبودهای بعدی عملی‌اند، نه نمایش معماری.

- bot username همه‌جا کاملاً config-driven شود.
- social metadata صفحه‌های عمومی production-ready شود.
- abuse control بهتر اضافه شود، بدون جمع کردن identity غیرضروری.
- self-hosting notes برای `APP_SECURE_KEY`، webhook تلگرام، KV، و Durable Object migrations نوشته شود.
- observability بهتر شود، بدون log کردن message body، ticket ID، Telegram token، یا runtime secret.
- فقط اگر usage رشد کرد، D1 یا مدل داده قوی‌تر مبتنی بر DO بررسی شود.

سیستم باید پیچیدگی را به دست بیاورد، نه اینکه از اول با آن شروع کند.

## جمع‌بندی

ابزار ناشناس باید با مرزهای روشن طراحی شود، نه با وعده‌های مبهم.

برای نِکونیموس، privacy model بخشی از محصول است. معماری کوچک است چون ادعا کوچک و دقیق است. storage bounded است چون ریسک واقعی است. copy باید بگوید سیستم چه چیزی را محافظت می‌کند و چه چیزی را محافظت نمی‌کند.

درسی که می‌خواهم از این پروژه نگه دارم همین است.
