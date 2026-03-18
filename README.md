# Gemini Exam Solver

A client-side browser script that uses the Gemini API to analyze and solve multiple-choice questions (including images) directly on the screen. 

## 🔒 Security & Privacy
**Your API Key is 100% safe.** 
This script does not hardcode your API key. You enter your API key directly into the user interface on the webpage. The key is saved to your browser's local `localStorage` so you don't have to type it in every time, and is sent directly to Google's servers.

## 🚀 How to Install
1. Install a Userscript manager extension in your browser (e.g., [Tampermonkey](https://www.tampermonkey.net/)).
2. Click on the `solver.user.js` file in this repository.
3. Click the **"Raw"** button on GitHub. Tampermonkey will automatically ask if you want to install it.
4. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## 🛠️ Usage
1. Navigate to your exam portal.
2. The Gemini UI will automatically appear in the bottom right corner of your screen.
3. Paste your Gemini API key into the input field.
4. Click **"Solve Current Question"**. The script will read the active question, extract any images, and provide the answer.

## ⚙️ Changing the Model
By default, the script looks for `gemini-2.5-flash`. If that model version is not available, you can edit the script locally in Tampermonkey and change the `MODEL_NAME` variable to `gemini-2.0-flash` or `gemini-1.5-flash`.
