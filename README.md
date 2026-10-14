# JobIntel

JobIntel is a Chrome side-panel extension for understanding job listings while you browse. It summarizes roles, compares requirements with your skills, highlights gaps, and saves pages to a local shortlist.

## What it does

- Analyze the active webpage with Google Gemini.
- See a role-match score, matched skills, gaps, and suggested next steps.
- Save job listings and articles, revisit them, and export your shortlist as JSON.
- Keep your API key, skills, and saved pages in Chrome's local extension storage.

## Build

Requirements: Node.js 20 or later and npm.

```bash
npm ci
npm run build
```

The finished, self-contained Chrome extension is written to `out/`. Do not load the development server as the extension.

## Load in Chrome

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Choose **Load unpacked** and select this project's `out` folder.
3. Pin JobIntel from Chrome's Extensions menu, then click its toolbar icon to open the side panel.
4. Open **Settings**, add a [Google AI Studio API key](https://aistudio.google.com/app/apikey), and add the skills you want to compare against job listings.
5. Visit a job post or article and choose **Analyze this page**. The first time you analyze a site, allow JobIntel to access that site when Chrome prompts you.

Browser-internal pages and the Chrome Web Store cannot be analyzed. You can manage granted site access from JobIntel's **Details → Site access** controls on `chrome://extensions`.

## Publish to the Chrome Web Store

Run `npm run build`, then zip the **contents** of `out` (including `manifest.json`, `assets`, icons, and the generated background/content scripts). Upload that ZIP in the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/). Before submitting, prepare a store listing, screenshots, support contact, and a privacy policy that explains that page text is sent to Google Gemini for analysis and that the user's API key and saved pages are stored locally. Declare only the permissions the extension uses.

## Privacy

JobIntel sends the analyzed page text and the user's skill list to the Google Gemini API using the API key configured by that user. The extension does not include a shared API key or its own server. The API key, skills, and saved pages are stored in `chrome.storage.local` on the user's Chrome profile. The user should review Google's API and data policies before using the service.

## Development

```bash
npm run dev
npm run lint
```

`npm run dev` is for working on the UI in a browser; Chrome extension APIs are available only in the installed, built extension. `npm run build` compiles the extension scripts and statically exports the side panel.
# JobIntel-Chrome-extension
