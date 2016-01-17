define(function() {
	"use strict";
	return {

		_aItems: [],

		// TODO: Add this to configuration
		_iconMap: {
			"expand": "e025",
			"collapse": "e026",
			"createFile": "e003",
			"createFolder": "e005",
			"delete": "e019",
			"redo": "e018",
			"run": "e00f",
			"save": "e021",
			"save_cloud": " e000",
			"undo": "e017",
			"search": "e02f",
			"home": "e02e",
			"development": "e040",
			"git": "e042",
			"git2": "e041",
			"outlinePane": "e030",
			"collaboration": "e031",
			"lookup": "e033",
			"fetch": "e04a",
			"fetch_from_gerrit": "e04d",
			"merge": "e04c",
			"reset": "e015",
			"rebase": "e04b",
			"abort": "e010",
			"continue": "e00d",
			"skip": "e016",
			"arrow_up": "e04e",
			"arrow_down": "e043",
			"user_preference": "e012",
			"welcome": "e02e",
			"arrow_left": "e009",
			"arrow_right": "e00a",
			"arrow_star": "e05c",
			"lucy": "e02d",
			"api_reference": "e033",
			"proj_template": "e028",
			"proj_sample": "e034",
			"proj_extension": "e02a",
			"proj_uifirst": "e02b",
			"git_history": "e808",
			"copy": "e029",
			"help": "e06f",
			"preview": "e072",
			"frame": "e073",
			"error": "e011",
			"general": "E060",
			"fiori-smart": "E06A",
			"fiori-mobile": "E06E",
			"fiori-lib": "E06C",
			"fiori-app": "E06D",
			"web-plugin": "E06B",
			"favorite" : "E071",
			"unfavorite" : "E070",
			"gotocode": "e040"
		},
		_fioriIconMap: {
			"my_shops": "E3A0",
			"approve_purchase_order": "E232",
			"manage_products": "E3A1",
			"manage_purchase_order": "E3A6",
			"manage_tasks": "E202"
		},

		_smileIconMap: {
			"very_happy": "E08C",
			"happy": "E08B",
			"natural": "E089",
			"sad": "E087",
			"very_sad": "E086"
		},

		LayoutType : {
		    LOAD : 0,
		    MAIN : 1,
		    FAILURE : 2,
		    LOGOUT : 3
		},

		init: function() {
			//TODO: Peter Muessig: rework requiring of ui5 dependencies
			jQuery.sap.require("sap.ui.core.IconPool");

			// add custom watt icons to the ui5 icon pool
			for (var sName in this._iconMap) {
				sap.ui.core.IconPool.addIcon(sName, "watt", "SAP-icons-watt", this._iconMap[sName], true);
			}
			for (var sName in this._fioriIconMap) {
				sap.ui.core.IconPool.addIcon(sName, "fiori", "sap-launch-icons", this._fioriIconMap[sName], true);
			}
			for (var sName in this._smileIconMap) {
				sap.ui.core.IconPool.addIcon(sName, "smile", "BusinessSuiteInAppSymbols", this._smileIconMap[sName], true);
			}

			this._oCurrentLayoutType = this.LayoutType.LOAD;
		},

		configure: function(mConfig) {
			this._aItems = this._aItems.concat(mConfig.items);
			this._sContentId = mConfig.content;
			this._sLoadingId = mConfig.loading;
			this._sFailure = mConfig.failure;
			this._aStyles = mConfig.styles;
		},

		show: function(iLayoutType) {
			if (iLayoutType === this.LayoutType.MAIN) {
				return this._handleLoadingAndMainLayout();
			} else if (iLayoutType === this.LayoutType.FAILURE) {
				return this._handleFailureLayout();
			}
		},

		_hideCurrentLayout: function() {
			if (this._oCurrentLayoutType === this.LayoutType.MAIN) {
				jQuery("#" + this._sContentId).hide();
			} else if (this._oCurrentLayoutType === this.LayoutType.LOAD) {
				jQuery("#" + this._sLoadingId).hide();
			}
		},

		_handleFailureLayout: function() {
			this._hideCurrentLayout();
			var that = this;

			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					var sText1 = that.context.i18n.getText("i18n", "failure_txt1");
					var sText2 = that.context.i18n.getText("i18n", "failure_txt2");
					var sText3 = that.context.i18n.getText("i18n", "failure_txt3");
					var sFailureImageUrl = require.toUrl("sap/watt/platform/plugin/layout/image/failure.png");

					jQuery("#" + that._sFailure).html(
						"<div class=\"img1\">" +
						"<img src=" + sFailureImageUrl + " alt=" + sText1 + "</img1>" +
						"</div>" +
						"<div class=\"txt1\">" + sText1 + "</div>" +
						"<div class=\"txt_container\">" +
						"<div class=\"txt2\">" + sText2 + "</div>" +
						"<div class=\"txt3\">" + sText3 + "</div>" +
						"</div>"
					);
					jQuery("#" + that._sFailure).show();
				});
			}

			return Q();
		},

		_handleLoadingAndMainLayout: function() {
			var that = this;
			var aPromises = [];
			var iProgressStep = Math.round(95 / (that._aItems.length));
			var iProgressValue = 5;
			var fnNextProgress = function() {
				iProgressValue += iProgressStep;
				jQuery("#" + that._sLoadingId + " > progress").attr("value", iProgressValue).html(iProgressValue);
			};

			for (var i = 0; i < this._aItems.length; i++) {
				var oPromise = this._aItems[i].service.getContent();
				oPromise.then(fnNextProgress).done();
				aPromises.push(oPromise);
			}

			// Preload all services before start to create the layout
			return Q.spread(aPromises, function() {
				for (var i = 0; i < arguments.length; i++) {
					var oControl = arguments[i];
					var sPlaceAt = that._aItems[i].placeAt;
					if (document.getElementById(sPlaceAt)) {
						oControl.placeAt(that._aItems[i].placeAt);
					} else {
						console.warn("LayoutService: Could not add service content to DOM " + sPlaceAt);
					}
				}
				jQuery("#" + that._sLoadingId).hide();
				that._oCurrentLayoutType = that.LayoutType.MAIN;
				jQuery("#" + that._sContentId).show();
			});

		},
		getLayoutTypes: function() {
			return this.LayoutType;
		}
	};
});