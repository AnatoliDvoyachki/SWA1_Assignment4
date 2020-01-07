const filterWarningsBySeverity = (warningData, minSeverity) => {
    return warningData.warnings.filter(warning => warning.severity >= minSeverity)
}

const filterWarningsSinceLastUpdate = (oldWarnings, newWarnings) => {
    return newWarnings.filter(newWarning => !oldWarnings.some(oldWarning => {
        return newWarning.prediction.from === oldWarning.prediction.from
            && newWarning.prediction.to === oldWarning.prediction.to
            && newWarning.prediction.type === oldWarning.prediction.type
            && newWarning.prediction.unit === oldWarning.prediction.unit
            && newWarning.prediction.time === oldWarning.prediction.time
            && newWarning.prediction.place === oldWarning.prediction.place
            && arraysEqual(newWarning.prediction["precipitation_types"], oldWarning.prediction["precipitation_types"])
    }))
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

export { arraysEqual, filterWarningsSinceLastUpdate, filterWarningsBySeverity }