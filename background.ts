// background.ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureVisibleTab") {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (url) => {
        sendResponse({ screenshotUrl: url });
      });
      return true; // Indicates that the response is asynchronous
    }
  });
  