let applications = "";

async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : []);
    });
  });
}

(() => {
  async function init() {
    applications = await fetchApplications();
    console.log("applications", applications);
  }

  init();
})();

const callback = function (mutationsList, observer) {
  const urlParams = new URLSearchParams(window.location.search);
  const currentJobId = urlParams.get("currentJobId");
  for (const mutation of mutationsList) {
    if (mutation.target.classList.contains("jobs-apply-button")) {
      const button = mutation.target;

      if (!button.classList.contains("applied")) {
        button.classList.add("applied");
        button.style.backgroundColor = "red";
        button.addEventListener("click", async () => {
          console.log("click");

          applications = await fetchApplications();

          applications++;

          console.log(applications);
          chrome.storage.sync.set({ applications }, () => {
            console.log("Applications value incremented");

            // Send a message
            chrome.runtime.sendMessage({
              message: "applications_incremented",
              applications,
            });
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
    // Call the callback function
    console.log("callback fired");
    const observer = new MutationObserver(callback);
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
