/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
$.import('sap.hana.ide.common.plugin.expressioneditor.calcengineexpressioneditor.validation', 'service');
var goService = $.sap.hana.ide.common.plugin.expressioneditor.calcengineexpressioneditor.validation.service;

try {
    switch($.request.parameters.get("action")){
        case "validateExpression":
            goService.validateCalcEngineExpression($.request.parameters.get("expression"), $.request.parameters.get("operanddatatypes"));
            break;
        case "validateSQLExpression":
            goService.validateSQLExpression($.request.parameters.get("expression"), $.request.parameters.get("operanddatatypes"));
            break;
       
        default:
            goService.setResponseNegative("Service not supported: " + $.request.parameters.get("action"));
            break;
    }
} catch (err) {
    goService.setResponseNegative("Failed to execute action: " + err.toString());
}
