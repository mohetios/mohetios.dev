# صحت، ادعا و ایمنی محتوایی

لحن خوب factual error را جبران نمی‌کند.

## سلسله‌مراتب منبع

1. code و config فعلی
2. release checklist یا سند canonical فعلی
3. test result و CI فعلی
4. README و docs هم‌نسخه
5. مقاله یا post قدیمی
6. گفتگو و حافظه
7. حدس Agent

اگر منابع تعارض دارند، تعارض را گزارش کن و قطعی ننویس.

## inventory پیش از بازنویسی

- نام‌های خاص
- featureهای موجود
- featureهای planned
- release status
- اعداد و benchmarkها
- claimهای امنیتی
- زمان نگه‌داری داده
- سرویس‌ها و protocolها
- لینک‌ها
- ownership
- code/config snippets

این inventory باید ثابت بماند، مگر task صریحاً factual update باشد.

## طبقه‌بندی claim

- **Verified current fact**
- **Historical fact**
- **Design intention**
- **Roadmap**
- **Inference**
- **Opinion**
- **Unknown / needs verification**

فقط دسته‌ی اول را بدون qualifier در زمان حال قطعی بنویس.

## ممنوعیت‌های سخت

Agent نباید:

- feature planned را موجود معرفی کند.
- تست اجرا‌نشده را passشده بنویسد.
- encryption at rest را E2E بنامد.
- نبود identifier مستقیم را «ناشناس مطلق» تعبیر کند.
- از روی تکنولوژی، performance یا scale را تضمین کند.
- cost یا ظرفیت را بدون measurement قطعی بنویسد.
- تاریخ قدیمی را وضعیت فعلی معرفی کند.
- ownership را حدس بزند.
- quote، آمار یا citation جعلی تولید کند.
- link target را تغییر دهد.

## ادعاهای external و current

برای محدودیت پلتفرم، API behavior، قیمت، نسخه‌ی framework، policy سرویس خارجی، library status و استاندارد امنیتی از مستند رسمی فعلی استفاده کن. اگر web در دسترس نیست، claim را محدود یا برای verification علامت‌گذاری کن.

## زبان مناسب برای عدم قطعیت

- «طبق وضعیت فعلی repository...»
- «در تست‌های موجود...»
- «این طراحی با این فرض انجام شده که...»
- «در حال حاضر...»
- «تا این مرحله...»
- «در scope نسخه‌ی اول نیست...»
- «نیاز به تست زنده دارد...»
- «از روی اسناد موجود نمی‌شود این مورد را قطعی دانست.»

## حفاظت از داده و محرمانگی

- اطلاعات شخصی غیرمرتبط را وارد مقاله نکن.
- اطلاعات مشتری را فقط در سطح public case study بیان کن.
- secret، token، دامنه‌ی داخلی، IP، email خصوصی یا جزئیات دسترسی را منتشر نکن.
- example config باید placeholder داشته باشد.
- گفتگوهای خصوصی را quote عمومی نکن.

## parity فارسی و انگلیسی

نسخه‌ها باید از نظر facts هم‌معنا باشند، نه لزوماً هم‌ساختار.

پس از تغییر یکی، feature list، status، limitation، links، security wording و dates نسخه‌ی دیگر را بررسی کن.
