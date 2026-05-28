---
title: Introduction to WASM
date: 2025-04-27
thumbnail: /content/web-assembly-logo.webp
description: "WebAssembly (WASM) is an open standard that enables the execution of optimized binary code in JavaScript environments. Its primary goal is to enhance the speed and efficiency of web applications, but it can also be run in other environments."
toc: true
intro: false
comments: true
newsletter: true
cat: tuts
---

## WebAssembly Educational Course: Building Fast Web Applications with Go and TinyGo

### Introduction to WebAssembly (WASM): The Future of Web Applications

The modern web is packed with complex applications—from online games like **Krunker** to real-time editors like **Figma**. JavaScript, despite its versatility, sometimes struggles to deliver the performance these applications demand. Enter **WebAssembly (WASM)**, a revolutionary technology that elevates web application performance to new heights.

**WASM** is an open standard and binary format that allows developers to run code written in languages such as **C**, **C++**, **Rust**, and **Go** efficiently in browsers. This code executes in a secure, isolated environment and can be several times faster than JavaScript. Since gaining official browser support in 2017, WASM has been championed by tech giants like **Google**, **Microsoft**, **Mozilla**, and **Apple**. Today, it plays a pivotal role in real-world projects, from Adobe Premiere Web to AAA video games.

### Why WebAssembly?

- **High Speed**: WASM binary code runs at near-native performance levels.
- **Strong Security**: Its sandboxed environment prevents unauthorized access.
- **Multi-Language Support**: Bring languages like C++ and Go to the web.
- **Compact Size**: WASM files are smaller than equivalent JavaScript code.
- **Broad Support**: All modern browsers (Chrome, Firefox, Safari) support WASM.

For instance, picture an online photo editor. With WASM, image processing can happen at C++ speeds directly in the browser—no installation required for the user.

### Prerequisites

To dive into this course, you’ll need:

- Basic knowledge of **JavaScript** and **HTML**.
- **Go** (version 1.21 or higher) and **TinyGo** (a lightweight tool for WASM) installed.
- A code editor like **VS Code**.
- A modern browser (Chrome or Firefox recommended).

Let’s build your first WASM project and experience this technology firsthand!

## Section 1: Building Your First WASM Project with Go and TinyGo

### 1.1 Installing the Necessary Tools

To work with Go in WASM, we’ll use **TinyGo**, a streamlined version of Go optimized for constrained environments like browsers.

#### Installing TinyGo

If you’re on **Mac** or **Linux** with **Homebrew**:

```bash
brew install tinygo
```

For **Windows** or other setups, visit [tinygo.org](https://tinygo.org/getting-started/install/).

#### Verify Installation

Run these commands to confirm everything’s set up:

```bash
go version
tinygo version
```

You should see something like:

```
go version go1.21.5
tinygo version 0.31.0
```

### 1.2 Writing Your First Go Program for WASM

Create a project folder and add a `main.go` file with this code:

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from WebAssembly and Go!")
}
```

This simple program prints a message to the browser console.

### 1.3 Compiling to WASM Format

Convert your Go code to WASM with this command:

```bash
tinygo build -o main.wasm -target wasm -no-debug -opt=2 main.go
```

- `-target wasm`: Targets the browser environment.
- `-no-debug`: Reduces file size.
- `-opt=2`: Applies maximum optimization.

This generates a `main.wasm` file—your binary code.

### 1.4 Preparing JavaScript and HTML Files

To run WASM in a browser, you’ll need a helper script, `wasm_exec.js`. Download it from the [Go repository](https://github.com/golang/go/blob/master/misc/wasm/wasm_exec.js) and place it in your project folder.

Next, create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>First WebAssembly Project</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>Hello from WebAssembly and Go!</h1>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
        .then((result) => {
          go.run(result.instance);
        })
        .catch((err) => console.error("Error:", err));
    </script>
  </body>
</html>
```

### 1.5 Running the Project

Launch a local server (browsers won’t load WASM files directly from the file system):

