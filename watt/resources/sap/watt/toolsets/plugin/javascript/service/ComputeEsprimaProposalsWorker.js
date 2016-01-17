importScripts("../../../../lib/requirejs/require.js");

var Q;
var _mJSContentAssist;
var _mJSEsprimaVisitor;
//var _mIndexer;
var _mConstants;
var _libraries;
var _mTypes;
var _mLibContributors = [];

require.config({
	baseUrl: "../../../../../../",
	paths: {
		'esprimaPath': 'sap/watt/lib/orion/javascript/esprima',
		'core': 'sap/watt/core',
		'jscodecompletion': 'sap/watt/toolsets/plugin/javascript/service',
		'esprimaEditor': 'sap/watt/lib/orion/editor',
		'libjszip': 'sap/watt/lib/jszip'
	}
});

require([
        "core/q",
        "esprimaPath/esprimaJsContentAssist",
        "esprimaEditor/jsTemplateContentAssist",
        "esprimaPath/esprimaVisitor",
        // "esprimaPath/indexer",
        "jscodecompletion/Constants",
        "esprimaPath/typesFromIndexFile",
        "libjszip/jszip-shim"
        ], function(Q, mJSContentAssist, mJSTemplateAssist, mJSEsprimaVisitor, mConstants, mTypes) {
	self.Q = Q;
	self._mJSContentAssist = mJSContentAssist;
	// self._mJSTemplateAssist = mJSTemplateAssist;
	self._mJSTemplateAssistant = new mJSTemplateAssist.JSTemplateContentAssistProvider();
	self._mJSEsprimaVisitor = mJSEsprimaVisitor;
	//self._mIndexer = mIndexer;
	self._mConstants = mConstants;
	self._librariesRequested = [];
	self._librariesLoaded = [];
	self._mLibs = {};
	self._mTypes = mTypes;

	postMessage({
		workerState: self._mConstants.workerState.ready
	});
});

self.addEventListener("message", function(event) {
	if (!_isEventDataValid(event)) {
		_handleError("invalid event format");
		return;
	}

	if (!_isModuleDependenciesLoaded()) {
		return;
	}

	if (event.data.action === self._mConstants.workerAction.start) {
		postMessage({
			workerState: self._mConstants.workerState.ready
		});
	} else if (event.data.action === self._mConstants.workerAction.computeHintProposals) {

	    _createEnvironment(event);
		getAutoHintProposals(event.data.contentStatus, event.data.requestId).then(function(aHintProposals) {
			postMessage({
				workerState: self._mConstants.workerState.successComputeProposals,
				hintProposals: aHintProposals.proposals,
				requestId: aHintProposals.requestId
			});

		}).fail(function(error) {
			_handleError("computation failed with error: " + error);
		}).done();

	} else if (event.data.action === self._mConstants.workerAction.computeProposals) {

	    _createEnvironment(event);
		getCodeAssistProposals(event.data.contentStatus, event.data.requestId).then(function(aHintProposals) {
			postMessage({
				workerState: self._mConstants.workerState.successComputeProposals,
				hintProposals: aHintProposals.proposals,
				requestId: aHintProposals.requestId
			});

		}).fail(function(error) {
			_handleError("computation failed with error: " + error);
		}).done();
	        
		
	} else if( event.data.action === self._mConstants.workerAction.addLibrary ) {
        var action = event.data.action;
	    var id = _storeLibData(event.data);
	    
		postMessage({
			workerState: self._mConstants.workerState.libraryAdded,
			library : { id : id}
		});
	
	} else if (event.data.action === self._mConstants.workerAction.computeSummary ) {
		_createEnvironment(event);
		getSummaryFromMeta(event.data.contentStatus, event.data.contentStatus.metaSymbol).then(function(oSummary) {
			postMessage({
				workerState: self._mConstants.workerState.successComputeSummary,
				path: "...",
				summary: oSummary.summary,
				requestId: oSummary.requestId
			});

		}).fail(function(error) {
			_handleError("computation failed with error: " + error);
		}).done();

	} else {
		_handleError("unknown action");
	}
}, false);

