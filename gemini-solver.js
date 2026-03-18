(function() {
    'use strict';

    // Prevent duplicate UI if the script is loaded multiple times
    if (document.getElementById('gemini-extension-container')) {
        console.log("Gemini UI is already active!");
        return;
    }

    // ==========================================
    // 1. CREATE THE USER INTERFACE
    // ==========================================
    const uiHtml = `
        <div id="gemini-extension-container" style="z-index: 999999; position: fixed; bottom: 20px; right: 20px; font-family: Arial, sans-serif;">
            
            <!-- Camouflaged Toggle Button (Looks like "Nộp bài") -->
            <div id="gemini-toggle-btn" style="display: none; background: #1a237e; color: white; padding: 11px 15px; border-radius: 4px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: 700; font-size: 14px; user-select: none; align-items: center; justify-content: center; gap: 8px;">
                <span>Nộp bài</span>
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7551 6.98177L16.7495 6.9793L1.73496 0.751726C1.60867 0.698868 1.47125 0.678138 1.33499 0.69139C1.19873 0.704642 1.06788 0.751462 0.954141 0.827664C0.833975 0.906403 0.735269 1.01378 0.666905 1.14014C0.598541 1.26649 0.562664 1.40787 0.5625 1.55153V5.53438C0.562567 5.73078 0.631146 5.92101 0.756417 6.07227C0.881688 6.22353 1.0558 6.32635 1.24875 6.36302L9.4377 7.87719C9.46988 7.8833 9.49891 7.90044 9.51981 7.92566C9.5407 7.95088 9.55213 7.98261 9.55213 8.01536C9.55213 8.04811 9.5407 8.07984 9.51981 8.10506C9.49891 8.13028 9.46988 8.14742 9.4377 8.15352L1.2491 9.6677C1.05621 9.70427 0.882103 9.80696 0.756776 9.95808C0.631449 10.1092 0.562746 10.2993 0.5625 10.4956V14.4792C0.562407 14.6164 0.596375 14.7514 0.661355 14.8723C0.726336 14.9931 0.820296 15.0959 0.934805 15.1714C1.07255 15.2629 1.2342 15.3118 1.39957 15.312C1.51454 15.3119 1.62833 15.2889 1.73426 15.2442L16.7484 9.05212L16.7551 9.04895C16.9572 8.9621 17.1294 8.8179 17.2504 8.63419C17.3714 8.45049 17.4359 8.23534 17.4359 8.01536C17.4359 7.79538 17.3714 7.58023 17.2504 7.39653C17.1294 7.21282 16.9572 7.06862 16.7551 6.98177Z" fill="white"></path></svg>
            </div>

            <!-- Main Panel -->
            <div id="gemini-helper-ui" style="width: 350px; background: #ffffff; border: 2px solid #1a237e; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden;">
                <div style="background: #1a237e; color: white; padding: 10px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                    <span>🤖 Gemini Exam Solver</span>
                    <span id="gemini-close" title="Hide Panel (Alt+Q)" style="cursor: pointer; padding: 0 5px; font-size: 16px;">✖</span>
                </div>
                <div style="padding: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <input type="password" id="gemini-api-key" placeholder="Enter Gemini API Key" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 100%; box-sizing: border-box;">
                    <button id="gemini-solve-btn" style="background: #F16022; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">Solve Current Question</button>
                    <div id="gemini-status" style="font-size: 12px; color: #666; display: none;">Processing...</div>
                    <div id="gemini-result" style="background: #f2f8ff; padding: 10px; border-radius: 4px; border: 1px solid #cce0ff; min-height: 80px; max-height: 200px; overflow-y: auto; font-size: 14px; white-space: pre-wrap;">Answers will appear here...</div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', uiHtml);

    // KEY LOGIC
    const keyInput = document.getElementById('gemini-api-key');
    if (window.geminiKey) {
        keyInput.value = window.geminiKey;
        localStorage.setItem('gemini_api_key_local', window.geminiKey);
    } else {
        const savedKey = localStorage.getItem('gemini_api_key_local');
        if(savedKey) keyInput.value = savedKey;
    }

    // UI TOGGLE LOGIC
    const mainPanel = document.getElementById('gemini-helper-ui');
    const toggleBtn = document.getElementById('gemini-toggle-btn');
    const closeBtn = document.getElementById('gemini-close');

    function hidePanel() {
        mainPanel.style.display = 'none';
        toggleBtn.style.display = 'flex'; // Uses flex to align the text and icon perfectly
    }

    function showPanel() {
        toggleBtn.style.display = 'none';
        mainPanel.style.display = 'flex';
    }

    closeBtn.addEventListener('click', hidePanel);
    toggleBtn.addEventListener('click', showPanel);

    // ANTI-CHEAT BYPASS KEYBOARD SHORTCUT: Alt + Q
    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'q') {
            e.preventDefault();
            e.stopPropagation();
            if (mainPanel.style.display === 'none') {
                showPanel();
            } else {
                hidePanel();
            }
        }
    }, true);

    document.getElementById('gemini-solve-btn').addEventListener('click', processCurrentQuestion);

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
                    resolve({ data: base64data, mime_type: blob.type });
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
            resultDiv.innerHTML = "<span style='color:red'>Please enter your Gemini API Key.</span>";
            return;
        }

        localStorage.setItem('gemini_api_key_local', apiKey);
        
        const activeQuestionEl = document.querySelector('.item-question[style*="display: block"]');
        if (!activeQuestionEl) {
            resultDiv.innerHTML = "<span style='color:red'>Could not find an active question on the screen.</span>";
            return;
        }

        statusDiv.style.display = 'block';
        statusDiv.innerText = 'Extracting data...';
        resultDiv.innerText = '';

        try {
            const titleEl = activeQuestionEl.querySelector('.title');
            const questionText = titleEl ? titleEl.innerText : "No text found";

            const optionEls = activeQuestionEl.querySelectorAll('.choice-info-val .radio label');
            let optionsText = "";
            optionEls.forEach((opt) => {
                optionsText += `${opt.innerText.trim()}\n`;
            });

            let fullPrompt = `You are an expert test solver. Please look at the following question and options, and tell me the correct answer. Provide a brief explanation.\n\nQuestion:\n${questionText}\n\nOptions:\n${optionsText}`;

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

            statusDiv.innerText = 'Sending to Gemini API...';
            const payload = {
                "contents": [{
                    "parts": [ {"text": fullPrompt}, ...imageParts ]
                }]
            };

            const MODEL_NAME = "gemini-2.5-flash"; 
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
               resultDiv.innerHTML += `<br><br><i>Note: Gemini 2.5 Flash might not be available. Edit your GitHub script to use <b>gemini-2.0-flash</b>.</i>`;
            }
        } finally {
            statusDiv.style.display = 'none';
        }
    }
})();
