---
title: ویدئوی تعاملی به‌عنوان ماشین وضعیت  
description: یادداشت‌هایی از Bandersnatch Interactive درباره تبدیل یک فایل محلی HTML5 video به تجربه‌ای با مسیرهای شاخه‌ای.  
date: 2019-01-16  
updated: 2026-06-12  
status: Refining  
tags:
- interactive-video
- html5-video
- state-machines
- javascript
- open-source
- media-tools
---

Bandersnatch Interactive یک پروژه قدیمی و تجربی متن‌باز است، اما هنوز مسئله‌ای که لمس می‌کند برای من جالب است.

در ظاهر، پروژه شبیه یک HTML5 video player کوچک است. کاربر یک فایل ویدئویی local را داخل مرورگر load می‌کند، فیلم را می‌بیند، و در زمان‌های مشخص انتخاب می‌کند.

اما مدل ذهنی مفید این پروژه «ویدئو پلیر» نیست.

مدل ذهنی مفیدش ماشین وضعیت است.

فایل ویدئو خطی است.  
اما تجربه خطی نیست.

یک ویدئو پلیر معمولی معمولاً یک سؤال اصلی دارد:

> ویدئو الان در چه زمانی است؟

اما یک ویدئو پلیر تعاملی باید سؤال‌های بیشتری بپرسد:

> الان در کدام segment هستیم؟  
> آیا این timestamp داخل یک decision window است؟  
> الان چه انتخاب‌هایی باید نمایش داده شود؟  
> کاربر قبلاً چه چیزی انتخاب کرده؟  
> بعد از این انتخاب باید به کدام بخش برویم؟  
> اگر کاربر جلو بزند، عقب بزند، pause کند، یا fullscreen شود چه اتفاقی باید بیفتد؟

اینجاست که پروژه جالب می‌شود.

مخزن پروژه:

