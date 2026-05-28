---
title: آشنایی با WASM
date: 2023-09-12T16:33:46.294Z
thumbnail: /content/web-assembly-logo.webp
description: "وب‌اسمبلی (WebAssembly) یک استاندارد باز است که امکان اجرای کدهای باینری بهینه را در محیط‌های جاوا اسکریپت فراهم می‌کند. هدف اصلی آن افزایش سرعت و کارایی برنامه‌های وب است، اما می‌توان آن را در محیط‌های دیگر نیز اجرا کرد."

toc: true
intro: false
comments: true
newsletter: true
cat: tuts
---

## دوره آموزشی WebAssembly: ساخت برنامه‌های سریع وب با Go و TinyGo

### معرفی WebAssembly (WASM): آینده برنامه‌های وب

وب امروزی پر از برنامه‌های پیچیده است: از بازی‌های آنلاین مثل **Krunker** تا ویرایشگرهای بلادرنگ مثل **Figma**. جاوااسکریپت، با وجود انعطاف‌پذیری‌اش، گاهی تو تأمین عملکرد لازم برای این برنامه‌ها کم میاره. اینجا **WebAssembly (WASM)** وارد می‌شه، یه فناوری انقلابی که عملکرد برنامه‌های وب رو به سطح جدیدی می‌بره.

**WASM** یه استاندارد باز و فرمت باینریه که به توسعه‌دهندگان اجازه می‌ده کدهای نوشته‌شده با زبان‌هایی مثل **C**، **C++**، **Rust** و **Go** رو به‌صورت بهینه تو مرورگرها اجرا کنن. این کدها تو محیطی ایزوله با امنیت بالا اجرا می‌شن و سرعتشون گاهی تا چند برابر جاوااسکریپته. WASM از سال 2017، که به‌صورت رسمی پشتیبانی مرورگرها رو به دست آورد، توسط غول‌هایی مثل **گوگل**، **مایکروسافت**، **موزیلا** و **اپل** حمایت شده و حالا تو پروژه‌های واقعی، از Adobe Premiere Web تا بازی‌های AAA، نقش کلیدی داره.

### چرا WebAssembly؟

- **سرعت بالا**: کدهای باینری WASM نزدیک به عملکرد زبان‌های بومی اجرا می‌شن.
- **امنیت قوی**: محیط سندباکس از دسترسی غیرمجاز جلوگیری می‌کنه.
- **چندزبانه بودن**: از C++ تا Go، هر زبانی رو به وب بیارید.
- **حجم کم**: فایل‌های WASM فشرده‌تر از جاوااسکریپت مشابهن.
- **پشتیبانی گسترده**: همه مرورگرهای مدرن (کروم، فایرفاکس، سافاری) WASM رو اجرا می‌کنن.

مثال عملی: یه ویرایشگر عکس آنلاین رو تصور کن. با WASM، می‌تونی پردازش تصویر رو با سرعت C++ تو مرورگر انجام بدی، بدون اینکه کاربر چیزی نصب کنه.

### پیش‌نیازها

برای شروع این دوره، به این موارد نیاز دارید:

- آشنایی اولیه با **جاوااسکریپت** و **HTML**.
- نصب **Go** (نسخه 1.21 یا بالاتر) و **TinyGo** (ابزار سبک برای WASM).
- یه ویرایشگر کد مثل **VS Code**.
- مرورگر مدرن (کروم یا فایرفاکس پیشنهاد می‌شه).

بیایید اولین پروژه WASM رو بسازیم و قدرت این فناوری رو از نزدیک ببینیم!

## بخش 1: ساخت اولین پروژه WASM با Go و TinyGo

### 1.1 نصب ابزارهای موردنیاز

برای کار با Go در WASM، از **TinyGo** استفاده می‌کنیم، نسخه‌ای سبک‌تر از Go که برای محیط‌های محدود مثل مرورگرها بهینه شده.

#### نصب TinyGo

اگر از **Homebrew** استفاده می‌کنید (مک/لینوکس):

```bash
brew install tinygo
```

