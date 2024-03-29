(() => {
  async function init() {
    // chrome.storage.sync.clear(() => {
    //   console.log("Storage cleared");
    // });
  }

  init();
})();

const callback = function (mutationsList, observer) {
  const urlParams = new URLSearchParams(window.location.search);
  const currentJobId = urlParams.get("currentJobId");

  for (const mutation of mutationsList) {
    if (mutation.target.classList.contains("jobs-apply-button")) {
      const button = mutation.target;

      if (!button.classList.contains("application-tracker-button")) {
        button.classList.add("application-tracker-button");
        button.addEventListener("click", async () => {
          chrome.runtime.sendMessage({
            message: "applications_incremented",
            id: currentJobId,
          });
        });
      }

      observer.disconnect();
      return;
    }
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "tab_updated") {
    const observer = new MutationObserver(callback);
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
