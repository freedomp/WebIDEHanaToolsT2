define(["STF", "sinon"] , function(STF) {

	"use strict";

	var suiteName = "Feedback_Integration",  getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var oFeedbackService, oFeedbackUI, oMockServer, iFrameWindow;
		var mockAnswerTxt = ["Answer 1","Answer 2", "Answer 3"];

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"})
				.then(function (oWindow) {
					iFrameWindow = oWindow;
					oFeedbackService = getService('feedback');

					// prepare mock server
					iFrameWindow.jQuery.sap.require("sap.ui.app.MockServer");
					oMockServer = new iFrameWindow.sap.ui.core.util.MockServer();
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
			oMockServer.stop();
			oMockServer.destroy();
		});

		it("Feedback service - getFeedbackUI", function () {
			return oFeedbackService.getFeedbackUI().then(function(oFeedback){
				oFeedbackUI = oFeedback;
				assert.ok(oFeedback, "Feedback form creation successed");

			});
		});

		it("Feedback service - sendFeedback ", function () {
			oMockServer.setRequests([{
				method: "POST",
				path: new iFrameWindow.RegExp(".*/feedback"),
				response: function (oXhr) {
					oXhr.respond( 200, {
						"Content-Type": "application/json"
					},'{}');
					validateResult(oXhr);
					//The senRequest is async, hence avoid close the mock before the response is received
				}
			}]);
			oMockServer.start();
			mockFeedbackView(oFeedbackUI);
			return oFeedbackUI.getController().sendFeedback().then(function(){
				assert.ok(true,"Feedback sent successfully");
			}).fail(function(){
				assert.ok(false,"Feedback sent unsuccessfully");
			});
		});

		var getBrowserProperties = function(){
			var sUserAgent = window.navigator.userAgent;
			var oBrowser = jQuery.browser;
			var mBrowserProp = {};

			if (sUserAgent.indexOf("MSIE") !== -1) {
				mBrowserProp.browser = "IE";
				mBrowserProp.version = "10 or below";
			} else if (sUserAgent.indexOf("Trident") !== -1 && sUserAgent.indexOf("MSIE") === -1){
				mBrowserProp.browser = "IE";
				mBrowserProp.version = "11 or above";
			} else {
				if(oBrowser.chrome){
					mBrowserProp.browser = "Chrome";
				} else if (oBrowser.safari) {
					mBrowserProp.browser = "Safari";
				} else if (oBrowser.mozilla) {
					mBrowserProp.browser = "Firefox";
				}
				mBrowserProp.version = oBrowser.fVersion.toString();
			}

			mBrowserProp.mobile = oBrowser.mobile.toString();

			return mBrowserProp;
		};

		var getContextAttributes = function(){
			var mBrowserProp = getBrowserProperties();

			var mContextAttributes = {
				attr1 : mBrowserProp.browser,
				attr2 : mBrowserProp.version,
				attr3 : mBrowserProp.mobile,
				attr4 : iFrameWindow.sap.ui.version,
				page : window.location.href
			};

			return mContextAttributes;
		};


		var mockFeedbackView = function(oFeedback){
			oFeedback._aTextAreas[0].setValue(mockAnswerTxt[0]);
			oFeedback._aTextAreas[1].setValue(mockAnswerTxt[1]);
			oFeedback._aTextAreas[2].setValue(mockAnswerTxt[2]);
			oFeedback._oSegmentedButton.fireSelect({
				selectedButtonId : oFeedback._oSegmentedButton.getButtons()[3].sId
			});

		};

		var validateResult = function(res){
			var mContextAttributes = getContextAttributes();
			var sContextAttributes = JSON.stringify(mContextAttributes);
			var sReqBody = res.requestBody;
			var oReqBody = JSON.parse(sReqBody);
			var oContext = oReqBody.context;
			delete oContext.attr5;
			var sContext = JSON.stringify(oContext);
			console.log("Resquest sent: " + sReqBody);
			assert.ok(oReqBody.texts.t1 === mockAnswerTxt[0] &&
				oReqBody.texts.t2 === mockAnswerTxt[1] &&
				oReqBody.texts.t3 === mockAnswerTxt[2] ,"Correct text values sent to feedback service");
			assert.ok(oReqBody.ratings.r1.value === 2,"Correct rating value sent to feedback service");
			assert.ok(sContext === sContextAttributes, "Correct context attributes sent to feedback service");
		};
	});
});
