---
title: نِکونیموس؛ از یک رله پیام ناشناس تا معماری نسخه اول
description: یادداشت آزمایشگاهی درباره مسیر نِکونیموس؛ یک رله پیام ناشناس فارسی‌محور برای Telegram که از MVP ساده مبتنی بر Cloudflare Workers، KV و Durable Objects به سمت معماری نسخه اول با دیتابیس ساخت‌یافته، مدیریت تیکت، صف ارسال و لایه matching حرکت می‌کند.
thumbnail: /content/nekonymous-cover.webp
date: 2024-08-19
updated: 2026-06-16
status: پروژه آزمایشگاهی
featured: true
tags:
  - cloudflare-workers
  - privacy
  - telegram
  - durable-objects
  - encryption
  - edge-architecture
  - product-ethics
  - ai-matching
---

نِکونیموس از یک ایده کوچک شروع شد: ساختن یک bot پیام ناشناس برای Telegram، بدون ساختن یک پیام‌رسان کامل.

کاربر bot را start می‌کند، یک لینک شخصی می‌گیرد و آن را هر جایی که می‌خواهد منتشر می‌کند. کسی که لینک را باز می‌کند می‌تواند بدون دیدن username تلگرام صاحب لینک، برای او پیام بفرستد. صاحب لینک پیام‌ها را از `/inbox` می‌خواند، از داخل همان bot پاسخ می‌دهد، اگر لازم شد فرستنده را block می‌کند، دریافت پیام‌های جدید را pause می‌کند، و برای فرستنده‌های تکراری nickname خصوصی می‌گذارد.

این شکل قابل دیدن محصول است.

اما بخش آزمایشگاهی پروژه جای دیگری است: نِکونیموس می‌پرسد یک anonymous relay تا کجا می‌تواند کوچک بماند، abuse control داشته باشد، داده حساس را بی‌دلیل نگه ندارد، و هم‌زمان درباره محدودیت‌های privacy صادق باشد.

