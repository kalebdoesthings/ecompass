// Load saved data when page loads

document.addEventListener("DOMContentLoaded", function() {
document.getElementById("where-am-i-at").addEventListener("change", function() {
    document.getElementById("custom-from").style.display = this.value === "Other" ? "block" : "none";
});

document.getElementById("where-am-i-going").addEventListener("change", function() {
    document.getElementById("custom-to").style.display = this.value === "Other" ? "block" : "none";
});





});






window.addEventListener('load', function() {
  document.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.id && localStorage.getItem(field.id)) {
      field.value = localStorage.getItem(field.id);
    }
  });

  // After restoring, show textareas if "Other" was saved
  if (document.getElementById('where-am-i-at').value === 'Other') {
      document.getElementById('custom-from').style.display = 'block';
  }
  if (document.getElementById('where-am-i-going').value === 'Other') {
      document.getElementById('custom-to').style.display = 'block';
  }
});

// Auto-save as user types
document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', function() {
    if (this.id) localStorage.setItem(this.id, this.value);
  });

  field.addEventListener('change', function() {
    if (this.id) localStorage.setItem(this.id, this.value);
  });
});

// Handle form submission
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const whereAmIAt = document.getElementById('where-am-i-at');
  const whereAmIGoing = document.getElementById('where-am-i-going');


 const studentId = document.getElementById('student-id').value;
  const partnerId = document.getElementById('partner-id').value;

  if (!studentId || !partnerId || !whereAmIAt.value || !whereAmIGoing.value) {
    return showNotification("Error", "Please fill out all fields", false);
  }


  // Send data to Flask
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: document.getElementById('student-id').value,
      partner_id: document.getElementById('partner-id').value,
      where_am_i_at: whereAmIAt.value,
      where_am_i_going: whereAmIGoing.value
    })
  })
 .then(res => res.json())
  .then((data) => {
    if (data.status === "error") {
      return showNotification("Error", data.message, false);
    }
    whereAmIAt.value = whereAmIGoing.value;
    whereAmIGoing.value = '';
    document.querySelectorAll('input, select').forEach(field => {
      if (field.id) localStorage.setItem(field.id, field.value);
    });
    showNotification("Submitted", "Pass logged successfully", true);
    localStorage.setItem("passStatus", "Active")
  })



function showNotification(result, subresult, success) {
  var notification = document.createElement("div");
  document.body.appendChild(notification);

  var h1 = document.createElement("h1");
  var h2 = document.createElement("h2");
  h1.textContent = result;
  h2.textContent = subresult;
  notification.appendChild(h1);
  notification.appendChild(h2);

  if (success) {
    var svg = document.createElement("div");
    svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`;
    notification.appendChild(svg);
  } else {
    var svg = document.createElement("div");
    svg.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.25 8C1.25 4.27208 4.27208 1.25 8 1.25H16C19.7279 1.25 22.75 4.27208 22.75 8V16C22.75 19.7279 19.7279 22.75 16 22.75H8C4.27208 22.75 1.25 19.7279 1.25 16V8Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.46967 8.46967C8.76257 8.17678 9.23744 8.17678 9.53033 8.46967L15.5303 14.4697C15.8232 14.7626 15.8232 15.2374 15.5303 15.5303C15.2374 15.8232 14.7625 15.8232 14.4696 15.5303L8.46967 9.53033C8.17678 9.23743 8.17678 8.76256 8.46967 8.46967Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5303 8.46967C15.8232 8.76257 15.8232 9.23744 15.5303 9.53033L9.53033 15.5303C9.23743 15.8232 8.76256 15.8232 8.46967 15.5303C8.17678 15.2374 8.17678 14.7625 8.46967 14.4696L14.4697 8.46967C14.7626 8.17678 15.2374 8.17678 15.5303 8.46967Z"/></svg>`;
    notification.appendChild(svg);
  }

  notification.classList.add("notification", success ? "success" : "failed");
  setTimeout(() => notification.classList.add("fadeOut"), 3000);
  setTimeout(() => notification.remove(), 3400);
}
});
