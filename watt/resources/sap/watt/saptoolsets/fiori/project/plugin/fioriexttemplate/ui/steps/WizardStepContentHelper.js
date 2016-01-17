define(function() {

	var _buildResourcesDropdownbox = function(context, oModel, resourceType, dropdownBox, wizard, invalidMessage, addResourceType) {
		var parentProjectService = context.service.parentproject;
		var promises = [];
		oModel.resources = [];
		promises.push(parentProjectService.getResources(oModel, resourceType));
		if (addResourceType) {
			promises.push(parentProjectService.getResources(oModel, addResourceType));
		}
		Q.all(promises).spread(function() {
			var resources = arguments[0];
			if (arguments.length > 1) {
				$.merge(resources, arguments[1]);
			}

			if (oModel.resources.length > 0) {
				oModel.resources = [];
			}
			for ( var i = 0; i < resources.length; i++) {
				oModel.resources.push(resources[i]);
			}

			var result = _fillDropdownBox(resources, dropdownBox, invalidMessage);
			if (result.isValid === true) {
				dropdownBox.fireChange({
					"selectedItem" : dropdownBox.getItems()[0]
				});
			}
			wizard.fireValidation(result);
		}).fail(function (oError) {
			var oResult = {
				isValid : false,
				message : oError.message || oError
			};
			wizard.fireValidation(oResult);
		}).done();

	};

	var _updateModelWithSelectedResource = function(model, selectedResource, selectedExtensionID) {
		if (model.fiori === undefined) {
			model.fiori = {};
		}

		if (model.fiori.extensionCommon === undefined) {
			model.fiori.extensionCommon = {};
		}

		//Set the selected view document in a component viewDocument
		model.fiori.extensionCommon.resourceName = selectedResource.name;
		model.fiori.extensionCommon.selectedDocumentPath = selectedResource.path;

		model.fiori.extensionCommon.resourceId = selectedResource.id;
		var extensionResourceLocationPath = model.extensionResourceLocationPath;

		model.fiori.extensionCommon.resourceLocationPath = extensionResourceLocationPath + selectedResource.resourceLocationPath;

		if (selectedExtensionID !== undefined) {
			model.fiori.extensionCommon.extensionId = selectedExtensionID.name;
			if (selectedExtensionID.args) {
				model.fiori.extensionCommon.extensionArgs = selectedExtensionID.args;
			}
		}

	};

	var _fillDropdownBox = function(resources, dropdownBox, invalidMessage) {

		if (dropdownBox.getItems().length > 0) {
			dropdownBox.removeAllItems();
		}

		var oListItemModel;

		var index = 0;
		resources.forEach(function(resource) {
			var name = resource;
			if (resource.name !== undefined) {
				name = resource.name;
			}

			var listItem = new sap.ui.core.ListItem({
				text : name,
				key : index++,
				data : resource
			});

			oListItemModel = new sap.ui.model.json.JSONModel();
			oListItemModel.setData(resource);

			listItem.setModel(oListItemModel);
			dropdownBox.addItem(listItem);
		});

		var result = {
			isValid : false,
			message : invalidMessage
		};

		if (dropdownBox.getItems().length > 0) {
			result = {
				isValid : true
			};
		}

		return result;
	};

	return {
		updateModelWithSelectedResource : _updateModelWithSelectedResource,
		buildResourcesDropdownbox : _buildResourcesDropdownbox,
		fillDropdownBox : _fillDropdownBox
	};
});