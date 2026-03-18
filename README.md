# Gemini Exam Solver (Dynamic Inject Version)

A script hosted on GitHub that injects a Gemini API solver interface directly into exam portals. 

## 🔒 Security
**This repository does not contain API keys.** The API key is securely provided through the browser console locally, ensuring your credentials are never leaked.

## 🚀 How to Use

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Go to your exam portal and open the Developer Tools (Press `F12` -> `Console` tab).
3. Copy the 4 lines of code below, replace `"YOUR_API_KEY"` with your actual key, and hit **Enter**.

\`\`\`javascript
window.geminiKey = "YOUR_API_KEY";
var s = document.createElement('script');
s.src = '[https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME@main/gemini-solver.js](https://raw.githubusercontent.com/EquilByte/gemini_for_k12online/refs/heads/main/gemini-solver.js)';
document.body.appendChild(s);
\`\`\`

4. A floating UI will appear in the bottom right corner.
5. Click **"Solve Current Question"**. The script will automatically read the question, extract any images, and call Gemini.

*(Note: Once you do this once, the key is saved in your browser. On your next exam, you can skip `window.geminiKey` and just run the `script` loader lines).*
