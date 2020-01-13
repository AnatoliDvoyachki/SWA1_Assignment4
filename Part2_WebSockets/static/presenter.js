import { displayWarningInTable, clearTable, getValueFromHtmlElement } from "./view.js"
import { checkWarningSeverity, checkIfNewWarningSinceLastUpdate } from "./warningFilteringHelpers.js"

// Weather data server urls
const serverSocketUrl = "ws://localhost:8090/warnings" //web socket protocol
const serverWarnings = "http://localhost:8080/warnings/"
const serverWarningsSinceUrl = "http://localhost:8080/warnings/since/"

// Weather data protocol methods
const subscribeCommand = "subscribe"
const unsubscribeCommand = "unsubscribe"

let warningsCache = []
let timeOfUnubscription

const socket = new WebSocket(serverSocketUrl)

socket.onopen = () => socket.send(JSON.stringify({command: subscribeCommand })) //socket ready triggers onOpen
// socket.send subsribes to receiving messages from the server

socket.onmessage = message => {
    const warningData = JSON.parse(message.data)
    
    const severity = getValueFromHtmlElement("severity_text_box")

    const severeEnoughWarning = checkWarningSeverity(warningData, severity)
    const changedWarnings = checkIfNewWarningSinceLastUpdate(warningsCache, severeEnoughWarning)
    warningsCache.push(severeEnoughWarning)

    if (severeEnoughWarning !== null) {
        displayWarningInTable("warnings_table", severeEnoughWarning)
    }

    clearTable("changes_table") // Since messages arrive one by one this should be okay (every update has 1 new message at most)
    
    if (changedWarnings !== null) {
        displayWarningInTable("changes_table", changedWarnings)
    }
}

socket.onclose = () => console.log(`[${new Date().toISOString()}]: Socket connection closed`)

socket.onerror = error => console.error(`[${new Date().toISOString()}]: An error has occured in web socket communication ${error}`)

window.onload = () => showWarningData(serverWarnings)

window.onunload = () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: unsubscribeCommand })) 
        console.log(`[${new Date().toISOString()}]: Unsubscribed`)
    }
    if (socket.bufferedAmount === 0) {
        socket.close(1001) // 1001 Going away 
    }
}
   
window.subscribe = () => {
    if (timeOfUnubscription !== null) {
        // Show data that has been missed since the user has unsubscribed
        const endpoint = `${serverWarningsSinceUrl}${timeOfUnubscription.toISOString()}`
        showWarningData(endpoint)
        timeOfUnubscription = null
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({command: subscribeCommand }))
        console.log(`[${new Date().toISOString()}]: Subscribed`)
    }
}

window.unsubscribe = () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: unsubscribeCommand })) 
    }
   
    timeOfUnubscription = new Date()
    console.log(`[${timeOfUnubscription.toISOString()}]: Unsubscribed`)
}

const showWarningData = url => {
    fetch(url)
    .then(response => { 
        if (response.ok) {
            return response.json()
        }
        throw new Error(response.statusText)
    })
    .then(warningData => {
        console.log(`[${new Date().toISOString()}]: Endpoint called ${url}`)
        
        const severity = getValueFromHtmlElement("severity_text_box")
        
        warningData.warnings.forEach(warning => {
            const severeEnoughWarning = checkWarningSeverity(warning, severity)
            const warningSinceLastUpdate = checkIfNewWarningSinceLastUpdate(warningsCache, severeEnoughWarning)
            
            if (warningsCache.length > 30) {
                // To avoid making the page too big
                warningsCache = []
                
                clearTable("warnings_table") 
                clearTable("changes_table")
            }
            
            warningsCache.push(severeEnoughWarning)
            
            if (severeEnoughWarning !== null) {
                displayWarningInTable("warnings_table", severeEnoughWarning)
            }  
            if (warningSinceLastUpdate !== null) {
                displayWarningInTable("changes_table", warningSinceLastUpdate)
            }  
        })
    })
}
