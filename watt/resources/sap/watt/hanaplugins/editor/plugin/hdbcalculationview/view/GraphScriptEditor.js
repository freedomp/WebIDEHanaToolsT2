/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/commands","../service/Editor"], function(ResourceLoader, commands, Editor) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

	var GraphScriptEditor = function(parameters) {
		this.model = parameters.model;
		this.undoManager = parameters.undoManager;
		this.document = parameters.document;
		this.context = parameters.context;
		this.layout = null;
		this.isOpen = false;
		this.viewNode = parameters.viewNode;
		this.executableCommands = [];
		//this.editor =null;
	};

	GraphScriptEditor.prototype = {

		showHideQuickTool: function() {
			if (!this.quickPanel) {
				return;
			}

			if (this.quickPanel.hasStyleClass("calcviewScriptEditorQuickPanelHidden")) {
				this.quickPanel.removeStyleClass("calcviewScriptEditorQuickPanelHidden");
				// this.quickPanel.addStyleClass("calcviewScriptEditorQuickPanelShown");
				this.collapseButton.removeStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
				this.expandButton.addStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
			} else {
				// this.quickPanel.removeStyleClass("calcviewScriptEditorQuickPanelShown");
				this.quickPanel.addStyleClass("calcviewScriptEditorQuickPanelHidden");
				this.collapseButton.addStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
				this.expandButton.removeStyleClass("calcviewScriptEditorQuickPanelButtonHidden");
				if (this.editor) {
					this.editor.getFocusElement().then(function(element) {
						if (element) {
							element.focus();
						}
					}).done();
				}
			}
		},

		getContent: function() {
			var that = this;
			var jsonModel = new sap.ui.model.json.JSONModel();
			var editorLayout, algorithmDropdown, oItem, quickPanel, collapseButton; //, expandButton, editorTextArea;
			var selectedNode = that.viewNode;

			/*function changed(){
			    var selectedNode = that.viewNode,editorContainer,editorValue;
			    var jsonData = {
					name: selectedNode.name,
					columns: [],
					parameters: []
				};
				if(that.layout.getContent().length > 1){
				    var x = function(){
			    editorContainer = that.layout.getContent()[1];
			    editorValue = editorContainer.getValue();
				
				var changeGraphNodeCommand = new commands.ChangeGraphNodeCommand(that.model,selectedNode.name,editorValue);
                   	//this.model.viewModel.$getUndoManager().execute(changeGraphNodeCommand);
				that.undoManager.execute(changeGraphNodeCommand);
				    };
			
			    editorContainer.attachBrowserEvent("keydown", function(e) {
			        x();
			        e.preventDefault();
					e.stopPropagation();
				// disable Ctrl+SPACE (intellisence command in quick panel)
				if ((e.ctrlKey || e.metaKey) && e.keyCode === 32) {
					e.preventDefault();
					e.stopPropagation();
				}
				// capture undo/redo and call undo manager directly
				// otherwise, on Chrome there would be still and input event sent to ace 
				// which overtakes the WATT Redo command and inserts the last typed character into ace
				// the redo stack was reset and the standard Redo did not take place
				if ((e.ctrlKey || e.metaKey) && e.keyCode === 89) {
					e.preventDefault();
					e.stopPropagation();
					that.model.$getUndoManager().redo();
				}
				if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
					e.preventDefault();
					e.stopPropagation();
					that.model.$getUndoManager().undo();
				}
				
			});
				}
			}*/

			editorLayout = new sap.ui.commons.layout.AbsoluteLayout('parentAbs1', {
				width: "99%",
				height: "97%"
			});
			editorLayout.addStyleClass("calcviewScriptEditorLayout");

			var oComboBox = new sap.ui.commons.DropdownBox("cmb11", {
				items: [new sap.ui.core.ListItem({
					text: "Gem"
				}), new sap.ui.core.ListItem({
					text: "Neighborhood"
				}), new sap.ui.core.ListItem({
					text: "Cyclic"
				})]
				/*,change: function(event) {
						var source = event.getSource();
						var key = source.getValue();
						var changeAlgorithmCommand = new commands.ChangeGraphNodeCommand(that.model,selectedNode.name,key);
				}*/
			});
			var oLabel = new sap.ui.commons.Label("l2");
			oLabel.setText("Algorithm");
			oLabel.setDesign(sap.ui.commons.LabelDesign.Bold);
			// 	   	var labelLayout = new sap.ui.layout.VerticalLayout('labelVert', {
			// 				width: "100%"
			// 			});
			// 		labelLayout.addContent(oLabel);

			var layout1 = new sap.ui.layout.HorizontalLayout('vert2', {
				width: "100%"
			});
			layout1.addStyleClass("graphScriptEditorComboboxLayout");
			layout1.addContent(oLabel);
			layout1.addContent(oComboBox);

			var layout2 = new sap.ui.layout.VerticalLayout('vert1', {
				width: "100%",
				height: "70px"
			});
			layout2.addStyleClass("graphParentComboboxLayout");
			layout2.addContent(layout1, {
				top: "9px",
				left: "25px"
			});
			editorLayout.addContent(layout2, {
				top: "9px",
				left: "5px"
			});

			this.layout = editorLayout;

			//that.model.$getEvents().subscribe("changed", changed);
			//changed();
			return editorLayout;
		},

		selected: function() {
			var that = this,selectedNode = that.viewNode;
			
			/*if (this.editor) {
				return Q();
			} else {*/
			
			
			if(!this.editor){
				this.editor = new sap.watt.common.plugin.aceeditor.control.Editor({
					width: "100%",
					height: "100%"
				}); 
				that.layout.addContent(this.editor, {
						top: '40px',
						left: '5px'
					});
				if(this.editor.getSession() && this.editor.getSession() !== null){
					this.editor.setValue(selectedNode.graphExpression);
				}
				}
				else{
					if(selectedNode.graphExpression !== '' && selectedNode.graphExpression !== null && selectedNode.graphExpression !== 'undefined'){
						this.editor.setValue(selectedNode.graphExpression);
					}
				}			
			if(selectedNode.graphExpression !== '' && selectedNode.graphExpression !== null && selectedNode.graphExpression !== 'undefined'){
				setTimeout(function() {that.editor.setValue(selectedNode.graphExpression)},100);
			}
				var editorContainer,editorValue,algorithmValue,dropDownContainer,newValue = [];
				if (that.layout.getContent().length > 1) {
					editorContainer = that.layout.getContent()[1];
					var parentLayout = that.layout.getContent();
					var	subParentLayout1 = parentLayout[0].getContent();
					var	subParentLayout2 = subParentLayout1[0].getContent();
					var	subParentLayout3 = subParentLayout2[1];
					if(selectedNode.action !== '' && selectedNode.action !== null && selectedNode.action !== 'undefined'){
						var setter = selectedNode.action;
						subParentLayout3.setValue(setter);
					}
					editorContainer.attachBrowserEvent("keyup", function(event){
					    dropDownContainer = document.getElementById("cmb11");
					    editorValue = editorContainer.getValue();
					    algorithmValue = dropDownContainer.childNodes[1].value;
					    newValue = [];
					    newValue.push(editorValue);
					    newValue.push(algorithmValue);
					    var changeGraphNodeCommand = new commands.ChangeGraphNodeCommand(that.model, selectedNode.name, newValue);
					    that.undoManager.execute(changeGraphNodeCommand);
					});				

				}		
			

		},

		reopen: function() {
			if (!this.editor) {
				return Q();
			}
			return this.editor.open(this.document, this.model);
		},

		close: function() {
			if (!this.editor) {
				return Q();
			}
			return this.editor.close(this.document, this.model);
		}

	};

	return GraphScriptEditor;
});