لینک‌های پروژه:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
- [nekonymous.alizemani.ir](https://nekonymous.alizemani.ir/)

## سؤال اصلی

سؤال اصلی نِکونیموس این نبود که چطور یک Telegram bot بسازم.

سؤال دقیق‌تر این بود:

> آیا می‌شود یک hosted anonymous relay ساخت که نشت هویت قابل مشاهده برای کاربر را کم کند، بدنه پیام را در storage به شکل plaintext نگه ندارد، و همچنان آن‌قدر ساده بماند که بتوان عملیاتی، قابل توضیح و قابل نگه‌داری نگهش داشت؟

این تفاوت مهم است.

یک bot ناشناس می‌تواند خیلی سریع تبدیل شود به مجموعه‌ای از promiseهای مبهم درباره privacy. من نمی‌خواستم نِکونیموس این کار را بکند. اگر Telegram پیام اولیه را می‌بیند، اگر Worker هنگام پردازش plaintext را می‌بیند، اگر runtime secretها بخشی از trust boundary هستند، محصول باید همین را توضیح بدهد.

پس هدف امنیتی پروژه از اول کوچک‌تر و صادقانه‌تر بود:

> کم کردن plaintext ذخیره‌شده و کاهش نشت هویت قابل مشاهده برای کاربر، بدون کند کردن relay و بدون پیچیده کردن عملیات.

این هنوز هم هسته پروژه است.

## وضعیت فعلی

نسخه فعلی نِکونیموس یک MVP کارا و کوچک است.

معماری فعلی عمداً کم‌کامپوننت است:

```txt
Telegram
  -> POST /bot روی یک Cloudflare Worker
  -> Grammy handlers
  -> KV برای profile، link map، stats و encrypted blobs
  -> SQLite-backed Durable Object inbox برای هر گیرنده
  -> خواندن پیام‌ها با /inbox
```

Worker تنها ورودی HTTP است. webhook تلگرام را می‌گیرد، فرمان‌های `/start` و `/inbox` و callbackهای inline را route می‌کند، و crypto/routing اصلی را انجام می‌دهد.

KV در نسخه فعلی چند نقش دارد: profile کاربر، mapping لینک عمومی به owner، stateهای ساده مثل pause/block/nickname/draft، آمار تقریبی، و ciphertextهای message/conversation. inbox هر گیرنده داخل یک Durable Object مبتنی بر SQLite نگه‌داری می‌شود تا ordering و bounded queue قابل کنترل باشد.

این معماری برای MVP درست بود، چون پروژه هنوز باید جواب می‌داد:

- آیا جریان لینک ناشناس قابل فهم است؟
- آیا کاربرها با `/inbox` و reply کنار می‌آیند؟
- آیا block، pause و nickname کافی هستند؟
- آیا privacy copy می‌تواند honest بماند؟
- آیا می‌شود پیام را بعد از delivery از storage حذف کرد؟

تا اینجا جواب مثبت است. اما همین MVP حالا به مرز طبیعی خودش رسیده است.

## چرا معماری فعلی باید تغییر کند؟

مشکل اصلی معماری فعلی این نیست که KV یا Durable Objects بد انتخاب شده‌اند. مشکل این است که بعضی stateها در طول زمان از جای درست خودشان بزرگ‌تر شده‌اند.

در نسخه فعلی، KV هم برای routing استفاده می‌شود، هم برای profile، هم برای برخی stateهای mutable، هم برای encrypted conversation blob. این برای شروع قابل قبول بود، اما برای نسخه اول جدی‌تر مناسب نیست.

چند دلیل:

1. **KV برای read-heavy lookup خوب است، نه hot mutable state.**
   link mapping و config در KV خوب می‌نشینند؛ اما draft، block list، callback refs، rate limit و inbox state نیاز به coordination محلی دارند.

2. **ticketing باید یک authority مشخص داشته باشد.**
   وقتی یک پیام هم در KV به شکل blob ذخیره می‌شود و هم در DO به شکل inbox row، ذهن مدل سخت‌تر می‌شود. بهتر است ticket/message authority داخل یک جا باشد.

3. **ارسال خروجی به Telegram باید از مسیر request جدا شود.**
   notificationها و پیام‌های غیرضروری نباید در hot path انجام شوند. Telegram خودش rate limit دارد و خروجی bot باید idempotent و قابل retry باشد.

4. **نسخه بعدی قرار است profile و matching داشته باشد.**
   سیستم personality/matching به دیتابیس relational، consent، profile versioning و storage قابل query نیاز دارد. KV برای این مدل مناسب نیست.

پس نسخه اول واقعی باید از «MVP storage» به «storage ownership روشن» برسد.

## مسیر نسخه اول

نسخه اول نِکونیموس قرار نیست سیستم را بیهوده پیچیده کند. هر کامپوننت باید دلیل داشته باشد.

معماری هدف:

```txt
Telegram
  -> Bot Worker
  -> UserStateDO:{userId}
  -> D1 Core
  -> KV Routing Cache
  -> Telegram Outbox Queue
  -> TelegramOutboxDO
  -> Telegram API
```

در این مدل:

- Worker فقط webhook را validate و route می‌کند.
- `UserStateDO` مالک state داغ هر کاربر است.
- D1 source of truth برای identity، linkها، reports، consents، profile و match records است.
- KV فقط cache/routing است.
- Queue خروجی‌های Telegram را از request جدا می‌کند.
- `TelegramOutboxDO` ارسال‌ها را idempotent و rate-limited نگه می‌دارد.

این همان جایی است که Cloudflare primitives واقعاً معنی پیدا می‌کنند: Durable Objects برای coordinated state، D1 برای داده relational، KV برای lookupهای سریع، و Queues برای جدا کردن کارهای async از مسیر request.

## هسته جدید ticketing

در نسخه اول، هر پیام ناشناس یک ticket است.

اما ticket خود پیام نیست. ticket یک reference عملیاتی است که به گیرنده اجازه می‌دهد روی همان ارتباط action انجام بدهد: reply، block، report یا nickname.

مدل جدید:

```txt
UserStateDO:{recipientUserId}
  -> inbox_tickets
       ref
       ticket_id
       sender_user_id
       recipient_user_id
       conversation_id
       payload_ciphertext
       connection_ciphertext
       status
       delivered_at
       replied_at
       reported_at
       blocked_at
       expires_at
```

دو شناسه مهم وجود دارد:

| شناسه | نقش |
| --- | --- |
| `ticket_id` | شناسه داخلی، random و طولانی؛ برای crypto context و tracking |
| `ref` | شناسه کوتاه callback؛ فقط داخل inbox همان گیرنده معنی دارد |

`callback_data` در Telegram کوتاه می‌ماند:

```txt
r:{ref}   reply
b:{ref}   block
rp:{ref}  report
n:{ref}   nickname
```

هیچ metadata حساسی داخل callback قرار نمی‌گیرد. وقتی کاربر روی دکمه‌ای می‌زند، Worker فقط ref را می‌گیرد و آن را داخل `UserStateDO` همان کاربر resolve می‌کند. اگر ref به آن کاربر تعلق نداشته باشد، action رد می‌شود.

این مدل ساده‌تر و امن‌تر از نگه داشتن callback state در KV است.

## مالکیت داده‌ها

در نسخه اول، هر نوع داده باید فقط یک owner اصلی داشته باشد.

| داده | owner اصلی | دلیل |
| --- | --- | --- |
| telegram user hash | D1 + KV cache | lookup سریع و identity پایدار |
| encrypted chat id | D1 | برای ارسال پیام و audit داخلی |
| public link | D1 + KV cache | لینک باید قابل query و قابل cache باشد |
| draft فعال | UserStateDO | state mutable و per-user |
| pause/block | UserStateDO | hot path در زمان دریافت پیام |
| inbox tickets | UserStateDO | ordering، bounded queue و callback ownership |
| contact labels | UserStateDO | private و per-recipient |
| conversation summary | D1 | فقط index و آمار سبک، نه متن پیام |
| report | D1 | audit و moderation |
| bot copy/config | KV یا فایل local | read-heavy |
| outbound notification | Queue + OutboxDO | retry، idempotency و rate-limit |

قاعده اصلی:

```txt
KV برای routing/cache.
D1 برای source of truth قابل query.
Durable Object برای state داغ و coordinated.
Queue برای کارهایی که نباید request را نگه دارند.
```

## معماری رمزنگاری

نِکونیموس همچنان نباید ادعای end-to-end encryption کند.

این یک hosted relay روی Telegram است. Telegram پیام اولیه را می‌بیند. Worker هنگام پردازش message body را می‌بیند. اپراتور runtime و secretها بخشی از مدل اعتماد است.

پس هدف crypto این نیست که operator را از مدل اعتماد حذف کند. هدف این است که:

- متن پیام به صورت plaintext در storage نماند.
- اگر storage خام leak شد، message body بدون key قابل خواندن نباشد.
- بعد از delivery، payload حذف شود.
- فقط metadata لازم برای ادامه actionها باقی بماند.
- ciphertext به context همان ticket و recipient وابسته باشد.

مدل پیشنهادی:

```txt
APP_MASTER_KEY
  -> HKDF-SHA-256(ticket_id, purpose)
  -> AES-256-GCM key

payload_ciphertext:
  متن پیام، موقت، حذف بعد از delivery

connection_ciphertext:
  metadata لازم برای reply/block/report/nickname، encrypted و TTLدار
```

برای هر encryption، IV تصادفی ۹۶ بیتی استفاده می‌شود. ciphertext envelope باید `version` و `key_id` داشته باشد تا بعداً key rotation ممکن باشد. همچنین AAD باید contextهایی مثل purpose، ticket id، sender، recipient و schema version را bind کند تا ciphertext بین contextها قابل جابه‌جایی نباشد.

نمونه مفهومی envelope:

```txt
v1.k1.iv.ciphertext
```

این معماری پیچیده نیست، اما چند اشتباه مهم را حذف می‌کند: key reuse بی‌دلیل، context-free ciphertext، callback metadata داخل button، و storage طولانی‌مدت payload.

## چرخه پیام در نسخه اول

### 1. شروع کاربر

```txt
/start
  -> resolve Telegram user
  -> hash Telegram id با HMAC pepper
  -> lookup در KV
  -> fallback به D1
  -> اگر کاربر جدید است:
       create D1 user
       create public link
       initialize UserStateDO
       cache KV mappings
  -> اگر زبان انتخاب نشده:
       show language picker
  -> اگر onboarding کامل است:
       show personal link
```

در نسخه چندزبانه، زبان کاربر در D1 و UserStateDO ذخیره می‌شود. Telegram `language_code` فقط برای پیشنهاد اولیه استفاده می‌شود، نه تصمیم قطعی.

### 2. باز کردن لینک ناشناس

```txt
/start {slug}
  -> resolve link از KV
  -> fallback D1
  -> reject self-message
  -> recipient UserStateDO.checkCanReceive(sender)
  -> sender UserStateDO.setDraft(toUserId)
  -> ask sender to write message
```

در این مرحله هنوز ticket ساخته نمی‌شود. ticket فقط وقتی ساخته می‌شود که متن واقعی پیام برسد.

### 3. ارسال پیام

```txt
sender sends text
  -> load draft from sender UserStateDO
  -> rate-limit sender
  -> check recipient pause/block/inbox cap
  -> create ticket_id and ref
  -> encrypt payload
  -> encrypt connection metadata
  -> insert inbox_ticket in recipient UserStateDO
  -> clear sender draft
  -> upsert D1 conversation summary
  -> enqueue recipient notification
```

پیام جدید دیگر در KV conversation ذخیره نمی‌شود. authority همان row داخل inbox گیرنده است.

### 4. خواندن inbox

```txt
/inbox
  -> list pending tickets from recipient UserStateDO
  -> decrypt payloads
  -> render bot envelope in recipient locale
  -> send messages with action buttons
  -> mark delivered
  -> payload_ciphertext = NULL
  -> keep connection_ciphertext until TTL
```

پیام کاربر ترجمه نمی‌شود. فقط envelope ربات با زبان گیرنده render می‌شود.

### 5. action روی ticket

برای reply، block، report و nickname:

```txt
callback {action}:{ref}
  -> resolve current user
  -> UserStateDO.getTicket(ref)
  -> verify ownership
  -> decrypt connection metadata
  -> run action
```

callback فقط چون از Telegram آمده قابل اعتماد نیست. مالکیت ticket همیشه باید داخل UserStateDO همان کاربر verify شود.

## Queue و Outbox

تنها queue لازم برای هسته نسخه اول:

```txt
telegram-outbox
```

همه notificationهای غیرضروری از این مسیر عبور می‌کنند:

```txt
Worker
  -> telegram-outbox queue
  -> TelegramOutboxDO
  -> Telegram API
```

`TelegramOutboxDO` سه کار انجام می‌دهد:

1. جلوگیری از duplicate send با `idempotency_key`.
2. rate-limit سراسری و per-chat.
3. retry و handling خطاهای Telegram مثل `retry_after`.

این کامپوننت لازم است چون output به Telegram bottleneck واقعی bot است. Worker می‌تواند سریع پیام‌ها را ingest کند، اما ارسال خروجی باید آرام، قابل کنترل و idempotent باشد.

## چندزبانه شدن

نسخه اول باید از ابتدا locale-aware باشد.

مدل ساده:

```txt
first /start
  -> language picker
  -> save locale
  -> all bot UI uses user locale
```

قانون مهم:

```txt
متن تولیدشده توسط کاربر ترجمه نمی‌شود.
متن و دکمه‌های ربات با locale گیرنده نمایش داده می‌شوند.
```

مثلاً اگر فرستنده فارسی بنویسد و گیرنده انگلیسی باشد، متن پیام فارسی باقی می‌ماند، اما envelope انگلیسی است:

```txt
Anonymous message:

سلام، حالت چطوره؟

[Reply] [Block] [Report]
```

برای مرحله matching هم locale باید بخشی از profile و candidate filtering باشد. در نسخه اول، matchها بهتر است فقط بین زبان‌های مشترک انجام شوند، مگر بعداً translation mode جدا اضافه شود.

## سیستم تست و matching در قدم بعدی نسخه اول

بعد از refactor core، نِکونیموس می‌تواند یک لایه جدید اضافه کند: anonymous personality-based matching.

این بخش قرار نیست تشخیص روان‌شناختی یا therapy باشد. هدف آن پیشنهاد گفت‌وگوهای ناشناس معنادارتر است.

مدل پیشنهادی:

```txt
60-question compatibility test
  -> trait scores
  -> communication style
  -> values/interests
  -> boundaries
  -> consent
  -> D1 profile record
  -> optional semantic embedding
  -> match suggestions
```

برای هسته سنجش، مسیر مناسب‌تر **HEXACO-inspired** یا **IPIP-inspired Big Five/HEXACO-like** است، نه MBTI. چون ما به profile پیوسته و قابل score نیاز داریم، نه labelهای سخت و سرگرمی‌محور.

در V1، score نهایی باید deterministic باشد. AI می‌تواند summary و explanation بسازد، اما نباید تصمیم‌گیر اصلی باشد.

قاعده:

```txt
Code scores.
Safety filters decide permission.
AI explains.
Consent opens conversation.
```

## چیزهایی که عمداً وارد نمی‌شوند

برای اینکه سیستم بیهوده پیچیده نشود، نسخه اول این‌ها را ندارد:

- payment
- wallet
- Telegram Stars
- subscription
- full social network
- real-time chat room
- ConversationDO جدا
- DedupeShardDO جدا
- R2 archive
- analytics pipeline سنگین
- translation خودکار پیام‌ها
- ادعای E2EE
- dating mode رسمی

این‌ها ممکن است بعداً لازم شوند، اما الان هسته را بهتر نمی‌کنند.

## tradeoffها

چند tradeoff همچنان وجود دارد.

**Telegram بخشی از trust boundary است.**
این قابل حذف نیست، چون محصول روی Telegram ساخته شده است.

**Worker plaintext را لحظه پردازش می‌بیند.**
رمزنگاری at-rest مفید است، اما end-to-end نیست.

**connection metadata بعد از delivery باقی می‌ماند.**
برای reply، block، report و nickname لازم است. اما باید encrypted و TTLدار باشد.

**D1 conversation summary متن پیام را ندارد.**
این محدودیت آگاهانه است. برای analytics و moderation سبک کافی است، اما message history کامل نمی‌دهد.

**UserStateDO per user است، نه per conversation.**
برای نسخه اول ساده‌تر و کافی‌تر است. اگر روزی real-time chat کامل لازم شد، آن وقت ConversationDO معنی پیدا می‌کند.

## تعریف done برای نسخه اول معماری

این refactor وقتی complete است که:

- KV دیگر authority پیام یا state داغ نباشد.
- پیام‌های جدید به `UserStateDO.inbox_tickets` نوشته شوند.
- `/inbox` از UserStateDO بخواند.
- payload بعد از delivery حذف شود.
- reply/block/report/nickname فقط با ownership verification انجام شود.
- D1 users، links، reports و conversation summary را نگه دارد.
- KV فقط routing/cache باشد.
- notificationها از outbox queue عبور کنند.
- webhook secret و idempotency رعایت شود.
- locale کاربر از اولین start ذخیره شود.
- privacy copy همچنان صادقانه بماند.

## جمع‌بندی

نِکونیموس قرار نیست بزرگ‌ترین سیستم پیام‌رسانی ناشناس باشد. ارزش آن در کوچک و دقیق ماندن است.

نسخه فعلی ثابت کرد که یک anonymous relay کوچک روی Telegram می‌تواند محصولی قابل استفاده باشد. نسخه اول باید همان ایده را جدی‌تر کند: storage ownership روشن‌تر، ticketing امن‌تر، خروجی قابل کنترل‌تر، و مسیر آماده برای تست شخصیت و matching.

معماری جدید از اصول ساده‌ای پیروی می‌کند:

```txt
هر پیام یک ticket است.
هر ticket در inbox گیرنده زندگی می‌کند.
payload موقت است.
connection metadata encrypted و TTLدار است.
KV فقط cache است.
D1 فقط source of truth قابل query است.
Durable Object مالک state داغ است.
Queue فقط وقتی وارد می‌شود که request نباید منتظر بماند.
```

این برای من مسیر درست نِکونیموس است: privacy کمتر ادعا شود، معماری دقیق‌تر شود، و محصول همچنان کوچک و قابل توضیح بماند.
