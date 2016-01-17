/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/ModelProxyResolver"
    ],
    function(modelbase, ModelProxyResolver) {

        var AddSecuredModel = function(oModel, modelUris, oContext) {
            var command = {};
            command._apeModel = oModel;
            command._modelUris = modelUris;

            command.execute = function(model, events) {

                var that = this;
                var entity = null;
                var entities = [];
                var oData = this._apeModel.getData();
                var index = oData.securedModels.length;
                var offset = oData.securedModels.length;
                
                for (var i = 0; i < this._modelUris.length; i++) {
                    var modelUri = this._modelUris[i];
                    model.analyticPrivilege.addSecuredModel(modelUri);

                    this._apeSecuredModel = {
                        modelUri: modelUri,
                        dimensions: [],
                        metadata: {}
                    };

                    var callbackresults = function() {
                        var elements = entities[index - offset].elements;
                        var dimensions = [];
                        oData.securedModels[index].metadata = elements;

                        var sModelUri = modelUri;
                        var aUriParts = sModelUri.split("/");
                        var sModelType = aUriParts[2];
                        for (var j = 0; j < elements.size(); j++) { 
                            if (elements.getAt(j).sharedDimension !== undefined) {
                             // Code for Repo 1 XS1 	
                                /*var sharedDimensionName = elements.getAt(j).sharedDimension;
                                var aDimUriParts = sharedDimensionName.split("::");
                                var sPackagename = aDimUriParts[0];
                                var sDimensionName = aDimUriParts[1];
                                var sDimensionType = null;
                                if (sModelType === "calculationviews") {
                                    sDimensionType = "calculationviews";
                                } else {
                                    sDimensionType = "attributeviews";
                                }

                                var sDimensionUri = "/" + sPackagename + "/" + sDimensionType + "/" + sDimensionName;
                                if (dimensions.indexOf(elements.getAt(j).sharedDimension) < 0) {
                                    dimensions.push(sDimensionUri);
                                }*/

                            	
                            	// Code for Repo 2  XS advanced
                            	
                            	var sharedDimensionName = elements.getAt(j).sharedDimension;
                            	if (dimensions.indexOf(elements.getAt(j).sharedDimension) < 0) {
                                    dimensions.push(sharedDimensionName);
                                }
                            	
                            }
                        }

                        oData.securedModels[index].dimensions = dimensions;
                        index++;
                    };

//                    var aUriParts = modelUri.split("/");
//                    var sPackageName = aUriParts[1];
//                    var sType = aUriParts[2].substring(0, aUriParts[2].length - 1).toUpperCase();
//                    var sDataSourceName = aUriParts[3];
                    
                    var sDataSourceName = modelUri;
                    
                    entities[i]  = oModel.oOriginalModel.createEntity({
                        name: sDataSourceName,
						id: sDataSourceName,
//                      packageName: sPackageName, 
                        type: "CALCULATIONVIEW",
                        isProxy: true
                    });
                    entities[i].isProxy = true;

                    ModelProxyResolver.ProxyResolver.resolve(oModel.oOriginalModel, oContext, callbackresults);


                    oData.securedModels.push(this._apeSecuredModel);
                }

                this._apeModel.checkUpdate();

                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            command.undo = function(model, events) {

                for (var i = 0; i < this._modelUris.length; i++) {
                    var modelUri = this._modelUris[i];
                    model.analyticPrivilege.securedModels.modelUris.get(modelUri).$remove();
                }

                var oData = this._apeModel.getData();
                oData.securedModels = this._apeModel.parseSecuredModels(oData._apeModel, oContext);
                this._apeModel.checkUpdate();

                events.push({
                    source: model.analyticPrivilege,
                    type: "changed",
                    name: model.analyticPrivilege.name,
                    changed: true
                });
            };
            return command;
        };
        return AddSecuredModel;
    });
