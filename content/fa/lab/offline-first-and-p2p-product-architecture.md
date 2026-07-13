---
title: معماری محصول آفلاین‌محور و همتابه‌همتا
description: یادداشت‌هایی درباره اتصال Safarnak، PNews، Bagche و تجربه‌های قدیمی‌تر P2P commerce حول state محلی، sync، مالکیت و اعتماد محصولی.
date: 2021-09-07
updated: 2026-06-12
status: Refining
tags:
- offline-first
- p2p
- local-first
- product-architecture
- sync
- resilient-ux
---

سیستم‌های offline-first و peer-to-peer از یک سؤال ناراحت‌کننده شروع می‌شوند:

وقتی مرکز در دسترس نیست، چه چیزی هنوز باید کار کند؟

مرکز می‌تواند چیزهای مختلفی باشد.

یک سرور.
یک اتصال اینترنت.
یک درگاه پرداخت.
یک دیتابیس.
یک منبع feed.
یک گرداننده marketplace.
یک cloud API.
یک شرکت که مالک پلتفرم است.
یک نقطه واحد که قرار است همه حقیقت سیستم آنجا زندگی کند.

بیشتر نرم‌افزارها بی‌صدا فرض می‌کنند مرکز حاضر و قابل دسترس است.

کاربر اپ را باز می‌کند، اپ از سرور می‌پرسد، سرور جواب می‌دهد، و interface قابل استفاده می‌شود. ساختن بر اساس این مدل ساده‌تر است، اما یک وعده محصولی شکننده می‌سازد: اگر مرکز کند باشد، فیلتر باشد، گران باشد، در دسترس نباشد، یا فقط از کاربر دور باشد، محصول دیگر واقعی حس نمی‌شود.

offline-first و P2P قرارداد دیگری می‌خواهند.

می‌پرسند چه چیزی متعلق به کاربر است.
چه چیزی متعلق به دستگاه local است.
چه چیزی متعلق به شبکه است.
چه چیزی متعلق به backend مشترک است.
چه چیزی می‌تواند عقب بیفتد.
چه چیزی باید همان لحظه قابل اعتماد باشد.
چه چیزی را می‌شود بعداً ترمیم کرد.

این سؤال در چند پروژه قدیمی و جدید من تکرار شده:

