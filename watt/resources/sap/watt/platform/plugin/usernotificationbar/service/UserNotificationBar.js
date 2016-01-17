define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart" ], function(AbstractPart) {
	"use strict";

	/**
	 * UserNotificationBar class 
	 */
	var UserNotificationBar = AbstractPart.extend("sap.watt.platform.plugin.usernotificationbar.service.UserNotificationBar", {

		_oOpenQueue : new Q.sap.Queue(),
		_aStyles : null,
		_oNotificationMessageLabel : null,
		_oNotificationActionButton : null,
		_fnLastActionOnPress : null,
		_iLastTimeoutId : null,

		configure : function(mConfig) {
			this._aStyles = mConfig.styles;
		},

		init : function() {
			this._oNotificationMessageLabel = sap.ui.getCore().byId("userNotificationBarMessage");
			if (this._oNotificationMessageLabel) {
				this._oNotificationMessageLabel.destroy();
			}
			this._oNotificationMessageLabel = new sap.ui.commons.Label("userNotificationBarMessage" , {
				visible : false,
				width : "100%",
				wrapping : false
			}).addStyleClass("userNotificationBarMessage watt_toolbar_text");
			this._oNotificationActionButton = new sap.ui.commons.Button({
				lite : true,
				visible : false,
				width : "100%"
			}).addStyleClass("userNotificationBarActionBtn watt_toolbar_text");
		},

		_display : function(sMessage, sCommandId, bAutoDisappear, oCommandExecuteValue) {
			var that = this;
			// Remove previous message and stop previous auto-disappear 
			if (this._iLastTimeoutId !== null) {
				clearTimeout(this._iLastTimeoutId);
			}
			this._oNotificationActionButton.setVisible(false);
			this._oNotificationMessageLabel.setVisible(false);

			// Set message
			this._oNotificationMessageLabel.setText(sMessage);
			this._oNotificationMessageLabel.setTooltip(sMessage);

			this._setStyleClasses(bAutoDisappear);

			if (sCommandId) {
				// Set action
				return this.context.service.command.getCommand(sCommandId).then(function(oCommand) {
					that._oNotificationActionButton.setText(oCommand.getLabel());
					that._oNotificationActionButton.setTooltip(oCommand.getLabel());
					// Handle action button press
					if (that._fnLastActionOnPress) {
						that._oNotificationActionButton.detachPress(that._fnLastActionOnPress, that);
					}
					that._fnLastActionOnPress = function() {
						oCommand.execute(oCommandExecuteValue).done();
					};
					that._oNotificationActionButton.attachPress(that._fnLastActionOnPress, that);
					// Show message and action at once and consider auto disappearing
					that._oNotificationMessageLabel.setVisible(true);
					that._oNotificationActionButton.setVisible(true);
					return that._setAutoDisappearAndDelay(bAutoDisappear);
				}).fail(function(oError) {
					// Show only message and consider auto disappearing
					that._oNotificationMessageLabel.setVisible(true);
					return that._setAutoDisappearAndDelay(bAutoDisappear);
				});
			} else {
				// Show only message and consider auto disappearing
				this._oNotificationMessageLabel.setVisible(true);
				return this._setAutoDisappearAndDelay(bAutoDisappear);
			}
		},

		_setStyleClasses : function(bAutoDisappear) {
			// set the css animation based on bAutoDisappear
			// Notice: 	setting both label and button with the same style always, even if button is not shown, to avoid
			// 			inconsistency
			if (bAutoDisappear) {
				this._oNotificationMessageLabel.removeStyleClass("VAnimationPulseStay");
				this._oNotificationActionButton.removeStyleClass("VAnimationPulseStay");
				this._oNotificationMessageLabel.addStyleClass("VAnimationPulse");
				this._oNotificationActionButton.addStyleClass("VAnimationPulse");
			} else {
				this._oNotificationMessageLabel.removeStyleClass("VAnimationPulse");
				this._oNotificationActionButton.removeStyleClass("VAnimationPulse");
				this._oNotificationMessageLabel.addStyleClass("VAnimationPulseStay");
				this._oNotificationActionButton.addStyleClass("VAnimationPulseStay");
			}
		},

		// Consider bAutoDisappear default value as true (unless explicitly set to false)
		// Notifications will be dismissed anyway after 1 minute.
		_setAutoDisappear : function(bAutoDisappear) {
			var that = this;
			var iTimeoutMillies = 6000; // 6 seconds
			if (bAutoDisappear === false) {
				iTimeoutMillies = 60000; // 1 min
			}
			this._iLastTimeoutId = setTimeout(function() {
				that._oNotificationMessageLabel.setVisible(false);
				that._oNotificationActionButton.setVisible(false);
			}, iTimeoutMillies);
		},

		_delay : function() {
			// Delay response so the message will appear at least 1 second 
			// before replaced with another one
			var oDeferred = Q.defer();
			setTimeout(function() {
				oDeferred.resolve();
			}, 1000);
			return oDeferred.promise;
		},

		_setAutoDisappearAndDelay : function(bAutoDisappear) {
			this._setAutoDisappear(bAutoDisappear);
			return this._delay();
		},

		display : function(sMessage, sCommandId, bAutoDisappear, oCommandExecuteValue) {
			var that = this;
			// Put the message as the next in the queue (so they will be displayed by order)
			return this._oOpenQueue.next(function() {
				return that._display(sMessage, sCommandId, bAutoDisappear, oCommandExecuteValue);
			});
		},

		getContent : function() {
			var that = this;
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return [ that._oNotificationMessageLabel, that._oNotificationActionButton ];
				});
			}
			return [ that._oNotificationMessageLabel, that._oNotificationActionButton ];
		}

	});

	return UserNotificationBar;
});