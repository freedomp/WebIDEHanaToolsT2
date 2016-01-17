define([
	"sap/watt/common/plugin/platform/service/ui/AbstractConfig",
	], function (AbstractConfig, EditorLinterSettings) {
	"use strict";

	return AbstractConfig.extend("sap.watt.ideplatform.plugin.userpreference.FakeConsumer", {
		_oView : null,

		getUserPreferenceContent : function(id, group) {
			var that = this;
			
			if (that._oView == null) {
				that._oView = new sap.ui.commons.Panel({
					showCollapseIcon : true,
					width : "100%",
					height : "100%",
					collapsed: false,
					borderDesign : sap.ui.commons.enums.BorderDesign.None,
					applyContentPadding : false,
					title : new sap.ui.core.Title({
						text : "User Preference"
					})
				});

				var oControl = new sap.ui.commons.Button({
							width: '100%', // sap.ui.core.CSSSize
							height: '100%',
							text: "Dynamic Content from registered service", // string
							visible: true, // boolean, since 1.14.0
							icon: undefined, // sap.ui.core.URI	
							press: function(oEvent) {
								alert("the dynamic content was pressed");
							}
						});

				that._oView.addContent(oControl);
			}
			
			return Q(that._oView);
		},
		saveUserPreference : function(id, group) {
			return Q("saved");
		}
	});
});
