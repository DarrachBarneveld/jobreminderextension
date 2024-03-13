async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : 0);
    });
  });
}

const goalInput = document.getElementById("goalAmount");
const applicationElement = document.getElementById("applications");

document.addEventListener("DOMContentLoaded", async () => {
  const applications = await fetchApplications();

  // Set goal input value from storage
  chrome.storage.sync.get(["goal"], (obj) => {
    goalInput.value = obj["goal"] || 0;
  });

  applicationElement.textContent = applications;
});

// Update applications goal
goalInput.addEventListener("change", async () => {
  const goal = goalInput.value;
  chrome.storage.sync.set({ goal });
});
