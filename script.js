const form = document.getElementById("poll-form");
const result = document.getElementById("result");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const choice = new FormData(form).get("vote");
  if (!choice) {
    result.textContent = "Pick an option before submitting.";
    return;
  }

  result.textContent = `Thanks for voting: ${choice}`;
});
