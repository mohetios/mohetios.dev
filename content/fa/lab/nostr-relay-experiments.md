---

title: تجربه‌های Nostr Relay  
description: یادداشت‌هایی درباره کار خصوصی روی TypeScript relay، تجربه Cloudflare relay، و خواندن یک پیاده‌سازی Erlang از Nostr به‌عنوان مرجع پروتکل.  
date: 2024-03-18  
updated: 2026-06-12  
status: Private review  
tags:
- nostr
- cloudflare-workers
- decentralized-protocols
- typescript
- websocket
- protocol-design

---

Repositoryهای مربوط به Nostr بیشتر از اینکه محصول تمام‌شده باشند، یک مطالعه پروتکل‌اند.

بهتر است دقیقاً همین‌طور دیده شوند.

Relay از بیرون کوچک به نظر می‌رسد. اتصال‌ها را می‌پذیرد، eventها را دریافت می‌کند، به subscriptionها جواب می‌دهد، مقداری داده را ذخیره می‌کند، بعضی پیام‌ها را forward می‌کند، و چیزهایی را که نباید بپذیرد رد می‌کند.

اما سطح‌های کوچک پروتکل می‌توانند تصمیم‌های معماری بزرگی را پنهان کنند.

Relay شبکه اجتماعی نیست.  
application server کامل نیست.  
مالک هویت کاربر نیست.  
تنها منبع حقیقت نیست.

و با این حال، قدرت دارد.

تصمیم می‌گیرد چه چیزی را ذخیره کند.  
تصمیم می‌گیرد چه چیزی را forward کند.  
تصمیم می‌گیرد کدام clientها rate-limit شوند.  
تصمیم می‌گیرد چه چیزی blocked، accepted یا ignored باشد.  
تصمیم می‌گیرد چقدر درباره محدودیت‌های خودش صادق باشد.

برای همین پیاده‌سازی relay تمرین معماری خوبی است.

Repositoryهای مرتبط:

- private `mehotkhan/nostr-relay`
    
- private `mehotkhan/cloudflare-nostr-relay`
    
