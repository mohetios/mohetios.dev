# مرجع task

فقط بخشی را بخوان که task لازم دارد.

## Dimensions

به‌جای انتخاب یک template بسته، هر task با ترکیب این dimensions تعریف می‌شود. همه‌ی dimensions لازم نیست صریح نوشته شوند؛ مقدارهای نامشخص را از task استنباط کن. برای کار حساس، task brief کامل بهتر است:

```yaml
operation: rewrite
purpose: explain
audience: mixed
surface: article
register: conversational-neutral
technical_depth: medium
stance: first-person-singular
evidence_mode: source-grounded
temporal_mode: timeless
intervention_level: structural
length_density: compact-rich
sources: []
local_context: []
must_preserve: []
must_avoid: []
notes: ''
```


### Purpose

- `inform`: انتقال fact یا وضعیت
- `explain`: روشن‌کردن سازوکار، تصمیم یا مفهوم
- `document`: ثبت قرارداد، فرایند یا مرجع
- `persuade`: متقاعدکردن با دلیل و evidence
- `request`: درخواست اقدام مشخص
- `guide`: آموزش مرحله‌ای
- `reflect`: روایت تجربه و نتیجه‌گیری
- `announce`: اعلام تغییر یا انتشار
- `sell`: معرفی offer یا ارزش تجاری بدون hype
- `warn`: توضیح ریسک، محدودیت یا پیامد

Purpose ممکن است ترکیبی باشد، اما یکی باید اصلی باشد.

### Audience

- `general`: بدون دانش تخصصی فرض‌شده
- `technical`: توسعه‌دهنده یا متخصص
- `expert`: آشنا با domain و terminology
- `executive`: تصمیم‌گیر، outcome-oriented
- `client`: مشتری یا stakeholder
- `user`: کاربر محصول
- `community`: مخاطب حرفه‌ای/عمومی یک پلتفرم
- `self`: یادداشت شخصی یا memory
- `mixed`: ترکیب فنی و غیرفنی

برای mixed audience، متن را سطحی نکن؛ core idea را ساده و جزئیات فنی را لایه‌ای ارائه بده.

### Surface

Surface شکل مصرف متن است، نه هویت آن.

- article
- technical-reference
- README/documentation
- report
- proposal
- email
- chat-message
- social-post
- UI-copy
- notification
- landing-copy
- release-note
- meeting-note
- script
- caption
- FAQ
- form/help-text

هر surface محدودیت طبیعی دارد: UI کوتاه و action-oriented است؛ report evidence-first است؛ chat نتیجه را زود می‌گوید؛ article فضای reasoning بیشتری دارد.

### Register

- `casual`: صمیمی و گفتاری
- `conversational`: طبیعی و نزدیک به گفت‌وگو
- `conversational-neutral`: default علی؛ انسانی و حرفه‌ای
- `neutral`: کم‌شخصیت‌تر و مرجع‌محور
- `formal`: رسمی روشن، بدون نثر دیوانی
- `legal-administrative`: فقط وقتی واقعاً لازم است

Register را با سطح احترام اشتباه نگیر. متن conversational می‌تواند کاملاً محترمانه باشد.

### Stance

- `first-person-singular`
- `first-person-plural`
- `second-person`
- `impersonal-neutral`
- `brand-voice`
- `mixed`

Ownership را از stance استنباط نکن. «ما» فقط با context واقعی تیم مجاز است.

### Evidence mode

- `source-locked`: فقط اطلاعات source؛ هیچ inference جدید
- `source-grounded`: inference محدود با علامت‌گذاری روشن
- `experience-grounded`: تجربه‌ی نویسنده منبع اصلی است
- `analytical`: reasoning و مقایسه، با تفکیک fact و interpretation
- `creative`: آزادی بیانی بیشتر، بدون ساخت fact بیرونی
- `placeholder-allowed`: نقاط نامعلوم با placeholder صریح

برای security، legal، financial، medical، current status و benchmark، default باید source-locked یا source-grounded باشد.

### Temporal mode

- `timeless`
- `current`
- `historical`
- `planned`
- `event-bound`
- `mixed-explicit`

