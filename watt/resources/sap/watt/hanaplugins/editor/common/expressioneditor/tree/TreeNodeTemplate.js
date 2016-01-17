/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.commons.TreeNode.extend("sap.watt.hanaplugins.editor.common.expressioneditor.TreeNodeTemplate", {

    init: function() {
        this.bindProperty("text", "label");
        this.setExpanded(false);

        this.addCustomData(new sap.ui.core.CustomData({
            key: "id",
            value: "{id}",
            writeToDom: true
        }));

        var valuehelp = new sap.ui.core.CustomData({
            key: "valuehelp",
            writeToDom: true
        });

        valuehelp.bindProperty("value", {
            parts: ["valuehelp"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;

            }
        });

        this.addCustomData(valuehelp);
        
        var elementType = new sap.ui.core.CustomData({
            key: "elementType",
            writeToDom: true
        }); 

        elementType.bindProperty("value", {
            parts: ["elementType"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;

            }
        });

        this.addCustomData(elementType);
        
        var datatype = new sap.ui.core.CustomData({
            key: "datatype",
            writeToDom: true
        }); 

        datatype.bindProperty("value", {
            parts: ["datatype"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;

            }
        });

        this.addCustomData(datatype);
        
         var label = new sap.ui.core.CustomData({
            key: "label",
            writeToDom: true
        });

        label.bindProperty("value", {
            parts: ["label"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text; 
                }
                return oResult;

            }
        });

        this.addCustomData(label);

        var nodeType = new sap.ui.core.CustomData({
            key: "nodetype",
            writeToDom: true
        });

        nodeType.bindProperty("value", {
            parts: ["nodetype"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;
            }
        });

        this.addCustomData(nodeType);

        var separator = new sap.ui.core.CustomData({
            key: "separator",
            writeToDom: true
        });

        separator.bindProperty("value", {
            parts: ["separator"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;
            }
        });

        this.addCustomData(separator);

        var separatorStart = new sap.ui.core.CustomData({
            key: "separatorstart",
            writeToDom: true
        });

        separatorStart.bindProperty("value", {
            parts: ["separatorStart"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;
            }
        });

        this.addCustomData(separatorStart);

        var separatorEnd = new sap.ui.core.CustomData({
            key: "separatorend",
            writeToDom: true
        });

        separatorEnd.bindProperty("value", {
            parts: ["separatorEnd"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;
            }
        });

        this.addCustomData(separatorEnd);

        var iconpath = new sap.ui.core.CustomData({
            key: "iconpath",
            writeToDom: true
        });

        iconpath.bindProperty("value", {
            parts: ["iconpath"],
            formatter: function(text) {
                var oResult = "";
                if (text !== undefined) {
                    oResult = text;
                }
                return oResult;
            }
        });

        this.addCustomData(iconpath);


        this.bindAggregation("nodes", "{children}", this);
        this.bindProperty("icon", "iconpath");
        //this.setIcon(this.iconpath);

    }

});
