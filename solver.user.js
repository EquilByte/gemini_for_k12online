// ==UserScript==
// @name         Gemini Exam Solver (k12online)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Uses Gemini 2.5 Flash to solve active questions on k12online.vn
// @author       Your Name
// @match        *://*.k12online.vn/*
// @grant        GM_xmlhttpRequest
// @connect      generativelanguage.googleapis.com
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. CREATE THE USER INTERFACE
    // ==========================================
    const uiHtml = `
        <div id="gemini-helper-ui" style="position: fixed; bottom: 20px; right: 20px; width: 350px; background: #ffffff; border: 2px solid #1a237e; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; font-family: Arial, sans-serif; display: flex; flex-direction: column; overflow: hidden;">
            <div style="background: #1a237e; color: white; padding: 10px; font-weight: bold; display: flex; justify-content: space-between;">
                <span>🤖 Gemini Exam Solver</span>
                <span id="gemini-close" style="cursor: pointer;">✖</span>
            </div>
            <div style="padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                <!-- API KEY INPUT: Stays strictly local in the browser -->
                <input type="password" id="gemini-api-key" placeholder="Enter Gemini API Key" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 100%; box-sizing: border-box;">
                <button id="gemini-solve-btn" style="background: #F16022; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">Solve Current Question</button>
                <div id="gemini-status" style="font-size: 12px; color: #666; display: none;">Processing...</div>
                <div id="gemini-result" style="background: #f2f8ff; padding: 10px; border-radius: 4px; border: 1px solid #cce0ff; min-height: 80px; max-height: 200px; overflow-y: auto; font-size: 14px; white-space: pre-wrap;">Answers will appear here...</div>
            </div>
        </div>
    `;

    // Only inject if it doesn't already exist and we are on an exam page
    function injectUI() {
        if(!document.getElementById('gemini-helper-ui')) {
            document.body.insertAdjacentHTML('beforeend', uiHtml);
            
            // Load saved API key from local storage
            const savedKey = localStorage.getItem('gemini_api_key_local');
            if(savedKey) document.getElementById('gemini-api-key').value = savedKey;

            // UI Event Listeners
            document.getElementById('gemini-close').addEventListener('click', () => {
                document.getElementById('gemini-helper-ui').style.display = 'none';
            });

            document.getElementById('gemini-solve-btn').addEventListener('click', processCurrentQuestion);
        }
    }

    // Wait a brief moment for the site to load, then inject
    setTimeout(injectUI, 2000);

    // ==========================================
    // 2. LOGIC TO EXTRACT DATA & CALL API
    // ==========================================

    async function urlToBase64(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    const mimeType = blob.type;
                    resolve({ data: base64data, mime_type: mimeType });
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn("Could not fetch image due to CORS:", url);
            return null;
        }
    }

    async function processCurrentQuestion() {
        const apiKey = document.getElementById('gemini-api-key').value.trim();
        const resultDiv = document.getElementById('gemini-result');
        const statusDiv = document.getElementById('gemini-status');

        if (!apiKey) {
            resultDiv.innerHTML = "<span style='color:red'>Please enter your Gemini API Key first.</span>";
            return;
        }

        // Save key LOCALLY in the browser for future use
        localStorage.setItem('gemini_api_key_local', apiKey);

        // Find active question
        const activeQuestionEl = document.querySelector('.item-question[style*="display: block"]');
        
        if (!activeQuestionEl) {
            resultDiv.innerHTML = "<span style='color:red'>Could not find an active question on the screen.</span>";
            return;
        }

        statusDiv.style.display = 'block';
        statusDiv.innerText = 'Extracting data...';
        resultDiv.innerText = '';

        try {
            // Extract Text
            const titleEl = activeQuestionEl.querySelector('.title');
            const questionText = titleEl ? titleEl.innerText : "No text found";

            const optionEls = activeQuestionEl.querySelectorAll('.choice-info-val .radio label');
            let optionsText = "";
            optionEls.forEach((opt) => {
                optionsText += `${opt.innerText.trim()}\n`;
            });

            let fullPrompt = `You are an expert test solver. Please look at the following question and options, and tell me the correct answer. Provide a brief explanation.\n\nQuestion:\n${questionText}\n\nOptions:\n${optionsText}`;

            // Extract Images
            const imgElements = activeQuestionEl.querySelectorAll('img');
            let imageParts = [];
            
            if (imgElements.length > 0) {
                statusDiv.innerText = `Processing ${imgElements.length} image(s)...`;
                for (let img of imgElements) {
                    if (img.src) {
                        const base64Img = await urlToBase64(img.src);
                        if (base64Img) {
                            imageParts.push({
                                "inline_data": {
                                    "mime_type": base64Img.mime_type,
                                    "data": base64Img.data
                                }
                            });
                        }
                    }
                }
            }

            // Construct payload
            statusDiv.innerText = 'Sending to Gemini API...';
            const payload = {
                "contents": [{
                    "parts": [
                        {"text": fullPrompt},
                        ...imageParts 
                    ]
                }]
            };

            const MODEL_NAME = "gemini-2.5-flash"; 
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || "API Request Failed");
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                const answer = data.candidates[0].content.parts[0].text;
                resultDiv.innerHTML = answer.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            } else {
                resultDiv.innerHTML = "Gemini returned an empty response.";
            }

        } catch (error) {
            console.error(error);
            resultDiv.innerHTML = `<span style='color:red'>Error: ${error.message}</span>`;
            if(error.message.includes("models/gemini-2.5-flash is not found")) {
               resultDiv.innerHTML += `<br><br><i>Note: Gemini 2.5 Flash might not be available yet. Edit the script to use <b>gemini-2.0-flash</b> or <b>gemini-1.5-flash</b> instead.</i>`;
            }
        } finally {
            statusDiv.style.display = 'none';
        }
    }
})();
