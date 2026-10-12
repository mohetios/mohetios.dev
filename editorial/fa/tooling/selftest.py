#!/usr/bin/env python3
"""Assert-based self-check for the editorial tooling. Run: python3 selftest.py"""
from __future__ import annotations
from editorial_lint import lint_text,load_config
from preserve_check import extract

Z="‌"
cfg=load_config()

def codes(text,structured=False):
    return {i.code for i in lint_text(text,"t.md",cfg,structured)[0]}

# --fix: mechanics outside code/URLs; protected spans stay byte-identical.
src="این کار می شود. كتاب ها را ببینی? اول, دوم و `می شود` و https://x.y/می شود\n"
fixed=lint_text(src,"t.md",cfg,fix=True)[1]
assert fixed==f"این کار می{Z}شود. کتاب{Z}ها را ببینی؟ اول، دوم و `می شود` و https://x.y/می شود\n",fixed
assert codes(fixed)==set(),codes(fixed)
assert {"zwnj-mi","zwnj-suffix","latin-comma","latin-question-mark","arabic-character"}<=codes(src)
# Stray ZWNJ before a space is removed, a real one kept.
assert lint_text(f"کتاب{Z} خوب و می{Z}شود\n","t.md",cfg,fix=True)[1]==f"کتاب خوب و می{Z}شود\n"
# No false positives on words that merely contain the patterns.
assert codes("دائمی باشد، وانمود نکن، نمودار را ببین، تنها راه همین است.\n")==set()
# Frontmatter and fences are untouched by --fix.
fm="---\ntitle: 'می شود'\n---\n\n```\nمی شود\n```\n"
assert lint_text(fm,"t.md",cfg,fix=True)[1]==fm
# Mixed digit policy is a warning; versions/identifiers are not prose digits.
assert "mixed-digits" in codes("سال ۱۴۰۲ بود.\n\nدر سال 1932 کشف شد.\n")
assert "mixed-digits" not in codes("سال ۱۴۰۲ بود.\n\nنسخه 1.21 و P2P و v2 لازم است.\n")
# Calques are info: reported, never fail --strict.
issues=lint_text("این فایل توسط من ساخته شد.\n","t.md",cfg)[0]
assert [i.severity for i in issues]==["info"],issues

# preserve: digit policy is not a fact change; dropped numbers and link targets are.
assert extract("در سال ۱۹۳۲ [مقاله](/a)")==extract("در سال 1932 [مقاله](/a)")
assert extract("۳ سرویس")-extract("چند سرویس")
assert extract("[x](/a)")-extract("[x](/b)")
assert not extract("P2P و v2 و نسخه‌ی 1.21")-extract("P2P و v2 و نسخه‌ی 1.21 ")

print("Editorial tooling self-test passed.")
