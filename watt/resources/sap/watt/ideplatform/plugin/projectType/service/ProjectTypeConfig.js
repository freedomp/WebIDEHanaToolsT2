define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"],
	function(AbstractConfig) {
		"use strict";
		return AbstractConfig.extend("sap.watt.ideplatform.projectType.service.ProjectTypeConfig", {

			_types: [],
			_dataModel: new sap.ui.model.json.JSONModel(),
			_oProjectTypeConfigForm : undefined, 

			init: function() {
				return this.context.service.resource.includeStyles([{
					"uri": "sap.watt.ideplatform.projectType/css/projectTypeStyles.css",
					"type": "css"
            }]);
			},

			saveProjectSetting: function(id, group, sProjectPath) {
				var aTypesIds = [];
				$.each(this._types, function(index, type) {
					if (type.exists) {
						aTypesIds.push(type.id);
					}
				});
				var that = this;
				if (!sProjectPath) {
					return;
				} else {
					return this._getDocumentByPath(sProjectPath)
						.then(function(oDocument) {
							return that.context.service.projectType.setProjectTypes(oDocument, aTypesIds)
								.then(function() {
									that.context.service.projectType.context.event.fireProjectTypeConfigSaved().done();
								});
						});
				}
			},

			getProjectSettingContent: function(id, group, sProjectPath) {
				var that = this;
				
				if (this._oProjectTypeConfigForm && this._oProjectTypeConfigForm.isActive()) {
					return this._oProjectTypeConfigForm;
				}
				
				return this._initAllTypes().then(function() {
					return that._getDocumentByPath(sProjectPath).then(function(oDocument) {
						return that.context.service.projectType.getProjectTypes(oDocument).then(function(aProjectTypes) {
							that._handleProjectTypes(aProjectTypes, oDocument);
							return that._getUI(aProjectTypes);
						});
					});
				});
			},

			_initAllTypes: function() {
				this._types = [];
				var that = this;
				return this.context.service.projectType.getAllTypes()
					.then(function(aAllTypeObjects) {
						var aPromises = [];
						$.each(aAllTypeObjects, function(index, type) {
							type.isBuiltIn = !!type.isBuiltIn;
							type.isDefault = !!type.isDefault;
							type.exists = false;
							type.isAvailable = true;
							// This code will be relevant when mixins type will be in scope
							if(type.bMixable === false){
								type.isAvailable = false;
							}
							type.enabled = true;
							that._types.push(type);
							if (type.service && type.service.isAvailable) {
								aPromises.push(type.service.isAvailable().then(function(bIsAvailable) {
									type.isAvailable = bIsAvailable;
									if (!bIsAvailable) {
										type.enabled = false;
									} else if (type.service.isEnabled) {
										return type.service.isEnabled().then(function(bIsEnabled) {
											type.enabled = bIsEnabled;
										});
									}
								}));
							} else if (type.service && type.service.isEnabled) {
								aPromises.push(type.service.isEnabled().then(function(bIsEnabled) {
									type.enabled = bIsEnabled;
								}));
							}
						});
						return Q.all(aPromises);
					});
			},
			
			_setTypeBuiltIn : function(typeId, bValue){
	
	            $.each(this._types, function(index, type){
	                if(type.id === typeId){
	                    type.isBuiltIn = bValue;
	                }
	            });
	        },

			_setTypeExists: function(typeId, bValue) {

				$.each(this._types, function(index, type) {
					if (type.id === typeId) {
						type.exists = bValue;
					}
				});
			},

			_updateModel: function() {
				this._dataModel.setData(this._types);
			},

			_getBindingContextPath: function(oBindingContext) {
				return oBindingContext.getPath();
			},
			
			_getModelObject: function(oModel, sPath) {
				return oModel.getObject(sPath);
			},
			
			_getChangeHandler: function() {
				var that = this;
				return function() {
					var sPath = that._getBindingContextPath(this.getBindingContext());
					var oType = that._getModelObject(this.getModel(), sPath);
					var bChecked = this.getChecked();
					that._setTypeExists(oType.id, bChecked);
					if (bChecked) {
						that.context.service.projectType.getIncludedTypes(oType.id)
							.then(function(aIncludedTypes) {
								$.each(aIncludedTypes, function(index, sTypeId) {
									that._setTypeExists(sTypeId, true);
								});
								that._updateModel();
							});
					} else {
						// Warn user about loosing project settings UI component configuration.
						return that._isUserConfirmConfigurationRemoval().then(function(oRet) {
							// If user didn't confirm the delete of configuration then select it again.
							if (!oRet.bResult) {
								that._setTypeExists(oType.id, true);
								that._updateModel();
							}

						});
					}
				};
			},						

			_handleProjectTypes: function(aProjectTypes) {
				var that = this;
				$.each(aProjectTypes, function(index, type) {
					var sId = type.id;
					that._setTypeExists(sId, true);
					if(type.isBuiltIn){
                    	that._setTypeBuiltIn(sId, true );
					}					
				});
				that._updateModel();
			},

			_setBaseTypeUIPart: function() {

				var oBaseTypeFormContainer = new sap.ui.layout.form.FormContainer({
					layoutData: new sap.ui.core.VariantLayoutData({
						multipleLayoutData: [new sap.ui.layout.GridData({
							span: "L4 M4 S4"
						})]
					})
				});

				var oDefaultTypeTitle = new sap.ui.core.Title({
					text: this.context.i18n.getText("i18n", "project_type_base_type_title")
				});
				oBaseTypeFormContainer.setTitle(oDefaultTypeTitle);

				var oRowTemplate = new sap.ui.commons.TextView({
					text: "{displayName}"

				});
				var oRowRepeater = new sap.ui.commons.RowRepeater({
					rows: {
						path: "/",
						template: oRowTemplate,
						filters: [new sap.ui.model.Filter("isBuiltIn", sap.ui.model.FilterOperator.EQ, true)]
					},
					design: sap.ui.commons.RowRepeaterDesign.Transparent
				}).addStyleClass("projectTypeConfigBaseTypeRowRepeater");
				oRowRepeater.setModel(this._dataModel);

				var oBaseTypeFormElement = new sap.ui.layout.form.FormElement();
				oBaseTypeFormElement.addField(oRowRepeater);
				oBaseTypeFormContainer.addFormElement(oBaseTypeFormElement);
				return oBaseTypeFormContainer;

			},

			_setAdditionTypesUIPart: function() {

				var that = this;

				var oAdditionalTypesFormContainer = new sap.ui.layout.form.FormContainer();
				//Set the title
				var oAdditionalTypesTitle = new sap.ui.core.Title({
					text: this.context.i18n.getText("i18n", "project_type_additional_types_title")
				});

				oAdditionalTypesFormContainer.setTitle(oAdditionalTypesTitle);

				//Set the description
				var oAdditionalProjectTypesDesc = new sap.ui.commons.TextView({
					text: this.context.i18n.getText("i18n", "project_type_config_description")
				});

				var oAdditionalTypeFormDescElement = new sap.ui.layout.form.FormElement();
				oAdditionalTypeFormDescElement.addField(oAdditionalProjectTypesDesc);
				oAdditionalTypesFormContainer.addFormElement(oAdditionalTypeFormDescElement);

				//create the additional project type table
				var oAdditionTypesTable = new sap.ui.table.Table({
					selectionMode: sap.ui.table.SelectionMode.None,
					visibleRowCount: that._types.filter(function(type) {
						return !type.isBuiltIn;
					}).length
				});

				// Column # 1 - checkbox
				oAdditionTypesTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: this.context.i18n.getText("i18n", "project_type_column_selected")
					}),
					template: new sap.ui.commons.CheckBox({
						change: this._getChangeHandler()
					}).bindProperty("checked", "exists").bindProperty("enabled", "enabled"),
					width: "100px"
				}));

				// Column # 2 - project type display name
				oAdditionTypesTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: this.context.i18n.getText("i18n", "project_type_column_project_type")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "displayName"),
					width: "200px"
				}));

				// Column # 3 - description
				oAdditionTypesTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: this.context.i18n.getText("i18n", "project_type_column_description")
					}),
					template: new sap.ui.commons.TextView().bindProperty("text", "description")

				}));

				oAdditionTypesTable.setModel(that._dataModel);
				//Workaround - filtering out the reusable libraries as this is internal feature
				var filters = [new sap.ui.model.Filter("isBuiltIn", sap.ui.model.FilterOperator.EQ, false),
			               new sap.ui.model.Filter("isAvailable", sap.ui.model.FilterOperator.EQ, true)];
				//oAdditionTypesTable.bindRows("/",undefined,undefined,[new sap.ui.model.Filter("isBuiltIn",sap.ui.model.FilterOperator.EQ,false)]);
				oAdditionTypesTable.bindRows("/", undefined, undefined, filters);
				var oAdditionalTypeFormTblElement = new sap.ui.layout.form.FormElement();
				oAdditionalTypeFormTblElement.addField(oAdditionTypesTable);
				oAdditionalTypesFormContainer.addFormElement(oAdditionalTypeFormTblElement);
				return oAdditionalTypesFormContainer;

			},

			_getUI: function() {
				var that = this;
				var oBaseContorlForm = that._setBaseTypeUIPart();
				//TODO remove when mixins type will be in scope
				if(sap.watt.getEnv("server_type") !== "xs2") {
					var oAdditionalForm = that._setAdditionTypesUIPart();
				}
				this._oProjectTypeConfigForm = new sap.ui.layout.form.Form({
					layout: new sap.ui.layout.form.GridLayout(),
					formContainers: [oBaseContorlForm, oAdditionalForm]
				}).addStyleClass("projectTypeConfigform");

				return this._oProjectTypeConfigForm;

			},

			_getDocumentByPath: function(sProjectPath) {
				return this.context.service.document.getDocumentByPath(sProjectPath);
			},
			
			_isUserConfirmConfigurationRemoval: function() {
				var confirmMessage = this.context.i18n.getText("i18n", "project_type_remove_project_type_confirm", []);
				var userNotificationService = this.context.service.usernotification;
				return userNotificationService.confirm(confirmMessage);			
			}						
		});
	});