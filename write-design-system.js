const fs = require('fs');

// SHARED DESIGN TOKENS — injected into every page via globals.css
const globals = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #080C12;
  --surface: #0F1420;
  --surface-2: #161C2D;
  --border: #1E2640;
  --green: #2ECC71;
  --green-dim: rgba(46,204,113,0.12);
  --green-border: rgba(46,204,113,0.25);
  --amber: #F0A500;
  --amber-dim: rgba(240,165,0,0.12);
  --red: #E74C3C;
  --red-dim: rgba(231,76,60,0.12);
  --blue: #3B82F6;
  --text: #F0F4FF;
  --text-2: #7B8DB0;
  --text-3: #3D4F6B;
  --usdc-blue: #2775CA;
  --eurc-navy: #003399;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

input, select, textarea, button {
  font-family: 'Inter', sans-serif;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Balance glow animation */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 0.3s ease forwards;
}

/* Card styles */
.zp-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
}

.zp-card-2 {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}

/* Button styles */
.zp-btn-primary {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: var(--green);
  color: #080C12;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.zp-btn-primary:hover { opacity: 0.9; }
.zp-btn-primary:disabled {
  background: var(--surface-2);
  color: var(--text-3);
  cursor: not-allowed;
}

.zp-btn-secondary {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
}

/* Input styles */
.zp-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
}

.zp-input:focus {
  border-color: var(--green-border);
}

/* Label */
.zp-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2);
  margin-bottom: 10px;
}

/* Badge */
.zp-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.zp-badge-green {
  background: var(--green-dim);
  border: 1px solid var(--green-border);
  color: var(--green);
}

.zp-badge-amber {
  background: var(--amber-dim);
  border: 1px solid rgba(240,165,0,0.25);
  color: var(--amber);
}

/* Token icon */
.zp-token-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

/* Divider */
.zp-divider {
  height: 1px;
  background: var(--border);
  margin: 16px 0;
}

/* Page wrapper */
.zp-page {
  min-height: 100vh;
  background: var(--bg);
  padding: 24px 16px 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.zp-content {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Nav */
.zp-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 20, 32, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0 22px;
  z-index: 100;
}

.zp-nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 20px;
  position: relative;
}

.zp-nav-tab.active .zp-nav-icon { color: var(--green); }
.zp-nav-tab.active .zp-nav-label { color: var(--green); }
.zp-nav-tab .zp-nav-icon { font-size: 20px; color: var(--text-3); }
.zp-nav-tab .zp-nav-label { font-size: 10px; font-weight: 600; color: var(--text-3); letter-spacing: 0.03em; }

.zp-nav-dot {
  position: absolute;
  top: -10px;
  width: 20px;
  height: 3px;
  background: var(--green);
  border-radius: 2px;
}

/* Action button grid item */
.zp-action-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 8px;
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s, background 0.2s;
}

.zp-action-btn:hover {
  border-color: var(--green-border);
  background: var(--surface-2);
}

.zp-action-btn .icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.zp-action-btn .label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
}

/* Spinner */
.zp-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--green);
  animation: spin 0.8s linear infinite;
}

/* Success / Error icons */
.zp-result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.zp-result-icon.success {
  background: var(--green-dim);
  border: 1px solid var(--green-border);
  color: var(--green);
}

.zp-result-icon.error {
  background: var(--red-dim);
  border: 1px solid rgba(231,76,60,0.25);
  color: var(--red);
}
`;

// Read existing globals.css and prepend our tokens
let existing = fs.readFileSync('app/globals.css', 'utf8');

// Remove old font imports if any
existing = existing.replace(/@import url\([^)]+\);\n?/g, '');

fs.writeFileSync('app/globals.css', globals + '\n' + existing);
console.log('✅ Design tokens written to globals.css');