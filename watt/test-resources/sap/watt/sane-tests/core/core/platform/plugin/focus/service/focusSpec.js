define(["STF", "core/core/platform/plugin/focus/FocusTest/service/FocusTest"],
	function (STF, oFooService) {
		"use strict";

		var suiteName = "focusTest";
		var iFrameWindow = null;
		var oOriginalSap = sap;
		var oFocusService;
		var oContent;
		var focusEvt;
		var oFocusImpl;
		describe("Focus Test", function () {

			before(function () {
				var getService = STF.getServicePartial(suiteName);

				return STF.startWebIde(suiteName, {
					config: "core/core/platform/plugin/focus/config.json"
				}).then(function (webIdeWindowObj) {
					var mConsumer = {
						"name": "focusTestConsumer",

						"requires": {
							"services": ["focus"]
						}
					};
					iFrameWindow = webIdeWindowObj;
					window.sap = iFrameWindow.sap;
					iFrameWindow.jQuery.sap.registerModulePath('focus.test', window.webappPath() +
						'test-resources/sap/watt/sane-tests/core/core/platform/plugin/focus');
					oFocusService = getService("focus");
					oFooService.id = "focus1";

					return STF.getServicePrivateImpl(oFocusService).then(function (oFocusImplResult) {
						focusEvt = {
							type: "focus",
							currentTarget: {
								frameElement: false,
								getAttribute: function (sAttr) {
									return 0;
								}
							},
							target: {
								getAttribute: function (sAttr) {
									return 0;
								}
							}

						};

						focusEvt.getAttribute = function (sAttr) {
							return 0;
						};

						oFocusImpl = oFocusImplResult;
					}).then(function () {
						return STF.register(suiteName, mConsumer);
					});
				});
			});

			after(function () {
				window.sap = oOriginalSap;
				STF.shutdownWebIde(suiteName);
			});

			describe("Positive interface Focus tests", function () {
				before(function () {
					oContent = oFooService.getContent();
					iFrameWindow.$("body").append("<div id='focus1'></div>");
					iFrameWindow.$("body").append("<div id='focus2'></div>");
					oContent.placeAt("focus1");
					return Q();
				});

				it("setFocus", function () {
					return oFocusService.setFocus(oFooService).then(function () {
						assert.ok(oContent.getFocusDomRef(), "service gets the focus");
						assert.ok(oContent.getFocusInfo(), "servie gets the serialized focus information");
						return oFocusService.detachFocus(oFooService);
					});
				});

				it("getFocus", function () {
					return oFocusService.setFocus(oFooService).then(function () {
						oFocusImpl._focusHandler(focusEvt);
						return oFocusService.getFocus().then(function (oFocusElem) {
							assert.deepEqual(oFocusElem, oFooService, "service get focus");
							return oFocusService.detachFocus(oFooService);
						});
					});
				});

				it("attachFocus of ui.part instance service getFocusElement() implemented", function () {
					return oFocusService.attachFocus(oFooService).then(function () {
						oFocusImpl._focusHandler(focusEvt);
						var oFocusElement = iFrameWindow.$("#" + oContent.sId);
						assert.ok(oFocusElement.attr("tabindex"));
						assert.ok(oFocusElement.attr("focusindex"));
						return oFocusService.detachFocus(oFooService);
					});
				});

				it("attachFocus of none ui.part instance service with UI5 getDomRef() implemented", function () {
					var oDialog = _getDialog();

					oDialog.open();

					return oFocusService.attachFocus(oDialog).then(function () {
						assert.ok(oDialog.getDomRef().getAttribute("tabindex"), "UI5 control attach its domref impl. to the focus");
						assert.ok(oDialog.getDomRef().getAttribute("focusindex"), "UI5 control attach its domref impl. to the focus");
						return oFocusService.detachFocus(oDialog).then(function () {
							if (oDialog.isOpen()) {
								oDialog.close();
							}
						});
					});
				});

				function _getDialog(treeId) {
					//create the Tree control
					var oDialog;
					if (!sap.ui.getCore().byId("dummyDialog")) {
						var oTree = new sap.ui.commons.Tree("fooTree");
						oTree.setTitle("Explorer");
						oTree.setWidth("100%");
						oTree.setHeight("auto");
						oTree.setShowHeaderIcons(true);
						oTree.setShowHorizontalScrollbar(false);

						//create Tree Nodes
						var oNode1 = new sap.ui.commons.TreeNode("node1", {
							text: "Computer",
							icon: "images/system.gif",
							expanded: true
						});
						var oNode2 = new sap.ui.commons.TreeNode("node2", {
							text: "OSDisk (C:)",
							icon: "images/disk.gif",
							expanded: true
						});
						var oNode3 = new sap.ui.commons.TreeNode("node3", {
							text: "Program Files",
							icon: "images/folder.gif"
						});
						var oNode4 = new sap.ui.commons.TreeNode("node4", {
							text: "Windows",
							icon: "images/folder.gif"
						});
						var oNode5 = new sap.ui.commons.TreeNode("node5", {
							text: "Mass Storage (USB)",
							icon: "images/disk.gif"
						});
						var oNode6 = new sap.ui.commons.TreeNode("node6", {
							text: "Network",
							icon: "images/network.gif"
						});

						oNode1.addNode(oNode2);
						oNode1.addNode(oNode5);

						oNode2.addNode(oNode3);
						oNode2.addNode(oNode4);

						//add Tree Node root to the Tree
						oTree.addNode(oNode1);
						oTree.addNode(oNode6);

						var oText = new sap.ui.commons.TextView({
							text: "select one node"
						});

						var oLayout = new sap.ui.commons.layout.VerticalLayout({
							width: '100%'
						});
						oLayout.addContent(oTree);
						oLayout.addContent(oText);

						var oYesButton = new sap.ui.commons.Button({
							id: "dummyDialog_yesButton",
							text: "Sure",
							style: sap.ui.commons.ButtonStyle.Emph,
							enabled: true
						});

						var oNoButton = new sap.ui.commons.Button({
							id: "dummyDialog_noButton",
							text: "Sorry",
							style: sap.ui.commons.ButtonStyle.Emph,
							enabled: false
						});

						var oDialog = new sap.ui.commons.Dialog("dummyDialog", {
							title: "focus test",
							initialFocus: oText,
							buttons: [oYesButton, oNoButton],
							defaultButton: oYesButton,
							resizable: false,
							keepInWindow: true,
							modal: true
						});
					} else {
						oDialog = sap.ui.getCore().byId("dummyDialog");
					}
					return oDialog;
				}

				function _getElement() {
					var ul;
					//if ( !document.getElementById("dummyUL") ) {
					if (!iFrameWindow.$("#dummyUL") || iFrameWindow.$("#dummyUL").length === 0) {
						var docfrag = document.createDocumentFragment();
						var browserList = ["Internet Explorer", "Mozilla Firefox", "Safari", "Chrome", "Opera"];

						browserList.forEach(function (e) {
							var li = document.createElement("li");
							li.textContent = e;
							docfrag.appendChild(li);
						});

						ul = document.createElement("ul");
						ul.id = "dummyUL";
						ul.appendChild(docfrag);
						iFrameWindow.$("body").append(ul);
					} else {
						ul = iFrameWindow.$("#dummyUL");
					}

					return ul;
				}

				/*
				 it("attachFocus of none ui.part instance service with single html element", function() {
				 var ul = _getElement();

				 return oFocusService.attachFocus(ul).then(function() {
				 oFocusImpl._focusHandler(focusEvt);
				 var oFocusElement = iFrameWindow.$("#dummyUL");
				 //assert.ok(oFocusElement.attr("tabindex"), "single HTML Element attach itself to the focus");
				 //assert.ok(oFocusElement.attr("focusindex"), "single HTML Element attach itself to the focus");

				 assert.ok(ul.getAttribute("tabindex"), "single HTML Element attach itself to the focus");
				 assert.ok(ul.getAttribute("focusindex"), "single HTML Element attach itself to the focus");
				 return oFocusService.detachFocus(ul);
				 });
				 return Q();
				 });
				 */
				it("detachFocus on dialog", function () {
					var oDialog = _getDialog();

					oDialog.open();

					return oFocusService.attachFocus(oDialog).then(function () {
						oFocusImpl._focusHandler(focusEvt);
						return oFocusService.detachFocus(oDialog).then(function () {
							return oFocusService.getFocus(oDialog).then(function (oFocusElem) {
								assert.notEqual(oFocusElem, oDialog, "dialog is detached");
								if (oDialog.isOpen()) {
									oDialog.close();
								}
							});
						});
					});
				});

				it("detachFocus on mainWindow focused service", function () {
					return oFocusService.attachFocus(oFooService).then(function (oFocusElem) {
						oFocusImpl._focusHandler(focusEvt);
						return oFocusService.detachFocus(oFooService).then(function () {
							return oFocusService.getFocus(oFooService).then(function (oFocusElem) {
								assert.notEqual(oFocusElem, oContent, "service is detached");
							});
						});
					});
				});

				/*
				 it("detachFocus on none focused service", function() {
				 var ul = _getElement();

				 return oFocusService.attachFocus(ul).then(function() {
				 return oFocusService.detachFocus(ul).then(function() {
				 return oFocusService.getFocus(ul).then(function(oFocusElem){
				 notEqual(oFocusElem, ul, "element is detached");
				 });
				 });
				 });
				 });
				 */
			});

			/*
			 describe("negative Focus tests", function() {
			 it("attachFocus of none existing service", function() {
			 var dummyService = oFocusService.context.service.dummy;
			 return oFocusService.attachFocus(null).then(function() {
			 oFocusImpl._focusHandler(focusEvt);
			 assert.ok(false, "no focus should be attached to none exisiting service");
			 }, function() {
			 assert.ok(true, "no focus is attached to none exisiting service");
			 });
			 });

			 it("attachFocus of none existing dom element", function() {
			 var dummyElemnt = document.getElementById("dummyElem");
			 return oFocusService.attachFocus(dummyElemnt).then(function() {
			 assert.ok(false, "no focus should be attached to none  existing dom element");
			 }, function() {
			 assert.ok(true, "no focus is attached to none  existing dom element");
			 });
			 });


			 it("detachFocus on none existing service", function() {
			 var dummyService = oFocusService.context.service.dummy;
			 return oFocusService.detachFocus(dummyService).then(function() {
			 assert.ok(false, "no focus should be detached from non existing service");
			 }, function() {
			 assert.ok(true, "no focus is attached from non existing service");
			 });
			 });

			 it("detachFocus on none existing element", function() {
			 var dummyElemnt = document.getElementById("dummyElem");
			 return oFocusService.detachFocus(dummyElemnt).then(function() {
			 assert.ok(false, "no focus should be detached from none existing elment");
			 }, function() {
			 assert.ok(true, "no focus is attached  from none existing elment");
			 });
			 });

			 });
			 */

			describe("complex Focus tests", function () {
				before(function () {
					oContent = oFooService.getContent();
					oContent.placeAt("focus1");
					return Q();
				});

				it("attachFocus twice the same service", function () {
					return oFocusService.attachFocus(oFooService).then(function () {
						oFocusImpl._focusHandler(focusEvt);
						return oFocusService.attachFocus(oFooService).then(function () {
							oFocusImpl._focusHandler(focusEvt);
							assert.equal(oContent.getDomRef().getAttribute("focusindex"), 0);
							return oFocusService.detachFocus(oFooService);
						});
					});
				});
				/*
				 it("attachFocus twice the same element", function() {
				 var ul = _getElement();

				 return oFocusService.attachFocus(ul).then(function() {
				 var index = ul.getAttribute("focusindex");
				 return oFocusService.attachFocus(ul).then(function() {
				 asert.equal(ul.getAttribute("focusindex"), index);
				 return oFocusService.detachFocus(ul);
				 });
				 });
				 });

				 it("attachFocus a chain of focus", function() {
				 var ul = _getElement();

				 return oFocusService.attachFocus(oFooService).then(function() {
				 var index = this.oContent.getDomRef().getAttribute("focusindex");
				 equal(index, 0);
				 return oFocusService.attachFocus(ul).then(function() {
				 assert.notEqual(ul.getAttribute("focusindex"), index);
				 return oFocusService.detachFocus(oFooService).then(function() {
				 return oFocusService.detachFocus(ul);
				 });
				 });
				 });
				 });

				 it("setFocus of the one already in a chain of focusList", function() {
				 var ul = _getElement();

				 return oFocusService.attachFocus(oFooService).then(function() {
				 var index = this.oContent.getDomRef().getAttribute("focusindex");
				 return oFocusService.attachFocus(ul).then(function() {
				 return oFocusService.setFocus(oFooService).then(function() {
				 assert.equal(this.oContent.getDomRef().getAttribute("focusindex"), index);
				 return oFocusService.detachFocus(oFooService).then(function() {
				 return oFocusService.detachFocus(ul);
				 });
				 });
				 });
				 });
				 });

				 it("setFocus of the one not yet in a chain of focusList", function() {
				 var ul = _getElement();

				 return oFocusService.attachFocus(ul).then(function() {
				 var index = ul.getAttribute("focusIndex");
				 return oFocusService.setFocus(oFooService).then(function() {
				 assert.notEqual(this.oContent.getDomRef().getAttribute("focusindex"), index);
				 return oFocusService.detachFocus(oFooService).then(function() {
				 return oFocusService.detachFocus(ul);
				 });
				 });
				 });
				 });
				 */
				it("setFocus twice the same service", function () {
					return oFocusService.setFocus(oFooService).then(function () {
						oFocusImpl._focusHandler(focusEvt);
						return oFocusService.setFocus(oFooService).then(function () {
							oFocusImpl._focusHandler(focusEvt);
							assert.ok(true, "it is allowed to set focus of the same service");
							return oFocusService.detachFocus(oFooService);
						});
					});
				});

				it("detachfocus twice the same service", function () {
					return oFocusService.attachFocus(oFooService).then(function () {
						oFocusImpl._focusHandler(focusEvt);
						return oFocusService.detachFocus(oFooService).then(function () {
							return oFocusService.detachFocus(oFooService).then(function () {
								assert.ok(true, "it is allowed to detach the same attached service");
							});
						});
					});
				});
			});
		});
	});