- [mohetios/safarnak.app](https://github.com/mohetios/safarnak.app)

- [mohetios/pnews](https://github.com/mohetios/pnews)

- [bagche/mamoochi](https://github.com/bagche/mamoochi)

- تجربه‌های خصوصی قدیمی‌تر درباره P2P commerce و Bagche

این‌ها یک محصول واحد نیستند، اما دور یک مسئله مشترک می‌چرخند.

چطور می‌شود نرم‌افزار مفید ساخت وقتی availability، ownership، sync و trust را نمی‌شود به «فقط API را صدا بزن» تقلیل داد؟

## Offline-First استراتژی cache نیست

راحت‌ترین اشتباه این است که offline-first را با caching یکی بگیریم.

Caching می‌گوید:

> سرور خود محصول است. نسخه local فقط یک بهینه‌سازی موقت است.

Offline-first چیز قوی‌تری می‌گوید:

> تجربه local بخشی از وعده محصول است.

این تفاوت کل معماری را عوض می‌کند.

اگر یک برنامه سفر فقط وقتی اینترنت قوی است مفید باشد، برنامه سفر قابل اعتمادی نیست.

اگر مقاله ذخیره‌شده به‌خاطر کند بودن feed server ناپدید شود، واقعاً ذخیره نشده.

اگر یک خرید draft، یادداشت local، پیام خصوصی، یا ویرایش itinerary تا قبل از تأیید cloud قابل اعتماد نباشد، محصول هنوز server-first است.

Offline-first یعنی سرور بی‌اهمیت نیست. یعنی سرور دیگر تنها جایی نیست که محصول در آن وجود دارد.

دستگاه کاربر تبدیل به یک عضو واقعی سیستم می‌شود.

و این سؤال‌های سخت می‌سازد:

- کدام داده به‌صورت local معتبر است؟

- کدام داده فقط projection یا cache است؟

- کدام actionها می‌توانند queue شوند؟

- کدام actionها validation فوری remote لازم دارند؟

- وقتی دو ویرایش conflict دارند چه می‌شود؟

- وقتی sync در حال انتظار است کاربر باید چه ببیند؟

- وقتی sync شکست می‌خورد چه اتفاقی باید بیفتد؟

- چه چیزی باید بعد از reinstall، logout، شبکه ضعیف، یا سفر طولانی باقی بماند؟

این‌ها قبل از اینکه سؤال فنی باشند، سؤال محصولی‌اند.

اگر قرارداد داده مبهم باشد، UI نمی‌تواند پایدار حس شود.

## P2P ضد سرور بودن نیست

Peer-to-peer هم سوءبرداشت مشابهی دارد.

P2P همیشه به معنی «بدون سرور» نیست. اغلب یعنی سرور نباید تنها actor معنادار سیستم باشد.

یک محصول با ذهنیت P2P می‌پرسد:

- آیا کاربر می‌تواند مالک بخش بیشتری از داده‌اش باشد؟

- آیا peerها می‌توانند state مفید را بدون تصمیم‌گیری کامل یک مرکز مبادله کنند؟

- آیا identity، trust، reputation یا content می‌تواند بین سیستم‌ها حرکت کند؟

- آیا شبکه وقتی یک node حذف شد هنوز چیزی از خودش نگه می‌دارد؟

- آیا محصول می‌تواند وابستگی مرکزی غیرضروری را کم کند، بدون اینکه وانمود کند coordination رایگان است؟

بعضی سیستم‌های P2P کاملاً decentralized هستند. بیشتر محصولات عملی این‌طور نیستند.

میانه عملی جالب‌تر است.

یک محصول می‌تواند برای discovery، indexing، abuse control، payment settlement یا backup از سرویس مرکزی استفاده کند، اما همچنان local state، رکوردهای user-owned، signed events، داده قابل export و workflowهای peer-aware داشته باشد.

من مدام به همین فضا برمی‌گردم.

نه purity.

Resilience.

## سه محور: Availability، Authority، Trust

در این پروژه‌ها، معماری را می‌شود با سه محور فهمید.

### ۱. Availability

چه چیزی باید بدون شبکه کار کند؟

در Safarnak جواب از برنامه سفر، ساختار itinerary، مکان‌های ذخیره‌شده، وضعیت trip، و شاید بعداً پیام‌ها یا claimهای حضور شروع می‌شود. سفر یکی از طبیعی‌ترین حوزه‌ها برای offline-first است، چون همان لحظه‌ای که کاربر بیشتر به اپ نیاز دارد، ممکن است شبکه از حالت عادی ضعیف‌تر باشد.

در PNews، availability یعنی خواندن ذخیره‌شده، snapshot محلی از feedها، و سطح مطالعه‌ای که به سریع بودن هم‌زمان همه RSS sourceها وابسته نباشد.

در تجربه‌های قدیمی‌تر commerce، availability یعنی کاربر local order state، draft listing، یا evidenceهای trust را فقط به‌خاطر قطع شدن شبکه از دست ندهد.

Availability فقط uptime نیست.

اعتماد خاطر است.

کاربر باید بداند چه چیزی همین الان در دسترس است، چه چیزی منتظر sync است، و چه چیزی هنوز به شبکه وابسته است.

### ۲. Authority

چه کسی حق دارد بگوید چه چیزی حقیقت است؟

در یک سیستم server-first جواب ساده است: سرور تصمیم می‌گیرد.

در offline-first و P2P، جواب لایه‌لایه می‌شود.

دستگاه local می‌تواند برای draftها، preferenceها، noteهای خصوصی، ویرایش‌های syncنشده و تصمیم‌های موقت authoritative باشد.

سرور می‌تواند برای state عمومی مشترک، moderation، billing، booking نهایی، global discovery یا account recovery authoritative باشد.

یک peer می‌تواند برای signed messageها، identity assertionها، availability، ownership claimها یا interaction history مستقیم authoritative باشد.

یک Git repository می‌تواند برای تاریخچه content authoritative باشد.

یک دیتابیس local می‌تواند تا قبل از sync authoritative باشد.

یک دیتابیس remote می‌تواند بعد از merge authoritative شود.

معماری باید این مرزها را explicit کند.

وگرنه محصول گیج‌کننده می‌شود:

- کاربر فکر می‌کند چیزی ذخیره شده، اما فقط cache شده.

- UI می‌گوید کاری انجام شده، اما فقط queued است.

- سرور تغییری را رد می‌کند که کاربر قبلاً به آن اعتماد کرده.

- conflict ظاهر می‌شود، اما محصول هیچ زبانی برای توضیحش ندارد.

- یک peer record مثل fact نمایش داده می‌شود، در حالی که فقط یک claim تأییدنشده است.

Authority زبان محصول است.

کاربر باید بفهمد سیستم چه چیزی را می‌داند، چه چیزی را فرض می‌کند، و چه چیزی را هنوز دارد تأیید می‌کند.

### ۳. Trust

چه چیزی یک رکورد را قابل باور می‌کند؟

Trust سخت‌ترین بخش سیستم‌های P2P و offline-first است.

در یک اپ cloud معمولی، trust اغلب داخل backend پنهان است. اگر سرور بگوید چیزی وجود دارد، UI نشانش می‌دهد. اگر سرور رد کند، UI حذفش می‌کند.

اما وقتی local state و peer state مهم می‌شوند، trust قابل مشاهده می‌شود.

یک برنامه سفر ممکن است local معتبر باشد ولی هنوز sync نشده باشد.
یک پیام ممکن است signed باشد ولی delivered نشده باشد.
یک listing ممکن است وجود داشته باشد اما verified نباشد.
یک مقاله ذخیره‌شده ممکن است local available باشد اما stale باشد.
یک collaborative edit ممکن است local accepted باشد اما remote conflict داشته باشد.
یک تغییر content ممکن است در Git وجود داشته باشد اما هنوز deploy نشده باشد.

محصول باید این تفاوت‌ها را بدون شلوغ کردن ذهن کاربر نشان بدهد.

برای همین sync فقط protocol نیست.

Sync تجربه کاربری است.

## Safarnak: فضای سفر Offline-First

Safarnak نسخه مدرن‌تر این خط فکری است.

جهت محصولی الان یک forkable AI trip workspace است: ساختن، ویرایش، اشتراک‌گذاری، fork کردن، و شخصی‌سازی برنامه سفر.

این offline-first را مهم‌تر می‌کند، نه کم‌اهمیت‌تر.

برنامه سفر فقط content نیست. operational state است.

کاربر ممکن است هنگام قدم زدن در شهر، نشستن در اتوبوس، عبور از منطقه با پوشش ضعیف، یا چک کردن مکان‌های ذخیره‌شده بدون اینترنت پایدار، به برنامه نیاز داشته باشد. اپ نباید دقیقاً همان لحظه‌ای که مفید می‌شود، تبدیل به loading spinner شود.

شکل فنی هم همین مسیر را نشان می‌دهد:

- کلاینت Expo React Native

- قراردادهای مشترک TypeScript و GraphQL

- ذخیره‌سازی structured محلی

- GraphQL API

- Cloudflare Workers

- D1 برای backend state پایدار

- KV/R2/Vectorize برای cache، media و قابلیت‌های search-like

- Durable Objects برای جاهایی که coordination یا real-time state لازم است

- queued mutations و زبان sync برای کارکرد offline

سؤال عمیق‌تر این نیست که «آیا اپ می‌تواند GraphQL data را cache کند؟»

سؤال عمیق‌تر این است:

کاربر قبل از موافقت سرور، مالک چه چیزی به‌صورت local است؟

برای Safarnak، این می‌تواند شامل این‌ها باشد:

- draftهای trip تولیدشده

- ویرایش‌های دستی itinerary

- activityهای ذخیره‌شده

- ساختار روزبه‌روز سفر

- مکان‌های انتخاب‌شده

- preferenceهای local

- actionهای pending برای share یا fork

- noteهای offline

- و شاید بعداً claimهای حضور یا پیام‌ها

هر نوع state باید قانون sync خودش را داشته باشد.

یک ویرایش local itinerary مثل public trip fork نیست.
یک مکان ذخیره‌شده مثل booking نیست.
یک AI plan draft مثل public page منتشرشده نیست.
یک note خصوصی مثل shared recommendation نیست.

اگر همه این‌ها فقط «data» دیده شوند، محصول شکننده می‌شود.

اگر هرکدام lifecycle روشن داشته باشند، اپ قابل اعتماد حس می‌شود.

## PNews: خواندن، Feedها و سیگنال‌های توزیع‌شده

PNews کوچک‌تر و قدیمی‌تر بود، اما از زاویه‌ای دیگر به همین مسئله نزدیک می‌شد.

یک خبرخوان فارسی جمع‌وجور بود، با الهام از فرم Hacker News: RSS sourceها، عنوان مطلب‌ها، flow خواندن، و ایده‌ای سبک از امتیازدهی یا تعامل حول content.

بخش جالب فقط RSS aggregation نبود.

سؤال جالب، distributed signals بود.

یک خبرخوان می‌تواند کاملاً central باشد: یک backend sourceها را fetch می‌کند، storyها را rank می‌کند، و یک لیست یکسان به همه نشان می‌دهد.

اما یک reader با ذهنیت P2P سؤال‌های دیگری می‌پرسد:

- آیا preferenceهای source می‌تواند متعلق به خود کاربر باشد؟

- آیا saved itemها می‌توانند local available بمانند؟

- آیا vote، reaction یا reading signal می‌تواند distributed باشد؟

- آیا public data می‌تواند open بماند، نه پنهان داخل private database؟

- آیا feed می‌تواند به‌جای یک لیست server-rendered، یک shared graph باشد؟

GUNDB و ابزارهای مشابه P2P graph از همین جهت جالب بودند، چون sync را بخشی از data model می‌بینند، نه فقط یک API call.

PNews محصول کامل نشد، اما در این خط فکری جا دارد، چون همان شکل را تجربه می‌کرد:

خواندن local همراه با سیگنال‌های networked.

محیط خواندن کاربر نباید کاملاً گروگان remote availability باشد.

## Bagche و Mamoochi: مالکیت از مسیر Content Flow

Bagche و Mamoochi از مسیر content و publishing به همین موضوع وصل می‌شوند.

Mamoochi یک P2P commerce app نیست. بیشتر به یک headless، Git-native، serverless CMS و web platform framework نزدیک است.

اما غریزه معماری‌اش مرتبط است:

content باید بیرون از runtime database هم شکل durable داشته باشد.

یک workflow محتوایی Git-native می‌گوید ویرایش‌ها فقط row نیستند. commit هستند. تاریخچه دارند، نویسنده دارند، review دارند، rollback دارند، و deployment flow دارند.

این هم نوعی ownership است.

همه مسئله‌های offline-first را حل نمی‌کند. جای live sync را نمی‌گیرد. اما بخشی از حقیقت محصول را وارد مدیومی می‌کند که می‌شود inspect، copy، fork، review و preserve کرد.

بخش‌های decentralized و real-time در Mamoochi به مسیر دیگری اشاره می‌کنند: همکاری محتوایی و identity لازم نیست در یک application shell مرکزی زندانی شود.

این به تجربه‌های قدیمی‌تر Bagche و P2P commerce هم وصل است.

Commerce مسئله trust را تیزتر می‌کند.

Marketplace فقط listing و order نیست. identity، reputation، availability، agreement، payment، delivery، dispute و memory است.

اگر همه چیز به یک operator مرکزی وابسته باشد، moderation آسان‌تر می‌شود، اما سیستم شکننده‌تر و کمتر portable است.

اگر همه چیز peer-to-peer باشد، abuse control سخت‌تر، settlement سخت‌تر، و توضیح محصول به کاربر پیچیده‌تر می‌شود.

معماری جالب وسط این دو است:

رکوردهای local، actionهای signed، discovery با کمک سرور، trust stateهای explicit، تاریخچه قابل export، و زبان روشن برای sync.

## Sync یک سطح محصولی است

بیشتر bugهای sync برای کاربر مثل دروغ محصولی تجربه می‌شوند.

اپ گفت ذخیره شد. نشده بود.

اپ نسخه قدیمی را نشان داد. نگفت قدیمی است.

اپ اجازه داد دو کاربر یک چیز را ویرایش کنند. conflict را توضیح نداد.

اپ یک action offline را قبول کرد. بعداً ناپدید شد.

اپ خرید را کامل نشان داد. فقط queued بود.

برای همین sync باید زبان خودش را داشته باشد.

نه فقط stateهای داخلی مثل:

- pending

- queued

- synced

- failed

- conflict

- stale

- remote-only

- local-only

- merging

- rejected

بلکه توضیح‌های قابل فهم برای کاربر:

- روی این دستگاه ذخیره شد

- منتظر اتصال شبکه

- sync شد

- نیاز به بررسی دارد

- نسخه جدیدتری موجود است

- امکان انتشار نبود

- این action نیاز به اتصال دارد

- این مورد offline available است

- این تغییر وقتی online شوید share می‌شود

این‌ها labelهای کوچک UI نیستند.

قرارداد محصول‌اند.

یک سیستم offline-first خوب باید به کاربر حس زمین سفت بدهد. کاربر باید بداند چیزی که برایش مهم است safe، pending، shared، private، stale یا broken است.

## Conflict فقط مسئله merge نیست

توسعه‌دهنده‌ها معمولاً درباره conflict به‌عنوان مسئله data structure حرف می‌زنند.

کدام field برنده شود؟
last-write-wins کافی است؟
CRDT لازم داریم؟
operation log نگه داریم؟
merge خودکار ممکن است؟

این‌ها سؤال‌های واقعی‌اند، اما سؤال محصولی زودتر می‌آید:

آیا کاربر می‌فهمد conflict وجود دارد؟

بعضی conflictها می‌توانند نامرئی باشند.

یک reading preference می‌تواند last-write-wins باشد.
یک cached feed item می‌تواند بی‌سر و صدا refresh شود.
یک local setting می‌تواند بدون drama overwrite شود.

بعضی conflictها زبان محصولی لازم دارند.

دو کاربر یک روز سفر را ویرایش کرده‌اند.
فروشنده هنگام action خریدار، listing را تغییر داده.
یک برنامه سفر از نسخه public قدیمی fork شده.
یک note روی دو دستگاه تغییر کرده.
یک action local هنگام ایجاد معتبر بوده، اما هنگام sync نامعتبر شده.

سیستم نباید همه جزئیات merge را به کاربر تحمیل کند، اما نباید وانمود کند همه conflictها بی‌خطرند.

استراتژی درست conflict به هزینه اشتباه بستگی دارد.

برای state کم‌ریسک، merge خودکار خوب است.
برای content نوشته‌شده توسط کاربر، review state نشان بده.
برای پول، identity یا public publishing، confirmation صریح لازم است.
برای claimهای حساس، audit trail نگه دار.

Offline-first یک policy واحد نیست.

یک جدول policyهاست.

## الگوی مشترک پروژه‌ها

اگر به عقب نگاه کنم، این پروژه‌ها تصادفی نبودند.

همه تلاش‌هایی برای جواب دادن به سؤال‌های مشابه در مقیاس‌های متفاوت بودند.

Safarnak می‌پرسد:

> آیا یک travel workspace می‌تواند وقتی شبکه ضعیف است مفید بماند و در عین حال به یک محصول public، shareable و forkable sync شود؟

PNews می‌پرسید:

> آیا خواندن و سیگنال‌های content می‌توانند از یک feed مرکزی معمولی بازتر، localتر و distributedتر باشند؟

Bagche و Mamoochi می‌پرسند:

> آیا content، identity، collaboration و platform state می‌توانند inspectableتر، portableتر و durableتر باشند؟

تجربه‌های قدیمی‌تر P2P commerce می‌پرسیدند:

> آیا می‌شود trust و transaction flow را طراحی کرد، بدون اینکه سرور مرکزی تنها منبع معنادار حقیقت باشد؟

رشته مشترک یک library خاص نیست.

یک باور محصولی است:

کاربر نباید واقعیت کار خودش را فقط به‌خاطر در دسترس نبودن مرکز از دست بدهد.

## اصول معماری

نسخه فعلی این فکر را می‌شود به چند اصل کم کرد.

### ۱. Local state باید شأن داشته باشد

با local state مثل زباله‌ای که منتظر سرور است رفتار نکن.

اگر کاربر چیزی را local ساخته، سیستم باید برایش نام، محافظت، status و sync deliberate داشته باشد.

### ۲. Sync باید قابل دیدن باشد

Sync پنهان، بی‌اعتمادی پنهان می‌سازد.

محصول باید نشان بدهد چیزی local، pending، synced، stale، conflicted یا failed است.

### ۳. Authority باید explicit باشد

هر record مهم باید authority model روشن داشته باشد.

Local-first یعنی local-only نیست. P2P یعنی بدون coordination نیست. Server-backed یعنی سرور مالک همه actionهای کاربر نیست.

### ۴. Trust مدرک می‌خواهد

برای سیستم‌های عمومی، shared یا transactional، رکوردها evidence لازم دارند: signature، timestamp، authorship، source، version، moderation state یا audit trail.

### ۵. Actionهای offline مرز لازم دارند

همه actionها نباید offline مجاز باشند.

Drafting می‌تواند local باشد.
Saving می‌تواند local باشد.
ویرایش note خصوصی می‌تواند local باشد.
Publishing می‌تواند queued باشد.
Payment ممکن است confirmation آنلاین لازم داشته باشد.
Public mutation ممکن است server validation لازم داشته باشد.
عملیات identity-sensitive ممکن است fresh check بخواهد.

### ۶. قانون sync باید قبل از polish طراحی شود

interface زیبا lifecycle مبهم داده را درست نمی‌کند.

قبل از polish کردن screenها، محصول باید بداند کدام operationها local-only، remote-only، queued، mergeable، reversible یا destructive هستند.

### ۷. مرکز باید کمک کند، نه اینکه مالک همه چیز باشد

سرور هنوز می‌تواند ارزشمند باشد.

می‌تواند coordinate کند، backup بگیرد، moderate کند، index کند، search بدهد، notification بفرستد، settle کند، و publish کند.

اما محصول نباید سرور را تنها جایی کند که کار کاربر در آن واقعی حس می‌شود.

## معنی این برای کارهای آینده

این خط فکری هنوز برای پروژه‌های فعلی من مهم است.

برای Safarnak، یعنی MVP باید trip workspace را مثل یک product surface local-first ببیند، نه فقط نتیجه تولیدشده از یک AI call.

برای Mohetios، یعنی نوشتن و content تا جای ممکن file-based، inspectable، portable و Git-friendly بماند.

برای سیستم‌های آینده شبیه Bagche، یعنی content، identity و collaboration مرزهای ownership روشن داشته باشند.

برای هر تجربه آینده در commerce یا P2P، یعنی trust و abuse control باید همراه sync طراحی شوند.

اشتباه این است که decentralization را به‌عنوان شعار دنبال کنیم.

مسیر بهتر عملی‌تر است:

چیزهای مفید را resilient، inspectable، portable و صادق درباره محل زندگی truth بسازیم.

## سؤال‌های باز

سؤال‌های باقی‌مانده هنوز سخت‌ترین بخش‌اند:

- کدام entityهای Safarnak باید واقعاً local-first باشند؟

- کدام mutationها باید queued شوند و کدام‌ها اتصال لازم دارند؟

- یک trip forkشده چطور باید source، version و local changes خودش را نشان بدهد؟

- conflictها چطور باید بدون خسته کردن traveler نمایش داده شوند؟

- چه مقدار از PNews را می‌شود به‌عنوان یادداشت عمومی درباره RSS، P2P signalها و ابزار خواندن فارسی بازیابی کرد؟

- کدام جزئیات قدیمی Bagche و P2P commerce برای انتشار امن و مفیدند؟

- trust model درست برای peer-assisted commerce چیست؟

- کدام رکوردها signature، timestamp، authorship یا audit trail لازم دارند؟

- copy محصولی چطور باید local، pending، synced، stale و conflicted را توضیح بدهد؟

- مرز بین decentralization مفید و پیچیدگی غیرضروری کجاست؟

این سؤال‌ها جدا از معماری نیستند.

خود معماری‌اند.

## چک‌لیست بعدی

- مدل local trip data در Safarnak را با مدل remote GraphQL مقایسه کن.

- هر entity در Safarnak را به local-only، remote-backed، shared، public یا queued طبقه‌بندی کن.

- برای trip draft، saved place، itinerary edit، public trip و fork، sync labelهای قابل فهم برای کاربر تعریف کن.

- جدول policy برای mutationها بنویس: offline مجاز، offline queued، offline blocked، نیازمند confirmation.

- بخش‌های public پروژه PNews را بازیابی کن و فرض‌های RSS، JAMStack، GUNDB و P2P آن را مستند کن.

- تصمیم بگیر کدام بخش‌های Bagche و تجربه‌های قدیمی P2P commerce برای انتشار امن‌اند.

- یک note جدا درباره conflict stateها و زبان sync برای کاربر بنویس.

- برای local write، queued mutation، remote sync، conflict و merge flow دیاگرام اضافه کن.

- local-first، offline-first و P2P را به‌عنوان وعده محصولی مقایسه کن، نه فقط pattern فنی.

- برای تجربه‌های آینده P2P commerce یک trust evidence checklist تعریف کن.

Offline-first فقط درباره کار کردن بدون اینترنت نیست.

P2P فقط درباره حذف سرور نیست.

هر دو راهی برای پرسیدن یک سؤال عمیق‌تر محصولی‌اند:

کار کاربر کجا زندگی می‌کند، چه کسی حق تغییرش را دارد، و وقتی مرکز در دسترس نیست چه چیزی هنوز قابل اعتماد می‌ماند؟
