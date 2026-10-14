interface ExtractedPageData {
  title: string;
  url: string;
  text: string;
  isJobPosting: boolean;
}

function scrapePageContent(): ExtractedPageData {
  const pageTitle = document.title || '';
  const currentUrl = window.location.href;

  const jobContainerSelectors = [
    '.jobs-description',
    '.jobsearch-JobComponent',
    '[data-testid="job-description"]',
    '#jobDescriptionText',
    'main',
    'article'
  ];

  let rawText = '';

  for (const selector of jobContainerSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent && el.textContent.trim().length > 150) {
      rawText = el.textContent.trim();
      break;
    }
  }

  if (!rawText) {
    rawText = document.body ? document.body.innerText : '';
  }

  const cleanText = rawText
    .replace(/\s+/g, ' ')
    .slice(0, 10000);

  const isJobPosting =
    /requirements|responsibilities|qualifications|experience|skills|job/i.test(cleanText) ||
    /linkedin\.com\/jobs|indeed\.com|wellfound\.com/i.test(currentUrl);

  return {
    title: pageTitle,
    url: currentUrl,
    text: cleanText,
    isJobPosting
  };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'EXTRACT_PAGE_DATA') {
    const data = scrapePageContent();
    sendResponse(data);
  }
  return false;
});