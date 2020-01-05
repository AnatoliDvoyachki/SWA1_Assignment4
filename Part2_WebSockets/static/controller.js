import { displayWarning, clearTable } from "./view.js"
import { checkWarningSeverity, checkIfNewWarningSinceLastUpdate } from "./warningFilteringHelpers.js"

// Weather data server urls
const serverSocketUrl = "ws://localhost:8090/warnings"
const serverWarnings = "http://localhost:8080/warnings/"
const serverWarningsSinceUrl = "http://localhost:8080/warnings/since/"

// Weather data protocol commands
const subscribeCommand = "subscribe"
const unsubscribeCommand = "unsubscribe"

let warningsCache = []
let timeOfUnubscription
let isSubscribed
let ws = new WebSocket(serverSocketUrl)

// Document events
window.onload = function() {
    showWarningData()
}
    
window.subscribe = function() {
    if (timeOfUnubscription != null) {
        // Show data that has been missed since the user has unsubscribed
        showWarningData(serverWarningsSinceUrl + timeOfUnubscription.toISOString())
        timeOfUnubscription = null
    }

    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: subscribeCommand }))
        console.log('[' + new Date().toISOString() + ']: Subscribed')
        isSubscribed = true
    }
}

window.unsubscribe = function() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({command: unsubscribeCommand })) 
    }
   
    timeOfUnubscription = new Date()
    console.log('[' + timeOfUnubscription.toISOString() + ']: Unsubscribed')
    isSubscribed = false
}

window.onPageClose = function() {
    if (ws.bufferedAmount === 0) {
        ws.close(1001) // 1001 Going away
    }
}

ws.onopen = function() {
    ws.send(JSON.stringify({command: subscribeCommand }))
}

ws.onmessage = function(message) {
    let warningData = JSON.parse(message.data)
    
    let severity = document.getElementById('severity_text_box').value

    let severeEnoughWarning = checkWarningSeverity(warningData, severity)
    let changedWarnings = checkIfNewWarningSinceLastUpdate(warningsCache, severeEnoughWarning)

    warningsCache.push(severeEnoughWarning)

    if (severeEnoughWarning != null) {
        displayWarning('warnings_table', severeEnoughWarning)
    }

    clearTable('changes_table') // Since messages arrive one by one this should be okay
    if (changedWarnings != null) {
        displayWarning('changes_table', changedWarnings)
    }
}

ws.onclose = function() {
    if (isSubscribed) {
        ws.send(JSON.stringify({ command: unsubscribeCommand }))
    }
}

function showWarningData(url = serverWarnings) {
    fetch(url)
    .then(response => response.json())
    .then(warningData => {
        console.log('[' + new Date().toISOString() + "] Endpoint called " + url)
        let severity = document.getElementById('severity_text_box').value
        
        warningData.warnings.forEach(warning => {
            let severeEnoughWarning = checkWarningSeverity(warning, severity)
            let warningSinceLastUpdate = If(warningsCache, severeEnoughWarning)
            
            if (warningsCache.length > 30) {
                // To avoid making the page too big max
                warningsCache = []
                
                clearTable('warnings_table') 
                clearTable('changes_table')
            }
            
            warningsCache.push(severeEnoughWarning)
            
            if (severeEnoughWarning != null) {
                displayWarning('warnings_table', severeEnoughWarning)
            }  
            if (warningSinceLastUpdate != null) {
                displayWarning('changes_table', warningSinceLastUpdate)
            }  
        })
    })
}
