var errorReport = (err, failureType, statusCode, logMessage) => {
    if (logMessage) {
        console.log(logMessage);
    }

    return {
        errorData: err,
        failureType : failureType,
        statusCode: statusCode
    };
}

exports.errorReport = errorReport;
