define([
	"sap/watt/common/plugin/platform/service/ui/AbstractConfig",
	], function (AbstractConfig) {
	"use strict";

	return AbstractConfig.extend("sap.watt.common.plugin.projectsetting.FakeConsumer", {
		_oView : null,

		getProjectSettingContent : function(id, group) {
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
						text : "Project Setting"
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
		saveProjectSetting : function(id, group) {
			return Q("saved");
		}
	});
});
