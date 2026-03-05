/* Vivid Calc — Expression Parser
   - Tokenize -> Shunting Yard -> RPN eval
   - Operators: + - * / % ^, parentheses
   - Unary minus supported
   - Keyboard support + history
*/

const exprEl = document.getElementById("expr");
const miniEl = document.getElementById("mini");
const keysEl = document.getElementById("keys");
const histList = document.getElementById("histList");
const clearHistBtn = document.getElementById("clearHist");

const HIST_KEY = "vivid_calc_history_v1";

let expr = "0";
let history = loadHistory();

render();

keysEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const v = btn.dataset.value;
  const action = btn.dataset.action;

  if (v != null) inputValue(v);
  else if (action) doAction(action);
});

clearHistBtn.addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
  setMini("History cleared");
});

document.addEventListener("keydown", (e) => {
  const k = e.key;

  // prevent page scroll with space
  if (k === " ") e.preventDefault();

  if ((k >= "0" && k <= "9") || k === ".") return inputValue(k);
  if (
    k === "+" ||
    k === "-" ||
    k === "*" ||
    k === "/" ||
    k === "%" ||
    k === "^"
  )
    return inputValue(k);
  if (k === "(" || k === ")") return inputValue(k);

  if (k === "Enter") return doAction("eval");
  if (k === "Backspace") return doAction("back");
  if (k === "Escape") return doAction("clear");
});

function doAction(action) {
  if (action === "clear") {
    expr = "0";
    setMini("Cleared");
    return render();
  }
  if (action === "back") {
    if (expr.length <= 1) expr = "0";
    else expr = expr.slice(0, -1);
    setMini("Backspace");
    return render();
  }
  if (action === "neg") {
    // Toggle unary minus at end: if last token is number -> wrap as (-num)
    // Simple approach: prepend '-' if expression is "0" or starts with number/(
    if (expr === "0") expr = "-";
    else expr += "*-1";
    setMini("Negate");
    return render();
  }
  if (action === "eval") {
    return evaluate();
  }
}

function inputValue(v) {
  if (expr === "0") {
    // starting new expr
    if (isOp(v) && v !== "-") return; // don't start with +,*,...
    expr = v;
  } else {
    // avoid double operator (except unary minus usage, which is handled by parser)
    const last = expr.slice(-1);
    if (isOp(last) && isOp(v) && !(v === "-" && (last === "(" || isOp(last)))) {
      expr = expr.slice(0, -1) + v;
    } else {
      expr += v;
    }
  }
  setMini("Typing…");
  render();
}

function evaluate() {
  try {
    const value = evalExpression(expr);
    const out = formatNumber(value);

    history.unshift({ expr, out, at: Date.now() });
    history = history.slice(0, 30);
    saveHistory();

    expr = out;
    setMini("OK");
    render();
    renderHistory();
  } catch (err) {
    setMini("Error: " + err.message);
    bumpError();
  }
}

function render() {
  exprEl.textContent = expr;
  renderHistory();
}

function setMini(text) {
  miniEl.textContent = text;
}

function bumpError() {
  // small visual nudge (no CSS change needed)
  exprEl.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 220, iterations: 1 },
  );
}

