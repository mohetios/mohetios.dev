# Corpus

## approved

فقط متن‌هایی که علی صریحاً تأیید کرده است. هر فایل باید metadata داشته باشد:

```yaml
approved_by: Ali
approved_at: YYYY-MM-DD
source: path-or-conversation-reference
surface: article|message|ui|report|...
notes: why this is representative
```

## contrastive

نمونه‌ی `before → after` همراه توضیح اینکه چه چیزی مصنوعی، ترجمه‌ای یا بیش‌ازحد رسمی بود.

## rejected

الگوهای نامطلوب. rejected corpus را برای تولید تقلید نکن؛ فقط برای تشخیص خطا استفاده کن.

## قانون

نمونه‌ی synthesized هیچ‌وقت بدون تأیید علی وارد `approved/` نشود.
