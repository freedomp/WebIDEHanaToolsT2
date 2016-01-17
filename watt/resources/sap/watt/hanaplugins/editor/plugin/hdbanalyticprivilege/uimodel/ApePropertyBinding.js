/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/RootName",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/RootLabel",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/RootAllInformationModels",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ValidityFrom",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ValidityTo",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ValidityIncluding",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ValidityOperator",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeRestrictionOperator",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeRestrictionType",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeRestrictionValue",
        "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlChangeProcedureType"
    ],
    function(
        RootName, 
        RootLabel,
        RootAllInformationModels,
        ValidityFrom,
        ValidityTo,
        ValidityIncluding,
        ValidityOperator,
        ChangeRestrictionOperator,
        ChangeRestrictionType,
        ChangeRestrictionValue,
        SqlChangeProcedureType) {

        jQuery.sap.require("sap.ui.model.ClientPropertyBinding");
        var ClientPropertyBinding = sap.ui.model.ClientPropertyBinding;
        var ApePropertyBinding = ClientPropertyBinding
            .extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.uimodel.ApePropertyBinding");

        ApePropertyBinding.prototype.setValue = function(oValue) {
            var that = this;
            var oData = that.getModel().getData();
            if (!jQuery.sap.equal(this.oValue, oValue)) { 
            
            var oContext = this.getContext();
                if (!this.getContext()) {
                    //root node
                    switch(this.sPath){
                        case "name":
                            this.getModel().getData()._undoManager.execute(new RootName(oData, oValue));
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        case "label":
                            this.getModel().getData()._undoManager.execute(new RootLabel(oData, oValue));
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        case "allInformationModels":
                            this.getModel().getData()._undoManager.execute(new RootAllInformationModels(oData, oValue));
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        case "procedureType":
                            this.getModel().getData()._undoManager.execute(new SqlChangeProcedureType(oData,oValue)); 
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        case "conditionProcedureName":
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        default:
                            //console.log("WARNING unhandled property binding for: " + this.sPath);
                    }
                    
                } else if (oContext.sPath.match("/validities")) {
                    //validities
                    var oObject = this.getContext().getObject();
                    
                    switch(this.sPath){
                        case "operator":
                            this.getModel().getData()._undoManager.execute(new ValidityOperator(oObject, oValue, this.getModel()));
                            this.getModel().setProperty(this.sPath, oValue, this.oContext);
                            break;
                        case "including":
                            this.getModel().getData()._undoManager.execute(new ValidityIncluding(oObject, oValue));
                            this.getModel().setProperty(this.sPath, oValue, this.oContext);
                            break;
                        case "lowValue":
                            this.getModel().getData()._undoManager.execute(new ValidityFrom(oObject, oValue));
                            this.getModel().setProperty(this.sPath, oValue, this.oContext);
                            break;
                        case "highValue":
                            this.getModel().getData()._undoManager.execute(new ValidityTo(oObject, oValue));
                            this.getModel().setProperty(this.sPath, oValue, this.oContext);
                            break;
                    }

                } else if (oContext.sPath.match("/restrictions")) {
                    //restrictions
                    
                    switch(this.sPath){

                        case "type":
                            var oCmdChangeRestrictionType = new ChangeRestrictionType(oValue, that.getContext());
                            that.getModel().getData()._undoManager.execute(oCmdChangeRestrictionType); 
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        case "operator":
                            var oCmdRestrictionOperator = new ChangeRestrictionOperator(oValue, this.getContext());
                            this.getModel().getData()._undoManager.execute(oCmdRestrictionOperator);
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            break;
                        case "value":
                            var oCmdChangeRestrictionValue = new ChangeRestrictionValue(oValue, this.getContext());
                            this.getModel().getData()._undoManager.execute(oCmdChangeRestrictionValue);
                            this.getModel().setProperty(this.sPath, oValue, this.getContext());
                            var oObject = this.getContext().getObject();
                            break;
                        
                    }  
 
                } else {
                    var oObject = this.getContext().getObject();
                    // not yet handled by command stack
                    console.log("WARNING (" + this.sPath + ") is not yet handeld by command stack");
                    oObject._apeObject[this.sPath] = oValue;
                }


                // change value
                // nothing happens here. value already changed
                // before this method
                // was called
                //this.oModel.setProperty(this.sPath, oValue, this.oContext);
            }
        };

        ApePropertyBinding.prototype.checkUpdate = function(bForceupdate) {
            var oValue = this._getValue();
            // if (!jQuery.sap.equal(oValue, this.oValue) ||
            // bForceupdate) {
            this.oValue = oValue;
            this._fireChange({
                reason: sap.ui.model.ChangeReason.Change
            });
            // }
        };

        return ApePropertyBinding;

    });