function _parseClassName(sFullClassName, sContainerNamespace) {
    var sResult = "";
	if (!sFullClassName || !sContainerNamespace) {
		return sResult;
	}
    
	var aNames = sFullClassName.split(sContainerNamespace + ".");
    if (aNames && aNames[1]) {
    	var aSubNames =  aNames[1].split(".");
    	if (aSubNames && aSubNames[0]) {
        	sResult = aSubNames[0];
    	}
    }
	return sResult;
}

function _mergeLib(jsSapLibrary, aRootSubLibraries, sContainerNamespace) {
    var sName = "";
    var sNamespace = {};
    for (var j = 0; j < aRootSubLibraries.length; j++) {
        sNamespace = aRootSubLibraries[j];
        // Example under "sap": {"ca": "sap.ca"} (and not {"ca": "sap.ca.ui"})
        sName = _parseClassName(sNamespace, sContainerNamespace);
        if (sName && sName.length > 0) {
        	 jsSapLibrary[sName] = sContainerNamespace + "." + sName;
    	}
    }
}
/*
    Solve the problem that "sap" and "sap.ui" namespaces are defined in "sap.ui.core" and also in each library.
    We need to put each containted library in the parent library at "sap.ui.core" and delete the "sap" and 
    "sap.ui" namespaces from the other libraries.
*/
function _mergeRootLibrary(aLibData) {
    var sRootContainerLibraryName = "sap.ui.core";
    var sOldRootContainerLibraryName = "sap";
    var bIsOldVersion = false; // old version before dynamic UI where sap library existed in a seperate library and not inside ui.core library
    var iRootContainerLibraryIndex = -1;
    var jsIndex = {};
    var jsSapLibrary = {};
    var jsUILibrary = {};
    var aRootSubLibraries = [];
    var aRootUISubLibraries = [];
    
    for (var i = 0; aLibData.index && i < aLibData.index.length; i++) {
		jsIndex = aLibData.index[i];
        if (jsIndex["!name"] === sRootContainerLibraryName) {
            jsSapLibrary = jsIndex["!define"]["sap"];
            iRootContainerLibraryIndex = i;
            jsUILibrary = jsIndex["!define"]["sap.ui"];
        }
        else if (jsIndex["!name"] === sOldRootContainerLibraryName) {
            bIsOldVersion = true;
            break;
        }
        else {
            // collect the libriaries
             if (aLibData.index[i]["!define"]["sap"]) {
                aRootSubLibraries.push(jsIndex["!name"]);
                delete aLibData.index[i]["!define"]["sap"];
            }
            
            if (aLibData.index[i]["!define"]["sap.ui"]) {
                aRootUISubLibraries.push(jsIndex["!name"]);
                delete aLibData.index[i]["!define"]["sap.ui"];
            }
        }
    }
    if (bIsOldVersion === false && iRootContainerLibraryIndex >= 0) {
         aLibData.index[iRootContainerLibraryIndex]["sap"] = "sap"; // Must add this. In old versions before 1.30.0 it came from sap library.
    
        // Add JQuery to root options
        var oJQueryNamespace = aLibData.index[iRootContainerLibraryIndex]["!define"]["jQuery"];
        aLibData.index[iRootContainerLibraryIndex]["JQuery"] = oJQueryNamespace;
        aLibData.index[iRootContainerLibraryIndex]["!define"]["jQuery"] = "JQuery";
        
        _mergeLib(jsSapLibrary, aRootSubLibraries, "sap");
        _mergeLib(jsUILibrary, aRootUISubLibraries, "sap.ui");
        if (aLibData.index[iRootContainerLibraryIndex]["!define"]["sap"]["sap"]) {
            delete aLibData.index[iRootContainerLibraryIndex]["!define"]["sap"]["sap"];
        }
    }
}


