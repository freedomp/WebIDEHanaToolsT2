jQuery.sap.declare("sap.watt.hana.project.hanawizardsteps.ui.wizard.MTAStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");


sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.hana.project.hanawizardsteps.ui.wizard.MTAStepContent", {

    MTA_VERSION_ILLEGAL_CHARACTERS: /^(0|[1-9]\d*)(\.(0|[1-9]\d*)){2}$/,
    versionIllegalErrorMsg : "The version number must be entered in the form X.Y.Z, where X, Y, and Z are non-negative integers.",


    init: function() {
        var that = this;

        var oDataBindingGrid = new sap.ui.layout.Grid({
            layoutData: new sap.ui.layout.GridData({
                span: "L8 M12 S12"
            })
        }).addStyleClass("dataBindingGrid");

        var oGroupContentGrid = new sap.ui.layout.Grid({
            layoutData: new sap.ui.layout.GridData({
                span: "L12 M12 S12",
                linebreak: true
            })
        });

        var appIDLabel = new sap.ui.commons.Label({
            text: "Application ID:",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L4 M4 S12"
            })
        }).addStyleClass("wizardBody");

        this.appIDTextField = new sap.ui.commons.TextField({
            value: "{/mtaAppId}",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L5 M8 S12"
            }),
            accessibleRole: sap.ui.core.AccessibleRole.Textbox
        });

        oGroupContentGrid.addContent(appIDLabel);
        oGroupContentGrid.addContent(this.appIDTextField);

        var versionLabel = new sap.ui.commons.Label({
            text: "Application Version:",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L4 M4 S12"
            })
        }).addStyleClass("wizardBody");

        this.versionTextField = new sap.ui.commons.TextField({
            value: "{/mtaVersion}",
            width: "100%",
            liveChange: function(oEvent) {
                that._validateMTAVersion(oEvent).fail();
            },
            layoutData: new sap.ui.layout.GridData({
                span: "L5 M8 S12"
            }),
            accessibleRole: sap.ui.core.AccessibleRole.Textbox
        });

        oGroupContentGrid.addContent(versionLabel);
        oGroupContentGrid.addContent(this.versionTextField);


        var descriptionLabel = new sap.ui.commons.Label({
            text: "Description:",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L4 M4 S12",
                linebreak: true
            })
        }).addStyleClass("wizardBody");

        this.descriptionTextField = new sap.ui.commons.TextField({
            value: "{/mtaDescription}",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L5 M8 S12"
            }),
            accessibleRole: sap.ui.core.AccessibleRole.Textbox
        });

        oGroupContentGrid.addContent(descriptionLabel);
        oGroupContentGrid.addContent(this.descriptionTextField);


        this.versionTextField.addDelegate({
            onBeforeRendering: function() {
                that.versionTextField.setValue(that.versionTextField.getLiveValue());
            }
        });



        oDataBindingGrid.addContent(oGroupContentGrid);
        var content = new sap.ui.layout.Grid({
            layoutData: new sap.ui.layout.GridData({
                span: "L12 M12 S12",
                linebreak: true
            }),
            content: [oDataBindingGrid]
        });

        this.addContent(content);
    },


    validateStepContent: function() {
        return this._validateMTAVersion();
    },
    

    _isMTAVersionLegal: function(sVersion) {
        return this.MTA_VERSION_ILLEGAL_CHARACTERS.test(sVersion);
    },

    _validateMTAVersion: function(oEvent) {
        var sVersion = this.versionTextField.getValue().trim();

        if (oEvent) {
            var sValue = oEvent.getParameter("liveValue").trim();
            if (oEvent.getSource() === this.versionTextField) {
                oEvent.getSource().setValue(sValue);
                sVersion = sValue;
                return this._checkVersion(sVersion);
            }
        } else {
            return this._checkVersion(sVersion);
        }
    },

    _checkVersion: function(sVersion) {
        var bSuccess = false;
         if(sVersion.length > 0 && !this._isMTAVersionLegal(sVersion)){
            this.markAsInvalid(this.versionTextField);
            bSuccess = false;
            this.fireValidation({
                isValid: false,
                message: this.versionIllegalErrorMsg
            });
        } else {
            this.getModel().getData().mtaVersion = sVersion;
            this.markAsValid(this.versionTextField);
            bSuccess = true;
            this.fireValidation({
                isValid: true
            });
        }
        return Q(bSuccess);
    },

    cleanStep: function() {
        this.versionTextField.setValue("");
    },

    onBeforeRendering: function() {
        this.versionIllegalErrorMsg = this.getContext().i18n.getText("i18n", "MTA_Step_IllegalVersion");
        if(!this.appIDTextField.getValue() || this.appIDTextField.getValue().length === 0){
            this.appIDTextField.setValue(this.getModel().getData().projectName);
        }
        if(!this.versionTextField.getValue() || this.versionTextField.getValue().length === 0){
            this.versionTextField.setValue("0.0.1");
        }
    },
    renderer: {}
});