- [mehotkhan/nostr](https://github.com/mehotkhan/nostr)، فورکی از یک پیاده‌سازی Erlang
    

## چرا Relayها جالب‌اند

Nostr جالب است، چون هویت را از سرور جدا می‌کند.

کاربرها eventهای امضاشده منتشر می‌کنند. clientها می‌توانند با چند relay حرف بزنند. relayها می‌توانند eventها را ذخیره کنند، رد کنند، forward کنند یا سرو کنند، بدون اینکه تبدیل به account provider مرکزی شوند.

این سؤال معماری را عوض می‌کند.

در یک اپلیکیشن معمولی، backend بیشتر حقیقت محصول را مالک است. accountها، sessionها، postها، permissionها و معمولاً social graph آنجاست.

در Nostr، relay محدودتر و قابل‌جایگزین‌تر است.

اما محدود بودن به معنی ساده بودن نیست.

Relay هنوز باید آن‌قدر از پروتکل را بفهمد که درست رفتار کند:

- پیام‌های client را روی WebSocket دریافت کند
    
- شکل event را validate کند
    
- در صورت نیاز event ID و signature را verify کند
    
- subscription filterها را پردازش کند
    
- eventهای ذخیره‌شده را برگرداند
    
- eventهای جدید matching را forward کند
    
- subscriptionهای نامعتبر را close یا reject کند
    
- writeها را با پیام acceptance یا rejection مفید جواب بدهد
    
- relay metadata منتشر کند
    
- rate limit و storage policy اعمال کند
    
- خودش را از spam و queryهای گران محافظت کند
    

معماری از این جهت جالب می‌شود که relay بین دو نیروی مخالف قرار دارد.

باید آن‌قدر ساده بماند که interoperable باشد.

باید آن‌قدر هوشمند باشد که زیر traffic عمومی زنده بماند.

## Relay به‌عنوان مرز

Relay یک مرز است.

یک طرف، clientها هستند. می‌خواهند publish کنند، subscribe کنند، search کنند، history بگیرند، و eventهای جدید را real-time دریافت کنند.

یک طرف دیگر، storage است. می‌تواند SQLite، Postgres، KV، D1، object storage، in-memory index یا چیز دیگری باشد.

یک طرف دیگر، policy است. relay ممکن است همه‌چیز را اجازه بدهد، authentication بخواهد، فقط بعضی event kindها را قبول کند، payloadهای بزرگ را رد کند، eventهای قدیمی را نپذیرد، proof of work بخواهد، write را محدود کند، یا فقط برای یک community خصوصی کار کند.

یک طرف دیگر، شبکه بزرگ‌تر Nostr است. clientها و relayهای دیگر ممکن است رفتاری را انتظار داشته باشند که در کد یک اپلیکیشن خاص نوشته نشده، اما از convention پروتکل آمده است.

خود پروژه همین مرز است.

پیاده‌سازی relay فقط parser نیست. مجموعه‌ای از تصمیم‌های محصولی و زیرساختی حول یک پروتکل است.

## State سؤال سخت است

وسوسه اولین پیاده‌سازی این است که بپرسیم:

چطور event بگیرم و برای subscriberها بفرستم؟

این مسیر خوشحال و ساده است.

سؤال سخت‌تر این است:

Relay چه stateای باید نگه دارد؟

یک relay می‌تواند انواع مختلفی از state داشته باشد:

- اتصال‌های WebSocket فعال
    
- subscription IDها برای هر connection
    
- filterها برای هر subscription
    
- event storage
    
- author indexها
    
- kind indexها
    
- tag indexها
    
- rate limit بر اساس IP
    
- rate limit بر اساس pubkey
    
- auth challengeها
    
- pubkeyهای authenticateشده
    
- pubkeyهای blocked
    
- تصمیم‌های moderation
    
- تنظیمات relay
    
- NIPهای پشتیبانی‌شده
    
- retention policy
    
- event IDهای duplicate اخیر
    
- backpressure و queue state
    

هرکدام lifecycle متفاوتی دارند.

connection state موقت است.  
subscription state متعلق به یک WebSocket است.  
event state ممکن است durable باشد.  
auth challenge state شاید فقط برای یک connection زنده باشد.  
rate-limit state معمولاً زود expire می‌شود.  
moderation state ممکن است durable باشد.  
relay metadata باید public و stable باشد.  
indexها باید بر اساس هزینه query طراحی شوند.

اشتباه اصلی این است که همه stateها را داخل یک مدل storage تخت بریزیم.

Relay وقتی قابل فهم‌تر می‌شود که هر دسته state مالک و عمر مشخص داشته باشد.

## Subscriptionها Query معمولی نیستند

یک subscription در Nostr فقط database query نیست.

در شروع شبیه query است، چون relay eventهای ذخیره‌شده مطابق filter را برمی‌گرداند. اما بعد از آن تبدیل به live stream می‌شود. eventهای جدیدی که accepted می‌شوند و با آن subscription match دارند، باید تا وقتی subscription بسته، جایگزین یا connection قطع شود، روی همان connection ارسال شوند.

پس subscription یک چیز hybrid است.

بخشی query است.  
بخشی stream است.  
بخشی routing rule است.  
بخشی connection-local state است.

این شکل با APIهای request-response معمولی خیلی فرق دارد.

یک endpoint REST می‌تواند یک request را پردازش کند و تمام شود. اما connection یک relay context نگه می‌دارد. subscription دارد، filter دارد، backpressure دارد، شاید auth state دارد، شاید rate limit دارد، و شاید رفتار مخصوص client دارد.

برای همین relay model تمرین خوبی برای WebSocket است.

پیاده‌سازی فقط قبول کردن WebSocket نیست. مدیریت state زنده پروتکل برای هر connection است.

## Validation تصمیم محصولی است

Relay می‌تواند در عمق‌های مختلف validate کند.

حداقل باید پیام‌های malformed را که قابل پردازش نیستند رد کند.

اما relay عمومی به چیزی بیشتر از shape validation نیاز دارد.

به policy validation نیاز دارد.

مثلاً:

- آیا event JSON معتبر است؟
    
- آیا event ID درست است؟
    
- آیا signature معتبر است؟
    
- آیا event بیش از حد بزرگ است؟
    
- آیا `created_at` قابل قبول است؟
    
- آیا این event kind مجاز است؟
    
- آیا این pubkey blocked است؟
    
- آیا وقتی authentication لازم است، client authenticate شده؟
    
- آیا write rate-limited شده؟
    
- آیا query بیش از حد broad یا گران است؟
    
- آیا relay باید event را ذخیره کند، فقط forward کند، یا رد کند؟
    

اینجاست که «پیاده‌سازی پروتکل» تبدیل به «عملیات relay» می‌شود.

یک toy relay ممکن است happy-path testها را پاس کند و همچنان زیر traffic عمومی خطرناک باشد.

یک relay مسئولانه به دلیل‌های rejection روشن، prefixهای machine-readable در جای درست، و limitهایی نیاز دارد که clientها بتوانند بفهمند.

## Relay Information بخشی از قرارداد است

Relay باید بتواند خودش را توضیح بدهد.

این تزئین نیست.

metadata relay به clientها می‌گوید relay ادعا می‌کند چه چیزی را پشتیبانی می‌کند، چه کسی آن را اداره می‌کند، چه نرم‌افزاری اجرا می‌کند، چه محدودیت‌هایی دارد، و کدام NIPها را می‌فهمد.

این مهم است چون Nostr یک سرور و یک client نیست.

شبکه‌ای از پیاده‌سازی‌های ناقص و متفاوت است.

Clientها باید adapt شوند. Relayها باید صادق باشند. Operatorها باید limitها را قبل از اینکه کاربرها از طریق failure کشف‌شان کنند منتشر کنند.

یک relay information document خوب می‌تواند به این سؤال‌ها جواب بدهد:

- این relay برای چیست؟
    
- public است یا private؟
    
- authentication لازم دارد؟
    
- چه event kindهایی را قبول می‌کند؟
    
- rate limitها چیست؟
    
- storage limitها چیست؟
    
- چه NIPهایی پشتیبانی می‌شود؟
    
- چه کسی آن را اداره می‌کند؟
    
- retention policy چیست؟
    
- clientها چه انتظاری نباید از این relay داشته باشند؟
    

برای تجربه‌های من، این تبدیل به یک قانون طراحی می‌شود:

relayای نساز که نتواند خودش را توضیح بدهد.

## Authentication شکل سیستم را عوض می‌کند

Authentication در Nostr relayها جالب است، چون هویت از قبل در لایه event وجود دارد.

eventها با key امضا می‌شوند. پس چرا connection را authenticate کنیم؟

چون policy relay گاهی باید بداند چه کسی همین الان وصل است، نه فقط author یک event چه کسی بوده.

Relay ممکن است بخواهد writeها را محدود کند، queryهای private event را محافظت کند، subscriptionهای خاص را محدود کند، یا به یک pubkey فقط بعد از اثبات کنترل در session فعلی اجازه دسترسی بدهد.

این یک لایه دوم می‌سازد:

- event signature مالکیت یک event را ثابت می‌کند
    
- relay authentication کنترل یک key را برای این connection ثابت می‌کند
    

این دو مرتبط‌اند، اما یکی نیستند.

برای relay خصوصی، این تفاوت مهم است.

Relay خصوصی فقط بررسی نمی‌کند event معتبر است یا نه. تصمیم می‌گیرد آیا این connection طبق policy محلی اجازه read یا write دارد یا نه.

برای همین authentication شبیه NIP-42 در این مطالعه جا دارد، حتی اگر نسخه اول public implementation سیستم auth کاملی نداشته باشد.

## کنترل سوءاستفاده اختیاری نیست

Relayای که روی اینترنت عمومی قرار می‌گیرد باید سوءاستفاده را فرض کند.

نه سوءاستفاده نظری. سوءاستفاده فوری.

filterهای broad.  
payloadهای بزرگ.  
eventهای duplicate.  
flood اتصال.  
write spam.  
queryهای tag گران.  
subscriptionهای داغ.  
clientهایی که هیچ‌وقت close نمی‌کنند.  
clientهایی که limitها را رعایت نمی‌کنند.  
eventهایی که valid هستند اما unwanted.

پس relay قبل از feature به کنترل نیاز دارد.

کنترل‌های مفید:

- حداکثر اندازه message
    
- حداکثر تعداد filter
    
- حداکثر subscription برای هر connection
    
- حداکثر filter برای هر subscription
    
- حداکثر تعداد event برگشتی در initial query
    
- محدودیت اندازه event
    
- connection rate limit
    
- write rate limit
    
- query complexity limit
    
- duplicate event detection
    
- blocked pubkeyها
    
- blocked IP range در صورت نیاز
    
- storage retention ruleها
    
- allow/deny list برای event kindها
    
- backpressure handling
    
- پیام‌های clear برای close و rejection
    

این‌ها polish مدیریتی نیستند.

تفاوت بین relay experiment و relay software هستند.

## سؤال Cloudflare

تجربه Cloudflare relay جالب است چون workload یک relay دقیقاً شبیه APIهای request-response معمولی نیست.

traffic یک Nostr relay شامل connectionهای بلندمدت WebSocket، subscriptionهای per-connection، fanout، storage، indexing، rate limit و real-time delivery است.

پس سؤال طبیعی این است:

آیا یک edge-first runtime می‌تواند یک relay مسئولانه را host کند، بدون اینکه سیستم بیش از حد پیچیده شود؟

Cloudflare Workers جذاب‌اند چون سطح HTTP و WebSocket می‌تواند نزدیک کاربرها باشد، deploy ساده‌ای داشته باشد، و با edge storage و Durable Objects ترکیب شود.

Durable Objects مخصوصاً جالب‌اند، چون می‌توانند sessionهای WebSocket stateful را هماهنگ کنند. یک Durable Object می‌تواند مالک یک shard از relay state، یک room، یک pubkey partition، یک subscription coordinator یا یک write pipeline باشد. WebSocket hibernation هم مدل را واقعی‌تر می‌کند، چون runtime می‌تواند connectionها را باز نگه دارد بدون اینکه وقتی اتفاقی نمی‌افتد دائماً active duration مصرف شود.

اما edge model آدم را مجبور به نظم می‌کند.

نمی‌توانی فرض کنی in-memory state دائمی است.  
نمی‌توانی با هر connection مثل process بلندمدت روی یک سرور واحد رفتار کنی.  
باید تصمیم بگیری چه چیزی سیستم را wake می‌کند.  
باید چیزهایی را که بعد از hibernation باید بمانند persist کنی.  
باید فقط چیزهایی را index کنی که query کردن‌شان قابل پرداخت است.  
باید از fanout global که در scale گران می‌شود دوری کنی.

این باعث می‌شود Cloudflare محیط خوبی برای آزمون معماری relay باشد.

سؤال واقعی را آشکار می‌کند:

کدام بخش relay connection state است، کدام بخش durable event history است، و کدام بخش policy است؟

## TypeScript در برابر Erlang

تجربه‌های TypeScript و پیاده‌سازی Erlang از دو جهت متفاوت جالب‌اند.

TypeScript به سطح محصول نزدیک است.

با Cloudflare Workers، ابزارهای وب، JSON parsing، WebSocket handlerها، generated typeها و iteration سریع خوب می‌خواند. برای ساختن relay experiment کنار web infrastructure مناسب است.

Erlang به مدل concurrency نزدیک است.

Relay ذاتاً actor-like است: connectionهای زیاد، subscriptionهای زیاد، message passing، failure isolation، supervision و processهای بلندمدت. Erlang و OTP دقیقاً برای چنین ایده‌هایی ساخته شده‌اند.

خواندن یک پیاده‌سازی Erlang از Nostr حتی وقتی runtime هدف TypeScript باشد مفید است.

شکل concurrency را قابل دیدن می‌کند.

connectionها می‌توانند process باشند.  
subscriptionها می‌توانند supervised state باشند.  
ماژول‌های relay می‌توانند client، relay و protocol logic را جدا کنند.  
failureها می‌توانند isolate شوند.  
message flow می‌تواند مثل یک object طراحی درجه‌یک دیده شود.

درس این نیست که همه چیز را با Erlang بازنویسی کنیم.

درس این است که مدل ذهنی‌اش را قرض بگیریم.

وقتی relay را با TypeScript می‌نویسیم، هنوز مفید است مثل یک supervised message system فکر کنیم:

- connection state را جدا کن
    
- protocol parsing را جدا کن
    
- storage writeها را جدا کن
    
- fanout را جدا کن
    
- policy checkها را جدا کن
    
- از clientهای malformed تمیز recover کن
    
- نگذار یک subscription بد کل relay را آلوده کند
    

ارزش مقایسه این دو همین است.

## Interoperability فراتر از Happy Path است

Relayای که با یک test client کار می‌کند الزاماً interoperable نیست.

Interoperability یعنی زنده ماندن در لبه‌های messy clientهای واقعی:

- clientهایی که چند filter می‌فرستند
    
- clientهایی که subscription ID را replace می‌کنند
    
- clientهایی که query broad می‌فرستند
    
- clientهایی که EOSE انتظار دارند
    
- clientهایی که به OK message اهمیت می‌دهند
    
- clientهایی که prefixهای machine-readable rejection را parse می‌کنند
    
- clientهایی که relay information metadata را می‌خوانند
    
- clientهایی که NIP support مشخصی انتظار دارند
    
- clientهایی که aggressive reconnect می‌کنند
    
- clientهایی که رفتار relayهای قدیمی دیگر را فرض می‌کنند
    

پیاده‌سازی پروتکل باید علیه implementationهای دیگر تست شود، نه فقط علیه فرض‌های خودش.

برای relay عمومی، compatibility کیفیت محصول است.

اگر clientها errorهای تو را نفهمند، relay فقط strict نیست؛ unfriendly است.

اگر relay پشتیبانی‌ای را claim کند که واقعاً ندارد، فقط incomplete نیست؛ misleading است.

اگر relay eventهایی را قبول کند که نمی‌تواند ذخیره کند، فقط permissive نیست؛ unstable است.

## چه چیزهایی باید Private بماند

چون بخشی از این کار در repositoryهای private است، نوشته عمومی نباید جزئیات implementation-specific را expose کند.

یعنی منتشر نکنیم:

- secretهای زیرساخت
    
- topology دقیق deployment اگر ریسک می‌سازد
    
- ruleهای moderation یا filtering که bypass کردن‌شان آسان است
    
- URLهای private relay
    
- allowlistهای داخلی
    
- assumptionهای امنیتی ناتمام
    
- shortcutهای عملیاتی
    
- code pathهایی که آماده traffic عمومی نیستند
    

اما یادگیری‌های protocol-level قابل انتشارند.

می‌شود امن و مفید درباره این‌ها نوشت:

- مسئولیت‌های relay
    
- جریان پیام‌های پروتکل
    
- lifecycle subscription
    
- دسته‌بندی state و storage
    
- محدودیت‌های edge runtime
    
- استراتژی rate limit
    
- مرزهای NIP support
    
- سؤال‌های معماری Cloudflare
    
- tradeoffهای TypeScript و Erlang
    
- اینکه چه چیزی قبل از public شدن یک relay را مسئولانه‌تر می‌کند
    

این سطح عمومی درست برای این lab note است.

## چه چیزی یاد گرفتم

درس اصلی این است که relay کوچک است، اما سطحی نیست.

Relay هم‌زمان مرز پروتکل، سیاست storage، سیستم real-time و سطح moderation است.

نباید تبدیل به social backend monolithic شود.

اما نباید هم وانمود کند که «dumb relay» یعنی «بدون مسئولیت محصولی».

مهندسی جالب در تعادل است:

به‌اندازه کافی validate کن، اما پروتکل خصوصی اختراع نکن.  
به‌اندازه کافی ذخیره کن، اما data hoarder نشو.  
از clientها پشتیبانی کن، اما نگذار clientها failure mode تو را تعیین کنند.  
ساده بمان، اما ساده‌لوح نباش.  
interoperable باش، اما درباره limitها صادق بمان.

برای همین این repositoryها در Lab جا دارند.

محصول relay تمام‌شده نیستند.

مطالعه‌ای درباره نرم‌افزارهایی‌اند که شکل‌شان را از پروتکل می‌گیرند.

## سؤال‌های باز

قبل از هر انتشار عمومی، هنوز سؤال‌های مفیدی باقی مانده:

- relay واقعاً کدام NIPها را باید پشتیبانی کند؟
    
- کدام NIPها باید صریحاً unsupported اعلام شوند؟
    
- relay باید public، private، invite-only یا local-only باشد؟
    
- برای هر event kind چه storage backendی مناسب است؟
    
- برای filterهای client واقعی چه indexهایی لازم است؟
    
- filterهای broad چطور باید محدود شوند؟
    
- duplicate eventها چطور باید تشخیص داده و جواب داده شوند؟
    
- authentication برای write لازم است، برای read، یا برای هر دو؟
    
- relay metadata چطور باید limitهای واقعی را صادقانه توضیح بدهد؟
    
- rate limitها باید بر اساس IP، pubkey و connection چطور باشند؟
    
- چه چیزی باید بعد از restart، deploy یا Durable Object hibernation باقی بماند؟
    
- fanout چطور باید بدون global shared memory مدل شود؟
    
- کدام جزئیات implementation برای انتشار امن‌اند؟
    
- این باید تبدیل به lab series عمومی شود یا internal architecture note بماند؟
    

این سؤال‌ها فرعی نیستند.

خود relay هستند.

## چک‌لیست کار

-  کد private relay را قبل از انتشار هر جزئیات implementation بررسی کن.
    
-  یادداشت‌های protocol-level را جدا کن، بدون expose کردن زیرساخت private.
    
-  جریان پیام NIP-01 را به lifecycle diagram برای relay تبدیل کن.
    
-  یک NIP-11 relay information document برای تجربه بنویس.
    
-  تصمیم بگیر NIP-42 authentication در نسخه عمومی اول جا دارد یا نه.
    
-  لیست NIPهای supported و unsupported را تعریف کن.
    
-  limitهای message size، filterها، subscriptionها، returned events و event size را بنویس.
    
-  rate limit بر اساس IP، pubkey و connection طراحی کن.
    
-  connection state، subscription state، event storage، policy state و relay metadata را جدا کن.
    
-  انتخاب‌های implementation در TypeScript و Erlang را در یک note فنی کوتاه مقایسه کن.
    
-  relay را با چند client تست کن، نه فقط fixtureهای داخلی.
    
-  تصمیم بگیر Cloudflare Durable Objects باید مالک connection groupها، pubkey partitionها یا relay shardها باشند.
    
-  مستند کن چه چیزی باید بعد از WebSocket hibernation باقی بماند.
    
-  تصمیم بگیر این کار باید public lab series شود یا internal architecture note بماند.
    

یک Nostr relay قطعه کوچکی از نرم‌افزار است که سایه طراحی بزرگی دارد.

همین آن را ارزشمند می‌کند.