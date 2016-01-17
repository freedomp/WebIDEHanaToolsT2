/**
 * Created by I074932 on 05/08/2015.
 */
// Copyright (c) 2009-2014 SAP SE, All Rights Reserved

(function () {
    "use strict";
    /*global jQuery, sap, setTimeout, clearTimeout */
    /*jslint plusplus: true, nomen: true */
    sap.ui.controller("sap.ushell.renderers.fiori2.defaultParameters_selector.DefaultParameters", {

        onInit: function () {

            this.oModelRecords = {}; // a map of models
            this.oChangedParameters = {}; // a Map of all parameters changed by the control
            this.oBlockedParameters = {}; // parmeters of odata models which are not yet filled with "our" value
            this.aDisplayedUserDefaults = []; // array of displayed parameters, in order

            var that = this;
            this.DefaultParametersService = sap.ushell.Container.getService("UserDefaultParameters");

            this.DefaultParametersService.editorGetParameters().done(function (oParameters) {
                // a json model for the "conventional" ( = non odata parameters)
                that.oMdlParameter = new sap.ui.model.json.JSONModel(oParameters);
                that.oMdlParameter.setDefaultBindingMode("TwoWay");
                that.getView().setModel(that.oMdlParameter, "MdlParameter");
                // take a deep copy of the original parameters
                that.oOriginalParameters = jQuery.extend(true, {}, oParameters);
                // this deep copy maintains the currently (within the editor) altered properties
                that.oCurrentParameters = jQuery.extend(true, {}, oParameters);
                that.constructControlSet(oParameters);
            });
        },
        overrideOdataModelValue: function (oEvent) {
            var sUrl = oEvent.getParameter('url'),
                oModel = oEvent.getSource(),
                sFullPath,
                sFullOdataUrl,
                that = this;
            this.aDisplayedUserDefaults.forEach(function (oRecord) {
                if (oRecord.editorMetadata && oRecord.editorMetadata.editorInfo) {
                    sFullOdataUrl = oRecord.editorMetadata.editorInfo.odataURL + oRecord.editorMetadata.editorInfo.bindingPath;
                    //check if there is a parameter with the same oData URL as the completed request
                    if (sFullOdataUrl === sUrl) {
                        sFullPath = oRecord.editorMetadata.editorInfo.bindingPath + "/" + oRecord.editorMetadata.editorInfo.propertyName;
                        //if the property value in the model is not the same as the one we got from
                        //the service, change the property value accordingly
                        if (oModel.getProperty(sFullPath) !== oRecord.valueObject.value) {
                            oModel.setProperty(sFullPath, oRecord.valueObject.value);
                        }
                        that.oBlockedParameters[oRecord.parameterName] = false;
                    }
                }
            });

        },
        getOrCreateModelForODataService : function (sUrl) {
            if (!this.oModelRecords[sUrl]) {
                var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
                oModel.setCountSupported(false);
                oModel.setDefaultBindingMode("TwoWay");
                oModel.attachRequestCompleted(this.overrideOdataModelValue.bind(this));
                this.oModelRecords[sUrl] = oModel;
            }
            return this.oModelRecords[sUrl];
        },

        constructControlSet : function (oParameters) {
            // sort parameters and remove noneditable ones
            var oUserDefTmp = []; // use an empty array to be able to delete parameters
            //for each property name -> push all array elements into aUserDef
            for (var sParameter in oParameters) {
                //loop oUserDefTmp and search for an already existing parameter name
                for (var n = 0; n < oUserDefTmp.length; n++) {
                    if (oUserDefTmp[n].parameterName === sParameter) {
                        oUserDefTmp.splice(n, 1);
                    }
                }
                //copy the parameter name because we want to show it in the UI later
                oParameters[sParameter].parameterName = sParameter;
                oUserDefTmp.push(oParameters[sParameter]);
            }
            this.sortParametersByGroupIdParameterIndex(oUserDefTmp);

            this.aDisplayedUserDefaults = oUserDefTmp;
            //
            this.sForm = new sap.ui.comp.smartform.SmartForm( {
                editable: true
            });

            this.getView().addContent(this.sForm);
        },

        getValue: function () {
            var deferred = jQuery.Deferred();

            var defaultParameters = sap.ushell.Container.getService("UserDefaultParameters").editorGetParameters();
            defaultParameters.done(function (oParameters) {
                deferred.resolve({
                    value: Object.keys(oParameters).length,
                    displayText: ""
                });
            });

            defaultParameters.fail(function (sErrorMessage) {
                deferred.reject(sErrorMessage);
            });

            return deferred.promise();
        },

        createPlainModel : function(grpel, oRecord) {
            oRecord.modelBind.model = this.oMdlParameter;
            grpel.setModel(oRecord.modelBind.model);
            var oModelPath = "/sUserDef_" + oRecord.nr + "_";
            oRecord.modelBind.sFullPropertyPath = oModelPath;
            oRecord.modelBind.sPropertyName =  "{" + oModelPath + "}";
            oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath, oRecord.valueObject.value);
        },

        revertToPlainModelControls : function(grpel, oRecord) {
            jQuery.sap.log.error("Metadata loading for parameter " + oRecord.parameterName + " failed" + JSON.stringify(oRecord.editorMetadata));// metadata loading for the model intended for this control failed
            // -> instead display as plain
            // switch model binding: 
            oRecord.modelBind.isOdata = false;
            this.createPlainModel(grpel, oRecord);
            // switch to create other controls
            this.createAppropriateControl(grpel,oRecord);
            // currently the blocking is timer based, so it will always happen
            // if this is changed to an odata model event, we must remove the block here
        },

        getContent: function () {
            jQuery.sap.require('sap.ui.model.odata.v2.ODataModel');
            var deferred = new jQuery.Deferred();
            var lastGroup = "nevermore";
            var grp; // the current group;
            this.aChangedParameters = [];

            this.setPropValue = function (oRecord) {
                oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath, oRecord.valueObject.value);
                this.oBlockedParameters[oRecord.parameterName] = false;
            };
            this.oMdlParameter.setProperty("/sUser");
            for (var i = 0; i < this.aDisplayedUserDefaults.length; ++i) {
                var oRecord = this.aDisplayedUserDefaults[i];
                oRecord.nr = i;
                oRecord.editorMetadata = oRecord.editorMetadata || {};
                oRecord.valueObject = oRecord.valueObject || {value: ""};
                var grpel = new sap.ui.comp.smartform.GroupElement({});

                if (lastGroup != oRecord.editorMetadata.groupId) {
                    // generate a group on group change
                    grp = new sap.ui.comp.smartform.Group({ label : oRecord.editorMetadata.groupTitle || "no Title", "editable" : true});
                    lastGroup = oRecord.editorMetadata.groupId;
                    this.sForm.addGroup(grp);
                }
                grp.addGroupElement(grpel);
                oRecord.modelBind = {
                        model : undefined, // the model
                        sModelPath : undefined, // path into the model to the property value         "/sUserDef_<i>_/" or  "/UserDefaults('FIN')/CostCenter
                        sPropertyName : undefined, // the property binding statement , e.g. {xxxx} to attach to the control
                        sFullPropertyPath : undefined // path into the model to the property value
                    };

                // normalize the value, in the editor, undefined is represented as "" for now, 
                // (check if we can make this better!
                oRecord.valueObject.value = oRecord.valueObject.value || "";

                if (oRecord.editorMetadata.editorInfo && oRecord.editorMetadata.editorInfo.propertyName) {
                    oRecord.modelBind.isOdata = true;
                    var sUrl = oRecord.editorMetadata.editorInfo.odataURL;
                    oRecord.modelBind.model = this.getOrCreateModelForODataService(sUrl);
                    grpel.setModel(oRecord.modelBind.model);
                    //oModelPath = oRecord.editorMetadata.editorInfo.bindingPath;
                    grpel.bindElement(oRecord.editorMetadata.editorInfo.bindingPath);
                    // oDataModel.read(oModelPath);
                    oRecord.modelBind.sPropertyName = "{" + oRecord.editorMetadata.editorInfo.propertyName + "}";
                    oRecord.modelBind.sFullPropertyPath = oRecord.editorMetadata.editorInfo.bindingPath + "/" + oRecord.editorMetadata.editorInfo.propertyName;
                } else {
                    this.createPlainModel(grpel, oRecord);
                }

                oRecord.valueObject.value = oRecord.valueObject.value || "";
                oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath,oRecord.valueObject.value);
                // before we have set "our" value, we do not want to listen/react on values
                // within the control, thus we "block" the update
                if (oRecord.modelBind.isOdata) {
                    this.oBlockedParameters[oRecord.parameterName] = true;
                    oRecord.modelBind.model.attachMetadataLoaded(this.createAppropriateControl.bind(this,grpel,oRecord));
                    oRecord.modelBind.model.attachMetadataFailed(this.revertToPlainModelControls.bind(this,grpel,oRecord));
                } else {
                    this.createAppropriateControl(grpel, oRecord);
                }
                //oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath,oRecord.valueObject.value);
                oRecord.modelBind.model.bindTree(oRecord.modelBind.sFullPropertyPath).attachChange(this.storeChangedData.bind(this));
            }
            this.oMdlParameter.bindTree("/").attachChange(this.storeChangedData.bind(this));
            deferred.resolve(this.getView());

            return deferred.promise();
        },

        createAppropriateControl : function(grpel, oRecord) {
            var sf, lbl;
            // grpel
            jQuery.sap.log.debug("Creating controls for parameter" + oRecord.parameterName + " type " + oRecord.modelBind.isOdata);
            var aElements = grpel.getElements().slice();
            aElements.forEach(function(oElement) {
                // at time or writing, the removeElement call was flawed
               grpel.removeElement(oElement);
            });
            var aFields = grpel.getFields().slice();
            aFields.forEach(function(oElement) {
               grpel.removeField(oElement);
            });
            if (oRecord.modelBind.isOdata && oRecord.editorMetadata.editorInfo) {
                sf = new sap.ui.comp.smartfield.SmartField({
                    value: oRecord.modelBind.sPropertyName,
                    name: oRecord.parameterName
                });
            } else {
                sf = new sap.m.Input({ name: oRecord.parameterName, value : oRecord.modelBind.sPropertyName , type : "Text"});
                lbl = new sap.ui.comp.smartfield.SmartLabel({
                    text: oRecord.editorMetadata.displayText || oRecord.parameterName,
                    tooltip: oRecord.editorMetadata.description || oRecord.parameterName
                });
                lbl.setLabelFor(sf);
                grpel.addElement(lbl);
                this.setPropValue(oRecord);
            }
            sf.attachChange(this.storeChangedData.bind(this));
            grpel.addElement(sf);
        },

        /**
         * Sorts the array parameter aUserDefTmp in situ
         * by respective criteria to achieve a display order
         * @param {array} aUserDefTmp list or parameters
         */
        sortParametersByGroupIdParameterIndex : function(aUserDefTmp) {
            // compare by groupId
            function compareByGroupId(oDefault1, oDefault2) {
                // handle default without metadata
                if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.groupId)) {
                    return -1; // keep order
                }
                if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.groupId)) {
                    return 1; // move oDefault1 to the end
                }

                if (oDefault1.editorMetadata.groupId < oDefault2.editorMetadata.groupId) { return -1; }
                if (oDefault1.editorMetadata.groupId > oDefault2.editorMetadata.groupId) { return 1; }

                return 0;
            }
            // compare by parameterIndex
            function compareByParameterIndex(oDefault1, oDefault2) {
                // handle default without metadata
                if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.parameterIndex)) {
                    return -1; // keep order
                }
                if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.parameterIndex)) {
                    return 1; // move oDefault1 to the end
                }
                return oDefault1.editorMetadata.parameterIndex - oDefault2.editorMetadata.parameterIndex;
            }

            // sort by groupid, parameterindex
            aUserDefTmp.sort(function(oDefault1, oDefault2) {
                //first by groupId
                var returnValueOfCompareByGroupId = compareByGroupId(oDefault1, oDefault2);
                if (returnValueOfCompareByGroupId === 0) {
                    //then by parameterIdx
                    return compareByParameterIndex(oDefault1, oDefault2);
                }
                return returnValueOfCompareByGroupId;
            });
        },

        // this funciton is invoked on any model data change
        // ( be it in an odata model or in the plain JSON fallback model
        // we always run over all parameters and record the ones with a delta
        // we change *relevant* deltas compared to the data when calling up the dialogue
        // note that the valueObject may contain other relevant metadata!
        // (which is *not* altered by the Editor Control),
        // thus it is important not to overwrite or recreate the valueObject, but only set the
        // value property
        storeChangedData: function() {
            var i = 0,
                that = this,
                arr = that.aDisplayedUserDefaults,
                aCheckList = this.sForm.check(),
                oSaveBtn = sap.ui.getCore().byId("saveButton");

            oSaveBtn.setEnabled(!aCheckList.length);

            // check for all changed parameters...
            for (i = 0; i < arr.length; ++i) {
                var pn = arr[i].parameterName;
                if (!that.oBlockedParameters[pn]) {
                    var oldValue = that.oCurrentParameters[pn].valueObject && that.oCurrentParameters[pn].valueObject.value;
                    if (arr[i].modelBind && arr[i].modelBind.model) {
                        var oDataMdl = arr[i].modelBind.model;
                        var oPropPath = arr[i].modelBind.sFullPropertyPath;
                        var pActValue = oDataMdl.getProperty(oPropPath);
                        if (this.isValueDifferent({ value: pActValue}, { value: oldValue})) {
                            that.oCurrentParameters[pn].valueObject.value = pActValue;
                            that.oChangedParameters[pn] = true;
                        }
                    }
                }
            }
        },


        onCancel: function () {
            sap.ui.getCore().byId("saveButton").setEnabled(true);
        },

        isValueDifferent : function(oValueObject1, oValueObject2) {
            if (oValueObject1 === oValueObject2) {
                return false;
            }
            if (oValueObject1 === undefined ) {
                return false;
            }
            if (oValueObject2 === undefined ) {
                return false;
            }
            // for the editor, "" and undefined are the same!
            if (oValueObject1.value === "" && oValueObject2.value === undefined) {
                return false;
            }
            if (oValueObject2.value === "" && oValueObject1.value === undefined) {
                return false;
            }
            return (oValueObject1.value !== oValueObject2.value);
        },

        onSave: function () {
            var deferred = new jQuery.Deferred(),
                i,
                aChangedParameterNames = Object.keys(this.oChangedParameters).sort(),
                oSetValuePromise,
                pn;
            // we change the effectively changed parameters, once, in alphabetic order
            for (i = 0; i < aChangedParameterNames.length; i++) {
                pn = aChangedParameterNames[i];
                //only if effectively changed:
                if ( this.isValueDifferent(this.oOriginalParameters[pn].valueObject, this.oCurrentParameters[pn].valueObject)) {
                    // as the editor does not distinguish empty string from deletion, and has no "reset" button
                    // we drop functionality to allow to set a value to an empty string (!in the editor!)
                    // and map an empty string to an effective delection!
                    // TODO: make sure all controls allow to enter an empty string as an "valid" value
                    if (this.oCurrentParameters[pn].valueObject === "" ||
                        (this.oCurrentParameters[pn].valueObject && this.oCurrentParameters[pn].valueObject.value === "")) {
                        oSetValuePromise = sap.ushell.Container.getService("UserDefaultParameters").editorSetValue(pn, undefined);
                    } else {
                        oSetValuePromise = sap.ushell.Container.getService("UserDefaultParameters").editorSetValue(pn, this.oCurrentParameters[pn].valueObject);
                    }
                    oSetValuePromise.done(deferred.resolve);
                    oSetValuePromise.fail(deferred.reject);
                }
            }
            return deferred.promise();
        }

    });
}());