define(function() {
	"use strict";
	return {

		_contentService : null,

		_oUserInfoMenubar : new sap.ui.commons.MenuBar({
			id : "userInfoMenubar"
		}),

		configure : function(mConfig) {
			this._contentService = mConfig.dirtyCheckService;
		},

		init : function() {
			var that = this;
			this._oMenuUser = new sap.ui.commons.MenuItem({
				id : "userInfoLogout",
				text : this.context.i18n.getText("i18n", "logout_logout")
			});
			this._oUserInfoMenubar.addEventDelegate({
				onAfterRendering : function() {
					//that._oImage.getDomRef().ondragstart = function() { return false; };

					that._oMenuUser.getDomRef().onclick = function() {
						that._contentService.isDirty().then(function(isDirty) {
							if (isDirty) {
								var sMsg = that.context.i18n.getText("i18n", "logout_unsavedChanges");
								return that.context.service.usernotification.confirm(sMsg).then(function(oResult) {
									if (oResult.bResult) {
										return that._callLogout();

									} else {
										return;
									}
								}).done();
							} else {
								return that._callLogout();
							}
						}).done();
					};
				}
			});

			this._oUserInfoMenubar.addItem(this._oMenuUser);
		},

		_callLogout : function() {
			var that = this;
			this.context.service.usagemonitoring.report("logout", "logout").done();
			return that.context.service.system.logout().then(function(){
				return that.context.service.unloadHandler.setEnabled(false);
			});
		},

		getContent : function() {
            return [ this._oUserInfoMenubar ];
		}
	};
});