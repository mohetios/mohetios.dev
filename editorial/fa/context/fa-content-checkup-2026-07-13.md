# چک‌لیست بازبینی محتوای فارسی Mohetios.dev

```yaml
scope: content/fa + i18n/locales/fa.json
status: active-review
verified_at: 2026-07-13
author_profile: ali
operation: audit + light-edit + targeted-rewrite
surface:
  - public pages
  - project notes
  - library notes
  - lab notes
  - tutorial/articles
  - UI copy
```

## معیار ثابت

- fact، تاریخ، status، لینک، frontmatter، code fence و identifier دست‌نخورده بماند.
- متن از زاویه‌ی سازنده نوشته شود، نه PR، رزومه، یا معرفی محصولی پرصدا.
- claimهای فعلی، امنیتی، performance و product-readiness بدون source تقویت نشوند.
- متن کوتاه اگر خشک یا template-like است، به «مسئله، دلیل، مرز» نزدیک شود.
- متن بلند فقط وقتی تغییر کند که mismatch روشن داشته باشد.
- UI copy کوتاه، روشن، بدون blame و هم‌واژه با محتوای اصلی باشد.

## صف بازبینی

| بخش | وضعیت | یادداشت |
| --- | --- | --- |
| `content/fa/about.md` | بررسی شد | لحن با profile نزدیک است؛ تغییر لازم ندیدم. |
| `content/fa/contact.md` | ویرایش شد | فهرست‌ها فشرده‌تر شدند؛ «گفت‌وگو» و جمله پایانی هماهنگ شد. |
| `content/fa/projects/*.md` | بررسی شد | با READMEهای GitHub مقایسه شد؛ متن فارسی عمداً دقیق‌تر و کم‌ادعاتر از READMEهاست. |
| `content/fa/blog/*` کتاب‌ها | ویرایش هدفمند | شروع چند یادداشت قدیمی از حالت generic خارج شد. |
| `content/fa/blog/work-with-wasm/intro-wasm.md` | ویرایش سبک | register آموزشی یکدست‌تر شد؛ codeها دست‌نخورده ماندند. |
| `content/fa/blog/jamstack-with-cloudflare/index.md` | بازنویسی محدود | پاراگراف generic Jamstack به توضیح مرز build/runtime تبدیل شد. |
| lab noteهای بلند | بررسی مکانیکی و الگویی | lint پاک است؛ به‌خاطر ریسک fact/temporal drift فعلاً rewrite سنگین نشدند. |
| `i18n/locales/fa.json` | ویرایش شد | «گفت‌وگو»، جمله استاندارد سایت و یک مورد «سؤال» هماهنگ شد. |

## بررسی‌های بعدی پیشنهادی

- برای project pageها، screenshot و usage example را جداگانه از خود repoها کامل کن.
- برای library noteها، اگر هر کتاب واقعاً خوانده یا مرور شده، یک جمله‌ی شخصی‌تر درباره «چرا روی قفسه مانده» اضافه کن.
- برای labهای بلند، هر بار فقط یک note را با source همان پروژه بازبینی عمیق کن؛ بازنویسی جمعی ریسک temporal drift دارد.
