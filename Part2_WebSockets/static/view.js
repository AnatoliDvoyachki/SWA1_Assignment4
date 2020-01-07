
const displayWarning = (tableName, warning) => {
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

    if (warning['prediction'] !== null && warning.prediction['time'] !== null) {
        timeCell.innerHTML = warning.prediction.time;
    }
    
    if (warning['severity'] !== null) {
        severityCell.innerHTML = warning.severity
    }

    if (warning !== null && warning['prediction'] !== null) {
        fromCell.innerHTML = warning.prediction.from
        toCell.innerHTML = warning.prediction.to
        if (warning.prediction['precipitation_types'] !== null) {
            precipitationTypesCell.innerHTML = warning.prediction.precipitation_types.join("\n")
        }
        if (warning.prediction['directions'] !== null) {
            directionsCell.innerHTML = warning.prediction.directions.join("\n")
        }
        typeCell.innerHTML = warning.prediction.type
        unitCell.innerHTML = warning.prediction.unit; 
        placeCell.innerHTML = warning.prediction.place;
    }
    console.log(`${new Date().toISOString()} appended to ${tableName}: \n${JSON.stringify(warning)}`)
}

const clearTable = (tableName) => {
    // Remove all 'old' warnings since last update
    let table = document.getElementById(tableName)
    for (let i = 1;i < table.rows.length;){
        table.deleteRow(i);
    }
}

export { displayWarning, clearTable }