در حالت mixed، هر بخش باید زمان خودش را روشن کند. تغییر mode بدون source معتبر مجاز نیست.

### Intervention level

- `mechanical`: رسم‌الخط و punctuation
- `light`: روانی و حذف حشو محدود
- `structural`: جابه‌جایی و بازآرایی
- `full-rewrite`: بیان جدید با semantic fidelity
- `reconceptualize`: بازطراحی message/structure؛ فقط با درخواست صریح

Agent باید کمترین سطحی را انتخاب کند که هدف را برآورده می‌کند.

### Length and density

- `minimal`: فقط اطلاعات لازم
- `compact`: کوتاه با یک سطح توضیح
- `compact-rich`: default؛ کم‌حجم ولی تصمیم‌ساز
- `detailed`: توضیح کامل و sectioned
- `reference`: جامع و قابل رجوع

کوتاهی نباید caveat مهم را حذف کند. جامع‌بودن هم مجوز repetition نیست.

## Workflows

Workflowها نحوه‌ی اجرای transformation را تعریف می‌کنند. فقط workflow مرتبط را بخوان.


### Create

1. brief و sourceها را جدا کن.
2. پیام مرکزی و audience effect را مشخص کن.
3. facts، unknownها و claim limitها را inventory کن.
4. ساختار را از purpose و surface بساز.
5. draft اول را بدون filler بنویس.
6. لحن را با profile calibrate کن.
7. factual، temporal و preservation review اجرا کن.

در create، نبود source مجوز اختراع fact نیست.

### Edit

سطح مداخله را قبل از شروع قفل کن.

- mechanical: فقط شکل
- light: شکل + روانی محدود
- structural: ترتیب و repetition

وقتی نیاز واقعی به rewrite دیدی اما task edit است، در گزارش اشاره کن؛ خودکار scope را گسترش نده.

### Rewrite

1. متن را قبل از تغییر کامل بخوان.
2. intent، stance و semantic skeleton را استخراج کن.
3. freeze list بساز.
4. مشکل‌های ساختاری را از مشکل‌های لحن جدا کن.
5. متن را با ساختار روشن‌تر بازنویسی کن.
6. هر claim جدید یا قوی‌تر را حذف کن.
7. before/after را با preserve check مقایسه کن.

Rewrite باید نویسنده را بهتر نمایان کند، نه جای او بنویسد.

### Translate and localize

#### Translate

معنا، fact، tone و caveat را حفظ کن. syntax زبان مبدأ را حفظ نکن.

#### Localize

اثر و هدف را حفظ کن؛ مثال، rhythm و wording را برای فارسی بازطراحی کن.

#### Checklist

- literal translation حذف شده؟
- terminology رسمی سالم است؟
- quote و number تغییر نکرده؟
- level of certainty ثابت است؟
- فارسی از ابتدا طبیعی به نظر می‌رسد؟

نسخه‌ی فارسی و انگلیسی لازم نیست line-by-line یکسان باشند.

### Adapt to another surface

1. artifact اصلی و message central را پیدا کن.
2. محدودیت surface مقصد را مشخص کن.
3. فقط یک یا دو idea اصلی را نگه دار.
4. structure و opening را native همان surface بساز.
5. fact و limitation را حفظ کن.
6. CTA را فقط اگر surface و task نیاز دارد اضافه کن.

Adapt یعنی بازطراحی، نه paste یا خلاصه‌ی اتوماتیک.

### Summarize and expand

#### Summarize

- نتیجه، دلیل و caveat حیاتی را نگه دار.
- مثال تکراری، جزئیات اجرایی فرعی و مقدمه‌ی زائد را حذف کن.
- uncertainty را حذف نکن.

#### Expand

- فقط با source، مثال روشن‌کننده یا reasoning قابل دفاع گسترش بده.
- feature، تاریخ، quote یا نتیجه‌ی جدید نساز.
- هر بخش جدید باید کارکرد مشخص داشته باشد.

### Audit

Audit باید diagnosis بدهد، نه صرفاً سلیقه.

برای هر مشکل:

