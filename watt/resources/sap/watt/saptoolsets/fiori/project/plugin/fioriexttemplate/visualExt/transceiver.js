(function(document) {

	jQuery.sap.require('jquery.sap.xml');
	jQuery.sap.require("sap.ui.core.IconPool");
	jQuery.sap.require("sap.ui.commons.Label");

	// start the app in the unlocked status
	if (sap.ui.getCore().isLocked()) {
		sap.ui.getCore().unlock();
	}
	// Create all browsers compatible event handler
	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

	var startViewString = "__xmlview";
	var startControlIdString = "--";
	var endControlIdString = "-";
	// Tripple dash is used in alternative id format, e.g. "__xmlview0--container-component---detail--iconTabBarFilter2-icon"
	// (as opposed to the regular id format, e.g. "__xmlview4--IconTabBarFilterPOInformation-icon")
	var startViewNameString = "---";  

	var origin = null;
	var source = null;
	var viewsArray = null;

	var selectedId = null;
	var selectedElements = [];
	var lastElements = [];
	var extensionPointsObj = null;

	// Listen to message from child window
	eventer(messageEvent, function(e) {
		var operation;

		if (jQuery.sap.startsWith(e.data, "SELECT_") && sap.ui.getCore().isLocked()) {
			operation = "SELECT_";
		}

		if (jQuery.sap.startsWith(e.data, "EXTENSION_POINTS")) { //TODO: maybe can be in INITIALIZE
			var extensionPointsList = e.data.replace("EXTENSION_POINTS", "").trim();
			extensionPointsObj = JSON.parse(extensionPointsList);
		}

		if (operation) {
			var id = e.data.replace(operation, "").trim();

			var parts = id.split(";");
			var viewId = parts[0]; // get view full name (namespace.folder.viewName)
			var controlId = parts[1]; // get control id like "list", "page", "detailsInfo" ...
			handleControl(viewId, controlId, true);
		}

		if (e.data === "INITIALIZE") { // initialize source and origin
			source = e.source;
			origin = e.origin;

			// Build an array of views, for selection and highlighting
			refreshViewsArray();
		}

		if (jQuery.sap.startsWith(e.data, "CLEAR")) {
			removeHighlight();
			unselectDomElement();
		}

		if (e.data === "LOCK_UI") {
			sap.ui.getCore().lock();
			handleExtensionPoints();
		}

		if (e.data === "UNLOCK_UI") {
			removeHighlight();
			unselectDomElement();
			hideExtensionPoints();
			sap.ui.getCore().unlock();
		}
	}, false);

	// this function is called when we move to preview mode
	var hideExtensionPoints = function() {
		$(".extensionPoint").hide(); //search for all extension points placeholders by class "extensionPoint" and hide them
	};

	/**
	 * Handle insertion of extensin point which comes after the last form element.
	 * We need specific handling since the usual code (in insertSibling) only works for such extension points
	 * in the second time the user switch to extensiblity mode.
	 * The conditions: the given control is the last visible form element inside a form container inside a form
	 * 
	 * @param siblingControl - the control which is the previous sibling of the extension point
	 * @param placeHolder - the place holder dom element
	 * @return true if the place holder was added, false otherwise
	 */
	var handleInsertionAfterLastFormElement = function(siblingControl, placeHolder) {
		// Do we have a form elmement control?
		if (siblingControl.getMetadata().getName() === "sap.ui.layout.form.FormElement") {
			var oParentFormCotainer = siblingControl.getParent();
			// Is it inside a form container?
			if (oParentFormCotainer && oParentFormCotainer.getMetadata().getName() === "sap.ui.layout.form.FormContainer") {
				// Find the last visible form element
				var aFormElements = oParentFormCotainer.getFormElements();
				var oLastVisibleFormElement;
				var i = aFormElements.length -1;
				while (i >= 0) {
					oLastVisibleFormElement = aFormElements[i--];
					if (oLastVisibleFormElement && oLastVisibleFormElement.getVisible()) {
						break;
					}
				}
				// Is the last visible form element indeed the one we came with?
				if (oLastVisibleFormElement && oLastVisibleFormElement === siblingControl) {
					var oParentForm = oParentFormCotainer.getParent();
					// Is our form container insde a form?
					if (oParentForm && oParentForm.getMetadata().getName() === "sap.ui.layout.form.Form") {
						// All conditions were met - append the place holder to the form
						oParentForm.getDomRef().appendChild(placeHolder);
						return true;
					}
				}
			}
		}
		return false;
	};

	// insert placeholder with extensionPoint object, after siblingControl.
	// location - a string that holds either "after" or "before" to indicate whether to insert the extensionPoint after the sibling or before it.
	// viewName - the view name of the sibling
	var insertSibling = function(siblingControl, extensionPoint, location, viewName, labelElement) {
		if (siblingControl === undefined) { // no id defined for this node
			return false; // TODO: check if needed to return false, or something else, or nothing
		}

		var siblings = jQuery(document).find("*[id*='" + siblingControl.sId + "']");
		var sibling = siblings[0];

		if (!sibling) { //currently not in dom (e.g. in different tab in the view)
			return false;
		}

		var placeHolder = sibling.cloneNode(false); // false for - clone without children

		var currentView = viewsArray[viewName];
		// create an id for the place holder
		var placeHolderId = currentView.createId(extensionPoint.name);
		placeHolder.setAttribute("id", placeHolderId);

		if (placeHolder.className) { //we need this class name in order to hide extension points
			placeHolder.className += " extensionPoint"; // The spacing is on purpose!
		} else {
			placeHolder.className = " extensionPoint"; // The spacing is on purpose!
		}

		var placeHolderIcon;
		//we create the label of placeholder only if it wasnt created before
		//labelElement => UI5 element that resides unedr the HTML placeholder
		if (labelElement) {
			placeHolderIcon = labelElement;
		} else {
			placeHolderIcon = new sap.ui.commons.Label(placeHolderId + "label");
			placeHolderIcon.setIcon(sap.ui.core.IconPool.getIconURI("add-equipment"));
		}
		placeHolderIcon.placeAt(placeHolder);

		if (location === "after") {
			if (!handleInsertionAfterLastFormElement(siblingControl, placeHolder)) {// Specific handling of ext' point which comes after last form element
				var oInsertAfter = sibling;
				// Add the new extension point AFTER siblings which are extension points
				// This allows adding mulitple sibling extension points in the order in which they are defined in the xml
				while (oInsertAfter.nextSibling && $(oInsertAfter.nextSibling).hasClass("extensionPoint")) {
					oInsertAfter = oInsertAfter.nextSibling;
				}
				$(placeHolder).insertAfter(oInsertAfter);
			}
		} else if (location === "before") {
			$(placeHolder).insertBefore(sibling);
		} else {
			return false;
		}			

		return true;
	};

	// i- undefined if single extension point.
	// if duplicate (like in a list), it is the index
	var createPlaceHolderByParent = function(placeHolderParentElement, view, extensionPoint, i, labelElement) {
		var placeHolderElement;
		placeHolderElement = document.createElement("p");
		var placeHolderId = view.createId(extensionPoint.name);
		var placeHolderIcon;
		if (!labelElement) {
			placeHolderIcon = new sap.ui.commons.Label(placeHolderId + "label" + i);
			placeHolderIcon.setIcon(sap.ui.core.IconPool.getIconURI("add-equipment"));
		} else {
			placeHolderIcon = labelElement;
		}

		placeHolderIcon.placeAt(placeHolderElement);

		placeHolderElement.setAttribute("id", placeHolderId);
		//placeHolderElement.setAttribute("id", extensionPoint.name);
		placeHolderElement.className += " extensionPoint"; // add class to extesnion point, later we search it in order to hide
		placeHolderParentElement.appendChild(placeHolderElement);
	};

	//creates a single place holder, in place of extension point
	//hasIcon === true => if icon for this extension point was created before
	var createPlaceHolder = function(viewId, extensionPoint, hasIcon) {
		var view = viewsArray[viewId];
		var parentId = extensionPoint.parent;
		var prevSiblingIds = extensionPoint.previousSiblings;
		var nextSiblingIds = extensionPoint.nextSiblings;

		var parentControl;
		var siblingControl;

		var placeHolderParentElement;
		var labelElement;
		if (hasIcon) {
			labelElement = view.byId(extensionPoint.name + "label");
		}

		var i = 0;
		if (prevSiblingIds && prevSiblingIds.length > 0) { // if there exists a previous sibling, call function with "after"
			// Look for the closest sibling which exist in the dom
			while (i < prevSiblingIds.length) {
				siblingControl = view.byId(prevSiblingIds[i++]);
				if (siblingControl && siblingControl.getVisible()) {
					break;
				}
			}
			return insertSibling(siblingControl, extensionPoint, "after", view.sViewName, labelElement); //return true if inserted, false if wasn't

		} else if (nextSiblingIds && nextSiblingIds.length > 0) { // if there exists a next sibling, call function with "before"
			// Look for the closest sibling which exist in the dom
			while (i < nextSiblingIds.length) {
				siblingControl = view.byId(nextSiblingIds[i++]);
				if (siblingControl && siblingControl.getVisible()) {
					break;
				}
			}		
			return insertSibling(siblingControl, extensionPoint, "before", view.sViewName, labelElement); //return true if inserted, false if wasn't

		} else { //no sibling with id, insert under parent, the parent we get here is visible

			parentControl = (parentId && parentId !== "") ? view.byId(parentId) : view;
			if (!parentControl) { //no id defined for this node
				return false;
			}

			//find parent element and create place holder according to it.
			placeHolderParentElement = jQuery(view.getDomRef()).find("*[id|='" + parentControl.sId + "']").first();
			if (!placeHolderParentElement[0]) {
				placeHolderParentElement = jQuery(view.getDomRef()).find("*[id|='sap-ui-invisible-" + parentControl.sId + "']").first();
				if (placeHolderParentElement[0]) {
					// The parent is invisible - no point to continue
					var message = "Not showing extension point in extensibility pane since it's parent is hidden. View: " + viewId + ". Extension point name: " + extensionPoint.name +
						". Parent control ID: " + extensionPoint.parent;
					console.log(message);
					return false;
				}
			}
			//undefined: since this is the first occurance of this ext point -no index is sent
			//if labelElement of icon already created send it
			createPlaceHolderByParent(placeHolderParentElement[0], view, extensionPoint, "", labelElement);

			//if there are multiple occurance (e.g. extension point in list, there will be siblings to the parent with similar id)
			//need to take only the ones with the matching id and not all the siblings
			var elements = jQuery(placeHolderParentElement).siblings("*[id|='" + parentControl.sId + "']");
			for (var i = 0; i < elements.length; i++) {
				placeHolderParentElement = elements[i];
				createPlaceHolderByParent(placeHolderParentElement, view, extensionPoint, i, labelElement);
			}

			return true;
		}
	};

	// this function is called when moving to Extensibility Mode
	// create placeholders, or show them if they already exist
	var handleExtensionPoints = function() {
		refreshViewsArray(); // verify we have in views array all the views that appear in the DOM

		var views = [];
		if (extensionPointsObj !== null) {
			views = extensionPointsObj.views;
		}

		for (var i = 0; i < views.length; i++) { // go over the views in the extensionPointsJson if there are any
			var currentView = views[i];
			var viewName = currentView.name;
			var oViewControl = viewsArray[viewName];
			if (oViewControl) { //if this view is in the dom
				for (var j = 0; j < currentView.extensionPoints.length; j++) {
					var extensionPoint = currentView.extensionPoints[j];
					//var placeHolder = $(".extensionPoint#" + extensionPoint.name);
					var placeHolder = jQuery(oViewControl.getDomRef()).find("*[id$='" + extensionPoint.name + "']").toArray();
					//var placeHolderIcon = jQuery(document).find("*[id$='" + extensionPoint.name + "label" + "']").toArray();

					//checking if label for this extension point was created before
					var idLbl = oViewControl.createId(extensionPoint.name + "label"); //getting the label id
					var placeHolderLabel = sap.ui.getCore().byId(idLbl); //search if it exists in core (sometimes it is not in the dom, only in core)
					if (placeHolder.length === 0 && extensionPoint.isExtended === false) {
						if (placeHolderLabel) {
							createPlaceHolder(viewName, extensionPoint, true); //return true if created
						} else {
							createPlaceHolder(viewName, extensionPoint, false); //return true if created
						}
					}
				}

				$(".extensionPoint").show();
			}
		}
	};

	// viewId - view full name (namespace.folder.viewName)
	// controlId - control id like "list", "page", "detailsInfo" ...
	var handleControl = function(viewId, controlId, isSelection) {

		var view = viewsArray[viewId];
		if (!view) { // If this is a newly generated view, update the views array
			refreshViewsArray();
			view = viewsArray[viewId];
		}

		var control;
		if (!view) { // If view isn't found, don't select an element
			if (isSelection === true) {
				removeHighlight();
				unselectDomElement();
			}
			return;
		}

		// when selecting the view, controller ID should be empty
		control = (controlId !== undefined && controlId !== "") ? view.byId(controlId) : view;

		if (!control) { //in case we can't find it via UI5 APIs, make a pseudo-control
			var selector = ".extensionPoint#" + controlId;
			var controls = $(selector); //extension point
			control = controls[0];
			if (!control) {
				var id = view.createId(controlId);
				control = {
					sId: id
				};
				control.getId = function() {
					return this.sId;
				};
			}
		}

		if (isSelection === true) {
			removeHighlight();
			unselectDomElement();
			selectDomElement(control);
		} else {
			highlightDomElements(control);
		}
	};

	// We need to do the lookup using the control ID and not the contorl DOM ID, since
	// in sometime the control DOM ID is also found in a wrapping view (e.g. sap.ushell.renderers.fiorisandbox.Shell)
	var findViewIdByControlId = function(sControlId, sControlDOMId) {
		if (Object.keys(viewsArray).length === 0) {
			refreshViewsArray();
		}
			
		var keys = Object.keys(viewsArray);
		for (var i = 0; i < keys.length; i++) {
			var viewId = keys[i];
			var view = viewsArray[viewId];
			if (view.byId(sControlId) && jQuery.sap.startsWith(sControlDOMId, view.getId())) {
				return viewId;
			}			
		}
		return "";
	};

	var findViewIdByExtensionPointId = function(sDOMId) {
		var startControlIdIndex = sDOMId.indexOf(startControlIdString);
		var xmlView = sDOMId.substring(0, startControlIdIndex);
		var number = xmlView.replace(startViewString, "");
		var isNumeric = jQuery.isNumeric(number);
		if (isNumeric) {
			var viewElement = sap.ui.getCore().byId(xmlView);
			if (viewElement && viewElement.sViewName) {
				return viewElement.sViewName;
			}
		}
		return "";
	};

	var findControl = function(element) {
		var control;
		if (source) {

			var isControl = jQuery.sap.startsWith(element.id, startViewString);
			// work the way up to the first UI5 control
			while (!isControl) {
				element = element.parentElement;
				isControl = jQuery.sap.startsWith(element.id, startViewString);
			}
			var bExtensionPoint = false;
			//this is a case of label which is son of extension point
			if (element.parentElement.className.lastIndexOf("extensionPoint") > -1) {
				element = element.parentElement;
				bExtensionPoint = true;
			}

			var id = element.id;

			var startControlIdIndex = id.indexOf(startControlIdString);
			if (id && (startControlIdIndex !== -1) && (jQuery.sap.startsWith(id, startViewString))) {
				var controlId = getControlId(id);
				var viewId = findViewIdByControlId(controlId, id);
				if (!jQuery.sap.startsWith(viewId, "sap.ca.scfld.")) { // scaffolding views are not relevant
					if (!viewId && bExtensionPoint) {
						viewId = findViewIdByExtensionPointId(id);
					}
					return {
						viewId: viewId,
						controlId: controlId
					};
				}
			} else if (id.match(/__xmlview\d+$/).length > 0) {
				var viewElement = sap.ui.getCore().byId(id);

				if (viewElement && viewElement.sViewName && !jQuery.sap.startsWith(viewElement.sViewName, "sap.ca.scfld.")) { // scaffolding views are not relevant

					var viewId = viewElement.sViewName;
					return {
						viewId: viewId,
						controlId: ""
					};
				}
			}
		}
		return null;
	};

	var highlightDomElements = function(element) {
		var elements = [];
		if (element) {
			var pattern;
			var selector = ".extensionPoint#" + element.getId();
			var exPoints = $(selector);
			if (exPoints.length === 0) {
				pattern = "*[id^='" + element.getId() + "']";
				elements = jQuery(document).find(pattern).toArray();
			} else {
				elements = exPoints;
			}

			lastElements = [];
		}

		for (var i = 0; i < elements.length; i++) {
			var domElement = elements[i];

			lastElements.push({
				backgroundColor: domElement.style.backgroundColor,
				element: domElement
			});

			domElement.style.backgroundColor = "#9DD7ED";
		}
	};

	var selectDomElement = function(element) {
		var elements = [];
		if (element) {
			var pattern;
			var selector = ".extensionPoint#" + element.getId();
			var exPoints = $(selector);
			if (exPoints.length === 0) {
				pattern = "*[id^='" + element.getId() + "']";
				elements = jQuery(document).find(pattern).toArray();
			} else {
				elements = exPoints;
			}

			selectedElements = [];
		}

		for (var i = 0; i < elements.length; i++) {
			var domElement = elements[i];

			selectedElements.push({
				backgroundColor: domElement.style.backgroundColor,
				element: domElement
			});

			domElement.style.backgroundColor = "#DDA6D2";
		}
	};

	var unselectDomElement = function() {
		for (var i = 0; i < selectedElements.length; i++) {
			selectedElements[i].element.style.backgroundColor = selectedElements[i].backgroundColor;
			selectedElements[i].element = undefined;
			selectedElements[i].backgroundColor = undefined;
		}

		selectedElements = [];
	};

	// Handle reset of element highlighting
	var removeHighlight = function() {
		// Handle reset of last selected element
		for (var i = 0; i < lastElements.length; i++) {
			lastElements[i].element.style.backgroundColor = lastElements[i].backgroundColor;
			lastElements[i].element = undefined;
			lastElements[i].backgroundColor = undefined;
		}

		lastElements = [];
	};

	var refreshViewsArray = function() {
		viewsArray = {};
		jQuery(".sapUiView").control().forEach(function(view) {
			viewsArray[view.sViewName] = view;
		});
	};

	/*
	 * MouseOver action for all elements on the page
	 */
	function onMouseOver(e) {
		if (this._sTimerId) {
			clearTimeout(this._sTimerId);
		}

		this._sTimerId = setTimeout(function() {
			if (sap.ui.getCore().isLocked()) {
				// Handle reset of last selected element
				removeHighlight();
				var element = e.target;
				var ans = findControl(element);
				if (ans) {
					handleControl(ans.viewId, ans.controlId);
					source.postMessage("HOVER_" + ans.viewId + ";" + ans.controlId, origin);
				}
			}
		}, 100);
	}

	function onRightClick(ev) {
		ev.stopImmediatePropagation();
		ev.preventDefault();
		ev.cancelBubble = true;
		if (sap.ui.getCore().isLocked()) {
			var element = ev.target;
			removeHighlight();
			var ans = findControl(element);
			if (ans) {
				handleControl(ans.viewId, ans.controlId, true);
				source.postMessage("CONTEXT_MENU_" + ans.viewId + ";" + ans.controlId + ";" + ev.pageX + ";" + ev.pageY, origin);
			}
		}

		return false;
	}

	function onMouseClick(ev) {
		if (sap.ui.getCore().isLocked()) {
			ev.stopImmediatePropagation();
			ev.preventDefault();
			ev.cancelBubble = true;
			if (ev.which === 3) { // In case browser prioritizes "click" event over "contextmenu"
				return onRightClick(ev);
			}
			removeHighlight();

			var element = ev.target;
			var ans = findControl(element);

			if (ans) {
				if (selectedId !== ans.controlId) {
					selectedId = ans.controlId;
					handleControl(ans.viewId, ans.controlId, true);

					// send a post message to UIContent that will mark the node in the outline
					source.postMessage("ELEMENT_" + ans.viewId + ";" + ans.controlId, origin);
				} else {
					unselectDomElement();
					selectedId = undefined;
					source.postMessage("CLEAR_TREE", origin);
				}
			} else {
				unselectDomElement();
				selectedId = undefined;
				source.postMessage("CLEAR_TREE", origin);
			}
		}
	}

	var getControlId = function(elementId) {
		var startViewNameIndex = elementId.indexOf(startViewNameString);
		if (startViewNameIndex !== -1) { // The id is in alternative format. First remove the stuff before and including ---, then continue as usual
			var idStartingInViewNameString = elementId.substring(startViewNameIndex + startViewNameString.length);
			elementId = idStartingInViewNameString;
		}
		var startIndex = elementId.indexOf(startControlIdString) + startControlIdString.length;

		var endIndex = elementId.indexOf(endControlIdString, startIndex);
		if (endIndex === -1) {
			endIndex = elementId.length;
		}

		var controlId = elementId.substring(startIndex, endIndex);

		return controlId;
	};

	// Add event listeners
	if (document.addEventListener) {
		document.addEventListener("contextmenu", onRightClick, false);
		document.addEventListener("click", onMouseClick, false);
		document.addEventListener("mouseover", onMouseOver, true);
	} else if (document.attachEvent) {
		document.attachEvent("contextmenu", onRightClick);
		document.attachEvent("click", onMouseClick);
		document.attachEvent("mouseover", onMouseOver);
	}

})(document);