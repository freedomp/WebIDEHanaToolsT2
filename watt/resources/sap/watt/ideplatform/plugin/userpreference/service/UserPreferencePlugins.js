define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart" ], function(AbstractPart) {
	"use strict";

	var plugins = AbstractPart.extend("sap.watt.ideplatform.plugin.userpreference.service.UserPreferencePlugins", {

		_oView : null,
		_oTitle : null,
		_oDesc : null,
		_oTopDivider : null,
		_oApplyButton : null,

		_activePlugin : null,

		// ====================================================================================
		// Service life cycle methods
		// ====================================================================================
		init : function() {
			var that = this;
			that._createContainerUI();

		},
		configure : function(mConfig) {
			var that = this;

		},
		_createContainerUI : function() {
			if (this._oView) {
				return this._oView;
			}

			var that = this;

			var oView = new sap.ui.commons.layout.BorderLayout({
				width : "100%",
				height : "100%"
			}).addStyleClass("userPrefPluginBorderLayout");

			//top part for title, description
			var oTopArea = new sap.ui.commons.layout.VerticalLayout({
				id : "vLayout1", // sap.ui.core.ID
				width : "100%", // sap.ui.core.CSSSize
				enabled : true, // boolean
				visible : true // boolean
			}).addStyleClass("userPrefPluginTopArea");

			that._oTitle = new sap.ui.commons.Label({
				text : that._getText("userpreference"),
				width : '100%',
				visible : false
			}).addStyleClass("userPrefPluginTitle");
			oTopArea.addContent(that._oTitle);

			this._oDesc = new sap.ui.commons.Label({
				text : '',
				width : '100%',
				visible : false
			}).addStyleClass("userPrefPluginDesc");
			oTopArea.addContent(this._oDesc);

			that._oTopDivider = new sap.ui.commons.HorizontalDivider({
				width : '100%',
				visible : false
			}).addStyleClass("userPrefPluginDevider");
			oTopArea.addContent(that._oTopDivider);

			oView.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.top, oTopArea);
			oView.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.top, {
				size : "120px",
				contentAlign : "center",
				visible : true
			});

			//bottom part for Save and Cancel button
			var oButtonPanel = new sap.ui.layout.HorizontalLayout({
				allowWrapping : true,
				layoutData : new sap.ui.layout.GridData({
					span : "L12 M12 S12",
					linebreak : true
				})
			}).addStyleClass("buttonPanel");

			that._oApplyButton = new sap.ui.commons.Button({
				id : 'applyButton', // sap.ui.core.ID
				text : that._getText("button_apply"), // string
				tooltip : that._getText("button_apply_tooltip"),
				visible : false, // boolean, since 1.14.0,
				icon : undefined, // sap.ui.core.URI
				press : function(oEvent) {
					var returnValue = that._activePlugin ? that._activePlugin.id : undefined;
					//that._oApplyButton.setEnabled(false);
					that.context.event.fireUserPreferencePluginApplied({
						"id" : returnValue
					}).done();
				}
			}).addStyleClass("userPrefPluginApplyButton");
			oButtonPanel.addContent(that._oApplyButton);

			oView.createArea(sap.ui.commons.layout.BorderLayoutAreaTypes.bottom, oButtonPanel);
			oView.setAreaData(sap.ui.commons.layout.BorderLayoutAreaTypes.bottom, {
				size : "54px",
				contentAlign : "left",
				visible : true
			});

			that._oView = oView;

		},
		_showPreference : function() {
			var that = this;

			if (that._activePlugin) {
				if (that._activePlugin.title) {
					that._oTitle.setText(that._activePlugin.title);
				} else {
					that._oTitle.setText("");
				}

				if (that._activePlugin.description) {
					that._oDesc.setText(that._activePlugin.description);
				} else {
					that._oDesc.setText("");
				}

				that._oView.setBusy(true);
				that._oView.removeAllContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center);

				if (that._activePlugin.service) {
					var sGroup = that._activePlugin.group;
					if (sGroup && sGroup == "null") {
						sGroup = null;
					}

					that._activePlugin.service.getUserPreferenceContent(that._activePlugin.id, sGroup).then(function(oContent) {
						that._oView.addContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center, oContent);
						that._oView.setBusy(false);
					}).done();
					
					that.context.service.usagemonitoring.report("userPreference", "selectPreference", [that._activePlugin.id, that._activePlugin.title]).done();
				}
			}
		},
		_getText : function(property_key) {
			var i18n = this.context.i18n;
			return i18n.getText("i18n", property_key);
		},
		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Part
		// ====================================================================================
		getContent : function() {
			var that = this;
			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				return that._oView;
			});
		},

		// ====================================================================================
		// Events listners: 
		// ====================================================================================
		onPerspectiveChange: function(oEvent) {
			var that = this;
			if (oEvent.params.from !== "userpreference" && oEvent.params.to === "userpreference") {
				that._showPreference();
			}
		},

		onSelectionChanged : function(oEvent) {
			//the event was fired by userpreference service
			var that = this;
			that._oTitle.setVisible(true);
			that._oDesc.setVisible(true);
			that._oTopDivider.setVisible(true);
			that._oApplyButton.setVisible(true);

			that._activePlugin = oEvent.params.plugin;
			that._showPreference();
		},

		onSettingChanged : function(oEvent) {
			//the event was fired by userpreference
			this._oApplyButton.setEnabled(true);
		}

	});

	return plugins;
});