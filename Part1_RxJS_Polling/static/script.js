import { timer } from 'http://dev.jspm.io/rxjs@6/_esm2015'
   
window.onload = () => showWarningData()

let t = timer(1000, 2000)
t.subscribe(() => {
    let update = document.getElementById('onButton').checked
    console.log("Receive updates selected: " + update)
    if (update)
    {
    showWarningData()
    console.log("Data updated")}
})

function showWarningData() {
  fetch('http://localhost:8080/warnings')
        .then(response => response.json())
        .then(warningData => {
            let severity = document.getElementById('severity_text_box').value
            let warnings = filterWarnings(warningData, severity)
            appendWarnings(warningData, warnings)
        })
}


function filterWarnings(warningData, severity) {
    return warningData.warnings.filter(warning => warning.severity >= severity)
}

function appendWarnings(warningData, filteredWarnings) {
    let table = document.getElementById('warnings_table')
    // Ensure table is empty
    table.innerHTML = ""

    filteredWarnings.forEach(warning => {
        let row = table.insertRow();

        let timeCell = row.insertCell(0);
        let severityCell = row.insertCell(1)
        let fromCell = row.insertCell(2);
        let toCell = row.insertCell(3);
        let precipitationTypesCell = row.insertCell(4);
        let directionsCell = row.insertCell(5)
        let typeCell = row.insertCell(6)
        let unitCell = row.insertCell(7)
        let placeCell = row.insertCell(8)

        timeCell.innerHTML = warningData.time;
        severityCell.innerHTML = warning.severity
        fromCell.innerHTML = warning.prediction.from
        toCell.innerHTML = warning.prediction.to
        if (warning.prediction['precipitation_types'] != null) {
            precipitationTypesCell.innerHTML = warning.prediction.precipitation_types.join("\n")
        }
        if (warning.prediction['directions'] != null) {
            directionsCell.innerHTML = warning.prediction.directions.join("\n")
        }
        typeCell.innerHTML = warning.prediction.type
        unitCell.innerHTML = warning.prediction.unit; 
        placeCell.innerHTML = warning.prediction.place;
    })
}