define(["STF", "w5g/w5gTestUtils"], function (STF, w5gTestUtils) {
	"use strict";

	describe("Adapter controls metadata", function () {
		this.timeout(59000);
		var oWindow, oAdapter;

		beforeEach(function () {
			return w5gTestUtils.placeReadyWysiwygWithDefaultApp().then(function () {
				oWindow = w5gTestUtils.oScope.getWindow();
				oAdapter = oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.adapter;
			});
		});
		afterEach(function () {
			w5gTestUtils.cleanupWysiwyg();
		});

		function buildLibraryJson(oAdapterJs) {
			jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
			var aFilter = (sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.getAggregationFilter() || []).concat(["dependents"]),
				oData = {
					version: sap.ui.version,
					library: {}
				},
				oLibrary = oData.library;

			jQuery.each(oAdapterJs.designTimeMetadata, function (sClassName) {
				var oMetadata = jQuery.sap.getObject(sClassName).getMetadata();
				var sDefaultAggregation = oMetadata.getDefaultAggregationName();

				oLibrary[sClassName] = {
					properties: {},
					aggregations: {}
				};
				if (sDefaultAggregation) {
					oLibrary[sClassName].defaultAggregation = sDefaultAggregation;
				}

				if (oMetadata.isDeprecated()) {
					oLibrary[sClassName].deprecated = true;
				}

				var oCollection = oLibrary[sClassName].properties;
				jQuery.each(oMetadata.getAllProperties() || {}, testCollection);
				if (jQuery.isEmptyObject(oCollection)) {
					delete oLibrary[sClassName].properties;
				}

				oCollection = oLibrary[sClassName].aggregations;
				jQuery.each(oMetadata.getAllAggregations() || {}, testCollection);
				if (jQuery.isEmptyObject(oCollection)) {
					delete oLibrary[sClassName].aggregations;
				}

				function testCollection(sName, oMeta) {
					if (aFilter.indexOf(sName) !== -1) {
						return;
					}
					oCollection[sName] = oMeta.deprecated ? "deprecated" : "";
				}
			});
			return JSON.stringify(oData, null, 4);// >>> adapter / library.json
		}
		function whenBeingAddedToTheCanvas(oControl) {
			w5gTestUtils.oScope.getControl("Detail--page").addContent(oControl);
			w5gTestUtils.oScope.getCore().applyChanges();
		}

		it("Override sap.m.Column domRef correctly", function () {
			var col2 = new sap.m.Column({
				id: "amiram",
				header : new sap.m.Label({
					text : "B COL"
				}),
				minScreenWidth: "9999999px",
				demandPopin: true
			});

			var oTable = new sap.m.Table({
				columns : [
					new sap.m.Column({
						header : new sap.m.Label({
							text : "A COL"
						})
					}),
					col2
				]
			});

			var aData = [
				{a : "A1", b : "B1"}
			];

			oTable.setModel(new sap.ui.model.json.JSONModel(aData));
			oTable.bindItems("/", new sap.m.ColumnListItem({
				type : "Navigation",
				cells : [
					new sap.m.Label({text : "{a}"}),
					new sap.m.Label({text : "{b}"})
				]
			}));
			w5gTestUtils.placeAt("content", oTable);
			sap.ui.getCore().applyChanges();
			expect(oTable.getColumns()[0].isPopin()).to.be.false;
			expect(oTable.getColumns()[0].$().text()).to.be.equal("A COL");
			expect(oTable.getColumns()[1].isPopin()).to.be.true;
			expect(oTable.getColumns()[1].$().text()).to.be.equal("B COL");
			// Make the second column is no longer popin
			col2.setMinScreenWidth("1px");
			sap.ui.getCore().applyChanges();
			expect(oTable.getColumns()[1].isPopin()).to.be.false;
			expect(oTable.getColumns()[1].$().text()).to.be.equal("B COL");
		});

		it("Can build ui5 library test data", function () {
			assert.ok(buildLibraryJson.call(oWindow, oAdapter), "can build adapter/library.json");
		});

		/**
		 * This test helps to find ui5 changes in classes registered in adapter.js.
		 *
		 * This test can fail if:
		 *     new property or aggregation is added to ui5 control
		 *           in this case, we need to check if this property/aggregation affects our current implementation,
		 *           for example "responsive" property of "sap.m.ObjectHeader" affects controls rendering.
		 *           Please add definition for this property/aggregation to the adapter/library.json after checking it
		 *
		 *     "deprecated" attribute is changed for a property/attribute
		 *           in this case, we need to check if this change affects our current implementation.
		 *           Please update the adapter/library.json after checking it
		 *
		 *     adapter.js has registered control which does not exist in the current version
		 *
		 *     failed to read adapter/library.json file
		 *
		 *  NOTE: adapter/library.json build function is located at the end of this test.
		 */
		it.skip("Compatibility test", function () {
			oWindow.jQuery.sap.require("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils");
			var aFilter = (oWindow.sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Utils.getAggregationFilter() || []).concat(["dependents"]);

			function isEqualVersions(sLast, sCurrent) {
				if (sLast === sCurrent) {
					return true;
				}
				var aLast = sLast.split("."),
					aCurrent = sCurrent.split(".");

				return aLast[0] === aCurrent[0] && aLast[1] === aCurrent[1];
			}

			jQuery.ajax({
				async: false,
				url: w5gTestUtils.toFullURL("adapter/library.json")
			}).done(function(oData) {
				assert.ok(isEqualVersions(oData.version, oWindow.sap.ui.version), "please update adapter/library.json (new version)");

				jQuery.each(oAdapter.designTimeMetadata, function(sClassName) {
					var oClassData = oData.library[sClassName];
					assert.ok(!!oClassData, "please update adapter/library.json (new class: " + sClassName + ")");

					oWindow.jQuery.sap.require(sClassName);
					var oMetadata = oWindow.jQuery.sap.getObject(sClassName).getMetadata();
					var sDefaultAggregation = oMetadata.getDefaultAggregationName();
					var oCollection = oClassData.properties;

					jQuery.each(oMetadata.getAllProperties()||{}, testCollection);

					oCollection = oClassData.aggregations;
					jQuery.each(oMetadata.getAllAggregations()||{}, testCollection);
					assert.equal(oClassData.defaultAggregation||"", sDefaultAggregation||"", "please update adapter/library.json (default aggregation has been changed in " + sClassName + ")");

					function testCollection(sName, oMeta) {

						if (aFilter.indexOf(sName) !== -1) {
							return;
						}
						if (oCollection[sName] === undefined) {
							assert.ok(false, "please update adapter/library.json (new property/aggregation " + sName + " in " + sClassName + ")");
						} else {
							assert.equal(!!oCollection[sName], oMeta.deprecated, "please update adapter/library.json (deprecated flag has been changed for " + sName + " in " + sClassName + ")");
						}
					}
				});
			});
		});

		it("Test empty containers", function () {
			function getData(oInstance, sPropertyOrAggregation) {
				var oMetadata = oInstance.getMetadata(),
					oPropertyOrAggregation = oMetadata.getAllAggregations()[sPropertyOrAggregation];

				if (!oPropertyOrAggregation) {
					oPropertyOrAggregation = oMetadata.getAllProperties()[sPropertyOrAggregation];
				}

				if (!oPropertyOrAggregation) {
					assert.ok(false, "wrong test data: " + sPropertyOrAggregation);
				}

				var oResult = {
						sMutator: oPropertyOrAggregation._sMutator
					},
					mControlOptions = {
						text: "value"
					};

				switch (oPropertyOrAggregation.type) {
					case "sap.m.IBar": //sap.m.Bar, sap.m.Toolbar
						oResult.value = new oWindow.sap.m.Toolbar();
						break;
					case "sap.m.IconTab": //sap.m.IconTabFilter, sap.m.IconTabSeparator
						oResult.value = new oWindow.sap.m.IconTabFilter();
						break;
					case "sap.ui.core.URI":
						oResult.value = "sap-icon://doctor";
						break;
					case "sap.ui.core.Control":
						if (oInstance instanceof oWindow.sap.m.ObjectHeader) {
							oResult.value = new oWindow.sap.m.ObjectStatus(mControlOptions);
						} else if (oInstance instanceof oWindow.sap.m.TileContainer) {
							oResult.value = new oWindow.sap.m.StandardTile(mControlOptions);
						} else {
							oResult.value = new oWindow.sap.m.Label(mControlOptions);
						}
						break;
					case "int":
					case "float":
						oResult.value = 1;
						break;
					case "boolean":
						oResult.value = true;
						break;
					case "object":
						oResult.value = {};
						break;
					case "string":
						oResult.value = "value";
						break;
					default:
						//ui5 type
						var oTypeClass = oWindow.jQuery.sap.getObject(oPropertyOrAggregation.type);
						if (typeof oTypeClass === "function") { //control
							oResult.value = new oTypeClass(mControlOptions);
						} else { //interface
							//TODO: add new case if needed
							assert.ok(false, "not supported yet: " + oPropertyOrAggregation.type);
						}
						break;
				}
				return oResult;

			}
			function updateContainer(oInstance, sPropertyOrAggregations) {
				var oData;
				sPropertyOrAggregations.replace(/\s/g, "").split(/\+/).forEach(function(sPropertyOrAggregation) {
					oData = getData(oInstance, sPropertyOrAggregation);
					oInstance[oData.sMutator](oData.value);
					w5gTestUtils.oScope.getCore().applyChanges();
				});
			}
			function testEmptyContainer(sClassName, sPropertyOrAggregation, oSelectors) {
				var oInstance = new (oWindow.jQuery.sap.getObject(sClassName))();

				whenBeingAddedToTheCanvas(oInstance);
				assert.equal(oWindow.jQuery("[data-sap-ui-dt-for=" + oInstance.getId() + "]").length, 1, sClassName + " has an overlay");

				testContainer(sClassName, sPropertyOrAggregation, oSelectors, oInstance, true);

				//TODO: add D&D test

				updateContainer(oInstance, sPropertyOrAggregation);
				testContainer(sClassName, sPropertyOrAggregation, oSelectors, oInstance, false);

			}
			function testContainer(sClassName, sPropertyOrAggregation, oSelectors, oInstance, bEmpty) {
				var $elem = oInstance.$();
				jQuery.each(oSelectors, function(sAction, aSelector) {
					jQuery.each(aSelector, function(iIndex, sSelector) {
						//console.debug(sClassName + "->" + sPropertyOrAggregation + "::  " + (bEmpty ? "" : "!") + sAction + "(" + sSelector + ")");
						switch(sAction) {
							case "contains":
								assert.equal((!!$elem.find(sSelector).length), bEmpty, sClassName + "->" + sPropertyOrAggregation + " has empty container style");
								break;
							case "is":
								assert.equal($elem.is(sSelector), bEmpty, sClassName + "->" + sPropertyOrAggregation + " has empty container style");
								break;
							default:
								assert.ok(false, "wrong test data: " + sAction);
						}
					});
				});
			}

			jQuery.each(oAdapter.getEmptyContainersTestData(), function(sClassName, aCheckList) {
				jQuery.each(aCheckList, function(sPropertyOrAggregation, oSelectors) {
					testEmptyContainer(sClassName, sPropertyOrAggregation, oSelectors);
				});
			});
		});
	});
});
