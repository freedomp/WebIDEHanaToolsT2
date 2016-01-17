sap.ui.define([ "sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase" ], function(Opa5, WebIDEBase) {
	"use strict";

	var _isOutlinePaneOpened = function(fnSuccess) {
		return this.waitFor({
			success : function(oShell) {
				var $outlinePaneContent = this.getWindow().$(".sapWattOutlinePaneContent");
				var bIsOpened = $outlinePaneContent.length && ($outlinePaneContent.width() > 0);
				fnSuccess.call(this, bIsOpened);
			}
		});
	};

	var _onNode = function(oOptions) {
		var that = this, aMatchers = [];

		if (oOptions.matchers) {
			if (Array.isArray(oOptions.matchers)) {
				aMatchers = oOptions.matchers;
			} else {
				aMatchers.push(oOptions.matchers);
			}
		}

		if (oOptions.name) {
			aMatchers.unshift(new sap.ui.test.matchers.Properties({
				text : oOptions.name
			}));
		}
		if (oOptions.root) {
			aMatchers.unshift(function(oControl) {
				if (oControl.data("isRoot")) {
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
			sErrorMessage += "root node in outline";
		} else {
			sErrorMessage += +JSON.stringify(oOptions);
		}
		return this.waitFor({
			viewName : "sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane",
			controlType : "sap.ui.commons.TreeNode",
			matchers : aMatchers,
			success : function(oNodes) {
				var nNodeIndex = 0;
				if (oOptions.nodeIndex) {
					nNodeIndex = oOptions.nodeIndex;
				}
				this._oCurrentNode = oNodes[nNodeIndex];
				if (oOptions.callback) {
					return oOptions.callback.call(this, this._oCurrentNode);
				}
			},
			errorMessage : sErrorMessage
		});
	};

	var _onTheRootNode = function(fnSuccess) {
		return this.waitFor({
			viewName : "sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane",
			controlType : "sap.ui.commons.TreeNode",
			matchers : [ function(oNode) {
				return oNode.getTag() === ROOT_NODE_TAG;
			} ],
			success : function(aRootNodes) {
				var oRootNode = aRootNodes[0];
				fnSuccess.call(this, oRootNode);
			},
			errorMessage : "Can't find root node in the w5g outline"
		});
	};

	var _onTheTreeNodes = function(aMatchers, fnSuccess, sErrorMessage) {
		if (aMatchers) {
			if (!(aMatchers instanceof Array)) {
				aMatchers = [ aMatchers ];
			}
		} else {
			aMatchers = [];
		}

		return _onTheRootNode.call(this, function(oRootNode) {
			aMatchers.push(new sap.ui.test.matchers.Ancestor(oRootNode));
			this.waitFor({
				viewName : "sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane",
				controlType : "sap.ui.commons.TreeNode",
				matchers : aMatchers,
				success : function(aNodes) {
					fnSuccess.call(this, aNodes);
				},
				errorMessage : sErrorMessage ? sErrorMessage : "Can't find tree node in the w5g outline"
			});
		});
	};

	var _onTheTreeNodeWithName = function(sName, fnSuccess) {
		return _onTheTreeNodes.call(this, new sap.ui.test.matchers.Properties({
			text : sName
		}), function(aNodes) {
			var oNode = aNodes[0];
			fnSuccess.call(this, oNode);
		}, "Can't find tree node with name " + sName + " in a tree");
	};

	return Opa5.createPageObjects({
		inTheOutlinePane : {
			baseClass : WebIDEBase,

			actions : {
				iToggleIt : function() {
					return this.waitFor({
						// regexp id search (contains "outlinepane.toggle")
						id : /outlinepane.toggle/i,
						success : function(oBtn) {
							this.simulate.click(oBtn[0]);
						},
						errorMessage : "Can't toggle outline pane"
					});
				},

				iCloseIt : function() {
					return _isOutlinePaneOpened.call(this, function(bIsOpened) {
						if (bIsOpened) {
							return this.iToggleIt();
						}
					});
				},

				iOpenIt : function() {
					return _isOutlinePaneOpened.call(this, function(bIsOpened) {
						if (!bIsOpened) {
							return this.iToggleIt();
						}
					});
				}
			},
			assertions : {
				iCanSeeIt : function() {
					return _isOutlinePaneOpened.call(this, function(bIsOpened) {
						ok(bIsOpened, "Outline pane is visible");
					});
				},
					iCanNotSeeIt : function() {
					return _isOutlinePaneOpened.call(this, function(bIsOpened) {
					    //TODO check why notOK is not approved by jsLint
							ok(!bIsOpened, "Outline pane is not visible");
					});
				}
			}
		},

		inTheW5GOutline : {
			baseClass : WebIDEBase,

			actions : {
				iHoverNode : function(sName) {
					return _onTheTreeNodeWithName.call(this, sName, function(oNode) {
						this.simulate.mouseover(oNode);
					});
				},
				iUnhoverNode : function(sName) {
					return _onTheTreeNodeWithName.call(this, sName, function(oNode) {
						this.simulate.mouseout(oNode);
					});
				},

				iExpand : function(sPath) {
					var that = this, mPath = [];

					if (sPath && sPath.length) {
						mPath = sPath.split("/");
					}

					// root folder
					_onNode.call(that, {
						root : true,
						callback : function(oNode) {
							oNode.expand();
						}
					});

					// expand path
					jQuery.each(mPath, function(i, sName) {
						_onNode.call(that, {
							name : sName,
							callback : function(oNode) {
								oNode.expand();
							}
						});
					});
					// return this for chaining
					return this;
				},

				/**
				 *	select a node in an outline tree
				 *	path as a parameter ("node/node/../node")
				 */
				iSelectNode : function(sPath, nNodeIndex) {
					var mPath = sPath.split("/");
					if (mPath.length) {
						var sNodeToSelectName = mPath.pop();
						this.iExpand(mPath.join("/"));
						// select file by name
						_onNode.call(this, {
							name : sNodeToSelectName,
							matchers : new sap.ui.test.matchers.Selector(">span"),
							nodeIndex : nNodeIndex,
							callback : function($el) {
								this.simulate.click($el);
							}
						});
					}
					// return this for chaining
					return this;
				},

				iExpandAll : function() {
					return _onTheRootNode.call(this, function(oRoot) {
						oRoot.getParent().expandAll();
					});
				},

				iPressDelete : function() {
					this.waitFor({
						success : function() {
							this.simulate.press("DELETE");
						}
					});
				}
			},
			assertions : {
				// check if root node with a text sName is in the w5g tree
				iHaveRootNode : function(sName) {
					return this.waitFor({
						viewName : "sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane",
						controlType : "sap.ui.commons.TreeNode",
						matchers : [ new sap.ui.test.matchers.Properties({
							text : sName
						}), function(oNode) {
							return oNode.getTag() === ROOT_NODE_TAG;
						} ],
						success : function(aNodes) {
							strictEqual(aNodes.length, 1, "I see a tree for a " + sName);
						},
						errorMessage : "Can't see root node '" + sName + "' in the w5g outline"
					});
				},

				iHaveNode : function(sName) {
					return _onTheTreeNodeWithName.call(this, sName, function(oNode) {
						ok(oNode, "I have node " + sName + " in the outline");
					});
				},

				iSeeSelection : function() {
					return this.waitFor({
						viewName : "sap.watt.ideplatform.plugin.outlinepane.view.OutlinePane",
						controlType : "sap.ui.commons.TreeNode",
						matchers : [ new sap.ui.test.matchers.Properties({
							isSelected : true
						}), function(oNode) {
							// check the parent is a root node of w5g outline
							var bFound = false;
							while (!bFound && oNode) {
								bFound = oNode.getTag && (oNode.getTag() === ROOT_NODE_TAG);
								oNode = oNode.getParent();
							}
							return bFound;
						} ],
						success : function(aNodes) {
							strictEqual(aNodes.length, 1, "I see a selected node " + aNodes[0].getText());
						},
						errorMessage : "I don't see selection in w5g outline"
					});
				},

				nodeIsSelected : function(sName) {
					return _onTheTreeNodes.call(this, [ new sap.ui.test.matchers.Properties({
						text : sName,
						isSelected : true
					}) ], function(aSelectedNodes) {
						strictEqual(aSelectedNodes.length, 1);
						var oSelectedNode = aSelectedNodes[0];
						ok(oSelectedNode, "Node " + sName + " is selected");
					}, "The node " + sName + " is not selected");
				},

				iSeeVerticalScrollbar : function() {
					function hasVerticalScroll($el) {
						var sX = $el.css('overflow-x'), sY = $el.css('overflow-y'), hidden = 'hidden', // minifiers would like this better
						visible = 'visible', scroll = 'scroll';

						if (sY === hidden || sY === visible) {
							return false;
						}
						if (sY === scroll) {
							return true;
						}

						//Compare client and scroll dimensions to see if a scrollbar is needed
						return $el.innerHeight() < $el[0].scrollHeight; //innerHeight is the one you want
					}

					return this.waitFor({
						viewName : "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.OutlineTree",
						id : "outlineTree",
						matchers : new sap.ui.test.matchers.Selector(".sapUiTreeContScroll"),
						success : function($treeContent) {
							ok(hasVerticalScroll($treeContent), "Tree content has vertical scrollbar scroll");
						},
						errorMessage : "I can't see a vertical scrollbar"
					});
				}
			}
		}
	});
});