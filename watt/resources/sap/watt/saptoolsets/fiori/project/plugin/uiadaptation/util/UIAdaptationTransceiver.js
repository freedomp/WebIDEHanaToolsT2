/**
 * @file The UIAdaptationTransceiver.js file is meant to run inside the UI5 application and trigger the RTA component,
 * as well as transmitting commands and information to and from the pane.
 */
(function() {
	// Create all browsers compatible event handler
	var sEventMethodName = window.addEventListener ? "addEventListener" : "attachEvent";
	var fnEventer = window[sEventMethodName];
	var sMessageEvent = sEventMethodName === "attachEvent" ? "onmessage" : "message";

	var sOrigin = null, oSource = null, oRta = null;
	var oLoadChangesPromise = jQuery.Deferred();
	var oSaveChangesPromise = null;

	// Listen to message from child window
	fnEventer(sMessageEvent, function(e) {
		e.stopImmediatePropagation();
		e.cancelBubble = true;

		if (e.data.action === "START_RTA") {
			sOrigin = e.origin;
			oSource = e.source;
			switchToAdaptionMode(e.data.variant);
		}

		if (e.data.action === "STOP_RTA") {
			if (oRta) {
				if (e.data.type === "close") {
					oRta.attachStop({}, function() {
						e.source.postMessage("RTA_STOPPED", e.origin);
					}, this);
				}
				oRta.stop();
			} else {
				if (e.data.type === "close") {
					e.source.postMessage("RTA_STOPPED", e.origin);
				}
			}
		}

		if (e.data.action === "CHANGES") {
			var oResult = {
				"changes": [],
				"settings": {
					"isKeyUser": true,
					"isAtoAvailable": false,
					"isProductiveSystem": false
				}
			};

			oResult.changes = e.data.changes;
			var oLrepChange = {
				changes: oResult,
				componentClassName: e.data.componentName
			};
			oLoadChangesPromise.resolve(oLrepChange);
		}

		if (e.data.action === "CHANGE_SAVED") {
			oSaveChangesPromise.resolve();
		}

		if (e.data.action === "LOAD_CHANGES_ERROR") {
			oLoadChangesPromise.reject(e.data.error);
		}

		if (e.data.action === "CHANGE_SAVE_FAILED") {
			oSaveChangesPromise.reject(e.data.message);
		}
	}, false);

	jQuery.sap.require("sap.ui.fl.FakeLrepConnector");
	jQuery.extend(sap.ui.fl.FakeLrepConnector.prototype, {

		/**
		 * Creates a Fake Lrep change in workspace
		 * @param  {Object} oChange - the change object
		 * @returns {Promise} Returns a promise to the result of the request
		 */
		create: function(oChange) {
			//post message will be caught by UIAdaptationMessageHandler which will call saveChangeToWorkspace
			oSource.postMessage({
				"action": "CREATE",
				"change": oChange
			}, sOrigin);
			oSaveChangesPromise = jQuery.Deferred();
			return oSaveChangesPromise;
		},

		/**
		 * Loads the changes for the given component class name
		 * from the Fake Lrep changes in workspace
		 *
		 * @param {String} sComponentClassName - Component class name
		 * @returns {Promise} Returns a Promise with the changes and componentClassName
		 * @public
		 */
		loadChanges: function() {
			return oLoadChangesPromise;
		}

	});
	sap.ui.fl.FakeLrepConnector.enableFakeConnector();


	var switchToAdaptionMode = function(variantId) {

		jQuery.sap.require("sap.ui.rta.RuntimeAuthoring");
		//get the rootControl of the application
		var view = jQuery(".sapUiView").control()[0];
		if(!view) {
			// if the view is still not loaded, try again in 500 millis
			console.log("Application not yet loaded and cannot start RTA - retrying...");
			setTimeout(switchToAdaptionMode, 500, variantId);
			return;
		}
		var ownerComponent = sap.ui.core.Component.getOwnerComponentFor(view);
		var appComponent;
		var varComponent;
		var oRootControl;
		if(ownerComponent.getAppComponent) {
			//Relevant for smart templates only
			appComponent = ownerComponent.getAppComponent();
			oRootControl = appComponent.getAggregation("rootControl");
			varComponent = appComponent;
		} else {
			//In other applications that's how we should get the root control
			oRootControl = ownerComponent.getAggregation("rootControl");
			varComponent = ownerComponent;
		}
		//Update the sap-app-id with variant id. this must happen before starting rta
		//the value of "reference" field in a change file will be populated with variantId
		//we set this value only if developer defined a variant, otherwise the change will be written on main component.
		//the value of variantId in case developer didnt set any - is null
		if(variantId) {
			if(!varComponent.oComponentData){
				varComponent.oComponentData = {};
			}
			if(!varComponent.oComponentData.startupParameters){
				varComponent.oComponentData.startupParameters = {};
			}
			varComponent.oComponentData.startupParameters["sap-app-id"] = [variantId];
		}

		oRta = new sap.ui.rta.RuntimeAuthoring({
			rootControl : oRootControl.getId()
		});
		oRta.start();
	};

})(document);