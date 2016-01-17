/**
 * The service implementation for JavaScript definition of specific object.
 * 
 * The service provides a public API which is defined in its interface (in this example, Sample.json file) 
 * and can be used by other plugins.   
 * 
 * Every method call on a service is asynchronous and returns a Q-promise.
 * If not done explicitly by the method, the return value is automatically wrapped with a promise object.
 * 
 * Other services (which are required by this service plugin, as defined in the plugin.json file) can be accessed 
 * using 'this.context.service' property.
 * 
 * A service can fire events that are defined in its interface. These events can be handled by any other service.
 * 
 * A service can also handle events from any other service (including its own).
 * The events subscription along with the handler methods must be defined in the plugin.json file.
 * 
 */
define([
	"./../util/editorUtil",
	"sap/watt/lib/orion/javascript/esprima/esprimaJsContentAssist",
	"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
	"sap/watt/lib/orion/javascript/esprima/indexer"
	], function(mEditorUtil, mJSContentAssist, mVisitor, mIndexer) {
	"use strict";

	var _pluginTitle = "jsdefinition";
	var _mousePositon = {};
	
	var _clickTriggered = false; // avoid to addmarker in mouse move event to be called after click event
	var _hoverTriggered = false; // avoid to re-enter when already in hover(mousemove or keydown)
	
	var _ctrlPressed = false;	 // avoid to re-enter in keydown event
	var _altPressed = false;
	var _keyUp = true;
	var _aSupportedFileExtensions = null;
	
	/**
	 * @private
	 */
	function _findDefinition(ast, context, indexer, i18n) {
		if (!ast || !context || !indexer) {
			console.log(i18n.getText("i18n", "message_invalidargument", 
				["JSDefinitionImpl", "_findDefinition"]));
			return Q();
		}
		var jsCA = new mJSContentAssist.EsprimaJavaScriptContentAssistProvider(indexer);
		return jsCA.findDefinition(ast, context.buffer, context.offset);
	}
	
	/**
	 * @private
	 */
	function _locateDefinition(result, self, i18n, silent, callback) {
		if (!result || !result.range) {
			if (!silent) {
				var message;
				if (result && result.hoverName) {
					message = i18n.getText("i18n", "message_nodefinitionfoundfor", [result.hoverName]);
				} else {
					message = i18n.getText("i18n", "message_nodefinitionfound");
				}
				self.context.service.log.info(_pluginTitle, message, ["user"]).done();
			}
			return Q();
		} else {
			callback = callback.bind(self);
			return callback(result);
		}
	}
	
	/**
	 * @private
	 */
	function _activateEditor(path, services, i18n) {
		if (!path) {
			console.log(i18n.getText("i18n", "message_invalidargument", 
				["JSDefinitionImpl", "_activateEditor"]));
			return Q();
		}
		return services.filesystem.documentProvider.getDocument(path).then(function(document) {
			if (!document) {
				console.log(i18n.getText("i18n", "message_failtogetdocument", [path]));
				return Q();
			}
			return services.document.open(document).then(function() {
				return services.repositorybrowser.setSelection(document, true).then(function() {
					return mEditorUtil.getCurrentEditor(services.selection);
				});
			});
		});
	}
	
	/**
	 * @private
	 */
	function _highlightResult(editor, range, isnew, i18n) {
		if (editor) {
			if (!range || range.length !== 2) {
				console.log(i18n.getText("i18n", "message_invalidargument", 
					["JSDefinitionImpl", "_highlightResult"]));
				return Q();
			}
			mEditorUtil.setEditorSelection(editor, range[0], range[1], isnew);
		}
		return Q();
	}
	
	/**
	 * @private
	 */
	function _getContextStatus(selection, position) {
		return mEditorUtil.getCurrentEditor(selection).then(function(editor) {
			if (editor) {
				return editor.getContentStatusByPosition(position);
			} else {
				return Q();
			}
		});
	}
	
	/**
	 * @private
	 */
	function _applyHoverStyle(services, mousePosition) {
		if (_hoverTriggered || !mousePosition.clientX || !mousePosition.clientY) {
			return;
		}
		_hoverTriggered = true;
		
		var jsdefinition = services.jsdefinition;
		var selection = services.selection;
		mEditorUtil.getCurrentUI5Editor(selection).then(function(ui5Editor) {
			var position = mEditorUtil.getDocumentPosition(ui5Editor, mousePosition.clientX, mousePosition.clientY);
			_getContextStatus(selection, position).then(function(contextStatus) {
				jsdefinition.hoverDefinition(contextStatus).then(function(result) {
					if (result && result.range && result.hoverRange && !_clickTriggered) {
						mEditorUtil.addDefinitionMarker(ui5Editor, result.hoverRange);
					} else {
						mEditorUtil.clearDefinitionMarker(ui5Editor);
					}
					
					_hoverTriggered = false;
				}).done();
			}).done();
		}).done();
	}
	
	/**
	 * @private
	 */
	function onEditorMouseMove(evt) {
		_mousePositon.clientX = evt.clientX;
		_mousePositon.clientY = evt.clientY;
		if (evt.ctrlKey && evt.altKey) {
			_applyHoverStyle(this.context.service, _mousePositon);
		}
	}
	
	/**
	 * @primvate
	 */
	function onEditorKeyDown(evt) {
		if (evt.ctrlKey) {
			_ctrlPressed = true;
		}
		if (evt.altKey) {
			_altPressed = true;
		}
		if (_keyUp && _ctrlPressed && _altPressed) {
			_applyHoverStyle(this.context.service, _mousePositon);
			_keyUp = false;
		}
	}
	
	/**
	 * @primvate
	 */
	function onEditorKeyUp(evt) {
		_ctrlPressed = false;
		_altPressed = false;
		if (!_keyUp) {
			this.cancelHoverStyle();
			_keyUp = true;
		}
	}
	
	/**
	 * @private
	 */
	function onEditorClick(evt) {
		if (!evt.ctrlKey || !evt.altKey) {
			return;
		}
		
		if (!_clickTriggered) {
			// avoid to re-enter time costing operation: goto definition
			_clickTriggered = true;
			
			var jsdefinition = this.context.service.jsdefinition;
			var selection = this.context.service.selection;
			var self = this;
			mEditorUtil.getCurrentUI5Editor(selection).then(function(ui5Editor) {
				var position = mEditorUtil.getDocumentPosition(ui5Editor, evt.clientX, evt.clientY);
				_getContextStatus(selection, position).then(function(contextStatus) {
					mEditorUtil.clearDefinitionMarker(ui5Editor);

					jsdefinition.gotoDefinition(contextStatus, true).then(function() {
						_clickTriggered = false;
					}).done();
				}).done();
			}).done();
		}
	}

	return {

		configure : function(mConfig) {
			_aSupportedFileExtensions = mConfig.supportedFileExtensions;
		},

		isFileExtensionSupported : function(sFileExtension) {
			return _aSupportedFileExtensions.indexOf(sFileExtension) > -1;
		},

		gotoDefinition : function(oContentStatus, bSilent) {
			var i18n = this.context.i18n;
			var _context = this.context;
			if (!oContentStatus) {
				console.log(i18n.getText("i18n", "message_invalidargument", 
					["JSDefinitionImpl", "gotoDefinition"]));
				return Q();
			}

			var ast = mVisitor.parse(oContentStatus.buffer);
			var indexmanager = this.context.service.indexmanager;
			var highlightFunc = this.highlightResult;
			var self = this;
			var aPromises = [ 
				indexmanager.getDependentIndexes(oContentStatus.targetFile, ast),
				indexmanager.getUI5ProjectInfo(oContentStatus.targetFile)
			];
			return Q.spread(aPromises, function(indexJsons, oProjectInfo) { 
				var orionIndexer = new mIndexer.OrionIndexer(indexJsons, oContentStatus.targetFile, oProjectInfo);
				return _findDefinition(ast, oContentStatus, orionIndexer, i18n).then(function(result) {
					//console.log("fireNavigationRequested " + result.path + " start pos " + result.range[0]);
					_context.event.fireNavigationRequested({ sTarget: result.path, oCoordinates: result.range });
					return _locateDefinition(result, self, i18n, bSilent, highlightFunc);
				});
			}).fail(function(error) {
				console.warn(error);
				return Q();
			});
		},

		hoverDefinition : function(oContentStatus) {
			var i18n = this.context.i18n;
			if (!oContentStatus) {
				console.log(i18n.getText("i18n", "message_invalidargument", ["JSDefinitionImpl", "hoverDefinition"]));
				return Q();
			}

			var ast = mVisitor.parse(oContentStatus.buffer);
			var services = this.context.service;
			var indexManager = services.indexmanager;
			var aPromises = [ 
				indexManager.getDependentIndexes(oContentStatus.targetFile, ast),
				indexManager.getUI5ProjectInfo(oContentStatus.targetFile)
			];
			return Q.spread(aPromises, function(indexJsons, oProjectInfo) { 
				var orionIndexer = new mIndexer.OrionIndexer(indexJsons, oProjectInfo);
				return _findDefinition(ast, oContentStatus, orionIndexer, i18n);
			}).fail(function(error) {
				console.warn(error);
				return Q();
			});
		},

		highlightResult : function(oDefResult) {
			if (!oDefResult) {
				return Q();
			}
			var i18n = this.context.i18n;
			if (!oDefResult.path) {
				var selection = this.context.service.selection;
				return mEditorUtil.getCurrentEditor(selection).then(function(curEditor) {
					return _highlightResult(curEditor, oDefResult.range, false, i18n);
				});
			} else {
				return _activateEditor(oDefResult.path, this.context.service).then(function(newEditor) {
					return _highlightResult(newEditor, oDefResult.range, true, i18n);
				});
			}
		},

		applyHoverStyle : function(aRange) {
			var selection = this.context.service.selection;
			mEditorUtil.getCurrentUI5Editor(selection).then(function(ui5Editor) {
				mEditorUtil.addDefinitionMarker(ui5Editor, aRange);
			}).done();
		},

		cancelHoverStyle : function() {
			var selection = this.context.service.selection;
			mEditorUtil.getCurrentUI5Editor(selection).then(function(ui5Editor) {
				mEditorUtil.clearDefinitionMarker(ui5Editor);
			}).done();
		},

		onSelectionChanged : function(oEvent) {
			_clickTriggered = false;
			_hoverTriggered = false;

			var owner = oEvent.params.owner;
			if (owner && owner.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
				var editor = owner;
				var selection = oEvent.params.selection;
				if (selection && selection.length > 0) {
					var document = selection[0].document;
					if (document && this.isFileExtensionSupported(document.getEntity().getFileExtension())) {
						/*eslint-disable */
						onEditorMouseMove = onEditorMouseMove.bind(this);
						onEditorKeyDown = onEditorKeyDown.bind(this);
						onEditorKeyUp = onEditorKeyUp.bind(this);
						onEditorClick = onEditorClick.bind(this);
						/*eslint-enable */
						editor.getUI5Editor().then(function(ui5Editor) {
							mEditorUtil.attachEditorEvent(ui5Editor, "mousemove", onEditorMouseMove);
							mEditorUtil.attachEditorEvent(ui5Editor, "keydown", onEditorKeyDown);
							mEditorUtil.attachEditorEvent(ui5Editor, "keyup", onEditorKeyUp);
							mEditorUtil.attachEditorEvent(ui5Editor, "click", onEditorClick);
						}).done();
					}
				}
			}
		}
	};
});