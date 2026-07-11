# Evidence mode

- `source-locked`: فقط اطلاعات source؛ هیچ inference جدید
- `source-grounded`: inference محدود با علامت‌گذاری روشن
- `experience-grounded`: تجربه‌ی نویسنده منبع اصلی است
- `analytical`: reasoning و مقایسه، با تفکیک fact و interpretation
- `creative`: آزادی بیانی بیشتر، بدون ساخت fact بیرونی
- `placeholder-allowed`: نقاط نامعلوم با placeholder صریح

برای security، legal، financial، medical، current status و benchmark، default باید source-locked یا source-grounded باشد.