function _storeLibData(oEventData) {
    var id = oEventData.id;
    var libData = _regIndexVersion(id);
    var c = 0;
    // var sTemplate = String.fromCharCode.apply(null, new Uint8Array(event.data.template));
    // var sIndex = String.fromCharCode.apply(null, new Uint8Array(event.data.index));
    for (var m in oEventData) {
        if ( oEventData.hasOwnProperty(m) && m.search("template") === 0 ) {
    	    var u8a =  new Uint8Array(oEventData[m]);
    	    var sTemplate = "";
    	    for(c = 0; c < u8a.length; c++) {
    	        sTemplate += String.fromCharCode(u8a[c]);
    	 	}
    	    var oTemplate = JSON.parse(sTemplate);
    	    libData.templates.push(oTemplate);
        }
        if ( oEventData.hasOwnProperty(m) && m.search("index") === 0 ) {
    	    u8a = new Uint8Array(oEventData[m]);
    	    var sIndex = "";
    	    for(c = 0; c < u8a.length; c++) {
    	        sIndex += String.fromCharCode(u8a[c]);
    	 	}
    	    var oLibIndex = JSON.parse(sIndex);
    	    libData.index.push(oLibIndex);   
        }
    }
    _mergeRootLibrary(libData);
    return id;    
}

function _createEnvironment(event) {
	if (!_isComputeProposalsEventDataValid(event) && event.data.action !== self._mConstants.workerAction.computeSummary ) {
		_handleError("invalid event format of computeProposals");
		return null;
	}

	self._libraries = event.data.libraries;
	// ####
	var libReqLen = self._libraries.length;
	self._librariesRequested.length = 0;
	for (var l = 0; l < libReqLen; l++) {
		self._librariesRequested.push(_libNameToId(self._libraries[l].name, self._libraries[l].version));
	}
	

}


function _isModuleDependenciesLoaded() {
	if (self._mJSContentAssist === undefined || self._mJSEsprimaVisitor === undefined || self.Q === undefined ||
		self._mConstants === undefined || self._mTypes === undefined) {
		return false;
	}
	return true;
}

function _isEventDataValid(event) {
	if (event === null || event.data === null || !event.data.hasOwnProperty("action")) {
		return false;
	}
	if (event.data.action === null) {
		return false;
	}
	return true;
}

function _isComputeProposalsEventDataValid(event) {
	if (!event.data.hasOwnProperty("contentStatus") || !event.data.hasOwnProperty("requestId") || !event.data.hasOwnProperty("libraries")) {
		return false;
	}
	if (event.data.contentStatus === null || event.data.requestId === null || event.data.libraries === null) {
		return false;
	}
	return true;
}

function _handleError(sError) {
	postMessage({
		workerState: self._mConstants.workerState.error
	});
}

function _librariesIdentical() {
	if (self._librariesRequested.length !== self._librariesLoaded.length) {
		return false;
	}
	for (var i = 0, len = self._librariesLoaded.length; i < len; i++) {
		if (self._librariesRequested.indexOf(self._librariesLoaded[i]) < 0 ) {
			return false;
		}
	}
	return true;
}

function _initLibrary() {
	if (!_librariesIdentical()) {
	    if ( self._librariesLoaded.length !== 0 ) {
		    self._mTypes.reset();
		    self._mJSTemplateAssistant.resetTemplateAndKeywords();
		    self._librariesLoaded.length = 0;
	    }
		// ###### Try to merge
		for (var iInd in self._mLibs) {
			if (self._mLibs.hasOwnProperty(iInd) && self._librariesRequested.indexOf(iInd) >= 0) {
			    // Upload indexes
				var _index = self._mLibs[iInd].index;
				var indLen = self._mLibs[iInd].index.length;
				for (var i = 0; i < indLen; i++) {
					self._mTypes.loadIndexInfo(_index[i], iInd.split(';', 1)[0]);
				}
				// Upload templates
				var _template = self._mLibs[iInd].templates;
				indLen = self._mLibs[iInd].templates.length;
				for (i = 0; i < indLen; i++) {
					self._mJSTemplateAssistant.addTemplates(_template[i].Templates);
				}
				self._librariesLoaded.push(iInd);				
			}
		}
	
	}
	
}


