# workflow Agent برای محتوای فارسی

## ورودی‌ها

- فایل یا متن هدف
- task: create، rewrite، translate، audit یا update
- mode محتوا
- scope تغییر
- اسناد factual

اگر mode مشخص نیست، آن را تشخیص بده و در گزارش نهایی ذکر کن؛ لازم نیست صرفاً برای این مورد سؤال بپرسی.

## ۱. محافظت از ساختار

- frontmatter را جدا کن.
- code fenceها را مشخص کن.
- links، embeds، componentها و shortcodeها را مشخص کن.
- heading anchorهای حساس را پیدا کن.
- بخش‌های ترجمه‌ناشدنی را freeze کن.

## ۲. factual inventory

claimها را طبق `fa-fact-safety.md` استخراج کن.

اگر claim مشکوک است، خودسرانه اصلاح نکن؛ با code/docs بررسی کن و اگر نشد qualifier یا هشدار بده.

## ۳. mode و هدف

در یک جمله برای خودت بنویس:

> این متن برای [مخاطب] توضیح می‌دهد که [هدف اصلی].

هر بخش بی‌ارتباط باید حذف، کوتاه یا جابه‌جا شود.

## ۴. structural pass

- مقدمه‌ی کلی را حذف کن.
- مسئله را زودتر بیاور.
- headingهای تکراری را ادغام کن.
- ترتیب reasoning را اصلاح کن.
- limitation و status را در جای مناسب بگذار.
- list مصنوعی را به نثر تبدیل کن.
- نتیجه‌ی تکراری را حذف کن.

## ۵. voice pass

- لحن را به صدای علی نزدیک کن.
- جمله‌ی ترجمه‌ای را از نو بساز.
- «من» و «ما» را دقیق کن.
- صفت تبلیغاتی را با توضیح concrete جایگزین کن.
- متن را بیش از حد رسمی نکن.

## ۶. terminology و mechanics

- واژه‌نامه را اعمال کن.
- نویسه، نیم‌فاصله و punctuation را اصلاح کن.
- code و identifier را دست‌نخورده نگه دار.
- Markdown را validate کن.

## ۷. self-review

با rubric امتیاز بده. اگر hard gate شکست خورد، خروجی آماده نیست.

حداقل امتیاز:

```text
85 / 100
```

## ۸. lint

```bash
python3 editorial/fa/scripts/editorial_lint.py path/to/file.md
```

برای release-sensitive:

```bash
python3 editorial/fa/scripts/editorial_lint.py --strict path/to/file.md
```

## ۹. گزارش نهایی

- mode تشخیص‌داده‌شده
- تغییرات ساختاری مهم
- claimهای preserve یا qualifyشده
- lint result
- موارد نیازمند تصمیم انسانی

## محدودیت diff

اگر task اصلاح یک بخش است، کل فایل را بازنویسی نکن. تغییر unrelated ایجاد نکن.

## audit-only

اگر audit خواسته شد، فایل را تغییر نده؛ severity، replacement هدفمند و score ارائه کن.
