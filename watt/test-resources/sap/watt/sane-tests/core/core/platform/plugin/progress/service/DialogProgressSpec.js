define(["STF"], function (STF) {
	"use strict";

	var suiteName = "DialogProgress_Service";
	var iFrameWindow = null;
	var oDialogProgress;
	var oDialogProgressServiceImpl;

	describe("Dialog Progress Service test", function() {
		var getService = STF.getServicePartial(suiteName);
		var sDialogId;
		var sDefaultMessage;

		before(function() {
			return STF.startWebIde(suiteName).then(function(webIdeWindowObj) {
				iFrameWindow = webIdeWindowObj;
				oDialogProgress = getService("dialogprogress");
				sDefaultMessage = oDialogProgress.context.i18n.getText("i18n","wait_message");

				return STF.getServicePrivateImpl(oDialogProgress).then(function(oDialogProgressServiceImplResult) {
					oDialogProgressServiceImpl = oDialogProgressServiceImplResult;
					sDialogId = oDialogProgressServiceImpl._getDialogId();
				});
			});
		});

		it("Tests _getDialog method", function () {
			expect(!iFrameWindow.$("#" + sDialogId).length).to.be.ok;
			oDialogProgressServiceImpl._getDialog();
			expect(iFrameWindow.$("#" + sDialogId).length).to.be.ok;
			expect(iFrameWindow.$("#" + sDialogId + "> progress").attr("value") === "0").to.be.ok;
			expect(iFrameWindow.$("#" + sDialogId + "> div").text() === sDefaultMessage).to.be.ok;

			oDialogProgressServiceImpl._getDialog(25);
			expect(iFrameWindow.$("#" + sDialogId + "> progress").attr("value") === "25").to.be.ok;
			iFrameWindow.$("#" + sDialogId).remove();
		});


		 it("Tests _isLoaded method", function () {
			 // Web IDE is loading (or simulate load)
			 if (!iFrameWindow.$("#loading")) {
				 iFrameWindow.$("<div/>").attr("id", "loading").appendTo("body");
			 }
			 expect(oDialogProgressServiceImpl._isLoaded()).to.not.be.ok;

			 iFrameWindow.$("#loading").hide();
			 expect(oDialogProgressServiceImpl._isLoaded()).to.be.ok;
		 });

		it("Updates progress", function () {
			return oDialogProgressServiceImpl.show().then(function () {
				expect(iFrameWindow.$("body").hasClass("screenBlocker")).to.be.ok;
				expect(iFrameWindow.$("#" + sDialogId).length).to.be.ok;
				expect(iFrameWindow.$("#" + sDialogId + "> progress").attr("value") === "0").to.be.ok;
				expect(iFrameWindow.$("#" + sDialogId + "> div").text() === sDefaultMessage).to.be.ok;
			}).then(function() {
				oDialogProgressServiceImpl.setProgress(50);
				expect(iFrameWindow.$("#" + sDialogId + "> progress").attr("value") === "50").to.be.ok;
				expect(iFrameWindow.$("#" + sDialogId + "> div").text() === sDefaultMessage).to.be.ok;
			}).then(function () {
				oDialogProgressServiceImpl.setProgress(75, "Loading ...");
				expect(iFrameWindow.$("#" + sDialogId + "> progress").attr("value") === "75").to.be.ok;
				expect(iFrameWindow.$("#" + sDialogId + "> div").text() === "Loading ...").to.be.ok;
			}).then(function () {
				oDialogProgressServiceImpl.hide();
				expect(iFrameWindow.$("#" + sDialogId).length).to.not.be.ok;
				expect(iFrameWindow.$("body").hasClass("screenBlocker")).to.not.be.ok;
			});
		});

		it("loading IDE", function () {
			iFrameWindow.$("#loading").css("display", "block");
			return oDialogProgressServiceImpl.show().then(function () {
				expect(iFrameWindow.$("body").hasClass("screenBlocker")).to.not.be.ok;
				expect(iFrameWindow.$("#" + sDialogId).length).to.not.be.ok;
				iFrameWindow.$("#loading").css("display", "none");
			});
		});

		function noOverlayTest() {
			expect(iFrameWindow.$("body").hasClass("screenBlocker")).to.be.ok;
			expect(iFrameWindow.$("#" + sDialogId).length).to.not.be.ok;

			oDialogProgressServiceImpl.setProgress(75);
			expect(iFrameWindow.$("#" + sDialogId).css("display") === "none").to.be.ok;

			oDialogProgressServiceImpl.hide();
			expect(iFrameWindow.$("#" + sDialogId).length).to.not.be.ok;
			expect(iFrameWindow.$("body").hasClass("screenBlocker")).to.not.be.ok;
		}

		it("With overlay 1", function () {
			return oDialogProgressServiceImpl.show(true).then(noOverlayTest);
		});

		it("With overlay 2", function () {
			return oDialogProgressServiceImpl.show("Loading...", true).then(noOverlayTest);
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});
	});
});
