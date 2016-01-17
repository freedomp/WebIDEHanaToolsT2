jQuery.sap.declare("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.AssignToStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

var assignToStep = function() {

	/* eslint-disable no-use-before-define */

	var that = null;
	var oModel = null;
	var groupsLabel = null;
	var groupsDropdownbox = null;
	var contentPackageLabel = null;
	var contentPackageDropdownbox = null;
	var siteLabel = null;
	var siteDropdownbox = null;

	/*
	 * Builds the UI
	 */
	var _onBeforeRendering = function() {
		that = this;
		that.oContext = this.getContext();
		oModel = that.getModel().getData();
		that.oWizard = that.getWizardControl();

		this.removeAllContent();

		var siteContent = createSiteContent();
		var contentPackageContent = createContentPackageContent();
		var groupsContent = createGroupsContent();

		this.addContent(siteContent);
		this.addContent(contentPackageContent);
		this.addContent(groupsContent);

		that.fireProcessingStarted();

		getDataFromFLP().then(function(result) {
			that.fireProcessingEnded();

			if (result.isValid === true) {
				// enable the next button
				that.fireValidation({
					isValid: true
				});
			} else {
				that.fireProcessingEnded();

				// disable the next button
				that.fireValidation({
					isValid: false,
					message: result.message,
					severity: "error"
				});
			}
		}).done();
	};

	var createSiteContent = function() {

		siteLabel = new sap.ui.commons.Label({
			required: true,
			text: that.oContext.i18n.getText("AssignToStep_Sites"),
			textAlign: "Left",
			tooltip: that.oContext.i18n.getText("AssignToStep_SiteLabelTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		siteDropdownbox = new sap.ui.commons.DropdownBox({
			width: "100%",
			tooltip: that.oContext.i18n.getText("AssignToStep_SitesTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});

		siteDropdownbox.attachChange(function(oEvent) {
			if (!oEvent.getParameter("selectedItem")) {
				return;
			}
			var selectedSite = oEvent.getParameter("selectedItem").getModel().getData().modelData;
			var promises = [];
			promises.push(that.oContext.service.fiorilaunchpad.getGroups(oModel.provider.name, selectedSite.id));
			promises.push(that.oContext.service.fiorilaunchpad.getContentPackages(oModel.provider.name, selectedSite.id));
			
			Q.all(promises).spread(function() {
		
				var oGroupsResult = fillGroups(arguments[0]);
				oModel.groups = oGroupsResult.groups;

				if (oGroupsResult.isValid === true) {
					groupsDropdownbox.fireChange({
						"selectedItem": groupsDropdownbox.getItems()[0]
					});
				} else {
					oGroupsResult.message = that.oContext.i18n.getText("AssignToStep_NoGroups");
					return oGroupsResult;
				}

				var oContentPackagesResult = fillContentPackages(arguments[1]);
				oModel.contentPackages = oContentPackagesResult.contentPackages;

				if (oContentPackagesResult.isValid === true) {
					contentPackageDropdownbox.fireChange({
						"selectedItem": contentPackageDropdownbox.getItems()[0]
					});
				} else {
					oContentPackagesResult.message = that.oContext.i18n.getText("AssignToStep_NoContentPackages");
					return oContentPackagesResult;
				}

			});
			oModel.selectedSite = [selectedSite.id];

		});

		var siteContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [siteLabel, siteDropdownbox]
		});

		return siteContent;
	};

	var createGroupsContent = function() {

		groupsLabel = new sap.ui.commons.Label({
			required: true,
			text: that.oContext.i18n.getText("AssignToStep_Groups"),
			textAlign: "Left",
			tooltip: that.oContext.i18n.getText("AssignToStep_GroupsLabelTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		groupsDropdownbox = new sap.ui.commons.DropdownBox({
			width: "100%",
			tooltip: that.oContext.i18n.getText("AssignToStep_GroupsTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});

		groupsDropdownbox.attachChange(function(oEvent) {
			if (!oEvent.getParameter("selectedItem")) {
				return;
			}
			var selectedGroup = oEvent.getParameter("selectedItem").getModel().getData().modelData;
			oModel.selectedGroups = [selectedGroup.id];
		});

		var groupsContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [groupsLabel, groupsDropdownbox]
		});

		return groupsContent;
	};

	var createContentPackageContent = function() {

		contentPackageLabel = new sap.ui.commons.Label({
			required: true,
			text: that.oContext.i18n.getText("AssignToStep_Catalog"),
			textAlign: "Left",
			tooltip: that.oContext.i18n.getText("AssignToStep_CatalogLabelTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M2 S12"
			})
		}).addStyleClass("wizardBody");

		contentPackageDropdownbox = new sap.ui.commons.DropdownBox({
			width: "100%",
			tooltip: that.oContext.i18n.getText("AssignToStep_CatalogTooltip"),
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M8 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});

		contentPackageDropdownbox.attachChange(function(oEvent) {
			if (!oEvent.getParameter("selectedItem")) {
				return;
			}
			var selectedContentPackage = oEvent.getParameter("selectedItem").getModel().getData().modelData;
			oModel.selectedcontentPackages = [selectedContentPackage.id];
		});

		var contentPackageContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [contentPackageLabel, contentPackageDropdownbox]
		});

		return contentPackageContent;
	};

	var _cleanStep = function() {

	};

	var fillDropdownBox = function(aResources, dropdownBox) {

		if (dropdownBox.getItems().length > 0) {
			dropdownBox.removeAllItems();
		}

		var index = 0;
		aResources.forEach(function(oResource) {
			var listItem = new sap.ui.core.ListItem({
				text: oResource.title ? oResource.title : oResource.name,
				key: index++,
				data: oResource
			});

			var oListModel = new sap.ui.model.json.JSONModel();
			oListModel.setData({
				modelData: oResource
			});

			listItem.setModel(oListModel);
			dropdownBox.addItem(listItem);
		});

		var result = {
			isValid: false
		};

		if (dropdownBox.getItems().length > 0) {
			result = {
				isValid: true
			};
		}

		return result;
	};

	var fillGroups = function(oGroups) {

		var oFLPGroups = jQuery.parseJSON(oGroups);

		var oResult = fillDropdownBox(oFLPGroups.groups, groupsDropdownbox);
		oResult.groups = oFLPGroups.groups;

		return oResult;
	};

	var fillSites = function(oSites) {

		var oResult = fillDropdownBox(oSites.sites, siteDropdownbox);
		oResult.sites = oSites.sites;

		return oResult;
	};

	var fillContentPackages = function(oContentPackages) {

		var oFLPContentPackages = jQuery.parseJSON(oContentPackages);

		var oResult = fillDropdownBox(oFLPContentPackages.items, contentPackageDropdownbox);
		oResult.contentPackages = oFLPContentPackages.items;

		return oResult;
	};

	var getDataFromFLP = function() {

		if (oModel.groups && oModel.groups.length > 0 &&
			oModel.contentPackages && oModel.contentPackages.length > 0 &&
			oModel.sites && oModel.sites.length > 0) {
			//sites, groups and contentPackages were already fetched from FLP - 
			// only fill the UI instead of executing these requests again
			fillDropdownBox(oModel.sites, siteDropdownbox);
			fillDropdownBox(oModel.contentPackages, contentPackageDropdownbox);
			fillDropdownBox(oModel.groups, groupsDropdownbox);

			var oValidResult = {
				isValid: true
			};

			return Q(oValidResult);
		}

		// get sites from from the selected provider account
		return that.oContext.service.fiorilaunchpad.getSites(oModel.provider.name).then(function(oSites) {

			var result = fillSites(oSites);
			oModel.sites = result.sites;

			if (result.isValid === true) {
				siteDropdownbox.fireChange({
					"selectedItem": siteDropdownbox.getItems()[0]
				});
			} else {
				result.message = that.oContext.i18n.getText("AssignToStep_NoSites");
				return result;
			}

			return result;
		}).catch(function(err) {
			that.fireProcessingEnded();
			return {
				isValid: false,
				message: err.error.msg
			};
		});
	};

	/* eslint-enable no-use-before-define */

	return {
		onBeforeRendering: _onBeforeRendering,
		cleanStep: _cleanStep,
		metadata: {
			properties: {
				"wizardControl": "object"
			}
		},
		renderer: {}
	};
}();

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.AssignToStep", assignToStep);