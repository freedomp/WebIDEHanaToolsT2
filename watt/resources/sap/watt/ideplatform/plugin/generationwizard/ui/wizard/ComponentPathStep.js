jQuery.sap.declare("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentPathStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.ideplatform.plugin.generationwizard.ui.wizard.ComponentPathStep",
		{

			metadata : {
				properties : {
					"selectedPath" : "string"
				}
			},

			emptyLocationPathErrorMsg : "The Location path cannot be empty",
			existingLocationPathErrorMsg : "The Location path must point to an existing folder",

			init : function() {

				var that = this;

				var componentPathLabel = new sap.ui.commons.TextView({
					text : "{i18n>compPathStep_location}",
					textAlign : "Left",
					layoutData : new sap.ui.layout.GridData({
						span : "L2 M2 S12"
					})
				}).addStyleClass("wizardBody");

				this.componentPathTextField = new sap.ui.commons.TextField({
					value : "{/componentPath}",
					width : "100%",
					liveChange : function(oEvent) {
						that._validatePathExist(oEvent).fail(/*No failure handling is needed here*/);
					},
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M8 S12"
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Textbox
				});

        		this.componentPathTextField.addDelegate({
        			onBeforeRendering : function() {
        				that.componentPathTextField.setValue(that.componentPathTextField.getLiveValue());
        			}
        		});

				var overrideComponentCheckBox = new sap.ui.commons.CheckBox("OverrideComponentCheckBox", {
					text : "{i18n>compPathStep_overwrite}",
					width : "100%",
					tooltip : "{i18n>compPathStep_overwriteTooltip}",
					checked : false,
					change : function() {
						that.getModel().oData.ovveride = this.getChecked();

						that.fireValueChange({
							id : "overwrite",
							value : that.getModel().oData.ovveride
						});
					},
					layoutData : new sap.ui.layout.GridData({
						span : "L5 M8 S12"
					}),
					accessibleRole : sap.ui.core.AccessibleRole.Checkbox
				}).addStyleClass("wizardCheckBox");

				var componentPathContent = new sap.ui.layout.Grid({
					layoutData : new sap.ui.layout.GridData({
						span : "L10 M12 S12",
						linebreak : true
					}),
					content : [ componentPathLabel, this.componentPathTextField ]
				});

				var overrideContent = new sap.ui.layout.Grid({
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12",
						linebreak : true
					}),
					content : [ overrideComponentCheckBox ]
				});

				this.addContent(componentPathContent);
				this.addContent(overrideContent);
			},

			setSelectedLocation : function(sSelected) {
				this.setProperty("selectedPath", sSelected, true);
				this.componentPathTextField.setValue(sSelected);
				// if user open new component with no group selection the default value is '/'
				if (sSelected !== "/") {
					this.fireValidation({
						isValid : true
					});
					this.fireValueChange({
						id : "componentPath",
						value : sSelected
					});
				}
			},

			setFocusOnFirstItem : function() {
				this.componentPathTextField.focus();
			},

			validateStepContent : function() {
				return this._validatePathExist();
			},

			_validatePathExist : function(oEvent) {

				var that = this;
				var oDeferred = Q.defer();
				var sComponentPath;
				if (oEvent !== undefined) {
					sComponentPath = oEvent.getParameter("liveValue").trim();
					oEvent.getSource().setValue(sComponentPath);
				} else {
					sComponentPath = this.componentPathTextField.getValue().trim();
				}

				// Validate destination path is not empty
				if (sComponentPath.length === 0) {
					oDeferred.reject(this.emptyLocationPathErrorMsg);
					this.markAsInvalid(this.componentPathTextField);
					this.fireValidation({
						isValid : false,
						message : this.emptyLocationPathErrorMsg
					});
				}

				// Validate the destination path begins with '/' and not the root folder
				else if (sComponentPath.charAt(0) !== "/" || sComponentPath === "/") {
					oDeferred.reject(this.existingLocationPathErrorMsg);
					this.markAsInvalid(this.componentPathTextField);
					this.fireValidation({
						isValid : false,
						message : this.existingLocationPathErrorMsg
					});
				}

				// Validate the destination path is a valid folder
				else {
				    this.getContext().service.filesystem.documentProvider.getDocument(sComponentPath).then(function(result) {
						if (result && result.getType() === "folder") {
							if (result.getTitle() === "") {
								oDeferred.reject(that.emptyLocationPathErrorMsg);
								that.markAsInvalid(that.componentPathTextField);
								that.fireValidation({
									isValid : false,
									message : that.emptyLocationPathErrorMsg
								});
							} else {
								oDeferred.resolve(true);
								// mark the control as valid if value was changed
								if (oEvent !== undefined) {
									that.markAsValid(that.componentPathTextField);
								}
								that.fireValidation({
									isValid : true
								});
								// fire value change event only if the new value is valid
								if (oEvent !== undefined) {
									that.fireValueChange({
										id : "componentPath",
										value : sComponentPath
									});
								}
							}
						} else {
							oDeferred.reject(that.existingLocationPathErrorMsg);
							that.markAsInvalid(that.componentPathTextField);
							that.fireValidation({
								isValid : false,
								message : that.existingLocationPathErrorMsg
							});
						}
					}).fail(function(sError) {
						// failed to locate the destination path
						oDeferred.reject(that.existingLocationPathErrorMsg);
						that.markAsInvalid(that.componentPathTextField);
						that.fireValidation({
							isValid : false,
							message : that.existingLocationPathErrorMsg
						});
					});
				}
				return oDeferred.promise;
			},


			renderer : {},

			onAfterRendering : function() {
				this.emptyLocationPathErrorMsg = this.getContext().i18n.getText("i18n", "compPathStep_emptylocationmsg");
				this.existingLocationPathErrorMsg = this.getContext().i18n.getText("i18n", "compPathStep_existinglocationmsg");
			}
		});
