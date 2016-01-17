define([], function() {

	var sTestModule0Content =
		"jQuery.sap.declare(\"sap.watt.coretest.sane.util.TestModule0\");" + "\n" +
		"sap.watt.coretest.sane.util.TestModule0 = {" + "\n" +
			"sProp1 : \"\"," + "\n" +
			"bProp2 : false," + "\n" +
			"getProp1 : function() {" + "\n" +
				"return sProp1" + "\n" +
			"}," + "\n" +
			"setProp2 : function(bProp2) {" + "\n" +
			"	this.bProp2 = bProp2;" + "\n" +
			"}" + "\n" +
		"};";

	var sTestModule1Content =
		"jQuery.sap.declare(\"sap.watt.coretest.sane.util.TestModule1\");" + "\n" +
		"sap.watt.coretest.sane.util.TestModule1 = {" + "\n" +
			"sProp1 : \"\"," + "\n" +
			"bProp2 : false," + "\n" +
			"getProp1 : function() {" + "\n" +
				"return sProp1" + "\n" +
			"}," + "\n" +
			"setProp2 : function(bProp2) {" + "\n" +
			"	this.bProp2 = bProp2;" + "\n" +
			"}" + "\n" +
		"};";

	var sTestModuleExtend = 
		"jQuery.sap.declare(\"sap.watt.coretest.sane.util.TestModuleExtend\");" + "\n" +
		'sap.ui.core.Component.extend("sap.watt.coretest.sane.util.TestModuleExtend", {' + "\n" +
		'	createContent: function() {' + "\n" +
		'	},' + "\n" +
		'/**'  + "\n" +
		'* documented method with 2 parameters'  + "\n" +
		'* @param {object} pObject'  + "\n" +
		'* @param {string} pString'  + "\n" +
		'*/'  + "\n" +
		'	documented: function(pObj, pStr) {' + "\n" +
		'	}' + "\n" +
		'});'
	;
	var sRefControlContent =
		"jQuery.sap.declare(\"sap.watt.coretest.sane.control.RefControl\");" + "\n" +
		"jQuery.sap.require(\"sap.ui.core.Control\");" + "\n" +

		"sap.ui.core.Control.extend(\"sap.watt.coretest.sane.control.RefControl\", {" + "\n" +

			"metadata : {" + "\n" +
				"properties : {" + "\n" +
					"stringProp : {" + "\n" +
						"type : \"string\"," + "\n" +
						"defaultValue : \"default\"" + "\n" +
					"}" + "\n" +
				"}," + "\n" +
				"events : {" + "\n" +
					"liveChange : {}" + "\n" +
				"}," + "\n" +
				"aggregations: {" + "\n" +
					"_button : {type : \"sap.ui.commons.Button\", multiple : false, visibility: \"hidden\"}," + "\n" +
					"coverPicture : {type : \"sap.ui.commons.Image\", multiple : false, visibility : \"public\"}," + "\n" +
					"color : {type : \"sap.ui.commons.Label\", multiple : false, bindable: true}," + "\n" +
					"name : {type : \"sap.ui.commons.TextField\", multiple : true}" + "\n" +
				"}," + "\n" +
				"associations: {" + "\n" +
					"relatedBooks : {type : \"Book\", multiple : false}," + "\n" +
					"relatedItems : {type : \"Item\", multiple : true,  singularName: \"relatedItem\"}," + "\n" +
					"relatedThings : {type : \"Thing\", multiple : false,  singularName: \"relatedThing\"} ," + "\n" +
					"relatedStudents : {type : \"Student\", multiple : true}" + "\n" +
				"}" + "\n" +
			"}," + "\n" +

			"calculateString: function(myStrArg) {" + "\n" +
				"return { val: \"myValue\", type: \"myType is \" + myStrArg };" + "\n" +
			"}" +

		"});";
		
	var sTestViewImpl = 
		"jQuery.sap.declare(\"sap.watt.coretest.sane.view.TestViewImpl\");" + "\n" +
		'sap.watt.coretest.sane.view.TestViewImpl = function(oView, fnOnClose) {' + "\n" +
		'	this._localVar = {};' + "\n" +
		'};' + "\n" +
		'sap.watt.coretest.sane.view.TestViewImpl.prototype.open = function(bExcludeTemporaryContacts) {' + "\n" +
		'	this._localVar.status = "open";' + "\n" +
		'};\n' ;
		
	var sTestContent =
		"jQuery.sap.declare(\"sap.watt.coretest.sane.Test\");" + "\n" +
		"jQuery.sap.require(\"sap.watt.coretest.sane.util.TestModule0\");" + "\n" +
		"jQuery.sap.require(\"sap.watt.coretest.sane.util.TestModule1\");" + "\n" +
		"jQuery.sap.require(\"sap.watt.coretest.sane.util.TestModuleExtend\");" + "\n" +
		"jQuery.sap.require(\"sap.watt.coretest.sane.control.RefControl\");" + "\n" +
		"jQuery.sap.require(\"sap.watt.coretest.sane.view.TestViewImpl\");" + "\n" +
		"jQuery.sap.require(\"sap.watt.coretest.sane.util.UnexistingModule\");" + "\n" +
		"var myUtil = sap.watt.coretest.sane.util.TestModule0;" + "\n" +
		"myUtil.setProp2(sValue);" + "\n" +
		"var myControl = new sap.watt.coretest.sane.control.RefControl(sId, mSettings);" + "\n" +
		"myControl.attachLiveChange();" + "\n" +
		"myControl.setStringProp();" + "\n" +
		"myControl.getStringProp();" + "\n" +
		"myControl.getCoverPicture();" + "\n" +
		"myControl.setRelatedBooks(relatedBooks);" + "\n" +
		"var myView = new sap.watt.coretest.sane.view.TestViewImpl(sId, mSettings);" + "\n" +
		"myView.open(true);" + "\n" + 
		"var myTestModuleExtend = new sap.watt.coretest.sane.util.TestModuleExtend()" + "\n" +
		"myTestModuleExtend.createContent();" + "\n" + 
		"myTestModuleExtend.documented({}, \"test\");";

	var oFileStructure =  {
		"sap.watt.coretest.sane": {
			util: {
				"TestModule0.js": sTestModule0Content,
				"TestModule1.js": sTestModule1Content,
				"TestModuleExtend.js": sTestModuleExtend
			},
			control: {
				"RefControl.js": sRefControlContent
			},
			view: {
				"TestViewImpl.js": sTestViewImpl
			},
			"test.js": sTestContent
		}
	};

	return oFileStructure;

});