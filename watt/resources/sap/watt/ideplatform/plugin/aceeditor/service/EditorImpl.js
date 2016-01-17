define(["./EditorMode", "./EditorContextMenu", "./EditorGutterContextMenu", "../control/Editor",
	"sap/watt/common/plugin/platform/service/ui/AbstractEditor"], function(EditorMode, EditorContextMenu, EditorGutterContextMenu, dummy,
	AbstractEditor) {
	"use strict";

	var AceEditor = AbstractEditor.extend("sap.watt.common.plugin.aceeditor.service.AceEditor", {});

	jQuery.extend(AceEditor.prototype, {

		_oEditor: null,
		_oDocument: null,
		_oContentStatus: null,
		_oUserSettings: null,
		_mEditorModes: null,
		_mEditorContextMenus: null,
		_mEditorGutterContextMenus: null,

		init: function() {
			this._aStyles = [];
			// Base style for all instances
			this._aStyles.push({
				"uri": "sap.watt.ideplatform.aceeditor/css/aceeditor.css"
			});
			this._mEditorModes = {};
			this._oContentStatus = {
				buffer: "",
				offset: 0,
				prefix: ""
			};
			this._oUserSettings = {
				theme: "ace/theme/sap-cumulus",
				showInvisibles: false
			};
			this.context.service.aceeditor.config.attachEvent("preferencesSaved", this.onPreferencesSaved, this);
			return this.context.event.fireInit();
		},

		configure: function(mConfig) {
			if (mConfig.modes) {
				this._createEditorModes(mConfig.modes);
			}
			if (mConfig.editorContextMenu) {
				this._createEditorContextMenu(mConfig.editorContextMenu);
			}
			if (mConfig.editorGutterContextMenu) {
				this._createEditorGutterContextMenu(mConfig.editorGutterContextMenu);
			}
			if (mConfig.styles) {
				this._aStyles = this._aStyles.concat(mConfig.styles);
			}
			this._todoTag = mConfig.todoTag;
		},

		_onEditorNativeContextMenu: function(oEvent) {
			var that = this;
			that.clientX = oEvent.mParameters.mouseEvent.domEvent.clientX;
			that.clientY = oEvent.mParameters.mouseEvent.domEvent.clientY;
			var sGroup;
			var sFileExtension = this._oDocument.getEntity().getFileExtension();
			sGroup = this._getMenuGroup(sFileExtension);

			this.context.service.commandGroup.getGroup(sGroup).then(function(oGroup) {
				that._oContextMenuGroup = oGroup;
				return that.context.service.contextMenu.open(that._oContextMenuGroup,
					that.clientX,
					that.clientY);
			}).done();

		},

		_onEditorGutterMousedown: function(oEvent) {
			var that = this;
			// Handle here only mouse right click button.
			if (oEvent.mParameters.mouseEvent.getButton() !== 2) {
				return;
			}

			that.clientX = oEvent.mParameters.mouseEvent.domEvent.clientX;
			that.clientY = oEvent.mParameters.mouseEvent.domEvent.clientY;
			var sFileExtension = this._oDocument.getEntity().getFileExtension();
			var sGroup = this._getGutterMenuGroup(sFileExtension);

			this.context.service.commandGroup.getGroup(sGroup).then(function(oGroup) {
				that._oContextMenuGroup = oGroup;
				return that.context.service.contextMenu.open(that._oContextMenuGroup,
					that.clientX,
					that.clientY);
			}).done();
		},

		_getMenuGroup: function(sFileExtension) {
			try {
				return this._mEditorContextMenus[sFileExtension].menuGroup;
			} catch (e) {
				return "commonContextMenu";
			}

		},

		_getGutterMenuGroup: function(sFileExtension) {
			try {
				return this._mEditorGutterContextMenus[sFileExtension].menuGroup;
			} catch (e) {
				return undefined;
			}

		},

        onPreferencesSaved: function(oEvent) {
			var sTheme = oEvent.params.theme;
			if (sTheme) {
                this.setTheme(sTheme);
			}
			var sFontSize = oEvent.params.fontSize;
            if (sFontSize) {
                this.setFontSize(sFontSize + "px");
            }
		},

		_createEditorModes: function(aModes) {
			for (var i = 0; i < aModes.length; i++) {
				var mMode = aModes[i];
				var sType = mMode.type;
				this._mEditorModes[sType] = new EditorMode(sType, mMode.description, mMode.extension, mMode.path, mMode.prio);
				// External mode
				if (mMode.path) {
					var url = require.toUrl(mMode.path);
					this.setModuleUrl("ace/mode/" + sType, url);
				}
			}
		},

		_createEditorContextMenu: function(aContextMenu) {
			this._mEditorContextMenus = {};
			for (var j = 0; j < aContextMenu.length; j++) {
				var contextMenu = aContextMenu[j];
				var sExtension = contextMenu.extension;
				this._mEditorContextMenus[sExtension] = new EditorContextMenu(sExtension, contextMenu.menuGroup);
			}
		},

		_createEditorGutterContextMenu: function(aContextMenu) {
			this._mEditorGutterContextMenus = {};
			for (var j = 0; j < aContextMenu.length; j++) {
				var contextMenu = aContextMenu[j];
				var sExtension = contextMenu.extension;
				this._mEditorGutterContextMenus[sExtension] = new EditorGutterContextMenu(sExtension, contextMenu.menuGroup);
			}
		},

		_getModeFromPath: function(path) {
			var mode = "/ace/mode/text"; //fallback to text

			if (path) {
				var fileName = path.split(/[\/\\]/).pop();
				for (var type in this._mEditorModes) {
					if (this._mEditorModes.hasOwnProperty(type)) {
						if (this._mEditorModes[type].supportsFile(fileName)) {
							mode = this._mEditorModes[type].mode;
							break;
						}
					}
				}
			}
			return mode;
		},

		_onClose: function() {
			this.context.event.fireBeforeClosing().done();
		},

		_onEditorRenderDone: function(oEvent) {
			var oControl = oEvent.getParameter("control");
			this.context.event.fireRendered({
				control: oControl
			}).done();
		},

		_onChangeSession: function(oEvent) {
			var oControl = oEvent.getParameter("control");
			this.context.event.fireChangeSession({
				control: oControl
			}).done();
		},

		_onEditorScroll: function(oEvent) {
			this.context.event.fireScroll().done();
		},

		_onUndoRedoStateChange: function(oEvent) {
			this.context.service.command.invalidateAll().done();
		},
		
		_onContentFormatted: function(oEvent) {
			var oDocument = oEvent.getParameter("document");
			var sValue = oEvent.getParameter("value");
			var sFileName = oDocument.getEntity().getName();
			oDocument.setContent(sValue, this.context.self).done();
			this.context.service.usernotification.info(this.context.i18n.getText("i18n", "msg_file_changed", [sFileName])).done();
		},
		
		/**
		 * Opens a document in the editor control
		 * <p>
		 * If the document is not being edited (in any tab), a new edit session will be created and the control will be filled with the document content.
		 * @param {Document} oDocument the document to open
		 * @param {boolean} bForceRefresh whether to force refresh the editor (default is false; set to true when the document in current tab is reloaded)
		 */
		open: function(oDocument, bForceReload, oEditorControl, sFileMode, bDontFireOpened) {
			if (!oEditorControl) {
				oEditorControl = this._getEditor();
			}
			AbstractEditor.prototype.open.apply(this, arguments);
			var sFilePath = oDocument.getEntity().getFullPath();
			this._sTargetFile = sFilePath;
			if (!sFileMode) {
				sFileMode = this._getModeFromPath(sFilePath);
			}
			var that = this;

			return this.context.service.aceeditor.config.getUserSetting().then(function(mSettings) {
				that.initUserSettings(mSettings);
				return oEditorControl.open(oDocument, sFileMode, bForceReload).then(function() {
					if (!bDontFireOpened) {
						return that.context.event.fireOpened({
							document: oDocument
						});
					}
				});
			}).then(function() {
				return that.context.event.fireSelectionChanged();
			});
		},

		initUserSettings: function(mSettings) {
			if (mSettings) {
				if ((mSettings.theme != undefined) && (mSettings.theme != "")) {
					this._oUserSettings.theme = mSettings.theme;
				}

				if ((mSettings.fontSize != undefined) && (mSettings.fontSize != "")) {
					this._oUserSettings.fontSize = mSettings.fontSize;
				}

				if ((mSettings.showInvisibles != undefined) && (mSettings.showInvisibles != "")) {
					this._oUserSettings.showInvisibles = mSettings.showInvisibles;
				}
			}

			if (this._oUserSettings.fontSize && this._oUserSettings.fontSize != this._getEditor().getProperty("fontSize")) {
				this._getEditor().setFontSize(this._oUserSettings.fontSize + "px");
			}

			if (this._oUserSettings.theme != this._getEditor().getProperty("theme")) {
				this._getEditor().setTheme(this._oUserSettings.theme);
			}

			if (this._oUserSettings.showInvisibles != this._getEditor().getShowInvisibles()) {
				this._getEditor().setShowInvisibles(this._oUserSettings.showInvisibles);
			}
		},
		/**
		 *	Writes the content in the editor into current document
		 */
		flush: function() {
			var s = this._getEditor().getValue();
			if ((s !== null) && (this.getReadOnly() !== true)) {
				this._oDocument.setContent(s, this.context.self).done();
			}
		},

		/**
		 * Clean up the edit session of a document
		 * <p>
		 * This method cleans up the edit session of a document.
		 * @param {Document} oDocument the document to close
		 */
		close: function(oDocument) {
			AbstractEditor.prototype.close.apply(this, arguments).done();
			return this._getEditor().close(oDocument);
		},

		getTitle: function() {
			return this._oDocument.getEntity().getName();
		},

		getTooltip: function() {
			return this._oDocument.getEntity().getFullPath();
		},

		getWordSuggestions: function() {
			throw new Error(this.context.i18n.getText("i18n", "msg_no_implemented"));
		},

		/**
		 * Undo the current edit session
		 */
		undo: function() {
			this._getEditor().undo();
		},

		/**
		 * Get whether any undo operation is available for the current edit session
		 * @return {boolean} whether undo is available
		 */
		hasUndo: function() {
			return this._getEditor().hasUndo();
		},

		/**
		 * Redo the current edit session
		 */
		redo: function() {
			this._getEditor().redo();
		},

		/**
		 * Get whether any redo operation is available for the current edit session
		 * @return {boolean} whether redo is available
		 */
		hasRedo: function() {
			return this._getEditor().hasRedo();
		},

		/**
		 * Mark the current edit session as clean from changes i.e. has been saved or newly opened
		 */
		markClean: function() {
			return this._getEditor().markClean();
		},

		/**
		 * Get whether the current edit session has been modified since the last save
		 * @return {boolean} whether the current edit session is clean
		 */
		isClean: function() {
			return this._getEditor().isClean();
		},

		_createEditor: function() {
			if (!this._oEditor) {

				this._oEditor = new sap.watt.common.plugin.aceeditor.control.Editor();

				var oEditor = this._getEditor();
				oEditor.attachLiveChange(this.flush, this);
				oEditor.attachBeforeClosing(this._onClose, this);
				oEditor.attachChangeSession(this._onChangeSession, this);
				oEditor.attachRenderDone(this._onEditorRenderDone, this);
				oEditor.attachEditorScroll(this._onEditorScroll, this);
				oEditor.attachEditorNativeContextMenu(this._onEditorNativeContextMenu, this);
				oEditor.attachEditorGutterMousedown(this._onEditorGutterMousedown, this);
				oEditor.attachUndoRedoStateChange(this._onUndoRedoStateChange, this);
				oEditor.attachContentFormatted(this._onContentFormatted, this);
			}
			return this._oEditor;
		},

		_getEditor: function() {
			return this._createEditor();
		},

		getContent: function() {
			var that = this;
			if (this._aStyles) {
				return this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return that._createEditor();
				});
			}
			return this._createEditor();
		},

		/**
		 * Get editor content status.
		 * <p>
		 * This method will get the current content status for intellisence usage.
		 * @return 	the content status object {buffer:String, offset:Number, prefix:String, coords:{pageX:Number,pageY:Number}}
		 */
		getContentStatus: function(bCheckPosition, bCheckString, oEditor) {
			// TODO move this to the editor control			
			if (!oEditor) {
				oEditor = this._getEditor().oEditor;
			}

			if (oEditor) {
				this._oContentStatus.buffer = this._getBuffer(oEditor);
				this._oContentStatus.targetFile = this._sTargetFile;

				if (bCheckPosition) {
					this._oContentStatus.prefix = this._getPrefix(oEditor);
					this._oContentStatus.coords = this._getCoords(oEditor);
					this._oContentStatus.delimiter = this._getDelimiter(oEditor);
					this._oContentStatus.tab = this._getTab(oEditor);
					var positionStatus = this._getPositionStatus(oEditor);
					this._oContentStatus.offset = positionStatus.offset;
					this._oContentStatus.indentation = positionStatus.indentation;
					this._oContentStatus.bSuffix = positionStatus.bSuffix;
					this._oContentStatus.bComment = this._checkComment(oEditor);
					this._oContentStatus.token = this._getToken(oEditor);
					this._oContentStatus.cursorPosition = oEditor.getCursorPosition();
					this._oContentStatus.aRowTokens = this._getRowTokens(oEditor);
				}

				if (bCheckString) {
					this._oContentStatus.stringValue = this._getStringValue(oEditor);
				}
				return this._oContentStatus;
			}
		},

		getContentStatusByPosition: function(oPosition) {
			var oEditor = this._getEditor().oEditor;
			if (oEditor) {
				var contentStatus = {};
				contentStatus.buffer = this._getBuffer(oEditor);
				contentStatus.targetFile = this._sTargetFile;
				contentStatus.offset = this._getPositionStatus(oEditor, oPosition).offset;
				return contentStatus;
			}
		},

		_getStringValue: function(editor) {
			var session = editor.getSession();
			var cursorPosition = editor.getCursorPosition();
			var token = session.getTokenAt(cursorPosition.row, cursorPosition.column);
			if (token && (token.type === "string" || token.type === "string.attribute-value.xml")) {
				var length = token.value.length;
				if ((length > 1) && (token.start + length > cursorPosition.column)) { //in the string								
					if ((token.value[0] === token.value[length - 1]) && (token.value[0] === '\'' || token.value[0] === '"')) {
						this._oContentStatus.prefix = token.value.substring(1, cursorPosition.column - token.start);
						return token.value.substring(1, length - 1);
					}
				}
			}
			return undefined;
		},

		_checkComment: function(editor) {
			var session = editor.getSession();
			var cursorPosition = editor.getCursorPosition();
			var token = session.getTokenAt(cursorPosition.row, cursorPosition.column);
			if (token && (token.type.indexOf("comment") >= 0)) {
				return true;
			} else {
				return false;
			}
		},

		addString: function(sText, oEditor, bIndentNewLines) {
			// TODO move this to the editor control
			if (!oEditor) {
				oEditor = this._getEditor().oEditor;
			}
			if (bIndentNewLines) {
				var iCurrentRow = oEditor.getCursorPosition().row;
				var sLine = oEditor.getSession().getLine(iCurrentRow);
				var sIndentString = oEditor.getSession().getMode().$getIndent(sLine);
				sText = sText.replace(/\n/g, "\n" + sIndentString);
			}
			oEditor.getSession().insert(oEditor.getCursorPosition(), sText);
		},

		getCurrentSelection: function(oEditor) {
			// TODO move this to the editor control
			if (!oEditor) {
				oEditor = this._getEditor().oEditor;
			}
			return (!oEditor.getSelection().isEmpty()) ? oEditor.getCopyText() : "";
		},

		cutCurrentSelection: function(oEditor) {
			// TODO move this to the editor control
			if (!oEditor) {
				oEditor = this._getEditor().oEditor;
			}
			var sSelection = (!oEditor.getSelection().isEmpty()) ? oEditor.getCopyText() : "";
			oEditor.remove(oEditor.getSelectionRange());
			return sSelection;
		},

		deleteCurrentSelection: function() {
			this._getEditor().deleteCurrentSelection();
		},

		getSelectionRanges: function(oEditor) {
			if (!oEditor) {
				oEditor = this._getEditor().oEditor;
			}
			var ret = null;
			if (!oEditor.getSelection().isEmpty()) {
				ret = oEditor.getSelection().toJSON();
				if (!(ret instanceof Array)) {
					ret = [ret];
				}
			}
			return ret;
		},

		setHighlight: function(data, clazz, type) {
			var hlData;
			if (data && data.length > 0) {
				this._getEditor().oEditor.getSelection().fromJSON(data);
				if (!clazz) {
					clazz = "ace_highlight-marker";
				}
				if (!type) {
					type = "background";
				}
				var i;
				var range, rclazz, rtype;
				if (this._getEditor().oEditor.getSelection().rangeCount > 0) {
					hlData = this._getEditor().oEditor.getSelection().ranges;
					// hlData and data may not have the same size
					var num = Math.min(hlData.length, data.length);
					for (i = 0; i < num; i++) {
						rclazz = hlData[i].clazz || data[i].clazz || clazz;
						rtype = hlData[i].type || data[i].type || type;
						hlData[i].markerId = this._getEditor().addMarker(hlData[i], rclazz, rtype);
					}
				} else {
					range = this._getEditor().oEditor.getSelection().getRange();
					if (range) {
						rclazz = range.clazz || data[0].clazz || clazz;
						rtype = range.type || data[0].type || type;
						range.markerId = this._getEditor().addMarker(range, rclazz, rtype);
						hlData = [range];
					}
				}
			}
			return hlData;
		},

		_getBuffer: function(editor) {
			var buffer = "";
			var session = editor.getSession();
			var doc = session.getDocument();
			var lines = doc.getAllLines();
			var delimiter = this._getDelimiter();

			var lineCount = lines.length;
			for (var i = 0; i < lineCount; i++) {
				buffer += lines[i];
				if (i < lineCount - 1) {
					buffer += delimiter;
				}
			}

			return buffer;
		},

		_getPositionStatus: function(editor, position) {
			var session = editor.getSession();
			var doc = session.getDocument();
			var lines = doc.getAllLines();
			if (!position) {
				position = editor.getCursorPosition();
			} else {
				position.row = Math.min(position.row, lines.length - 1);
			}

			// caculate indentation
			var curLine = lines[position.row];
			var index = 0;
			while (index < curLine.length && /\s/.test(curLine.charAt(index))) {
				index++;
			}
			var indentation = curLine.substring(0, index);

			// caculate offset
			var offset = 0;
			var row = 0;
			var bSuffix = false;

			while (row < position.row) {
				offset += lines[row].length + 1;
				row++;
			}
			offset += position.column;

			if (position.column < lines[row].length) {
				bSuffix = true;
			}

			return {
				indentation: indentation,
				offset: offset,
				bSuffix: bSuffix
			};
		},

		_getPrefix: function(editor) {
		    var cursorPosition = editor.getCursorPosition();
		    var token =  this._getToken(editor);
		    if (!token || !token.value) {
				return "";
			}
			var prefix = token.value.substr(0, cursorPosition.column - token.start);
			var pattern = /;|\(|\)|\n|\s/;
			
			if (pattern.test(prefix.charAt(prefix.length - 1))) {
				return "";
			}
 			//var wordRegex = /[^a-zA-Z_0-9\$\u00A2-\uFFFF]+/;
 			//prefix = prefix.split(wordRegex).slice(-1)[0];
			return prefix;
		},
		
		_getToken: function(oEditor){
		    var session = oEditor.getSession();
			var cursorPosition = oEditor.getCursorPosition();

			return  session.getTokenAt(cursorPosition.row, cursorPosition.column);
		},
		
		_getRowTokens: function(oEditor){
		    var session = oEditor.getSession();
			var cursorPosition = oEditor.getCursorPosition();
			return session.getTokens(cursorPosition.row);
		},

		_getCoords: function(editor) {
			var cursorPosition = editor.getCursorPosition();
			return editor.renderer.textToScreenCoordinates(cursorPosition.row, cursorPosition.column);
		},

		_getDelimiter: function(editor) {
			return "\n";
		},

		_getTab: function(editor) {
			return "\t";
		},

		/**
		 * show find
		 * <p>
		 * This method will show the find ui of ace editor
		 */
		showFind: function() {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl && oEditorCtrl.isVisible()) {
				oEditorCtrl.oEditor.execCommand("find");
			} else {
				sap.ui.commons.MessageBox.alert(this.context.i18n.getText("i18n", "msg_no_fileopen"), "WARNING", this.context.i18n.getText(
					"i18n", "dlg_warning"));
			}
		},
		/**
		 * show replace
		 * <p>
		 * This method will show the find ui of ace editor
		 */
		showReplace: function() {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl && oEditorCtrl.isVisible()) {
				oEditorCtrl.oEditor.execCommand("replace");
			} else {
				sap.ui.commons.MessageBox.alert(this.context.i18n.getText("i18n", "msg_no_fileopen"), "WARNING", this.context.i18n.getText(
					"i18n", "dlg_warning"));
			}
		},

		getUI5Editor: function() {
			return this._getEditor();
		},

		addEventListener: function(name, handler) {
			this._getEditor().addEventListener(name, handler);
		},

		removeEventListener: function(name, handler) {
			this._getEditor().removeEventListener(name, handler);
		},

		indexToPosition: function(index, startRow) {
			return this._getEditor().indexToPosition(index, startRow);
		},

		positionToIndex: function(pos, startRow) {
			return this._getEditor().positionToIndex(pos, startRow);
		},

		getMarkers: function(inFront) {
			return this._getEditor().getMarkers(inFront);
		},

		removeMarker: function(markerId) {
			this._getEditor().removeMarker(markerId);
		},

		addMarker: function(range, clazz, type, inFront) {
			return this._getEditor().addMarker(range, clazz, type, inFront);
		},

		clearAnnotations: function() {
			this._getEditor().clearAnnotations();
		},

		setAnnotations: function(annotations, enableLiveLinting) {
			var editor = this._getEditor();
			editor.setAnnotations(annotations);
			if (enableLiveLinting) {
				editor.setInlineAnnotations(annotations);
			} else {
				editor.clearInlineAnnotations();
			}
		},

		getAnnotations: function() {
			return this._getEditor().getAnnotations();
		},

		getCurrentRowAnnotations: function() {
			var aCurrentRowAnnotations = [];
			var aAnnotationTexts = [];

			var oCursorPosition = this._getEditor().getCursorPosition();
			var iRowPosition = oCursorPosition.row;

			var aAnnotations = this._getEditor().getAnnotations();
			var aAnnotationsLength = aAnnotations.length;
			var oAnnotation;

			var i;
			for (i = 0; i < aAnnotationsLength; i++) {
				oAnnotation = aAnnotations[i];
				if (oAnnotation.row === iRowPosition) {
					// needed due to the fact that annotations with same text are only displayed once
					if (aAnnotationTexts.indexOf(oAnnotation.raw) === -1) {
						aAnnotationTexts.push(oAnnotation.raw);
						aCurrentRowAnnotations.push(oAnnotation);
					}
				}
			}

			return aCurrentRowAnnotations;
		},

		gotoLine: function(lineNumber, column, animate) {
			this._getEditor().gotoLine(lineNumber, column, animate);
		},

		getRange: function(iStartRow, istartColumn, iEndRow, iEndCoulmn) {
			return this._getEditor().getRange(iStartRow, istartColumn, iEndRow, iEndCoulmn);
		},

		getFileURI: function() {
			return this._getEditor().getFileURI();
		},

		getCurrentFilePath: function() {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl && oEditorCtrl.isVisible()) {
				return this._sTargetFile;
			} else {
				return null;
			}
		},

		setModuleUrl: function(type, path) {
			ace.config.setModuleUrl(type, path);
		},

		setBreakpoint: function(row, className) {
			this._getEditor().setBreakpoint(row, className);
		},

		clearBreakpoint: function(row) {
			this._getEditor().clearBreakpoint(row);
		},

		removeGutterDecoration: function(row, className) {
			this._getEditor().removeGutterDecoration(row, className);
		},

		addGutterDecoration: function(row, className) {
			this._getEditor().addGutterDecoration(row, className);
		},

		replaceAll: function(replacement, options) {
			return this._getEditor().replaceAll(replacement, options);
		},

		find: function(needle, options, animate) {
			this._getEditor().find(needle, options, animate);
		},

		getTabSize: function() {
			return this._getEditor().getTabSize();
		},
		moveCursorToPosition: function(pos) {
			this._getEditor().moveCursorToPosition(pos);
		},

		getNativeEditor: function() {
			return this._getEditor().getNativeEditor();
		},

		getTextRange: function(iStartRow, istartColumn, iEndRow, iEndCoulmn) {
			return this._getEditor().getTextRange(iStartRow, istartColumn, iEndRow, iEndCoulmn);
		},

		clearSelection: function() {
			this._getEditor().clearSelection();
		},

		getValue: function() {
			return this._getEditor().getValue();
		},

		setValue: function(sValue) {
			this._getEditor().setValue(sValue);
		},

		setTheme: function(sTheme) {
			this._getEditor().setTheme(sTheme);
		},

		getTheme: function() {
			if (!this._oDocument) {
				var that = this;
				return this.context.service.aceeditor.config.getUserSetting().then(function(mSettings) {
					if (mSettings && (mSettings.theme != undefined) && (mSettings.theme != "")) {
						return mSettings.theme;
					} else {
						return that._getEditor().getTheme();
					}
				});
			} else {
				return this._getEditor().getTheme();
			}
		},

		setFontSize: function(sFontSize) {
			this._getEditor().setFontSize(sFontSize);
		},

		setFocus: function() {
			this._getEditor().setFocus();
		},
		getFocusElement: function() {
			return this._getEditor().getFocusElement();
		},

		toggleComment: function() {
			this._getEditor().toggleComment();
		},
		toggleBlockComment: function() {
			this._getEditor().toggleBlockComment();
		},
		getSelection: function() {
			return Q({
				document: this._oDocument
			}); //could include more properties, e.g. lines of a selected text
		},
		getSelectionRange: function() {
			return this._getEditor().getSelectionRange();
		},
		getVisible: function() {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl && oEditorCtrl.isVisible()) {
				return true;
			} else {
				return false;
			}
		},
		toggleShowInvisibles: function() {
			this._getEditor().toggleShowInvisibles();
			this._oUserSettings.showInvisibles = this._getEditor().getShowInvisibles();
			this.context.service.aceeditor.config.setUserSetting(this._oUserSettings).done();
		},
		getName: function() {
			return this.context.self._sName;
		},
		addTodo: function() {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl && this._todoTag) {
				var range = oEditorCtrl.getSelectionRange();
				var curline = oEditorCtrl.getLine(range.start.row);
				if ((curline.indexOf(this._todoTag) < 0) && oEditorCtrl.oEditor && oEditorCtrl.oEditor.getSession()) {
					var doc = oEditorCtrl.oEditor.getSession().doc;
					if (doc) {
						doc.insertInLine({
							row: range.start.row,
							column: range.start.column
						}, this._todoTag);
					}
				}
			}
		},
		hasTodoTag: function() {
			return !!this._todoTag;
		},

		expandAll: function() {
			this._getEditor().expandAll();
		},

		collapseAll: function() {
			this._getEditor().collapseAll();
		},

		executeCommand: function(name) {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl) {
				oEditorCtrl.executeCommand(name);
			}
		},
		getReadOnly: function() {
			var oEditorCtrl = this._getEditor();
			if (oEditorCtrl) {
				return oEditorCtrl.getReadOnly();
			}
			return false;
		}

	});

	return AceEditor;
});