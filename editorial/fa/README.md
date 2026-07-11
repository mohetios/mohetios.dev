# موتور تحریریه‌ی فارسی

این پوشه منبع حقیقت برای رفتار تحریری فارسی است، نه منبع حقیقت پروژه‌ها.

```text
Core = قواعد پایدار زبان و صحت
Profile = صدای نویسنده
Context = اطلاعات جاری و محلی task
Recipe = پیشنهاد ساختاری
Adapter = اتصال به ابزار
```

## شروع

`ENTRYPOINT.md`

## ساختار

- `core/`: قواعد مستقل از پروژه و زمان
- `profiles/ali/`: صدای پایدار علی و corpus تأییدشده
- `dimensions/`: تعریف composable هر task
- `workflows/`: روند انجام transformationها
- `recipes/`: الگوهای اختیاری برای surfaceهای رایج
- `context/`: قرارداد context محلی و templateها
- `evaluation/`: rubric، hard gate و eval caseها
- `tooling/`: lint، preservation و validation

## چیزی که اینجا نگهداری نمی‌شود

- وضعیت فعلی پروژه‌ها؛
- roadmap؛
- feature list؛
- URLهای محصول؛
- اصطلاحات یک domain خاص؛
- اطلاعات مشتری؛
- تاریخ روز یا «آخرین» وضعیت یک سیستم.

این اطلاعات باید کنار همان پروژه یا در task brief قرار بگیرند.