```text
Location
Problem type
Why it matters
Suggested correction
Risk if unchanged
```

انواع مشکل:

- factual drift
- temporal ambiguity
- ownership error
- literal translation
- AI cadence
- corporate tone
- structure/repetition
- mechanics
- surface mismatch

فقط در صورت درخواست، replacement کامل بده.

## Recipes

Recipe ترکیبی پیشنهادی از dimensions است. اگر task یا متن ساختار دیگری می‌خواهد، recipe را تغییر بده.


### Article recipe

```yaml
purpose: explain|reflect
audience: mixed
surface: article
register: conversational-neutral
stance: first-person-singular|mixed
length_density: compact-rich|detailed
```

الگوی ممکن:

```text
observation/problem → shift/decision → mechanism → tradeoff → result/boundary
```

### Technical document recipe

```yaml
purpose: document
audience: technical|expert
surface: technical-reference
register: neutral
technical_depth: high
stance: impersonal-neutral
evidence_mode: source-locked
temporal_mode: timeless|versioned
```

تمرکز: contract، boundary، data flow، failure mode، limitation و example.

### Report recipe

```yaml
purpose: inform|document
surface: report
register: neutral|formal
stance: impersonal-neutral
source_mode: source-locked
```

وضعیت، evidence، risk، decision و next action را جدا کن. fact و interpretation را مخلوط نکن.

### Proposal recipe

```yaml
purpose: persuade|sell
surface: proposal
register: conversational-neutral|formal
stance: first-person-singular|brand-voice
```

problem، scope، outcome، boundary، delivery و assumption را روشن کن. از وعده‌ی نامحدود و adjective بدون evidence پرهیز کن.

### Email and message recipe

```yaml
purpose: request|inform|persuade
surface: email|chat-message
register: conversational-neutral
length_density: compact
```

نتیجه یا درخواست را زود بگو. greeting و closing را متناسب با رابطه نگه دار. در thread کوتاه سلام را هر بار تکرار نکن.

### Social post recipe

```yaml
purpose: explain|announce|reflect
surface: social-post
register: conversational
length_density: compact
```

یک idea، یک تصمیم یا یک lesson. hook باید واقعی باشد، نه clickbait. artifact یا تجربه‌ی واقعی پشت متن باشد.

### UI copy recipe

```yaml
purpose: guide|warn|request
audience: user
surface: UI-copy
register: conversational
length_density: minimal
```

- action را روشن کن.
- پیامد را وقتی مهم است بگو.
- blame نکن.
- اصطلاح داخلی سیستم را به کاربر تحمیل نکن.
- هر string را در context flow بررسی کن.

### Personal note recipe

```yaml
purpose: reflect
surface: meeting-note|article|self
register: conversational
stance: first-person-singular
source_mode: experience-grounded
```

تجربه، observation و uncertainty را حفظ کن. متن را به motivational essay عمومی تبدیل نکن.

## Templates

برای context محلی، فایل `<scope>/editorial-context.md` با این frontmatter بساز:

```yaml
scope: 'path-or-domain'
status: active
verified_at: 'YYYY-MM-DD'
review_after: null
source_of_truth:
  - 'path/to/source'
```

### Factual inventory

بخش‌ها:

- Verified facts
- Current status and date
- Planned / hypothetical
- Numbers and measurements
- Ownership / attribution
- Limitations / uncertainty
- URLs, identifiers and protected literals
- Sources

### Editorial review

بخش‌ها:

- Task profile
- Preserved facts and literals
- Structural changes
- Voice changes
- Factual/temporal risks
- Checks run
- Remaining uncertainties

### Editorial context

بخش‌ها:

- What this scope is
- Audience
- Verified facts
- Current status
- Planned, not implemented
- Ownership and attribution
- Required terminology
- Forbidden or risky claims
- Confidential information not to publish
- Review notes

### Scoped terminology

| Concept | Preferred Persian | Keep English? | Avoid | Notes/source |
| ------- | ----------------- | ------------: | ----- | ------------ |
|         |                   |               |       |              |

این واژه‌نامه فقط در scope خودش معتبر است و نباید وارد Core شود.
