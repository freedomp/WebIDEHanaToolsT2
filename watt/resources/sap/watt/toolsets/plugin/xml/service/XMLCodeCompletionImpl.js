define(
		["../codecompletion/XMLContentAssist", "sap/watt/lib/jszip/jszip-shim"],
	function(XMLContentAssist) {

		var _libraries;
		var _lastLibraryVersion;

		var XMLCodeCompletion = function() {

			this.xmlAssist = new XMLContentAssist();
		};

		XMLCodeCompletion.prototype = {
			_mRegistry: {},
			_librariesFromXmlCoCo: null,

			configure: function(mConfig) {
				if (!this._librariesFromXmlCoCo) {
					this._librariesFromXmlCoCo = mConfig.libraries;
				}
			},
			/**
			 * Get code proposals for the current xml content status.
			 * <p>
			 * This method will parse the given xml content and compute the proposals for specified offset.
			 * @param 	oContentStatus 	{object}	the content status which including content buffer, current offset and other informations.
			 * @return 	Proposal object including proposal array, word prefix  and other required information.
			 */

			getWordSuggestions: function(oContentStatus) {
				var that = this;
				//Backword support old way
				if (this._librariesFromXmlCoCo && this._librariesFromXmlCoCo.length > 0) {
					_libraries = this._librariesFromXmlCoCo;
					return this._getWordSuggestions(oContentStatus);
				}

				//Support multiple libraries
				return this.context.service.intellisence.getCalculatedLibraries().then(function(aLoadedLibraries) {
					if (aLoadedLibraries) {
						_libraries = aLoadedLibraries;
					}
					return that._getWordSuggestions(oContentStatus);
				});

			},

			_getWordSuggestions: function(oContentStatus) {
				var that = this;
				if (oContentStatus) {
					var info = [];
					var retObj = {};
					//get the proposals as suggestions
					return this.loadLibrary(oContentStatus).then(function() {
						return that.xmlAssist
							.computeProposals(oContentStatus.buffer, oContentStatus.offset, oContentStatus, that.context, that._libraries)
							.then(
								function(retObj) {
									if (!(oContentStatus.isAutoHint == true && retObj.prefix == "")) {
										var proposals = retObj.proposalsObj;
										var ignoreContextProposals = oContentStatus.ignoreContextProposals || false;
										var ignoreSnippetProposals = oContentStatus.isAutoHint || oContentStatus.ignoreSnippetProposals || false;
										var tmpProposal = null;
										for (var i = 0; i < proposals.length; i++) {
											//info.push(proposals[i]);//
											if (ignoreContextProposals && proposals[i].category != that.xmlAssist.category.XML_SNIPPET && proposals[i].category != that.xmlAssist
												.category.XML_SYNTAX) {
												tmpProposal = proposals[i];
											} else if (ignoreSnippetProposals && proposals[i].category == that.xmlAssist.category.XML_SNIPPET) {
												tmpProposal = proposals[i];
											} else {
												info.push({
													description: proposals[i].description,
													overwrite: true,
													proposal: proposals[i].insertTerm,
													helpDescription: proposals[i].helpDesc,
													helpTarget: proposals[i].helpTarget,
													category: proposals[i].category,
													categoryDesc: that.xmlAssist.categoryDesc[proposals[i].category.toString()]
												});
											}
										}
									}
									return {
										proposals: info,
										isValue: retObj.isValue,
										prefix: retObj.prefix
									};
								});

					});

				}
			},

			_isDynamicLibrary: function(oLibConfig) {
				return (oLibConfig.remPath && oLibConfig.remPath.search('/sapui5') >= 0);
			},

			loadLibrary: function(oContentStatus) {
				var promises = [];
				for (var i in _libraries) {
					var lib = _libraries[i];
					if (_lastLibraryVersion !== lib.version) {
						this.xmlAssist.resetTemplatesAndMetadata();
						promises.push(this.initLibrary(lib));
						_lastLibraryVersion = lib.version;
					}
				}
				var that = this;
				return Q.all(promises).then(function(aLibs) {

					console.log("Libs loaded " + aLibs.length);
				});
			},

			initLibrary: function(libConfig) {
				var that = this;
				if (!libConfig.name || !libConfig.version) {
					return Q();
				}
				return this.initLibraryRes(libConfig).then(function(aMeta) {
					if (aMeta.template) {
						for (var i = 0; i < aMeta.template.length; i++) {
							that.loadTemplate(aMeta.template[i]);
						}
					}
					if (aMeta.meta) {
						for (i = 0; i < aMeta.meta.length; i++) {
							that.loadMetadata(aMeta.meta[i]);
						}
					}
				});
			},

			initLibraryRes: function(oLibConfig) {
				if (this._isDynamicLibrary(oLibConfig)) {
					// Load from HCP by uri
					return this._loadFromHCP(oLibConfig.name, oLibConfig.version, oLibConfig.remPath);
				} else {
					//return 	Q(this._loadPackage(oLibConfig.name, oLibConfig.version, libUri));
					var aLoadPromise = [];
					aLoadPromise.push(this._loadPackage(oLibConfig.name, oLibConfig.version, oLibConfig.libTemplate, "template"));
					aLoadPromise.push(this._loadPackage(oLibConfig.name, oLibConfig.version, oLibConfig.libMetadata, "metadata"));
					return Q.all(aLoadPromise).then(function(aLibStream) {
						return {
							libId: oLibConfig.name + ";" + oLibConfig.version,
							template: aLibStream[0].template,
							meta: aLibStream[1].metadata
						};
					});
				}
			},

			_loadFromHCP: function(name, version, packageUri) {
				var that = this;
				var iProgressTaskId;
				return this.context.service.progress.startTask("Libraried Loading", "Loading metadata is running in the background").then(function(sGeneratedTaskId){
					iProgressTaskId = sGeneratedTaskId;
					that.context.service.usernotification.liteInfo( that.context.i18n.getText("xmlcodecompletion_load_lib_start",["user"])).done();
					return that.context.service.intellisence.libmetadataprovider.getLibraryMetaFromHCP(packageUri, "sapui5", "xml");
				}).then(function(aMeta) {
					try {
						var aTemplate = [],
							aMetadata = [];
						for (var z = 0; z < aMeta.length; z++) {
							var oMeta = aMeta[z];
							for (var fileName in oMeta.files) {
								var zipObject = oMeta.files[fileName];
								if (zipObject && zipObject._data) {
									if (zipObject.name.search("meta.json") >= 0) {
										aMetadata.push(JSON.parse(zipObject.asText()));
									}
									if (zipObject.name.search("templates.json") >= 0) {
										aTemplate.push(JSON.parse(zipObject.asText()));
									}
								}
							}
						}
										
						return {
							libId: name + ";" + version,
							template: aTemplate,
							meta: aMetadata
						};
					} catch (e) {
						Q.reject(e);
					}
				}).fin(function() {
	    	    	if (iProgressTaskId) {
						that.context.service.progress.stopTask(iProgressTaskId).done();
						that.context.service.usernotification.liteInfo( that.context.i18n.getText("xmlcodecompletion_load_lib_ended",["user"])).done();
					}	
			  }); 
			},

			_loadPackage: function(sName, sVersion, sPackageUri, sPackage) {
				var d = Q.defer();
				var content = [],
					aPack;
				var packageUrl = require.toUrl(sPackageUri);
				var request = new XMLHttpRequest();
				request.open("GET", packageUrl, true);
				request.responseType = "arraybuffer";
				request.onload = function(event) {
					if (this.readyState === 4 && this.status < 300) {
						try {
							var jsZip = new JSZip();
							jsZip.load(this.response);
							// var aResult = [];
							for (var fileName in jsZip.files) {
								var zipObject = jsZip.files[fileName];
								if (zipObject) {
									content.push(JSON.parse(zipObject.asText()));
								}
							}
							aPack = {
								libId: sName + ";" + sVersion
							};
							aPack[sPackage] = content;
							d.resolve(aPack);
						} catch (e) {
							d.reject(e);
						}
					} else {
						d.reject(new Error(sPackageUri));
					}
				};
				request.onerror = function(error) {
					d.reject(error);
				};
				request.send(null);

				return d.promise;
			},

			loadFile: function(name, fileUri) {
				var d = Q.defer();
				require([fileUri], function(content) {
					try {
						d.resolve([{
							"name": name,
							"content": content
						}]);
					} catch (e) {
						d.reject(e);
					}
				});
				return d.promise;
			},

			loadTemplate: function(template) {
				this.xmlAssist.addTemplates(template);
			},
			loadMetadata: function(metadata) {
				this.xmlAssist.addMetadata(metadata);
			},

			getCalculatedPrefix: function(oContentStatus) {
				var sPreviousToken = "";
				var sPrefix = "";

				if (oContentStatus.token && oContentStatus.token.value) {
					sPrefix = oContentStatus.token.value.substr(0, oContentStatus.cursorPosition.column - oContentStatus.token.start);
				}

				if (oContentStatus.aRowTokens && oContentStatus.aRowTokens.length > 1 && sPrefix === ":") {
					sPreviousToken = oContentStatus.aRowTokens[oContentStatus.aRowTokens.length - 2].value;
					sPrefix = sPreviousToken + sPrefix;
				}

				var wordRegex = /[^a-z\:\.A-Z_0-9\$\u00A2-\uFFFF]+/;
				return sPrefix.split(wordRegex).slice(-1)[0];
			}
		};

		return XMLCodeCompletion;

	});