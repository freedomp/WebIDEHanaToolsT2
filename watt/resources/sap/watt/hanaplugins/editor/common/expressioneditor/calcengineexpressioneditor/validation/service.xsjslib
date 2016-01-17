function setResponsePositive(ioBody, iaHeaders) {
    setResponse('application/json', 200, ioBody, iaHeaders);
}

function setResponseNegative(ioBody, iaHeaders) {
    setResponse('application/json', 400, ioBody, iaHeaders);
}

function setResponse(isContentType, iiStatusCode, ioBody, iaHeaders) {
    $.response.contentType = isContentType;
    $.response.status = iiStatusCode;
    $.response.setBody(JSON.stringify(ioBody));
    if (iaHeaders) {
        for (let i = 0; i < iaHeaders.length; i++) {
            $.response.headers.set(iaHeaders[i].key, iaHeaders[i].value);
        }
    }
}

function validateCalcEngineExpression(expression, operanddatatypes) {

    var loConn = $.db.getConnection($.db.isolation.SERIALIZABLE);
    var loCStmt = loConn.prepareCall('call VALIDATE_EXPRESSION(?, ?, ?)');
   
   
    loCStmt.setString(1, "CS");
    loCStmt.setString(2, expression);
    loCStmt.setString(3, operanddatatypes);
    //Execute the call
    var rsul = loCStmt.execute();
    
    setResponsePositive(rsul);
    
    return;
}

function validateSQLExpression(expression, operanddatatypes) {

    var loConn = $.db.getConnection($.db.isolation.SERIALIZABLE);
    var loCStmt = loConn.prepareCall('call VALIDATE_EXPRESSION(?, ?, ?)');
   
   
    loCStmt.setString(1, "SQL");
    loCStmt.setString(2, expression);
    loCStmt.setString(3, operanddatatypes);
    //Execute the call
    var rsul = loCStmt.execute();
    
    setResponsePositive(rsul);
    
    return;
}