/*
function initLibraryIndex(libConfig) {
	if (!libConfig.libIndexFile || !libConfig.name || !libConfig.version) {
		return Q();
	}
	return initLibraryRes(libConfig.libIndexFile, libConfig.name, libConfig.version,
		"indexPackage", "indexFiles", loadIndex);
}

function initLibraryRes(uri, name, version, packageName, filesName, loadCallback) {
		return Q(loadPackage(name, version, packageName, uri, loadCallback));
}
*/

function _computeEsprimaProposals(oContentStatus, iRequestId) {
	var astRoot = self._mJSEsprimaVisitor.parse(oContentStatus.buffer);
	var jsContentAssist = new self._mJSContentAssist.EsprimaJavaScriptContentAssistProvider();
	return jsContentAssist.computeProplsalsFromAST(astRoot, oContentStatus.buffer, oContentStatus).then(function(aProposals) {
		if (!aProposals) {
			aProposals = [];
		}
		return Q({
			"proposals": aProposals,
			"requestId": iRequestId
		});
	});
}

function _computeSummaryFromMeta(sMetaNS, sMetaObj, iRequestId) {
	var jsContentAssist = new self._mJSContentAssist.EsprimaJavaScriptContentAssistProvider();
	return jsContentAssist.computeSummaryFromMeta(sMetaNS, sMetaObj, iRequestId).then(function(oSummary) {
		if (!oSummary) {
			oSummary = {};
		}
		return Q({
			"provided": oSummary.provided,
			"types": oSummary.types,
			"requestId": iRequestId
		});
	});
}

function _computeCrossFilesProposals(oContentStatus, iRequestId) {
	return _computeEsprimaProposals(oContentStatus, iRequestId).then(function(esprimaProposals) {
		return esprimaProposals;
	}).fail(function(error) {
		console.warn(error);
		// retry for the proposals only based on the current file
		return _computeEsprimaProposals(oContentStatus, iRequestId);
	});
}

function computeContextProposals(oContentStatus, iRequestId) {
	return _computeEsprimaProposals(oContentStatus, iRequestId);
}

function computeSnippetProposals(oContentStatus, iRequestId) {
    var aProposals = self._mJSTemplateAssistant.computeTemplateProposals(oContentStatus.buffer, oContentStatus.offset, oContentStatus);
    return  Q({
			"proposals": aProposals,
			"requestId": iRequestId
		});

}

function _getSnippetForMeta(sMetaSymbol, iRequestId) {
	var sTemplate = self._mJSTemplateAssistant.findTemplateFullyQualified(sMetaSymbol);
	return Q({
			"provides": sTemplate,
			"requestId": iRequestId
	});
}

function computeKeywordProposals(oContentStatus, iRequestId) {
	var aProposals = self._mJSTemplateAssistant.computeKeywordProposals(oContentStatus.buffer, oContentStatus.offset, oContentStatus);
	return Q({
			"proposals": aProposals,
			"requestId": iRequestId
		});
}
	
function getAutoHintProposals(oContentStatus, iRequestId) {
    _initLibrary();
    var aPropProm = [];
    
	if (oContentStatus.prefix || oContentStatus.buffer[oContentStatus.offset - 1] === '.') {
		aPropProm.push( computeContextProposals(oContentStatus, iRequestId) );
	} 
	aPropProm.push( computeKeywordProposals(oContentStatus, iRequestId));
	
	return Q.all(aPropProm).then(function(aPropSrc) {
	    var aProp = [];
	    for(var p = 0; p < aPropSrc.length; p++) {
	        aProp = aProp.concat(aPropSrc[p].proposals);
	    }
	    return Q({
			"proposals": aProp,
			"requestId": iRequestId
		});
	    
	});
}

