let warningsCache = []
let oldTime
let ws = new WebSocket("ws://localhost:8090/warnings")

window.onload = () => showWarningData()
    
ws.onmessage = message => {
    console.log("onmessage called") 
    let warningData = JSON.parse(message.data)
    
    let severity = document.getElementById('severity_text_box').value

    let newWarnings = filterWarningsBySeverity(warningData, severity)
    let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarnings)

    warningsCache = []
    newWarnings.forEach(warning => warningsCache.push(warning))
    oldTime = warningData.time

    displayWarnings('changes_table', oldTime, changedWarnings)
    displayWarnings('warnings_table', warningData.time, newWarnings)
}

ws.onclose = () => console.log("onclose called")

function showWarningData() {
    fetch('http://localhost:8080/warnings/')
        .then(response => response.json())
        .then(warningData => {
            let severity = document.getElementById('severity_text_box').value
            
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
            && arraysEqual(newWarning.prediction['precipitation_types'], oldWarning.prediction['precipitation_types'])
    }))
}

function arraysEqual(a, b) {
    if (a === b) {
        return true;
    }
    if (a == null || b == null) {
        return false;
    }
    if (a.length != b.length) {
        return false;
    }

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
          return false;
        }
    }
    return true;
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
