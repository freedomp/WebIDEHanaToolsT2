define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "ModelBuilderValidator_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oModelBuilderService, oTextFieldModelParameter, oComboBoxModelParameter, oResourceBundle;
		var aComboBoxListItemOptionsStub = [];

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function () {
					oModelBuilderService = getService('templateCustomizationStep');
					oResourceBundle = oModelBuilderService.context.i18n;

					oTextFieldModelParameter = {
						type : "string",
						value : "",
						wizard :
						{
							control : "TextField",
							title : "View Name"
						}
					};

					oComboBoxModelParameter = {
						type : "Entity",
						multiplicity : "many",
						isRoot : true,
						binding : [{name:"Entity1"},{name:"Entity2"},{name:"Entity3"},{name:"Entity4"},{name:"Entity5"}],
						value : "",
						wizard :
						{
							control : "ComboBox",
							title : "List 1 Collection"
						}
					};

					var oItem1 = {
						getText : function() {
							return "Entity1";
						}
					};
					var oItem2 = {
						getText : function() {
							return "Entity2";
						}
					};
					var oItem3 = {
						getText : function() {
							return "Entity3";
						}
					};
					aComboBoxListItemOptionsStub = [oItem1, oItem2, oItem3]; //Filtered items

			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		it("Test required fields given values validation", function(){
			return oModelBuilderService.getContent().then(function(oModelBuilderStep) {
				var oModelBuilderStepContent = oModelBuilderStep.getStepContent();

				oTextFieldModelParameter.wizard.required = false;
				oComboBoxModelParameter.wizard.required = false;

				var oTextFieldRes1 = oModelBuilderStepContent
					.validateModelParameter("", oTextFieldModelParameter, oResourceBundle);
				assert.ok(oTextFieldRes1.isValid, "empty value should be valid for non-required text field");
				assert.ok(oTextFieldRes1.message === undefined, "no error message should be given for valid value");

				var oTextFieldRes2 = oModelBuilderStepContent
					.validateModelParameter(undefined, oTextFieldModelParameter, oResourceBundle);
				assert.ok(oTextFieldRes2.isValid, "undefined value should be valid for non-required text field");
				assert.ok(oTextFieldRes2.message === undefined, "no error message should be given for valid value");

				var oComboBoxRes1 = oModelBuilderStepContent
					.validateModelParameter("", oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(oComboBoxRes1.isValid, "empty value should be valid for non-required combo box");
				assert.ok(oComboBoxRes1.message === undefined, "no error message should be given for valid value");

				var oComboBoxRes2 = oModelBuilderStepContent
					.validateModelParameter(undefined, oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(oComboBoxRes2.isValid, "undefined value should be valid for non-required combo box");
				assert.ok(oComboBoxRes2.message === undefined, "no error message should be given for valid value");


				oTextFieldModelParameter.wizard.required = true;
				oComboBoxModelParameter.wizard.required = true;

				var oTextFieldRes3 = oModelBuilderStepContent
					.validateModelParameter("", oTextFieldModelParameter, oResourceBundle);
				assert.ok(!oTextFieldRes3.isValid, "empty value should be invalid for required text field");
				assert.ok(oTextFieldRes3.message !== undefined, "error message should be given for an invalid value");

				var oTextFieldRes4 = oModelBuilderStepContent
					.validateModelParameter(undefined, oTextFieldModelParameter, oResourceBundle);
				assert.ok(!oTextFieldRes4.isValid, "undefined value should be invalid for required text field");
				assert.ok(oTextFieldRes4.message !== undefined, "error message should be given for an invalid value");

				var oTextFieldRes5 = oModelBuilderStepContent
					.validateModelParameter("some value", oTextFieldModelParameter, oResourceBundle);
				assert.ok(oTextFieldRes5.isValid, "non-empty string value should be valid for required text field");
				assert.ok(oTextFieldRes5.message === undefined, "no error message should be given for valid value");

				var oComboBoxRes3 = oModelBuilderStepContent
					.validateModelParameter("", oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(!oComboBoxRes3.isValid, "empty value should be invalid for required combo box");
				assert.ok(oComboBoxRes3.message !== undefined, "error message should be given for an invalid value");

				var oComboBoxRes4 = oModelBuilderStepContent
					.validateModelParameter(undefined, oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(!oComboBoxRes4.isValid, "undefined value should be invalid for required combo box");
				assert.ok(oComboBoxRes4.message !== undefined, "error message should be given for an invalid value");

				oModelBuilderStepContent.destroyContent();
			});

		});

		it("Test valid and invalid options for combo-box validation", function(){
			return oModelBuilderService.getContent().then(function(oModelBuilderStep) {
				var oModelBuilderStepContent = oModelBuilderStep.getStepContent();

				var oComboBoxRes1 = oModelBuilderStepContent
					.validateModelParameter("Entity2", oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(oComboBoxRes1.isValid, "existing (after filtering) combo box option should be a valid value");
				assert.ok(oComboBoxRes1.message === undefined, "no error message should be given for valid value");

				var oComboBoxRes2 = oModelBuilderStepContent
					.validateModelParameter("Entity4", oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(!oComboBoxRes2.isValid, "non-existing combo box option (filtered out) should be an invalid value");
				assert.ok(oComboBoxRes2.message !== undefined, "error message should be given for invalid value");

				var oComboBoxRes3 = oModelBuilderStepContent
					.validateModelParameter("Entity7", oComboBoxModelParameter, oResourceBundle, aComboBoxListItemOptionsStub);
				assert.ok(!oComboBoxRes3.isValid, "non-existing combo box option (not in binding options) should be an invalid value");
				assert.ok(oComboBoxRes3.message !== undefined, "error message should be given for invalid value");

				oModelBuilderStepContent.destroyContent();
			});

		});

		it("Test regex for text field validation", function(){
			return oModelBuilderService.getContent().then(function(oModelBuilderStep) {
				var oModelBuilderStepContent = oModelBuilderStep.getStepContent();

				oTextFieldModelParameter.wizard.regExp = "^[a-zA-Z0-9\\.\\-_@]*[a-zA-Z0-9\\-_@]+$";
				oTextFieldModelParameter.wizard.regExpErrMsg =
						"The view name must start with an alphanumeric character. It can include digits, periods, dashes and underscores. The last character cannot be a period.";

				var oTextFieldRes1 = oModelBuilderStepContent
					.validateModelParameter("Valid1_value-3.name", oTextFieldModelParameter, oResourceBundle);
				assert.ok(oTextFieldRes1.isValid, "value should be valid for text field with the defined regular expression");
				assert.ok(oTextFieldRes1.message === undefined, "no error message should be given for valid value");

				var oTextFieldRes2 = oModelBuilderStepContent
					.validateModelParameter("Invalid1 value-3.name", oTextFieldModelParameter, oResourceBundle);
				assert.ok(!oTextFieldRes2.isValid, "value should be invalid for text field with the defined regular expression");
				assert.ok(oTextFieldRes2.message !== undefined, "error message should be given for invalid value");
				assert.ok((oTextFieldRes2.message.indexOf(oTextFieldModelParameter.wizard.regExpErrMsg) !== -1), "error message should include the regular expression error");

				var oTextFieldRes3 = oModelBuilderStepContent
					.validateModelParameter("Invalid1_value-3.name.", oTextFieldModelParameter, oResourceBundle);
				assert.ok(!oTextFieldRes3.isValid, "value should be invalid for text field with the defined regular expression");
				assert.ok(oTextFieldRes3.message !== undefined, "error message should be given for invalid value");
				assert.ok((oTextFieldRes3.message.indexOf(oTextFieldModelParameter.wizard.regExpErrMsg) !== -1), "error message should include the regular expression error");

				var oTextFieldRes4 = oModelBuilderStepContent
					.validateModelParameter("Invalid1_*&%value-3.name", oTextFieldModelParameter, oResourceBundle);
				assert.ok(!oTextFieldRes4.isValid, "value should be invalid for text field with the defined regular expression");
				assert.ok(oTextFieldRes4.message !== undefined, "error message should be given for invalid value");
				assert.ok((oTextFieldRes4.message.indexOf(oTextFieldModelParameter.wizard.regExpErrMsg) !== -1), "error message should include the regular expression error");

				oModelBuilderStepContent.destroyContent();
			});

		});

		it("Test unknown control validation", function(){
			return oModelBuilderService.getContent().then(function(oModelBuilderStep) {
				var oModelBuilderStepContent = oModelBuilderStep.getStepContent();

				var oUnknownControlModelParameter = {
					type : "string",
					value : "",
					wizard :
					{
						control : "MyOwnControl",
						required : true,
						title : "Unknown Parameter"
					}
				};

				var oRes1 = oModelBuilderStepContent
					.validateModelParameter("", oUnknownControlModelParameter, oResourceBundle);
				assert.ok(oRes1.isValid, "empty value should be valid for required unknown control field");
				assert.ok(oRes1.message === undefined, "no error message should be given for valid value");

				var oRes2 = oModelBuilderStepContent
					.validateModelParameter(undefined, oUnknownControlModelParameter, oResourceBundle);
				assert.ok(oRes2.isValid, "empty value should be valid for required unknown control field");
				assert.ok(oRes2.message === undefined, "no error message should be given for valid value");

				var oRes3 = oModelBuilderStepContent
					.validateModelParameter("some1 $%^& Value", oUnknownControlModelParameter, oResourceBundle);
				assert.ok(oRes3.isValid, "any value should be valid for unknown control field");
				assert.ok(oRes3.message === undefined, "no error message should be given for valid value");

				var oRes4 = oModelBuilderStepContent
					.validateModelParameter({text:"some1 $%^& Value"}, oUnknownControlModelParameter, oResourceBundle);
				assert.ok(oRes4.isValid, "any value should be valid for unknown control field");
				assert.ok(oRes4.message === undefined, "no error message should be given for valid value");

				var oRes5 = oModelBuilderStepContent
					.validateModelParameter({}, oUnknownControlModelParameter, oResourceBundle);
				assert.ok(oRes5.isValid, "empty object value should be valid for required unknown control field");
				assert.ok(oRes5.message === undefined, "no error message should be given for valid value");

				oModelBuilderStepContent.destroyContent();
			});

		});

	});
});
