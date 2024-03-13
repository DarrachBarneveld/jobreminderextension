let applications = "";

async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : 0);
    });
  });
}

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
  console.log("callback fired");
  const currentJobId = urlParams.get("currentJobId");
  for (const mutation of mutationsList) {
    if (mutation.target.classList.contains("jobs-apply-button")) {
      const button = mutation.target;

      if (!button.classList.contains("applied")) {
        button.classList.add("applied");
        button.style.backgroundColor = "red";
        button.addEventListener("click", async () => {
          chrome.runtime.sendMessage({
            message: "applications_incremented",
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
    console.log("tab");
    const observer = new MutationObserver(callback);
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
