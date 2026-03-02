
function capitalizeFirstLetter(string) {
  if (!string) {
    return ""; // Handles empty or null strings
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}









function loadPasses() {

fetch("/fetchpasses")
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = "";  // clear existing rows

        data.forEach(row => {
            const tr = document.createElement("tr");

            const fromLoc = capitalizeFirstLetter(row[3])
            const toLoc = capitalizeFirstLetter(row[4])

            var timeArrived = row[6]
            if (timeArrived == null) {

                timeArrived = "N/A" 
            }

            var timeLeft = row[5]
            


            statusName = row[7]
            
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


            var date = timeLeft.split("-")[0];
            var timeLeft = timeLeft.slice(-8);
            


            var leftTime = timeLeft.split(':');
            
            
            var leftHours = leftTime[0]
            var leftMinutes = leftTime[1]
            var leftSeconds = leftTime[2]
            
            if (leftHours > 12) {

                var leftHours = leftHours - 12
                
                var parsedTime = `${date} - ${leftHours}:${leftMinutes}:${leftSeconds} PM`



            }

            else {

                
                var parsedTime = `${date} - ${leftHours}:${leftMinutes}:${leftSeconds} AM`


            }



            tr.innerHTML = `
                <td>${row[1]}</td> ${/* Student Name */ ''}
                <td>${row[2]}</td> ${/* Partner Name */ ''}
                <td>${fromLoc}</td> ${/* Where they are coming from */ ''}
                <td>${toLoc}</td> ${/* Where they are going to */ ''}
                <td>${parsedTime}</td>
                <td>${timeArrived}</td>
                ${statusTD}

            `;
            tbody.appendChild(tr);
        });
    });

}