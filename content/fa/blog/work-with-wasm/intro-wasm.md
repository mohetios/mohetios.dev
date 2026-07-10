---
title: آشنایی با WASM
date: 2023-09-12T16:33:46.294Z
thumbnail: /content/web-assembly-logo.webp
description: 'شروع یک مسیر عملی با WebAssembly و TinyGo؛ ساخت ماژول‌های کوچک Wasm، اتصال آن‌ها به JavaScript، و فهمیدن مرز واقعی استفاده از آن در وب.'
tags:
  - آموزش
  - webassembly
  - tinygo
  - go
  - wasm

toc: true
intro: false
comments: true
newsletter: true
cat: tuts
---

## شروع کوچک با WebAssembly

### WebAssembly کجا به درد می‌خورد؟

گاهی یک بخش کوچک از برنامه وب به محاسبه بیشتری نیاز دارد؛ پردازش تصویر، شبیه‌سازی، parser، یا کدی که قبلاً با زبانی غیر از JavaScript نوشته شده است.

**WebAssembly (WASM)** برای همین مرزها جالب می‌شود. یک فرمت باینری استاندارد است که اجازه می‌دهد کدهایی از زبان‌هایی مثل **C**، **C++**، **Rust** و **Go** در مرورگر یا runtimeهای سازگار اجرا شوند. در این مسیر، تمرکز من روی استفاده کوچک و قابل فهم با TinyGo است، نه وعده اینکه همه چیز باید با Wasm نوشته شود.

### چرا WebAssembly؟

- **کار محاسباتی مشخص**: وقتی بخشی از برنامه واقعاً از اجرای باینری سود می‌برد.
- **استفاده‌ی دوباره از کد موجود**: وقتی logic قبلاً در C، C++، Rust یا Go نوشته شده است.
- **مرز runtime روشن**: وقتی می‌خواهیم بخش compute را از UI جدا نگه داریم.
- **اجرای sandboxed**: وقتی اجرای کنترل‌شده در مرورگر یا runtime سازگار مهم است.

برای این شروع، هدف فقط ساختن یک مسیر کوچک و قابل دیدن است: یک فایل Go، یک خروجی Wasm، و یک صفحه HTML که آن را اجرا می‌کند.

### پیش‌نیازها

برای شروع، به این موارد نیاز دارید:

- آشنایی اولیه با **جاوااسکریپت** و **HTML**.
- نصب **Go** (نسخه 1.21 یا بالاتر) و **TinyGo** (ابزار سبک برای WASM).
- یک ویرایشگر کد مثل **VS Code**.
- مرورگر مدرن.

Warm-up کافی است. از کوچک‌ترین مسیر شروع می‌کنیم.

## بخش 1: ساخت اولین پروژه WASM با Go و TinyGo

### 1.1 نصب ابزارهای موردنیاز

برای کار با Go در WASM، از **TinyGo** استفاده می‌کنیم، نسخه‌ای سبک‌تر از Go که برای محیط‌های محدود مثل مرورگرها بهینه شده.

#### نصب TinyGo

اگر از **Homebrew** استفاده می‌کنید (مک/لینوکس):

```bash
brew install tinygo
```

