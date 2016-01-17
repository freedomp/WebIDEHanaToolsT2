/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved*/
define([
        "../util/ResourceLoader",
        "sap/watt/common/plugin/platform/service/ui/AbstractEditor",
       "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/impactanalysis/impactEditorContentView",
		 "sap/watt/ideplatform/che/plugin/chebackend/dao/File",
		 "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/impactanalysis/impactGalilei",
		 "sap/watt/hanaplugins/editor/common/utils/util"
 ],
	function(ResourceLoader, AbstractEditor, impactEditorContentView, FileService,impactGalilei,util) {
		"use strict";
		return AbstractEditor.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.impactEditorContentView", {

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
					viewName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.ViewContainer",
					type: sap.ui.core.mvc.ViewType.JS
				});

				this._view.addStyleClass("impactEditor");
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

			fillNameSpace: function(oDocument,context,Pnamespace) {
				var that = this;
				if (oDocument) {
					var fullName = oDocument.getEntity().getBackendData().getContentUrl();
					var locationName = oDocument.getEntity().getBackendData().getLocationUrl();
				    var names = fullName.split("/");
					var locationNames = locationName.split("/");
					var projectName = locationNames[1];
					var moduleName = locationNames[2];
					var workspaceId = names[2];
					context.serviceName = workspaceId + "-/" + projectName + "-" + moduleName ;
					//var names = fullName.split("/");
					var srcFolderPath;
					/*if (names.length > 2) {
						for (var i = 1; i < (names.length - 1); i++) {
							if (names[i] !== "src") {
								if (srcFolderPath)
									srcFolderPath = srcFolderPath + "/" + names[i];
								else
									srcFolderPath = names[i];
							} else {
								srcFolderPath = srcFolderPath + "/" + names[i];
								context.serviceName = names[i - 1];
							}
						}
					}*/
					context.namespace = Pnamespace;
					//context.fileExtension = OfileExtension; 
				}
			},
			
			   
			open: function(oDocument, forceReload) {
				AbstractEditor.prototype.open.apply(this, arguments);
				this._document = oDocument;
				 var fullName =oDocument.getEntity()._sName;
                var fullPath = fullName.replace(/[.]datalineageview$/, "");
				var impactPath = fullPath.substring(1, fullPath.length);
				impactPath = impactPath.replace(/\//g, ".");
				var that = this;
				var editorAlreadyOpened = true;
				var key = oDocument.getKeyString();

				var editor = this._editors[key];

				/*if (this._editor && this._editor !== editor) {
					this._editor.setBusy(true);
				}*/
				this.fileService = FileService;

				if (!editor) {

					//editorAlreadyOpened = false;

					editor = new impactEditorContentView({
					    
						context: this.context,
						document: oDocument,
						impactPath : impactPath,
						fileExtension : fileExtension,

					       
					});


					//this._view.byId("viewcontainer").addContent(editor);
					editor.context = this.context;
					editor.document = oDocument;
					editor.impactPath = impactPath;
					editor.doLineage = true;
					//this._editor.setCurEditor(editor);
					this._editors[key] = editor;

					forceReload = true;
				} /*else {
					editor.setBusy(false);
				}*/
				var srcDocument = oDocument.getEntity().getSupplement().srcDocument;
				var Onamespace = oDocument.getEntity().getSupplement().namespace;
				var fileExtension = srcDocument.getEntity().getFileExtension();
				//this.fillNameSpace(srcDocument,editor.context,Onamespace);
				
                util.getServiceName(srcDocument,this.context,function(serviceName){
             	   if(serviceName){
             	   that.context.serviceName = serviceName;
             	  editor.analyze(editor);
             	   }
				   });
             	  editor.fileExtension = fileExtension;
             	  that._editor = editor;
             	 //this._editor.setCurEditor(editor);
              	for (var editorKey in this._editors) {
 					if (!this._editors.hasOwnProperty(editorKey)) {
 						continue;
 					}
 					this._editors[editorKey].setHidden(editorKey !== key);
 					//this._editors[editorKey].setProperty("hidden", editorKey !== key, true);
 				} 
             	  that._view.byId("viewcontainer").removeAllContent();
  				// oDocument.getContent().then(function(content) {
  				//that._originalContent = content;
             	  that._view.byId("viewcontainer").addContent(editor);
             	  that._view.byId("viewcontainer").addStyleClass("impactEditor");
             	  oDocument.editor = editor;
             	 
             	   },
				  
				///}).done();
             	 
             	 
			flush: function() {
				for (var key in this._editors) {
					if (!this._editors.hasOwnProperty(key)) continue;
					if (this.isClean()) continue;
					var editor = this._editors[key];

					var document = editor.getDocument();

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
				//var oData = this._editor.getModel().getData();
				//return oData._undoManager.hasUndo();
				return false;
			},

			hasRedo: function() {
				// console.log("ApeContainer hasRedo");
				//var oData = this._editor.getModel().getData();
				//return oData._undoManager.hasRedo();
				return false;
			},

			undo: function() {
				//console.log("ApeContainer undo");
				/*var oData = this._editor.getModel().getData();
				var result = oData._undoManager.undo();
				this._editor.getModel().setData(oData);
				return result;*/
			},

			redo: function() {
				// console.log("ApeContainer redo");
				/*var oData = this._editor.getModel().getData();
				var result = oData._undoManager.redo();
				this._editor.getModel().setData(oData);
				return result;*/
			},

			markClean: function() {
				// console.log("ApeContainer markClean");
				/*var oData = this._editor.getModel().getData();
				return oData._undoManager.markClean();*/
			},

			isClean: function() {
				// console.log("ApeContainer isClean"); 
//				var oData = this._editor.getModel().getData();
//				return oData._undoManager.isClean();
				/*
                if(this._changed){
                    return false;
                }else{
                    return true;
                }
                */
				return true;
			}

		});
	});

