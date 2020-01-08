const checkWarningSeverity = (warningData, severity) => {
    return warningData !== null && warningData["severity"] !== null && warningData["severity"] >= severity
        ? warningData
        : null
}

const checkIfNewWarningSinceLastUpdate = (historicalWarnings, warning) => {
    return !historicalWarnings.some(historicalWarning => warningEquals(historicalWarning, warning)) 
        ? warning
        : null
}

const warningEquals = (oldWarning, newWarning) => {
    if (oldWarning === null || oldWarning["prediction"] === null) {
        return false
    }

    if (newWarning === null || newWarning["prediction"] === null) {
        return false
    }

    return newWarning.prediction.from === oldWarning.prediction.from
        && newWarning.prediction.to === oldWarning.prediction.to
        && newWarning.prediction.type === oldWarning.prediction.type
        && newWarning.prediction.unit === oldWarning.prediction.unit
        && newWarning.prediction.time === oldWarning.prediction.time
        && newWarning.prediction.place === oldWarning.prediction.place
        && arraysEqual(newWarning.prediction["precipitation_types"], oldWarning.prediction["precipitation_types"])
}

const arraysEqual = (a, b) => {
    if (a === b) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
          return false;
      }
    }
    return true;
}

export { warningEquals, checkWarningSeverity, checkIfNewWarningSinceLastUpdate }