برای ویندوز یا روش‌های دیگر، به [tinygo.org](https://tinygo.org/getting-started/install/) سر بزنید.

#### بررسی نصب

این دستورها را اجرا کنید تا مطمئن شوید ابزارها آماده‌اند:

```bash
go version
tinygo version
```

خروجی باید چیزی شبیه این باشه:

```txt
go version go1.21.5
tinygo version 0.31.0
```

### 1.2 نوشتن اولین برنامه Go برای WASM

یک پوشه پروژه بسازید و فایل `main.go` را با این کد پر کنید:

```go
package main

import "fmt"

func main() {
    fmt.Println("سلام از WebAssembly و Go!")
}
```

این کد ساده یک پیام را در کنسول مرورگر چاپ می‌کند.

### 1.3 کامپایل به فرمت WASM

برای تبدیل کد Go به WASM، این دستور را اجرا کنید:

```bash
tinygo build -o main.wasm -target wasm -no-debug -opt=2 main.go
```

- `-target wasm`: خروجی را برای مرورگرها تنظیم می‌کند.
- `-no-debug`: اندازه فایل را کوچک‌تر می‌کند.
- `-opt=2`: بهینه‌سازی بیشتری اعمال می‌کند.

فایل `main.wasm` تولید می‌شود که خروجی باینری برنامه است.

### 1.4 آماده‌سازی فایل‌های جاوااسکریپت و HTML

برای اجرای WASM در مرورگر، به یک فایل JavaScript کمکی به نام `wasm_exec.js` نیاز دارید. این فایل را از [مخزن Go](https://github.com/golang/go/blob/master/misc/wasm/wasm_exec.js) دانلود کنید و کنار پروژه بگذارید.

حالا فایل `index.html` را با این کد بسازید:

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
      const go = new Go()
      WebAssembly.instantiateStreaming(fetch('main.wasm'), go.importObject)
        .then((result) => {
          go.run(result.instance)
        })
        .catch((err) => console.error('خطا:', err))
    </script>
  </body>
</html>
```

### 1.5 اجرای پروژه

یک server محلی راه بیندازید، چون مرورگرها فایل‌های WASM را مستقیم از filesystem اجرا نمی‌کنند:

```bash
python -m http.server 8080
```

حالا به `http://localhost:8080` بروید. در کنسول مرورگر باید پیام **"سلام از WebAssembly و Go!"** را ببینید.

## بخش 2: تعامل جاوااسکریپت و WebAssembly

حالا WASM و JavaScript را به هم وصل می‌کنیم تا یک ماشین‌حساب ساده داشته باشیم که جمع دو عدد را انجام می‌دهد.

### 2.1 تعریف تابع در Go

فایل `main.go` را با این کد جایگزین کنید:

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
    select {} // برنامه را در حال اجرا نگه می‌داریم
}
```

- `//export add`: تابع `add` را برای JavaScript قابل دسترسی می‌کند.
- `select {}`: از خروج برنامه جلوگیری می‌کند.

### 2.2 کامپایل دوباره

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

### 2.3 به‌روزرسانی HTML

فایل `index.html` را به این شکل تغییر بدهید:

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
      const go = new Go()
      WebAssembly.instantiateStreaming(fetch('main.wasm'), go.importObject)
        .then((result) => {
          go.run(result.instance)
          document.getElementById('calc').addEventListener('click', () => {
            const a = parseInt(document.getElementById('a').value)
            const b = parseInt(document.getElementById('b').value)
            const res = window.add(a, b)
            document.getElementById('result').textContent = res
          })
        })
        .catch((err) => console.error('خطا:', err))
    </script>
  </body>
</html>
```

### 2.4 تست پروژه

server را دوباره اجرا کنید (`python -m http.server 8080`) و به `localhost:8080` بروید. دو عدد وارد کنید، روی **محاسبه** کلیک کنید و نتیجه جمع را ببینید. این تعامل نشان می‌دهد مرز JavaScript و WASM چطور در یک نمونه کوچک کار می‌کند.

## بخش 3: تغییر DOM با WebAssembly

در این مرحله از Go به DOM مرورگر دسترسی پیدا می‌کنیم و یک پیام پویا اضافه می‌کنیم.

### 3.1 کد Go برای تغییر DOM

فایل `main.go` را با این کد به‌روزرسانی کنید:

```go
package main

import "syscall/js"

func main() {
    document := js.Global().Get("document")
    div := document.Call("createElement", "div")
    div.Set("innerHTML", "این پیام از Go و WebAssembly اومده!")
    div.Set("style", "color: blue; font-size: 18px; margin-top: 10px;")
    document.Get("body").Call("appendChild", div)

    select {} // برنامه را فعال نگه می‌داریم
}
```

- `syscall/js`: به Go اجازه می‌دهد با DOM و JavaScript تعامل کند.
- کد بالا یک `div` جدید می‌سازد و پیامی را در صفحه نمایش می‌دهد.

### 3.2 کامپایل و اجرا

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

فایل `index.html` را به حالت ساده برگردانید:

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
      const go = new Go()
      WebAssembly.instantiateStreaming(fetch('main.wasm'), go.importObject)
        .then((result) => {
          go.run(result.instance)
        })
        .catch((err) => console.error('خطا:', err))
    </script>
  </body>
</html>
```

### 3.3 تست پروژه

server را اجرا کنید و به `localhost:8080` بروید. باید یک پیام آبی‌رنگ با متن **"این پیام از Go و WebAssembly اومده!"** زیر عنوان ببینید. این نمونه نشان می‌دهد WASM می‌تواند از مسیر `syscall/js` با DOM تعامل کند، هرچند برای بیشتر کارهای UI بهتر است JavaScript همچنان مالک رابط بماند.

## جمع‌بندی

این مسیر فقط قدم اول است: ساختن `main.wasm`، load کردن آن در مرورگر، call کردن تابع از JavaScript، و دیدن اینکه Go می‌تواند از طریق `syscall/js` با DOM حرف بزند.

نکته‌ی مهم این است که WASM را پیش‌فرض نکنیم. اول باید مرز مسئله روشن باشد. اگر بخش compute جدا، سنگین یا قابل استفاده‌ی دوباره است، WASM می‌تواند ارزش داشته باشد. اگر مسئله فقط UI معمولی است، JavaScript ساده‌تر و طبیعی‌تر می‌ماند.

### نکات کلیدی

- TinyGo مسیر کوچکی برای ساخت WASM از Go می‌دهد.
- JavaScript همچنان مرز اصلی ارتباط با مرورگر است.
- DOM manipulation از Go ممکن است، اما همیشه مرز طراحی مناسبی نیست.
- ارزش WASM وقتی روشن می‌شود که یک بخش compute مشخص داشته باشیم.

## منابع برای ادامه یادگیری

- **وب‌سایت رسمی WebAssembly**: [webassembly.org](https://webassembly.org) برای مفاهیم پایه.
- **مستندات TinyGo**: [tinygo.org/docs](https://tinygo.org/docs) برای راهنمای کامل.
- **مخزن GitHub TinyGo**: [github.com/tinygo-org](https://github.com/tinygo-org) برای مثال‌های بیشتر.
- **MDN WebAssembly**: [developer.mozilla.org/en-US/docs/WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) برای نکات JavaScript.
