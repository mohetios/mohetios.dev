# Persian Editorial Engine — Entrypoint

برای هر task که خروجی فارسی تولید یا ویرایش می‌کند، این ترتیب را اجرا کن.

## 1. Scope را تشخیص بده

این سیستم را وقتی فعال کن که یکی از این شرایط برقرار است:

- خروجی اصلی فارسی است؛
- متن فارسی باید بازنویسی، ویرایش، خلاصه، گسترش یا ترجمه شود؛
- UI copy، پیام، ایمیل، مقاله، گزارش، مستند یا proposal فارسی تولید می‌شود؛
- کیفیت، صحت یا لحن یک متن فارسی ممیزی می‌شود.

برای تغییر صرفاً کد که متن فارسی ندارد، کل سیستم را بارگذاری نکن.

## 2. منابع را به‌ترتیب بخوان

حداقل:

1. `core/principles.md`
2. `core/transformation-contract.md`
3. `core/factual-integrity.md`
4. `core/temporal-integrity.md`
5. `profiles/ali/voice.md`
6. `profiles/ali/reasoning-style.md`

بعد فقط فایل‌های لازم را بر اساس task بخوان:

- mechanics برای اصلاح نگارشی؛
- dimensions برای ساخت task profile؛
- workflow مرتبط؛
- recipe مناسب، فقط به‌عنوان پیشنهاد؛
- نزدیک‌ترین context معتبر، اگر وجود دارد؛
- approved corpus، وقتی calibration لحن لازم است.

## 3. Task profile بساز

پیش از نوشتن، حداقل این موارد را تعیین کن:

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

اگر کاربر یک ویژگی را مشخص کرده، همان مقدم است. بقیه را از متن و surface استنباط کن.

## 4. Freeze list بساز

قبل از تغییر، مشخص کن چه چیزهایی نباید عوض شوند:

- facts، اعداد، نام‌ها و تاریخ‌ها؛
- URL، slug، command و identifier؛
- code fence، inline code، placeholder و frontmatter؛
- quoteهای واقعی؛
- ownership، status، limitation و uncertainty؛
- terminology تعریف‌شده در context محلی.

## 5. متن را تولید یا تبدیل کن

- فارسی را طبیعی و بومی بنویس، نه ترجمه‌ی لفظی؛
- مسئله، تصمیم، دلیل و محدودیت را روشن کن؛
- adjective را تا جای ممکن به mechanism یا evidence تبدیل کن؛
- چیزی را بزرگ‌تر، قطعی‌تر یا کامل‌تر از منبع نکن؛
- صدای علی را حفظ کن، اما غلط تایپی و شتاب‌زدگی چت را تقلید نکن؛
- recipe را مکانیکی اجرا نکن؛ ساختار باید از هدف متن بیاید.

## 6. Review اجباری

خروجی باید این gateها را پاس کند:

- factual drift ندارد؛
- temporal drift ندارد؛
- protected literal تغییر نکرده؛
- context پروژه‌ی دیگری نشت نکرده؛
- لحن تبلیغاتی، اداری یا AI-like نشده؛
- فارسی طبیعی است؛
- میزان مداخله از خواسته‌ی کاربر بیشتر نشده است.

برای فایل‌ها، ابزارهای زیر را اجرا کن:

```bash
python3 editorial/fa/tooling/editorial_lint.py --strict <changed-files>
python3 editorial/fa/tooling/preserve_check.py <before> <after>
```
