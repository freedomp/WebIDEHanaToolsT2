sap.ui.define([],
	function() {
		"use strict";
		return sap.ui.jsview("sap.watt.ideplatform.plugin.run.view.RunConfigurations", {

			getControllerName: function() {
				return "sap.watt.ideplatform.plugin.run.view.RunConfigurations";
			},

			createContent: function(oController) {
				return this._getSplitter(oController);
			},

			_getRunConfigurationTreeHeader: function(oController) {

				// Create add configuration button 
				var oNewConfigurationButton = new sap.ui.commons.Button({
					icon: "sap-icon://add",
					lite: true,
					tooltip: "{i18n>run_AddConfigurationTooltip}",
					press: [oController.addConfiguration, oController]
				});

				// Create remove configuration button
				var oRemoveConfigurationButton = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //less
					lite: true,
					tooltip: "{i18n>run_RemoveConfigurationTooltip}",
					enabled: "{secondPane>/visible}",
					press: [oController.deleteConfiguration, oController]
				});

				// create the toolbar
				var oRunConfigurationsTreeHeader = new sap.ui.commons.Toolbar();
				oRunConfigurationsTreeHeader.addRightItem(oNewConfigurationButton);
				oRunConfigurationsTreeHeader.addRightItem(oRemoveConfigurationButton);
				oRunConfigurationsTreeHeader.addStyleClass("runConfigurationsTreeHeader");
				return oRunConfigurationsTreeHeader;
			},

			_getRunConfigurationTree: function(oController) {
				this.oRunConfigurationTree = new sap.ui.commons.Tree({
					select: $.proxy(oController.selectNode, oController),
					showHeader: false,
					showHorizontalScrollbar: true,
					selectionMode: sap.ui.commons.TreeSelectionMode.Single
				});
				this.oRunConfigurationTree.addStyleClass("runConfigurationsTree");
				this.oRunConfigurationTree.setWidth("100%");
				var oTreeNodeTemplate = new sap.ui.commons.TreeNode();
				oTreeNodeTemplate.bindProperty("text", "displayName");
				this.oRunConfigurationTree.bindAggregation("nodes", {
					path: "/oRunners",
					template: oTreeNodeTemplate,
					parameters: {
						arrayNames: ["configs", "oRunners"]
					}
				});
				return this.oRunConfigurationTree;
			},

			onAfterRendering: function() {
				var aRunnerNodes = this.oRunConfigurationTree.getNodes();
				for (var r = 0; r < aRunnerNodes.length; r++) {
					var oRunnerNode = aRunnerNodes[r];
					if (r === 0) {
						oRunnerNode.select();
					}
					if (r === 0 && !this.getController()._vConfigurationIdWithIssues) {
						oRunnerNode.select();
					}

					var aConfigurationNodes = oRunnerNode.getNodes();
					for (var c = 0; c < aConfigurationNodes.length; c++) {
						var oConfigurationNode = aConfigurationNodes[c];

						var oContext = oConfigurationNode.getBindingContext();
						var oTreeModelObject = oContext.getObject(oContext.sPath);
						if (this.getController()._vConfigurationIdWithIssues === oTreeModelObject.id) {
							oConfigurationNode.select();
						}
					}
				}
			},

			_getSplitter: function(oController) {
				var that = this;
				//create a vertical Splitter
				this.oSplitterV = new sap.ui.commons.Splitter();
				this.oSplitterV.setSplitterOrientation(sap.ui.commons.Orientation.vertical);
				this.oSplitterV.setSplitterPosition("25%");
				this.oSplitterV.setMinSizeFirstPane("25%");
				// this.oSplitterV.setMinSizeSecondPane("30%");
				this.oSplitterV.setWidth("100%");
				this.oSplitterV.addStyleClass("runConfiugrationsSplitter");

				// First pane content
				// Tree header / toolbar
				var oRunConfigurationTreeHeader = this._getRunConfigurationTreeHeader(oController);
				this.oSplitterV.addFirstPaneContent(oRunConfigurationTreeHeader);
				// Tree 
				this.oRunConfigurationTree = this._getRunConfigurationTree(oController);
				this.oSplitterV.addFirstPaneContent(this.oRunConfigurationTree);

				// Second Pane Content
				//create a horizontal Splitter
				var oSplitterH = new sap.ui.commons.Splitter();
				oSplitterH.setSplitterOrientation(sap.ui.commons.Orientation.horizontal);
				oSplitterH.setSplitterPosition("9%");
				oSplitterH.setMinSizeFirstPane("9%");
				oSplitterH.setSplitterBarVisible(false);
				oSplitterH.setWidth("100%");
				/////
				// var oIssuesLabel = new sap.ui.commons.TextView({
				// 	text: "{secondPane>/issuesLabel}",
				// 	layoutData: new sap.ui.layout.GridData({
				// 		span: "L12 M12 S12"
				// 	})
				// }).addStyleClass("configurationErrorMessage");
				// upper section layout
				var oRichTooltip = new sap.ui.commons.RichTooltip({
			title: "{i18n>run_Error}",
			myPosition: "begin bottom",
			atPosition: "begin top"
		}).addStyleClass("runConfigRtt");
				this.oDisplayNameTextField = new sap.ui.commons.TextField({
					id: this.createId("displayNameTextField"),
					value: "{secondPane>/displayName}",
					liveChange: $.proxy(oController.onDisplayNameLiveChange, oController),
					change: $.proxy(oController.onDisplayChange, oController),
					layoutData: new sap.ui.layout.GridData({
						span: "L10 M10 S10"
					})
				});
				var oLblName = new sap.ui.commons.Label({
					text: "{i18n>lbl_name}",
					labelFor: this.oDisplayNameTextField,
					layoutData: new sap.ui.layout.GridData({
						span: "L2 M2 S2"
					})
				});
				var oUpperTabLayout = new sap.ui.layout.Grid({
					content: [oLblName, this.oDisplayNameTextField],
					visible: "{secondPane>/visible}",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});
				oUpperTabLayout.addStyleClass("runConfiugrationHeader");
				oSplitterH.addFirstPaneContent(oUpperTabLayout);
				// TabStrip 
				this.oTabStrip = new sap.ui.commons.TabStrip({
					visible: "{secondPane>/visible}"
				});
				this.oTabStrip.attachClose(function(oEvent) {
					that.oTabStrip.closeTab(oEvent.getParameter("index"));
				});
				
				var oNewConfigurationLabel = new sap.ui.commons.Label({
					text: "{i18n>create_new_configuration_label}",
					width: "100%",
					textAlign: sap.ui.core.TextAlign.Center,
					visible: {
						parts: ["secondPane>/visible"],
						formatter: function(isVisible) {
							return !isVisible;
						}
					},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});

				var oVerticalLayoutNewConf = new sap.ui.layout.VerticalLayout({
					content: [oNewConfigurationLabel, this.oTabStrip],
					width: "100%"
				});
				oSplitterH.addSecondPaneContent(oVerticalLayoutNewConf);

				this.oSplitterV.addSecondPaneContent(oSplitterH);
				return this.oSplitterV;
			}
		});
	});