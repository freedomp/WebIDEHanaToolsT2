define(function() {
	"use strict";

	/**
	 * Creates a new BasicCommand instance.
	 *
	 * @constructor
	 */
	function BaseCommand() {
		this._enabled = true;
		this._available = true;
		return this; // return this object reference
	}

	// Define the class methods.
	BaseCommand.prototype = {};

	/**
	 * Indicates whether command is available or not.
	 *
	 * @public
	 * @returns {boolean} true if command is available
	 */
	BaseCommand.prototype.isAvailable = function() {
		return this._available;
	};

	/**
	 * Indicates whether command is enabled or not.
	 *
	 * @public
	 * @returns {boolean} true if command is enabled
	 */
	BaseCommand.prototype.isEnabled = function() {
		return this._enabled;
	};

	/**
	 * Returns selected document.
	 *
	 * @protected
	 * @return {Promise<string, Error>} a project name or an Error
	 */
	BaseCommand.prototype._getSelectedDocument = function() {
		var that = this;
		var selectionService = this.context.service.selection;

		return selectionService.assertOwner(that.context.service.repositorybrowser).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				return aSelection[0].document;
			});
		});
	};

	/**
	 * Returns name of selected project.
	 *
	 * @protected
	 * @return {Promise<string, Error>} a project name or an Error
	 */
	BaseCommand.prototype._getSelectedProject = function() {
		var that = this;
		var selectionService = this.context.service.selection;

		return selectionService.assertOwner(that.context.service.repositorybrowser).then(function() {
			return selectionService.assertNotEmpty().then(function(aSelection) {
				var sPath = aSelection[0].document.getEntity().getFullPath();
				var aSegments = sPath.split("/");
				if (aSegments && aSegments.length > 1) {
					return aSegments[1];
				}
			});
		});
	};

	/**
	 * Shows an info message on UI.
	 *
	 * @protected
	 * @param {string} sMessage the info message to show
	 * @param {string} sCommandId an optional command id
	 * @param {object} oCommandExecuteValue an optional argument that is passed to execute method of command
	 * @return {void} a project name or an Error
	 */
	BaseCommand.prototype._showInfo = function(sMessage, sCommandId, oCommandExecuteValue) {
		this.context.service.usernotification.liteInfoWithAction(sMessage, sCommandId, false, oCommandExecuteValue).done();
	};

	/**
	 * Shows an error message on UI.
	 *
	 * @protected
	 * @param {string} sMessage the error message to show
	 * @return {void} a project name or an Error
	 */
	BaseCommand.prototype._showError = function(sMessage) {
		this.context.service.usernotification.alert(sMessage).done();
	};

	return BaseCommand;
});