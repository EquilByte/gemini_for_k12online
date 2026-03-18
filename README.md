# 🤖 Gemini Solver for K12Online

A lightweight browser script that integrates **Google Gemini AI** into K12Online exams to automatically analyze and suggest answers for the current question.

---

## ✨ Features

* 📌 Detects the current question automatically
* 🧠 Uses **Gemini AI** to generate answers + explanations
* 🖼️ Supports image-based questions
* 💾 Saves API key locally
* 🎛️ Simple floating UI (toggle with `Alt + Q`)
* 🔁 Prevents duplicate loading

---

## 🚀 How to Use

### 1. Get a Gemini API Key

* Go to Google AI Studio
* Generate your API key

---

### 2. Open your exam page (K12Online)

---

### 3. Open Browser Console

Press:

```bash
F12 → Console
```

---

### 4. Paste and Run This Code

```javascript
window.geminiKey = "YOUR_API_KEY_HERE";

fetch('https://raw.githubusercontent.com/EquilByte/gemini_for_k12online/main/gemini-solver.js?t=' + Date.now())
  .then(response => response.text())
  .then(code => {
      var s = document.createElement('script');
      s.textContent = code;
      document.body.appendChild(s);
      console.log("Gemini Solver loaded successfully!");
  })
  .catch(err => console.error("Failed to load script:", err));
```

---

### 5. Use the Tool

* A panel will appear at the bottom-right corner
* Click **"Solve Current Question"**
* AI-generated answer will appear instantly

---

## 🎮 Controls

| Action      | Shortcut        |
| ----------- | --------------- |
| Toggle UI   | `Alt + Q`       |
| Hide Panel  | Click ❌         |
| Show Button | Click "Nộp bài" |

---

## ⚙️ How It Works

* Extracts:

  * Question text
  * Answer choices
  * Images (if any)
* Sends data to Gemini API
* Displays:

  * ✅ Correct answer
  * 💡 Brief explanation

---

## ⚠️ Notes

* Default model:

  ```js
  gemini-2.5-flash
  ```

* If error occurs, switch to:

  ```js
  gemini-2.0-flash
  ```

* Works best on:

  * Multiple choice questions
  * Clear text/image content

---

## ❗ Disclaimer

This project is for **educational and research purposes only**.

Use responsibly. Misuse may violate your school's rules or platform policies.

---

## 📂 Project Structure

```
gemini_for_k12online/
│── gemini-solver.js
│── README.md
```

---

## 🛠️ Future Improvements

* Auto-detect question changes
* Batch solving
* Better UI/UX
* Support more platforms

---

## 👨‍💻 Author

**EquilByte**
