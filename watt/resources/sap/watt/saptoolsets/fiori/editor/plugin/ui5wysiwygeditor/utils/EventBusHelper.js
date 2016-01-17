define([],
		function () {
			"use strict";

// Private variables and methods
// Begin

			var
					/**
					 * UI5 EventBus instance
					 *
					 * @private
					 */
					_oEventBus = sap.ui.getCore().getEventBus(),
					_sW5gChannelIndetifier = 'w5g';

// End
// Private variables and methods

			/**
			 * WYSIWYG EventBus wrapper
			 */
			var EventBugHelper = {

				IDENTIFIERS : {
					NOTIFICATION_BAR_ADD_MESSAGE: "notificationBarAddMessage",
					EVENTS_NEW_FUNC_ADDED : "eventsNewFunctionAdded",
					EVENTS_NAVIGATE_TO_CONTROLLER: "eventsNavToControiller",
					PROP_MODEL_CONTROL_UPDATED: "propModelControlUpdated"
				},

				/**
				 * publish event through the w5g channel
				 * @param {string} sEventName event name
				 * @param {Object.<string, object>} mParam parameter to pass through the event
				 * @function
				 * @public
				 */
				publish : function(sEventName , mParam) {
					_oEventBus.publish(_sW5gChannelIndetifier, sEventName , mParam);
				},

				/**
				 * subscribe event through the w5g channel
				 * @param sEventName {string} event name
				 * @param fCallback {function} callback function
				 * @function
				 * @public
				 */
				subscribe : function(sEventName , fCallback) {
					_oEventBus.subscribe(_sW5gChannelIndetifier, sEventName , function(oChannel, oEvent, oData){
						fCallback(oData);
					});
				}
			};

			return EventBugHelper;
		}
);
