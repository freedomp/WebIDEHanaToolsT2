define(["STF"] , function(STF) {

	"use strict";

	var suiteName = "ModelHelper_Integration", getService = STF.getServicePartial(suiteName);

	describe(suiteName, function () {
		var jQuery, oMetaModelContent, oModelHelper;

		function getMetaModelObj(content) {
			var oMetaModel = {};
			oMetaModel.content = content;
			oMetaModel.getObject = function(path) {
				var pathParts = path.split("/");
				var obj = oMetaModel.content;
				for(var i=0; i < pathParts.length; i++){
					if (pathParts[i]){
						obj = obj[pathParts[i]];
					}
				}
				return obj;
			};
			return oMetaModel;
		}

		function getEntitySet(name) {
			var entitySet={};
			entitySet.name = name;
			entitySet.parent = function(){
				var entitiesObj = {};
				entitiesObj.entities = [];
				return entitiesObj;
			};
			return entitySet;
		}

		function getPropertyObj(name,entityType){
			var property={};
			property.name = name;
			property.parent = function(){
				var entitiesObj = {};
				entitiesObj.elements = [];
				entitiesObj.entityType = entityType;
				return entitiesObj;
			};
			return property;
		}

		function getNavigationObj(name,entityType,multiplicity){
			var navigation={};
			navigation.name = name;
			navigation.multiplicity = multiplicity;
			navigation.parent = function(){
				var entitiesObj = {};
				entitiesObj.entityType = entityType;
				return entitiesObj;
			};
			return navigation;
		}

		function fullPath(sFileName) {
			return window.TMPL_LIBS_PREFIX +
				"/src/main/webapp/test-resources/sap/watt/sane-tests/template/voter1/service/Template/" +
				sFileName;
		}

		before(function () {
			return STF.startWebIde(suiteName, {config : "template/config.json"}).then(function (oWindow) {
				oModelHelper = getService('modelHelper');
				jQuery = oWindow.jQuery;

				return Q(jQuery.ajax({url: require.toUrl(fullPath("ODataMetaModel.json")), dataType: "json"}))
					.then(function (oMetaModelJSON) {
						oMetaModelContent = oMetaModelJSON;
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});


		it("test get binding context for entity type",function() {
			var oMetaModel = getMetaModelObj(oMetaModelContent);
			var sEntityTypeName = "Product";
			var expectedBinding = "/dataServices/schema/0/entityType/1";
			return oModelHelper.getBindingContext(sEntityTypeName,oMetaModel).then(function(res) {
				assert.ok(res === expectedBinding, "Model Helper failed to get binding context for entity type" + sEntityTypeName);
			});
		});

		it("test get binding context for entity set",function() {

			var oMetaModel = getMetaModelObj(oMetaModelContent);
			var sEntitySet = getEntitySet("ProductSet");
			var expectedBinding = "/dataServices/schema/0/entityContainer/0/entitySet/1";
			return oModelHelper.getBindingContext(sEntitySet,oMetaModel).then(function(res) {
				assert.ok(res === expectedBinding, "Model Helper failed to get binding context for entity set" + sEntitySet);
			});
		});

		it("test get binding context for Property",function() {
			var oMetaModel = getMetaModelObj(oMetaModelContent);
			var oProperty = getPropertyObj("ProductID","Product");
			var expectedBinding = "/dataServices/schema/0/entityType/1/property/0";
			return oModelHelper.getBindingContext(oProperty,oMetaModel).then(function(res) {
				assert.ok(res === expectedBinding, "Model Helper failed to get binding context for Property" + oProperty);
			});
		});

		it("test get binding context for Navigation",function() {
			var oMetaModel = getMetaModelObj(oMetaModelContent);
			var oNavigation = getNavigationObj("ToSalesOrderLineItems","Product","true");
			var expectedBinding = "/dataServices/schema/0/entityType/1/navigationProperty/0";
			return oModelHelper.getBindingContext(oNavigation,oMetaModel).then(function(res) {
				assert.ok(res === expectedBinding, "Model Helper failed to get binding context for Navigation" + oNavigation);
			});
		});
	});
});
