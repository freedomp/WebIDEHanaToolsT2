/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
jQuery.sap.declare('sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup');

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup = function() {

};

sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Popup.prototype.showPopup = function(message) {
    $("<div><p style=\"word-wrap:break-word\">" + message + "</p></div>").dialog({
        dialogClass: "validationResultPopup",
        draggable: false,
        modal: true,
        resizable: false,
        width: 300,
        title: 'Validation Result',
        minHeight: 200,
        buttons: {
            "Ok": function() {
                $(this).dialog("close");
            }
        }
    });
    
    $(".dialog").dialog("open");

};
