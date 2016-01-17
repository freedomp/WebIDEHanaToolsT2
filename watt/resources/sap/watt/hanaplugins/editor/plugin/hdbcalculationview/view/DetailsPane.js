
/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require",  "../util/ResourceLoader", "./CalcViewEditorUtil","../base/columnDataLineage","./actions/FindAndHighlight"], function(require,
	ResourceLoader, CalcViewEditorUtil, ColumnDataLineage,FindAndHighlight) {
	"use strict";
	
	var DetailsPane = function() {
		this._content = null;
		this._models = {};
		this._tabContent = {};
		this._selectedKey = undefined;
		this.contentCount = -1;
		this._openQueue = new Q.sap.Queue();

		/*
        find and highlight feature declarations
		*/
		this._findandhighlight = null;
		this._clearele = null;
		this._columnLineage = null;
		this.clearLineage = null;

	};

var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
	DetailsPane.prototype = {
		getContent: function(graphicalCalcView) {
			if (!this._content) {
				this._content = this._createContent(graphicalCalcView);
			}
			var columnDataLineage = new ColumnDataLineage({
				//editor : CalcViewEditorUtil.getCurEditor()._detailsPane.scenarioEditor
			});			
			this._columnLineage = columnDataLineage;
			this._findandhighlight = new FindAndHighlight({

			});
			return this._content;
		},

		setItems: function(items, selectedKey, selectedNodeName, viewModel) {
			var that = this;
			if (!that._columnLineage.lineageView && that.scenarioEditor !==undefined) {
				for (var k = that.scenarioEditor._editor.getAllSymbols().length - 1; k >= 0; k--) {
					that.scenarioEditor._editor.getAllSymbols()[k].changeTableBorder = false;
					that.scenarioEditor._editor.getAllSymbols()[k].highlightBorder = false;
				}
			}
			//Guard reentrance
			return this._openQueue.next(function() {
				return that._setItems(items, selectedKey, selectedNodeName, viewModel);
			});
		},

		_setItems: function(items, selectedKey, selectedNodeName, viewModel) {
			if (!this._content) {
				return Q();
			}
			// allow to wait for content creation
			var result = Q.defer();
			var addItemPromises = [];

			if (selectedNodeName) {
				this.contentCount = 2;
			} else {
				this.contentCount = 1;
			}

			jQuery.sap.require('sap.ui.ux3.NavigationBar');

			var i;
			var that = this;
			var layout = this._content;

			// remember the previously selected item
			/*var oldKey;
            var oldContent = this._content.getContent();
            if (oldContent.length > 0) {
                var selectedItemID = oldContent[0].getSelectedItem();
                var oldItems = oldContent[0].getItems();
                for (i = 0; i < oldItems.length; i++) {
                    if (oldItems[i].getId() === selectedItemID) {
                        oldKey = oldItems[i].getKey();
                        break;
                    }
                }
            }*/

			layout.destroyContent();

			var warningToolBar = new sap.ui.commons.Toolbar();
			warningToolBar.setStandalone(false);
			warningToolBar.setDesign(sap.ui.commons.ToolbarDesign.Flat);
			warningToolBar.setWidth("100px");

			/*var icon = new sap.ui.core.Icon( { 
    src : sap.ui.core.IconPool.getIconURI("message-warning"),
						size : "22px",  
                        color : "#333333",  
                        activeColor : "white",  
                        activeBackgroundColor : "#333333"
                        }).addStyleClass( "fontIcon" );

                        warningToolBar.addItem(icon);*/
			var toolTipMessage = resourceLoader.getText("txt_viewDeprecated");
			var oRichTooltip = new sap.ui.commons.RichTooltip({
				text: "<ul>" + toolTipMessage + "</ul>",
				title: "Deprecated View"
			});
			var icon = new sap.ui.commons.Image({
				src: resourceLoader.getImagePath("Warning.png"),
				tooltip: oRichTooltip,
				width: "20px"

			});
			warningToolBar.addItem(icon);

			warningToolBar.setWidth("100%");

			var oTextView = new sap.ui.commons.TextView({
				text: resourceLoader.getText("txt_viewDeprecated"),
				tooltip: resourceLoader.getText("txt_viewDeprecated"),
				wrapping: false,
				width: "50%",
				design: sap.ui.commons.TextViewDesign.H5
			});

			warningToolBar.addItem(oTextView);

			warningToolBar.addStyleClass("warningToolBar");

			////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\

			jQuery.sap.require('sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.NavigationTab');
			that._navBar = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.NavigationTab({
				select: function(event) {
					that.selectTab(event.getParameter("item"), event.getParameter("item").getKey());
				}
			});
			that._navBar.addStyleClass("customSapUiUx3NavBar");
			//Navigation symbols enabling
			//that._navBar.addStyleClass("sapUiUx3NavBarScrollForward");
			if (selectedNodeName) {
				var headerLabel = new sap.ui.commons.Label();
				headerLabel.setText(selectedNodeName);
				headerLabel.addStyleClass("tabStripLabel");
				var isEntityDeprecated = false;
				toolTipMessage = "";
				var count = 1;
				viewModel.columnView.viewNodes.foreach(function(v) {
					v.inputs.foreach(function(ip) {
						if (ip.getSource().deprecated) {
							isEntityDeprecated = true;
							toolTipMessage = toolTipMessage + count + ")\"" + v.name + "\"." + ip.getSource().fqName + " <br/> ";
							count++;
						}
					});
				});

				//for verifying view is deprecated or not 
				/*	viewModel.columnView.parameters.foreach(function(p){
				    if(p.externalTypeOfEntity && p.externalTypeOfEntity.deprecated){
				          isEntityDeprecated=true; 
				      toolTipMessage=toolTipMessage+count+") \""+p.name+"\"."+p.externalTypeOfEntity.name +" <br/> ";
				      count++;
				    }
				});*/


				// Search functionality Code find and highlight


				var SearchField = new sap.ui.commons.TextField({	
					 liveChange:function(){
					        that._findandhighlight.search( this.getLiveValue());
					    }
				}).addStyleClass("searchBox");				
				var nextElement = new sap.ui.commons.Button({
					icon: sap.ui.core.IconPool.getIconURI("slim-arrow-down"),
					tooltip: "Next element",
					press:function(){
					    that._findandhighlight.next();
					}

				});				
				var preElement = new sap.ui.commons.Button({
					icon: sap.ui.core.IconPool.getIconURI("slim-arrow-up"),
					tooltip: "Previous element",
						press:function(){
					    that._findandhighlight.previous();
					}
				}).addStyleClass("searchFieldButton2");
				
				var countView = new sap.ui.commons.TextView().addStyleClass("countView");				

				var clearElement = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("DeleteIcon.png"),
					tooltip: "clear element",
					press: function() {
						searchLayout.addStyleClass("searchLayoutDisplay");
					}
				});
				that._clearele = clearElement;
				var lineageView = new sap.ui.commons.TextView();
				var clearLineage = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("DeleteIcon.png"),
					tooltip: "clear element",
					press: function() {						
						that._columnLineage.clearData(that.scenarioEditor._editor);
						lineageLayout.addStyleClass("lineageDisplay");
					}
				}).addStyleClass("lineageClear");
				that.clearLineage = clearLineage;
				$('body').on('keyup', function(e) {
					if (e.keyCode === 27) {
						that._clearele.firePress();
					}
				});
				var searchLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["1%", "50%", "18%", "10%", "10%", "10%", "1%"]
				});
				var lineageLayout = new sap.ui.commons.layout.MatrixLayout({
					widths: ["5%", "75%", "20%"]
				});
				lineageLayout.createRow(null, lineageView, clearLineage);
				//	lineageLayout.addStyleClass("searchLayout");
				lineageLayout.addStyleClass("lineageLayout");
				lineageLayout.addStyleClass("lineageDisplay");
				searchLayout.createRow(null, SearchField, countView, nextElement, preElement, clearElement, null);
				searchLayout.addStyleClass("searchLayout");
				searchLayout.addStyleClass("searchLayoutDisplay");
				that._columnLineage.lineageLayout = lineageLayout;
				//	that._columnLineage.editor = CalcViewEditorUtil.getCurEditor()._detailsPane.scenarioEditor;
				if (that._columnLineage.lineageView) {
					lineageLayout.removeStyleClass("lineageDisplay");
					lineageView.setText("Column Lineage");
				}
				var mLayout = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: true,
					widths: ["40%", "20%", "40%"]
				});
				mLayout.createRow(headerLabel, lineageLayout, searchLayout);
				that._findandhighlight.highlightControl = searchLayout;
				$('body').on('keyup', function(e) {
					if (e.ctrlKey === true && e.keyCode === 70) {
						if (that.curEditor === CalcViewEditorUtil.getCurEditor()) {
						    clearLineage.firePress();
							that._findandhighlight.editor = that.scenarioEditor._editor._extension;
							that._findandhighlight.findFunction();

						}
					}

				});
				if ((viewModel.columnView.deprecated || isEntityDeprecated) && selectedNodeName === "Semantics") {
					if (isEntityDeprecated) {
						oTextView.setText(resourceLoader.getText("txt_viewContaineDeprecated"));
						oRichTooltip.setText(toolTipMessage);
						oRichTooltip.setTitle("List of Deprecated views");
					}
					var oLayout = new sap.ui.layout.VerticalLayout();
					oLayout.addStyleClass("warningHeader");
					oLayout.addContent(warningToolBar);
					oLayout.addContent(mLayout);
					layout.addStyleClass("WarningHead");
					layout.addContent(oLayout);
				} else {
					layout.removeStyleClass("WarningHead");
					layout.addContent(mLayout);
				}
			}

			layout.addContent(that._navBar);

			this._close(true).then(function() {
				var selectedItem;
				if (Array.isArray(items)) {
					for (i = 0; i < items.length; i++) {
						addItemPromises.push(that._addItem(items[i], selectedKey));
					}
				}
				return Q.all(addItemPromises).then(function(addedItems) {
					for (var item in addedItems) {
						if (!addedItems.hasOwnProperty(item)) {
							continue;
						}
						if (addedItems[item]) {
							selectedItem = addedItems[item];
							break;
						}
					}
					// that._navBar.setSelectedItem(selectedItem);
					return that._selectTab(selectedItem, selectedKey).then(function() {
						result.resolve();
					});
				});
			}).done();
			return result.promise;
		},

		addItem: function(item, selectedKey) {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._addItem(item, selectedKey);
			});
		},

		_addItem: function(item, selectedKey) {
			var navItem, text,
				that = this,
				result = Q.defer();

			function textFormatter(txt, formatter, count) {
				if (typeof count === "string" && count.trim() !== "") {
					return txt + "(" + count + ")";
				}
				return txt + (isNaN(count) ? "" : "(" + (formatter ? formatter(count) : count) + ")");
			}

			if (this._navBar && item) {
				if (item.count) {
					if (typeof item.count === "number") {
						text = textFormatter(item.text, null, item.count);
					} else if (typeof item.count === "string") {
						text = {
							path: item.count,
							formatter: textFormatter.bind(null, item.text, null)
						};
					} else {
						text = {
							path: item.count.path,
							formatter: textFormatter.bind(null, item.text, item.count.formatter)
						};
					}
				} else {
					text = item.text;
				}
				jQuery.sap.require('sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.NavigationItemTab');
				navItem = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.NavigationItemTab({
					key: item.key,
					text: text
				});
				if (item.hasProxy) {
					navItem.bindProperty("isProxy", item.hasProxy);
				}
				this._navBar.addItem(navItem);
				// found previously selected item
				/*if (item.key === oldKey) {
                        selectedItem = navItem;
                        selectedKey = oldKey;
                    }*/

				// found selectedItem
				if (selectedKey && item.key === selectedKey) {
					result.resolve(navItem);
				} else {
					result.resolve();
				}

				if (item.modelKey) {
					if (!that._models[item.modelKey]) {
						that._models[item.modelKey] = new sap.ui.model.json.JSONModel();
					}
					navItem.setModel(that._models[item.modelKey]);
					navItem.bindElement("/");
				}
				that._tabContent[item.key] = {
					content: item.content,
					model: that._models[item.modelKey]
				};
				if (item.content.creator instanceof sap.ui.core.Control) {
					that._tabContent[item.key].control = item.content.creator;
				}
			}
			return result.promise;
		},

		removeItem: function(tabKey) {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._removeItem(tabKey);
			});
		},

		_removeItem: function(tabKey) {
			var that = this;
			var closePromise;
			var control;
			var tabContent;

			if (!this._tabContent) {
				return Q();
			}
			if (this._tabContent.hasOwnProperty(tabKey)) {
				tabContent = this._tabContent[tabKey];
				if (tabContent.content.object && typeof tabContent.content.object.close === "function") {
					closePromise = tabContent.content.object.close();
				}
				if (tabContent.control) {
					control = tabContent.control;
				}
				//determine item number and remove from navBar
				for (var i = 0; i < this._navBar.getItems().length; i++) {
					var item = this._navBar.getItems()[i];
					if (item.getKey() === tabKey) {
						if (this._navBar.getSelectedItem() === item.sId) {
							this._selectTab(this._navBar.getItems()[0], this._navBar.getItems()[0].getKey());
						}
						this._navBar.removeItem(i);
						break;
					}
				}
			}

			//remove from _models
			//  removeItemFromList(that._models, that._models[tabContent.modelKey]);
			//remove from _tabContent
			delete that._tabContent[tabKey];
			if (closePromise) {
				return Q.all(closePromise).then(function() {
					control.destroy();
				});
			} else if (control && typeof control.destroy === 'function') {
				control.destroy();
				return Q.promise;
			}
		},

		selectTab: function(item, key) {
			var that = this;
			that._clearele.firePress();
			var model = this._models["viewModel"];
			if (model) {
				var selectionProvider = model.getData().selectionProvider;
				selectionProvider.selectedKey = key;
			}
			//Guard reentrance
			return this._openQueue.next(function() {
				return that._selectTab(item, key);
			});
		},

		_selectTab: function(item, key) {
			var layout = this._content;
			var that = this;
			var result = Q.defer();

			function setControl(tab, control) {
				if (control) {
					control.setModel(tab.model);
					control.bindElement("/");
					tab.control = control;
				}
				layout.addContent(tab.control);
				if (typeof tab.content.object.selected === "function") {
					Q(tab.content.object.selected()).done(function() {
						result.resolve();
					});
				} else {
					result.resolve();
				}
			}

			if (typeof item !== 'undefined') {
				that._navBar.setSelectedItem(item);
			}
			layout.removeContent(this.contentCount);
			that._selectedKey = key;
			var tabContent = that._tabContent[key];
			if (!tabContent.control) {
				require([tabContent.content.creator], function(creator) {
					// creator is undefined if require fails, e.g. user has logged-out meanwhile 
					if (!creator || that._closed) {
						return;
					}
					var object = Object.create(creator.prototype);
					creator.call(object, tabContent.content.parameters);
					tabContent.content.object = object;
					object._columnLineage = that._columnLineage;
					object._findandhighlight = that._findandhighlight;
					// allow getContent to return a promise
					Q(object.getContent()).then(function(control) {
						setControl(tabContent, control);
					}).done();
					object._findandhighlight = that._findandhighlight;
					if (object.updateTable !== undefined) {
						object.updateTable();
					}
				}, function(err) {
					var cons = typeof console !== "undefined" ? console : undefined;
					if (cons) {
						cons.error(err);
					}
					setControl(tabContent);
				});
			} else {
				setControl(tabContent);
			}
			return result.promise;
		},

		setModelData: function(modelKey, data) {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._setModelData(modelKey, data);
			});
		},

		_setModelData: function(modelKey, data) {
			var model = this._models[modelKey];
			if (!model) {
				model = new sap.ui.model.json.JSONModel();
				this._models[modelKey] = model;
			}
			model.setData(data);
		},

		reopen: function() {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._reopen();
			});
		},

		_reopen: function() {
			var promises = [];
			if (this._tabContent) {
				for (var tabKey in this._tabContent) {
					if (!this._tabContent.hasOwnProperty(tabKey)) {
						continue;
					}
					var tabContent = this._tabContent[tabKey];
					if (tabContent.content.object && typeof tabContent.content.object.reopen === "function") {
						promises.push(tabContent.content.object.reopen());
					}
				}
			}
			return Q.all(promises);
		},

		close: function(doNotSetClosed) {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._close(doNotSetClosed);
			});
		},

		_close: function(doNotSetClosed) {
			var that = this;
			that._closed = !doNotSetClosed;
			var closePromises = [];
			var controls = [];
			if (this._tabContent) {
				for (var tabKey in this._tabContent) {
					if (!this._tabContent.hasOwnProperty(tabKey)) {
						continue;
					}
					var tabContent = this._tabContent[tabKey];
					if (tabContent.content.object && typeof tabContent.content.object.close === "function") {
						closePromises.push(tabContent.content.object.close());
					}
					if (tabContent.control) {
						controls.push(tabContent.control);
					}
				}
			}

			for (var modelKey in that._models) {
				if (!that._models.hasOwnProperty(modelKey)) {
					continue;
				}
				that._models[modelKey].destroy();
			}
			that._tabContent = {};
			that._models = {};

			return Q.all(closePromises).then(function() {
				for (var i = 0; i < controls.length; i++) {
					controls[i].destroy();
				}
			});
		},

		_createContent: function(graphicalCalcView) {
			var layout = new sap.ui.commons.layout.VerticalLayout({
				width: "100%"
			});
			if (graphicalCalcView) {
				layout.addStyleClass("secondPaneNav");
			} else {
				layout.addStyleClass("secondPaneNavScript");
			}
			return layout;
		},

		getSelectedContent: function() {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._getSelectedContent();
			});
		},

		_getSelectedContent: function() {
			var tabContent = this._tabContent[this._selectedKey];
			if (tabContent && tabContent.content) {
				return tabContent.content.object;
			} else {
				return undefined;
			}
		}

	};

	return DetailsPane;
});

