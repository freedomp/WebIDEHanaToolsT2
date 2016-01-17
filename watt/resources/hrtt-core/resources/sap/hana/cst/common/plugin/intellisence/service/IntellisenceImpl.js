/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([
	"sap.watt.ideplatform.intellisence/service/contentassist/LinkModeHelper",
	"sap.watt.ideplatform.intellisence/service/contentassist/HintModeHelper",
	"./contentassist/PopupModeHelper",
	"sap.watt.ideplatform.intellisence/service/contentassist/TermModeHelper"
], function(linkModeHelper, hintModeHelper, popupModeHelper, termModeHelper) {
	"use strict";

	var _aIntellisence = [];

	var _adjustRangeBySelection = function(range, nStartRow, nStartCol, nEndRow, nEndCol) {
		if (!range.isEmpty()) {
			if ((nStartRow >= range.start.row) && (nStartRow <= range.end.row)) {
				if (nStartRow > range.start.row) { // start at up line
					if (nStartCol - 1 <= range.end.column) {
						nStartRow = range.start.row;
						nStartCol = range.start.column;
					}
				} else { //start at same line
					if ((nStartCol - 1 <= range.end.column) && (nStartCol >= range.start.column)) {
						nStartRow = range.start.row;
						nStartCol = range.start.column;
					}
				}

			}
			if ((nEndRow >= range.start.row) && (nEndRow <= range.end.row)) {
				if (nEndRow < range.end.row) { //end at below line
					if (nEndCol + 1 >= range.start.column) {
						nEndRow = range.end.row;
						nEndCol = range.end.column;
					}
				} else { // end at same line
					if ((nEndCol <= range.end.column) && (nEndCol + 1 >= range.start.column)) {
						nEndRow = range.end.row;
						nEndCol = range.end.column;
					}
				}
			}
		}
		return {
			start: {
				row: nStartRow,
				column: nStartCol
			},
			end: {
				row: nEndRow,
				column: nEndCol
			}
		};
	};

	return {
		//@changed
		_bInitContext: false,
		_sHelpWebsite: "",
		configure: function(mConfig) {
			_aIntellisence = _aIntellisence.concat(mConfig.codeCompletion);
			this._sHelpWebsite = mConfig.helpWebsite;
			this._aCategoryIcon = mConfig.categoryIcon;
			this._sIconRoot = mConfig.iconRoot;
			this._iHintLevel = mConfig.hintLevel;
			this._bHintComment = false;
			this._aStyles = mConfig.styles;
			this._bStyleLoaded = false;
			this._aConfiguredLibraries = mConfig.libraries;
			this._aPrefix = mConfig.aPrefix;
		},

		getFocusElement: function() {
			return this.getContent();
		},

		executeIntellisence: function() {
			var oCodeCompletionPromise = this.getCodeCompletion(),
				oInnerEditorServicePromise = this.getCodeEditor();

			var oReadyPromise = Q.all([oCodeCompletionPromise, oInnerEditorServicePromise]);
			var that = this;

			return oReadyPromise.spread(function(oCodeCompletionService, oInnerEditorService) {

				if (!oInnerEditorService) {
					that.context.service.usernotification.info(that.context.i18n.getText("i18n", "msg_no_editor")).done();
					return Q();
				}

				if (!oCodeCompletionService) {
					//	that.context.service.usernotification.info(that.context.i18n.getText("i18n", "msg_no_codecompletion")).done();
					return Q();
				}

				return oInnerEditorService.getReadOnly().then(function(readOnly) {

					if (readOnly === true) {
						return Q();
					}

					var oContentStatus;

					return oInnerEditorService.getContentStatus(true, true).then(function(contentStatus) {
						oContentStatus = contentStatus;
						oContentStatus.ignoreSnippetProposals = false;
						oContentStatus.ignoreContextProposals = false;
						oContentStatus.isAutoHint = false;
						oContentStatus.caseSensitive = false;
						//Add the relvant libraries version for code suggestion
						if (oCodeCompletionService.instanceOf("sap.watt.common.service.editor.PrefixCalculation")) {
							return oCodeCompletionService.getCalculatedPrefix(oContentStatus).then(function(sPrefix) {
								oContentStatus.prefix = sPrefix;
							});
						}
						return Q();
					}).then(function() {
						return oCodeCompletionService.getWordSuggestions(oContentStatus);
					}).then(function(aProposals) {
						if (aProposals.prefix != null) {
							oContentStatus.prefix = aProposals.prefix;
						}
						if (oContentStatus.stringValue != null && aProposals.proposals.length === 0 && aProposals.isValue !== false && sap.watt.getEnv("internal")) {
							return that._showTranslationProposals(oInnerEditorService, oContentStatus);
						} else {
							that.showSuggestions(aProposals.proposals, oContentStatus.coords, oContentStatus.prefix);
						}
					});
				});
			});

		},

		getCodeEditor: function() {
			return this.context.service.selection.getOwner().then(function(oCurrentEditorInstance) {
				if (oCurrentEditorInstance && (oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor") ||
						oCurrentEditorInstance.instanceOf("sap.watt.common.service.editor.CodeCompletion"))) {
					return oCurrentEditorInstance;
				} else {
					return null;
				}
			});
		},

		_getCodeCompletionByParams: function(sFileExtension) {
			var that = this;
			var oCodeCommpletion;
			var oDeferred = Q.defer();
			if (that._oEditor) {
				if (this._oEditor.getName) {
					oDeferred.resolve(that._oEditor.getName());
				} else {
					oDeferred.resolve(this._oEditor._sName);
				}
			}
			oDeferred.resolve();
			return oDeferred.promise.then(function(sEditorName) {
				jQuery.each(_aIntellisence, function(iIndex, mIntellisence) {
					if (mIntellisence.fileExtension === sFileExtension.toLowerCase()) {
						var editorName = mIntellisence.editor ? mIntellisence.editor : "aceeditor";
						if (sEditorName === editorName) {
							oCodeCommpletion = mIntellisence.service;
							return;
						}
					}
				});
				return oCodeCommpletion;
			});

		},

		/**
		 * Get current code completion service.
		 * <p>
		 * This method will search the plugin configuration to get the matched intellisence object.
		 * @return 	the current code completion service.
		 */
		getCodeCompletion: function() {
			var oContentService = this.context.service.content;
			var that = this;

			if (this._aStyles && !this._bStyleLoaded) {
				this.context.service.resource.includeStyles(this._aStyles).done();
				this._bStyleLoaded = true;
			}

			return oContentService.getCurrentDocument().then(function(oDocument) {
				if (oDocument) {
					var sFileExtension = oDocument.getEntity().getFileExtension();
					return that._getCodeCompletionByParams(sFileExtension);
				}
			});
		},

		getCalculatedLibraries: function() {
			var that = this;
			var oContentService = this.context.service.content;
			var oCalculatedLibVersionService = this.context.service.intellisence.calculatelibraryversion;
			return oContentService.getCurrentDocument().then(function(oDocument) {
				return oCalculatedLibVersionService.getCalculatedLibraryVersion(oDocument, that._aConfiguredLibraries);

			});

		},

		onEditorBeforeClosing: function(oEvent) {
			this._oEditor = null;
			this.clearIntellisenceContext();
			this.context.service.intellisence.guidance.clearGuidance().done();
		},

		onScroll: function(oEvent) {
			this.updatePosition();
		},
		onSplitterPositionChanged: function() {
			if (this._positionChangeTimer) {
				jQuery.sap.clearDelayedCall(this._positionChangeTimer);
			}

			this._positionChangeTimer = jQuery.sap.delayedCall(100, this, function() {
				this.updatePosition();
				this._positionChangeTimer = null;
			});
		},

		updatePosition: function() {
			if (popupModeHelper.getPopupMode()) {
				this._oEditor.getContentStatus(true, false).then(function(oContentStatus) {
					popupModeHelper.updatePosition(oContentStatus.coords.pageX, oContentStatus.coords.pageY);
				}).done();
			}
			if (hintModeHelper.getHintMode()) {
				this._oEditor.getContentStatus(true, false).then(function(oContentStatus) {
					hintModeHelper.updatePosition(oContentStatus.coords.pageX, oContentStatus.coords.pageY);
				}).done();
			}
		},
		onSelectionChanged: function(oEvent) {
			var oCurrentEditorInstance = oEvent.params.owner;
			var that = this;
			if (oCurrentEditorInstance && (oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor") ||
					oCurrentEditorInstance.instanceOf("sap.watt.common.service.editor.CodeCompletion"))) {

				var bEditorChanged = false;
				if (that._oEditor != oCurrentEditorInstance) {
					that._oEditor = oCurrentEditorInstance;
					oCurrentEditorInstance.detachEvent("beforeClosing", that.onEditorBeforeClosing, that);
					oCurrentEditorInstance.attachEvent("beforeClosing", that.onEditorBeforeClosing, that);
					oCurrentEditorInstance.detachEvent("scroll", that.onScroll, that);
					oCurrentEditorInstance.attachEvent("scroll", that.onScroll, that);
					bEditorChanged = true;
				}

				var oCurrentDocument = oEvent.params.selection[0] ? oEvent.params.selection[0].document : undefined;
				if ((that._oDocument != oCurrentDocument) || bEditorChanged) { //A new document is opened or Editor changed
					that._oDocument = oCurrentDocument;
					oCurrentEditorInstance.getUI5Editor().then(function(oUI5Editor) {
						if (oUI5Editor) {
							that.initIntellisenceContext(oUI5Editor);
							//@changed
							that._bInitContext = true;
						}
					}).done();
				}
			} else {
				//@changed
				if (that._bInitContext) {
					that.clearIntellisenceContext();
				}
				that._oDocument = null;
				that._bInitContext = false;
			}
		},
		/**
		 * Init the intellisence context with the editor context.
		 * <p>
		 * This method inits the intellisence context with the editor context.
		 * @param 	oEditorControl 	{object}, the current editor control.
		 */
		initIntellisenceContext: function(oEditorControl) {
			var self = this;
			this.context.service.intellisence.config.getUserSetting().then(function(oSetting) {
				self.setSetting(oSetting);
			}).done();

			setTimeout(function() {
				//init
				self._oContainer = oEditorControl.getContainer();
				self._oEditorControl = oEditorControl;
				popupModeHelper.initPopupMode(self);
				linkModeHelper.initLinkMode(self);
				hintModeHelper.initHintMode(self);
				termModeHelper.initTermMode(self);

				var oEditor = oEditorControl.oEditor;

				self.getCodeCompletion().then(function(oCodeCompletionService) {
					self._oCodeCompletionService = oCodeCompletionService;

					oEditorControl.getContainer().onclick = function(e) {
						if (popupModeHelper.getPopupMode()) {
							try {
								var elem = null;
								if ((e.target.tagName == "SPAN") || (e.target.tagName == "IMG")) {
									elem = e.target.parentNode;
								} else if ((e.target.tagName == "STRONG")) {
									elem = e.target.parentNode.parentNode;
								} else {
									elem = e.target;
								}
								var id = elem.attributes["selected_id"];
								if (id && (id.nodeValue)) {
									var index = parseInt(id.nodeValue);
									self.replace(index);
									self._oEditorControl.setFocus();
								} else {
									popupModeHelper.deactivate();
									if (hintModeHelper.getHintMode()) {
										hintModeHelper.cancelHint(false, true);
									}
								}
							} catch (e) {}
						} else if (hintModeHelper.getHintMode()) {
							hintModeHelper.cancelHint(false, true);
						}

						if (termModeHelper.getTermMode()) {
							var oTranslationSevice = self.context.service.translation;
							if (oTranslationSevice) {
								oTranslationSevice.hideTermUI().done();
							}
						}
					};

					oEditorControl.getContainer().onkeydown = function(e) {
						var keycode = e.keyCode,
							bFunctionKey = e.altKey || e.ctrlKey,
							bStopEvent = false;

						if (e.target && (e.target.className != "ace_text-input")) {
							return;
						}

						if (popupModeHelper.getPopupMode()) {
							if (keycode == 9 || bFunctionKey) {
								popupModeHelper.deactivate();
							}
						} else if (hintModeHelper.getHintMode()) {
							// 9 = tab, 13 = enter, 16 = shift, 20 = capslock
							if (!(keycode == 9 || keycode == 13 || keycode == 16 || keycode == 20)) {
								hintModeHelper.cancelHint();
							}
						}

						if (linkModeHelper.getLinkMode() /*&& keycode == 222*/ ) {
							if (keycode == 9 || keycode == 13) {
								self._oEditorControl.deleteCurrentSelection();
							}
						}

					};

					oEditorControl.getContainer().onkeyup = function(e) {
						var keycode = e.keyCode;

						if (e.target && (e.target.className != "ace_text-input")) {
							return;
						}

						if (popupModeHelper.getPopupMode() && keycode === 8) {
							popupModeHelper.updatePopupProposals();
							//hintLevel: 0 - Disable autohint, 1 - Enable autohint only after '.', 2 - Enable autohint for text input.
						} else if (self._iHintLevel === 2 && keycode === 8) {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.setHintStatus(oEditorControl.getCursorPosition().column);
								hintModeHelper.cancelHint();
							}
							hintModeHelper.tryShowHint();
						} else if (self._iHintLevel === 1 && (keycode === 110 || keycode === 190)) { //period
							hintModeHelper.tryShowHint();
						}
					};

					if (self.originalOnTextInput == undefined) {
						self.originalOnTextInput = oEditor.onTextInput;
					}
					//text input

					// code completion delay
					oEditor._timeoutId = null;
					oEditor._timeout = 300;
					oEditor._setAutoHintTimeout = function(fnAutoHintFunction) {
						if (this._timeoutId !== null) {
							clearTimeout(this._timeoutId);
						}
						this._timeoutId = setTimeout(fnAutoHintFunction, this._timeout);
					};

					oEditor.onTextInput = function(text) {
						if (popupModeHelper.getPopupMode()) {
							if (text == '\n') {
								self.replace();
							} else {
								self.originalOnTextInput.call(oEditor, text);
								popupModeHelper.updatePopupProposals();
							}
						} else if (hintModeHelper.getHintMode()) {
							if (text == '\n' || text == '\t') {
								self.replace();
							} else {
								self.originalOnTextInput.call(oEditor, text);
								oEditor._setAutoHintTimeout(hintModeHelper.tryShowHint);
							}
						} else if (linkModeHelper.getLinkMode()) {
							if (text == '\n') {
								linkModeHelper.exitLinkMode(true);
							} else {
								self.originalOnTextInput.call(oEditor, text);
								oEditor._setAutoHintTimeout(hintModeHelper.tryShowHint);
							}
						} else {
							if (text.length === 1 && text.charCodeAt(0) === 7) {
								return; // workaround for ace editor behavior in mac os, enable 'ctrl+alt+g' for goto js definition, otherwise, it will be treated as a invisible character input
							}
							self.originalOnTextInput.call(oEditor, text);
							if (self._iHintLevel > 0) {
								if (self._iHintLevel == 1) {
									if (text === '.') {
										oEditor._setAutoHintTimeout(hintModeHelper.tryShowHint);
									}
								} else if (self._iHintLevel == 2) {
									oEditor._setAutoHintTimeout(hintModeHelper.tryShowHint);
								}

							}
						}
					};

					oEditor.commands.removeCommand("hideautocomplete");
					oEditor.commands.removeCommand("confirmautohint");
					oEditor.commands.removeCommand("shiftTab");
					oEditor.commands.removeCommand("delChar");
					//tab
					self.commandOriginalTab = oEditor.commands.commands.indent.exec;
					oEditor.commands.addCommand({
						name: "confirmautohint",
						bindKey: {
							win: "Tab",
							mac: "Tab",
							sender: "editor"
						},
						multiSelectAction: "forEach",
						exec: function(env, args, request) {
							if (popupModeHelper.getPopupMode()) {
								self.replace();
							} else if (hintModeHelper.getHintMode()) {
								self.replace();
							} else if (linkModeHelper.getLinkMode()) {
								linkModeHelper.nextLinkPos();
							} else {
								self.commandOriginalTab.call(oEditor, env, args, request);
							}
						}
					});

					//shift-tab
					self.commandOriginalShiftTab = oEditor.commands.commands.outdent.exec;
					oEditor.commands.addCommand({
						name: "shiftTab",
						bindKey: {
							win: "Shift-Tab",
							mac: "Shift-Tab",
							sender: "editor"
						},
						multiSelectAction: "forEach",
						exec: function(env, args, request) {
							if (linkModeHelper.getLinkMode()) {
								linkModeHelper.preLinkPos();
							} else {
								self.commandOriginalShiftTab.call(oEditor, env, args, request);
							}
						}
					});

					//esc
					oEditor.commands.addCommand({
						name: "hideautocomplete",
						bindKey: {
							win: "Esc",
							mac: "Esc",
							sender: "editor"
						},
						exec: function(env, args, request) {
							if (popupModeHelper.getPopupMode()) {
								popupModeHelper.deactivate();
							}
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							} else if (linkModeHelper.getLinkMode()) {
								linkModeHelper.exitLinkMode(false);
							}
						}
					});

					//del
					self.commandOriginalDel = oEditor.commands.commands.del.exec;
					oEditor.commands.addCommand({
						name: "delChar",
						bindKey: {
							win: "Delete",
							mac: "Delete|Ctrl-D|Shift-Delete",
							sender: "editor"
						},
						multiSelectAction: "forEach",
						exec: function(env, args, request) {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							} else {
								self.commandOriginalDel.call(oEditor, env, args, request);
							}
						}
					});

					//linedown/up pagedown/up home/end
					if (self.originalLineDown == undefined) {
						self.originalLineDown = oEditor.commands.commands.golinedown.exec;
					}

					if (self.originalLineUp == undefined) {
						self.originalLineUp = oEditor.commands.commands.golineup.exec;
					}

					if (self.originalPageDown == undefined) {
						self.originalPageDown = oEditor.commands.commands.gotopagedown.exec;
					}

					if (self.originalPageUp == undefined) {
						self.originalPageUp = oEditor.commands.commands.gotopageup.exec;
					}

					if (self.originalGotoLeft == undefined) {
						self.originalGotoLeft = oEditor.commands.commands.gotoleft.exec;
					}

					if (self.originalGotoRight == undefined) {
						self.originalGotoRight = oEditor.commands.commands.gotoright.exec;
					}

					if (self.originalGotoLineStart == undefined) {
						self.originalGotoLineStart = oEditor.commands.commands.gotolinestart.exec;
					}

					if (self.originalGotoLineEnd == undefined) {
						self.originalGotoLineEnd = oEditor.commands.commands.gotolineend.exec;
					}

					oEditor.commands.commands.golinedown.exec = function(env, args, request) {
						if (popupModeHelper.getPopupMode()) {
							popupModeHelper.lineDown();
						} else if (hintModeHelper.getHintMode()) {
							hintModeHelper.lineDown();
						} else {
							self.originalLineDown.call(oEditor, env, args, request);
						}
					};
					oEditor.commands.commands.golineup.exec = function(env, args, request) {
						if (popupModeHelper.getPopupMode()) {
							popupModeHelper.lineUp();
						} else if (hintModeHelper.getHintMode()) {
							hintModeHelper.lineUp();
						} else {
							self.originalLineUp.call(oEditor, env, args, request);
						}
					};
					oEditor.commands.commands.gotoright.exec = function(env, args, request) {
						if (popupModeHelper.getPopupMode()) {
							popupModeHelper.lineDown();
						} else {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							}
							self.originalGotoRight.call(oEditor, env, args, request);
						}

					};
					oEditor.commands.commands.gotoleft.exec = function(env, args, request) {
						if (popupModeHelper.getPopupMode()) {
							popupModeHelper.lineUp();
						} else {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							}
							self.originalGotoLeft.call(oEditor, env, args, request);
						}
					};
					oEditor.commands.commands.gotopagedown.exec = function(env, args, request) {
						if (popupModeHelper.getPopupMode()) {
							popupModeHelper.pageDown();
						} else {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							}
							self.originalPageDown.call(oEditor, env, args, request);
						}
					};
					oEditor.commands.commands.gotopageup.exec = function(env, args, request) {
						if (popupModeHelper.getPopupMode()) {
							popupModeHelper.pageUp();
						} else {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							}
							self.originalPageUp.call(oEditor, env, args, request);
						}
					};

					oEditor.commands.commands.gotolinestart.exec = function(env, args, request) {
						if (!popupModeHelper.getPopupMode()) /*{} else*/ {
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							}
							self.originalGotoLineStart.call(oEditor, env, args, request);
						}
					};

					oEditor.commands.commands.gotolineend.exec = function(env, args, request) {
						if (!popupModeHelper.getPopupMode())
						/*{

						} else */
						{
							if (hintModeHelper.getHintMode()) {
								hintModeHelper.cancelHint();
							}
							self.originalGotoLineEnd.call(oEditor, env, args, request);
						}
					};

				}).done();
			}, 0);
		},

		/**
		 * Clear the intellisence status
		 * <p>
		 * This method clears the intellisence context.
		 */
		clearIntellisenceContext: function() {
			if (hintModeHelper && hintModeHelper.getHintMode()) {
				hintModeHelper.cancelHint(true);
			}
			if (linkModeHelper && linkModeHelper.getLinkMode()) {
				linkModeHelper.exitLinkMode(false);
			}
			if (popupModeHelper && popupModeHelper.getPopupMode()) {
				popupModeHelper.deactivate();
			}

			if (termModeHelper && termModeHelper.getTermMode()) {
				var oTranslationSevice = this.context.service.translation;
				if (oTranslationSevice) {
					oTranslationSevice.hideTermUI().done();
				}
			}
			if (this.oUIContainer) {
				this.oUIContainer.removeAllContent();
			}
		},

		/**
		 * Init the context for terms service.
		 * <p>
		 * This method inits the terms service with current content status.
		 * @param 	oContentStatus 	{object}, the current content status.
		 */
		initTermsContext: function(oContentStatus) {
			return termModeHelper.initTermsContext(oContentStatus);
		},

		/**
		 * Replace the current value with return value of terms service.
		 * <p>
		 * This method replaces the current value with value of terms service.
		 * @param 	sTerm 	{string}, the return value from terms service.
		 */
		replaceByTerm: function(sTerm) {
			return termModeHelper.replaceByTerm(sTerm);
		},

		_showTranslationProposals: function(oEditorService, oContentStatus) {
			if (!oContentStatus.prefix) {
				oContentStatus.prefix = "";
			}
			var status = this.initTermsContext(oContentStatus);
			if (status) {
				if (status.stringValue != null) { // inside a quotation mark
					var oTranslationSevice = this.context.service.translation;
					var that = this;
					return oEditorService.getSelection().then(function(selection) {
						return oTranslationSevice.showGetTermsUI(that.replaceByTerm, status.stringValue, false, true, true, {
							left: oContentStatus.coords.pageX,
							top: oContentStatus.coords.pageY,
							container: status.container
						}, {
							document: selection.document
						});
					});
				}
			}
		},

		/**
		 * Show a UI element to show all suggested proposals.
		 * <p>
		 * This method will list all suggested proposals in a UI element for users to choose in code completion scenario.
		 * @param 	aProposals 	{array}, the proposals list.
		 * @param 	oCoords 	{pageX:Number, pageY:Number}, the position for suggestion popup.
		 * @param 	sPrefix 	{string}, the prefix for current input word.
		 */
		showSuggestions: function(aProposals, oCoords, sPrefix) {
			this.aProposals = aProposals;
			this.oCoords = oCoords;
			this.sPrefix = sPrefix;
			if (this.aProposals.length == 0) {
				popupModeHelper.deactivate();
				hintModeHelper.showHtmlHint();
				return;
			}

			var newSelected = 0;
			while ((newSelected < this.aProposals.length - 1) && (this.aProposals[newSelected].unselectable)) {
				newSelected++;
			}
			this.selectedIndex = newSelected;

			if (aProposals) {
				popupModeHelper.showPopup();
			}

		},

		replace: function(index) {
			var insertTerm = this.getInsertTerm(index);
			var self = this;
			if (this._oEditorControl && this._oEditorControl.oEditor) {
				var cursorPosition = this._oEditorControl.getCursorPosition();
				var nColStart, nColEnd, nPrefix = 0;
				if (this.sPrefix) {
					nPrefix = this.sPrefix.length;
				}

				if (insertTerm.overwrite) {
					nColStart = cursorPosition.column - nPrefix;
					nColEnd = cursorPosition.column;
				} else {
					nColStart = cursorPosition.column;
					nColEnd = cursorPosition.column;
				}
				var range = _adjustRangeBySelection(this._oEditorControl.getSelectionRange(), cursorPosition.row, nColStart, cursorPosition.row,
					nColEnd);
				var oRange = this._oEditorControl.getRange(range.start.row, range.start.column, range.end.row, range.end.column);
				this._oEditorControl.replace(oRange, insertTerm.proposal);
			}

			setTimeout(function() {
				if (popupModeHelper.getPopupMode()) {
					popupModeHelper.deactivate();
				}
				if (hintModeHelper.getHintMode()) {
					hintModeHelper.showHint(undefined, undefined, undefined, self.oContentStatus.bSuffix);
				}
				linkModeHelper.enterLinkMode(insertTerm);
			}, 0);
		},

		getInsertTerm: function(index) {
			if (popupModeHelper.getPopupMode()) {
				var selectedIdx, selectedValue;
				if (index >= 0) {
					selectedValue = this.aProposals[index];
				} else {
					selectedIdx = jQuery(popupModeHelper.current()).attr("selected_id");
					selectedValue = this.aProposals[selectedIdx];
				}
				return selectedValue;
			} else {
				if (!this.selectedIndex) {
					this.selectedIndex = 0;
				}
				return this.aProposals[this.selectedIndex];

			}
		},

		isShowPopup: function() {
			if (popupModeHelper && popupModeHelper.getPopupMode()) {
				return true;
			} else {
				return false;
			}
		},

		getSetting: function() {
			return {
				hintCode: this._iHintLevel > 0 ? true : false,
				hintComment: this._bHintComment
			};
		},

		setSetting: function(oSetting) {
			this._iHintLevel = oSetting.hintCode ? 2 : 0;
			this._bHintComment = oSetting.hintComment;
		}
	};
});