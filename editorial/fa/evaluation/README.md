# Evaluation

Evalها رفتار موتور را می‌سنجند، نه دانش آن درباره‌ی یک پروژه.

`cases.json` شامل taskهای generic و substitution-based است. خروجی مدل را در یک JSON مطابق `outputs.example.json` قرار بده و static checker را اجرا کن:

```bash
python3 editorial/fa/tooling/run_eval_checks.py <outputs.json>
```

ارزیابی معنایی و voice همچنان review انسانی می‌خواهد.

## Rubric — 100 points

| معیار                      | امتیاز |
| -------------------------- | -----: |
| semantic fidelity          |     20 |
| factual integrity          |     15 |
| temporal integrity         |     10 |
| natural Persian            |     15 |
| Ali voice fit              |     15 |
| structure and reasoning    |     10 |
| surface/audience fit       |     10 |
| mechanics and preservation |      5 |

- `90–100`: publish-ready پس از fact review
- `80–89`: خوب، با اصلاح محدود
- `70–79`: نیازمند بازبینی
- `<70`: بازنویسی مجدد

هر hard gate در `ENTRYPOINT.md` (مرحله‌ی ۶)، امتیاز نهایی را رد می‌کند.
