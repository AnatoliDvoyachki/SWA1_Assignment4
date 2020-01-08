function clearTable(tableName) {
    // Remove all "old" warnings since last update
    let table = document.getElementById(tableName)
    for (let i = 1;i < table.rows.length;){
        table.deleteRow(i);
    }
    console.log(`${tableName} cleared`)
}
    
function displayWarnings(tableName, warnings) {
    let table = document.getElementById(tableName)
    
    if (table.rows.length > 10) {
        for (let i = 1; i < table.rows.length - 1; i++) {
            table.deleteRow(i);
        }
        console.log("Cleaned up rows")
    }

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

        timeCell.innerHTML = warning.prediction.time;
        severityCell.innerHTML = warning.severity
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
    })
    console.log(`Appended to ${tableName}: ${JSON.stringify(warnings)}`)
}

const getValueFromHtmlElement = elementId => {
    return document.getElementById(elementId).value
}

export { displayWarnings, clearTable, getValueFromHtmlElement }