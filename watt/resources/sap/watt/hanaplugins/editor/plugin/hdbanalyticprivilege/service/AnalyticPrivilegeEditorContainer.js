/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../model/AnalyticPrivilegeModel",
        "../model/AnalyticPrivilegeXmlParser",
        "../model/AnalyticPrivilegeXmlRenderer",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/XmlSerializer",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/model",
        "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/modelbase",
        "sap/watt/common/plugin/platform/service/ui/AbstractEditor",
        "../uimodel/ApeModel",
        "../view/AnalyticPrivilegeEditor",
        "../model/ModelValidation",
        "sap/watt/ideplatform/che/plugin/chebackend/dao/File",
        "sap/watt/hanaplugins/editor/common/utils/util",
    ],
    function(ResourceLoader, model, xmlParser, xmlRenderer, xmlSerializer, viewmodel, modelbase, AbstractEditor, ApeModel, AnalyticPrivilegeEditor, ModelValidation,FileService,util) {
        "use strict";
        return AbstractEditor.extend("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.service.AnalyticPrivilegEditor", {
 
            constructor: function() {
                AbstractEditor.prototype.constructor.apply(this, arguments);
                this._view = null;
                this._editors = {}; 
                this._editor = null;
                this._document = null;
                this._originalContent = null;
            },

            init: function() {
                this._view = sap.ui.view({
                    viewName: "sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.ViewContainer",
                    type: sap.ui.core.mvc.ViewType.JS
                });
                this._view.addStyleClass("analyticPrivilegeEditorView");
            },

            getContent: function() {
                var that = this;
                return AbstractEditor.prototype.getContent.apply(this, arguments).then(function() {
                    return that._view;
                });
            },

            getFocusElement: function() {
                return this._view;
            },

            open: function(oDocument, forceReload) {
                AbstractEditor.prototype.open.apply(this, arguments);
                this._document = oDocument;
                this.fileService = FileService;
                var that = this;
                var editorAlreadyOpened = true;    
                var key = oDocument.getKeyString();
                
                var editor = this._editors[key];
                
                if(this._editor && this._editor!==editor){
                    this._editor.setBusy(true);
                }
                
                if (!editor) {
                    editorAlreadyOpened = false;  
                    
                    editor = new AnalyticPrivilegeEditor({
                        context : this.context,
                        document : oDocument
                    });
                    
                    this.fillNameSpace(oDocument,editor);
                    this.fillServiceName(oDocument,editor);
                    
                    jQuery.sap.require("jquery.sap.resources");
                    var i18nModel = new sap.ui.model.resource.ResourceModel({
                        bundleUrl : "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/i18n/messageBundle.hdbtextbundle"
                    });
                    editor.setModel(i18nModel, "i18n");
                    
                    //this._view.byId("viewcontainer").addContent(editor);
                    this._editors[key] = editor;
                    forceReload = true;
                } else {
                    editor.setBusy(false);
                }
                this._editor = editor;
                that._view.byId("viewcontainer").removeAllContent();
                oDocument.getContent().then(function(content) {
                    that._originalContent = content;
                    
                    if(!editorAlreadyOpened){
                        var oModel = new model.AnalyticPrivilegeModel(true);
                        xmlParser.parseAnalyticPrivilege(content, oModel, true);
                        oModel.$finishLoading();
                        var oApeModel = new ApeModel(oModel, {
                            modulePath: "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege",
                            serviceName: that._editor.getContext().serviceName,
                            namespace:that._editor.getContext().namespace
                        });
                        that._editor.setModel(oApeModel);
                        
                        var modelEvents = oModel.$getEvents();
                        modelEvents.subscribe(modelbase.ModelEvents.CHANGED, that.onUndoManagerStateChanged, that);
                    }
                    
                    that._view.byId("viewcontainer").addContent(editor);
                    that._view.byId("viewcontainer").addStyleClass("apeViewContainer");
                    oDocument.editor = editor;
                }).done();
            },
            
            onUndoManagerStateChanged: function() {
                // make a dummy change to invalidate the document
                var that = this;
                this._document.getContent().then(function(currValue) {
                    if (!currValue || !that._originalContent) return;
                    that._changed = true;
                    if (currValue.length === that._originalContent.length + 1) {
                        that._document.setContent(that._originalContent + "  ", that.context.self);
                    } else {
                        that._document.setContent(that._originalContent + " ", that.context.self);
                    }
                }).done();
            },

            flush: function() {
                for (var key in this._editors) {
                    if (!this._editors.hasOwnProperty(key)) continue;
                    if (this.isClean()) continue;
                    var editor = this._editors[key];
                    var model = editor.getModel().getData()._apeModel;
                    ModelValidation.validateRestrictions(editor.getModel().getData()); 
                    var xmlDocument = xmlRenderer.renderAnalyticPrivilege(model);
                    var content = xmlSerializer.serializeToString(xmlDocument);
                    var document = editor.getDocument();
                    document.setContent(content, this.context.self);
                }
                
            },

            close: function(oDocument) {
                
                var that = this;
                var originalArguments = arguments;
                var key = oDocument.getEntity().getKeyString();
                var editor = this._editors[key];
                if (editor) {
                    delete this._editors[key];
                    /*
                    editor.close().then(function() {
                        that._getEditorContainer().removeContent(editor.getContent().getId());
                        editor.destroy();
                    }).done();
                    */
                }

                return AbstractEditor.prototype.close.apply(this, originalArguments);
            },

            getTitle: function() {
                return this._document.getEntity().getName();
            },

            getTooltip: function() {
                return this._document.getEntity().getName();
            },

            censor: function(key, value) {
                if (key === undefined || typeof value === "function" || key === "__proto__" || key === "_owner" || key.indexOf("$") === 0) {
                    return undefined;
                }
                return value;
            },

            hasUndo: function() {
                //console.log("ApeContainer hasUndo");
                if(this._editor.getModel()){
				var oData = this._editor.getModel().getData();
                return oData._undoManager.hasUndo();
				}
            },

            hasRedo: function() {
               // console.log("ApeContainer hasRedo");
			  if(this._editor.getModel()){
                var oData = this._editor.getModel().getData();
                return oData._undoManager.hasRedo();
				}
            },

            undo: function() {
                //console.log("ApeContainer undo");
                var oData = this._editor.getModel().getData();
                var result = oData._undoManager.undo();
                this._editor.getModel().setData(oData);
                return result;
            },

            redo: function() {
               // console.log("ApeContainer redo");
                var oData = this._editor.getModel().getData();
                var result = oData._undoManager.redo();
                this._editor.getModel().setData(oData);
                return result;
            },

            markClean: function() {
               // console.log("ApeContainer markClean");
                var oData = this._editor.getModel().getData();
                return oData._undoManager.markClean();
            },

            isClean: function() {
               // console.log("ApeContainer isClean"); 
                var oData = this._editor.getModel().getData();
                return oData._undoManager.isClean();
                /*
                if(this._changed){
                    return false;
                }else{
                    return true;
                }
                */
            },
            
            validateRestrictions: function(model){
                var ModelException = modelbase.ModelException;
                var originalRestrictions = model._apeModel.analyticPrivilege.restrictions;
                
                for(var i = 0; i < originalRestrictions.size(); i++){
                    var restriction = originalRestrictions.getAt(i);
                    if(restriction.originInformationModelUri === "select"){
                        throw new ModelException("No model has been selected for restriction #" + (i + 1) + "." );
                    }
                    if(restriction.attributeName === "select"){
                        throw new ModelException("No attributename has been selected for restriction #" + (i + 1) + "." );
                    } 
                    if(restriction.dimensionUri === "select"){
                        throw new ModelException("No model has been selected for restriction #" + i + "." );
                    }
                    
                    var valueFilters = originalRestrictions.getAt(i).filters.get(restriction.attributeName).valueFilters;
                    var procedureFilters = originalRestrictions.getAt(i).filters.get(restriction.attributeName).procedureFilters;
                    
                    this.validateValueFilters(valueFilters, i + 1);
                    this.validateProcedureFilters(procedureFilters, i + 1);
                }
            },
            
            validateValueFilters: function(valueFilters, restrictionIndex){
                var ModelException = modelbase.ModelException;
                
                for(var i = 0; i < valueFilters.size(); i++){
                    var filter = valueFilters.getAt(i);
                    if(filter.operator === "select"){
                        throw new ModelException("No operator has been selected for filter #" + (i + 1) + " of restriction #" + restrictionIndex );
                    }
                    if(filter.value === "select"){
                        throw new ModelException("No value has been selected for filter #" + (i + 1) + "  of restriction #" + restrictionIndex);
                    } 
                }
            },
            
            validateProcedureFilters: function(procedureFilters, restrictionIndex){
                var ModelException = modelbase.ModelException;
                
                for(var i = 0; i < procedureFilters.size(); i++){
                    var filter = procedureFilters.getAt(i);
                    if(filter.operator === "select"){
                        throw new ModelException("No operator has been selected for procedure #" + (i + 1) + "  of restriction #" + restrictionIndex  );
                    }
                    if(filter.procedureName === "select"){
                        throw new ModelException("No procedurename has been selected for filter #" + (i + 1) + "  of restriction #" + restrictionIndex  );
                    } 
                }
            },
            fillNameSpace:function(document,editor){
				var that = this;
				if (document) {
					var fullName = document.getEntity().getBackendData().getContentUrl();
					var locationName = this._document.getEntity().getBackendData().getLocationUrl();
					var names = fullName.split("/");
					var locationNames = locationName.split("/");
					var projectName = locationNames[1];
					var moduleName = locationNames[2];
					var workspaceId = names[2];
									//that._context.serviceName = workspaceId +  "-" + moduleName
				    // editor.getContext().serviceName = workspaceId + "-/" + projectName + "-" + moduleName
					var packageName;
					if (names.length > 2) {
						for (var i = 1; i < (names.length - 1); i++) {
							if(names[i] !== "src"){
							if (packageName)
								packageName = packageName + "/" + names[i];
							else
								packageName = names[i];
							}else{
								packageName = packageName + "/" + names[i];
//								editor.getContext().serviceName = names[i-1];
							}
						}
					}					
					var result = this.fileService.readFileContent(packageName+"/.hdinamespace",false).then(function(result){
						editor.getContext().namespace = JSON.parse(result).name;
					}).done();			
				}
            },
            fillServiceName:function(document,editor){
            	util.getServiceName(document,editor.getContext(),function(serviceName){
             	   if(serviceName){
             		editor.getContext().serviceName = serviceName;
             	   }
                });
            }
            
            
        });
    });
