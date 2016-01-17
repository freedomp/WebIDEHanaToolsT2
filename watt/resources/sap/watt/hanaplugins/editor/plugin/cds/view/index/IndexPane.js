/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "./IndexDetails",
        "./FullTextIndexDetails"
    ],
	function(ResourceLoader, IndexDetails, FullTextIndexDetails) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");
		/**
		 * @class
		 */
		var IndexPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this._model = parameters.model;
			this.context = parameters.context;
			this.model = new sap.ui.model.json.JSONModel();
		};

		IndexPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			close: function() {

				if (this.indexEditor) {
					this.indexEditor.close();
				}

				if (this.model) {
					this.model.destroy();
				}
			},

			getContent: function() {
				var that = this;

				this.mainLayout = new sap.ui.commons.layout.VerticalLayout({
					height: "100%"
				}).addStyleClass("masterDetailsMainDiv");

				var toolItems = [];

				var createIndex = function() {
					//TODO

				};

				toolItems.push(new sap.ui.commons.MenuButton({
					icon: "sap-icon://add",
					tooltip: resourceLoader.getText("tol_add"),
					//text: resourceLoader.getText("tol_add"),
					itemSelected: function(oevent) {
						var name = oevent.getParameter("item").getText();
						if (name === resourceLoader.getText("txt_index")) {
							createIndex();
						} 
					},
					menu: new sap.ui.commons.Menu({
						items: [new sap.ui.commons.MenuItem({
								text: resourceLoader.getText("txt_index")
								//icon: resourceLoader.getImagePath("Calculated_Attribute.png")

							}),
                                new sap.ui.commons.MenuItem({
								text: resourceLoader.getText("txt_full_text_index")
								//icon: resourceLoader.getImagePath("counter_scale.png")
							})
                            ]

					})
				}));

				this.removeButton = new sap.ui.commons.Button({
					icon: "sap-icon://delete",
					tooltip: resourceLoader.getText("tol_remove"),
					//text: resourceLoader.getText("tol_remove"),
					enabled: false,
					press: function(oevent) {

						var selectedIndex = that.table.getSelectedIndex();
						var bindContext = that.table.getContextByIndex(selectedIndex);
						if (bindContext) {
							//TODO
						}
					}
				});
				toolItems.push(this.removeButton);

				// toolbar creation
				var toolBar = new sap.ui.commons.Toolbar({
					width: "100%",
					items: toolItems
				}).addStyleClass("masterToolbarStyle");

				this.mainLayout.addContent(toolBar);

				var splitter = new sap.ui.commons.Splitter({
					//showScrollBars: true,
					splitterBarVisible: true,
					splitterOrientation: sap.ui.core.Orientation.Vertical,
					minSizeFirstPane: "20%",
					splitterPosition: "30%",
					height: "100%"
				}).addStyleClass("masterDetailsSplitter");

				this.splitter = splitter;
				this.splitter.addFirstPaneContent(this.getMasterListContent());

				//return this.splitter;
				// this.mainLayout.createRow(splitter);
				this.mainLayout.addContent(this.splitter);
				return this.mainLayout;
			},

			getMasterListContent: function() {
				var that = this;

				// Name template     
				var icon = new sap.ui.commons.Image({
					src: "{icon}"
				});
				icon.bindProperty("tooltip", "tooltip");
				var nameText = new sap.ui.commons.TextField({
					wrapping: true,
					editable: false
				});
				nameText.bindProperty("value", "name");

				// Label template    
				var labelText = new sap.ui.commons.TextField({
					editable: false
				});
				labelText.bindProperty("value", "label");

				var columns = [new sap.ui.table.Column({
					autoResizable: false,
					resizable: false,
					template: icon,
					width: "30px"
				}), new sap.ui.table.Column({
					autoResizable: false,
					resizable: true,
					template: nameText,
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_name"),
						requiredAtBegin: true,
						textAlign: sap.ui.core.TextAlign.Begin
					})
				})];

				columns.push(new sap.ui.table.Column({
					autoResizable: true,
					resizable: true,
					template: labelText,
					label: new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_columns"),
						textAlign: sap.ui.core.TextAlign.Begin
					})
				}));

				// Table creation     
				this.table = new sap.ui.table.Table({
					editable: false,
					navigationMode: sap.ui.table.NavigationMode.Scrollbar,
					noData: resourceLoader.getText("msg_no_index"),
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					selectionBehavior: sap.ui.table.SelectionBehavior.Row,
					selectionMode: sap.ui.table.SelectionMode.Single,
					columns: columns,
					rowSelectionChange: function(oevent) {
						var bindContext = oevent.getSource().getContextByIndex(oevent.getSource().getSelectedIndex());
						if (bindContext) {
							that.removeButton.setEnabled(true);
							/*var element = bindContext.getProperty("element");
							if (element.measureType === "counter") {
								if (!that.fullTextIndexEditor) {
									that.fullTextIndexEditor = new FullTextIndexDetails({
										undoManager: that._undoManager,
										context: that.context
									});
								}
								that.fullTextIndexEditor.updateDetails(element);

								that.splitter.removeAllSecondPaneContent();
								that.splitter.addSecondPaneContent(that.fullTextIndexEditor.getContent());
							} else {
								if (!that.indexEditor) {
									that.indexEditor = new IndexDetails({
										undoManager: that._undoManager,
										context: that.context
									});
								}
								that.indexEditor.updateDetails(element);

								that.splitter.removeAllSecondPaneContent();
								that.splitter.addSecondPaneContent(that.indexEditor.getContent());
							}*/

						} else {
							that.removeButton.setEnabled(false);
						}
					}
				});

				if (!that.indexEditor) {
					that.indexEditor = new IndexDetails({
						undoManager: that._undoManager,
						context: that.context
					});
				}
				//that.indexEditor.updateDetails(element);

				that.splitter.removeAllSecondPaneContent();
				that.splitter.addSecondPaneContent(that.indexEditor.getContent());

				this.table.bindRows("/");
				this.table.setModel(this.model);

				this.updateData();

				if (this.table.getModel() && this.table.getModel().oData && this.table.getModel().oData.length > 0) {
					this.table.setSelectedIndex(0);
				}

				return this.table;

			},

			modelChanged: function(object, event) {
				var that = this;

				this.updateData();

				/*  if (object.type == commands.ViewModelEvents.ELEMENT_CREATED) {
                    for (var i = 0; i <= that.table.getModel().oData.length; i++) {
                        var element = that.table.getModel().oData[i];
                        if (element && element.name === object.name) {
                            that.table.setSelectedIndex(i);
                            if (i === 0) {
                                this.table.clearSelection();
                                this.table.setSelectedIndex(0);
                            }
                            break;
                        }
                    }

                } else if (object.type == commands.ViewModelEvents.ELEMENT_DELETED) {
                    var foundIndex = this.table.getSelectedIndex();
                    if (this.table.getModel() && this.table.getModel().oData) {
                        if (this.table.getModel().oData.length > 0) {
                            if (foundIndex === 0) {
                                this.table.clearSelection();
                                this.table.setSelectedIndex(0);
                            } else {
                                this.table.setSelectedIndex(foundIndex - 1);
                            }
                            return;
                        }
                    }
                    this.splitter.removeAllSecondPaneContent();
                    this.removeButton.setEnabled(false);
                }
				*/
			},

			getData: function() {
				var that = this;
				var columnsData = [];

				return columnsData;
			},

			updateData: function() {
				var data = this.getData();
				this.model.setData(data);
				this.model.updateBindings();

			}

		};

		return IndexPane;

	});