let warningsCache = []
let oldTime
let timeOfUnubscription
let isSubscribed
let ws = new WebSocket("ws://localhost:8090/warnings")

window.onload = () => showWarningData()
    
window.subscribe = () => {
    if (timeOfUnubscription != null) {
        showWarningData('http://localhost:8080/warnings/since/' + timeOfUnubscription.toISOString())
    }

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'subscribe'}))
        console.log("Subscribed")
        isSubscribed = true
    }
}

window.unsubscribe = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'unsubscribe'}))
        console.log("Unsubscribed")
        isSubscribed = false
    }
    if (!isSubscribed) {
        timeOfUnubscription = new Date()
        console.log("Saved time of last update: " + timeOfUnubscription.toISOString())
    }
}

window.onPageClose = () => {
    ws.close(1001) // [1001] - Going away
}

ws.onopen = () => {
    ws.send(JSON.stringify({command: 'subscribe'}))
}

ws.onmessage = message => {
    console.log("onmessage called") 
    let warningData = JSON.parse(message.data)
    console.log(warningData)
    let severity = document.getElementById('severity_text_box').value
    
    if (warningData.severity >= severity) { 
        let prediction = warningData['prediction']
        let time = prediction != null && prediction['time'] != null ? prediction['time'] : "" 
        displayWarning('warnings_table', time, warningData) 
    }

    if (warningData['prediction'] != null) {
        oldTime = warningData.prediction['time'] != null ? warningData.prediction.time : oldTime 
    }

    console.log("Severity filter is " + severity)

    if (!warningsCache.some(oldWarning => warningEquals(oldWarning, warningData))) {
        displayWarning('changes_table', oldTime, warningData)
        warningsCache = [warningData]
        console.log('Changed warning ' + JSON.stringify(warningData))
    }
}

ws.onclose = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'unsubscribe'}))
    }
}

function showWarningData(url = 'http://localhost:8080/warnings/') {
    console.log(url)
    fetch(url)
    .then(response => response.json())
    .then(warningData => {
        console.log("Server HTTP call: " + JSON.stringify(warningData))
        let severity = document.getElementById('severity_text_box').value
        
        let warnings = filterWarningsBySeverity(warningData, severity)
        let warningsSinceLastUpdate = filterWarningsSinceLastUpdate(warningsCache, warnings)

        warnings.forEach(warning => warningsCache.push(warning))
        oldTime = warningData.time
        
        warningsSinceLastUpdate.forEach(warning => displayWarning('changes_table', oldTime, warning)) 
        warnings.forEach(warning => displayWarning('warnings_table', warningData.time, warning)) 
    })
}

function filterWarningsBySeverity(warningData, severity) {
    return warningData.warnings.filter(warning => warning.severity >= severity)
}

function filterWarningsSinceLastUpdate(oldWarnings, warnings) {
    return oldWarnings.filter(oldWarning => !warnings.some(newWarning => warningEquals(oldWarning, newWarning)))
}

function warningEquals(oldWarning, newWarning) {
    if (oldWarning['prediction'] != null && newWarning['prediction'] != null) {
        return newWarning.prediction.from === oldWarning.prediction.from
            && newWarning.prediction.to === oldWarning.prediction.to
            && newWarning.prediction.type === oldWarning.prediction.type
            && newWarning.prediction.unit === oldWarning.prediction.unit
            && newWarning.prediction.time === oldWarning.prediction.time
            && newWarning.prediction.place === oldWarning.prediction.place
            && arraysEqual(newWarning.prediction['precipitation_types'], oldWarning.prediction['precipitation_types'])
    } 
    return false
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

function displayWarning(tableName, time, warnings) {
    let table = document.getElementById(tableName)

    if (table.rows.length > 10) {
        for (let i = 1; i < table.rows.length - 1; i++) {
            table.deleteRow(i);
        }
        
        console.log("Cleaned up rows")
    }

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

    if (time != null) {
        timeCell.innerHTML = time;
    }
    
    if (warnings.severity != null) {
        severityCell.innerHTML = warnings.severity
    }

    if (warnings.prediction != null) {
        fromCell.innerHTML = warnings.prediction.from
        toCell.innerHTML = warnings.prediction.to
        if (warnings.prediction['precipitation_types'] != null) {
            precipitationTypesCell.innerHTML = warnings.prediction.precipitation_types.join("\n")
        }
        if (warnings.prediction['directions'] != null) {
            directionsCell.innerHTML = warnings.prediction.directions.join("\n")
        }
        typeCell.innerHTML = warnings.prediction.type
        unitCell.innerHTML = warnings.prediction.unit; 
        placeCell.innerHTML = warnings.prediction.place;
    }
    console.log(warnings + " appended to " + tableName)
}
