// capitilize first letter of strings
function capitalizeFirstLetter(string) {
  if (!string) {
    return ""; // Handles empty or null strings
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// converts a raw time string into 12h format
function parseTime(rawTime) {
    var date = rawTime.split("-")[0];
    var time = rawTime.slice(-8);
    var hours = Number(time.split(':')[0]);
    var minutes = time.split(':')[1];
    var seconds = time.split(':')[2];

    // figure out am/pm and convert hour
    var ampm = "";
    var displayHour = hours;

    if (hours == 0) {
        displayHour = 12;
        ampm = "AM";
    } else if (hours < 12) {
        ampm = "AM";
    } else if (hours == 12) {
        ampm = "PM";
    } else {
        displayHour = hours - 12;
        ampm = "PM";
    }

    return `${date} - ${displayHour}:${minutes}:${seconds} ${ampm}`;
}













function loadPasses() {

fetch("/fetchpasses")
    .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
    })
    .then(data => {
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = "";

        const activeList = document.querySelector(".active-list");
        activeList.innerHTML = "";

        data.forEach(row => {
            
            const tr = document.createElement("tr");

            const fromLoc = capitalizeFirstLetter(row[3])
            const toLoc = capitalizeFirstLetter(row[4])

            var timeArrived = row[6]

            if (timeArrived == null) {
                timeArrived = "N/A"
            } else {
                timeArrived = parseTime(timeArrived)
            }

            var timeLeft = row[5]
            var parsedTime = parseTime(timeLeft)
            

            let statusName = row[7]
            


            // sets color for status based off status
            if (statusName == "Active") {
                var statusTD = `<td style="color: rgb(34, 197, 94); font-weight: 600;">Active</td>`
            } 
            
            else if (statusName == "Cancelled") {
                var statusTD = `<td style="color: rgb(239, 68, 68); font-weight: 600;">Cancelled</td>`
            } 
            
            else if (statusName == "Arrived") {
                var statusTD = `<td style="color: rgb(29, 125, 241); font-weight: 600;">Arrived</td>`
            } 
            
            else {
                var statusTD = `<td>${statusName}</td>`
            }

            // pull out raw h/m/s for gone time calculation
            var rawTime = timeLeft.slice(-8);
            var leftTime = rawTime.split(':');
            var leftHours = parseInt(leftTime[0])
            var leftMinutes = parseInt(leftTime[1])
            var leftSeconds = parseInt(leftTime[2])



            //assigns data to append to table
            tr.innerHTML = `
                <td>${row[1]}</td> ${/* Student Name */ ''}
                <td>${row[2]}</td> ${/* Partner Name */ ''}
                <td>${fromLoc}</td> ${/* Where they are coming from */ ''}
                <td>${toLoc}</td> ${/* Where they are going to */ ''}
                <td>${parsedTime}</td>${/* When they left */ ''}
                <td>${timeArrived}</td>${/* When they arrived at their location */ ''}
                ${statusTD}${/* Status of pass */ ''}

            `;
            tbody.appendChild(tr);
            


            // checks if status is active and if it is creates a box in currently out area
            if (statusName == "Active") {
                const card = document.createElement("div");
                card.className = "active-user";

                // calculate gone time 
                const now = new Date();
                let goneSeconds = now.getSeconds() - leftSeconds;
                let goneMinutes = now.getMinutes() - leftMinutes;
                let goneHours = now.getHours() - leftHours;
                if (goneSeconds < 0) { goneSeconds += 60; goneMinutes--; }
                if (goneMinutes < 0) { goneMinutes += 60; goneHours--; }

                const pad = n => String(n).padStart(2, '0');

                card.innerHTML = `
                    <p><strong>${row[1]} & ${row[2]}</strong> → ${toLoc}</p>
                    <p>Left: ${parsedTime}</p>
                    <p>Gone: ${pad(goneHours)}:${pad(goneMinutes)}:${pad(goneSeconds)}</p>
                `;
                activeList.appendChild(card);
            }
        });

        // re-apply search filter after rebuilding table
        const searchInput = document.querySelector(".search-box input");
        if (searchInput && searchInput.value) {
            const query = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll("table tbody tr");
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? "" : "none";
            });
        }
    })
    .catch(err => console.error("Failed to load passes:", err));

}