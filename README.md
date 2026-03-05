# ⚡ Vivid Calc — Expression Parser

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A modern, keyboard-first, expression parser calculator built with pure HTML, CSS, and Vanilla JavaScript. Supports basic arithmetic operations, unary minus, parentheses, and history for past calculations.

---

## 🌐 [**Live Demo**](https://vivid-calc.netlify.app/)

---

## 📸 Preview

> [![pic](/calculator-preview.png)](https://vivid-calc.netlify.app/)

---

## ✨ Features

- **📝 Expression Parsing** — Evaluate full mathematical expressions instantly, e.g., `3^2 + (5*4) - 7%2`
- **⌨️ Keyboard Support** — Type directly on your keyboard or click on-screen buttons
- **🎮 History** — Keeps a history of evaluated expressions for quick access and re-editing
- **🗑️ Clear/Backspace** — Clear the expression or delete the last character with a click or keypress
- **🔀 Modulo & Exponentiation** — Supports `%` and `^` for advanced calculations
- **🔢 Operators** — Supports `+`, `-`, `*`, `/`, `%`, and `^`
- **💻 Responsive** — Optimized for mobile, tablet, and desktop
- **📊 Floating Orbs** — A beautiful animated background that adds a painterly effect
- **📝 Keyboard Shortcuts** — Press `Enter` (or `=`) to evaluate, `Esc` to clear, and `⌫` to backspace

---

## 🗂️ Project Structure

```

vivid-calc/
│
├── index.html # App layout and markup
├── style.css # All styles, variables, and responsive design
└── script.js # Expression parsing logic and history functionality

```

---

## 🚀 Getting Started

No build tools or installations required.

### 1. Clone the repository

```bash
git clone https://github.com/muneebali500/vivid-calculator
```

### 2. Open in a browser

```bash
cd vivid-calculator
open index.html
```

Or simply double-click `index.html` to run it entirely in the browser.

---

## 🎮 How to Use

| Action              | How                                                |
| ------------------- | -------------------------------------------------- |
| Start a calculation | Type the expression or click buttons               |
| Evaluate expression | Press `Enter` or click `=`                         |
| Clear expression    | Press `Esc` or click `AC`                          |
| Backspace           | Press `⌫` or click the backspace button            |
| Negate expression   | Press `±` or use `(-num)`                          |
| Open History        | Click on a history entry to load it for re-editing |

---

## 💻 Key JavaScript Concepts

- **Tokenizer** — Splits input into numbers, operators, and parentheses
- **Shunting Yard Algorithm** — Converts infix expressions into Reverse Polish Notation (RPN)
- **RPN Evaluation** — Computes final result by walking through the postfix stack
- **Event Handling** — Keyboard events for digit input, operator selection, and control actions
- **localStorage** — History persistence, retaining previous calculations across sessions
- **Error Handling** — Error messages show if the expression is invalid, with a visual nudge for errors

---

## 🎨 Design Highlights

- **Glassmorphism UI** — Semi-transparent background and buttons with soft shadows
- **Vivid Color Palette** — Custom CSS properties for vibrant colors across the app
- **Responsive Layout** — Two-column layout that collapses into one column on smaller screens
- **Floating Orbs** — Subtle animations that give a painterly and lively feel to the app
- **CSS Animations** — Smooth hover effects and interactions for a modern user experience

---

## 📦 Dependencies

All loaded via CDN — no `npm install` required.

| Library                                           | Purpose    |
| ------------------------------------------------- | ---------- |
| [Google Fonts — Inter](https://fonts.google.com/) | Typography |
| [Font Awesome](https://fontawesome.com/)          | Icons      |

---

## 🛠️ Possible Improvements

- [ ] Dark mode toggle
- [ ] Cloud sync (e.g., Firebase for history persistence)
- [ ] Multi-line expression support
- [ ] Graphical plotting feature
- [ ] Scientific mode for more complex operations

---

## 🙌 Acknowledgements

- **Shunting Yard Algorithm** — For transforming infix notation to Reverse Polish Notation
- **Font Awesome** — Icon library used for buttons and controls
- **Google Fonts** — Typography source for a clean, modern look

---

> Built with ❤️ using pure HTML, CSS & JavaScript — no frameworks needed.
