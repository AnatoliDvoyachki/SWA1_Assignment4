import { clearTable, displayWarnings, getValueFromHtmlElement } from "./view.js"
import { filterWarningsSinceLastUpdate, filterWarningsBySeverity } from "./warningFilteringHelpers.js"
import { concatMap } from "http://dev.jspm.io/rxjs@6.5.3/_esm2015/operators/index.js"
import { ajax } from "http://dev.jspm.io/rxjs@6.5.3/_esm2015/ajax/index.js"
import { interval } from "http://dev.jspm.io/rxjs@6.5.3/_esm2015/internal/observable/interval.js"                      

const serverWarningsUrl = "http://localhost:8080/warnings/"

let warningsCache = []
let timeOfUnsubscription
let isSubscribed = false // To avoid having more than 1 subscription active

let observable = interval(3000)
let subscription

window.onload = () => {
    showWarningData()
    subscribe()
}

window.onunload = () => {
    subscription.unsubscribe()
    console.log(`[${new Date().toISOString()}]: Unsubscribed`)
}

window.onOnClick = () => {
    showWarningData()
    timeOfUnsubscription = null
    if (!isSubscribed) {
        subscribe()
        console.log(`[${new Date().toISOString()}]: Subscribed`)
    } 
}

window.onOffClick = () => {
    timeOfUnsubscription = new Date()
    subscription.unsubscribe()
    isSubscribed = false
    console.log(`[${timeOfUnsubscription.toISOString()}]: Unsubscribed`)
}

const subscribe = () => {
    subscription = observable.pipe(
            concatMap(() => ajax.getJSON(serverWarningsUrl))
        ).subscribe({ 
            next: warnings => {
                let minSeverity = getValueFromHtmlElement("severity_text_box")
                    
                let newWarnings = filterWarningsBySeverity(warnings, minSeverity)
                let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarnings)
            
                warningsCache = []
                newWarnings.forEach(warning => warningsCache.push(warning))
                
                displayWarnings("warnings_table", newWarnings)

                // Remove all "old" warnings since last update
                clearTable("changes_table")
                displayWarnings("changes_table", changedWarnings)
            },
            error: error => console.error(error)
        })

    isSubscribed = true
    
    console.log(`[${new Date().toISOString()}]: Subscribed`)
}

// Used for "catching up" with data missed while being unsubscribed
const showWarningData = () => {
    let endpoint = serverWarningsUrl
    
    if (timeOfUnsubscription != null) {
        endpoint += `since/${timeOfUnsubscription.toISOString()}`
    }

    fetch(endpoint)
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        throw new Error("Network response was not ok")
    })
    .then(warningData => {    
        console.log(`[${new Date().toISOString()}]: Endpoint called ${endpoint}`)

        let minSeverity = getValueFromHtmlElement("severity_text_box")
        
        let newWarnings = filterWarningsBySeverity(warningData, minSeverity)
        let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarnings)
        
        // Empty cache after last updated warnings have been filtered, to ensure that the next update will show valid results
        warningsCache = []
        newWarnings.forEach(warning => warningsCache.push(warning))
        
        clearTable("warnings_table")
        displayWarnings("warnings_table", newWarnings)
        
        clearTable("changes_table")
        displayWarnings("changes_table", changedWarnings)
    })
    .catch(error => console.error(error))
}
