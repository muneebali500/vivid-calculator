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
