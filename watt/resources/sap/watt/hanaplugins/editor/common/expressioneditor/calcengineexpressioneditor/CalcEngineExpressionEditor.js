/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(['../rndexpressioneditor/ExpressionEditorRND'], function(ExpressionEditorRND) {


    return {
        createExpressionEditor: function(useDefaultFunctionModel, useDefaultOperatorModel, useDefaultValuehelpModel, language) {
            jQuery.sap.require('sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser');
            
            var sLanguage = language;
            if(sLanguage === undefined){
                sLanguage = "TREX";
            }
            var expressionEditor = new ExpressionEditorRND({
                language: sLanguage
            });

            if (useDefaultFunctionModel) {
                var functionModel = new sap.ui.model.json.JSONModel();
                var sqlFunctionModel = new sap.ui.model.json.JSONModel();

                sqlFunctionModel.loadData("/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/models/sqlExpressions/sqlFunctionModel.json", null, false);
                expressionEditor.setSqlFunctionModel(sqlFunctionModel);

                //The CalcEngineExpressionLanguage will be the default
                functionModel.loadData("/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/models/defaultFunctionModel.json", null, false);
                expressionEditor.setFunctionModel(functionModel); 
            }

            if (useDefaultOperatorModel) {
                var operatorModel = new sap.ui.model.json.JSONModel();
                if (language === "SQL") {
                    operatorModel.loadData("/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/models/defaultOperatorModel.json", null, false);
                    expressionEditor.setOperatorModel(operatorModel);
                } else {
                    operatorModel.loadData("/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/models/defaultOperatorModel.json", null, false);
                    expressionEditor.setOperatorModel(operatorModel);
                }

            }

            if (useDefaultValuehelpModel) {
                var valuehelpModel = new sap.ui.model.json.JSONModel();
                var sqlValuehelpModel = new sap.ui.model.json.JSONModel();

                sqlValuehelpModel.loadData("/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/models/sqlExpressions/sqlValueHelpModel.json", null, false);
                expressionEditor.setSqlValuehelpModel(sqlValuehelpModel);

                valuehelpModel.loadData("/watt/resources/sap/watt/hanaplugins/editor/common/expressioneditor/calcengineexpressioneditor/models/defaultValuehelpModel.json", null, false);
                expressionEditor.setValuehelpModel(valuehelpModel);
            }

            //Implements the validation-function which needs to be passed on to the expression editor in order to enable the validation
            var expressionParser = new sap.watt.hanaplugins.editor.common.expressioneditor.calcengineexpressioneditor.validation.Expressionparser();

            expressionEditor.setValidateExpression(function() {
                expressionParser.validateExpression(expressionEditor);
            });
            return expressionEditor;
        }
    };
});
