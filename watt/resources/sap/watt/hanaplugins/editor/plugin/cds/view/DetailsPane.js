/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require", "../util/ResourceLoader"], function(require, ResourceLoader) {
	"use strict";

	/**
	 * @class
	 */
	var DetailsPane = function() {
		this._content = null;
		this._models = {};
		this._tabContent = {};
		this._selectedKey = undefined;
		this.contentCount = -1;
		this._openQueue = new Q.sap.Queue();
	};

	DetailsPane.prototype = {

		getContent: function() {
			if (!this._content) {
				this._content = this._createContent();
			}
			return this._content;
		},

		setItems: function(items, selectedKey, selectedNodeName, callback) {
			var that = this;

			//Guard reentrance
			return this._openQueue.next(function() {
				return that._setItems(items, selectedKey, selectedNodeName, callback);
			});
		},

		_setItems: function(items, selectedKey, selectedNodeName, callback) {
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

			jQuery.sap.require('sap.watt.hanaplugins.editor.plugin.cds.view.NavigationTab');
			that._navBar = new sap.watt.hanaplugins.editor.plugin.cds.view.NavigationTab({
				select: function(event) {
					that.selectTab(event.getParameter("item"), event.getParameter("item").getKey());
				}
			});
			that._navBar.addStyleClass("customSapUiUx3NavBar");
			//Navigation symbols enabling
			//that._navBar.addStyleClass("sapUiUx3NavBarScrollForward");
			if (selectedNodeName) {
				var backButton = new sap.ui.commons.Button({
					icon: "sap-icon://navigation-left-arrow",
					text: "Back",
					press: function(oevent) {
						if (callback) {
							callback();
						}
					}
				}).addStyleClass("backButton");

				var headerLabel = new sap.ui.commons.Label();
				headerLabel.setText(selectedNodeName);
				headerLabel.addStyleClass("tabStripLabel");
				var oLayout = new sap.ui.layout.HorizontalLayout({
					content: [backButton, headerLabel]
				});

				layout.addContent(oLayout);
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
					// allow getContent to return a promise
					Q(object.getContent(tabContent.model)).then(function(control) {
						setControl(tabContent, control);
					}).done();
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

		_createContent: function() {
			var layout = new sap.ui.commons.layout.VerticalLayout({
				width: "100%"
			});
			layout.addStyleClass("secondPaneNavTitle");

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