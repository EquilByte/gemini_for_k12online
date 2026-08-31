# Gemini Assistant Prototype for K12Online

A browser-based proof of concept that reads the currently visible question from a page matching a specific K12Online DOM structure, sends the extracted text and available images to the Google Gemini API, and displays the model response in an injected panel.

> [!IMPORTANT]
> Use this project only with content and systems you own, control, or have explicit permission to test. It is not intended for active, graded, proctored, or restricted assessments. Do not use it to conceal AI assistance, bypass monitoring, evade platform controls, or submit generated work as your own.

## Table of contents

- [Purpose and scope](#purpose-and-scope)
- [Responsible use](#responsible-use)
- [What the script does](#what-the-script-does)
- [What the script does not do](#what-the-script-does-not-do)
- [Data flow](#data-flow)
- [DOM assumptions](#dom-assumptions)
- [Project structure](#project-structure)
- [Authorized evaluation](#authorized-evaluation)
- [API-key handling](#api-key-handling)
- [Privacy and data protection](#privacy-and-data-protection)
- [Security considerations](#security-considerations)
- [Reliability limitations](#reliability-limitations)
- [Development notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

## Purpose and scope

This repository contains a single JavaScript file, `gemini-solver.js`. It demonstrates several browser-development techniques:

- Adding a small interface to an existing page
- Locating content with CSS selectors
- Collecting visible question text and multiple-choice labels
- Fetching images and converting them to base64 data
- Constructing a multimodal Gemini request
- Calling a remote API with `fetch()`
- Displaying asynchronous status, errors, and model output
- Preventing the interface from being added twice

Appropriate contexts include a local mock page, an instructor-approved demonstration, accessibility research, or testing performed by the owner or administrator of the relevant system. Authorization should be specific and obtained before the script is run.

This project is not a browser extension, standalone web application, package, or server. It has no build system and cannot operate meaningfully without a host page that matches the expected document structure.

## Responsible use

Use the project only when all of the following are true:

1. You have permission to access and test the page.
2. The content is your own, is public practice material, or has been approved for the test.
3. Sending the content to an external AI service is allowed.
4. AI assistance is permitted for the activity.
5. You understand that generated output may be incorrect.
6. You review the data before it leaves the browser.

Do not use this project:

- During an active graded or proctored assessment
- To obtain answers where AI assistance is prohibited
- To disguise the presence of an assistant or imitate platform controls
- To bypass anti-cheat, monitoring, access-control, or submission safeguards
- On another person's account or data
- With confidential questions, student records, or personally identifying information
- In a way that conflicts with school rules, platform terms, or applicable law

The interface includes hide/show behavior and a keyboard shortcut. Those controls should be treated as ordinary interface behavior in an authorized test environment, never as a way to evade supervision or platform protections.

## What the script does

When loaded into a compatible page, the script:

1. Checks for an element with the ID `gemini-extension-container` and stops if an instance already exists.
2. Adds a fixed-position panel to the current document.
3. Accepts a Gemini API key through a password input.
4. Reads a key from `window.geminiKey`, when present, or from the page origin's `localStorage`.
5. Searches for the active question using a fixed CSS selector.
6. Extracts the question title and visible choice labels.
7. Finds images inside the active question and attempts to fetch them.
8. Converts successfully fetched images to base64 inline data.
9. Builds a text-and-image request for the configured Gemini model.
10. Sends the request to the Gemini `generateContent` endpoint.
11. Displays the first returned candidate or an error message in the panel.

The configured model name in the current source is `gemini-2.5-flash`.

### Interface controls

| Control | Current behavior |
| --- | --- |
| **Solve Current Question** | Starts extraction and sends a request when an API key and active question are available |
| Close icon | Hides the main panel and shows the compact toggle |
| Compact toggle | Restores the panel |
| `Alt+Q` | Toggles the panel's visible state |
| API-key field | Accepts the key used for the Gemini request |

## What the script does not do

The current implementation does not:

- Select an answer choice
- Submit an answer or an assessment
- Change the platform's stored answer data
- Navigate between questions
- Detect question changes automatically
- Process a batch of questions
- Apply mathematical operator or subject-specific validation
- Verify a generated answer against an authoritative source
- Provide a server-side proxy for API credentials
- Include automated tests
- Include a package manager or dependency manifest
- Implement a fallback model automatically

These boundaries matter because a displayed model response is only a suggestion. It is not proof that an answer is correct.

## Data flow

```text
Compatible test page
        |
        | question text, choice labels, image URLs
        v
gemini-solver.js in the browser
        |
        | text prompt and base64 image data
        v
Google Gemini generateContent API
        |
        | generated response or API error
        v
Injected result panel
```

The page content is processed in the browser, but the constructed prompt and successfully fetched image data are transmitted to Google's API. The repository does not include a backend or an intermediate application server.

## DOM assumptions

The implementation depends on specific CSS selectors:

| Selector | Expected content |
| --- | --- |
| `.item-question[style*="display: block"]` | The currently active question container |
| `.title` | Question text inside the active container |
| `.choice-info-val .radio label` | Multiple-choice option labels |
| `img` | Images nested inside the active question |

A page update can break extraction even when the visible interface appears similar. In particular, the active-question selector looks for the literal text `display: block` inside an inline `style` attribute. A class-based state, a different spacing or display value, or a rendered component without that inline style will not match.

If no active question matches, the script reports that it could not find one. If the title is missing, it uses the text `No text found`. If option selectors do not match, the request is sent with an empty options section.

## Project structure

```text
gemini_for_k12online/
├── README.md
└── gemini-solver.js
```

| File | Role |
| --- | --- |
| `gemini-solver.js` | Complete UI, DOM extraction, image conversion, API request, and response-display logic |
| `README.md` | Project scope, behavior, limitations, and responsible-use documentation |

## Authorized evaluation

Do not evaluate this script against a live assessment. Use an isolated mock page or an administrator-provided testing environment containing non-sensitive sample content.

Before any evaluation:

1. Read the complete JavaScript source.
2. Confirm that the environment owner has authorized the test.
3. Confirm that sample content may be sent to the Gemini API.
4. Use a restricted test API key rather than a personal production credential.
5. Remove student names, IDs, grades, session tokens, and other sensitive data.
6. Keep the browser developer tools open so outgoing requests and errors can be reviewed.
7. Verify results manually against known sample answers.

Suggested test cases for maintainers include:

- A text-only question with several choice labels
- A question containing one same-origin image
- A question containing an image blocked by CORS
- A page with no matching active question
- A missing or invalid API key
- A non-success API response
- An API response with no candidates
- Loading the script twice
- A long generated response that requires panel scrolling

Testing should confirm extraction and error handling, not the model's factual accuracy.

## API-key handling

The current code handles credentials entirely in the browser:

- A key assigned to `window.geminiKey` is copied into the input.
- The key is stored under `gemini_api_key_local` in `localStorage`.
- A key typed into the panel is stored when a request begins.
- The key is included in the Gemini request URL.

This design has important risks:

- `localStorage` is readable by JavaScript running on the same origin.
- Page scripts, browser extensions, shared browser profiles, and developer tools may expose the key.
- Requests and error reports may reveal the request URL.
- A key can incur quota use or charges if copied by someone else.

For authorized testing:

- Use a separate, restricted key with the minimum required access.
- Apply provider-supported API restrictions and quota limits.
- Do not commit a real key to this repository.
- Do not paste a key into screenshots, issues, logs, or pull requests.
- Clear the `gemini_api_key_local` value after testing.
- Revoke and replace any key that may have been exposed.
- Do not use this client-side pattern for a production application.

The repository does not provide a secure backend credential flow.

## Privacy and data protection

Before selecting the action that sends a request, understand what may leave the page:

- Question text
- Multiple-choice labels
- Images contained within the active question
- Text visible inside those selected elements

Images are fetched by URL and embedded as base64 data when the browser permits access. This can include information not obvious from the surrounding text.

Do not process student records, names, identifiers, grades, private classroom material, unreleased assessments, or copyrighted content that you are not allowed to transmit. Obtain the content owner's permission and follow the relevant institution's privacy requirements. Review the AI provider's current data handling and retention terms before using any real content.

The script does not provide consent collection, redaction, retention controls, audit logging, or a preview of the final payload.

## Security considerations

Running JavaScript inside an authenticated page is inherently sensitive. The script shares the page's browser context and can interact with the DOM and origin storage available to it.

Review the exact source before running it. Avoid instructions that download and execute the latest remote version without inspection, because repository content can change between reviews.

Additional considerations in the current implementation:

- Model output is inserted with `innerHTML` after a limited bold-text replacement. Treat all generated output as untrusted and evaluate only in an isolated test environment.
- API errors are displayed in the panel and logged to the console. Avoid sharing logs without checking them for sensitive information.
- Image fetching depends on browser CORS rules. Failed images are skipped and their URLs are logged as warnings.
- The global `window.geminiKey` value and origin `localStorage` are not secure secret stores.
- The script uses a very high `z-index` and modifies the host document. It can overlap or interfere with page controls.

This repository should not be treated as a security control or production integration.

## Reliability limitations

Generated answers can be incomplete, misleading, or wrong. The script does not provide citations, confidence scoring, fact checking, or deterministic output.

Implementation-specific limitations include:

- Fixed selectors tied to one expected page structure
- Whole question detection based on an inline display style
- Choice extraction limited to label text under the expected radio markup
- Image processing failures when CORS or authentication prevents fetching
- Dependence on the configured model being available for the supplied key and API version
- Use of only the first candidate and first response part
- No retry, timeout, cancellation, or rate-limit backoff
- No handling for streamed responses
- No automatic model fallback
- No validation of image MIME type or size before request construction
- No automated compatibility or regression tests

Model names, quotas, availability, and API behavior may change independently of this repository. Check the provider's current documentation before an authorized test.

## Development notes

The project has no installation or build step. All behavior is contained in an immediately invoked function expression in `gemini-solver.js`.

Major implementation areas are organized in this order:

1. Duplicate-load guard
2. Injected interface markup
3. API-key loading and persistence
4. Panel visibility controls
5. Image fetching and base64 conversion
6. Active-question extraction
7. Gemini request construction
8. Response and error rendering

When maintaining the project:

- Keep selectors documented and isolated where practical.
- Avoid UI text or styling that could be mistaken for a platform control.
- Remove concealment or evasion-oriented comments and behavior.
- Add an explicit payload preview before transmission.
- Replace persistent client-side key storage with a safer design.
- Render model output as text rather than trusting HTML.
- Add tests using synthetic, non-sensitive fixtures.
- Preserve visible notices about authorized use and external data transfer.

## Contributing

Contributions should improve safety, transparency, privacy, accessibility, or reliability. Do not submit features intended to hide the tool, bypass controls, automate restricted assessments, or weaken platform safeguards.

A contribution should:

1. Explain the authorized use case.
2. Avoid real student or assessment data.
3. Document any new selector or transmitted field.
4. Include a safe test procedure using synthetic fixtures.
5. Describe credential and privacy implications.
6. Keep generated output visibly identified as AI-produced.
7. Update this README when behavior changes.

## License

No license file is currently included in this repository. The public availability of source code does not by itself grant permission to copy, modify, or redistribute it. Add an explicit license before accepting or encouraging reuse.