function getCodeAssistProposals(oContentStatus, iRequestId) {
    var aPromises = [];

    _initLibrary();
    if (!oContentStatus.ignoreContextProposals) {
        aPromises.push(computeContextProposals(oContentStatus, iRequestId));    
    }
    if (!oContentStatus.ignoreSnippetProposals) {
       aPromises.push(computeSnippetProposals(oContentStatus, iRequestId));
    }
    if (!oContentStatus.ignoreKeywordProposals) {
        aPromises.push(computeKeywordProposals(oContentStatus, iRequestId));
    }
	
	return Q.all(aPromises).then(function(aPropSrc){
	    var aProp = [];
	    for(var p = 0; p < aPropSrc.length; p++) {
	        aProp = aProp.concat(aPropSrc[p].proposals);
	    }
	    return Q({
			"proposals": aProp,
			"requestId": iRequestId
		});
	});
	
}

function getSummaryFromMeta(oContentStatus, iRequestId) {
    var aPromises = [];

    _initLibrary();
    var aFullQualSymbolName = oContentStatus.metaSymbol.split("/");
    if ( aFullQualSymbolName.length > 1) {
    	var sMetaObject = aFullQualSymbolName.splice(aFullQualSymbolName.length - 1, 1)[0];
    	var sTargetNS = aFullQualSymbolName.join(".");
    } else {
    	return Q([]);
    }
   
    // aPromises.push(_getSnippetForMeta(sFullQualSymbolName, iRequestId));
    aPromises.push(_computeSummaryFromMeta(sTargetNS, sMetaObject, iRequestId));

	return Q.all(aPromises).then(function(aPropSrc){
	    var oProvided = {}, oTypes = {};
	    // Per source ( Index + template)
	    for(var ps = 0; ps < aPropSrc.length; ps++) {
	    	var psRes = aPropSrc[ps];
	    	oProvided = psRes.provided;
	    	oTypes = psRes.types;
	    }
	    return Q({
			"metaSymbol": oContentStatus.metaSymbol,
			"summary": { provided: oProvided, types: oTypes},
			"requestId": iRequestId
		});
	});
	
}


function _libNameToId(name, version) {
	return version ? name + ";" + version : name;
}

function _regIndexVersion(libId) {
	if ( !self._mLibs[libId] ) {
		self._mLibs[libId] = { index : [], templates : [] };
	}
	return self._mLibs[libId];
}

/*
function loadPackage(name, version, packageName, packageUri, parserCallback) {
	var d = new Q.defer();

	//    if ( self._mLibs[name] && self._mLibs[name].mVersion[version] && self._mLibs[name].mVersion[version].mPackage[packageName] ) {
	var oReglib = _regIndexVersion(_libNameToId(name, version), packageName);
	if (oReglib.bLoaded) {
		d.resolve();
	} else {

		var packageUrl = require.toUrl(packageUri);
		var request = new XMLHttpRequest();
		request.open("GET", packageUrl, true);
		request.responseType = "arraybuffer";
		request.onload = function(event) {
			if (this.readyState === 4 && this.status < 300) {
				try {
					var jsZip = new JSZip();
					jsZip.load(this.response);
					for (var fileName in jsZip.files) {
						var zipObject = jsZip.files[fileName];
						if (zipObject) {
							parserCallback(name, version, packageName, JSON.parse(zipObject.asText()));
						}
					}
					oReglib.bLoaded = true;
					d.resolve();
				} catch (e) {
					d.reject(e);
				}
			} else {
				d.reject(new Error(packageUri));
			}

		};
		request.onerror = function(error) {
			d.reject(error);
		};
		request.send(null);

	}

	return d.promise;
}
*/

/*
function loadFile(name, fileUri, parserCallback) {
	var d = new Q.defer();
	require([fileUri], function(content) {
		try {
			parserCallback(name, content);
			d.resolve();
		} catch (e) {
			d.reject(e);
		}
	});
	return d.promise;
}
*/

function loadIndex(name, version, packageName, indexInfo) {
	var oTypesLib = _regIndexVersion(_libNameToId(name, version), packageName);
	oTypesLib.aIndex.push(indexInfo);
	// ###### Load into singleton
	// self._mTypes.loadIndexInfo(indexInfo, name);

}

function _returnEmptyProposal(iRequestId) {
	var oEmptyValue = Q({
		"proposals": [],
		"requestId": iRequestId
	});
	return oEmptyValue;
}