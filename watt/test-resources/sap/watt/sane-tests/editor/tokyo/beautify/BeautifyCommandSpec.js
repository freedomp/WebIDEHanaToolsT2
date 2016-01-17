define(["STF", "sap/watt/ideplatform/plugin/beautify/command/BeautifyCommand"], function(STF,beautifierCommand ){

	var MockDocument = function(sFullPath, sFileExtension, sContent, sProject) {
		this.sContent = sContent;
		this.extensionSeperator = '.';
		var oEntity = {
			sFileExtension : sFileExtension,
			sFullPath : sFullPath,
			getFullPath : function() {
				return sFullPath;
			},
			getFileExtension : function() {
				return sFileExtension;
			}
		};

		this.getEntity = function() {
			return oEntity;
		};

		this.getContent = function() {
			return Q(this.sContent);
		};

		this.getProject = function() {
			return Q(this.sProject);
		};
	};
	var suiteName = "beautifierCommand_test";
	var oBeautifierProcessorService;
	var oCommandService;
	var oBeautifierProcessorServiceImpl;
	var oFakeSelectionService;


	describe('beautifierProcessor Command test ', function () {
		before(function () {
			return STF.startWebIde(suiteName, {config: "editor/tokyo/beautify/config.json"})
				.then(function(){
					oBeautifierProcessorService = STF.getService(suiteName, "beautifierProcessor");
					oCommandService = STF.getService(suiteName, "command");
					oFakeSelectionService = STF.getService(suiteName, "selection");
					return STF.getServicePrivateImpl(oBeautifierProcessorService)
						.then(function (oImpl) {
							oBeautifierProcessorServiceImpl = oImpl;
							return oFakeSelectionService.setSelectionAndOwner([], null);
						});
				});
		});

		function prepareCommand(oCommand, oDocument) {
			var aSelection = [{document : oDocument}];
			var fakeEditorOwner = {};
			fakeEditorOwner.instanceOf = function(){ return true;};
			fakeEditorOwner.getUI5Editor = function(){return {getCursorPosition : function(){}};};
			fakeEditorOwner.setDocValue = function(){return {getCursorPosition : function(){}};};
			return oFakeSelectionService.setSelectionAndOwner(aSelection, fakeEditorOwner).then(function() {
				oCommand.context = oBeautifierProcessorService.context;
				return oCommand;
			});
		}

		it("No beautifiers configured",  function() {
			var document = new MockDocument("aaa", "js1", "var a = 1;", null);
			return prepareCommand(beautifierCommand, document)
				.then(function(oCommand) {
					return Q.all([oCommand.isAvailable(), oCommand.isEnabled()])
						.spread(function (available, enabled){
							assert.isTrue(available);
							assert.isFalse(enabled);
						});
			});
		});

		it("Beautifier configured and a relevant document selected", function(){
			mConfig = {
				"beautifier" : [{
					"service": "sap.watt.common.service.dummy",
					"fileExtensions": ["js2", "xsjs2"],
					"name": "jsBeautifier2"
				}]
			};

			var document = new MockDocument("aaa", "js2", "var a = 1;", null);
			oBeautifierProcessorServiceImpl.configure(mConfig);
			return prepareCommand(beautifierCommand, document).then(function(oCommand) {
				return Q.all([oCommand.isAvailable(), oCommand.isEnabled()])
					.spread(function (available, enabled){
						assert.isTrue(available);
						assert.isTrue(enabled);
					});
			});
		});

		it("Beautifier configured and non relevant document selected", function(){
			mConfig = {
				"beautifier" : [{
					"service": "sap.watt.common.service.dummy",
					"fileExtensions": ["js3", "xsjs3"],
					"name": "jsBeautifier3"
				}]
			};

			var document = new MockDocument("aaa", "xml", "var a = 1;", null);
			oBeautifierProcessorServiceImpl.configure(mConfig);
			return prepareCommand(beautifierCommand, document).then(function(oCommand) {
				return Q.all([oCommand.isAvailable(), oCommand.isEnabled()])
					.spread(function (available, enabled){
						assert.isTrue(available);
						assert.isFalse(enabled);
					});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

	});


});
