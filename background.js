let applications;

(async () => {
  applications = await fetchApplications();

  console.log("Total applications:", applications);

  console.log(applications);

  if (applications >= 5) {
    createAlarm();
    createNotification();
  }
})();

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "job_hunt") {
    chrome.tabs.create({ url: "https://www.linkedin.com/jobs/" });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.time) createAlarm();

  sendResponse(false);
});

function createAlarm() {
  chrome.alarms.create("job_hunt", {
    delayInMinutes: 0,
    periodInMinutes: 1,
  });
}

function createNotification() {
  chrome.notifications.create(
    "job_hunt",
    {
      type: "basic",
      iconUrl: "/images/jobapplication.jpg",
      title: "Daily Goal Not Reached!",
      message: "Apply For More Jobs Now!",
      silent: false,
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log(`Notification ${notificationId} created.`);
      }
    }
  );
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url && !tab.url.includes("linkedin.com/jobs")) {
    createAlarm();
  }
});

async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : 0);
    });
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.tabs.sendMessage(tabId, { message: "tab_updated" });
});

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.message == "applications_incremented") {
    applications = await fetchApplications();

    applications++;

    chrome.storage.sync.set({ applications });

    incrementApplicationsAlarm();
  }

  sendResponse(() => {
    return false;
  });
});

function incrementApplicationsAlarm() {
  chrome.alarms.create("applications_incremented", {
    delayInMinutes: 0,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "applications_incremented") {
    chrome.notifications.create(
      "applications_incremented",
      {
        type: "basic",
        iconUrl: "/images/jobapplication.jpg",
        title: "Application Sent",
        message: `You have sent ${applications} applications today!`,
        silent: false,
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log(`Notification ${notificationId} created.`);
        }
      }
    );
  }
});
