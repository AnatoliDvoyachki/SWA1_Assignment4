import { timer } from 'http://dev.jspm.io/rxjs@6/_esm2015'
/*import { map, filter, concatMap } from 'http://dev.jspm.io/rxjs@6/_esm2015/operators'
import { ajax } from 'http://dev.jspm.io/npm:rxjs@6.5.3/ajax/index.js'*/

let warningsCache = []
let oldTime

window.onload = () => showWarningData()

let t = timer(5000, 5000)
t.subscribe(() => {
    let update = document.getElementById('onButton').checked
    console.log("Receive updates selected: " + update)
    if (update) {
        showWarningData()
        console.log("Data updated")
    }
})

function showWarningData() {
  fetch('http://localhost:8080/warnings')
        .then(response => response.json())
        .then(warningData => {
            let severity = document.getElementById('severity_text_box').value
            
            // Get and cache current data
            let newWarnings = filterWarningsBySeverity(warningData, severity)

            let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarnings)

            warningsCache = []
            newWarnings.forEach(warning => warningsCache.push(warning))
            oldTime = warningData.time
            
            displayWarnings('changes_table', oldTime, changedWarnings)
            displayWarnings('warnings_table', warningData.time, newWarnings)
        })
}

function filterWarningsBySeverity(warningData, severity) {
    return warningData.warnings.filter(warning => warning.severity >= severity)
}

function filterWarningsSinceLastUpdate(oldWarnings, newWarnings) {
    return oldWarnings.filter(oldWarning => !newWarnings.some(newWarning => {
        return newWarning.prediction.from === oldWarning.prediction.from
            && newWarning.prediction.to === oldWarning.prediction.to
            && newWarning.prediction.type === oldWarning.prediction.type
            && newWarning.prediction.unit === oldWarning.prediction.unit
            && newWarning.prediction.time === oldWarning.prediction.time
            && newWarning.prediction.place === oldWarning.prediction.place
    }))
}

function displayWarnings(tableName, time, warnings) {
    let table = document.getElementById(tableName)
    // Ensure table is empty
    table.innerHTML = ""

    warnings.forEach(warning => {
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

        timeCell.innerHTML = time;
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
    console.log(warnings + " appended to " + tableName)
}