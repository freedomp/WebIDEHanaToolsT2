define(
	[
		"../../utils/W5gUtils",
		"../../utils/ControlMetadata"
	],
	function (W5gUtils, ControlMetadata) {
		"use strict";

// Private variables and methods
// Begin
		/**
		 * Returns true if the draggable control offers additional special instructions in case of invalid targets drop zones
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - the draggable overlay
		 * @returns {boolean}
		 *
		 * @name _hasSpecialNotification
		 * @function
		 * @private
		 */
		function _hasSpecialNotification(oOverlay) {
			return !!W5gUtils.getValidateDropTargetList(oOverlay).length;
		}


		/**
		 * Returns an array of all the the valid drop targets for the current draggable control
		 *
		 * @returns {Array}
		 *
		 * @name _getDropZonesAggregationsForControl
		 * @function
		 * @private
		 */
		function _getDropZonesAggregationsForControl() {
			var aAggregationDropZones = [];

			function isValidAggregationDroppable(oAggregationOverlay) {
				if (oAggregationOverlay.getDroppable() && !_.includes(ControlMetadata.getHiddenAggregations(), oAggregationOverlay.getAggregationName())) {
					aAggregationDropZones.push(oAggregationOverlay);
				}
			}

			this._oDragDropPlugin._iterateAllAggregations(isValidAggregationDroppable);
			return aAggregationDropZones;
		}


		/**
		 * Returns a message in case of invalid drop targets
		 *
		 * @param {sap.ui.dt.Overlay} oOverlay - the draggable overlay
		 * @returns {string}
		 *
		 * @name _getMessageForSpecialControl
		 * @function
		 * @private
		 */
		function _getMessageForSpecialControl(oOverlay) {
			var aList = W5gUtils.getValidateDropTargetList(oOverlay),
				sMsg = "",
				sControlName;

			if (aList.length) {
				sControlName = W5gUtils.getControlTitle(oOverlay.getElementInstance());
				aList = aList.map(function(sName) {
					return W5gUtils.getControlTitle(sName);
				});
				if (aList.length === 1) {
					sMsg = W5gUtils.getText("message_area_invalid_drop_area", [sControlName, aList[0]]);
				} else {
					var aFirstControls = _.dropRight(aList), sLastControl = _.last(aList), aParams;
					if (aList.length === 2) {
						aParams = [sControlName, aFirstControls[0], sLastControl];
					} else {
						aParams = [sControlName, aFirstControls.join(", ") + ",", sLastControl];
					}
					sMsg = W5gUtils.getText("message_area_invalid_drop_areas", aParams);
				}
			}
			return sMsg;
		}

		/**
		 * Update the Notification bar during drag change
		 *
		 * @param {sap.ui.core.Control} oDropAreaControl - the control of the target dop zone
		 * @param {string} sAggregationName - the target aggregation name
		 *
		 * @name _updateNotificationDragChanged
		 * @function
		 * @private
		 */
		function _updateNotificationDragChanged(oDropAreaControl, sAggregationName) {

			if (this._oNotificationBar) {
				var oDraggedOverlay = this._oDragDropPlugin.getDraggedOverlay(),
					oDraggedControl = oDraggedOverlay ? oDraggedOverlay.getElementInstance() : null,
					sDropAreaControlName = oDropAreaControl && W5gUtils.getControlTitle(oDropAreaControl),
					sLine1 = sAggregationName ? W5gUtils.getText("message_area_drop_target_info", [sDropAreaControlName, sAggregationName]) : "",
					sLine2 = "";

				if (oDraggedControl && oDraggedControl.getMetadata().getName() === "sap.m.Label" &&
					oDropAreaControl && oDropAreaControl.getMetadata().getName() === "sap.ui.layout.form.SimpleForm") {
					sLine2 = W5gUtils.getText("message_area_drop_label_on_form");
				}

				this._oNotificationBar.updateMessageArea(sLine1, sLine2);
			}
		}
// End
// Private variables and methods

		var NotificationListener = function (oNotificationBar, oDragDropPlugin) {
			this._oNotificationBar = oNotificationBar;
			this._oDragDropPlugin = oDragDropPlugin;
		};

		/**
		 * @override
		 */
		NotificationListener.prototype.onDragStart = function (oOverlay) {
			var sLine1 = "", sLine2 = "";

			if (_hasSpecialNotification(oOverlay) && _getDropZonesAggregationsForControl.call(this).length === 0) {
				sLine1 = _getMessageForSpecialControl.call(this, oOverlay);
			}
			else {
				if (oOverlay.getElementInstance().getMetadata().getName() === "sap.m.PullToRefresh") {
					sLine1 = W5gUtils.getText("message_area_warning");
					sLine2 = W5gUtils.getText("message_area_pull_to_refresh_warning");
				}
			}
			if (this._oNotificationBar) {
				this._oNotificationBar.updateMessageArea(sLine1, sLine2);
			}
		};

		/**
		 * @override
		 */
		NotificationListener.prototype.onDragEnd = function () {
			//Reset the message in the notification
			if (this._oNotificationBar) {
				this._oNotificationBar.updateMessageArea();
			}
		};

		/**
		 * Update the Notification bar during drag over controls originated from the outline
		 *
		 * @param {sap.ui.dt.Overlay} oTargetOverlay - the overlay of the target control
		 * @param {sap.ui.base.Event} oEvent - dragover event
		 *
		 * @override
		 */
		NotificationListener.prototype.onDragOver = function (oTargetOverlay, oEvent) {
			if (this._oNotificationBar) {
				var oDropAreaControl = oTargetOverlay.getElementInstance(),
					sDropAreaControlName = oDropAreaControl && W5gUtils.getControlTitle(oDropAreaControl),
					sLine1;

				if (ControlMetadata.isControlNotDroppable(oDropAreaControl)) {
					//oEvent.originalEvent.dataTransfer.dropEffect = "none"; //Changing the cursor to indicate not allowed drop zone
					sLine1 = W5gUtils.getText("message_area_invalid_drop_to_outline_controls", [sDropAreaControlName]);
					this._oNotificationBar.updateMessageArea(sLine1);
				}
				else {
					_updateNotificationDragChanged.call(this, oTargetOverlay.getParentAggregationOverlay().getElementInstance(), oTargetOverlay.getParentAggregationOverlay().getAggregationName());
				}
			}
		};

		/**
		 * @override
		 */
		NotificationListener.prototype.onControlAdded = function (oTargetControl, sAggregationName) {
			_updateNotificationDragChanged.call(this, oTargetControl, sAggregationName);
		};

		return NotificationListener;
	}
);
