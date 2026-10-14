chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('Side panel behavior error:', error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('JobIntel Extension installed successfully.');
});