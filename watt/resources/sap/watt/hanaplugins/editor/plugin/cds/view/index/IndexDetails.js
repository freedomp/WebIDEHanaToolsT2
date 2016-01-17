/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../model/commands"
    ],
	function(ResourceLoader, commands) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");
		var IndexDetails = function(attributes) {
			this.undoManager = attributes.undoManager;
		};

		IndexDetails.prototype = {

			_execute: function(commands) {
				var that = this;
				if (that.undoManager) {
					//if (commands instanceof Array) {
					//     return that.undoManager.execute(new modelbase.CompoundCommand(commands));
					// } else {
					return that.undoManager.execute(commands);
					// }

				}
			},

			close: function() {
				/*if (this.viewNode.$getEvents()._registry) {
                    this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.modelChanged, this);
                }*/
			},

			getContent: function() {
				if (!this.topVerticalLayout || !this.topVerticalLayout.getContent()) {
					this.getDetailsContent();
				}
				return this.topVerticalLayout;
			},

			updateDetails: function(element) {
				if (element) {
					this.element = element;
				}

				if (this.element && this.headerLabel) {
					this.headerLabel.setText(resourceLoader.getText("tit_index_properties", [this.element.name]));
				}
				/* var modelData = CalcViewEditorUtil.createModelForCalculatedColumn(this.element);
                modelData.referenceAttributes = this.getReferenceAttributes();
                modelData.attributes = this.getAttributes();
                this.elementModel.setData(modelData);*/

				this.elementModel.updateBindings();
			},

			modelChanged: function(object) {
				if (this.element.name === object.name) {
					this.updateDetails();
				}
			},

			destroyContent: function() {
				if (this.topVerticalLayout) {
					this.topVerticalLayout.destroyContent();
				}
			},

			getDetailsContent: function() {
				var that = this;
				if (!that.topVerticalLayout) {
					that.topVerticalLayout = new sap.ui.commons.layout.VerticalLayout({
						height: "100%"
					});
				}
				var headerLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});

				this.headerLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_index_properties", [this.element ? this.element.name : ""]),
					design: sap.ui.commons.LabelDesign.Bold
				});

				headerLayout.createRow(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [this.headerLabel],
					hAlign: sap.ui.commons.layout.HAlign.Center,
					vAlign: sap.ui.commons.layout.VAlign.Center
				}).addStyleClass("detailsHeaderStyle"));

				this.topVerticalLayout.addContent(headerLayout);

				var detailsLayout = new sap.ui.commons.layout.VerticalLayout();

				detailsLayout.addContent(this.getHeaderLayout(resourceLoader.getText("txt_general_prop")));
				detailsLayout.addContent(this.getGeneralContainer());

				this.topVerticalLayout.addStyleClass("detailsMainDiv");

				this.topVerticalLayout.addContent(detailsLayout);

				return that.topVerticalLayout;
			},

			getHeaderLayout: function(name) {
				var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
				//headMatrixLayout.addStyleClass("headerHeight");
				var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
					vAlign: sap.ui.commons.layout.VAlign.Begin,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}).addStyleClass("detailsHeaderStyle");

				var headerName = new sap.ui.commons.Label({
					text: name,
					design: sap.ui.commons.LabelDesign.Bold
				});

				headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
					width: "10px"
				}));
				headerMatrixLayoutCell.addContent(headerName);

				headMatrixLayout.createRow(headerMatrixLayoutCell);

				return headMatrixLayout;
			},

			getGeneralContainer: function() {

			}

		};

		return IndexDetails;
	});