- [mohetios/BandersnatchInteractive](https://github.com/mohetios/BandersnatchInteractive)
    

## این پروژه چه بود

Bandersnatch Interactive یک محصول تجاری نبود و جایگزین Netflix هم نبود.

یک تجربه local و open-source بود برای بررسی الگوی interaction در ویدئوی شاخه‌ای.

Netflix تجربه رسمی interactive را روی پلتفرم خودش ساخته بود. این پروژه همان نوع منطق پخش را از زاویه دیگری بررسی می‌کرد: اگر مرورگر فقط یک فایل ویدئویی local، یک نقشه از decision pointها، و یک runtime کوچک JavaScript داشته باشد، چه چیزی می‌شود ساخت؟

بدون streaming backend.  
بدون media platform اختصاصی.  
بدون orchestration سمت سرور.  
بدون زیرساخت پنهان محصولی.

فقط مرورگر، video element، timestampها، انتخاب‌ها، subtitleها، keyboard controlها، و یک مدل branching.

همین محدودیت پروژه را مفید می‌کرد.

چون منطق را قابل دیدن نگه می‌داشت.

## محدودیت فایل محلی

پلیر به این وابسته است که کاربر خودش یک فایل ویدئویی local را انتخاب کند.

در نگاه اول این شبیه محدودیت است، اما از نظر فنی یکی از مهم‌ترین بخش‌های پروژه است.

وقتی فایل local می‌ماند، مرورگر وانمود نمی‌کند که یک سرویس streaming کامل است. صفحه فیلم را host یا distribute نمی‌کند. اپلیکیشن فقط یک لایه interaction روی media fileای است که کاربر خودش دارد.

این معماری را عوض می‌کند.

اپلیکیشن لازم نیست خودش ویدئو را decode کند.  
لازم نیست chunkهای ویدئویی stream کند.  
لازم نیست account یا session مدیریت کند.  
لازم نیست backend داشته باشد.

خود HTML5 video element بخش low-level media runtime را فراهم می‌کند: playback، seeking، buffering، trackها، fullscreen behavior، و controlهای مرورگر.

پس اپلیکیشن می‌تواند روی orchestration تمرکز کند.

پروژه واقعی همین است:

نه پخش کردن ویدئو، بلکه هماهنگ کردن معنا دور زمان ویدئو.

## ویدئوی تعاملی یعنی زمان به‌علاوه state

یک فیلم شاخه‌ای فقط مجموعه‌ای از clipها نیست.

یک graph است.

بعضی nodeها segmentهای داستان‌اند.  
بعضی edgeها انتخاب‌اند.  
بعضی transitionها خودکارند.  
بعضی مسیرها به تصمیم‌های قبلی وابسته‌اند.  
بعضی branchها دوباره برمی‌گردند.  
بعضی endingها terminal هستند.  
بعضی jumpها برای recovery استفاده می‌شوند.

در یک پیاده‌سازی ساده، این graph می‌تواند به شکل یک timestamp map نمایش داده شود:

- زمان شروع segment
    
- زمان پایان segment
    
- شروع decision window
    
- پایان decision window
    
- label انتخاب‌ها
    
- انتخاب پیش‌فرض
    
- انتخاب ثبت‌شده
    
- segment مقصد
    
- رفتار recovery
    

وقتی تجربه را این‌طور ببینیم، player دیگر مجموعه‌ای از hackهای ویدئویی نیست؛ تبدیل می‌شود به یک runtime کوچک.

Runtime زمان ویدئو را observe می‌کند، آن را با segment map مقایسه می‌کند، در لحظه درست UI انتخاب را باز می‌کند، تصمیم را ثبت می‌کند، و ویدئو را به segment بعدی seek می‌کند.

این همان ماشین وضعیت است.

نه به معنی سنگین و آکادمیک. به معنی عملی و محصولی.

یک state فعلی داریم.  
transitionهای مجاز داریم.  
event داریم.  
side effect داریم.  
و وقتی کاربر کاری خارج از مسیر عادی می‌کند، recovery داریم.

مرورگر زمان را فراهم می‌کند.  
اپلیکیشن ساختار را فراهم می‌کند.

## state مهم چیست

state مهم کوچک است، اما به timing بسیار حساس است:

- segment فعلی
    
- زمان فعلی پخش
    
- decision window بعدی
    
- لایه انتخاب قابل مشاهده
    
- branch انتخاب‌شده
    
- branch پیش‌فرض وقتی کاربر انتخاب نمی‌کند
    
- انتخاب‌های قبلی
    
- تاریخچه تماشا
    
- ترجیح subtitle
    
- سرعت پخش
    
- وضعیت fullscreen
    
- وضعیت keyboard input
    
- رفتار بعد از seek، rewind، یا jump
    

هیچ‌کدام از این‌ها به‌تنهایی پیچیده نیستند.

سختی اصلی synchronization است.

زمان ویدئو دائماً تغییر می‌کند. ورودی کاربر نامنظم است. fullscreen API در مرورگرهای مختلف رفتارهای متفاوت دارد. controlهای native ویدئو ممکن است با choice layer سفارشی تداخل پیدا کنند. subtitle باید خوانا بماند. keyboard shortcutها نباید player را خراب کنند. جلو زدن یا عقب زدن ممکن است کاربر را از مسیر مورد انتظار داستان بیرون ببرد.

برای همین ماشین وضعیت منظم مهم است.

بدون آن، player تبدیل می‌شود به مجموعه‌ای از شرط‌های پراکنده روی timestamp.

با آن، هر event جای خودش را دارد:

- `timeupdate` بررسی می‌کند آیا decision window باید باز شود یا نه
    
- `keydown` shortcutها را به actionهای player وصل می‌کند
    
- `click` انتخاب را ثبت می‌کند
    
- `seeked` segment فعلی را دوباره reconcile می‌کند
    
- `fullscreenchange` وضعیت layout را به‌روز می‌کند
    
- `ended` تصمیم می‌گیرد تجربه تمام شده یا باید به segment دیگری jump کند
    

پیاده‌سازی می‌تواند کوچک بماند، چون مدل explicit است.

## لایه انتخاب

choice UI قابل‌دیدترین بخش پروژه است، اما کل سیستم نیست.

یک choice layer خوب باید چند کار را هم‌زمان انجام دهد:

- در timestamp درست ظاهر شود
    
- optionهای درست را نشان بدهد
    
- حس تداوم playback را حفظ کند
    
- انتخاب با mouse و keyboard را ممکن کند
    
- اگر کاربر انتخاب نکرد، default path داشته باشد
    
- بعد از تصمیم تمیز ناپدید شود
    
- با controlهای native ویدئو درگیر نشود
    
- در fullscreen کار کند
    
- روی background متغیر ویدئو خوانا بماند
    

این آخری را خیلی راحت می‌شود دست‌کم گرفت.

Interactive media فقط data و branching logic نیست. timing، توجه، visual hierarchy، و طراحی interruption هم هست.

کاربر در حال دیدن چیزی است. UI فقط برای چند ثانیه وارد صحنه می‌شود. باید آن‌قدر واضح باشد که کاربر تصمیم بگیرد، اما آن‌قدر سنگین نباشد که فیلم را بشکند.

این نوع interface design با داشبورد و فرم فرق دارد.

بیشتر شبیه stage direction است.

## branching بدون framework بزرگ

یکی از درس‌های پروژه این است که interactive media همیشه به framework بزرگ نیاز ندارد.

برای یک تجربه محدود، primitiveهای خود مرورگر خیلی جلو می‌روند:

- `HTMLVideoElement` برای playback
    
- text trackها برای subtitle
    
- fullscreen APIها
    
- keyboard eventها
    
- انتخاب فایل local
    
- DOM overlay
    
- timestamp map
    
- local storage برای watch history و preferenceها
    

این معماری برای هر پلتفرم فیلم تعاملی مناسب نیست.

اما برای یک تجربه local و محدود کافی است.

نکته همین است.

یک مدل کوچک و explicit گاهی از abstraction بزرگ و generic مفیدتر است، مخصوصاً وقتی مسئله محصولی محدود و data model مشخص است.

## چرا هنوز مهم است

این پروژه قدیمی است، اما برای من هنوز چند دلیل برای اهمیت دارد.

اول اینکه یادآوری می‌کند web platform چقدر قدرتمند است.

مرورگر می‌تواند فایل local load کند، playback را کنترل کند، overlay رسم کند، زمان را track کند، به keyboard input پاسخ بدهد، subtitle مدیریت کند، preference ذخیره کند، و یک تجربه تعاملی کامل بسازد؛ بدون backend.

دوم اینکه نشان می‌دهد یک محصول media اغلب می‌تواند با state و transition فهمیده شود.

این ایده بعداً در جاهای زیادی برمی‌گردد: onboarding flowها، دوره‌های تعاملی، product tourها، فرم‌های شاخه‌ای، ابزارهای آموزشی شبه‌بازی، decision treeها، و interfaceهای AI-guided.

سوم اینکه این پروژه برای تجربه‌های بعدی seed شد.

بعد از این پروژه، من الگوهای مشابهی را با ایده‌های دیگر interactive story و forkهایی از همین مدل امتحان کردم. خود فیلم خاص هیچ‌وقت نقطه اصلی نبود. نقطه اصلی الگو بود:

یک رسانه خطی که با state تعاملی می‌شود.

## اگر امروز بازسازی‌اش کنم

اگر امروز بخواهم این پروژه را دوباره بسازم، فقط UI را مدرن نمی‌کنم.

اول مدل داخلی را روشن‌تر می‌کنم.

پروژه را به چند لایه explicit جدا می‌کنم:

- media runtime
    
- timeline parser
    
- segment graph
    
- interaction state machine
    
- choice overlay
    
- subtitle و accessibility layer
    
- persistence layer
    
- debug/devtools panel
    
- story package format
    

مورد آخر مهم است.

نسخه قدیمی پروژه به یک تجربه خاص گره خورده. نسخه بهتر آینده باید یک موتور کوچک و generic برای interactive video باشد.

یک story package می‌تواند این‌ها را تعریف کند:

- duration فایل media
    
- segmentها
    
- choiceها
    
- labelها
    
- default pathها
    
- subtitleها
    
- endingها
    
- recovery ruleها
    
- metadata
    
- test pathها
    

آن‌وقت player فقط یک تجربه مخصوص Bandersnatch نیست.

تبدیل می‌شود به یک local-first branching video player قابل استفاده مجدد.

## preservation بدون سوءبرداشت

یک زاویه preservation هم وجود دارد.

interactive media شکننده است. یک فیلم معمولی را می‌شود به‌عنوان یک فایل نگه داشت. اما یک فیلم تعاملی به timing، state، platform support، رفتار UI، و branching logic وابسته است. اگر پلتفرم حذف شود یا آن interaction model را دیگر پشتیبانی نکند، تجربه اصلی سخت قابل بازگشت می‌شود.

این به این معنی نیست که هر player تجربی باید محتوای دارای copyright را distribute کند.

نباید بکند.

اما یعنی خود interaction model ارزش مطالعه دارد.

انتخاب‌ها چطور نمایش داده می‌شدند؟  
timing چطور کار می‌کرد؟  
UI چطور داستان را قطع می‌کرد؟  
سیستم بعد از رسیدن به ending چطور recovery می‌کرد؟  
تصمیم‌های قبلی چطور روی صحنه‌های بعدی اثر می‌گذاشتند؟

این‌ها سؤال‌های طراحی و مهندسی‌اند.

Bandersnatch Interactive یک یادداشت open-source کوچک حول همین سؤال‌هاست.

## چه چیزی یاد گرفتم

درس اصلی ساده است:

ویدئوی تعاملی، ویدئو با چند دکمه نیست.

یک ماشین وضعیت زمان‌محور است.

فایل media تداوم می‌دهد.  
segment graph ساختار می‌دهد.  
choice layer به بیننده agency می‌دهد.  
runtime همه این‌ها را همگام نگه می‌دارد.

وقتی این قطعه‌ها explicit باشند، پروژه راحت‌تر debug، document و extend می‌شود.

وقتی implicit باشند، هر timestamp تبدیل به تله می‌شود.

## چک‌لیست بعدی

-  مدل timing segmentها را به‌صورت جدول خوانا بازیابی کن.
    
-  تمام transition ruleهای بین segmentها را مستند کن.
    
-  timeline map را از player runtime جدا کن.
    
-  برای ویدئوهای تعاملی آینده، story package format تعریف کن.
    
-  choice overlay را برای موبایل، fullscreen، و keyboard بهتر کن.
    
-  برای subtitle، contrast، focus، و reduced motion یادداشت accessibility اضافه کن.
    
-  debug panel برای segment فعلی، decision window فعال، و target بعدی بساز.
    
-  watch history و reset behavior محلی را بهتر کن.
    
-  برای boundaryهای timestamp و transition ruleها تست اضافه کن.
    
-  browser support و محدودیت codecها را شفاف‌تر مستند کن.
    
-  README را طوری تمیز کن که پروژه به‌عنوان یک local open-source interaction experiment معرفی شود.
    
-  این پیاده‌سازی را با تجربه‌های بعدی interactive movie/player مقایسه کن.
    

Bandersnatch Interactive از یک HTML player کوچک برای یک الگوی خاص interactive film شروع شد.

نسخه عمیق‌تر و مهم‌ترش این است:

مطالعه‌ای درباره اینکه چطور یک رسانه خطی، وقتی زمان، state، choice، و transition به‌عنوان یک سیستم واحد دیده شوند، می‌تواند تعاملی شود.