// capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}




// sends arrived or cancelled to the backend
function changePassStatus(type) {

 if (!window.confirm("Are you sure you want to submit this pass?")) {
    return;
}


  const studentId = localStorage.getItem('student-id');



// post to flask
fetch('/change_pass_status/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        student_id: studentId,
        new_status: type
    })
})
.then(res => res.json())
.then(data => {
    console.log(data);
    localStorage.removeItem("passStatus");
    window.location.reload();
});

}




// calculates how long someone has been gone and updates every second
function goneTime(timeLeft) {

            const goneTimeH2 = document.querySelector('.timeGone')
            var timeLeft = timeLeft.slice(-8);

            console.log(timeLeft)

            var leftTime = timeLeft.split(':');

            var leftHours = leftTime[0]
            var leftMinutes = leftTime[1]
            var leftSeconds = leftTime[2]

            // does the math and handles negative values
            function calculateGoneTime() {

            const now = new Date();
            const nowHours = now.getHours();
            const nowMinutes = now.getMinutes();
            const nowSeconds = now.getSeconds();

            let goneSeconds = nowSeconds - leftSeconds;
            let goneMinutes = nowMinutes - leftMinutes;
            let goneHours = nowHours - leftHours;

            if (goneSeconds < 0) {
                goneSeconds += 60;
                goneMinutes--;
            }
            if (goneMinutes < 0) {
                goneMinutes += 60;
                goneHours--;
            }

            timeGone = `${goneHours}:${goneMinutes}:${goneSeconds}`

            goneTimeH2.textContent = timeGone

            }
            calculateGoneTime()
            // tick every second
            let intervalID = setInterval(calculateGoneTime, 1000);

}




// on page load check if theres an active pass
document.addEventListener("DOMContentLoaded", function() {

if (localStorage.getItem("passStatus") == "Active") {

// hide the form and show active pass instead
document.querySelectorAll('.form').forEach(el => {
    el.style.display = 'none';
    const studentId = localStorage.getItem('student-id');

// grab pass data from server
fetch('/active_pass/' + studentId)
    .then(res => res.json())
    .then(data => {
        if (data.status === "ok") {


            var timeLeft = data.pass[5]

            goneTime(timeLeft)


            console.log(data)
            var locFrom = data.pass[3]

            var locTo = data.pass[4]

            var locFrom = capitalizeFirstLetter(locFrom);

            var locTo = capitalizeFirstLetter(locTo);


            var mainName = data.pass[1]

            var partnerName = data.pass[2]



            // fill in the active pass card
            document.querySelector('.peopleOnPass').textContent = `${mainName} & ${partnerName}`;

            document.querySelector('.route-from').textContent = locFrom;
            document.querySelector('.route-to').textContent = locTo;

        }
    });





});


}


// no active pass so hide that section
else {
document.querySelectorAll('.activePass').forEach(el => {
    el.style.display = 'none';
});
}



});




// show/hide custom location textareas when "other" is picked
document.addEventListener("DOMContentLoaded", function() {
document.getElementById("where-am-i-at").addEventListener("change", function() {
    document.getElementById("custom-from").style.display = this.value === "Other" ? "block" : "none";
});

document.getElementById("where-am-i-going").addEventListener("change", function() {
    document.getElementById("custom-to").style.display = this.value === "Other" ? "block" : "none";
});




});


// restore saved form values from localstorage
window.addEventListener('load', function() {
  document.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.id && localStorage.getItem(field.id)) {
      field.value = localStorage.getItem(field.id);
    }
  });

  // show textareas if "other" was the saved value
  if (document.getElementById('where-am-i-at').value === 'Other') {
      document.getElementById('custom-from').style.display = 'block';
  }
  if (document.getElementById('where-am-i-going').value === 'Other') {
      document.getElementById('custom-to').style.display = 'block';
  }
});

// save fields to localstorage as user types
document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', function() {
    if (this.id) localStorage.setItem(this.id, this.value);
  });

  field.addEventListener('change', function() {
    if (this.id) localStorage.setItem(this.id, this.value);
  });
});

// form submit handler
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!window.confirm("Are you sure you want to submit this pass?")) {
    return;
}
  const whereAmIAt = document.getElementById('where-am-i-at');
  const whereAmIGoing = document.getElementById('where-am-i-going');

  // if "other" is picked use the custom textarea value instead
  const fromValue = whereAmIAt.value === "Other" ? document.getElementById('custom-from').value.trim() : whereAmIAt.value;
  const toValue = whereAmIGoing.value === "Other" ? document.getElementById('custom-to').value.trim() : whereAmIGoing.value;

 const studentId = document.getElementById('student-id').value;
  const partnerId = document.getElementById('partner-id').value;

  // make sure nothing is empty
  if (!studentId || !partnerId || !fromValue || !toValue) {
    return showNotification("Error", "Please fill out all fields", false);
  }


  // send to flask
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: document.getElementById('student-id').value,
      partner_id: document.getElementById('partner-id').value,
      where_am_i_at: fromValue,
      where_am_i_going: toValue
    })
  })
 .then(res => res.json())
  .then((data) => {
    if (data.status === "error") {
      // if they already have a pass sync up localstorage
      if (data.message == "You already have an active pass") {
        localStorage.setItem("passStatus", "Active")

      }
      return showNotification("Error", data.message, false);

    }
    // swap from/to so next time "from" is where they just went
    whereAmIAt.value = whereAmIGoing.value;
    whereAmIGoing.value = '';
    document.querySelectorAll('input, select').forEach(field => {
      if (field.id) localStorage.setItem(field.id, field.value);
    });
    showNotification("Submitted", "Pass logged successfully", true);
    localStorage.setItem("passStatus", "Active")
  })



// popup notif with checkmark or x icon
function showNotification(result, subresult, success) {
  var notification = document.createElement("div");
  document.body.appendChild(notification);

  var h1 = document.createElement("h1");
  var h2 = document.createElement("h2");
  h1.textContent = result;
  h2.textContent = subresult;
  notification.appendChild(h1);
  notification.appendChild(h2);

  // green check
  if (success) {
    var svg = document.createElement("div");
    svg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`;
    notification.appendChild(svg);
  // red x
  } else {
    var svg = document.createElement("div");
    svg.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.25 8C1.25 4.27208 4.27208 1.25 8 1.25H16C19.7279 1.25 22.75 4.27208 22.75 8V16C22.75 19.7279 19.7279 22.75 16 22.75H8C4.27208 22.75 1.25 19.7279 1.25 16V8Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.46967 8.46967C8.76257 8.17678 9.23744 8.17678 9.53033 8.46967L15.5303 14.4697C15.8232 14.7626 15.8232 15.2374 15.5303 15.5303C15.2374 15.8232 14.7625 15.8232 14.4696 15.5303L8.46967 9.53033C8.17678 9.23743 8.17678 8.76256 8.46967 8.46967Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5303 8.46967C15.8232 8.76257 15.8232 9.23744 15.5303 9.53033L9.53033 15.5303C9.23743 15.8232 8.76256 15.8232 8.46967 15.5303C8.17678 15.2374 8.17678 14.7625 8.46967 14.4696L14.4697 8.46967C14.7626 8.17678 15.2374 8.17678 15.5303 8.46967Z"/></svg>`;
    notification.appendChild(svg);
  }

  notification.classList.add("notification", success ? "success" : "failed");
  // fade out then reload page
  setTimeout(() => notification.classList.add("fadeOut"), 1300);
  setTimeout(() => window.location.reload(), 1700);
}
});
