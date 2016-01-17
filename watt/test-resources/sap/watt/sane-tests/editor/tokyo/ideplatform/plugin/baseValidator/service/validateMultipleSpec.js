define(['STF'], function (STF) {
	"use strict";

	var sandbox;
	var suiteName = "service_basevalidator_validMultiple";
	var oBaseValidatorService, oDocumentService, oSettingProjectService, oBaseValidatorPrivateMethods;

	var MockDocument = function (sFullPath, sFileExtension, sContent, sProject) {
		this.sContent = sContent;
		this.extensionSeperator = '.';
		var oEntity = {
			sFileExtension: sFileExtension,
			sFullPath: sFullPath,
			getFullPath: function () {
				return sFullPath;
			},
			getFileExtension: function () {
				return sFileExtension;
			},
			getType: function () {
				return "file";
			}
		};
		this.getEntity = function () {
			return oEntity;
		};
		this.getContent = function () {
			return Q(this.sContent);
		};
		this.getProject = function () {
			return Q(this.sProject);
		};
	};

	var MockFolderDocument = function (aDocuments, sFullPath) {
		var oEntity = {
			getType: function () {
				return "folder";
			},
			getFullPath: function () {
				return sFullPath;
			}
		};
		this.getEntity = function () {
			return oEntity;
		};
		this.getFolderContent = function (bRecursive) {
			return Q(aDocuments);
		};

	};


	describe("basevalidatorTestConsumer", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oBaseValidatorService = serviceGetter("basevalidator");
					oDocumentService = serviceGetter("document");
					oSettingProjectService = serviceGetter("setting.project");
					return STF.getServicePrivateImpl(oBaseValidatorService).then(function (oImpl) {
						oBaseValidatorPrivateMethods = oImpl;
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		afterEach(function () {
			sandbox.restore();
		});


		it("validate with single file", function () {
			sandbox.stub(oSettingProjectService, "get").returns(Q());
			var oDoc = new MockDocument("/dev/aaa", "js", "content123", "dev");
			return oBaseValidatorPrivateMethods._sortDocumentsByValidator([oDoc]).then(function (aSortedArray) {
				expect(aSortedArray.jsValidator[0] === oDoc).to.be.true;
			});
		});

		it("validate with folder with two files", function() {
			sandbox.stub(oSettingProjectService, "get").returns(Q());
			var oDoc1 = new MockDocument("/dev/aaa", "js", "content123", "dev");
			var oDoc2 = new MockDocument("/dev/bbb", "js", "content456", "dev");
			var oFolderDocument = new MockFolderDocument([oDoc1, oDoc2]);
				return oBaseValidatorPrivateMethods._sortDocumentsByValidator([oFolderDocument]).then(function(aSortedArray){
					expect(aSortedArray.jsValidator[0] === oDoc1).to.be.true;
					expect(aSortedArray.jsValidator[1] === oDoc2).to.be.true;
				});
			});



		it("validate with root with one file and a folder with file", function() {
			sandbox.stub(oSettingProjectService, "get").returns(Q());
			var oDoc1 = new MockDocument("/aaa", "js", "content123", "dev");
			var oDoc2 = new MockDocument("/dev/bbb", "js", "content456", "dev");
			var oFolderDocument1 = new MockFolderDocument([oDoc2], "/dev");
			var oRoot = new MockFolderDocument([oDoc1, oFolderDocument1], "/");
				return oBaseValidatorPrivateMethods._sortDocumentsByValidator([oRoot]).then(function(aSortedArray){
					expect(aSortedArray.jsValidator[0] === oDoc1).to.be.true;
					expect(aSortedArray.jsValidator[1] === oDoc2).to.be.true;
				});
			});


		it("validate with multiple file types", function() {
			sandbox.stub(oSettingProjectService, "get").returns(Q());
			var oDoc1 = new MockDocument("/dev/aaa", "js", "content123", "dev");
			var oDoc2 = new MockDocument("/dev/aaa4", "xml", "content123", "dev");
			var oDoc3 = new MockDocument("/dev/aaa3", "txt", "content123", "dev");
				return oBaseValidatorPrivateMethods._sortDocumentsByValidator([oDoc1, oDoc2, oDoc3]).then(function(aSortedArray){
					expect(aSortedArray.jsValidator[0] === oDoc1).to.be.true;
					expect(aSortedArray.xmlValidator[0] === oDoc2).to.be.true;
				});

		});

		it("validate txt file", function() {
			sandbox.stub(oSettingProjectService, "get").returns(Q());
			var oDoc3 = new MockDocument("/dev/aaa3", "txt", "content123", "dev");
				return oBaseValidatorPrivateMethods._sortDocumentsByValidator([oDoc3]).then(function(oSortedValiadators){
					expect(_.isEmpty(oSortedValiadators)).to.be.true;
				});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});
