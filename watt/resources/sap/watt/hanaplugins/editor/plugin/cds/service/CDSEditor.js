/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../view/CDSEditor",
        "../control/EditorContainer",
        "sap/watt/common/plugin/platform/service/ui/AbstractEditor",
        "../control/NewCDSFileDialog",
        //"sap/watt/uitools/plugin/chebackend/dao/File"
        "sap/watt/ideplatform/che/plugin/chebackend/dao/File",
        "hanaddl/hanaddlNonUi",
        "../view/CDSEditorUtil"
        ],
        function(CDSEditor, EditorContainer, AbstractEditor, NewCDSFileDialog, FileService, hanaddlNonUi, CDSEditorUtil ) {
	"use strict";

	return AbstractEditor.extend("sap.watt.hanaplugins.editor.plugin.cds.service.CDSEditor", {

		constructor: function() {
			AbstractEditor.prototype.constructor.apply(this, arguments);
			this._view = null;
			this._editors = {};
			this._editor = null;
			this._document = null;
			this._editorContainer = null;
			this.fileService = FileService;
		}, 

		init: function() {
			this._view = sap.ui.view({
				viewName: "sap.watt.hanaplugins.editor.plugin.cds.control.ViewContainer",
				type: sap.ui.core.mvc.ViewType.JS
			});
			this._view.addStyleClass("cdsEditorView");
		},

		_getEditorContainer: function() {
			if (!this._editorContainer) {
				this._editorContainer = new sap.watt.hanaplugins.editor.plugin.cds.control.EditorContainer();
				this._view.byId("viewcontainer").addContent(this._editorContainer);
			}
			return this._editorContainer;
		},

		getContent: function() {
			var that = this;
			return AbstractEditor.prototype.getContent.apply(this, arguments).then(function() {
				return that._view;
			});
		},

		getSelection: function() {
			return this._editor.getSelection();
		},

		getFocusElement: function() {
			return this._view;
		},

		getTitle: function() {
			return this._document.getEntity().getName();
		},

		getTooltip: function() {
			return this._document.getEntity().getFullPath();
		},

		getModel: function() {
			var model;
			//if (this._editor && this._editor.getModel()) {
			//	model = this._editor.getModel();
			//}
			return model;
		},

		open: function(oDocument, forceReload) {
			var that = this;
			AbstractEditor.prototype.open.apply(this, arguments);

			var key = oDocument.getKeyString();
			this._document = oDocument;
			this.getNameSpace();
			
			var editorAlreadyOpened = true;
			var editor = this._editors[key];
			if (!editor) {
				editor = new CDSEditor(this.context, oDocument);
				editorAlreadyOpened = false;
				this._editors[key] = editor;
				this._getEditorContainer().addContent(editor.getContent());
				forceReload = true;
			}
			this._editor = editor;

			for (var editorKey in this._editors) {
				if (!this._editors.hasOwnProperty(editorKey)) {
					continue;
				}
				this._editors[editorKey].setHidden(editorKey !== key);
			}

			return this._document.getContent().then(function(value) {
				if (value !== undefined && value.trim() === "" && !editorAlreadyOpened) {
					//create a Context or an Entity
					//that.createCDSContent();
					var newCdsFileDialog = new NewCDSFileDialog({
						fileDocument: that._document,
						context: that.context
					});
					newCdsFileDialog.openDialog();
				} else {
					// terminate promise chain in order to get exceptions logged properly
					/*//this._model = new viewmodel.CDSModel(true);
					
					var parserFactoryApi = hanaddlNonUi.DdlParserFactoryApi;

					var version = parserFactoryApi.versionsFactory.versionLast;
					var resolver = parserFactoryApi.createResolver(version,"/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbdd");
					var parser = parserFactoryApi.createParser(version);

					var astModel = parser.parseAndGetAst2(resolver, value);
					
					//validate that the ast model is NOT corrupted
					var errorObject = CDSEditorUtil.getErrorsInAstModel(astModel);
					if(errorObject){
						//show a pop up asking to correct the error displaying line no and column no in ast model and RETURN
						var lineNo = errorObject.lineNo;
						var columnNo = errorObject.colNo;
						jQuery.sap.require("sap.ui.commons.MessageBox");
						sap.ui.commons.MessageBox.show(
								"This CDS model contains error at line " + lineNo + ", column " + columnNo + "! \nCorrect the errors using the CDS text editor and open the CDS Graphical Editor again",
								sap.ui.commons.MessageBox.Icon.ERROR,
								"Open Error",
								[sap.ui.commons.MessageBox.Action.OK],
								function() { 
									//that.close(that._document);
									 that._context.service.content.close(that._document, that._context.self)
                                     .then(function() {
                                                     return that._context.service.focus.setFocus(that._context.service.content);
                                     })
                                     .done();
								}
						);
					} else{
						editor.open(astModel).done();
					}*/
					
					editor.open().done();
				}
			});
		},

		flush: function() {
			if (!this._document || !this._editors) {
				return Q();
			}
			var key = this._document.getKeyString();
			if (!this._editors.hasOwnProperty(key)) {
				return Q();
			}
			var editor = this._editors[key];
			return editor.flush();
		},

		close: function(oDocument) {
			var that = this;
			var originalArguments = arguments;
			var key = oDocument.getEntity().getKeyString();
			var editor = this._editors[key];
			if (editor) {
				delete this._editors[key];
				editor.close().then(function() {
					that._getEditorContainer().removeContent(editor.getContent().getId());
					editor.destroy();
				}).done();
			}
			// do not reset since open may have been overtake by close(all)
			// this._document = null;
			// this._editor = null;
			return AbstractEditor.prototype.close.apply(this, originalArguments);
		},

		hasUndo: function() {
			return this._editor && this._editor.hasUndo();
		},

		hasRedo: function() {
			return this._editor && this._editor.hasRedo();
		},

		undo: function() {
			return this._editor && this._editor.undo();
		},

		redo: function() {
			return this._editor && this._editor.redo();
		},

		markClean: function() {
			return this._editor && this._editor.markClean();
		},

		isClean: function() {
			return this._editor && this._editor.isClean();
		},
		
		getNameSpace : function(){ 
			var that = this;
			var namespace = "";
			if (this._document) {
				var fullName = this._document.getEntity().getBackendData().getContentUrl();
				var locationName = this._document.getEntity().getBackendData().getLocationUrl();
				var names = fullName.split("/");
				var locationNames = locationName.split("/");
                var projectName = locationNames[1];
                var moduleName = locationNames[2];
                var workspaceId = names[2];
              
                that.context.serviceName = workspaceId + "-" + projectName + "-" + moduleName;
                
				var srcFolderPath;
				
				if (names.length > 2) {
					for (var i = 1; i < (names.length - 1); i++) {
						if(names[i] !== "src"){
							if (srcFolderPath){
								srcFolderPath = srcFolderPath + "/" + names[i];
							}
							else{
								srcFolderPath = names[i];
							}
						}else{
							srcFolderPath = srcFolderPath + "/" + names[i];
							//that.context.serviceName = names[i-1];
						}
					}
				}                                                                              
				namespace = this.fileService.readFileContent(srcFolderPath+"/.hdinamespace",false).then(function(result){
					that.context.namespace = JSON.parse(result).name;
				}).done();  
			}
			return namespace;
		}

		/*,createCDSContent: function() {

			var that = this;
			var selection;

			var dialog = new sap.ui.commons.Dialog({
				title: "Select CDS Artifact",
				applyContentPadding: true,
				showCloseButton: false,
				resizable: false,
				contentBorderDesign: sap.ui.commons.enums.BorderDesign.Thik,
				modal: true,
				accessibleRole: sap.ui.core.AccessibleRole.Dialog,
				keepInWindow: true,
				content: [new sap.ui.commons.RadioButton({
					text: "Context",
					width: "50%",
					select: function(event) {
						if (event.getSource().getSelected()) {
							selection = "Context";
							dialog.getModel().setProperty("/isOptionSelected", true);
						}
					}
				}),
				new sap.ui.commons.RadioButton({
					text: "Entity",
					width: "50%",
					select: function(event) {
						if (event.getSource().getSelected()) {
							selection = "Entity";
							dialog.getModel().setProperty("/isOptionSelected", true);
						}
					}
				})],
				buttons: [new sap.ui.commons.Button({
					text: "Create",
					enabled: "{/isOptionSelected}",
					press: function(event) {
						dialog.close();
						that.createContentForSelectedArtifact(selection);
					}
				}),
				new sap.ui.commons.Button({
					text: "Cancel",
					press: function(event) {
						dialog.close();
						that.context.service.content.close(that._oDocument, that.context.self).done();
					}
				})]
			});

			var uiModel = new sap.ui.model.json.JSONModel({
				isOptionSelected: false
			});
			dialog.setModel(uiModel);

			dialog.open();
		},

		createContentForSelectedArtifact: function(selection) {
			var that = this;
			var keyString = that._oDocument.getKeyString();
			var packagePath = keyString.substr(keyString.indexOf("/") + 1, keyString.length); //remove 'file:/' from beginning of string
			var filePath = packagePath.substr(0, packagePath.lastIndexOf(".")).replace(/\//g, "."); //get string till before the extension and replace all slash with dots
			//var namespace = filePath.substr(0, filePath.lastIndexOf(".")); //get only package path, remove file name

			 this.getNameSpace(fileDocument);
			 var namespace = this.context.namespace;
       	  
			var fileName = that._oDocument.getTitle().substr(0, that._oDocument.getTitle().lastIndexOf(".")); //remove extension and get only file name

			var content;
			if (selection === "Context") {
				content = "namespace " + namespace + ";\n\ncontext " + fileName + "{\n\n};";
			} else {
				content = "namespace " + namespace + ";\n\nentity " + fileName + "{\n\n};";
			}

			return that._oDocument.setContent(content).then(function() {
					return that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider) {
						return utilityProvider.saveDocumentInactive(that._oDocument, true);
					});
				}).done(); 
		},

		getNameSpace : function(){
			var that = this;
			var namespace = "";
			if (this._oDocument) {
				var fullName = this._oDocument.getEntity().getBackendData().getContentUrl();
				var names = fullName.split("/");
				var srcFolderPath;
				if (names.length > 2) {
					for (var i = 1; i < (names.length - 1); i++) {
						if(names[i] !== "src"){
							if (srcFolderPath)
								srcFolderPath = srcFolderPath + "/" + names[i];
							else
								srcFolderPath = names[i];
						}else{
							srcFolderPath = srcFolderPath + "/" + names[i];
							that.context.serviceName = names[i-1];
						}
					}
				}                                                                              
				namespace = this.fileService.readFileContent(srcFolderPath+"/.hdinamespace",false).then(function(result){
					that.context.namespace = JSON.parse(result).name;
				}).done();  
			}
			return namespace;
		}*/
	});
}); 