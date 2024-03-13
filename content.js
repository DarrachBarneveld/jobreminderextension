(() => {
  let applications = "";

  async function fetchApplications() {
    return new Promise((resolve) => {
      chrome.storage.sync.get([applications], (obj) => {
        resolve(obj[applications] ? JSON.parse(obj[applications]) : []);
      });
    });
  }

  async function init() {
    const applications = await fetchApplications();
    console.log("applications", applications);
  }

  console.log("content.js is running");
  init();
})();

const callback = function (mutationsList, observer) {
  const urlParams = new URLSearchParams(window.location.search);
  const currentJobId = urlParams.get("currentJobId");
  for (const mutation of mutationsList) {
    if (
      mutation.target.tagName === "BUTTON" &&
      mutation.target.getAttribute("data-job-id") === currentJobId
    ) {
      const button = mutation.target;

      if (!button.classList.contains("applied")) {
        button.classList.add("applied");
        button.style.backgroundColor = "red";
        button.addEventListener("click", () => {
          console.log("click");
        });
      }

      observer.disconnect();
      return;
    }
  }
};
const observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });
