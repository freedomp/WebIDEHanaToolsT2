/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.declare('sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser');

function NotAnElementException(operand) {
    this.operand = operand;
}

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser = function() {
    // Instance Variables
    this.operandDatatypeMap = null;
};

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser.prototype.validateExpression = function(expressioneditor) {

    jQuery.sap.require("sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup");
    var that = this;
    var result = "";

    try {
        var language = expressioneditor.getLanguage();
        var operands = that.getOperands(expressioneditor.getExpression());
        that.createOperandDataTypeMap(expressioneditor.getElementModel());
        var operandDatatypeString = that.createOperandDataTypeString(operands);

        require(["sap/hana/ide/editor/plugin/hanabackend/io/Request"], function(ioRequest) {
            var expression = expressioneditor.getExpression();
            var expressionArray = expression.split("+");
            var newExpression = "";
            for (var i = 0; i < expressionArray.length; i++) {
                newExpression += expressionArray[i];
                if (i < expressionArray.length - 1) {
                    newExpression += "%2B"; 
                }

            }
            if(language === "SQL"){
                ioRequest.send("/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/validation/serviceAPI.xsjs?action=validateSQLExpression&expression=" + newExpression + "&operanddatatypes=" + operandDatatypeString, "GET").then(
                function(ioResults) {
                    var popup = new sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup();
                    popup.showPopup("Valid expression");
                }, function(ioError) {
                    var popup = new sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup();
                    popup.showPopup("Invalid expression: " + "</br>" + that.parseErrorResponseText(ioError.responseText));
                });
            }else if(language === "COLUMN_ENGINE" || language === "TREX"){
                ioRequest.send("/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/validation/serviceAPI.xsjs?action=validateExpression&expression=" + newExpression + "&operanddatatypes=" + operandDatatypeString, "GET").then(
                function(ioResults) {
                    var popup = new sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup();
                    popup.showPopup("Valid expression");
                }, function(ioError) {
                    var popup = new sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup();
                    popup.showPopup("Invalid expression: " + "</br>" + that.parseErrorResponseText(ioError.responseText));
                });
            }
            
        });
    } catch (e) {
        if (e instanceof NotAnElementException) {
            var popup = new sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup();
            popup.showPopup("Invalid expression: " + e.operand + " is not an Element. Please choose the operands from the Element-list");
        }
    }

};

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser.prototype.getOperands = function(expression) {
    var startIndexOfOperand = 0;
    var endIndexOfOperand = 0;
    var startSet = false;
    var operands = [];

    for (var i = 0; i < expression.length; i++) {
        if (expression[i] === "\"" || expression[i] === "\'") {
            if (startSet === false) {
                startIndexOfOperand = i + 1;
                startSet = true;
            } else {
                endIndexOfOperand = i;
                startSet = false;
                operands.push(expression.substring(startIndexOfOperand, endIndexOfOperand));
            }
        }
        else if (expression[i] === "$" && expression[i + 1] === "$" && expression[i - 1] !== "\'" && expression[i + 2] !== "\'") {
            if (startSet === false) {
                startIndexOfOperand = i + 2;
                startSet = true;
            } else {
                endIndexOfOperand = i;
                startSet = false;
                operands.push(expression.substring(startIndexOfOperand, endIndexOfOperand));
            }
        }
    }
    return operands;
};

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser.prototype.createOperandDataTypeMap = function(elementModel) {
    var operandDatatypeMap = {};
    var that = this;

    if (elementModel !== undefined) {
        var elementArray = elementModel.oData.elements.data;
        for (var i = 0; i < elementArray.length; i++) {
            if (elementArray[i].children !== null) {
                var childArray = elementArray[i].children;
                for (var j = 0; j < childArray.length; j++) {
                    operandDatatypeMap[childArray[j].label] = childArray[j].datatype;
                }
            }
        }
    } else {
        operandDatatypeMap = null;
    }
    that._operandDatatypeMap = operandDatatypeMap;
};

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser.prototype.createOperandDataTypeString = function(operands) {
    var operandDatatypeMap = this._operandDatatypeMap;
    var operandDatatypeString = "";
    if (operandDatatypeMap !== null) {
        for (var i = 0; i < operands.length; i++) {
            var operand = operands[i];
            if (operandDatatypeMap[operand] !== null && operandDatatypeMap[operand] !== undefined) {
                operandDatatypeString = operandDatatypeString + "\"" + operands[i] + "\"" + " " + operandDatatypeMap[operand] + ",";
            } else {
                operandDatatypeString = operandDatatypeString + "\"" + operands[i] + "\"" + " " + "VARCHAR" + ",";
                //throw new NotAnElementException(operand);
            }
        }
        operandDatatypeString = operandDatatypeString.substring(0, operandDatatypeString.length - 1);
    } else {
        for (var i = 0; i < operands.length; i++) {
            operandDatatypeString = operandDatatypeString + "\"" + operands[i] + "\"" + " " + "VARCHAR" + ",";
        }
        operandDatatypeString = operandDatatypeString.substring(0, operandDatatypeString.length - 1);
    }
    return operandDatatypeString;
};

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser.prototype.parseErrorResponseText = function(responseText) {

    var indexOfEval = responseText.indexOf("Evaluator: ");
    var indexOfStart = indexOfEval + 10;
    var indexOfExpected = responseText.indexOf("expected");
    var errorText = "";
    var res = responseText.replace(/\\n/, "</br>");
    res = res.replace(/\\/g, "");
    
    if (indexOfExpected !== -1) {
        errorText = res.substring(indexOfStart, indexOfExpected); 
        errorText += "</br>";
        errorText += res.substring(indexOfExpected);
    }else{
        errorText = res.substring(indexOfStart);
    }
    return errorText;
};
