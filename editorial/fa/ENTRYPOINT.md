# Persian Editorial Engine — Entrypoint

برای هر task که خروجی فارسی تولید یا ویرایش می‌کند، این ترتیب را اجرا کن. این پوشه منبع حقیقت برای رفتار تحریری فارسی است، نه منبع حقیقت پروژه‌ها.

```text
core.md               قواعد پایدار زبان، صحت و زمان
profiles/ali/         صدای نویسنده (voice.md) و نمونه‌ها
reference.md          dimensions، workflow، recipe و template
context/              context محلی و تاریخ‌دار
evaluation/           rubric و eval caseها
tooling/              lint، preservation و validation
```

## 1. Scope را تشخیص بده

این سیستم را وقتی فعال کن که یکی از این شرایط برقرار است:

- خروجی اصلی فارسی است؛
- متن فارسی باید بازنویسی، ویرایش، خلاصه، گسترش یا ترجمه شود؛
- UI copy، پیام، ایمیل، مقاله، گزارش، مستند یا proposal فارسی تولید می‌شود؛
- کیفیت، صحت یا لحن یک متن فارسی ممیزی می‌شود.

برای تغییر صرفاً کد که متن فارسی ندارد، کل سیستم را بارگذاری نکن.

## 2. منابع را به‌ترتیب بخوان

در هر task: `core.md` و `profiles/ali/voice.md`.

بعد فقط بخش‌های لازم:

- `reference.md`: dimension، workflow و recipe مرتبط (recipe فقط پیشنهاد است)؛
- `profiles/ali/examples.md`: وقتی تشخیص الگوی نامطلوب لازم است؛
- `profiles/ali/approved/`: وقتی calibration لحن لازم است؛
- نزدیک‌ترین context معتبر.

### Context

چهار نوع context داریم: **core** (پایدار و عمومی)، **profile** (preferenceهای نویسنده)، **task** (brief و sourceهای همین درخواست) و **domain** (terminology و factهای نزدیک‌ترین پروژه/حوزه).

```text
Read the target
→ read the task brief
→ read nearest scoped context (<scope>/editorial-context.md)
→ read only referenced source files
→ ignore unrelated project memory
```

context محلی باید `scope`، `status`، `verified_at`، `source_of_truth` و `expires_or_review_after` داشته باشد (template در `reference.md`).

ممنوع:

- قرار دادن project status در core؛
- بارگذاری تمام docs حافظه برای هر task؛
- استفاده از context بدون تاریخ برای claim جاری؛
- واردکردن اطلاعات یک مشتری در خروجی مشتری دیگر؛
- تبدیل preference موقت به profile دائمی.

context نزدیک‌تر و جدیدتر فقط در scope خودش مقدم است. هیچ context محلی نمی‌تواند factual integrity یا protected literal را لغو کند.

## 3. Task profile بساز

پیش از نوشتن، حداقل این موارد را تعیین کن (مقدارها در `reference.md`):

```yaml
operation: rewrite
purpose: explain
audience: mixed
surface: article
register: conversational-neutral
technical_depth: medium
stance: first-person
evidence_mode: source-grounded
temporal_mode: timeless
intervention_level: structural
length_density: compact-rich
```

اگر کاربر یک ویژگی را مشخص کرده، همان مقدم است. بقیه را از متن و surface استنباط کن. کمترین سطح مداخله‌ای را انتخاب کن که هدف را برآورده می‌کند.

## 4. Freeze list بساز

قبل از تغییر، یک inventory کوتاه بساز از چیزهایی که نباید عوض شوند:

- facts، اعداد، نام‌ها و تاریخ‌ها؛
- status و temporal mode؛
- ownership و attribution؛
- URL، slug، command، key و identifier؛
- code fence، inline code، placeholder و frontmatter؛
- quoteهای واقعی؛
- limitation و uncertainty؛
- intent و stance؛
- terminology تعریف‌شده در context محلی.

## 5. متن را تولید یا تبدیل کن

- پیام مرکزی متن را در یک جمله مشخص کن و ترتیب reasoning را از آن بساز؛
- فارسی را طبیعی و بومی بنویس، نه ترجمه‌ی لفظی؛
- مسئله، تصمیم، دلیل و محدودیت را روشن کن؛
- repetition، مقدمه‌ی generic و sectionهای بی‌کارکرد را حذف کن؛
- adjective را تا جای ممکن به mechanism یا evidence تبدیل کن؛
- چیزی را بزرگ‌تر، قطعی‌تر یا کامل‌تر از منبع نکن؛ claim، تجربه، quote یا نتیجه اختراع نکن؛
- صدای علی را حفظ کن، اما غلط تایپی و شتاب‌زدگی چت را تقلید نکن؛
- recipe را مکانیکی اجرا نکن؛ ساختار باید از هدف متن بیاید.

## 6. Review اجباری

### Hard gates

هرکدام از این‌ها یعنی خروجی رد است:

- fact، عدد، تاریخ یا status تغییر کرده است؛
- plan به capability فعلی تبدیل شده است؛
- ownership یا attribution اختراع، تقویت یا تضعیف شده است؛
- protected URL، code، key، placeholder یا frontmatter آسیب دیده است؛
- security/privacy/medical/legal/financial claim تقویت شده است؛
- context یک پروژه یا مشتری دیگر نشت کرده است؛
- quote، تجربه یا feature جعلی ساخته شده است؛
- operation و سطح مداخله رعایت نشده است؛
- uncertainty، شرط یا caveat حیاتی حذف شده است؛
- ترجمه معنای منبع را تغییر داده است.

### Invariants

- پیام مرکزی و stance نویسنده ثابت است و رابطه‌ی علت و نتیجه معکوس نشده است.
- planned/current/historical با هم مخلوط نشده‌اند و عبارت relative بدون anchor وارد متن پایدار نشده است.
- Markdown و structured syntax خراب نشده است.
- متن corporate، PR-like، بیش‌ازحد رسمی، هیجانی یا AI-like نشده و ریتم جمله‌ها انسانی است.
- تعریف از پروژه جای توضیح سازوکار را نگرفته است.
- recipe به قالب اجباری تبدیل نشده است.

برای فایل‌ها، ابزارهای زیر را اجرا کن:

```bash
python3 editorial/fa/tooling/editorial_lint.py --strict <changed-files>
python3 editorial/fa/tooling/preserve_check.py <before> <after>
pnpm editorial:check
```

## 7. گزارش

برای تغییر فایل بگو:

- چه چیزی ساختاری تغییر کرد؛
- چه چیزی عمداً دست‌نخورده ماند؛
- کدام fact یا context هنوز نیاز به تأیید دارد؛
- چه checkهایی اجرا شد.

متن فقط بعد از review انسانی publish-ready است.
