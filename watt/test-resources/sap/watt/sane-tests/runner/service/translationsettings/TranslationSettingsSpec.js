define(["STF", "sinon"], function (STF, sinon) {
    "use strict";

    var sandbox;
    var suiteName = "translationSettings";

    describe("Translation settings", function () {
        var oTranslationCfgService;
        var oDocumentService;
        var ofilesystem;
        var oContentService;
        var oContentServiceImpl;
        var oFakeFileDAO;
        var _oMockServer;
        var _oConfigService;
        var langsJSON = {
            "languages": {
                "af": "Afrikaans",
                "ar": "Arabic",
                "bg": "Bulgarian",
                "ca": "Catalan",
                "cs": "Czech",
                "da": "Danish",
                "de": "German",
                "el": "Greek",
                "en": "English",
                "es": "Spanish",
                "et": "Estonian",
                "fa": "Persian",
                "fi": "Finnish",
                "fr": "French",
                "he": "Hebrew",
                "hi": "Hindi",
                "hr": "Croatian",
                "hu": "Hungarian",
                "it": "Italian",
                "is": "Icelandic",
                "id": "Indonesian",
                "ja": "Japanese",
                "ko": "Korean",
                "kk": "Kazakh",
                "lt": "Lithuanian",
                "lv": "Latvian",
                "ms": "Malay",
                "nl": "Dutch",
                "no": "Norwegian",
                "pl": "Polish",
                "pt": "Portuguese",
                "ro": "Romanian",
                "ru": "Russian",
                "sk": "Slovak",
                "sl": "Slovenian",
                "sv": "Swedish",
                "sr": "Serbian",
                "th": "Thai",
                "tr": "Turkish",
                "uk": "Ukrainian",
                "vi": "Vietnamese",
                "zh_cn": "S Chinese",
                "zh_tw": "T Chinese",
                "zh": "Chinese"
            }
        };
        var langJSONContent = JSON.stringify(langsJSON);
        var domainsJSON = {
            "domains": [{"name": "ADL", "id": "AL"}, {
                "name": "AII",
                "id": "AI"
            }, {"name": "Accounting - General", "id": "AC"}, {
                "name": "Advanced Planner and Optimizer - APO",
                "id": "AP"
            }, {"name": "Application Platform", "id": "AE"}, {
                "name": "Bank Components",
                "id": "BA"
            }, {"name": "Basic Functions", "id": "CR"}, {"name": "Basis", "id": "BC"}, {
                "name": "Business ByDesign",
                "id": "1A"
            }, {
                "name": "Business ByDesign Business Configuration",
                "id": "1X"
            }, {
                "name": "Business ByDesign Customer Relationship Management",
                "id": "1C"
            }, {
                "name": "Business ByDesign Financial Accounting",
                "id": "1F"
            }, {"name": "Business ByDesign Human Capital Management", "id": "1H"}, {
                "name": "Business ByDesign Master Data",
                "id": "1M"
            }, {
                "name": "Business ByDesign Project Management",
                "id": "1P"
            }, {
                "name": "Business ByDesign Quality Management",
                "id": "1Q"
            }, {
                "name": "Business ByDesign Reporting and Analysis",
                "id": "1I"
            }, {
                "name": "Business ByDesign Supplier Relationship Management",
                "id": "1B"
            }, {"name": "Business ByDesign Supply Chain Management", "id": "1S"}, {
                "name": "Business Consolidation",
                "id": "SC"
            }, {"name": "Business Intelligence", "id": "BI"}, {"name": "Business One", "id": "BO"}, {
                "name": "CP Industry",
                "id": "CP"
            }, {"name": "Call Center and Business Communications Management", "id": "CC"}, {
                "name": "Campus Management",
                "id": "CM"
            }, {"name": "Contract Accounts Receivable", "id": "FC"}, {
                "name": "Controlling",
                "id": "CO"
            }, {"name": "Corporate Finance Management", "id": "CF"}, {
                "name": "Corporate Performance Monitor",
                "id": "SM"
            }, {"name": "Cross-Application Components", "id": "CA"}, {
                "name": "Customer Relationship Management",
                "id": "B2"
            }, {"name": "Customer Service", "id": "CS"}, {
                "name": "Defense Forces \u0026 Public Security",
                "id": "DF"
            }, {"name": "Dummy domain", "id": ".."}, {"name": "E-Business Accounting", "id": "E1"}, {
                "name": "E-Sourcing",
                "id": "ES"
            }, {"name": "EPM Starter Kits", "id": "SK"}, {
                "name": "Enterprise Buyer Professional Edition",
                "id": "B1"
            }, {"name": "Enterprise Controlling", "id": "EC"}, {
                "name": "Enterprise Information Management",
                "id": "BJ"
            }, {"name": "Enterprise Perfomance Management (was Analytics)", "id": "AN"}, {
                "name": "Enterprise Portal",
                "id": "EP"
            }, {"name": "Environment, Health and Safety", "id": "EH"}, {
                "name": "Event Management",
                "id": "EM"
            }, {"name": "Excise Duty", "id": "BV"}, {"name": "FS-PM", "id": "FP"}, {
                "name": "FS-RI",
                "id": "RI"
            }, {"name": "Financial Accounting", "id": "FI"}, {
                "name": "Financial Services",
                "id": "FS"
            }, {"name": "Financials", "id": "FN"}, {
                "name": "Financials Basis",
                "id": "FB"
            }, {"name": "German Capital Gains Tax", "id": "CY"}, {
                "name": "Governance Risk and Compliance",
                "id": "GR"
            }, {"name": "ICM", "id": "IC"}, {"name": "IS-B-BCA", "id": "BB"}, {
                "name": "IS-REA",
                "id": "IR"
            }, {"name": "Industry Solution for Oil", "id": "OI"}, {
                "name": "Industry Solution for Telecommunication",
                "id": "TE"
            }, {
                "name": "Industry Solution for Utilities",
                "id": "UT"
            }, {
                "name": "Industry-Specific Component Aerospace \u0026 Defense",
                "id": "AD"
            }, {
                "name": "Industry-Specific Component Automotive",
                "id": "AU"
            }, {
                "name": "Industry-Specific Component Clothes \u0026 Shoes",
                "id": "AF"
            }, {
                "name": "Industry-Specific Component Engineering \u0026 Construction",
                "id": "EN"
            }, {
                "name": "Industry-Specific Component High Tech",
                "id": "HT"
            }, {
                "name": "Industry-Specific Component Hospital",
                "id": "HC"
            }, {"name": "Industry-Specific Component Insurance", "id": "IN"}, {
                "name": "Industry-Specific Component Media",
                "id": "ME"
            }, {"name": "Investment Management", "id": "IM"}, {
                "name": "Joint Venture Accounting",
                "id": "JV"
            }, {"name": "Knowledge Management", "id": "KM"}, {
                "name": "Legal and Logistics Services",
                "id": "LL"
            }, {"name": "Logistics - General", "id": "LO"}, {"name": "Logistics Execution", "id": "LE"}, {
                "name": "MAX",
                "id": "MX"
            }, {
                "name": "Master Data Management",
                "id": "MD"
            }, {
                "name": "Master Data Management Global Data Synchronization Option",
                "id": "GD"
            }, {"name": "Materials Management", "id": "MM"}, {
                "name": "Media",
                "id": "B3"
            }, {"name": "Mobile Device Management", "id": "SY"}, {
                "name": "MySAP.com Marketplace",
                "id": "MP"
            }, {"name": "Overview", "id": "OV"}, {"name": "PLM", "id": "PL"}, {
                "name": "PSM",
                "id": "PU"
            }, {"name": "Payroll", "id": "PY"}, {"name": "Personnel Management", "id": "PA"}, {
                "name": "Plant Maintenance",
                "id": "PM"
            }, {"name": "Point of Sale", "id": "PO"}, {
                "name": "Production Planning and Control",
                "id": "PP"
            }, {"name": "Project System", "id": "PS"}, {
                "name": "Public Sector Contract Accounting",
                "id": "PC"
            }, {"name": "Quality Management", "id": "QM"}, {
                "name": "Real Estate Management",
                "id": "IS"
            }, {"name": "Real Estate Management (Obsolete; Now IS)", "id": "RE"}, {
                "name": "Recipe Management",
                "id": "RM"
            }, {"name": "SAP Business Information Warehouse", "id": "BW"}, {
                "name": "SAP Learning Solution",
                "id": "P1"
            }, {"name": "SAP Manufacturing Execution", "id": "MV"}, {
                "name": "SAP xApps",
                "id": "XA"
            }, {"name": "Sales and Distribution", "id": "SD"}, {
                "name": "Service",
                "id": "SV"
            }, {"name": "Strategic Enterprise Management", "id": "SE"}, {
                "name": "Supply Chain Management",
                "id": "SZ"
            }, {"name": "Time Management", "id": "PT"}, {
                "name": "Training and Event Management",
                "id": "PE"
            }, {"name": "Treasury", "id": "TR"}, {"name": "Various", "id": "XX"}, {
                "name": "mySAP All-in-One",
                "id": "BP"
            }, {"name": "mySAP.com Workplace", "id": "WP"}]
        };
        var domainsJSONContent = JSON.stringify(domainsJSON);
        var that = this;
        before(function () {
            var loadWebIdePromise = STF.startWebIde(suiteName, {
                config: "runner/service/translationsettings/config.json"
            });
            return loadWebIdePromise.then(function (windowObj) {
                sandbox = sinon.sandbox.create();
                oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
                oTranslationCfgService = STF.getService(suiteName, "languages");
                oDocumentService = STF.getService(suiteName, "document");
                ofilesystem = STF.getService(suiteName, "filesystem.documentProvider");
                oContentService = STF.getService(suiteName, "content");

                that._oConfigService = oTranslationCfgService;
                windowObj.jQuery.sap.require("sap.ui.app.MockServer");
                that._oMockServer = new windowObj.sap.ui.core.util.MockServer({
                    rootUri: "",
                    requests: [{
                        method: "GET",
                        path: new windowObj.RegExp(".*/languages.*"),
                        response: function (oXhr) {
                            oXhr.respond(200, {
                                "Content-Type": "application/octet-stream"
                            }, langJSONContent);
                        }
                    }, {
                        method: "GET",
                        path: new windowObj.RegExp(".*/domains.*"),
                        response: function (oXhr) {
                            oXhr.respond(200, {
                                "Content-Type": "application/json;charset=utf-8",
                                "Content-Encoding": "gzip"
                            }, domainsJSONContent);
                        }
                    }]
                });
                oFakeFileDAO.setContent({
                    "project1": {
                        ".project.json": JSON.stringify({
                            "translation": {
                                "translationDomain": "BA",
                                "supportedLanguages": "de,en,fr",
                                "defaultLanguage": "en",
                                "defaultI18NPropertyFile": "i18n.properties",
                                "resourceModelName": "i18n"
                            }
                        })
                    }
                });
                that._oMockServer.start();

            });
        });

        after(function () {
            STF.shutdownWebIde(suiteName);
        });

        afterEach(function () {
            sandbox.restore();
        });

        it("getProjectSettingContent layout testing", function () {
            return that._oConfigService.getProjectSettingContent("translationSettings", null,
                "/project1").then(function (oSimpleForm) {
                    assert.ok(oSimpleForm);
                    var aContent = oSimpleForm.getContent();
                    expect(aContent.length).to.equal(12);
                    assert.ok(oSimpleForm.getAggregation("form"));
                    expect(oSimpleForm.getLayout()).to.equal("ResponsiveGridLayout");
                    expect(oSimpleForm.getEditable()).to.equal(false);
                    expect(oSimpleForm.getMaxContainerCols()).to.equal(1);
                    var aContainers = oSimpleForm.getAggregation("form").getFormContainers();
                    expect(aContainers.length).to.equal(1);
                });
        });

        it("getProjectSettingContent model validating", function () {
            return that._oConfigService.getProjectSettingContent("translationSettings", null,
                "/project1").then(function (oSimpleForm) {

                    assert.ok(oSimpleForm.getModel());
                    var oModel = oSimpleForm.getModel();
                    assert.ok(oModel.getData());
                    assert.ok(oModel.getProperty("/oTrData/oSettings"));
                    var oSettings = oModel.getProperty("/oTrData/oSettings");
                    expect(oSettings.translationDomain).to.equal("BA");
                    expect(oSettings.supportedLanguages).to.equal("de,en,fr");
                    expect(oSettings.defaultLanguage).to.equal("en");
                    expect(oSettings.defaultI18NPropertyFile).to.equal("i18n.properties");
                    expect(oSettings.resourceModelName).to.equal("i18n");
                    assert.ok(oModel.getProperty("/oTrData/oDomain/name"));
                    var sDomainName = oModel.getProperty("/oTrData/oDomain/name");
                    expect(sDomainName).to.equal("Bank Components");
                    assert.ok(oModel.getProperty("/oTrData/oDefault/name"));
                    var sDefaultLang = oModel.getProperty("/oTrData/oDefault/name");
                    expect(sDefaultLang).to.equal("English");
                });
        });

        it("getProjectSettingContent testing - negative", function () {
            return that._oConfigService.getProjectSettingContent("translationSettings", null,
                "null").then(function (oSimpleForm) {
                    assert.ok(oSimpleForm.getModel());
                    var oModel = oSimpleForm.getModel();
                    assert.ok(oModel.getData());
                    assert.ok(oModel.getProperty("/oTrData/oSettings"));
                    var oSettings = oModel.getProperty("/oTrData/oSettings");
                    expect(oSettings.translationDomain).to.equal("");
                    expect(oSettings.supportedLanguages).to.equal("");
                    expect(oSettings.defaultLanguage).to.equal("");
                    expect(oSettings.defaultI18NPropertyFile).to.equal("");
                    expect(oSettings.resourceModelName).to.equal("");
                });
        });

        it("getProjectSettingContent testing - negative2", function () {
            return that._oConfigService.getProjectSettingContent("translationSettings", null,
                null).then(function (oSimpleForm) {
                    assert.ok(oSimpleForm.getModel());
                    var oModel = oSimpleForm.getModel();
                    assert.ok(oModel.getData());
                    assert.ok(oModel.getProperty("/oTrData/oSettings"));
                    var oSettings = oModel.getProperty("/oTrData/oSettings");
                    expect(oSettings.translationDomain).to.equal("");
                    expect(oSettings.translationDomain).to.equal("");
                    expect(oSettings.supportedLanguages).to.equal("");
                    expect(oSettings.defaultLanguage).to.equal("");
                    expect(oSettings.defaultI18NPropertyFile).to.equal("");
                    expect(oSettings.resourceModelName).to.equal("");
                });
        });

        it("saveProjectSetting testing", function () {
                return that._oConfigService.saveProjectSetting("translationSettings", null,
                    "/project1").then(function (oSettingsDocument) {
                        assert.ok(oSettingsDocument, "Success getting translation settings document");
                        oSettingsDocument.getContent().then(
                            function (sContent) {
                                assert(sContent === '{\n  "translation": {\n    "translationDomain": "",\n    "supportedLanguages": "",\n    "defaultLanguage": "",\n    "defaultI18NPropertyFile": "",\n    "resourceModelName": ""\n  }\n}');
                                assert.ok(oSettingsDocument.getEntity());
                                var oSettingDocEnt = oSettingsDocument.getEntity();
                                expect(oSettingDocEnt.getFullPath()).to.equal("/project1/.project.json");
                            });
                    });
            }
        );

        it("saveProjectSetting testing - negative", function () {
            return that._oConfigService.saveProjectSetting("translationSettings", null,
                "null").then(function (oSettingsDocument) {
                    expect(oSettingsDocument).to.equal(undefined);
                });
        });

        it("saveProjectSetting testing - negative2", function () {
            return that._oConfigService.saveProjectSetting("translationSettings", null,
                null).then(function (oSettingsDocument) {
                    expect(oSettingsDocument).to.equal(undefined);
                });
        });

    });
});