define([], function() {

	var sTargetUi5AmdContent = 
			'sap.ui.define([\n' +
			'	"sap/ui/Controller",\n' +
			'	"./util/amdUtil",\n' +
			'	"sap/watt/coretest/sane/util/amdUtil2",\n' +
			'	"./Component",\n' +
			'	"./amdControl",\n' +
			'	"./util/pureAmd",\n' +
			'	"./notFoundDep",\n' +
			'	"./amdErroredControl",\n' +			
			'	"./staticSapAmd"\n' +
			'	], function(Controller, depAmdUtil, depAmdUtil2, depAmdComponent, depAmdControl, depPureAmd, depStaticSapAmd) {\n' +
			'		"use strict";\n' +
			'\n' +
			'		return Controller.extend("sap.watt.coretest.sane.targetUI5Amd",{\n' +
			'\n' +			
			'			onInit: function() {\n' +
			'				this._depAmdUtil = new depAmdUtil("p1","p2");\n' +
			'				this._depAmdUtil2 = new depAmdUtil2("p1","p2");\n' +
			'				this._depAmdComponent = new depAmdComponent("p1","p2");\n' +
			'				this._depAmdControl = new depAmdControl();\n' +
			'				this._depPureAmd = new depPureAmd("p1","p2");\n' +
			'				this._depNotFound = new depNotFound("p1","p2");\n' +
			'				this._depAndErroredControl = new amdErroredControl("p1","p2");\n' +			
			'			},\n' +
			'\n' +			
			'			useDependencies: function() {\n' +
			'				this._depAmdUtil.utilMethod("mp1");\n' +
			'				this._depAmdUtil2.utilMethod("mp1");\n' +
			'				this._depAmdUtil.methodInConstructor(1);\n' +
			'				this._depAmdComponent.ComponentMethod("mp2");\n' +
			'				this._depAmdComponent.getComponentProperty();\n' +
			'				this._depAmdComponent.setComponentProperty("aStringProp");\n' +
			'				this._depAmdControl.ControlMethod();\n' +
			'				this._depAmdControl.getControlProperty();\n' +
			'				this._depAmdControl.getControlNewProperty("my test srting");\n' +			
			'				this._depAmdControl.setControlProperty("aStringProp");\n' +
			'				this._depAmdControl.attachTestChange();\n' +
			'				this._depAmdControl.getLabel2();\n' +
			'				this._depNotFound.methodNotFound();\n' +
			'				this._depAndErroredControl.controlMethod();\n ' +
			'				this._depPureAmd.f1();\n' +
			'				this._depPureAmd.f2();\n' +
			'				depStaticSapAmd.f113(p113);\n' +
			'\n' +				
			'			}\n' +
			'		});\n' +
			'\n' +		
			'	}\n' +
			'\n' +
			');\n' 
	;
	
	var sAmdUtil =
			'sap.ui.define(["sap/ui/base/Object"],function(Object){\n' +
			'\n' +	
			'	return Object.extend("sap.watt.coretest.sane.util.amdUtil",{\n' +
			'		constructor: function(p1,p2) {\n' +
			'			this._p1 = p1;\n' +
			'			this._p2 = p2;\n' +
			'			this.methodInConstructor = function(num1) {\n' +
			'				return this._p1 + num1;\n' +	
			'			};\n' + 
			'		},\n' +
			'\n' +		
			'		utilMethod: function(mp1) {\n' +
			'			return this._p1 + this._p2 + mp1;\n' +
			'		}\n' +
			'	});\n' +
			'});\n'
	;
	
	var sAmdUtil2 =
			'sap.ui.define([],function(){\n' +
			'\n' +	
			'	return Object.extend("sap.watt.coretest.sane.util.amdUtil2",{\n' +
			'		constructor: function(p1,p2) {\n' +
			'			this._p1 = p1;\n' +
			'			this._p2 = p2;\n' +
			'		},\n' +
			'\n' +		
			'		utilMethod: function(mp1) {\n' +
			'			return this._p1 + this._p2 + mp1;\n' +
			'		}\n' +
			'	});\n' +
			'});\n'
	;

	var sAmdComponent = 
			'sap.ui.define(["sap/ui/core/UIComponent"],function(UIComponent){\n' +
			'\n' +	
			'	return UIComponent.extend("sap.watt.coretest.sane.Component",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				"componentProperty" : "string"\n' +
			'			}\n' +
			'		},\n' +
			'\n' +		
			'		init: function() {\n' +
			'			// has no parameters\n' +
			'		},\n' +
			'\n' +		
			'		componentMethod: function(mp1) {\n' +
			'			return mp1;\n' +
			'		}\n' +
			'	});\n' +
			'});\n' 
	;
	
	var sAmdComponentWithSyntaxError = 
			'sap.ui.define(["sap/ui/core/UIComponent"],function(UIComponent){\n' +
			'\n' +	
			'	return UIComponent.extend("sap.watt.coretest.sane.Component",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				"componentProperty" : "string"\n' +
			'		},\n' +
			'\n' +		
			'		componentMethod: function(mp1) {\n' +
			'			return mp1;\n' +
			'		}\n' +
			'	});\n' +
			';\n' 
	;
	
	var sAmdComponentWithoutNamespace = 
			'sap.ui.define(["sap/ui/core/UIComponent"],function(UIComponent){\n' +
			'\n' +	
			'	return UIComponent.extend("",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				"componentProperty" : "string"\n' +
			'			}\n' +
			'		},\n' +
			'\n' +		
			'		init: function() {\n' +
			'			// has no parameters\n' +
			'		},\n' +
			'\n' +		
			'		componentMethod: function(mp1) {\n' +
			'			return mp1;\n' +
			'		}\n' +
			'	});\n' +
			'});\n' 
	;
	
	var sAmdComponentWithNamespaceDifferentThanProjectName = 
			'sap.ui.define(["sap/ui/core/UIComponent"],function(UIComponent){\n' +
			'\n' +	
			'	return UIComponent.extend("sap.watt.foo.bar.Component",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				"componentProperty" : "string"\n' +
			'			}\n' +
			'		},\n' +
			'\n' +		
			'		init: function() {\n' +
			'			// has no parameters\n' +
			'		},\n' +
			'\n' +		
			'		componentMethod: function(mp1) {\n' +
			'			return mp1;\n' +
			'		}\n' +
			'	});\n' +
			'});\n' 
	;
	
	var sAmdControl =
			'sap.ui.define(["sap/ui/core/Control"],function(Control){\n' +
			'\n' +	
			'	return Control.extend("sap.watt.coretest.sane.amdControl",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				controlProperty : "string",\n' +
			'				controlNewProperty : "string"\n' +			
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
			'		controlMethod: function(mp1) {\n' +
			'			return mp1;\n' +
			'		},\n' +
			'\n' +		
			'		getControlNewProperty: function(sTest) {\n' +
			'			return sTest;\n' +
			'		}\n' +
			'	});\n' +
			'});'
	;
	
	var sAmdErroredControl =
			'sap.ui.define("sap/ui/core/Control"],function(Control){\n' +
			'\n' +	
			'	return Control.extend("sap.watt.coretest.sane.amdControl",{\n' +
			'\n' +		
			'		metadata: {\n' +
			'			properties: {\n' +
			'				controlProperty : "string"\n' +
			'			}\n' +
			'		},\n' +
			'\n' +		
			'		controlMethod: function(mp1) {\n' +
			'			return mp1;\n' +
			'		}\n' +
			'});'
	;	
	
	var sPureAmd = 
			'define(function() {\n' +
			'\n' +
			'var MyModule = function(p1,p2) {\n' +
			'	 	this._a1 = p1;\n' +
			'	 	this._a2 = p2;\n' +	
			'};\n' +
			'\n' +
			'MyModule.prototype.f1 = function() {\n' +
			'	return this._a1;\n' +
			'};\n' +
			'\n' +
			'MyModule.prototype.f2 = function() {\n' +
			'	return " f2";\n' +
			'};\n' +
			'\n' +
			'return MyModule;\n' +
			'\n' +
			'});'	
	;
	
	var sStaticSAPAmd = 
			'sap.ui.define(function() {\n' +
			'return {\n' +
			'	 constructor : function(p1,p2) {\n' +
			'	 	this._a1 = p1;\n' +
			'	 	this._a2 = p2;\n' +
			'	 },\n' + 
			'	 f113 : function(p113) {\n' +
			'	 	return p113 + " f1";\n' +
			'	 },\n' + 
			'	 f123 : function(p123) {\n' +
			'	 	return p123 + " f2";\n' +
			'	 }\n' + 
			'};\n' +
			'});\n'	
	;		

	var oFileStructure =  {
		"sap.watt.coretest.sane": {
			webapp: {
				util: {
					"amdUtil.js": sAmdUtil,
					"amdUtil2.js": sAmdUtil2,
					"pureAmd.js": sPureAmd
				},
				"Component.js" : sAmdComponent,
				"amdControl.js": sAmdControl,
				"staticSapAmd.js": sStaticSAPAmd,
				"amdErroredControl.js": sAmdErroredControl,
				"targetUI5Amd.js": sTargetUi5AmdContent,
				"ComponentWithSyntaxError.js": sAmdComponentWithSyntaxError,
				"ComponentWithoutNamespace.js": sAmdComponentWithoutNamespace,
				"ComponentWithNamespaceDifferentThanProjectName.js": sAmdComponentWithNamespaceDifferentThanProjectName
				
			}
		}
	};

	return oFileStructure;

});