```bash
python -m http.server 8080
```

Visit `http://localhost:8080`. Open the browser console (F12 > Console) and you should see **"Hello from WebAssembly and Go!"**.

## Section 2: Interaction Between JavaScript and WebAssembly

Let’s connect WASM and JavaScript to build a simple calculator that adds two numbers.

### 2.1 Defining a Function in Go

Replace your `main.go` file with this:

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
    select {} // Keeps the program running
}
```

- `//export add`: Exposes the `add` function to JavaScript.
- `select {}`: Prevents the program from exiting.

### 2.2 Recompile

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

### 2.3 Updating the HTML

Update `index.html` like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Calculator with WebAssembly</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>Simple Calculator with Go and WASM</h1>
    <input type="number" id="a" placeholder="First number" />
    <input type="number" id="b" placeholder="Second number" />
    <button id="calc">Calculate</button>
    <p>Result: <span id="result">0</span></p>
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
        .catch((err) => console.error("Error:", err));
    </script>
  </body>
</html>
```

### 2.4 Testing the Project

Restart the server (`python -m http.server 8080`) and go to `localhost:8080`. Enter two numbers, click **Calculate**, and see the sum. This showcases how WASM and JavaScript can collaborate.

## Section 3: Modifying the DOM with WebAssembly

Now, let’s use Go to directly manipulate the browser’s DOM and add a dynamic message.

### 3.1 Go Code for DOM Modification

Update `main.go` with:

```go
package main

import "syscall/js"

func main() {
    document := js.Global().Get("document")
    div := document.Call("createElement", "div")
    div.Set("innerHTML", "This message came from Go and WebAssembly!")
    div.Set("style", "color: blue; font-size: 18px; margin-top: 10px;")
    document.Get("body").Call("appendChild", div)

    select {} // Keeps the program running
}
```

- `syscall/js`: Enables Go to interact with the DOM and JavaScript.
- This code creates a `div` and adds a styled message to the page.

### 3.2 Compile and Run

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

Simplify `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Modifying DOM with WebAssembly</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>Modifying DOM with Go and WASM</h1>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject)
        .then((result) => {
          go.run(result.instance);
        })
        .catch((err) => console.error("Error:", err));
    </script>
  </body>
</html>
```

### 3.3 Testing the Project

Run the server and visit `localhost:8080`. You’ll see a blue message below the title: **"This message came from Go and WebAssembly!"**. This proves WASM can directly alter the DOM.

## Conclusion: Your First Step Toward WASM

In this module, you’ve explored **WebAssembly** and learned to build fast, secure web applications using **Go** and **TinyGo**. From printing a console message to creating an interactive calculator and modifying the DOM, you’ve taken your first steps. WASM opens up a world of potential—from running intensive games in browsers to powering complex cloud apps. In future modules, we’ll tackle advanced topics like performance optimization, C++ library integration, and working with modern frameworks.

### Key Takeaways

- WASM delivers speed and security to web applications.
- TinyGo is a lightweight, powerful tool for WASM projects.
- JavaScript-WASM interaction unlocks endless possibilities.
- DOM manipulation with Go highlights WASM’s versatility.

## Resources for Further Learning

- **Official WebAssembly Website**: [webassembly.org](https://webassembly.org) for core concepts.
- **TinyGo Documentation**: [tinygo.org/docs](https://tinygo.org/docs) for a full guide.
- **TinyGo GitHub Repository**: [github.com/tinygo-org](https://github.com/tinygo-org) for examples.
- **MDN WebAssembly**: [developer.mozilla.org/en-US/docs/WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) for JavaScript insights.
- **WebAssembly Community**: [reddit.com/r/WebAssembly](https://reddit.com/r/WebAssembly) for discussions and support.

Let’s take WASM to bigger projects in the next module and make the web faster!

---

This translation keeps all technical details intact, adjusts for natural English flow, and uses markdown for clarity. Let me know if you’d like any tweaks!