function renderHistory() {
  histList.innerHTML = "";
  if (history.length === 0) {
    const div = document.createElement("div");
    div.className = "histRes";
    div.textContent = "No history yet. Evaluate something!";
    histList.appendChild(div);
    return;
  }

  for (const h of history) {
    const item = document.createElement("div");
    item.className = "histItem";
    item.innerHTML = `<div class="histExpr">${escapeHtml(
      h.expr,
    )}</div><div class="histRes">= ${escapeHtml(h.out)}</div>`;
    item.addEventListener("click", () => {
      expr = h.expr;
      setMini("Loaded from history");
      render();
    });
    histList.appendChild(item);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------- Expression Parser ---------------- */

function evalExpression(input) {
  const tokens = tokenize(input);
  const rpn = toRPN(tokens);
  return evalRPN(rpn);
}

function tokenize(s) {
  const tokens = [];
  let i = 0;

  while (i < s.length) {
    const c = s[i];

    if (c === " " || c === "\t" || c === "\n") {
      i++;
      continue;
    }

    // number
    if (isDigit(c) || c === ".") {
      let num = c;
      i++;
      while (i < s.length && (isDigit(s[i]) || s[i] === ".")) {
        num += s[i];
        i++;
      }
      if (num === ".") throw new Error("Invalid number");
      tokens.push({ type: "num", value: Number(num) });
      continue;
    }

    // operators and parens
    if (isOp(c) || c === "(" || c === ")") {
      tokens.push({ type: "sym", value: c });
      i++;
      continue;
    }

    throw new Error(`Unexpected: "${c}"`);
  }

  return tokens;
}

const OPS = {
  "+": { prec: 2, assoc: "L", fn: (a, b) => a + b },
  "-": { prec: 2, assoc: "L", fn: (a, b) => a - b },
  "*": { prec: 3, assoc: "L", fn: (a, b) => a * b },
  "/": { prec: 3, assoc: "L", fn: (a, b) => a / b },
  "%": { prec: 3, assoc: "L", fn: (a, b) => a % b },
  "^": { prec: 4, assoc: "R", fn: (a, b) => Math.pow(a, b) },
};

// handle unary minus by converting "-" into "u-" when appropriate
function toRPN(tokens) {
  const out = [];
  const stack = [];

  let prev = null;
  for (const t of tokens) {
    if (t.type === "num") {
      out.push(t);
      prev = t;
      continue;
    }

    const v = t.value;

    if (v === "(") {
      stack.push(t);
      prev = t;
      continue;
    }

    if (v === ")") {
      while (stack.length && stack[stack.length - 1].value !== "(") {
        out.push(stack.pop());
      }
      if (!stack.length) throw new Error("Mismatched parentheses");
      stack.pop(); // pop "("
      prev = t;
      continue;
    }

    // operator
    let op = v;

    // unary minus if start OR after another operator OR after "("
    const unary =
      op === "-" &&
      (prev == null ||
        (prev.type === "sym" && (prev.value === "(" || isOp(prev.value))));
    if (unary) op = "u-";

    while (stack.length) {
      const top = stack[stack.length - 1].value;

      if (top === "(") break;

      const o1 = getOp(op);
      const o2 = getOp(top);

      if (!o2) break;

      const cond =
        (o1.assoc === "L" && o1.prec <= o2.prec) ||
        (o1.assoc === "R" && o1.prec < o2.prec);

      if (cond) out.push(stack.pop());
      else break;
    }

    stack.push({ type: "op", value: op });
    prev = t;
  }

  while (stack.length) {
    const top = stack.pop();
    if (top.value === "(") throw new Error("Mismatched parentheses");
    out.push(top);
  }

  return out;
}

function getOp(op) {
  if (op === "u-") return { prec: 5, assoc: "R", fn: (a) => -a, unary: true };
  return OPS[op];
}

function evalRPN(rpn) {
  const st = [];

  for (const t of rpn) {
    if (t.type === "num") {
      st.push(t.value);
      continue;
    }

    const op = getOp(t.value);
    if (!op) throw new Error("Unknown operator");

    if (op.unary) {
      if (st.length < 1) throw new Error("Bad expression");
      const a = st.pop();
      st.push(op.fn(a));
    } else {
      if (st.length < 2) throw new Error("Bad expression");
      const b = st.pop();
      const a = st.pop();
      const res = op.fn(a, b);
      if (!Number.isFinite(res)) throw new Error("Math error");
      st.push(res);
    }
  }

  if (st.length !== 1) throw new Error("Bad expression");
  return st[0];
}

function isDigit(c) {
  return c >= "0" && c <= "9";
}
function isOp(c) {
  return (
    c === "+" || c === "-" || c === "*" || c === "/" || c === "%" || c === "^"
  );
}

function formatNumber(n) {
  // avoid 0.3000000000004 style outputs
  const rounded = Math.round((n + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
}

/* ---------------- History persistence ---------------- */
function loadHistory() {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function saveHistory() {
  localStorage.setItem(HIST_KEY, JSON.stringify(history));
}

// ===== Info Popup Logic =====
const POPUP_SESSION_KEY = "vivid_calc_popup_seen";
const overlay = document.getElementById("popupOverlay");
const closeBtn = document.getElementById("popupClose");
const ctaBtn = document.getElementById("popupCta");
const infoBtn = document.getElementById("infoBtn");

function openPopup() {
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePopup() {
  overlay.classList.remove("active");
  document.body.style.overflow = "";
  sessionStorage.setItem(POPUP_SESSION_KEY, "1");
}

// Show on first visit this session
if (!sessionStorage.getItem(POPUP_SESSION_KEY)) {
  // Small delay so page renders first
  setTimeout(openPopup, 280);
}

// Info icon always opens it
infoBtn.addEventListener("click", openPopup);

// Close buttons
closeBtn.addEventListener("click", closePopup);
ctaBtn.addEventListener("click", closePopup);

// Click outside popup card to dismiss
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closePopup();
});

// Esc key also closes popup (separate from calc's Esc handler)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("active")) {
    closePopup();
  }
});
