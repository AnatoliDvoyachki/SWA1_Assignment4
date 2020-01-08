
const displayWarningInTable = (tableName, warning) => {
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

    if (warning["prediction"] !== undefined && warning.prediction["time"] !== undefined) {
        timeCell.innerHTML = warning.prediction.time;
    }
    
    if (warning["severity"] !== undefined) {
        severityCell.innerHTML = warning.severity
    }

    if (warning !== undefined && warning["prediction"] !== undefined) {
        fromCell.innerHTML = warning.prediction.from
        toCell.innerHTML = warning.prediction.to
        if (warning.prediction["precipitation_types"] !== undefined) {
            precipitationTypesCell.innerHTML = warning.prediction.precipitation_types.join("\n")
        }
        if (warning.prediction["directions"] !== undefined) {
            directionsCell.innerHTML = warning.prediction.directions.join("\n")
        }
        typeCell.innerHTML = warning.prediction.type
        unitCell.innerHTML = warning.prediction.unit; 
        placeCell.innerHTML = warning.prediction.place;
    }
    console.log(`${new Date().toISOString()} appended to ${tableName}: \n${JSON.stringify(warning)}`)
}

const clearTable = tableName => {
    // Remove all "old" warnings since last update
    let table = document.getElementById(tableName)
    for (let i = 1; i < table.rows.length;){
        table.deleteRow(i);
    }
}

const getValueFromHtmlElement = elementId => {
    return document.getElementById(elementId).value
}

export { displayWarningInTable, clearTable, getValueFromHtmlElement }