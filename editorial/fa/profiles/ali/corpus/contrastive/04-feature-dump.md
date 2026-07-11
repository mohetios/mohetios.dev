---
status: synthesized
pattern: feature-dump
---

# قبل

سیستم دارای cache، queue، retry، logging، metrics و dashboard است.

# بعد

کارهای فوری در همان request انجام می‌شوند و بقیه وارد queue می‌شوند. retry و metrics کمک می‌کنند خطاهای background قابل پیگیری بمانند؛ dashboard فقط همین وضعیت عملیاتی را نشان می‌دهد.

# چرا

فهرست feature به رابطه‌ی میان اجزا و دلیل وجودشان تبدیل شده است.
