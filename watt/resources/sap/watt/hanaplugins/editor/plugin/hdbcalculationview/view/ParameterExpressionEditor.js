/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/commands", "../../../common/expressioneditor/calcengineexpressioneditor/CalcEngineExpressionEditor"], function(ResourceLoader, commands, CalcEngineExpressionEditor) {
    "use strict";

    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
    var ParameterExpressionEditor = function(attributes) {
        this.undoManager = attributes.undoManager;
        this.inputParameter = attributes.inputParameter;
        this.view = attributes.view;
        this.callBack = attributes.callBack;
        this.defaultRange = attributes.defaultRange;
        this.expressionEditor;
        this.modelUpdate = true;
        this.language;

    };
    ParameterExpressionEditor.prototype = {
        _execute: function(commands) {
            this.undoManager.execute(commands);
        },
        getContent: function() {
            var that = this;
            var headerLayout = new sap.ui.commons.layout.MatrixLayout({
                width: "100%",
                //   height: "100%",
                widths: ["40%", "60%"]
            }).addStyleClass("detailsHeaderStyle").addStyleClass("parameterExpressionHeaderStyle");

            var backButton = new sap.ui.commons.Button({
                icon: "sap-icon://navigation-left-arrow",
                text: resourceLoader.getText("tol_back"),
                tooltip: resourceLoader.getText("tol_back"),
                press: function(oevent) {
                    if (that.callBack) {
                        that.callBack(that.getExpression(), false);
                    }
                }
            }).addStyleClass("backButton")

            var oFixFlex = new sap.ui.layout.FixFlex({});

             this.headerLabel = new sap.ui.commons.Label({
                text: resourceLoader.getText("txt_expression_editor"), // + " (" + this.inputParameter?this.inputParameter.name:""+ ")",
                design: sap.ui.commons.LabelDesign.Bold
            });

            headerLayout.createRow(backButton, this.headerLabel);
            headerLayout.addStyleClass("expressionEditorHeader");

            this.expressionEditor = CalcEngineExpressionEditor.createExpressionEditor(true, true, true);

            this.expressionEditor.setLanguageSelectionEnabled(true);
			this.expressionEditor.attachEvent("change", function(event) {
				if (that.modelUpdate) {
					var language = event.getSource()._editorTextArea.getLanguage();
					if (language === "TREX") {
						language = "COLUMN_ENGINE";
					}
					that._execute(new commands.ChangeParameterDefaultRangeCommand(that.inputParameter.name, that.defaultRange.$getKeyAttributeValue(), {
                        lowValue: that.getExpression(),
                        expressionLanguage: language
        }));

				}
			});
			this.expressionEditor.attachEvent("languageChange", function(event) {
				var language = event.getSource()._editorTextArea.getLanguage();
				if (language === "TREX") {
					language = "COLUMN_ENGINE";
				}
				that._execute(new commands.ChangeParameterDefaultRangeCommand(that.inputParameter.name, that.defaultRange.$getKeyAttributeValue(), {
                    lowValue: that.getExpression(),
                    expressionLanguage: language
			}));

			});
			oFixFlex.setFixContentSize("auto");
			oFixFlex.addFixContent(headerLayout);
			oFixFlex.setFlexContent(this.expressionEditor);

			return oFixFlex;
		},
		setInput: function(parameter) {
			
            if (parameter) {
                this.inputParameter = parameter;
                var expressionLanguage = "TREX";
                if (this.defaultRange && (this.defaultRange.expressionLanguage === "SQL")) {
                                expressionLanguage = this.defaultRange.expressionLanguage;
                } else {
                                expressionLanguage = "TREX";
                }
                this.language = expressionLanguage;
                this.setExpression(this.defaultRange ? this.defaultRange.lowValue : "", parameter.name, expressionLanguage);
}

			
		},
		setExpression: function(value, elementName, language) {
			if (this.expressionEditor && value !== undefined) {
				this.modelUpdate = false;
				this.expressionEditor.setExpression(value);
				if (language === undefined) {
					language = this.language;
				}
				this.expressionEditor.setLanguage(language);
				if (elementName && this.headerLabel) {
					this.headerLabel.setText(resourceLoader.getText("txt_expression_editor") + "(" + elementName + ")");
				}
				this.modelUpdate = true;
			}
		},
		getExpression: function() {
			if (this.expressionEditor) {
				return this.expressionEditor._editorTextArea.getValue();
			}
		}
	};
	return ParameterExpressionEditor;
});