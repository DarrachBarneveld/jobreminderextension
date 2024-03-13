let applications;
let goal;

(() => {
  checkApplications();
})();

// Fetch applications from storage
async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : 0);
    });
  });
}

// Fetch goal from storage
async function fetchApplicationGoal() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["goal"], (obj) => {
      resolve(obj["goal"] ? JSON.parse(obj["goal"]) : 0);
    });
  });
}

async function checkApplications() {
  applications = await fetchApplications();
  goal = await fetchApplicationGoal();

  console.log("Total applications:", applications);

  console.log(applications < goal);

  if (applications < goal) {
    // If the user has not reached their daily goal, create a notification
    createAlarm();
    createNotification();
  }
}

// Redirect to LinkedIn Jobs page when notification is clicked
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "job_hunt") {
    chrome.tabs.create({ url: "https://www.linkedin.com/jobs/" });
  }
});

// Create an alarm to remind the user to apply for more jobs
function createAlarm() {
  chrome.alarms.create("job_hunt", {
    delayInMinutes: 0,
  });
}

// Create LinkedIn Jobs page notification
function createNotification() {
  chrome.notifications.create(
    "job_hunt",
    {
      type: "basic",
      iconUrl: "images/application.png",
      title: "Daily Goal Not Reached!",
      message: "Apply For More Jobs Now!",
      silent: false,
    },
    (notificationId) => {
      console.log(`Notification ${notificationId} created.`);
    }
  );
}

// Checks the URL of the tab and creates an alarm if the URL is not a LinkedIn Jobs page
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    if (
      tab.url &&
      !tab.url.includes("linkedin.com/jobs") &&
      applications < goal
    ) {
      createNotification();
    }
  }
});

// Listens for tab updates and sends a message to content.js
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { message: "tab_updated" });
    if (tab.url && !tab.url.includes("linkedin.com/jobs")) {
      checkApplications();
    }
  }
});

// Listens for messages from content.js and increments the applications count
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

// Increments the applications incremented alarm
function incrementApplicationsAlarm() {
  chrome.alarms.create("applications_incremented", {
    delayInMinutes: 0,
  });
}

// Listens for the applications incremented alarm and creates a notification
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "applications_incremented") {
    if (applications >= goal) {
      chrome.notifications.create(
        "applications_incremented",
        {
          type: "basic",
          iconUrl: "images/application.png",
          title: "Goal Reached!",
          message: `You have sent enough applications today!`,
          silent: false,
        },
        (notificationId) => {
          console.log(`Notification ${notificationId} created.`);
        }
      );
    } else {
      chrome.notifications.create(
        "applications_incremented",
        {
          type: "basic",
          iconUrl: "images/application.png",
          title: "Application Sent",
          message: `You have sent ${applications} applications today!`,
          silent: false,
        },
        (notificationId) => {
          console.log(`Notification ${notificationId} created.`);
        }
      );
    }
  }
});
