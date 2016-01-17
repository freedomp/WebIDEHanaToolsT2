define(["STF", "sap/watt/core/q", "sane-tests/extensibility/util/WizardTestUtil"], function(STF, coreQ, WizardTestUtil) {
	"use strict";

	describe("Unit tests for Transceiver functions", function() {
		var VIEW_NAME = "Details";
		var ifr;
		before(function(done) {
			// Create an iframe in which the transceiver will be loaded
			ifr = document.createElement("iframe");
			ifr.id = "transceiverFrame";
			ifr.src = require.toUrl("../test-resources/sap/watt/sane-tests/extensibility/ExtensibilityPane/transceiverFrame.html");
			ifr.style.display = "none";
			ifr.addEventListener('load', function (e) {
				// Add a script tag transceiver.js
				var transceiverScriptTag = ifr.contentDocument.createElement("script");
				transceiverScriptTag.type = "text/javascript";
				ifr.contentDocument.head.appendChild(transceiverScriptTag);
				transceiverScriptTag.addEventListener('load', function (e) {
					// Add a div for the transceier content (e.g. the view)
					var transceiverContentNode = ifr.contentDocument.createElement("DIV");
					transceiverContentNode.id = "transceiverContent";
					ifr.contentDocument.body.appendChild(transceiverContentNode);
					done();						
				}, false);		
				transceiverScriptTag.src = require.toUrl("sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/visualExt/transceiver.js");
				
				// Add a container for the view
				var viewContainerDiv = document.createElement("DIV");
				viewContainerDiv.id = "viewContainer";
				viewContainerDiv.style.display = "none";
				document.body.appendChild(viewContainerDiv);
			}, false);
			document.body.appendChild(ifr);
			

		});

		beforeEach(function() {
			// Clear the transceiverContent div
			var contentNode = ifr.contentDocument.getElementById("transceiverContent");
			while (contentNode.firstChild) {
				contentNode.removeChild(contentNode.firstChild);
			}
			// Lock the core - needed by onMouseClick
			ifr.contentWindow.sap.ui.getCore().lock();
		});

		// Observes changes in the view container div, and once the view is loaded into it,
		// we copy the dom of the view into the inner iframe, and then
		// we execute the callback
		function observeChangesInViewContainer(fnCallback) {
			var target = document.querySelector("#viewContainer");
			var bCallbackExecuted = false;
			// Create an observer instance
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (!bCallbackExecuted && mutation.type === "childList") {
						// Copy the DOM of the view from the window to the inner iframe
						ifr.contentDocument.querySelector("#transceiverContent").innerHTML = document.getElementById("viewContainer").innerHTML;
						ifr.contentWindow.mockViews();
						fnCallback();
						bCallbackExecuted = true;
					}
				});
			});
			// Configuration of the observer:
			var config = {
				attributes: true,
				childList: true,
				characterData: true
			};
			observer.observe(target, config);
		}

		// Get a Details view and load it into the view container div (in the root window), call a callback once loaded, and then execute a general callback
		function loadXmlView(fnCallback, fnObserverCallback) {
			var sViewUrl = require.toUrl("../test-resources/sap/watt/sane-tests/extensibility/ExtensibilityPane/Detail.view.xml");
			coreQ.sap.ajax(sViewUrl, {
				responseType: "xml" // xml isn't a valid responte type, but it seems to do the trick of loading the xml view
			}).then(function(oViewRes) {
				// Instantiate the View
				var myView = sap.ui.xmlview({
					viewContent: oViewRes[0]
				});
				observeChangesInViewContainer(fnObserverCallback);

				// Put the View into its container
				myView.placeAt("viewContainer");
				
				fnCallback();
			});			
		}

		// Injects a details view into the dom, simulate a click on an element, and assert 
		// that transceiver returns the correct control id and view name for the clicked element
		it("Finds the control id in master details application", function(done) {
			// Window messages listener
			function receiveMessage(event) {
				if (event.data.indexOf("ELEMENT_") === 0) {
					// onMouseClick sent a message with the control ID it found
					var sControlId = event.data.substring(event.data.indexOf(";") + 1);
					expect(sControlId).to.equal("iconTabFilter1");
					var sViewId = event.data.substring("ELEMENT_".length, event.data.indexOf(";"));
					expect(sViewId).to.equal(VIEW_NAME);
					window.removeEventListener("message", receiveMessage);
					done();
				}
			}
			window.addEventListener("message", receiveMessage, false);

			// Load the xml, and then simulate click on the element for which we want the control ID
			loadXmlView(function() {
				// Trigger init of transceiver (needed to init the source)
				ifr.contentWindow.postMessage("INITIALIZE", "*");
			}, function() {
				ifr.contentDocument.getElementById("__xmlview0--iconTabFilter1-icon").click();
			});
		});
		
		// Test for findViewIdByExtensionPointId()
		it("Finds the view id for clicked extension point in master details application", function(done) {
			// We need to mock sap.ui.getCore().byId() when called with __xmlview0
			var oOldCore = ifr.contentWindow.sap.ui.getCore();
			var fOldCoreById = oOldCore.byId;
			ifr.contentWindow.sap.ui.getCore = function() {
				var oCore = oOldCore;
				oCore.byId = function(sId) {
					if (sId !== "__xmlview0") {
						return fOldCoreById(sId);
					} else {
						return {sViewName: VIEW_NAME};
					}
				};
				return oCore;
			};
			
			// Window messages listener
			function receiveMessage(event) {
				if (event.data.indexOf("ELEMENT_") === 0) {
					// onMouseClick sent a message with the control ID it found
					var sViewId = event.data.substring("ELEMENT_".length, event.data.indexOf(";"));
					expect(sViewId).to.equal(VIEW_NAME);
					window.removeEventListener("message", receiveMessage);
					ifr.contentWindow.sap.ui.getCore = function() {					
						return oOldCore;
					};
					done();
				}
			}
			window.addEventListener("message", receiveMessage, false);

			var oExtensionPoints = {"views": [
				{"name":"Details",
					"extensionPoints":[
						{"name":"extIconTabFilter",
						"isExtended":false}
						]
				}]};				

			function receiveMessageInIframe(event) {
				if (event.data === "INITIALIZE") {
					ifr.contentWindow.postMessage("EXTENSION_POINTS" + JSON.stringify(oExtensionPoints), "*");
				} else if (jQuery.sap.startsWith(event.data, "EXTENSION_POINTS")) {
						ifr.contentWindow.postMessage("LOCK_UI", "*");
				}
			}

			// Load the xml, and then init injection of extension point, and click on it
			loadXmlView(function() {
				WizardTestUtil.waitKarma(function () {
					return ifr.contentDocument.getElementById("__xmlview0--extIconTabFilterlabel");
				}, function (oExtensionPoint) {
					oExtensionPoint.click();
				});
			}, function() {
				ifr.contentWindow.addEventListener("message", receiveMessageInIframe, false);				
				
				// Trigger init of transceiver (needed to init the source)
				ifr.contentWindow.postMessage("INITIALIZE", "*");				
			});
		});		
	
		// Injects a div with an ID into the dom, simulate a click on the div, and assert 
		// that transceiver returns the correct control id for the clicked element
		// We use a simple div here instead of injecting a view since the ID we need is generated 
		// by nested view, which is harder to simulate.
		// The ID we use has the format of an ID in a nested view
		it("Finds the control id in free style application format", function(done) {
			var node = ifr.contentDocument.createElement("DIV");
			node.id = "__xmlview0--container-component---detail--iconTabBarFilter2-icon";
			ifr.contentDocument.body.appendChild(node);


			function receiveMessageInWindow(event) {
				if (event.data.indexOf("ELEMENT_") === 0) {
					var sControlId = event.data.substring(event.data.indexOf(";") + 1);
					expect(sControlId).to.equal("iconTabBarFilter2");
					window.removeEventListener("message", receiveMessageInWindow);
					done();
				}
			}
			window.addEventListener("message", receiveMessageInWindow, false);

			function receiveMessageInIframe(event) {
				if (event.data === "INITIALIZE") {
					node.click();
					ifr.contentWindow.removeEventListener("message", receiveMessageInIframe);
				}
			}
			ifr.contentWindow.addEventListener("message", receiveMessageInIframe, false);
			ifr.contentWindow.postMessage("INITIALIZE", ifr.contentWindow.location.origin);
		});
	});
});