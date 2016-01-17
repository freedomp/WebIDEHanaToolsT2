define([ "sap.watt.platform.commandgroup/module/ActionItem", "sap/watt/lib/lodash/lodash" ], function(ActionItem, _) {

	"use strict";

	return {
		getItemsByType : function(oContext, sType) {
			this.context = oContext;
			var that = this;

			return this.context.service.template.getTemplates(sType).then(function(mComponentTemplates) {
				return that.context.service.selection.getSelection().then(function(aSelection) {

					var aTemplates = _.values(mComponentTemplates);

					if (!sap.watt.getEnv("internal")) {
						aTemplates = _.filter(aTemplates, function(oTemplate) {
							return !oTemplate.getInternalOnly();
						});
					}

					aTemplates.sort(function(template1, template2) {
						//sort by order priority, the smaller priority comes first. undefined priority will
						//be listed last. equal priority will be sorted alphabetically
						var iTempOrder1 = template1.getOrderPriority();
						var iTempOrder2 = template2.getOrderPriority();
						if (iTempOrder1 === iTempOrder2){ //either undefine or equals
							return template1.getName().localeCompare(template2.getName());
						} else {
							if (!iTempOrder1 || !iTempOrder2){
								return (!iTempOrder1)?1:-1;
							}
							return  iTempOrder1-iTempOrder2;
						}
					});

					var sCommand;
					if(sType === "component"){
						sCommand = "template.createComponent";
					} else {
						sCommand = "template.createModule";
					}

					return that.context.service.command.getCommand(sCommand).then(function(oCommand) {
						var model = {};
						if (aSelection && aSelection.length === 1 && !aSelection[0].document.getEntity().isRoot()) {
							model.componentPath = aSelection[0].document.getEntity().getFullPath();
						}

						var aProjectTypesOfSelectedFolder = [];
						var aTemplatesToCallValidateOnSelection = [];
						var aTemplatesToCallCustomValidation = [];
						var aValidCandidateTemplates = [];
						if (!(aSelection && aSelection[0] && aSelection[0].document)) {
							return [];
						}

						return that.context.service.projectType.getProjectTypes(aSelection[0].document).then(function(aProjectTypes){
							_.forEach(aProjectTypes, function(oProjectTypeObject) {
								aProjectTypesOfSelectedFolder.push(oProjectTypeObject.id);
							});

							var aItems = [];
							_.forEach(aTemplates, function(oTemplate) {
								var aSupportedProjects = oTemplate.getSupportedProjectTypes();
								var bIsProjectTypesFit = that._isTemplateValid(aSupportedProjects, aProjectTypesOfSelectedFolder);
								if(bIsProjectTypesFit || !aSupportedProjects || aSupportedProjects.length === 0){
									aValidCandidateTemplates.push(oTemplate);
									aTemplatesToCallValidateOnSelection.push(oTemplate.validateOnSelection(model));
									aTemplatesToCallCustomValidation.push(oTemplate.customValidation(model));
								}
							});


							return  Q.allSettled(aTemplatesToCallValidateOnSelection).then(function (validateOnSelectionResults) {
								return  Q.allSettled(aTemplatesToCallCustomValidation).then(function (customvalidationResults) {
									_.forEach(aValidCandidateTemplates, function(oValidTemplate, index) {
										if(validateOnSelectionResults[index].state === "fulfilled" &&
											validateOnSelectionResults[index].value &&
											customvalidationResults[index].state === "fulfilled" &&
											customvalidationResults[index].value){
											if(aItems.length === 4){
												if(sType === "component"){
													that._createMoreComponentsActionItem(oCommand, aItems);
												} else {
													that._createMoreModulesActionItem(oCommand, aItems);
												}
												return false;
											}
											that._createAnActionItem(oCommand, oValidTemplate, aItems);
										}
									});
									return aItems;
								});
							});
						});
					});
				});
			});
		},

		_isTemplateValid : function(aSupportedProjects, aProjectTypesOfSelectedFolder) {
			var bTemplateProjectTypesMatch = false;
			_.forEach(aSupportedProjects, function(sSupportedProjectType) {
				if(_.indexOf(aProjectTypesOfSelectedFolder, sSupportedProjectType) > -1){
					bTemplateProjectTypesMatch = true;
					return false;
				}
			});
			return bTemplateProjectTypesMatch;
		},


		_createAnActionItem : function(oCommand, oTemplate, aActionItems) {
			var sId = oTemplate.getId();
			oCommand.setValue(oTemplate, sId);
			var oActionItem = new ActionItem({
				"id" : sId,
				"label" : oTemplate.getName()
			}, oCommand);
			aActionItems.push(oActionItem);
		},

		_createMoreComponentsActionItem : function(oCommand, aActionItems) {
			var sMore = this.context.i18n.getText("command_moreLabel");
			oCommand.setValue("more", "moreComponents");
			var oActionItem = new ActionItem({
				"id" : "moreComponents",
				"label" : sMore
			}, oCommand);
			aActionItems.push(oActionItem);
		},

		_createMoreModulesActionItem : function(oCommand, aActionItems) {
			var sMore = this.context.i18n.getText("command_moreLabel");
			oCommand.setValue("more", "moreModules");
			var oActionItem = new ActionItem({
				"id" : "moreModules",
				"label" : sMore
			}, oCommand);
			aActionItems.push(oActionItem);
		}
	};
});
