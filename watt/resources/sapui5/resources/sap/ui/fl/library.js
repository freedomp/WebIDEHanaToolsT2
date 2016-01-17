/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/library","sap/ui/core/mvc/XMLView","sap/ui/core/mvc/View"],function(C,c,X,V){"use strict";sap.ui.getCore().initLibrary({name:"sap.ui.fl",version:"1.32.7",dependencies:["sap.ui.core"],noLibraryCSS:true});if(X.registerPreprocessor){X.registerPreprocessor('controls',"sap.ui.fl.Preprocessor",true);}else{V._sContentPreprocessor="sap.ui.fl.PreprocessorImpl";}return sap.ui.fl;},true);
