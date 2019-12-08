let warningsCache = []
let timeOfUnubscription
let isSubscribed
let ws = new WebSocket("ws://localhost:8090/warnings")

window.onload = function() {
    showWarningData()
}
    
window.subscribe = function() {
    if (timeOfUnubscription != null) {
        // Show data that has been missed since the user has unsubscribed
        showWarningData('http://localhost:8080/warnings/since/' + timeOfUnubscription.toISOString())
        timeOfUnubscription = null
    }

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'subscribe'}))
        console.log('[' + new Date().toISOString() + ']: Subscribed')
        isSubscribed = true
    }
}

window.unsubscribe = function() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: 'unsubscribe'})) 
    }
   
    timeOfUnubscription = new Date()
    console.log('[' + timeOfUnubscription.toISOString() + ']: Unsubscribed')
    isSubscribed = false
}

window.onPageClose = function() {
    if (ws.readyState !== WebSocket.CLOSED || ws.readyState !== WebSocket.CLOSING) {
        ws.close(1001) // 1001 Going away
    }
}

ws.onopen = function() {
    ws.send(JSON.stringify({command: 'subscribe'}))
}

ws.onmessage = function(message) {
    let warningData = JSON.parse(message.data)
    
    let severity = document.getElementById('severity_text_box').value

    let newWarning = filterWarningBySeverity(warningData, severity)
    let changedWarnings = filterWarningSinceLastUpdate(warningsCache, newWarning)

    warningsCache.push(newWarning)

    if (newWarning != null) {
        displayWarning('warnings_table', newWarning)
    }

    clearTable('changes_table') // Since messages arrive one by one this should be okay
    if (changedWarnings != null) {
        displayWarning('changes_table', changedWarnings)
    }
}

ws.onclose = function() {
    if (isSubscribed) {
        ws.send(JSON.stringify({command: 'unsubscribe'}))
    }
}

function showWarningData(url = 'http://localhost:8080/warnings/') {
    fetch(url)
    .then(response => response.json())
    .then(warningData => {
        console.log('[' + new Date().toISOString() + "] Endpoint called " + url)
        let severity = document.getElementById('severity_text_box').value
        
        warningData.warnings.forEach(warning => {
            let newWarning = filterWarningBySeverity(warning, severity)
            let warningSinceLastUpdate = filterWarningSinceLastUpdate(warningsCache, newWarning)
            
            if (warningsCache.length > 30) {
                // To avoid making the page too big max
                warningsCache = []
                
                clearTable('warnings_table') 
                clearTable('changes_table')
            }
            
            warningsCache.push(newWarning)
            
            if (newWarning != null) {
                displayWarning('warnings_table', newWarning)
            }  
            if (warningSinceLastUpdate != null) {
                displayWarning('changes_table', warningSinceLastUpdate)
            }  
        })
    })
}

function clearTable(tableName) {
    // Remove all 'old' warnings since last update
    let table = document.getElementById(tableName)
    for (let i = 1;i < table.rows.length;){
        table.deleteRow(i);
    }
}

function filterWarningBySeverity(warningData, severity) {
    if (warningData != null && warningData['severity'] != null && warningData['severity'] >= severity) {
        return warningData
    }
    return null
}

function filterWarningSinceLastUpdate(oldWarnings, newWarning) {
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
    console.log(new Date().toISOString() + " appended to " + tableName + ": \n" + JSON.stringify(warning))
}
