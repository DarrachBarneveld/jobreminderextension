let applications = 0;

// chrome.storage.local.get("jobsCount", function (data) {
//   let jobsCount = data.jobsCount || 0;
//   // Check if the count exceeds the limit
//   if (jobsCount >= 5) {
//     // Do not create alarm or notifications if the daily limit is reached
//     return;
//   }
//   // Create alarm and notification
//   createAlarm();
//   createNotification();
// });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   chrome.notifications.create(
//     "job_hunt",
//     {
//       type: "basic",
//       iconUrl: "/images/jobapplication.jpg",
//       title: "Daily Goal Not Reached!",
//       message: "Apply For More Jobs Now!",
//       silent: false,
//     },
//     (notificationId) => {
//       if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError.message);
//       } else {
//         console.log(`Notification ${notificationId} created.`);
//       }
//     }
//   );
// });

// chrome.notifications.onClicked.addListener((notificationId) => {
//   if (notificationId === "job_hunt") {
//     chrome.tabs.create({ url: "https://www.linkedin.com/jobs/" });
//   }
// });

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.time) createAlarm();

//   sendResponse(false);
// });

// function createNotification() {
//   chrome.notifications.create(
//     "job_hunt",
//     {
//       type: "basic",
//       iconUrl: "/images/jobapplication.jpg",
//       title: "Daily Goal Not Reached!",
//       message: "Apply For More Jobs Now!",
//       silent: false,
//     },
//     (notificationId) => {
//       if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError.message);
//       } else {
//         console.log(`Notification ${notificationId} created.`);
//       }
//     }
//   );
// }

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   console.log(tab.url);
//   if (tab.url && tab.url.includes("linkedin.com/jobs")) {
//     console.log("Not on LinkedIn Jobs Page");

//     createAlarm();
//   }
// });

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.tabs.sendMessage(tabId, { message: "tab_updated" });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == "applications_incremented") {
    applications = request.applications;
    incrementApplicationsAlarm();
  }

  sendResponse(() => {
    return false;
  });
});

function incrementApplicationsAlarm() {
  chrome.alarms.create("applications_incremented", {
    delayInMinutes: 0,
    periodInMinutes: 1,
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
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
});
