define(["sap/watt/core/q"], function (coreQ) {

	"use strict";

	describe("Unit tests for DeploymentUtility class", function () {

		var oDeploymentUtility;
		var parser = new DOMParser();

		beforeEach(function () {
			return coreQ.sap.require("sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/utils/DeploymentUtility").then(function(DeploymentUtility) {
				oDeploymentUtility = DeploymentUtility;
			});
		});

		it("Tests getXmlBaseUrl method", function() {

			var appAtomFeedXmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
				"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
				"<atom:author/>" +
				"<atom:id>%2fTEST40P%2fMICHAL</atom:id>" +
				"<atom:link href=\"./%2fTEST40P%2fMICHAL/content\" rel=\"self\" type=\"application/atom+xml;type=feed\"/>" +
				"<atom:link href=\"../appindex/%2fTEST40P%2fMICHAL\" rel=\"appindex\"/>" +
				"<atom:title>/TEST40P/MICHAL</atom:title>" +
				"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\">" +
				"<atom:author/>" +
				"<atom:category term=\"file\"/>" +
				"<atom:content afr:etag=\"20150529221148\" type=\"application/octet-stream\" src=\"./%2fTEST40P%2fMICHAL%2f.project.json/content\" xmlns:afr=\"http://www.sap.com/adt/afr\"/>" +
				"<atom:contributor/>" +
				"<atom:id>%2fTEST40P%2fMICHAL%2f.project.json</atom:id>" +
				"<atom:link href=\"../appindex/%2fTEST40P%2fMICHAL\" rel=\"appindex\"/>" +
				"<atom:link href=\"./%2fTEST40P%2fMICHAL%2f.project.json\" rel=\"self\" type=\"application/atom+xml;type=entry\"/>" +
				"<atom:link href=\"http://ldciuia.wdf.sap.corp:50000/sap/bc/ui5_ui5/test40p/michal/.project.json?sap-client=000&amp;sap-ui-language=EN&amp;sap-ui-xx-devmode=true\" rel=\"execute\" type=\"application/http\"/>" +
				"<atom:summary type=\"text\"/>" +
				"<atom:title>/TEST40P/MICHAL/.project.json</atom:title>" +
				"</atom:entry>" +
				"</atom:feed>";

			var appAtomFeedXml = parser.parseFromString(appAtomFeedXmlString, "text/xml");

			var sXmlBaseUrl = oDeploymentUtility.getXmlBaseUrl(appAtomFeedXml);

			expect(sXmlBaseUrl).to.equal("/sap/bc/adt/filestore/ui5-bsp/objects/");
		});

		it("Tests getContentUrl method", function() {

			var appAtomFeedXmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
				"<atom:feed xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
				"<atom:author/>" +
				"<atom:id>%2fTEST40P%2fMICHAL</atom:id>" +
				"<atom:link href=\"./%2fTEST40P%2fMICHAL/content\" rel=\"self\" type=\"application/atom+xml;type=feed\"/>" +
				"<atom:link href=\"../appindex/%2fTEST40P%2fMICHAL\" rel=\"appindex\"/>" +
				"<atom:title>/TEST40P/MICHAL</atom:title>" +
				"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\">" +
				"<atom:author/>" +
				"<atom:category term=\"file\"/>" +
				"<atom:content afr:etag=\"20150529221148\" type=\"application/octet-stream\" src=\"./%2fTEST40P%2fMICHAL%2f.project.json/content\" xmlns:afr=\"http://www.sap.com/adt/afr\"/>" +
				"<atom:contributor/>" +
				"<atom:id>%2fTEST40P%2fMICHAL%2f.project.json</atom:id>" +
				"<atom:link href=\"../appindex/%2fTEST40P%2fMICHAL\" rel=\"appindex\"/>" +
				"<atom:link href=\"./%2fTEST40P%2fMICHAL%2f.project.json\" rel=\"self\" type=\"application/atom+xml;type=entry\"/>" +
				"<atom:link href=\"http://ldciuia.wdf.sap.corp:50000/sap/bc/ui5_ui5/test40p/michal/.project.json?sap-client=000&amp;sap-ui-language=EN&amp;sap-ui-xx-devmode=true\" rel=\"execute\" type=\"application/http\"/>" +
				"<atom:summary type=\"text\"/>" +
				"<atom:title>/TEST40P/MICHAL/.project.json</atom:title>" +
				"</atom:entry>" +
				"</atom:feed>";

			var appAtomFeedXml = parser.parseFromString(appAtomFeedXmlString, "text/xml");
			var sXmlBaseUrl = "/sap/bc/adt/filestore/ui5-bsp/objects/";

			var sContentUrl = oDeploymentUtility.getContentUrl(appAtomFeedXml, sXmlBaseUrl);

			expect(sContentUrl).to.equal("/sap/bc/adt/filestore/ui5-bsp/objects/%2FTEST40P%2FMICHAL%2F.project.json/content");
		});

		it("Tests getAppIndexUrl method", function() {

			var appAtomFeedXmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
				"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
				"<atom:author/>" +
				"<atom:category term=\"folder\"/>" +
				"<atom:content type=\"application/atom+xml;type=feed\" src=\"./michal4%2finnerfolder/content\"/>" +
				"<atom:contributor/>" +
				"<atom:id>michal4%2finnerfolder</atom:id>" +
				"<atom:link href=\"../appindex/michal4\" rel=\"appindex\"/>" +
				"<atom:link href=\"./michal4%2finnerfolder\" rel=\"self\" type=\"application/atom+xml;type=entry\"/>" +
				"<atom:summary type=\"text\"/>" +
				"<atom:title>michal4/innerfolder</atom:title>" +
				"</atom:entry>";

			var appAtomFeedXml = parser.parseFromString(appAtomFeedXmlString, "text/xml");
			var sXmlBaseUrl = "/sap/bc/adt/filestore/ui5-bsp/objects/";

			var sAppIndexUrl = oDeploymentUtility.getAppIndexUrl(appAtomFeedXml, sXmlBaseUrl);

			expect(sAppIndexUrl).to.equal("/sap/bc/adt/filestore/ui5-bsp/appindex/michal4");

			appAtomFeedXmlString = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
				"<atom:entry xml:base=\"/sap/bc/adt/filestore/ui5-bsp/objects/\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" +
				"<atom:author/>" +
				"<atom:category term=\"folder\"/>" +
				"<atom:content type=\"application/atom+xml;type=feed\" src=\"./ztest/content\"/>" +
				"<atom:contributor/>" +
				"<atom:id>ztest</atom:id>" +
				"<atom:link href=\"./ztest\" rel=\"self\" type=\"application/atom+xml;type=entry\"/>" +
				"<atom:summary type=\"text\">salesorder_opensap</atom:summary>" +
				"<atom:title>ztest</atom:title>" +
				"</atom:entry>";

			appAtomFeedXml = parser.parseFromString(appAtomFeedXmlString, "text/xml");

			sAppIndexUrl = oDeploymentUtility.getAppIndexUrl(appAtomFeedXml, sXmlBaseUrl);

			expect(sAppIndexUrl).to.equal(undefined);
		});

		afterEach(function () {
			oDeploymentUtility = undefined;
		});
	});
});
