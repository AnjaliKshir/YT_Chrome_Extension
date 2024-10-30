chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the page has finished loading and if the URL is a YouTube watch page
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParams = tab.url.split("?")[1];
        console.log("Inside BG.js!");
        
        // Get the video ID from the URL
        const urlParams = new URLSearchParams(queryParams);
        console.log("URL Parameters:", urlParams);

        // Send a message to the content script with the video ID
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParams.get("v")
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_BOOKMARK_URL") {
        const bookmarkUrl = chrome.runtime.getURL("assets/sunflw_bookmark.png");
        sendResponse({ bookmarkUrl: bookmarkUrl });
    }
    return true; // Keeps the message channel open for asynchronous response
});

