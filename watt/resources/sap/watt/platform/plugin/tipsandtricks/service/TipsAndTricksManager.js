define(["sap/watt/lib/lodash/lodash", "../datastructures/CyclicDoublyLinkedList"], function(_, CyclicDoublyLinkedList) {

	/**
	 * A doubly cyclic linked list containing the valid tips configured by all plugins. Used for implementing the
	 * previous/next buttons functionality
	 *
	 * @type {CyclicDoublyLinkedList}
	 * @private
	 */
	var _configsLinkedList = null;
	/**
	 * Array of the configured tips. The _configsLinkedList contains the same valid tips.
	 * @type {Tip[]}
	 * @private
	 */
	var _validTipsArray = null;
	/**
	 * The key in the user settings of the tips and tricks block
	 * @type {string}
	 */
	var tipsPreferenceKey = "sap.watt.platform.tipsandtricks.service.tipsandtricks";

	var that;

	function _init() {
		that = this;
		sap.watt.includeCSS(require.toUrl("sap.watt.platform.tipsandtricks/css/TipsAndTricksDialogStyles.css"));
	}

	//TODO add documentation
	function _getShowOnStartup() {
		return this.context.service.preferences.get(tipsPreferenceKey).then(function(oTipsSettings) {
			if(oTipsSettings && oTipsSettings.showonstartup === false) {
				return false;
			}

			//The default is true
			return true;
		});
	}

	//TODO add documentation
	function _setShowOnStartup(bShowOnStartup) {
		return that.context.service.preferences.set({showonstartup:bShowOnStartup}, tipsPreferenceKey).fail(function(oError) {
			console.error("Couldn't set user preferences", [oError]);
		});
	}

	/**
	 * Opens the tips and tricks dialog and returns it.
	 *
	 * @returns {sap.ui.commons.Dialog} - The dialog that was opened
	 */
	function _openTipsAndTricksDialog() {
		var that = this;

		//If there are no tips, there is no pointing in opening the dialog
		if(_validTipsArray.length < 1) {
			return null;
		}

		return Q.all([
			that.context.service.tipsandtricks.getShowOnStartup(),
			_configsLinkedList.getCurrent().data.service.getView()
		]).spread(function(bShowOnStartup, oFirstView) {
			//Create the dialog and add the buttons
			var oTipsAndTricksDialog = new sap.ui.commons.Dialog({
				title: that.context.i18n.getText("i18n", "tips_and_tricks_dialog_title"),
				resizable: false,
				width: "808px",
				modal: true
			}).addStyleClass("tipsAndTricksDialog");

			oTipsAndTricksDialog.insertButton(new sap.ui.commons.Button({
				text: that.context.i18n.getText("i18n", "dialog_close_button"),
				press: function() {
					oTipsAndTricksDialog.close();
				}
			}), 0);

			oTipsAndTricksDialog.insertButton(new sap.ui.commons.Button({
				text: that.context.i18n.getText("i18n", "dialog_next_button"),
				press: function() {
					_configsLinkedList.next().data.service.getView().then(function(nextView) {
						_changeDialogContentTo(oTipsAndTricksDialog, nextView);
					}).done();
				}
			}), 0);

			oTipsAndTricksDialog.insertButton(new sap.ui.commons.Button({
				text: that.context.i18n.getText("i18n", "dialog_previous_button"),
				press: function() {
					_configsLinkedList.previous().data.service.getView().then(function(nextView) {
						_changeDialogContentTo(oTipsAndTricksDialog, nextView);
					}).done();
				}
			}), 0);

			oTipsAndTricksDialog.insertButton(new sap.ui.commons.CheckBox({
				text : that.context.i18n.getText("i18n", "tips_and_tricks_dialog_checkbox"),
				checked : !bShowOnStartup,
				change : function(oEvent) {
					var checked = oEvent.getParameter("checked");
					_setShowOnStartup(!checked).done();
				}
			}).addStyleClass("tipsAndTricksDialogCheckBox"));

			//Set the dialog content
			oTipsAndTricksDialog.addContent(oFirstView);

			oTipsAndTricksDialog.open();

			return oTipsAndTricksDialog;
		});
	}

	function _changeDialogContentTo(oDialog, oNewContent) {
		oDialog.removeAllContent();
		oDialog.addContent(oNewContent);
	}

	/**
	 * Filters the invalid tips and returns only the tips that should be shown in the tips and tricks dialog. A valid
	 * tip must have the following characteristics
	 * 	1. It implements in its service a method called getView
	 * 	2. In case isAvailable is defined in the service, calling it should return true
	 *
	 * 	This function also logs errors to the browser's console in any of these cases:
	 * 	 * If getView is not implemented
	 * 	 * If a duplicate ID exits
	 *
	 * @param aTips - array of tips
	 * @returns a promise containing an array of the valid tips when resolved
	 * @private
	 */
	function _filterInvalidTips(aTips) {
		function tipIdentity(tip) {
			return tip.id;
		}

		var uniqueTips = _.uniq(aTips, tipIdentity);

		if(uniqueTips.length !== aTips.length) {
			var aGrops = _.groupBy(aTips, tipIdentity);
			var aGroupsWithDuplicates = _.filter(aGrops, function(group) {
				return group.length > 1;
			});
			_.forEach(aGroupsWithDuplicates, function(group) {
				console.error("Tip ID: " + group[0].id + " exists " + group.length + " times and that's not cool! Only one of them will appear in the dialog.");
			});
		}

		//From the unique tips we filter only the ones available
		var isAvailablePromises = _.map(uniqueTips, function(tip) {
			if(tip.available !== undefined) {
				//if "available" is supplied in the json then it rules
				return Q();
			}
			return tip.service.isAvailable().then(function(bAvailable) {
				tip.available = bAvailable;
			});
		});

		return Q.all(isAvailablePromises).then(function() {
			var uniqAndAvailableTips = _.filter(uniqueTips, function(tip) {
				return tip.available;
			});
			return uniqAndAvailableTips;
		});
	}

	/**
	 * This function is called by the core. It is the way this manager gets the configurations of all the plugins.
	 * @param mConfig
	 */
	function _configure(mConfig) {
		return _filterInvalidTips(mConfig.tips).then(function(aValidTips) {
			_validTipsArray = aValidTips;
			_configsLinkedList = new CyclicDoublyLinkedList(_.shuffle(aValidTips));
		});
	}

	function _getConfigsList() {
		return _configsLinkedList;
	}

	/**
	 * Returns the valid configured tips in an array. Changing this array won't change the tips viewed in the dialog.
	 * @returns {Tip[]}
	 * @private
	 */
	function _getValidConfiguredTipsArray() {
		return _validTipsArray;
	}

	return {
		init: _init,
		openTipsAndTricksDialog: _openTipsAndTricksDialog,
		configure: _configure,
		getValidConfiguredTipsArray: _getValidConfiguredTipsArray,
		getShowOnStartup: _getShowOnStartup,

		//For testing purposes only
		_getConfigsList : _getConfigsList,
		_changeDialogContentTo: _changeDialogContentTo,
		_filterInvalidTips: _filterInvalidTips
	};
});