برای ویندوز یا روش‌های دیگه، به [tinygo.org](https://tinygo.org/getting-started/install/) سر بزنید.

#### بررسی نصب

این دستورات رو اجرا کنید تا مطمئن بشید همه‌چیز آماده است:

```bash
go version
tinygo version
```

خروجی باید چیزی شبیه این باشه:

```
go version go1.21.5
tinygo version 0.31.0
```

### 1.2 نوشتن اولین برنامه Go برای WASM

یه پوشه پروژه بسازید و فایل `main.go` رو با این کد پر کنید:

```go
package main

import "fmt"

func main() {
    fmt.Println("سلام از WebAssembly و Go!")
}
```

این کد ساده یه پیام رو تو کنسول مرورگر چاپ می‌کنه.

### 1.3 کامپایل به فرمت WASM

برای تبدیل کد Go به WASM، این دستور رو اجرا کنید:

```bash
tinygo build -o main.wasm -target wasm -no-debug -opt=2 main.go
```

- `-target wasm`: خروجی رو برای مرورگرها تنظیم می‌کنه.
- `-no-debug`: اندازه فایل رو کوچیک‌تر می‌کنه.
- `-opt=2`: بهینه‌سازی حداکثری اعمال می‌شه.

فایل `main.wasm` تولید می‌شه که کد باینری شماست.

### 1.4 آماده‌سازی فایل‌های جاوااسکریپت و HTML

برای اجرای WASM تو مرورگر، به یه فایل جاوااسکریپت کمکی به اسم `wasm_exec.js` نیاز دارید. این فایل رو از [مخزن Go](https://github.com/golang/go/blob/master/misc/wasm/wasm_exec.js) دانلود کنید و کنار پروژه بذارید.

حالا فایل `index.html` رو با این کد بسازید:

```html
<!DOCTYPE html>
<html lang="fa">
  <head>
    <meta charset="UTF-8" />
    <title>اولین پروژه WebAssembly</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>سلام از WebAssembly و Go!</h1>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
        .then((result) => {
          go.run(result.instance);
        })
        .catch((err) => console.error("خطا:", err));
    </script>
  </body>
</html>
```

### 1.5 اجرای پروژه

یه سرور محلی راه بندازید (چون مرورگرها فایل‌های WASM رو مستقیم از سیستم نمی‌خونن):

```bash
python -m http.server 8080
```

حالا به `http://localhost:8080` برید. تو کنسول مرورگر (F12 > Console)، باید پیام **"سلام از WebAssembly و Go!"** رو ببینید.

## بخش 2: تعامل جاوااسکریپت و WebAssembly

حالا بیایید WASM و جاوااسکریپت رو به هم وصل کنیم تا یه ماشین‌حساب ساده بسازیم که جمع دو عدد رو انجام بده.

### 2.1 تعریف تابع در Go

فایل `main.go` رو با این کد جایگزین کنید:

```go
package main

import "syscall/js"

//export add
func add(a, b int) int {
    return a + b
}

func main() {
    js.Global().Set("add", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        return add(args[0].Int(), args[1].Int())
    }))
    select {} // برنامه رو در حال اجرا نگه می‌داریم
}
```

- `//export add`: تابع `add` رو برای جاوااسکریپت قابل دسترسی می‌کنه.
- `select {}`: از خروج برنامه جلوگیری می‌کنه.

### 2.2 کامپایل دوباره

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

### 2.3 به‌روزرسانی HTML

فایل `index.html` رو به این شکل تغییر بدید:

```html
<!DOCTYPE html>
<html lang="fa">
  <head>
    <meta charset="UTF-8" />
    <title>ماشین‌حساب با WebAssembly</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>ماشین‌حساب ساده با Go و WASM</h1>
    <input type="number" id="a" placeholder="عدد اول" />
    <input type="number" id="b" placeholder="عدد دوم" />
    <button id="calc">محاسبه</button>
    <p>نتیجه: <span id="result">0</span></p>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
        .then((result) => {
          go.run(result.instance);
          document.getElementById("calc").addEventListener("click", () => {
            const a = parseInt(document.getElementById("a").value);
            const b = parseInt(document.getElementById("b").value);
            const res = window.add(a, b);
            document.getElementById("result").textContent = res;
          });
        })
        .catch((err) => console.error("خطا:", err));
    </script>
  </body>
</html>
```

### 2.4 تست پروژه

سرور رو دوباره اجرا کنید (`python -m http.server 8080`) و به `localhost:8080` برید. دو عدد وارد کنید، روی **محاسبه** کلیک کنید و نتیجه جمع رو ببینید. این تعامل نشون می‌ده چطور WASM و جاوااسکریپت می‌تونن باهم کار کنن.

## بخش 3: تغییر DOM با WebAssembly

حالا بیایید مستقیماً از Go به DOM مرورگر دسترسی پیدا کنیم و یه پیام پویا اضافه کنیم.

### 3.1 کد Go برای تغییر DOM

فایل `main.go` رو با این کد به‌روزرسانی کنید:

```go
package main

import "syscall/js"

func main() {
    document := js.Global().Get("document")
    div := document.Call("createElement", "div")
    div.Set("innerHTML", "این پیام از Go و WebAssembly اومده!")
    div.Set("style", "color: blue; font-size: 18px; margin-top: 10px;")
    document.Get("body").Call("appendChild", div)

    select {} // برنامه رو فعال نگه می‌داریم
}
```

- `syscall/js`: به Go اجازه می‌ده با DOM و جاوااسکریپت تعامل کنه.
- کد بالا یه `div` جدید می‌سازه و پیامی رو تو صفحه نمایش می‌ده.

### 3.2 کامپایل و اجرا

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

فایل `index.html` رو به حالت ساده برگردونید:

```html
<!DOCTYPE html>
<html lang="fa">
  <head>
    <meta charset="UTF-8" />
    <title>تغییر DOM با WebAssembly</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>تغییر DOM با Go و WASM</h1>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
        .then((result) => {
          go.run(result.instance);
        })
        .catch((err) => console.error("خطا:", err));
    </script>
  </body>
</html>
```

### 3.3 تست پروژه

سرور رو اجرا کنید و به `localhost:8080` برید. باید یه پیام آبی‌رنگ با متن **"این پیام از Go و WebAssembly اومده!"** زیر عنوان ببینید. این نشون می‌ده WASM می‌تونه مستقیماً DOM رو دستکاری کنه.

## نتیجه‌گیری: قدم اول به سوی WASM

تو این ماژول، با **WebAssembly** آشنا شدید و یاد گرفتید چطور با **Go** و **TinyGo** برنامه‌های وب سریع و امن بسازید. از چاپ یه پیام ساده تو کنسول تا ساخت یه ماشین‌حساب تعاملی و تغییر DOM، قدم‌های اولیه رو برداشتید. WASM دنیایی از امکاناته: از اجرای بازی‌های سنگین تو مرورگر تا اپلیکیشن‌های ابری پیچیده. تو ماژول‌های بعدی، سراغ موضوعات پیشرفته‌تر می‌ریم، مثل بهینه‌سازی عملکرد، کار با کتابخونه‌های C++ و ادغام با فریم‌ورک‌های مدرن.

### نکات کلیدی

- WASM سرعت و امنیت رو به برنامه‌های وب میاره.
- TinyGo ابزار سبک و قدرتمندیه برای پروژه‌های WASM.
- تعامل جاوااسکریپت و WASM امکانات بی‌نهایتی فراهم می‌کنه.
- تغییر DOM با Go نشون‌دهنده انعطاف‌پذیری WASMه.

## منابع برای ادامه یادگیری

- **وب‌سایت رسمی WebAssembly**: [webassembly.org](https://webassembly.org) برای مفاهیم پایه.
- **مستندات TinyGo**: [tinygo.org/docs](https://tinygo.org/docs) برای راهنمای کامل.
- **مخزن GitHub TinyGo**: [github.com/tinygo-org](https://github.com/tinygo-org) برای مثال‌های بیشتر.
- **MDN WebAssembly**: [developer.mozilla.org/en-US/docs/WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) برای نکات جاوااسکریپت.
- **انجمن WebAssembly**: [reddit.com/r/WebAssembly](https://reddit.com/r/WebAssembly) برای بحث و پشتیبانی.

بیایید تو ماژول بعدی، WASM رو به پروژه‌های بزرگ‌تر ببریم و وب رو سریع‌تر کنیم!
