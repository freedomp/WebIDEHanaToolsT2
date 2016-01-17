define(function() {

	var treeViewContent = null;
	var rootNode = null;
	var projectNodes = null;
	var parentProjectService = null;
	var lastSelectedNode = null;
	var projectValidation = null;

	var _openLocalDialog = function(context, parentProjectStepContent) {

		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.project.fioriexttemplate/ui/css/Dialog.css"));

		parentProjectService = context.service.parentproject;

		//TODO: use repositorybrowswer service when factories will be added
		//get repository browser view content
		context.service.repositoryBrowserFactory.create().then(function(repositoryBrowserFactory) {
			repositoryBrowserFactory.getContent().then(function(viewContent) {
				viewContent.setHeight("400px");
				viewContent.setWidth("100%");
				treeViewContent = viewContent.getController()._oUI5Tree;
				rootNode = treeViewContent.getNodes();

				//TODO: remove this after changing the workaround
				if (rootNode.length === 0) {
					return;
				}

				projectNodes = rootNode[0].getNodes();

				var oErrorTextArea = new sap.ui.commons.TextView({
					width : "90%",
					text : ""
				}).addStyleClass("selectLocalProjectErrorText");

				// create the SearchField
				var oSearch = new sap.ui.commons.SearchField({
					enableListSuggest : false,
					enableFilterMode : true,
					enableClear : true,
					tooltip : "",
					width : "100%",
					startSuggestion : 0,
					suggest : function(oEvent) {
						oErrorTextArea.setText("");
						updateView(rootNode[0], oEvent.getParameter("value"));
					}
				}).addStyleClass("SearchField");

				// create the dialog
				var localDialog = sap.ui.getCore().byId("extensionProjectWizard_localDialog");
				if (localDialog !== undefined) {
					localDialog.destroy();
				}
				localDialog = new sap.ui.commons.Dialog("extensionProjectWizard_localDialog", {
					title : context.i18n.getText("i18n", "LocalDialog_SelectLocalProject"),
					resizable : false,
					width : "475px",
					modal : true,
					content : [ oSearch, viewContent, oErrorTextArea ]
				});

				// filter projects according to the sPrefix
				var filterView = function(sPrefix) {

					rootNode[0].removeAllNodes();
					var projectName;
					for ( var i = 0; i < projectNodes.length; i++) {
						projectName = projectNodes[i].getText().toLowerCase();
						if (!sPrefix || sPrefix.length === 0 || projectName.indexOf(sPrefix.toLowerCase()) !== -1) {
							rootNode[0].addNode(projectNodes[i]);
						}
					}
					return rootNode[0];
				};

				// update the view while search
				var updateView = function(rootNode, sPrefix) {
					if (lastSelectedNode !== null) {
						lastSelectedNode.setIsSelected(false); //remove last selection when performing a search
					}
					localDialog.getButtons()[0].setEnabled(false); // set OK button to be disabled
					filterView(sPrefix); //Find the filtered projects according to the sPrefix
				};

				// event for project selection
				var onNodeSelection = function(oEvent) {
					oErrorTextArea.setText("");
					
					var selectedNode = oEvent.getParameter("node");
					
					var selectedNodeType = selectedNode.type;
					if (selectedNodeType === "rootRepository") {
						localDialog.getButtons()[0].setEnabled(false); // disable the OK button in case of root selection
						return; // the "Local" node was selected
					}
					
					lastSelectedNode = selectedNode;
					var tag = selectedNode.getTag();
					
					var type = tag.split(":")[0];
					if (type === "file") {
						localDialog.getButtons()[0].setEnabled(false); // disable OK button
						return;
					}
					
					if (type === "folder") {
						var projectPath = tag.split(":")[1];
						parentProjectService.validateParentProject(projectPath, "Workspace").then(function(result) {
							if (result.isValid === true) {
								projectValidation = result;
								localDialog.getButtons()[0].setEnabled(true); // set OK button to be enabled
							} else {
								oErrorTextArea.setText(result.message);
								localDialog.getButtons()[0].setEnabled(false); // set OK button to be disabled in case of root selection
							}
						}).fail(function(error) {
							oErrorTextArea.setText(error.message);
							localDialog.getButtons()[0].setEnabled(false);// set OK button to be disabled
						});
					}
				};

				treeViewContent.attachSelect(null, onNodeSelection.bind(treeViewContent));

				var okButton = new sap.ui.commons.Button({
					text : context.i18n.getText("i18n", "OK"),
					enabled : false,
					press : function() {
						if (lastSelectedNode === null) {
							localDialog.close();
						} else {
							var keyString = lastSelectedNode.keyString;
							var projectPath = keyString.split(":")[1];
							parentProjectStepContent.setProjectValidation(projectValidation);
							parentProjectStepContent.setSelectedParentProjectPath(projectPath, false, "Workspace");
							localDialog.removeContent(viewContent);
							localDialog.close();
						}

					}
				}).addStyleClass("buttons");

				localDialog.addButton(okButton);

				var cancelButton = new sap.ui.commons.Button({
					text : context.i18n.getText("i18n", "Cancel"),
					press : function() {
						localDialog.removeContent(viewContent);
						localDialog.close();
					}
				}).addStyleClass("buttons");

				localDialog.addButton(cancelButton);

				localDialog.setInitialFocus(oSearch);

				localDialog.open();

			}).fail(function(error) {
				oErrorTextArea.setText(error.message);
			});
		}).done();
	};

	return {
		openLocalDialog : _openLocalDialog
	};
});
