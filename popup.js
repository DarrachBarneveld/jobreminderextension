export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

const testBtn = document.getElementById("testBtn");

testBtn.addEventListener("click", async () => {
  const response = await getActiveTabURL();

  console.log(response);
});
