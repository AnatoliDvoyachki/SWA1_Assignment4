let warningsCache = []
let timeOfUnubscription
let isSubscribed
let ws = new WebSocket("ws://localhost:8090/warnings")

window.onload = () => showWarningData()
    
window.subscribe = () => {
    if (timeOfUnubscription != null) {
        // Show data that has been missed since the user has unsubscribed
        showWarningData('http://localhost:8080/warnings/since/' + timeOfUnubscription.toISOString())
    }

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'subscribe'}))
        console.log("Client: Subscribed")
        isSubscribed = true
    }
}

window.unsubscribe = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'unsubscribe'}))
        console.log("Client: Unsubscribed")
        isSubscribed = false
    }
    if (!isSubscribed) {
        // Save time of unsubscribing, so that missed data can be aquired by HTTP request
        timeOfUnubscription = new Date()
        console.log("Client: Saved time of last update: " + timeOfUnubscription.toISOString())
    }
}

window.onPageClose = () => {
    ws.close(1001) // Going away
}

ws.onopen = () => {
    ws.send(JSON.stringify({command: 'subscribe'}))
}

ws.onmessage = message => {
    let warningData = JSON.parse(message.data)
    
    let severity = document.getElementById('severity_text_box').value

    let newWarning = filterWarningsBySeverity(warningData, severity)
    let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarning)

    warningsCache.push(newWarning)
    
    // Remove last row is okay, because messages arrive one by one & old ones will be removed before insert of newest one
    let table = document.getElementById('changes_table')
    if (table.rows.length > 2) {
        for (let i = 1; i < table.rows.length - 1;) {
            table.deleteRow(i);
        }
    }
    
    if (changedWarnings != null) {
        displayWarning('changes_table', changedWarnings)
    }

    if (newWarning != null) {
        displayWarning('warnings_table', newWarning)
    }
}

ws.onclose = () => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'unsubscribe'}))
    }
}

function showWarningData(url = 'http://localhost:8080/warnings/') {
    fetch(url)
    .then(response => response.json())
    .then(warningData => {
        let severity = document.getElementById('severity_text_box').value
        
        warningData.warnings.forEach(warning => {
            let newWarning = filterWarningsBySeverity(warning, severity)
            let warningLastUpdate = filterWarningsSinceLastUpdate(warningsCache, newWarning)
            
            if (warningsCache.length > 30){
                warningsCache = []
                console.log("Cleaned up cache")
            }
    
            warningsCache.push(warning)
            
            if (newWarning != null) {
                displayWarning('warnings_table', newWarning)
            }  
            if (warningLastUpdate != null) {
                displayWarning('changes_table', warningLastUpdate)
            }  
        })
    })
}

function filterWarningsBySeverity(warningData, severity) {
    if (warningData != null && warningData['severity'] != null && warningData['severity'] >= severity) {
        return warningData
    }
    return null
}

function filterWarningsSinceLastUpdate(oldWarnings, newWarning) {
    if (oldWarnings.some(oldWarning => warningEquals(oldWarning, newWarning))) {
        return null
    } 
    return newWarning
}

function warningEquals(oldWarning, newWarning) {
    if (oldWarning == null || oldWarning['prediction'] == null) {
        return false
    }

    if (newWarning == null || newWarning['prediction'] == null) {
        return false
    }

    return newWarning.prediction.from === oldWarning.prediction.from
        && newWarning.prediction.to === oldWarning.prediction.to
        && newWarning.prediction.type === oldWarning.prediction.type
        && newWarning.prediction.unit === oldWarning.prediction.unit
        && newWarning.prediction.time === oldWarning.prediction.time
        && newWarning.prediction.place === oldWarning.prediction.place
        && arraysEqual(newWarning.prediction['precipitation_types'], oldWarning.prediction['precipitation_types'])
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

function displayWarning(tableName, warning) {
    let table = document.getElementById(tableName)

    if (table.rows.length > 30) {
        for (let i = 1; i < table.rows.length - 1;){
            table.deleteRow(i);
        }
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

    if (warning['prediction'] != null && warning.prediction['time'] != null) {
        timeCell.innerHTML = warning.prediction.time;
    }
    
    if (warning['severity'] != null) {
        severityCell.innerHTML = warning.severity
    }

    if (warning != null && warning['prediction'] != null) {
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
    }
    console.log("Appended to " + tableName + ": \n" + JSON.stringify(warning))
}
