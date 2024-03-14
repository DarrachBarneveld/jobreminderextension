async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

function isDateToday(inputDate) {
  const todaysDate = new Date();
  todaysDate.setHours(0, 0, 0, 0);

  const inputDateWithoutTime = new Date(inputDate);
  inputDateWithoutTime.setHours(0, 0, 0, 0);

  return inputDateWithoutTime.getTime() === todaysDate.getTime();
}

async function fetchApplications() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applications"], (obj) => {
      resolve(obj["applications"] ? JSON.parse(obj["applications"]) : []);
    });
  });
}

const goalInput = document.getElementById("goalAmount");
const applicationElement = document.getElementById("applications");
const goalCount = document.getElementById("goalCount");
const applicationBtn = document.getElementById("applicationBtn");

document.addEventListener("DOMContentLoaded", async () => {
  const applications = await fetchApplications();
  const todaysApplications = applications.filter((application) =>
    isDateToday(application.date)
  );

  // Set goal input value from storage
  chrome.storage.sync.get(["goal"], (obj) => {
    goalInput.value = obj["goal"];
    goalCount.textContent = goalInput.value;
  });

  applicationElement.textContent = todaysApplications.length;
});

// Update applications goal
goalInput.addEventListener("change", async () => {
  let goal = goalInput.value;
  if (goal < 0) {
    goal = 0;
    goalInput.value = goal;
  }
  goalCount.textContent = goal;

  chrome.storage.sync.set({ goal });
});

async function createApplicationList(button) {
  let applications = await fetchApplications();

  const todaysApplications = applications.filter((application) =>
    isDateToday(application.date)
  );

  const list = document.querySelector(".list-group");
  if (list) {
    list.remove();
    return;
  }
  let listHtml = '<ul class="list-group list-group-flush">';

  todaysApplications.forEach((app) => {
    const time = new Date(app.date).toLocaleTimeString();

    listHtml += `
    <li class="list-group-item px-1 d-flex justify-content-between align-content-center">
    <span>${time}</span>
    <a
      href="https://www.linkedin.com/jobs//view/${app.id}/"
      target="_blank"
      class="link-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover"
      >${app.id}</a
    >
  </li>
  `;
  });

  listHtml += "</ul>";

  console.log(listHtml);

  button.insertAdjacentHTML("afterend", listHtml);
}

applicationBtn.addEventListener("click", async (e) => {
  createApplicationList(e.target);
});
