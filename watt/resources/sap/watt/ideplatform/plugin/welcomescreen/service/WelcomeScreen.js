define(["sap/watt/common/plugin/platform/service/ui/AbstractPart", "../ui/view/WelcomeContent.controller"], function(AbstractPart) {
	"use strict";

	var welcomeScreen = AbstractPart.extend("sap.watt.ideplatform.plugin.welcomescreen.service.WelcomeScreen", {

		oView: null,
		_perspectiveService: null,
		_oSettings: {},

		init: function() {
			this._perspectiveService = this.context.service.perspective;
			this._oSettings = {};

			// Create the view
			this.oView = sap.ui.view("welcomeView", {
				viewName: "sap.watt.ideplatform.plugin.welcomescreen.ui.view.WelcomeContent",
				type: sap.ui.core.mvc.ViewType.XML,
				controller: sap.ui.controller("sap.watt.ideplatform.plugin.welcomescreen.ui.view.WelcomeContent"),
				viewData: {
					context: this.context
				}
			});

			this.oSections = {};
			this.oSectionsPromises = {};
		},

		configure: function() {

		},

		getSelection: function() {
			return null;
		},

		getSelectionProvider: function() {
			return Q(this.oView);
		},

		getFocusElement: function() {
			return Q(this.oView);
		},

		getContent: function() {
			return Q(this.oView);
		},

		getBasicContainer: function(sId) {
			return new sap.watt.ideplatform.plugin.welcomescreen.ui.controls.BasicWelcomeContainer(sId);
		},

		_compareMajorMinorVersions: function(lastVersion, currentVersion) {
			var lastComponents = lastVersion.split(".");
			var currentComponents = currentVersion.split(".");

			//compare only the major and minor part
			var last = lastComponents[0] + "." + lastComponents[1];
			var current = currentComponents[0] + "." + currentComponents[1];

			return last !== current;
		},

		onAllPluginsStarted: function() {
			var that = this;
			// start loading the containers
			this.context.service.WelcomeScreenManager.getWelcomeContainers().then(function(containers) {
				jQuery.each(containers, function(iIndex, containerRegistry) {
					var section = containerRegistry.getSection();

					// only if there is such a section in the view, add the container
					if (that.oView.byId(section)) {
						// in case this is the first time we run into this section
						if (!that.oSections[section]) {
							that.oSections[section] = [];
						}

						that.oSections[section].push(containerRegistry);
					}

				});

				jQuery.each(that.oSections, function(iIndex, sectionArray) {
					// sort by priority
					sectionArray.sort(that._compareContainers);

					// add the containers to the view
					var sectionId = sectionArray[0].getSection();
					if (!that.oSectionsPromises[sectionId]) {
						that.oSectionsPromises[sectionId] = [];
					}

					jQuery.each(sectionArray, function(index, section) {
						that.oSectionsPromises[sectionId].push(section.getContainer());
					});

					Q.all(that.oSectionsPromises[sectionId]).spread(function() {
						var oGrid = that.oView.byId(sectionId);
						if (oGrid) {
							jQuery.each(arguments, function(index, content) {
								oGrid.addContent(content);
							});
						}
					}).done();
				});
			}).then(function () {
				return that._perspectiveService.isPerspectiveRegistered("welcome").then(function(bWelcomeRegistered) {
					if (bWelcomeRegistered) {
						return that.context.service.WelcomeScreenPersistency.getPerspectiveSettings().then(function(perspectivePrefs) {
							that._oSettings = perspectivePrefs;
							return that.context.service.Version.getLastSeenVersion().then(function(sVersion) {
								that.lastVersion = sVersion;
								return that.context.service.Version.getCurrentVersion().then(function(sCurrentVersion) {
									if (!that._oSettings || that._oSettings.bIsOpen === true || that.lastVersion === undefined || that.lastVersion !== sCurrentVersion) {

										if (!that._oSettings) {
											that._oSettings = {};
										}

										that._oSettings.bIsOpen = true;
										that._oSettings.bIsVersionUpdate = !that.lastVersion || that._compareMajorMinorVersions(that.lastVersion, sCurrentVersion);
										that._oSettings.oVersionUpdate = {
											from: that.lastVersion ? that.lastVersion : "",
											to: sCurrentVersion
										};

										if (!that.lastVersion || that.lastVersion !== sCurrentVersion) {
											that.context.service.Version.setLastSeenVersion(sCurrentVersion).done();
										}

										that.context.service.WelcomeScreenPersistency.setPerspectiveSettings(that._oSettings).done();
										return that._perspectiveService.renderPerspective("welcome");
									} else {
										//This is a workaround for the tips and tricks plugin that should be open only when web-ide is
										//opened and the first perspective is the development perspective so it listens for this event.
										return that.context.event.fireWelcomePerspectiveNotVisibleOnStartup();
									}
								});
							});
						});
					}
				});
			}).done();
		},

		onPerspectiveChange: function(oEvent) {
			// If by some miraculous chance the settings are null/undefined, initialize the variable
			if (!this._oSettings) {
				this._oSettings = {};
			}

			if (oEvent.params.from !== "welcome" && oEvent.params.to === "welcome") {
				this._oSettings.bIsOpen = true;
				this.context.service.WelcomeScreenPersistency.setPerspectiveSettings(this._oSettings).done();
			}
			if (oEvent.params.from === "welcome" && oEvent.params.to !== "welcome") {
				this._oSettings.bIsOpen = false;
				this.context.service.WelcomeScreenPersistency.setPerspectiveSettings(this._oSettings).done();
			}
		},

		onAfterGeneration: function(oEvent) {
			var that = this;
			return this._perspectiveService.getCurrentPerspective().then(function(oPerspective) {
				if (oPerspective === "welcome") {
					return that._perspectiveService.renderPerspective("development");
				}
			});
		},

		_compareContainers: function(a, b) {
			return a.getPriority() - b.getPriority();
		}
	});

	return welcomeScreen;
});