const handleOpenSidePanel = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      console.error("No active tab found");
      return;
    }

    const currentTabId = tabs[0].id;
    try {
      chrome.sidePanel.open({ tabId: currentTabId });
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "captureVisibleTab":
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (url) => {
        sendResponse({ screenshotUrl: url });
      });
      return true;

    case "openSidePanel":
      handleOpenSidePanel();
      sendResponse({ success: true });
      return true;
    default:
      break;
  }
});
