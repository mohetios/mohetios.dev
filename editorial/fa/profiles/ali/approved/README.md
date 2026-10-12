# Approved corpus

فقط متن‌هایی که علی صریحاً تأیید کرده است. این پوشه عمداً با نمونه‌ی ساختگی پر نشده است؛ نمونه‌ی synthesized هیچ‌وقت بدون تأیید علی وارد اینجا نشود.

هر فایل این metadata را لازم دارد (`validate_kit.py` بررسی می‌کند):

```markdown
---
approved_by: Ali
approved_at: YYYY-MM-DD
source: path-or-reference
surface: article
operation: rewrite
representative_of:
  - directness
  - reasoning
notes: ''
---

متن تأییدشده
```
