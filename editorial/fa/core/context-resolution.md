# Context resolution

## چهار نوع context

1. **Core:** همیشه پایدار و عمومی.
2. **Profile:** preferenceهای نویسنده.
3. **Task context:** brief و sourceهای همین درخواست.
4. **Domain context:** terminology و factهای نزدیک‌ترین پروژه/حوزه.

## روش بارگذاری

```text
Read the target
→ read the task brief
→ read nearest scoped context
→ read only referenced source files
→ ignore unrelated project memory
```

## فایل context محلی

پیشنهاد:

```text
<scope>/editorial-context.md
```

باید شامل این metadata باشد:

```yaml
scope: path-or-domain
status: active
verified_at: YYYY-MM-DD
source_of_truth:
  - path/to/doc
expires_or_review_after: YYYY-MM-DD | null
```

## ممنوع

- قرار دادن project status در Core؛
- بارگذاری تمام docs حافظه برای هر task؛
- استفاده از context بدون تاریخ برای claim جاری؛
- واردکردن اطلاعات یک مشتری در خروجی مشتری دیگر؛
- تبدیل preference موقت به profile دائمی.

## تعارض

context نزدیک‌تر و جدیدتر فقط در scope خودش مقدم است. هیچ context محلی نمی‌تواند factual integrity یا protected literal را لغو کند.
