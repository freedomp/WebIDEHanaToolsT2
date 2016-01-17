/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides class sap.ui.commons.MessageBox
sap.ui.define([],
	function() {

	"use strict";


	/**
	 * Provides methods to create standard alerts, confirmation dialogs, or arbitrary message boxes.
	 *
	 * As <code>MessageBox</code> is a static class, a <code>jQuery.sap.require("sap.ui.commons.MessageBox");</code> statement
	 * must be explicitly executed before the class can be used. Example:
	 * <pre>
	 *   jQuery.sap.require("sap.ui.commons.MessageBox");
	 *   sap.ui.commons.MessageBox.show(
	 *       "This message should appear in the message box.",
	 *       sap.ui.commons.MessageBox.Icon.INFORMATION,
	 *       "My message box title",
	 *       [sap.ui.commons.MessageBox.Action.YES, sap.ui.commons.MessageBox.Action.NO],
	 *       function() { / * do something * / }
	 *   );
	 * </pre>
	 *
	 * @namespace
	 * @author Frank Weigel
	 * @public
	 * @since 0.8.8
	 * @alias sap.ui.commons.MessageBox
	 */
	var MessageBox = {};
	
	/**
	 * Enumeration of supported actions in a MessageBox.
	 *
	 * Each action is represented as a button in the message box. The values of this enumeration are used for both,
	 * specifying the set of allowed actions as well as reporting back the user choice.
	 * @enum
	 * @public
	 */
	MessageBox.Action = {

		/**
		 * Adds an "Ok" button to the message box.
		 * @public
		 */
		OK : "OK",

		/**
		 * Adds a "Cancel" button to the message box.
		 * @public
		 */
		CANCEL : "CANCEL",

		/**
		 * Adds a "Yes" button to the message box.
		 * @public
		 */
		YES : "YES",

		/**
		 * Adds a "No" button to the message box.
		 * @public
		 */
		NO : "NO",

		/**
		 * Adds an "Abort" button to the message box.
		 * @public
		 */
		ABORT : "ABORT",

		/**
		 * Adds a "Retry" button to the message box.
		 * @public
		 */
		RETRY : "RETRY",

		/**
		 * Adds an "Ignore" button to the message box.
		 * @public
		 */
		IGNORE : "IGNORE",

		/**
		 * Adds a "Close" button to the message box.
		 * @public
		 */
		CLOSE : "CLOSE",
		/**
		 * Adds a "Report" button to the message box.
		 * @public
		 */
		REPORT : "REPORT"
	};

	/**
	 * Enumeration of the pre-defined icons that can be used in a MessageBox.
	 * @enum
	 * @public
	 */
	MessageBox.Icon = {

		/**
		 * Shows no icon in the message box.
		 * @public
		 */
		NONE : "NONE",

		/**
		 * Shows the information icon in the message box.
		 * @public
		 */
		INFORMATION : "INFORMATION",

		/**
		 * Shows the warning icon in the message box.
		 * @public
		 */
		WARNING : "WARNING",

		/**
		 * Shows the error icon in the message box.
		 * @public
		 */
		ERROR : "ERROR",

		/**
		 * Shows the critical error icon in the message box.
		 * @public
		 * @deprecated since 1.9.1: The error icon is used instead
		 */
		CRITICAL : "CRITICAL",

		/**
		 * Shows the success icon in the message box.
		 * @public
		 */
		SUCCESS : "SUCCESS",

		/**
		 * Shows the question icon in the message box.
		 * @public
		 */
		QUESTION : "QUESTION"
	};

	// some shortcuts for enum types
	var AccessibleRole = sap.ui.core.AccessibleRole,
		Action = MessageBox.Action,
		Icon = MessageBox.Icon,
		Padding = sap.ui.commons.layout.Padding,
		VAlign = sap.ui.commons.layout.VAlign;

	var mIconClass = {
		// Note: keys must be equal to values(!) of the Icon enumeration above
		INFORMATION : "sapUiMboxInfo",
		CRITICAL : "sapUiMboxCritical",
		ERROR : "sapUiMboxError",
		WARNING : "sapUiMboxWarning",
		SUCCESS : "sapUiMboxSuccess",
		QUESTION : "sapUiMboxQuestion"
	};

	/**
	 * Creates and displays a simple message box with the given text and buttons, and optionally other parts.
	 * After the user has selected a button or closed the message box using the close icon, the <code>callback</code>
	 * function is invoked when given.
	 *
	 * The only mandatory parameter is <code>vMessage</code>. Either a string with the corresponding text or even
	 * a layout control could be provided.
	 *
	 * The created dialog box is executed asynchronously. When it has been created and registered for rendering,
	 * this function returns without waiting for a user reaction.
	 *
	 * When applications have to react on the users choice, they have to provide a callback function and
	 * postpone any reaction on the user choice until that callback is triggered.
	 *
	 * The signature of the callback is
	 *
	 *   function (oAction);
	 *
	 * where <code>oAction</code> is the button that the user has pressed. When the user has pressed the close button,
	 * a MessageBox.Action.Close is returned.
	 *
	 * @param {string | sap.ui.core.Control} vMessage The message to be displayed.
	 * @param {sap.ui.commons.MessageBox.Icon} [oIcon=None] The icon to be displayed.
	 * @param {string} [sTitle=''] The title of the message box.
	 * @param {sap.ui.commons.MessageBox.Action|sap.ui.commons.MessageBox.Action[]} [vActions] Either a single action, or an array of actions.
	 *      If no action(s) are given, the single action MessageBox.Action.OK is taken as a default for the parameter.
	 * @param {function} [fnCallback] Function to be called when the user has pressed a button or has closed the message box.
	 * @param {sap.ui.commons.MessageBox.Action} [oDefaultAction] Must be one of the actions provided in vActions.
	 * @param {string} [sDialogId] ID to be used for the dialog. Intended for test scenarios, not recommended for productive apps
	 * @public
	 */
	MessageBox.show = function(vMessage, oIcon, sTitle, vActions, fnCallback, oDefaultAction, sDialogId,oError) {

		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");
		var 	oDialog, oResult, oContent, oMsg, oDefaultButton,_oError;
        _oError = oError;
		// normalize the vActions array
		if ( typeof vActions !== "undefined" && !jQuery.isArray(vActions) ) {
			vActions = [vActions];
		}
		if ( !vActions || vActions.length === 0 ) {
			vActions = [Action.OK];
		}

		// create a unique ID
		sDialogId = "sDialogI";

		/** creates a button for the given action */
		function button(sAction) {
			var sText = rb && rb.getText("MSGBOX_" + sAction);
			sText = (sText.indexOf("MSGBOX_") > -1)?sAction:sText;
			var oButton = new sap.ui.commons.Button({
					id : sDialogId + "--btn-" + sAction,
					text : sText || sAction,
					press : function () {
						oResult = sAction;
						oDialog.close();
					}
				});
			if ( sAction === oDefaultAction ) {
				oDefaultButton = oButton;
			}
			return oButton;
		}

		/** wraps the given control in a top aligned MatrixLayoutCell with no padding */
		function cell(oContent) {
			return new sap.ui.commons.layout.MatrixLayoutCell ({
				padding: Padding.None,
				vAlign: VAlign.Top,
				content: oContent
			});
		}

		/** creates an Image for the given icon type */
		function image(oIcon) {
			var oImage = new sap.ui.commons.Image ({
					id : sDialogId + "--icon",
					tooltip : rb && rb.getText("MSGBOX_ICON_" + oIcon),
					decorative : true});
			oImage.addStyleClass("sapUiMboxIcon");
			oImage.addStyleClass(mIconClass[oIcon]);
			return oImage;
		}

		function onclose() {
			if ( typeof fnCallback === "function" ) {
				fnCallback(oResult || Action.CLOSE,_oError);
			}

			// first detach close handler (to avoid recursion and multiple reports)
			oDialog.detachClosed(onclose);

			// then destroy dialog (would call onclose again)
			oDialog.destroy();
		}

		oContent = new sap.ui.commons.layout.MatrixLayout ({id : sDialogId + "--lyt", layoutFixed:false}).addStyleClass("sapUiMboxCont");

		if (typeof (vMessage) === "string") {
			oMsg = new sap.ui.commons.TextView({id : sDialogId + "--msg"}).setText(vMessage).addStyleClass("sapUiMboxText");
		} else if (vMessage instanceof Control) {
			oMsg = vMessage.addStyleClass("sapUiMboxText");
		}

		if ( oIcon !== MessageBox.Icon.NONE ) {
			oContent.createRow(cell(image(oIcon)), cell(oMsg));
		} else {
			oContent.createRow(cell(oMsg));
		}
		// oContent.addStyleClass("sapUiDbgMeasure");

		oDialog = new sap.ui.commons.Dialog({
			id : sDialogId,
			applyContentPadding : false,
			title : sTitle,
			accessibleRole : AccessibleRole.AlertDialog,
			resizable : false,
			modal: true,
			buttons : jQuery.map(vActions, button), // determines oDefaultButton as a side effect!
			content : oContent,
			defaultButton : oDefaultButton,
			closed : onclose
		});

		oDialog.open();

	};

	/**
	 * Displays an alert box with the given message and an OK button (no icons).
	 * If a callback is given, it is called after the alert box has been closed
	 * by the user via the OK button or via the Close icon. The callback is called
	 * with the following signature:
	 *
	 * <pre>
	 *   function ()
	 * </pre>
	 *
	 * The alert box opened by this method is modal and it is processed asynchronously.
	 * Applications have to use the <code>fnCallback</code> to continue work after the
	 * user closed the alert box.
	 *
	 * @param {string | sap.ui.core.Control} vMessage Message to be displayed in the alert box
	 * @param {function} [fnCallback] callback function to be called when the user closed the dialog
	 * @param {string } [sTitle] Title to be displayed in the alert box
	 * @param {string} [sDialogId] ID to be used for the alert box. Intended for test scenarios, not recommended for productive apps
	 * @public
	 */
	MessageBox.alert = function(vMessage, fnCallback, sTitle, sDialogId) {
		return MessageBox.show(vMessage, Icon.NONE, sTitle, Action.OK,
			function(oAction) {
				if ( typeof fnCallback === "function" ) {
					fnCallback();
				}
			}, Action.OK, sDialogId || sap.ui.core.ElementMetadata.uid("alert"));
	};

	/**
	 * Displays a confirmation dialog box with the given message, a question icon,
	 * an OK button, and a Cancel button. If a callback is given, it is called after the
	 * alert box has been closed by the user via one of the buttons or via the close icon.
	 * The callback is called with the following signature
	 *
	 * <pre>
	 *   function(bConfirmed)
	 * </pre>
	 *
	 * where bConfirmed is set to true when the user has activated the OK button.
	 *
	 * The confirmation dialog box opened by this method is modal and it is processed asynchronously.
	 * Applications have to use the <code>fnCallback</code> to continue work after the
	 * user closed the alert box.
	 *
	 * @param {string | sap.ui.core.Control} vMessage Message to display
	 * @param {function} [fnCallback] Callback to be called
	 * @param {string} [sTitle] Title to display
	 * @param {string} [sDialogId] ID to be used for the confirmation dialog. Intended for test scenarios, not recommended for productive apps
	 * @public
	 */
	MessageBox.confirm = function(vMessage, fnCallback, sTitle, sDialogId) {
		return MessageBox.show(vMessage, Icon.QUESTION, sTitle, [Action.OK, Action.CANCEL],
			function(oAction) {
				if ( typeof fnCallback === "function" ) {
					fnCallback(oAction === Action.OK);
				}
			},  /* no default */ undefined, sDialogId || sap.ui.core.ElementMetadata.uid("confirm"));
	};


	return MessageBox;

}, /* bExport= */ true);