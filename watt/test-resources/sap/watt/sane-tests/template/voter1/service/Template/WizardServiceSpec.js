define(["STF", "sinon"] , function(STF) {

	"use strict";

	var suiteName = "Wizard_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oWizardService, sap, WizardStepContent;

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function (oWindow) {
				oWizardService = getService('wizard');
				sap = oWindow.sap;
				return STF.require(suiteName, ["sap/watt/ideplatform/plugin/template/ui/wizard/WizardStepContent"])
					.then(function (oWizardStepContent) {
						WizardStepContent = oWizardStepContent;
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		it("Test create Wizard Step",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Title";
			var description = "Description";
			return oWizardService.createWizardStep(a, title, description).then(function(oWizardStep){
				assert.ok(oWizardStep, "wizard step should be returned");
				assert.ok(oWizardStep.getStepContent() === a, "success getting wizard step content");
				assert.ok(oWizardStep.getTitle() === title, "success getting wizard step title");
				assert.ok(oWizardStep.getDescription() === description, "success getting wizard step description");

				a.destroy();
				oWizardStep.destroy();
			});
		});

		it("Test create Wizard - basic",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Step Title";
			var description = "Step Description";
			return oWizardService.createWizardStep(a, title, description).then(function(oWizardStep){
				var sId = "WizardId";
				var sTitle = "Wizard Title";
				var sDescription = "Wizard Description";
				var sSummary = "Wizard Summary";
				var fnFinishHandler = function() {
					return Q(true);
				};
				return oWizardService.createWizard(sId, sTitle, sDescription, [oWizardStep], sSummary, fnFinishHandler).then(function(oWizard){
					assert.ok(oWizard, "wizard control should be returned");
					assert.ok(oWizard.getTitle() === sTitle, "success getting wizard title");
					assert.ok(oWizard.getDescription() === sDescription, "success getting wizard description");
					assert.ok(oWizard.getSummary() === sSummary, "success getting wizard summary");
					assert.ok(oWizard.getId() === sId, "success getting wizard id");
					assert.ok(oWizard.getModel(), "success getting wizard default model");
					assert.ok(oWizard.getModel().getData(), "success getting wizard default model data");

					a.destroy();
					oWizardStep.destroy();
					oWizard.destroy();
				});
			});
		});

		it("Test create Wizard - no id",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Step Title";
			var description = "Step Description";
			return oWizardService.createWizardStep(a, title, description).then(function(oWizardStep){
				var sTitle = "Wizard Title";
				var sDescription = "Wizard Description";
				var sSummary = "Wizard Summary";
				var fnFinishHandler = function() {
					return Q(true);
				};
				return oWizardService.createWizard(undefined, sTitle, sDescription, [oWizardStep], sSummary, fnFinishHandler).then(function(oWizard){
					assert.ok(oWizard, "wizard control should be returned");
					assert.ok(oWizard.getTitle() === sTitle, "success getting wizard title");
					assert.ok(oWizard.getDescription() === sDescription, "success getting wizard description");
					assert.ok(oWizard.getSummary() === sSummary, "success getting wizard summary");
					assert.ok(oWizard.getId(), "success getting wizard id when not passed to createWizard");
					assert.ok(oWizard.getModel(), "success getting wizard default model");
					assert.ok(oWizard.getModel().getData(), "success getting wizard default model data");

					a.destroy();
					oWizardStep.destroy();
					oWizard.destroy();
				});
			});
		});

		it("Test create Wizard - with optional parameters",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Step Title";
			var description = "Step Description";
			return oWizardService.createWizardStep(a, title, description).then(function(oWizardStep){
				var sId = "WizardId";
				var sTitle = "Wizard Title";
				var sDescription = "Wizard Description";
				var sSummary = "Wizard Summary";
				var fnFinishHandler = function() {
					return Q(true);
				};
				var fnAfterCloseHandler = function() {};
				var sExitMessage = "Wizard Exit Message";
				return oWizardService.createWizard(sId, sTitle, sDescription, [oWizardStep], sSummary, fnFinishHandler, fnAfterCloseHandler, sExitMessage).then(function(oWizard){
					assert.ok(oWizard, "wizard control should be returned");
					assert.ok(oWizard.getTitle() === sTitle, "success getting wizard title");
					assert.ok(oWizard.getDescription() === sDescription, "success getting wizard description");
					assert.ok(oWizard.getSummary() === sSummary, "success getting wizard summary");
					assert.ok(oWizard.getId() === sId, "success getting wizard id");
					assert.ok(oWizard.getExitMessage() === sExitMessage, "success getting wizard exit message");
					assert.ok(oWizard.getModel(), "success getting wizard default model");
					assert.ok(oWizard.getModel().getData(), "success getting wizard default model data");

					a.destroy();
					oWizardStep.destroy();
					oWizard.destroy();
				});
			});
		});


		it("Test create Wizard - with custom finish UI configurations",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Step Title";
			var description = "Step Description";
			return oWizardService.createWizardStep(a, title, description).then(function(oWizardStep){
				var sId = "WizardId";
				var sTitle = "Wizard Title";
				var sDescription = "Wizard Description";
				var sSummary = "Wizard Summary";
				var fnFinishHandler = function() {
					return Q(true);
				};
				var oCustomFinishStepContent = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent("customContent", {
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12",
						linebreak : true
					})
				});
				var mFinishSettings = {
					summaryText : sSummary,
					finishStepContent : oCustomFinishStepContent
				};
				return oWizardService.createWizard(sId, sTitle, sDescription, [oWizardStep], mFinishSettings, fnFinishHandler).then(function(oWizard){
					assert.ok(oWizard, "wizard control should be returned");
					assert.ok(oWizard.getTitle() === sTitle, "success getting wizard title");
					assert.ok(oWizard.getDescription() === sDescription, "success getting wizard description");
					assert.ok(oWizard.getSummary() === sSummary, "success getting wizard summary");
					assert.ok(oWizard.getId() === sId, "success getting wizard id");
					assert.ok(oWizard.getFinishStepContent() === oCustomFinishStepContent, "success getting wizard finish step content control");
					assert.ok(oWizard.getModel(), "success getting wizard default model");
					assert.ok(oWizard.getModel().getData(), "success getting wizard default model data");

					a.destroy();
					oWizardStep.destroy();
					oWizard.destroy();
				});
			});
		});

		it("Test create Wizard - with custom finish UI configurations (no summary text)",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Step Title";
			var description = "Step Description";
			return oWizardService.createWizardStep(a, title, description).then(function(oWizardStep){
				var sId = "WizardId";
				var sTitle = "Wizard Title";
				var sDescription = "Wizard Description";
				var fnFinishHandler = function() {
					return Q(true);
				};
				var oCustomFinishStepContent = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent("customContent", {
					layoutData : new sap.ui.layout.GridData({
						span : "L12 M12 S12",
						linebreak : true
					})
				});
				var mFinishSettings = {
					finishStepContent : oCustomFinishStepContent
				};
				return oWizardService.createWizard(sId, sTitle, sDescription, [oWizardStep], mFinishSettings, fnFinishHandler).then(function(oWizard){
					assert.ok(oWizard, "wizard control should be returned");
					assert.ok(oWizard.getTitle() === sTitle, "success getting wizard title");
					assert.ok(oWizard.getDescription() === sDescription, "success getting wizard description");
					assert.ok(oWizard.getSummary() === "", "success getting default wizard summary");
					assert.ok(oWizard.getId() === sId, "success getting wizard id");
					assert.ok(oWizard.getFinishStepContent() === oCustomFinishStepContent, "success getting wizard finish step content control");
					assert.ok(oWizard.getModel(), "success getting wizard default model");
					assert.ok(oWizard.getModel().getData(), "success getting wizard default model data");

					a.destroy();
					oWizardStep.destroy();
					oWizard.destroy();
				});
			});
		});

		it("Test get Wizard Step (deprecated)",function(){
			assert.ok(true);
			var a = new sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent();
			var title = "Title";
			var description = "Description";
			return oWizardService.getWizardStep(a, title, description).then(function(oWizardStep){
				assert.ok(oWizardStep, "wizard step should be returned");
				assert.ok(oWizardStep.getStepContent() === a, "success getting wizard step content");
				assert.ok(oWizardStep.getTitle() === title, "success getting wizard step content");
				assert.ok(oWizardStep.getDescription() === description, "success getting wizard step content");

				a.destroy();
				oWizardStep.destroy();
			});
		});

	});
});
