sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {


	var ROOT_NODE_TAG = "rootRepository";

	/**
	 *	searchs for node and executes oOptions.callback with this node
	 *	searchs in previous founded node, if not oOptions.root, else searchs for root node
	 *	[oOptions.name] search for node with a custom name
	 */
	var _onNode = function(oOptions) {
		var that = this,
			aMatchers = [];

		if (oOptions.matchers) {
			if (Array.isArray(oOptions.matchers)) {
				aMatchers = oOptions.matchers;
			} else {
				aMatchers.push(oOptions.matchers);
			}
		}

		if (oOptions.name) {
			aMatchers.unshift(new sap.ui.test.matchers.Properties({
				text: oOptions.name
			}));
		}
		if (oOptions.root) {
			aMatchers.unshift(function(oControl) {
				if (oControl.type === ROOT_NODE_TAG) {
					return true;
				}
			});
		} else {
			aMatchers.unshift(function(oControl) {
				if (oControl.getParent() === that._oCurrentNode) {
					return true;
				}
			});
		}

		var sErrorMessage = "Can't find ";
		if (oOptions && oOptions.root) {
			sErrorMessage += "root node in repositorybrowser";
		} else {
			sErrorMessage += JSON.stringify(oOptions);
		}
		return this.waitFor({
			timeout: 25,
			controlType: "sap.ui.commons.TreeNode",
			matchers: aMatchers,
			success: function(oNodes) {
				this._oCurrentNode = oNodes[0];
				if (oOptions.callback) {
					return oOptions.callback.call(this, this._oCurrentNode);
				}
			},
			errorMessage: sErrorMessage
		});
	};

	var _isRepositorybrowserOpened = function(fnSuccess) {
		return this.waitFor({
			success : function(oShell) {
				var $outlinePaneContent = this.getWindow().$(".sapWattRepositoryBrowser");
				var bIsOpened = $outlinePaneContent.length && ($outlinePaneContent.width() > 0);
				fnSuccess.call(this, bIsOpened);
			}
		});
	};

	return Opa5.createPageObjects({
		inTheRepositoryBrowser: {
			baseClass: WebIDEBase,

			actions: {
				/**	clicks through menuItems with ids in context menu -> context submenus */
				iClickInContextMenu: function(aIds) {
					var that = this;
					if (aIds && !(aIds instanceof Array)) {
						aIds = [aIds];
					}
					var waitForMenuAndClick = function(aIds, oPreviousMenu) {
						if (aIds.length) {
							that.waitFor({
								controlType: "sap.ui.unified.Menu",
								matchers: [
									function(oControl) {
										if (oPreviousMenu) {
											// is submenu
											return oControl.hasStyleClass("WattMainMenuSub");
										} else {
											// is context menu
											return oControl.hasStyleClass("sapWattContextMenu");
										}
									},
									new sap.ui.test.matchers.Ancestor(oPreviousMenu)
								],
								success: function(aMenus) {
									var oMenu = aMenus[0];
									var sId = aIds.shift();
									that.waitFor({
										id: sId,
										controlType: "sap.ui.unified.MenuItem",
										matchers: new sap.ui.test.matchers.Ancestor(oMenu),
										success: function(aMenuItems) {
											that.simulate.click(aMenuItems[0]);
											waitForMenuAndClick(aIds, oMenu);
										},
										errorMessage: "Can't click '" + sId + "' in context menu"
									});
								},
								errorMessage: "I can't find context menu with ancestor: " + oPreviousMenu
							});

						}
					};

					waitForMenuAndClick(aIds);
					// return this for chaining
					return this;
				},

				/** opens context menu for node in sPath */
				iOpenContextMenuFor: function(sPath) {
					var mPath = sPath.split("/");
					if (mPath.length) {
						// last element must be a filename
						var sLastNodeName = mPath.pop();
						// other elements are folders
						this.iExpand(mPath.join("/"));

						_onNode.call(this, {
							name: sLastNodeName,
							callback: function(oNode) {
								this.simulate.click(oNode);
								this.simulate.rightClick(oNode);
							}
						});
					}
					// return this for chaining
					return this;
				},

				iExpand: function(sPath) {
					var that = this,
						mPath = [];

					if (sPath && sPath.length) {
						mPath = sPath.split("/");
					}

					// root folder
					_onNode.call(that, {
						root: true,
						callback: function(oNode) {
							oNode.expand();
						}
					});

					// expand path
					jQuery.each(mPath, function(i, sName) {
						_onNode.call(that, {
							name: sName,
							callback: function(oNode) {
								oNode.expand();
							}
						});
					});
					// return this for chaining
					return this;
				},

				// path as a parameter ("folder/folder/../file.extension")
				iOpenFileInLayoutEditor: function(sPath) {
					this.iOpenContextMenuFor(sPath);
					this.iClickInContextMenu([
						/file.openwith/i,
						/openwith-ui5wysiwygeditor/i
					]);
				},

				iOpenFileInCodeEditor: function(sPath) {
					this.iOpenContextMenuFor(sPath);
					this.iClickInContextMenu([
						/file.openwith/i,
						/openwith-aceeditor/i
					]);
				},

				/**
				 *	select a node in a repositoryTree
				 *	path as a parameter ("folder/folder/../file.extension")
				 */
				iSelectNode: function(sPath) {
					var mPath = sPath.split("/");
					if (mPath.length) {
						var sNodeToSelectName = mPath.pop();
						this.iExpand(mPath.join("/"));
						// select file by name
						_onNode.call(this, {
							name: sNodeToSelectName,
							matchers: new sap.ui.test.matchers.Selector(">span"),
							callback: function($el) {
								this.simulate.click($el);
							}
						});
					}
					// return this for chaining
					return this;
				}
			},

			assertions: {

				iCanSeeIt : function() {
					return _isRepositorybrowserOpened.call(this, function(bIsOpened) {
						ok(bIsOpened, "Outline pane is visible");
					});
				},

				iCanNotSeeIt : function() {
					return _isRepositorybrowserOpened.call(this, function(bIsOpened) {
						//TODO check why notOK is not approved by jsLint
						ok(!bIsOpened, "Outline pane is not visible");
					});
				},

				iSeeADialog: function() {
					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",

						success: function(oDialog) {
							ok(true, "I see a popup");
						},
						errorMessage: "There was no popup"
					});
				},
				
				iSeeRepositoryTree: function() {
					return this.waitFor({
						id: "repositoryTree",
					    viewName : "sap.watt.platform.plugin.repositorybrowser.view.RepositoryBrowser",
						success: function(oRepositoryTree) {
							ok(oRepositoryTree);
						},
						errorMessage: "There was no repository tree"
					});
				},
				
			    nodeIsExpanded: function(sPath) {
					var that = this,
						mPath = [];

					if (sPath && sPath.length) {
						mPath = sPath.split("/");
					}

					// root folder
					_onNode.call(that, {
						root: true,
						callback: function(oNode) {
							oNode.expand();
						}
					});

					// expand path
					jQuery.each(mPath, function(i, sName) {
						_onNode.call(that, {
							name: sName,
							matchers: new sap.ui.test.matchers.Properties({
								expanded: true
							})
						});
					});
				},

				nodeIsSelected: function(sPath) {
					var that = this;
					var mPath = sPath.split("/");
					if (mPath.length) {
						var sNodeToSelectName = mPath.pop();
						this.nodeIsExpanded(mPath.join("/"));
						// select node by name
						_onNode.call(this, {
							name: sNodeToSelectName,
							matchers: new sap.ui.test.matchers.Properties({
								isSelected: true
							}),
							callback: function() {
								ok(true, "Node is selected " + sPath);
							}

						});
					}
				}

			}
		}
	});
});