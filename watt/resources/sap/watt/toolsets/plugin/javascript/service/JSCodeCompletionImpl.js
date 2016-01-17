define([
	"sap/watt/lib/orion/javascript/esprima/indexer",
	"sap/watt/lib/orion/javascript/esprima/esprimaJsContentAssist",
	"sap/watt/lib/orion/editor/jsTemplateContentAssist",
	"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
	"./watt/pluginProposalUtil",
	"./Constants",
	"sap/watt/lib/jszip/jszip-shim"

], function(mIndexer, mJSContentAssist, mJSTemplateAssist, mVisitor, mPluginProposalUtil, mConstants) {
	"use strict";

	var _librariesFromJsCoCo;
	var _libraries;
	var _workerPath = require.toUrl("sap.watt.toolsets.javascript/service/ComputeEsprimaProposalsWorker.js");
	var _worker = null;
	var _workerReadyPromise = null;
	var _oWordSuggestionQueue = new Q.sap.Queue();
	// MetadataSummary
	var _oSummaryQueue = new Q.sap.Queue();
	var _context;
	var _jsTemplateAssistant = new mJSTemplateAssist.JSTemplateContentAssistProvider();
	var _lastTemplateVersionLoaded = null;
	var _wsRequests = [];
	var _smRequests = [];
	var _mLibs = {};
	var _librariesLoaded = {};
	var _sProgressTaskId = null;

	var returnedJSCodeCompletionModule = function() {

		// Define api functions
		this.configure = configure;
		this.getWordSuggestions = getWordSuggestions;
		this.getSummaryFromMeta = getSummaryFromMeta;
		this.onAllPluginsStarted = onAllPluginsStarted;
		this.onDeleted = onDeleted;
		this.onSaved = onSaved;
		this.onTabClosed = onTabClosed;
		this.getCalculatedPrefix = getCalculatedPrefix;
	};

	function configure(mConfig) {
		if (!_librariesFromJsCoCo) {
			_librariesFromJsCoCo = mConfig.libraries;
		}
	}

	function _handleProposals(aHintProposals, iRequestId) {
		if (_worker.aPromise) {
			_worker.aPromise.resolve(aHintProposals);

			/*			if (iRequestId === _worker.oLastWorkerData.requestId) {
				_worker.aPromise.resolve(aHintProposals);
			} else {
				_worker.aPromise.resolve([]);
			}
*/
		}
	}

	function _isEventDataValid(event) {
		if (!!event && !!event.data && event.data.hasOwnProperty("workerState") && !!event.data.workerState) {
			return true;
		}
		return false;
	}

	/**
	 * WATT event callback: Starts Web Worker upon WebIDE startup upon all plugin started; attach callback function to worker's "message" event
	 * @public
	 * @function
	 */
	function onAllPluginsStarted() {
		console.log("...... starting WebWorker");
		_worker = new Worker(_workerPath);
		_workerReadyPromise = Q.defer();
		_worker.addEventListener("message", function(event) {
			
			// Release worker resource
			_worker.semaphore.leave();
			
			// Chack event validity
			if (!_isEventDataValid(event)) {
				_worker.aPromise.reject(new Error("Error: invalid event format!"));
				return;
			}

			// Remark: We will always get the ready state for the first request. This listener is created before the worker starts.
			if (event.data.workerState === mConstants.workerState.ready) {
				_worker._ready = true;
				//				    _worker.aPromise##### = [];
				_workerReadyPromise.resolve();
			} else if (event.data.workerState === mConstants.workerState.error) {
				_worker.aPromise.reject(new Error("Error in hint worker"));
			} else if (event.data.workerState === mConstants.workerState.successComputeProposals) {
				if (_worker.oLastWorkerData.contentStatus.prefix !== null) {
					_handleProposals(event.data.hintProposals, event.data.requestId);
				} else {
					_worker.aPromise.reject(new Error("Error: unknown event!"));
				}
			} else if (event.data.workerState === mConstants.workerState.libraryAdded) {
				_mLibs[event.data.library.id] = {};
				_worker.aPromiseLib[event.data.library.id].resolve();
				if (_sProgressTaskId) {
					_context.service.progress.stopTask(_sProgressTaskId).done();
					_context.service.usernotification.liteInfo( _context.i18n.getText("jscodecompletion_load_lib_ended",["user"])).done();
				}
			} else if ( event.data.workerState === mConstants.workerState.successComputeSummary ) {
				_worker.aPromise.resolve({ metaSymbol: event.data.metaSymbol, summary: event.data.summary});
			}

		});
		
		_worker.semaphore = {
			locked: undefined, // deferred object
			
			take: function() {
				if ( this.locked && this.locked.promise.isPending()) {
					return this.locked.promise;
				}
				this.locked = Q.defer();
				// TODO Timeout!!!!!!!!
				return Q();
			},
			
			leave: function() {
				if ( this.locked &&  this.locked.promise.isPending()) {
					this.locked.resolve();
				}
			}
		};

	}

	/* --------------------------------- Web Worker communication ------------------------------------------------------------ */
	function _initDataWorker(oContentStatus, indexer) {

		var oWorkerData = {
			contentStatus: oContentStatus
			//indexer: indexer
		};

		_worker.oLastWorkerData = oWorkerData;
	}

	function _pushLibraryToWorker(libId, abTemplate, abIndex) {
		var w = _worker;
		return _workerReady().then(function() {
			w.aPromiseLib[libId] = Q.defer();
			var msg = {
				action: mConstants.workerAction.addLibrary,
				id: libId
				//					template: abTemplate,
				//					index: abIndex
			};
			var f;
			var buffers = [];
			for (f = 0; f < abTemplate.length; f++) {
				var tName = "template_" + f;
				msg[tName] = abTemplate[f];
				buffers.push(msg[tName]);
			}
			for (f = 0; f < abIndex.length; f++) {
				var iName = "index_" + f;
				msg[iName] = abIndex[f];
				buffers.push(msg[iName]);
			}

			
			_worker.semaphore.take().then(function() {
				try {
					_worker.postMessage(msg, buffers);
				} catch (dataCloneError) {
					// IE fall back DataCloneError
					_worker.postMessage(msg);
				}
			}).done();
				

			return _worker.aPromiseLib[libId].promise;

		});
	}

	function _serializeContentStatus(oContentStatus) {
		return {
			selection: oContentStatus.selection,
			offset: oContentStatus.offset,
			buffer: oContentStatus.buffer,
			prefix: oContentStatus.prefix,
			caseSensitive: oContentStatus.caseSensitive,
			coords: oContentStatus.coords ? {
				pageX: oContentStatus.coords.pageX,
				pageY: oContentStatus.coords.pageY
			} : {},
			inferredOnly: oContentStatus.inferredOnly,
			bComment: oContentStatus.bComment,
			bSuffix: oContentStatus.bSuffix,
			ignoreContextProposals: oContentStatus.ignoreContextProposals,
			ignoreSnippetProposals: oContentStatus.ignoreSnippetProposals,
			ignoreKeywordProposals: oContentStatus.ignoreKeywordProposals,
			indentation: oContentStatus.indentation,
			isAutoHint: oContentStatus.isAutoHint,
			tab: oContentStatus.tab,
			targetFile: oContentStatus.targetFile
		};
	}

	function _workerReady() {
		if (_worker && _worker._ready) {
			return Q();
		} else {
			return _workerReadyPromise.promise;
		}
	}

	function _serializeLibInfo() {
		var aLibraries = [];
		for (var i in _libraries) {
			//			var lib = _libraries[i];
			//			var libContributor = lib.libIndexFile.split("/")[0];
			//			var libPath = require.toUrl(libContributor + ".");
			//			libPath = libPath.slice(0, libPath.length - 1);
			aLibraries.push({
				name: _libraries[i].name,
				version: _libraries[i].version
				//				libIndexFile: require.toUrl(_libraries[i].libIndexFile), // +"js" -->.zip
				//				libTemplate: require.toUrl(_libraries[i].libTemplate), // +"js" -->.zip
				//				help: _libraries[i].help,
				//				libContributorPath: {
				//					contributor: libContributor,
				//					path: libPath
				//				}
				//helpService: Because it is a call to a service we will handle it locally and not in the worker.
			});
		}
		return aLibraries;
	}

	function _runWorker(sAction, oDeferred, oContentStatus) {
		_worker.aPromise = oDeferred;
		_workerReady().then(function() {
			_initDataWorker(oContentStatus);
			var library = _serializeLibInfo();
			_worker.semaphore.take().then(function() {
				_worker.postMessage({
					action: sAction, //mConstants.workerAction.computeProposals,
					requestId: _worker.oLastWorkerData.requestId,
					contentStatus: _worker.oLastWorkerData.contentStatus,
					//indexer: _worker.oLastWorkerData.indexer,
					libraries: library
				});
				
			}).done();
		}).done();
		return _worker.aPromise.promise;
	}

	function _runEsprimaWorker(sAction, oContentStatus) {
		var oDeferred = Q.defer();
		var oFlatContentStatus = _serializeContentStatus(oContentStatus);
		return _runWorker(sAction, oDeferred, oFlatContentStatus);
	}

	/* ******************************************** Library management ************************************************************* */

	function _libraryLoaded(aLibConfig) {
		var i, j;

		for (j = 0; i < _librariesLoaded.length; i++) {
			if (aLibConfig.name === _librariesLoaded[j].name ||
				aLibConfig.version === _librariesLoaded[j].version) {
				return true;
			}
		}
		return false;
	}

	function _isDynamicLibrary(oLibConfig) {
		return (oLibConfig.remPath && oLibConfig.remPath.search('/sapui5') >= 0);
	}

	function _loadFromHCP(name, version, packageUri) {
		_context.service.progress.startTask("Libraried Loading", "Loading metadata is running in the background").then(function(sGeneratedTaskId){
			_sProgressTaskId = sGeneratedTaskId;
			_context.service.usernotification.liteInfo( _context.i18n.getText("jscodecompletion_load_lib_start",["user"])).done();
		}).done();
		return _context.service.intellisence.libmetadataprovider.getLibraryMetaFromHCP(packageUri, "sapui5", "js").then(function(aMeta) {
			try {
				var abTemplate = [],
					abIndex = [];
				for (var z = 0; z < aMeta.length; z++) {
    					var oMeta = aMeta[z];
						for (var fileName in oMeta.files) {
						    var zipObject = oMeta.files[fileName];
                            if ( zipObject && zipObject._data ) {
                                
            					if ( zipObject.name.search("meta.json") >= 0 ) {
            						abIndex.push(zipObject.asArrayBuffer());
            					}
            					if ( zipObject.name.search("templates.json") >= 0) {
            						abTemplate.push(zipObject.asArrayBuffer());
            					}
                                
                            }

						}
    					
				}
				return {
					libId: name + ";" + version,
					template: abTemplate,
					index: abIndex
				};
				// return Q();
			} catch (e) {
				Q.defer().reject(e);
			}

		});
	}

	function _loadPackage(oLibConfig, sPackageUri, sPattern) {
		var d = new Q.defer();

		var packageUrl = require.toUrl(sPackageUri);
		var request = new XMLHttpRequest();
		request.open("GET", packageUrl, true);
		request.responseType = "arraybuffer";
		request.onload = function(event) {
			if (this.readyState === 4 && this.status < 300) {
				try {
					var jsZip = new JSZip();
					jsZip.load(this.response);
					var abTemplate = [],
						abIndex = [];
					for (var fileName in jsZip.files) {
						var zipObject = jsZip.files[fileName];
						if (zipObject) {
							if (!sPattern) {
								abTemplate.push(zipObject.asArrayBuffer());
							} else {
								if (zipObject.name.search(sPattern) >= 0) {
									abIndex.push(zipObject.asArrayBuffer());
								}
							}
						}
					}
					d.resolve({
						libId: oLibConfig.name + ";" + oLibConfig.version,
						template: abTemplate,
						index: abIndex
					});
				} catch (e) {
					d.reject(e);
				}
			} else {
				d.reject(new Error(packageUrl));
			}
		};
		request.onerror = function(error) {
			d.reject(error);
		};
		request.send(null);

		return d.promise;
	}

	function _initLibraryRes(oLibConfig) {
		if (_isDynamicLibrary(oLibConfig)) {
			// Load from HCP by uri
			return _loadFromHCP(oLibConfig.name, oLibConfig.version, oLibConfig.remPath);
		} else {
			var aLoadPromise = [];
			aLoadPromise.push(_loadPackage(oLibConfig, oLibConfig.libTemplate));
			aLoadPromise.push(_loadPackage(oLibConfig, oLibConfig.libIndexFile, ".json"));
			return Q.all(aLoadPromise).then(function(aLibStream) {
				return {
					libId: oLibConfig.name + ";" + oLibConfig.version,
					template: aLibStream[0].template.concat(aLibStream[1].template),
					index: aLibStream[0].index.concat(aLibStream[1].index)
				};
			});
		}

	}

	function _initLibrary(oLibConfig) {
		if (_libraryLoaded(oLibConfig)) {
			return Q();
		} else {
			return _initLibraryRes(oLibConfig).then(function(oLoad) {
				return _pushLibraryToWorker(oLoad.libId, oLoad.template, oLoad.index);
			});
		}
	}

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

	function loadTemplate(name, template, version) {
		_mLibs[name + ";" + version] = template.Templates;
	}

	function getLibConfig(name) {
		for (var i in _libraries) {
			var lib = _libraries[i];
			if (lib.name === name) {
				return lib;
			}
		}
	}

	// ------------------------------------------------------------------------------------------------------------------------------

	/* ******************************* Proposal computation based on different sources ******************************************** */

	/*
	 * Invoke ComputeEsprimaProposalsWorker
	 *
	 * sAction {string} action - requested action (autohint, ctrl/space. etc)
	 * @param {object} oContentStatus - content status
	 * @returns {Q(proposals[])}
	 */
	function _computeEsprimaProposalsBackGround(sAction, oContentStatus) {
		oContentStatus.inferredOnly = true;
		return _runEsprimaWorker(sAction, oContentStatus);
	}
	
	function _sendSummaryRequest(sAction, oContentStatus) {
		var oDeferred = Q.defer();
		return _runWorker(sAction, oDeferred, oContentStatus);		
		
	}

	function _computeCrossFileProposals(oContentStatus, oIndex) {
		var astRoot = mVisitor.parse(oContentStatus.buffer);
		var jsContentAssist = new mJSContentAssist.EsprimaJavaScriptContentAssistProvider(oIndex);
		return jsContentAssist.computeProplsalsFromAST(astRoot, oContentStatus.buffer, oContentStatus).then(function(aProposals) {
			if (!aProposals) {
				aProposals = [];
			}
			return Q(aProposals);
		});
	}
	/*
	 * Compute Context proposals in background running WebWorker including
	 * Keyword Proposals
	 * Snippet proposals
	 * Library Index Proposals
	 * Cross File Proposals
	 *
	 * @param {string} sAction - either AutoHintProposal or CodeAssistproposals
	 * @param {astNode} astRoot - AST Root Node for the current module
	 * @param {object} oContentStatus - content status
	 * @param {IndexManager} oIndexerManager - indexmanager instans
	 * @returns {Q(proposals[])}
	 *
	 */
	function _computeContextProposals(sAction, astRoot, oContentStatus, oIndexerManager) {
		if (oIndexerManager) {
			var aPromises = [ 
				oIndexerManager.getDependentIndexes(oContentStatus.targetFile, astRoot),
				oIndexerManager.getUI5ProjectInfo(oContentStatus.targetFile)
			];
			return Q.spread(aPromises, function(indexJsons, oProjectInfo) { 
				if (!indexJsons) {
					return Q.reject(new Error("fail to get dependencies for cross file proposals"));
				}
				var oIndex = new mIndexer.OrionIndexer(indexJsons, oContentStatus.targetFile, oProjectInfo);
				var propPromises = [];
				propPromises.push(_computeCrossFileProposals(oContentStatus, oIndex));
				propPromises.push(_computeEsprimaProposalsBackGround(sAction, oContentStatus ));
				return Q.all(propPromises).then(function(compProposals) {
					var allProposals =  compProposals[0].concat(compProposals[1]);
					var uniqueProposals = [];
					allProposals.forEach(function(currProp,indexProp,allProp){
						if ( currProp.proposal && currProp.category ) {
							for ( var j = 0; j < indexProp ; j++) {
								if ( allProp[j].proposal && allProp[j].category  && 
								     allProp[j].proposal === currProp.proposal && allProp[j].category === currProp.category  ) {
									 return;
								}
							}
						}
						this.uniqueProposals.push( allProp[indexProp] );
					}, {uniqueProposals : uniqueProposals});
					return uniqueProposals;
				});
			}).fail(function(error) {
				console.log(error);
				// retry for the proposals only based on the current file
				return _computeEsprimaProposalsBackGround(sAction, oContentStatus);
			});
		} else {
			return _computeEsprimaProposalsBackGround(sAction, oContentStatus);
		}

	}
	/*
	 * Get WATT services andtheir methods available in the current plugin progect
	 * @param {astNode} astRoot - AST Root Node for the current module
	 * @param {object} oContentStatus - content status
	 * @returns {Q(proposals[])}
	 */
	function _getWattContextProposals(astRoot, oContentStatus) {
		return mPluginProposalUtil.getPlugin(_context).then(function(oPluginJson) {
			if (oPluginJson) {
				return Q(mPluginProposalUtil.getProposals(astRoot, oContentStatus, oPluginJson));
			} else {
				return Q([]);
			}
		});
	}

	/* 
	 * Compute Code assistence proposals
	 * @param {string} sAction - either AutoHintProposal or CodeAssistproposals
	 * @param {object} oContentStatus - content status
	 * @param {IndexManager} oIndexerManager - indexmanager instans
	 * @returns {Q(proposals[])}
	 */
	function _computeProposals(sAction, oContentStatus, oIndexerManager) {
		var astRoot = mVisitor.parse(oContentStatus.buffer);
		var aPropSrc = [];
		aPropSrc.push(_getWattContextProposals(astRoot, oContentStatus));
		aPropSrc.push(_computeContextProposals(sAction, astRoot, oContentStatus, oIndexerManager));

		return Q.all(aPropSrc).then(function(proposals) {
			var allProposals = [];
			for (var i in proposals) {
				allProposals = allProposals.concat(proposals[i]);
			}
			return allProposals;
		});

	}

	function getAutoHintProposals(oContentStatus) {

		if (oContentStatus.prefix || oContentStatus.buffer[oContentStatus.offset - 1] === '.') {
			return _computeProposals(mConstants.workerAction.computeHintProposals, oContentStatus);
		} else {
			return Q([]);
		}
	}

	function getCodeAssistProposals(oContentStatus, indexManager) {
		return _computeProposals(mConstants.workerAction.computeProposals, oContentStatus, indexManager);
	}

	function _getIndexManager(pluginContext) {
		// plugin context may be empty in unit test scenario
		if (pluginContext && pluginContext.service) {
			return pluginContext.service.indexmanager;
		}
	}

	/**
	 * avoid the duplicated proposal, e.g. 'context' of Watt env & context based env
	 */
	function filterProposals(existingProposals, candidateProposals) {
		var proposals = [];

		for (var i in candidateProposals) {
			var cProp = candidateProposals[i];
			var isDuplicate = false;

			for (var j in existingProposals) {
				var eProp = existingProposals[j];

				if (eProp.proposal === cProp.proposal) {
					isDuplicate = true;
					break;
				}
			}

			if (!isDuplicate) {
				proposals.push(cProp);
			}
		}

		return proposals;
	}

	/**
	 * generate help reference url for each proposals
	 */
	function appendHelpUrl(proposals) {
		var promises = [];
		var promise;
		for (var i in proposals) {
			var proposal = proposals[i];
			var libConfig = getLibConfig(proposal.library);
			if (libConfig && libConfig.help && libConfig.helpService) {
				promise = libConfig.helpService.getHelpProposal(proposal, libConfig.help).then(function(helpProposal) {
					return Q(helpProposal);
				});
			} else {
				promise = Q(proposal);
			}
			promises.push(promise);
		}
		return Q.all(promises);
	}

	// ------------------------------------------------------------------------------------------------------------------------------------   

	/**
	 * Get either AutoHint or Code Assistence word suggestions based on the given context status
	 *
	 * @param {object} oContentStatus The editor's current context status, including: editor content, offset, prefix
	 * @return {object} The object including part of context status and proposals, including: isValue, proposals
	 */
	function _getWordSuggestions(oContentStatus) {
		// TODO: redefine Code Completion in comments
		if (!oContentStatus || oContentStatus.stringValue !== undefined || oContentStatus.bComment ) {
			return Q({
				"proposals": []
			});
		}
		oContentStatus.prefix = oContentStatus.prefix || "";
		var asyncId = oContentStatus.prefix;
		var targetFile = oContentStatus.targetFile;
		var promises = [];

		// Load missed libraries
		var initLibPromisses = [];
		_worker.aPromiseLib = {};
		for (var i in _libraries) {
			var lib = _libraries[i];
			if (!_mLibs[lib.name + ";" + lib.version]) {
				initLibPromisses.push(_initLibrary(lib));
			}
		}

		return Q.all(initLibPromisses).then(function() {
			if (oContentStatus.isAutoHint) {
				promises.push(getAutoHintProposals(oContentStatus));
			} else {
				promises.push(getCodeAssistProposals(oContentStatus, _getIndexManager(_context)));
			}
			return Q.all(promises).then(function(proposals) {
				var newProposals = [];
				var sPrefix = null;
				for (var i in proposals) {
					var filteredProposals = filterProposals(newProposals, proposals[i]);
					newProposals = newProposals.concat(filteredProposals);
				}
				return appendHelpUrl(newProposals).then(function(helpProposals) {

					if (_worker && _worker.oLastWorkerData && _worker.oLastWorkerData.contentStatus) {
						asyncId = _worker.oLastWorkerData.contentStatus.prefix;
						targetFile = _worker.oLastWorkerData.contentStatus.targetFile;
					}

					if (oContentStatus.token && oContentStatus.aRowTokens) {
						var oPreviousToken = null;

						//If user wrote "var a = new <'string to complete'>" 
						if (oContentStatus.token && oContentStatus.token.index - 1 >= 0 &&
							oContentStatus.token.index - 2 >= 0 &&
							oContentStatus.aRowTokens[oContentStatus.token.index - 1].type === "text" &&
							oContentStatus.aRowTokens[oContentStatus.token.index - 2].value === "new") {
							oPreviousToken = oContentStatus.aRowTokens[oContentStatus.token.index - 1];
						}
						if (oPreviousToken) {
							//update all the template and remove the new, objects will be inserted as is after the new by keeping the prefix
							sPrefix = oContentStatus.prefix;
							for (i = 0; i < helpProposals.length; i++) {
								if (helpProposals[i] && helpProposals[i].proposal.startsWith("new ") && helpProposals[i].category === "template") {
									helpProposals[i].proposal = helpProposals[i].proposal.substring(4, helpProposals[i].proposal.length);
								}
							}
						}
					}

					if (!sPrefix) {
						sPrefix = oContentStatus.prefix;
					}

					return Q({
						"prefix": sPrefix,
						"proposals": helpProposals,
						"asyncId": asyncId,
						"targetFile": targetFile
					});
				});
			}).fail(function(error) {
				console.warn(error);
				return Q.reject(error);
			});

		});

	}

	/**
	 * Get summary via sending request to Worker 
	 *
	 * @param {object} oContentStatus 
	 * @return {object} The Summary object
	 */
	
	function _requestSummaryFromMeta(oContentStatus) {
//		var asyncId = oContentStatus.path;
//		var targetFile = oContentStatus.targetFile;
//		var promises = [];

		// Load missed libraries
		var initLibPromisses = [];
		_worker.aPromiseLib = {};
		for (var i in _libraries) {
			var lib = _libraries[i];
			if (!_mLibs[lib.name + ";" + lib.version]) {
				initLibPromisses.push(_initLibrary(lib));
			}
		}

		return Q.all(initLibPromisses).then(function() {
			return _sendSummaryRequest(mConstants.workerAction.computeSummary,oContentStatus).then(function(oSummary) {
				return Q(oSummary.summary);
			}).fail(function(error) {
				console.warn(error);
				return Q.reject(error);
			});
		});
		
	}

	/**
	 * Determine required libraries and invoke Word Suggestion calculation
	 * @param {object} oContentStatus The editor's current context status, including: editor content, offset, prefix
	 * @return {object} The object including part of context status and proposals, including: isValue, proposals
	 */
	function _wordSuggestions(oContentStatus) {
		_libraries = [];

		return _context.service.intellisence.getCalculatedLibraries().then(function(aLoadedLibraries) {
			//Backword support old way configure jscodecompletion instead of intellisence
			if (_librariesFromJsCoCo && _librariesFromJsCoCo.length > 0) {
				_libraries = _librariesFromJsCoCo;
			}
			if (aLoadedLibraries && aLoadedLibraries.length > 0) {
				_libraries = _libraries.concat(aLoadedLibraries);
			}
			return _getWordSuggestions(oContentStatus);
		});
	}
	
	// ----------------------------------------------------------------------------------------------------------------------
	
	function _getSummaryFromMeta(oContentStatus) {
		_libraries = [];

		return _context.service.intellisence.getCalculatedLibraries().then(function(aLoadedLibraries) {
			//Backword support old way configure jscodecompletion instead of intellisence
			if (_librariesFromJsCoCo && _librariesFromJsCoCo.length > 0) {
				_libraries = _librariesFromJsCoCo;
			}
			if (aLoadedLibraries && aLoadedLibraries.length > 0) {
				_libraries = _libraries.concat(aLoadedLibraries);
			}
			return _requestSummaryFromMeta(oContentStatus);
		});		

	}

	/* ***************************** Public Methods **************************************************************************** */
	/**
	 * Get word suggestions based on the given context status
	 * @param {object} oContentStatus The editor's current context status, including: editor content, offset, prefix
	 * @return {object} The object including part of context status and proposals, including: isValue, proposals
	 * @public
	 * @name getWordSuggestions
	 * @function
	 *
	 */
	function getWordSuggestions(oContentStatus) {
		_context = this.context;
		_wsRequests.push(oContentStatus);
		return _oWordSuggestionQueue.next(function() {
			if (_wsRequests.length === 1) {
				//perform word Suggestion requests strictly sequential 
				// execute Head request
				var oCurrContentStatus = _wsRequests[0];
				_wsRequests.length = 0;
				return _wordSuggestions(oCurrContentStatus);
			} else {
				// Ignore all requests except the recent one
				var oSkipContentStatus = _wsRequests[1];
				_wsRequests.splice(0, 1);
				return Q({
					"proposals": [],
					"asyncId": oSkipContentStatus.prefix || "",
					"targetFile": oSkipContentStatus.targetFile
				});
			}
		});
	}

	/**
	 * Get summary for the given namespace, static class or class
	 * @param {string} namespace, or class name
	 * @return {object} The summary object 
	 * @public
	 * @name getSummaryFromMeta
	 * @function
	 *
	 */
	function getSummaryFromMeta(sMetaSymbol) {
		_context = this.context;
		_smRequests.push({metaSymbol: sMetaSymbol});
		return _oSummaryQueue.next(function() {
				var oCurrContentStatus = _smRequests.splice(0,1);
				return _getSummaryFromMeta(oCurrContentStatus[0]);
		});
	}

	function _isCalculateProposals() {
		if (_worker != null && _worker.oLastWorkerData.deferred !== undefined && _worker.oLastWorkerData.deferred !== null) {
			return true;
		}
		return false;
	}

	function getCalculatedPrefix(oContentStatus) {
		var sPrefix = "";
		if (oContentStatus.token && oContentStatus.token.value) {
			sPrefix = oContentStatus.token.value.substr(0, oContentStatus.cursorPosition.column - oContentStatus.token.start);
		}

		var wordRegex = /[^a-zA-Z_0-9\$\u00A2-\uFFFF]+/;

		return sPrefix.split(wordRegex).slice(-1)[0];
	}

	function onDeleted(oEvent) {
		return mPluginProposalUtil.clearCach(oEvent);
	}

	function onSaved(oEvent) {
		return mPluginProposalUtil.clearCach(oEvent);
	}

	function onTabClosed(oEvent) {
		return mPluginProposalUtil.clearCach(oEvent);
	}

	return returnedJSCodeCompletionModule;
});
