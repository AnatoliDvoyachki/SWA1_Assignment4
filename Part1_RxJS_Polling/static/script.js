import { clearTable, displayWarnings } from "./view.js"
import { map, concatMap } from 'http://dev.jspm.io/rxjs@6.5.3/_esm2015/operators/index.js';
import { ajax } from 'http://dev.jspm.io/rxjs@6.5.3/_esm2015/ajax/index.js'
import { interval } from 'http://dev.jspm.io/rxjs@6.5.3/_esm2015/internal/observable/interval.js'                      

let warningsCache = []
let timeOfUnsubscription
let isSubscribed = false

let heartbeat = interval(3000)

window.onload = function() {
    showWarningData()
    subscribe()
}

window.onOnClick = function() {
    showWarningData()
    timeOfUnsubscription = null
    if (!isSubscribed) {
        subscribe()
        console.log('[' + new Date().toISOString() + ']: Subscribed')
    } 
}

window.onOffClick = function() {
    timeOfUnsubscription = new Date()
    isSubscribed = false
    console.log('[' + timeOfUnsubscription.toISOString() + ']: Unsubscribed')
}

function subscribe() {
    heartbeat
    .pipe(concatMap(() => ajax.getJSON('http://localhost:8080/warnings')), map((warnings) => warnings))
    .subscribe(warnings => {
        if (isSubscribed) {
            let minSeverity = document.getElementById('severity_text_box').value
                
            let newWarnings = filterWarningsBySeverity(warnings, minSeverity)
            let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarnings)
        
            warningsCache = []
            newWarnings.forEach(warning => warningsCache.push(warning))
            
            displayWarnings('warnings_table', newWarnings)

            // Remove all 'old' warnings since last update
            clearTable('changes_table')
            displayWarnings('changes_table', changedWarnings)
        }
    })
    isSubscribed = true
}

function showWarningData() {
    let endpoint = 'http://localhost:8080/warnings/'
    
    if (timeOfUnsubscription != null) {
        endpoint += 'since/' + timeOfUnsubscription.toISOString()
    }

    fetch(endpoint)
    .then(response => response.json())
    .then(warningData => {    
        console.log('[' + new Date().toISOString() + ']: Endpoint called ' + endpoint)

        let minSeverity = document.getElementById('severity_text_box').value
        
        let newWarnings = filterWarningsBySeverity(warningData, minSeverity)
        let changedWarnings = filterWarningsSinceLastUpdate(warningsCache, newWarnings)
        
        // Empty cache after last updated warnings have been filtered, to ensure that the next update will show valid results
        warningsCache = []
        newWarnings.forEach(warning => warningsCache.push(warning))
        
        clearTable('warnings_table')
        displayWarnings('warnings_table', newWarnings)
        
        clearTable('changes_table')
        displayWarnings('changes_table', changedWarnings)
    })
}

function filterWarningsBySeverity(warningData, minSeverity) {
    return warningData.warnings.filter(warning => warning.severity >= minSeverity)
}

function filterWarningsSinceLastUpdate(oldWarnings, newWarnings) {
    return newWarnings.filter(newWarning => !oldWarnings.some(oldWarning => {
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

