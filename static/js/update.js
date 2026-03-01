
function loadPasses() {

fetch("/fetchpasses")
    .then(res => res.json())
    .then(data => {
        const tbody = document.querySelector("table tbody");
        tbody.innerHTML = "";  // clear existing rows

        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row[1]}</td>
                <td>${row[2]}</td>
                <td>${row[3]}</td>
                <td>${row[4]}</td>
                <td>${row[5]}</td>
                <td>${row[7]}</td>

            `;
            tbody.appendChild(tr);
        });
    });

}