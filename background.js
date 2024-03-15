let applications;
let goal;

function isDateToday(inputDate) {
  const todaysDate = new Date();
  todaysDate.setHours(0, 0, 0, 0);

  const inputDateWithoutTime = new Date(inputDate);
  inputDateWithoutTime.setHours(0, 0, 0, 0);

  return inputDateWithoutTime.getTime() === todaysDate.getTime();
}

(() => {
  checkApplications();

  // Redirect to LinkedIn Jobs page when notification is clicked
  chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === "job_hunt") {
      chrome.tabs.create({ url: "https://www.linkedin.com/jobs/" });
    }
  });

  // Listens for tab updates and sends a message to content.js
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
      if (tab.url && !tab.url.includes("linkedin.com/jobs")) {
        checkApplications();
      } else {
        chrome.tabs
          .sendMessage(tabId, { message: "tab_updated" })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  });

  // Checks the URL of the tab and creates an alarm if the URL is not a LinkedIn Jobs page
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
      if (
        tab.url &&
        !tab.url.includes("linkedin.com/jobs") &&
        applications < goal
      ) {
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

      const newApplication = { date: new Date(), id: request.id };

      if (!applications.some((app) => app.id === newApplication.id)) {
        applications.push(newApplication);

        chrome.storage.sync.set({ applications: JSON.stringify(applications) });

        incrementApplicationsAlarm();
      } else {
        chrome.notifications.create(
          "already_applied",
          {
            type: "basic",
            iconUrl: "images/application.png",
            title: "You have already applied!",
            message: `Choose another job to apply for!`,
            silent: false,
          },
          (notificationId) => {
            console.log(`Notification ${notificationId} created.`);
          }
        );
      }
    }
    sendResponse(() => {
      return false;
    });
  });

  // Listens for the applications incremented alarm and creates a notification
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "applications_incremented") {
      if (applications.length >= goal) {
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
            message: `You have sent ${applications.length} applications today!`,
            silent: false,
          },
          (notificationId) => {
            console.log(`Notification ${notificationId} created.`);
          }
        );
      }
    }
  });
})();

// Fetch applications from storage
export async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : []);
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

  const todayApplications = applications.filter((application) =>
    isDateToday(application.date)
  );

  goal = await fetchApplicationGoal();

  if (todayApplications.length < goal) {
    // If the user has not reached their daily goal, create a notification
    createNotification();
  }
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

// Increments the applications incremented alarm
function incrementApplicationsAlarm() {
  chrome.alarms.create("applications_incremented", {
    delayInMinutes: 0,
  });
}

// Create an alarm to remind the user to apply for more jobs
function createJobHuntAlarm() {
  chrome.alarms.create("job_hunt", {
    delayInMinutes: 0,
  });
}
