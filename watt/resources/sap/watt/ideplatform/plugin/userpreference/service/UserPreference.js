define([ "sap/watt/common/plugin/platform/service/ui/AbstractPart" ], function(AbstractPart) {
	"use strict";

	var plugins = AbstractPart.extend("sap.watt.ideplatform.plugin.userpreference.service.UserPreference", {
		_oView : null,
		_aPlugins : null,
		_oCurrentPlugin : null,
		_oCurrentPluginButton : null,
		_firstPlugin : null,
		_firstPluginButton : null,

		// ====================================================================================
		// Service life cycle methods
		// ====================================================================================
		
		configure : function(mConfig) {
			var that = this;

			this._aStyles = mConfig.styles;
			this._aPlugins = mConfig.plugins;

			jQuery.each(this._aPlugins, function(i, oPlugin) {
				var oPluginService = oPlugin.service;
				if (!oPluginService._hasuserPreferenceChangedEvent) {
					oPluginService._hasuserPreferenceChangedEvent = true;
					oPluginService.attachEvent('userPreferenceChanged', that.onUserPreferenceChanged, that);
				}
			});
		},
		
		//for unit test purpose
		getPlugins : function() {
			return this._aPlugins;
		},
		/**
		*	comparision function for sorting
		*/
		_sortByName : function(a, b) {
			// mix compare "group" and "name".
			// if the item is in a group (not undefined, not null, not "null", then use group name for comparision
			// otherwise, use item name instead
			var isAGroup = true;
			var sA = a.group;
			if (!sA || sA == "null") {
				sA = a.name;
				isAGroup = false;
			}

			var isBGroup = true;
			var sB = b.group;
			if (!sB || sB == "null") {
				sB = b.name;
				isBGroup = false;
			}

			if (!sA || !sB) {
				return 0;
			}

			if (sA < sB) {
				return -1;
			} else if (sA > sB) {
				return 1;
			} else {
				//both items are in the same group, so compare the item name for sorting
				if (isAGroup && isBGroup) {
					if (a.name < b.name) {
						return -1;
					} else if (a.name > b.name) {
						return 1;
					} else {
						return 0;
					}
				} else {
					return 0;
				}
			}

			return 0;
		},
		/**
		* Search the group of sGroupName in the control list of aControlList.
		* If found, return the object, otherwise return undefined.
		* parameters:
		* 	aControlList	an array of control for searching in format of [{"groupName":"", "object": null}]
		*	sGroupName		the group to find
		* return:
		*	the group object or undefined if not found
		*/
		_findExistingGroup : function(aControlList, sGroupName) {
			if (aControlList) {
				for ( var i = 0; i < aControlList.length; i++) {
					if (sGroupName == aControlList[i].groupName) {
						return aControlList[i].object;
					}
				}
			}

			return undefined;
		},
		_getPluginByID : function(sID) {
			if (this._aPlugins && sID) {
				for ( var i = 0; i < this._aPlugins.length; i++) {
					var oPlugin = this._aPlugins[i];
					if (oPlugin.id == sID) {
						return oPlugin;
					}
				}
			}
			return undefined;
		},

		_pressPluginButton : function(oPlugin, oControl) {
			if (this._oCurrentPluginButton && (this._oCurrentPluginButton == oControl)) {
				return Q();
			}

			if (this._oCurrentPluginButton) {
				this._oCurrentPluginButton.removeStyleClass("selectedPluginButton");
			}

			this._oCurrentPlugin = oPlugin;
			this._oCurrentPluginButton = oControl;

			oControl.addStyleClass("selectedPluginButton");

			return this.context.event.fireUserPreferenceSelectChanged({
				"plugin" : oPlugin
			});
		},

		_createUI : function() {
			var that = this;

			var aControls = [];

			that._oView = new sap.ui.commons.layout.BorderLayout({
				width: "100%",
				height: "100%",
				busyIndicatorDelay : 0
			}).addStyleClass("userPrefPanel");

			var oPluginList = new sap.ui.layout.VerticalLayout({
				width: "100%"
			}).addStyleClass("pluginList");

			that._oView.addContent(sap.ui.commons.layout.BorderLayoutAreaTypes.center, oPluginList);

			if (that._aPlugins) {
				that._aPlugins.sort(that._sortByName);
				jQuery.each(that._aPlugins, function(index, oPlugin) {
					var oControl = new sap.ui.commons.Button({
						id : oPlugin.id, // sap.ui.core.ID
						width : '100%', // sap.ui.core.CSSSize
						text : oPlugin.name, // string
						visible : true, // boolean, since 1.14.0
						icon : undefined, // sap.ui.core.URI
						press : function() {
							that._pressPluginButton(oPlugin, oControl).done();
						}
					}).addStyleClass("pluginButton");

					if (!that._firstPlugin) {
						that._firstPlugin = oPlugin;
						that._firstPluginButton = oControl;
					}

					if (oPlugin.group && oPlugin.group != "null") {
						//group
						oControl.addStyleClass("indentPluginButton");

						//if group was added alrady, then simply add the new item to the group, otherwise, create a new group
						var oGroup = that._findExistingGroup(aControls, oPlugin.group);
						if (oGroup) {
							//group exists, add the new item to it
							oGroup.oSection1.addContent(oControl);
						} else {
							//group did not exists
							oGroup = new sap.ui.commons.Accordion({
								width: "100%"
							});
							var oSection1 = new sap.ui.commons.AccordionSection({
								title: oPlugin.group,
								collapsed: true
							});

							oGroup.addSection(oSection1);
							oGroup.oSection1 = oSection1;

							oGroup.oSection1.addContent(oControl);

							aControls.push({
								"groupName" : oPlugin.group,
								"object" : oGroup
							});
						}
					} else {
						aControls.push({
							"groupName" : oPlugin.group,
							"object" : oControl
						});
					}
				});
			}

			if (aControls && aControls.length > 0) {
				for ( var i = 0; i < aControls.length; i++) {
					oPluginList.addContent(aControls[i].object);
				}
			}
		},

		// ====================================================================================
		// Interface methods: sap.watt.common.service.ui.Part
		// ====================================================================================
		getContent : function() {
			var that = this;
			return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
				if (!that._oView) {
					that._createUI();

					if (that._firstPlugin) {
						return that._pressPluginButton(that._firstPlugin, that._firstPluginButton).then(function() {
							return Q(that._oView);
						});
					}
				}
				return Q(that._oView);
			});
		},

		// ====================================================================================
		// Events listners:
		// ====================================================================================
		onApplyPressed : function(oEvent) {
			//the event was fired by userpreference_plugins service
			//update settngs for the current service
			if (this._oCurrentPlugin) {
				var that = this;
				this._oCurrentPlugin.service.saveUserPreference(this._oCurrentPlugin.id,
						this._oCurrentPlugin.group).then(function() {
					that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n", "msg_saved")).done();
				}).fail(function (errMsg) {
				    if (errMsg !== undefined) {
				        that.context.service.usernotification.alert(errMsg).done();
				    }
				}).done();
			}
		},
		onCancelPressed : function(oEvent) {
			//the event was fired by userpreference_plugins service
			var that = this;
			//??????????????
		},
		onUserPreferenceChanged : function(oEvent) {
			//the event was fired by registered service
			this.context.event.fireUserPreferenceSettingChanged({
				"service" : oEvent.params.service
			});
		}
	});

	return plugins;
});