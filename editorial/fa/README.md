# سیستم تحریریه‌ی فارسی موهتیوس

این پوشه منبع حقیقت برای اصلاح، تولید، ترجمه و ممیزی محتوای فارسی `content/fa/` است. سیستم عمداً مینیمال است: فقط همین پوشه، راهنمای `AGENTS.md` ریشه، راهنمای `content/fa/AGENTS.md` و ابزارهای داخل `editorial/fa/scripts/`.

هدف «فارسی رسمی‌تر» یا «متن زیباتر» نیست. هدف این است که متن فارسی طبیعی، دقیق، آرام، فنی و نزدیک به صدای موهتیوس بماند؛ بدون لحن بازاری، ترجمه‌ی لفظی، ادعای بزرگ‌تر از واقعیت، یا متن AI-like.

## Agent چطور استفاده کند

برای هر تغییر فارسی:

1. فایل هدف را کامل بخوان و frontmatter، لینک‌ها، کد، جدول، embed و شناسه‌های runtime-sensitive را دست‌نخورده نگه دار.
2. `editorial-context.md` و `fa-voice.md` را برای صدای کلی بخوان.
3. از `fa-content-modes.md` نوع محتوا را مشخص کن: Project Page، Lab Note، Technical Article، Release Note، Personal Essay یا Translation.
4. پیش از بازنویسی، factual inventory بساز: مالکیت، وضعیت release، قابلیت‌های فعلی، برنامه‌های آینده، عددها، محدودیت‌ها، و ادعاهای امنیتی.
5. قواعد مکانیکی فارسی را از `fa-writing-mechanics.md` اعمال کن.
6. اصطلاحات فنی را با `fa-lexicon.md` هماهنگ کن.
7. ادعاهای حساس، مخصوصاً امنیت، ناشناسی، privacy، ownership و release status را با `fa-fact-safety.md` کنترل کن.
8. workflow مرحله‌ای `fa-agent-workflow.md` را اجرا کن.
9. خروجی را با `fa-review-rubric.md` بسنج. متن زیر ۸۵/۱۰۰ یا دارای hard gate نباید publish-ready اعلام شود.
10. بعد از تغییر فایل‌ها، linter را اجرا کن:

```bash
python3 editorial/fa/scripts/editorial_lint.py --strict <changed-files>
```

## فایل‌های اصلی

- `editorial-context.md`: زمینه‌ی محصول، برند و محدوده‌ی استفاده.
- `fa-voice.md`: صدای فارسی موهتیوس و الگوهای جمله/ریتم.
- `fa-content-modes.md`: ساختار مناسب برای هر نوع محتوا.
- `fa-writing-mechanics.md`: نیم‌فاصله، punctuation، اعداد و رسم‌الخط.
- `fa-lexicon.md`: واژه‌نامه‌ی فنی و تصمیم‌های house style.
- `fa-fact-safety.md`: کنترل ادعاهای حساس و factual safety.
- `fa-review-rubric.md`: rubric صد امتیازی و hard gateها.
- `scripts/editorial_lint.py`: lint مکانیکی بدون dependency خارجی.

## تعارض قواعد

1. صحت فنی و factual safety بر لحن مقدم است.
2. دستور صریح task بر preferenceهای سبک مقدم است، مگر اینکه ادعای نادرست بسازد.
3. `content/fa/AGENTS.md` برای محتوای فارسی از خلاصه‌ی ریشه دقیق‌تر است.
4. سندهای داخل `editorial/fa/` از هر خلاصه یا حافظه‌ی مکالمه معتبرترند.
