define([], function() {

	var sAmdControl =
			'sap.ui.define(["sap/ui/core/Control", "sap/m/Label"],function(Control, Label){\n' +
			'\n' +	
			'	return Control.extend("sap.watt.coretest.sane.amdControl",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				property1 : { type : "string", defaultValue : ""},\n' +
			'				property2 : { type : "string", defaultValue : ""}\n' +
			'			},\n' +
			'			aggregations : {\n' +
			'				_label1 : {type : "sap.ui.commons.Label", multiple: false, visibility : "hidden"},\n' +
			'				label2 : {type : "sap.ui.commons.Label", multiple: true, visibility : "public"}\n' +
			'			},\n' +
			'			events : {\n' +
			'				testChange : { parameters : {value : {type : "string"}}} \n' +
			'			},\n' +
			'			associations : {\n' +
			'				testAssoc : {type : "sap.ui.core.Control", multiple : false}, \n' +
			'				testAssocMulti : {type : "sap.ui.core.Control", multiple : true},\n' +
			'				testAssocPublicSingularNames : {type : "Name", multiple : true, visibility : "public", singularName:"testAssocPublicSingularName"},\n' +
			'				testAssocBindable : {type : "sap.ui.commons.Label", multiple : false, bindable: true}\n' +
			'			}\n' +			
			'		},\n' +
			'\n' +
			'		init : function () {\n' +
			'			this._myPrivateValue = null;\n' +
			'			this.setAggregation("_label1", new Label({ text: "testLabel"	}));\n' +
			'			\n' +			
			'		},\n' +
			'\n' +
			'		controlMethod: function(sValue1) {\n' +
			'			var oTest = {key: "myName1", value:""};\n' +
			'			var oNewTest = {};\n' +
			'			oNewTest.key = oTest.key;\n' +
			'			var sTest2 = this._sTestTestTest;\n' +
			'			this._sValue = "test string";\n' +
			'			oTest.key = "sNewValue1";\n' +
			'			return true;\n' +
			'		},\n' +
			'\n' +
			'		renderer: function(oRM, oControl) {\n' +
			'			oRM.write("<div");\n' +
			'			oRM.writeControlData(oControl);\n' +
			'			oRM.write(">");\n' +			
			'			oRM.write("</div>");\n' +
			'		}\n' +			
			'	});\n' +
			'});'
	;
	
var sDeclareRequireControl =
			'jQuery.sap.declare("sap.watt.myControl");\n' +
			'sap.ui.core.Control.extend("sap.watt.myControl", {\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				property1 : { type : "string", defaultValue : ""},\n' +
			'				property2 : { type : "string", defaultValue : ""}\n' +
			'			},\n' +
			'			aggregations : {\n' +
			'				_label1 : {type : "sap.ui.commons.Label", multiple: false, visibility : "hidden"},\n' +
			'				label2 : {type : "sap.ui.commons.Label", multiple: true, visibility : "public"}\n' +
			'			},\n' +
			'			events : {\n' +
			'				testChange : { parameters : {value : {type : "string"}}} \n' +
			'			},\n' +
			'			associations : {\n' +
			'				testAssoc : {type : "sap.ui.core.Control", multiple : false}, \n' +
			'				testAssocMulti : {type : "sap.ui.core.Control", multiple : true},\n' +
			'				testAssocPublicSingularNames : {type : "Name", multiple : true, visibility : "public", singularName:"testAssocPublicSingularName"},\n' +
			'				testAssocBindable : {type : "sap.ui.commons.Label", multiple : false, bindable: true}\n' +
			'			}\n' +			
			'		},\n' +
			'\n' +
			'		init : function () {\n' +
			'			this._myPrivateValue = null;\n' +
			'			this.setAggregation("_label1", new Label({ text: "testLabel"	}));\n' +
			'			\n' +			
			'		},\n' +
			'\n' +
			'		controlMethod: function(sValue1) {\n' +
			'			var oTest = {key: "myName1", value:""};\n' +
			'			var oNewTest = {};\n' +
			'			oNewTest.key = oTest.key;\n' +
			'			var sTest2 = this._sTestTestTest;\n' +
			'			this._sValue = "test string";\n' +
			'			oTest.key = "sNewValue1";\n' +
			'			return true;\n' +
			'		},\n' +
			'\n' +
			'		renderer: function(oRM, oControl) {\n' +
			'			oRM.write("<div");\n' +
			'			oRM.writeControlData(oControl);\n' +
			'			oRM.write(">");\n' +			
			'			oRM.write("</div>");\n' +
			'		}\n' +			
			'});\n'
	;	
	
	

	var oFileStructure =  {
		"sap.watt.coretest.sane": {
			"amdControl.js": sAmdControl,
			"declareRequireControl.js": sDeclareRequireControl
		}
	};

	return oFileStructure;

});