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

// function createAlarm() {
//   chrome.alarms.create("job_hunt", {
//     delayInMinutes: 0,
//     periodInMinutes: 1,
//   });
// }

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
