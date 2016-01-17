jQuery.sap.declare("sap.watt.hana.project.hanawizardsteps.ui.wizard.XS2ServicesStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");


sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.hana.project.hanawizardsteps.ui.wizard.XS2ServicesStepContent", {

    SERVICE_NAME_ILLEGAL_CHARACTERS: /[^\w-]/,
    serviceAlreadyErrorMsg : "A service instance with this name already exists.",
    serviceIllegalNameErrorMsg : "Invalid name. Names cannot include white spaces and special characters.",
    sPlan : "hdi-shared",
    sProvider : "hana",


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

        var nameSpcaeLabel = new sap.ui.commons.Label({
            text: "Namespace:",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L4 M4 S12"
            })
        }).addStyleClass("wizardBody");

        this.namespaceTextField = new sap.ui.commons.TextField({
            value: "{/namespace}",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L5 M8 S12"
            }),
            accessibleRole: sap.ui.core.AccessibleRole.Textbox
        });

        oGroupContentGrid.addContent(nameSpcaeLabel);
        oGroupContentGrid.addContent(this.namespaceTextField);


        var serviceLabel = new sap.ui.commons.Label({
            text: "SAP HANA Container Service:",
            width: "100%",
            layoutData: new sap.ui.layout.GridData({
                span: "L4 M4 S12",
                linebreak: true
            })
        }).addStyleClass("wizardBody");

        this.serviceTextField = new sap.ui.commons.TextField({
            value: "{/DIContainerService}",
            width: "100%",
            liveChange: function(oEvent) {
                that._validateXS2DIService(oEvent).fail();
            },
            layoutData: new sap.ui.layout.GridData({
                span: "L5 M8 S12"
            }),
            accessibleRole: sap.ui.core.AccessibleRole.Textbox
        });

        oGroupContentGrid.addContent(serviceLabel);
        oGroupContentGrid.addContent(this.serviceTextField);


        this.serviceTextField.addDelegate({
            onBeforeRendering: function() {
                that.serviceTextField.setValue(that.serviceTextField.getLiveValue());
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
        return this._validateXS2DIService();
    },

    _isServiceAlreadyExistInDB: function(sServiceName) {
        var bResult = false;
        if(this.aXS2Services && this.aXS2Services.length >=0) {
            var result = $.grep(this.aXS2Services, function (oService) {
                return oService.name == sServiceName;
            });
            if (result && result.length >= 1) {
                bResult = true;
            }
        }
        return bResult;
    },

    _isServiceNameLegal: function(sName) {
        return !this.SERVICE_NAME_ILLEGAL_CHARACTERS.test(sName);
    },

    _validateXS2DIService: function(oEvent) {
        var sService = this.serviceTextField.getValue().trim();

        if (oEvent) {
            var sValue = oEvent.getParameter("liveValue").trim();
            if (oEvent.getSource() === this.serviceTextField) {
                oEvent.getSource().setValue(sValue);
                sService = sValue;
                return this._checkService(sService);
            }
        } else {
            return this._checkService(sService);
        }
    },

    _checkService: function(sService) {
        var bSuccess = false;
        if (sService.length === 0) {
            this.markAsValid(this.serviceTextField);
            bSuccess = true;
            this.fireValidation({
                isValid: true
            });
        }else if(!this._isServiceNameLegal(sService)){
            this.markAsInvalid(this.serviceTextField);
            bSuccess = false;
            this.fireValidation({
                isValid: false,
                message: this.serviceIllegalNameErrorMsg
            });
        } else if (this._isServiceAlreadyExistInDB(sService)) {
            this.markAsInvalid(this.serviceTextField);
            bSuccess = false;
            this.fireValidation({
                isValid: false,
                message: this.serviceAlreadyErrorMsg
            });
        } else {
            this.getModel().getData().DIContainerService = sService;
            this.markAsValid(this.serviceTextField);
            bSuccess = true;
            this.fireValidation({
                isValid: true
            });
        }
        return Q(bSuccess);
    },

    cleanStep: function() {
        this.serviceTextField.setValue("");
    },

    onBeforeRendering: function() {
        this.serviceAlreadyErrorMsg = this.getContext().i18n.getText("i18n", "xs2ServiceStep_errorServiceInstanceNAmeAlreadyExists");
        this.serviceIllegalNameErrorMsg = this.getContext().i18n.getText("i18n", "xs2ServiceStep_IllegalServiceInstanceName");

        if(!this.serviceTextField.getValue() || this.serviceTextField.getValue().length === 0){
            this.serviceTextField.setValue(this.getModel().getData().projectName);
        }
    },

    renderer: {},

    onAfterRendering: function() {
        var that=this;
        if (!this.aXS2Services) {
            var that = this;
            var oCheBackendXS2ServicesDAO = this.getContext().service.chebackend.XS2ServicesDAO;
            oCheBackendXS2ServicesDAO.getAvailableServices(that.Provider,that.sPlan).then(function(aServices) {
                that.aXS2Services = aServices;
                that._validateXS2DIService();
            }).fail(function(oError){
                that.fireValidation({
                    isValid : false,
                    message : oError.message
                });
            });
        }
    }
});