jQuery.sap.declare("sap.watt.common.plugin.aceeditor.control.Editor");

jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ace");
jQuery.sap.require("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict.ext-searchbox");

sap.ui.core.Control.extend("sap.watt.common.plugin.aceeditor.control.Editor", {

	metadata : {
		properties : {
			"width" : {
				type : "sap.ui.core.CSSSize",
				defaultValue : "100%"
			},
			"height" : {
				type : "sap.ui.core.CSSSize",
				defaultValue : "100%"
			},
			"value" : "string",
			"showPrintMargin" : {
				type : "boolean",
				defaultValue : false
			},
			"annotations" : {
				type : "object",
				defaultValue : {}
			},
			"readOnly" : {
				type : "boolean",
				defaultValue : false
			},
			"fontSize" : {
				type : "sap.ui.core.CSSSize",
				defaultValue : "12px"
			},
			"theme" : {
				type : "string",
				defaultValue : "ace/theme/sap-cumulus"
			},
			"mode" : {
				type : "string",
				defaultValue : "ace/mode/javascript"
			},
			"gutterAnnotations" : {
				type : "array",
				defaultValue : []
			}
		},
		events : {
			"liveChange" : {},
			"renderDone" : {},
			"beforeClosing" : {},
			"editorScroll" : {},
			"changeSession" : {},
			"editorNativeContextMenu" : {},
			"undoRedoStateChange" : {},
			"editorGutterMousedown": {},
			"contentFormatted": {}
		}
	},

	init : function() {
	    this._sTargetFile = ""; // current file being edited

	    this._aSessions = []; // array storing edit sessions
		this._isDocumentOpening = false;

		ace.config.set("basePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
		ace.config.set("modePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
		ace.config.set("themePath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
		ace.config.set("workerPath", jQuery.sap.getModulePath("sap.watt.ideplatform.plugin.aceeditor.control.lib.ace-noconflict"));
		
		sap.ui.core.ResizeHandler.register(this, jQuery.proxy(this._onResize, this));
                
	},

    _onResize : function() {
    	this.refresh();
    },
    
	refresh : function() {
		// force resize to re-render textual content
		if (this.oEditor) {
			this.oEditor.resize(true);
		}
	},

	getSession : function() {
		return this.oEditor ? this.oEditor.getSession() : null;
	},

	setSession : function(oSession) {
	    if (this.oEditor){
	        this.oEditor.setSession(oSession);
	    }
	},

	createSession : function(oDocument, oTextMode) {
		var oSession = ace.createEditSession("", this.getMode());
		return oSession;
	},

	setDocOpenStatus : function(bValue) {
		this._documentOpened = bValue;
	},

	// return the live content of current edit session
	getValue : function() {
		return this.getSession() && this.getSession().getValue();
	},

	setValue : function(sValue) {
		this.getSession().setValue(sValue);
	},

	getDocument : function() {
		this.oEditor.getSession().getDocument();
	},

	_getUndoManager : function() {
		return this.getSession() && this.getSession().getUndoManager();
	},

	undo : function() {
		var oUndoManager = this._getUndoManager();
		if (oUndoManager) {
			oUndoManager.undo(false);
			this.setFocus();
		}
	},

	redo : function() {
		var oUndoManager = this._getUndoManager();
		if (oUndoManager) {
			oUndoManager.redo(false);
			this.setFocus();
		}
	},

	hasUndo : function() {
		var result = false;
		if (this._documentOpened) {
			result = this._getUndoManager().hasUndo();
		}
		return result;
	},

	hasRedo : function() {
		var result = false;
		if (this._documentOpened) {
			result = this._getUndoManager().hasRedo();
		}
		return result;
	},

	markClean : function() {
		var oUndoManager = this._getUndoManager();
		if (oUndoManager) {
			oUndoManager.markClean();
		}
	},

	isClean : function() {
		var result = false;
		var oUndoManager = this._getUndoManager();
		if (oUndoManager) {
			result = oUndoManager.isClean();
		}
		return result;
	},

	setShowPrintMargin : function(bShow) {
		this.setProperty("showPrintMargin", bShow, true);
		if (this.oEditor) {
			this.oEditor.setShowPrintMargin(bShow);
		}
	},

	setReadOnly : function(bReadOnly) {
		this.setProperty("readOnly", bReadOnly, true);
		if (this.oEditor) {
			this.oEditor.setReadOnly(bReadOnly);
		}
	},

	setFontSize : function(sFontSize) {
		this.setProperty("fontSize", sFontSize, true);
		if (this.oEditor) {
			this.oEditor.setFontSize(sFontSize);
		}
	},

	setAnnotations : function(oAnnotations) {
		this.formatAnnotations(oAnnotations);		
		this.setProperty("annotations", oAnnotations, true);
		if (this.oEditor) {
			this.oEditor.getSession().setAnnotations(oAnnotations);			
		}
	},
	
	setTheme : function(sTheme) {
		this.setProperty("theme", sTheme, true); 
		if (this.oEditor) {
			this.oEditor.setTheme(sTheme);
		}
	},
	
	setMode : function(sMode) {
		this.setProperty("mode", sMode, true); 
	},

	clearAnnotations : function() {
		if (this.oEditor) {
			this.oEditor.getSession().clearAnnotations();
			this.clearInlineAnnotations();
		}
	},

	hasAnnotations : function() {
		if (this.oEditor) {
			for ( var key in this.oEditor.getSession().getAnnotations()) {
				return true;
			}
		}
		return false;
	},	
	getSessionMarkers : function(){
		var session = this.getSession();		
		if (session){
			if (!session._aMarkerId){
				session._aMarkerId=[];
			}			
			return session._aMarkerId;
		}
		return [];
	},

	formatAnnotations : function(oAnnotations){
		if (oAnnotations && (oAnnotations.length)>0){
			for (var i = 0; i<oAnnotations.length; i++){
				var anno=oAnnotations[i];
				if (anno.text) {
					anno.html='<p class="errorType_'+anno.type+'">' 
								+ anno.text.replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/</g, "&#60;")
								+'</p>';				
					anno.text=undefined;
				}
			}			
		}
	},
	clearInlineAnnotations: function() {
		while ((this.getSessionMarkers()) && (this.getSessionMarkers().length > 0)) {
			var anno = this.getSessionMarkers().pop();
			this.removeMarker(anno[0]);
		}		
	},		
	setInlineAnnotations: function(annotations) {
		var aItemMarker=[], aMergedMarker=[];
		if (annotations && (annotations.length)>0){
			//The logic to deduct the range to paint is based on issue(annotation) structure originated
			//from eslint (annotation.source and column). It was adopted as the base issue-structure for every linter.
			for (var i = 0; i<annotations.length; i++){
				var anno=annotations[i],range;
				var source="";
				//
				if (anno.source !== undefined) {
					source=anno.source;
				} else {
					return;
					/*
					var token = this.getSession().getTokenAt(anno.row, anno.column+1);				
					if (token && token.value){
						source = token.value;
					} else if (anno.source!==undefined) {
						source =  anno.source;						
					}*/
				}		
				
				range = this.getRange(anno.row, anno.column+1, anno.row, anno.column+1+source.length);				
				aItemMarker.push([range,anno.type,anno.html]);
			}			
		}
		
		for (var i = 0; i<aItemMarker.length; i++){
			var itemMarker=aItemMarker[i];
			var bFound=false;
			for (var j = 0; j<aMergedMarker.length; j++){
				if ((itemMarker[0].start.row==aMergedMarker[j][0].start.row)&&(itemMarker[0].start.column==aMergedMarker[j][0].start.column)
					&&(itemMarker[0].end.row==aMergedMarker[j][0].end.row)&&(itemMarker[0].end.column==aMergedMarker[j][0].end.column)) {
						bFound=true;
						if (aMergedMarker[j][1]=="info") {
							aMergedMarker[j][1]=itemMarker[1];
						} else if ((aMergedMarker[j][1]=="warning") && (itemMarker[1]=="error")) {
							aMergedMarker[j][1]=itemMarker[1];
						}						
						aMergedMarker[j][2]+=itemMarker[2];
					}
			}
			if (!bFound) {
				aMergedMarker.push(itemMarker);
			}
		}
		
		aMergedMarker.sort(function(a, b){
			return (b[0].end.column-b[0].start.column)-(a[0].end.column-a[0].start.column);
		});		
		
			
		for (var i = 0; i<aMergedMarker.length; i++){
			this.getSessionMarkers().push([this.addMarker(aMergedMarker[i][0], "acmark_error "+"errorType_"+aMergedMarker[i][1]+" errorId_"+i, "line", true),i,aMergedMarker[i][2]]);					
	
		}
			
		
		
	},
	bindInlineToolTipEvents: function(){		
		if (this._errorTooltipTimer) {
			jQuery.sap.clearDelayedCall(this._errorTooltipTimer);
		}
			
		this._errorTooltipTimer = jQuery.sap.delayedCall(200, this, function() {
			var that = this;
			jQuery(".acmark_error").hover(
				function (e) {						
						var elem = e.target;
						if ((elem.className.indexOf('acmark_error')>=0) && (elem.className.indexOf('errorType')>=0)) {
							var classArr=elem.className.split(' ');
							var errorId=-1;
							var errorString='';
							for (var i = 0; i<classArr.length; i++){
								if (classArr[i].indexOf('errorId')>=0) {
									var tempArr=classArr[i].split('_');
									if (tempArr.length>1){
										errorId=parseInt(tempArr[1]);
										break;
									}
								}
							}
							if (errorId>-1){
								for (var i = 0; i<that.getSessionMarkers().length; i++){
									if (that.getSessionMarkers()[i][1]==errorId){
										errorString=that.getSessionMarkers()[i][2];
									}
								}
							}								
							if (errorString!='') {
								that.showInlineErrorToolTip(elem,errorString);									
							}
						}			
				},
				function (e) {				
					var elem = e.target;
					if ((elem.className.indexOf('acmark_error')>=0) && (elem.className.indexOf('errorId')>=0)) {
						if (that._oToolTip) {
							that._oToolTip.hide();									
						}						
					}
				}
			);
			
			if (that._oToolTip) {
				that._oToolTip.hide();									
			}						
			that._errorTooltipTimer=null;
		});
	},	
	showInlineErrorToolTip : function (elem, s) {
		if (!this._oToolTip){
			this._oToolTip= this.getToolTip();				
		} 
		if (this._oToolTip) {
			this._oToolTip.setHtml(s);
			this._oToolTip.show();	
			var rect = elem.getBoundingClientRect();
			var elem=this._oToolTip.getElement();
			var style = elem.style;
			
			var left = rect.right;
			var top =  rect.bottom;
			var width=elem.offsetWidth;
			var height=elem.offsetHeight;
			
			var offset=jQuery(this.oEditor.container).offset();
			var docWidth=offset.left+this.oEditor.container.offsetWidth;
			var docHeight=offset.top+this.oEditor.container.offsetHeight;
			
			if (left +  width> docWidth) {
				left=docWidth-width;
			}
			
			if (top +  height> docHeight) {
				top=rect.top - height;
			}
			
			style.left = left + "px";
			style.top = top + "px";
		}
	},
	getToolTip : function() {
		var Tooltip=ace.require("ace/tooltip").Tooltip;
		return new Tooltip(this.oEditor.container);
	},	
	getTextRange : function(iStartRow, istartColumn, iEndRow, iEndCoulmn) {
		var oRange = this.getRange(iStartRow, istartColumn, iEndRow, iEndCoulmn);
		return this.oEditor.getSession().getDocument().getTextRange(oRange);
	},

	getRange : function(iStartRow, istartColumn, iEndRow, iEndCoulmn) {
		var Range = ace.require("ace/range").Range;
		return new Range(iStartRow, istartColumn, iEndRow, iEndCoulmn);
	},

	setCursorPosition : function(oData) {
		this._cursorPosition = oData;
	},

	getGutterAnnotations : function() {
		return this.oEditor ? this.oEditor.renderer.$gutterLayer.$annotations : [];
	},

	setGutterAnnotations : function(aAnnotations) {
		this.oEditor.renderer.$gutterLayer.$annotations = aAnnotations;
	},

	setDocument : function(oDocument) {
		this._oDocument = oDocument;
	},

	/**
	 * Opens a document in the editor
	 * <p>
	 * If the document is not being edited (in any tab), a new edit session will be created and the control will be filled with the document content.
	 * @param {Document} oDocument the document to open
	 * @param {boolean} bForceRefresh whether to force refresh the editor (default is false; set to true when the document in current tab is reloaded)
	 */
	open : function(oDocument, sEditorMode, bForceReload) {
		var iIndex = this._getSessionIndex(this._sTargetFile);
		if (iIndex >= 0) { // store the gutter annotations only before switching tab
			this._aSessions[iIndex].gutterAnnotations = this.getGutterAnnotations();
		}
		this._isDocumentOpening = true;

		this._oDocument = oDocument;
		var sFilePath = oDocument.getEntity().getFullPath();
		this._sTargetFile = sFilePath;
		this.setCurrentFilePath(sFilePath);
		var that = this;
		if (this._aSessions.length > 0) {
			this.fireBeforeClosing();
		}
		return oDocument.getContent().then(function(sValue) {
			//Fallback for binary data, which should not be opened with this editor			
			var isBlobContent = false;
			if (sValue instanceof Blob){
				sValue = "Binary Data...";				
				isBlobContent =  true;
			}
			
			if (that._getSessionIndex(sFilePath) >= 0 && bForceReload) { // current tab in which document was reloaded
				that.reload(sValue); // let ace editor update its virtual renderer as oEditorControl is not re-rendered
			    that._isDocumentOpening = false;
			} else { // new tab or switch tab
				// value and mode are applied after rendering the editor control
				that.setDocument(oDocument);
				that.setDocOpenStatus(false);
				that.setMode(sEditorMode);
				
				return that._documentChanged(oDocument).then(function() {
					if (oDocument.isReadOnly() || isBlobContent ) {
						that.setReadOnly(true);
					} else {
						that.setReadOnly(false);
					}
				});
			}
		});
	},

	/**
	 * Clean up the edit session of a document
	 * <p>
	 * This method cleans up the edit session of a document.
	 * @param {Document} oDocument the document to close
	 */
	close : function(oDocument) {
		var sFilePath = oDocument.getEntity().getFullPath();
		var iIndex = this._getSessionIndex(sFilePath);
		if (iIndex !== -1) {

			var iDocNum = 0;

			for ( var i = 0; i < this._aSessions.length; i++) {
				if (this._aSessions[i].path === "") {
					continue;
				}
				iDocNum++;
			}

			if (iDocNum == 1) {
				this.fireBeforeClosing();
			}
			var oSession = this._aSessions[iIndex].session;
			oSession.removeAllListeners("change");
			oSession.removeAllListeners("changeMode");
			oSession.removeAllListeners("tokenizerUpdate");
			oSession.removeAllListeners("changeTabSize");
			oSession.removeAllListeners("changeWrapLimit");
			oSession.removeAllListeners("changeWrapMode");
			oSession.removeAllListeners("changeFold");
			oSession.removeAllListeners("changeFrontMarker");
			oSession.removeAllListeners("changeBackMarker");
			oSession.removeAllListeners("changeBreakpoint");
			oSession.removeAllListeners("changeAnnotation");
			oSession.removeAllListeners("changeOverwrite");
			oSession.removeAllListeners("changeScrollTop");
			oSession.removeAllListeners("changeScrollLeft");

			var oSelection = oSession.getSelection();
			oSelection.removeAllListeners("changeCursor");
			oSelection.removeAllListeners("changeSelection");
			oSelection.removeAllListeners("addRange");
			oSelection.removeAllListeners("removeRange");
			oSelection.removeAllListeners("singleSelect");
			oSelection.removeAllListeners("multiSelect");

            oSession.setUseWorker(false); // Stop workers
            
			this._aSessions.splice(iIndex, 1);
			var bAllClosed = this._aSessions.length === 0;
			this._documentOpened = false;
			if (bAllClosed) {
				this._sTargetFile = "";
				this.setCurrentFilePath("");
			}
		}
	},

	onAfterRendering : function() {
		if (!this._isDocumentOpening && this._oDocument) {
			this._documentChanged(this._oDocument).done();
		}
		this.oEditor = ace.edit(this.getId());
		this.oEditor.setSelectionStyle("text");
		var that = this;
		this.oEditor.on("changeSession", function() {
			that.fireChangeSession({
				control : that
			});
		});
		
		this.oEditor.renderer.on("afterRender", function(){
			that.bindInlineToolTipEvents();
		});
	
        /** +++++++++++++++++++++++++++++++++++++++++++++++++++++ */
		this.oEditor.on("nativecontextmenu", function(oEvent){
			oEvent.preventDefault();
			that.fireEditorNativeContextMenu({
				mouseEvent : oEvent
			});

		});
		/** ----------------------------------------------------- */
		this.oEditor.on("guttermousedown", function(oEvent) {
			oEvent.preventDefault();
			setTimeout(function() {	// Prevent focus stealing by ace editor
				that.fireEditorGutterMousedown({
					mouseEvent : oEvent
				});
			});
		});
	},
	_documentChanged : function(oDocument) {
		var that = this;
		return oDocument.getContent().then(function(sLatestContent) {
			//Fallback for binary data, which should not be opened with this editor
			var isBlobContent = false;
			if (sLatestContent instanceof Blob){
				sLatestContent = "Binary Data...";
				isBlobContent = true;
			}
			
			var oEditorElem = that.getDomRef();
			if (oEditorElem) {
				oEditorElem.addEventListener('contextmenu', function(evt) {
					evt.preventDefault();
				});
				that.oEditor = ace.edit(that.getId());
				that.oEditor.setTheme(that.getTheme());
				
				that._adjustCommandKeys();

				var bNewSession = that._sessionHandler(); // trigger new session?

				var oSession = that.oEditor.getSession();
				if (bNewSession) { // a brand new session
					oSession.setValue(sLatestContent);
					oSession.setMode(that.getMode());
					//if (oSession.doc) {
						//oSession.doc.setNewLineMode("unix");
					//}
					
					// define the emitter for document changes
					oSession.on("change", function(oEvent) {
                        if (that._isDocumentOpening) {
                            return;
                        }
						var sAction = oEvent.data.action;
						if (sAction && ( (sAction.indexOf('insert') != -1) || (sAction.indexOf('remove') != -1) ) ){
                            //ACE internally processes undoManager state in a timeout
							//to ensure undoManager state is consistent, we add a setTimout here to synchronize
							setTimeout(function() {
								that.fireLiveChange();
							}, 0);
						}
					});
					
					that._documentOpened = true;
					that._prevUndoState = that._prevRedoState = false;
					that.oEditor.on("input", function(oEvent) { // triggered by both user input or undo/redo command after Undo Mgr is updated
						var oUndoManager = that._getUndoManager();
						if (oUndoManager.hasUndo() !== that._prevUndoState || oUndoManager.hasRedo() !== that._prevRedoState) { // avoid excessively updating menu and toolbar
							that._prevUndoState = oUndoManager.hasUndo();
							that._prevRedoState = oUndoManager.hasRedo();
							that.fireUndoRedoStateChange();
						}
					});

					that.oEditor.commands.addCommand({
						name : 'Undo',
						bindKey : {
							win : 'Ctrl-Z',
							mac : 'Command-Z'
						},
						exec : function(editor) {
							that.undo();
						},
						readOnly : true
					// false if that command should not apply in readOnly mode
					});

					that.oEditor.commands.addCommand({
						name : 'Redo',
						bindKey : {
							win : 'Ctrl-Y',
							mac : 'Command-Y'
						},
						exec : function(editor) {
							that.redo();
						},
						readOnly : true
					// false if that command should not apply in readOnly mode
					});
				} else { // switch to an existing session						
					if (oSession.getValue() !== sLatestContent) { // document is overwritten by another plugin and content is reloaded
						oSession.setValue(sLatestContent);
						that._prevUndoState = that._prevRedoState = false; // since undo manager is reset after setValue()
					}
					that._documentOpened = true;
				}

				that.setReadOnly(that.getReadOnly() || isBlobContent);
				that.setShowPrintMargin(that.getShowPrintMargin());
				setTimeout(jQuery.proxy(that._navigate, that), 0);
				that._isDocumentOpening = false;
				var sValue = oSession.getValue();
				if (!oDocument.isReadOnly() && !(sValue instanceof Blob) && sValue !== sLatestContent) {
					that.fireContentFormatted({
						document: oDocument, 
						value: sValue
					});
				}
			} else {
				//on first open call, wait for editor control to be rendered.
				var oRenderDone = {
					onAfterRendering : function() {
						that._documentChanged(oDocument).done();
						that.removeEventDelegate(oRenderDone);
					}
				};
				that.addEventDelegate(oRenderDone);
			}
		});
	},

	_adjustCommandKeys : function() {
		//adjust command keys
		var foldOtherCMD = this.oEditor.commands.commands.foldOther;
		var foldAllCMD = this.oEditor.commands.commands.foldall;
		var unfoldAllCMD = this.oEditor.commands.commands.unfoldall;
		var copyLinesUpCMD = this.oEditor.commands.commands.copylinesup;
		var copyLinesDownCMD = this.oEditor.commands.commands.copylinesdown;
		var togglecommentCMD = this.oEditor.commands.commands.togglecomment;
		var toggleBlockCommentCMD = this.oEditor.commands.commands.toggleBlockComment;
		
		foldOtherCMD.bindKey = {
			win : "Alt-F2",
			mac : "Command-Option-F2"
		};
		foldAllCMD.bindKey = {
			win : "Ctrl-Alt-F2",
			mac : "Command-Alt-F2"
		};
		unfoldAllCMD.bindKey = {
			win : "Alt-Shift-F2",
			mac : "Alt-Shift-F2"
		};
		copyLinesUpCMD.bindKey = {
			win : "Alt-Shift-Up",
			mac : "Alt-Shift-Up"
		};
		copyLinesDownCMD.bindKey = {
			win : "Alt-Shift-Down",
			mac : "Alt-Shift-Down"
		};
		togglecommentCMD.bindKey = {
			win : "Ctrl-/|Alt-7",
			mac : "Command-/|Alt-7"
		};
		toggleBlockCommentCMD.bindKey = {
			win : "Ctrl-Shift-/|Ctrl-Shift-7",
			mac : "Command-Shift-/|Command-Shift-7"
		};


		this.oEditor.commands.removeCommand("foldOther");
		this.oEditor.commands.removeCommand("foldall");
		this.oEditor.commands.removeCommand("unfoldall");
		this.oEditor.commands.removeCommand("copylinesup");
		this.oEditor.commands.removeCommand("copylinesdown");
		this.oEditor.commands.removeCommand("togglecomment");
		this.oEditor.commands.removeCommand("toggleBlockComment");
		this.oEditor.commands.addCommand(foldOtherCMD);
		this.oEditor.commands.addCommand(foldAllCMD);
		this.oEditor.commands.addCommand(unfoldAllCMD);
		this.oEditor.commands.addCommand(copyLinesUpCMD);
		this.oEditor.commands.addCommand(copyLinesDownCMD);
		this.oEditor.commands.addCommand(togglecommentCMD);
		this.oEditor.commands.addCommand(toggleBlockCommentCMD);
	},

	// for .js/.xsjs/.xsjslib/.json-files do not use worker (match returns not null if regex was found)
	//The worker is used for syntax validation - thus, we disable ACE's syntax validation for the given file extentions
	_setUseWorker : function(oSession){
		if (oSession && this._sTargetFile){
			var match = this._sTargetFile.match(/\.js$|\.xsjs$|\.xsjslib$|\.json$/);
			if (match){
				oSession.setUseWorker(false);
			}
		}
	},

	_sessionHandler : function() {
		var iIndex = this._getSessionIndex(this._sTargetFile);
		var oSession;
		var bNewSession = false;

		if (iIndex === -1) {
			bNewSession = true;
			oSession = this.createSession();
			this._setUseWorker(oSession);
			oSession.setUseSoftTabs(false);

			this.setSession(oSession);
			this._aSessions.push({
				path : this._sTargetFile,
				session : oSession
			}); // store the new session
		} else {
			oSession = this._aSessions[iIndex].session;
			if (this.oEditor.getSession() !== oSession) { //otherwise, ace will return directly when set current session, and removing changeCursor will cause problems.
				if (oSession.getSelection()) {
					oSession.getSelection().removeAllListeners("changeCursor"); // residual event listeners would add unnecessary markers for brackets
				}
				this.setSession(oSession); // switch to the existing session
			}
		}

		if (this.oEditor) {
			oSession = this.oEditor.getSession();
			this._setUseWorker(oSession);

			var that = this;

			var onEditorBeforeRender = function () {
				if (that._aSessions[that._getSessionIndex(that._sTargetFile)]) {
					var aAnnotations = that._aSessions[that._getSessionIndex(that._sTargetFile)].gutterAnnotations;
					if (Array.isArray(aAnnotations) && aAnnotations.length > 0) {
						that.setGutterAnnotations(aAnnotations); // restore gutter annotations for this session
					}
				}
				that.oEditor.renderer.off('beforeRender', onEditorBeforeRender);
			};
			this.oEditor.renderer.on("beforeRender", onEditorBeforeRender);
			var onEditorAfterRender = function () {
				that.fireRenderDone({
					control : that
				});
				that.oEditor.renderer.off('afterRender', onEditorAfterRender);
				
				if (bNewSession) { // a fix for scroll bar refresh when open a new document again
					that.oEditor.renderer.scrollToY(1);									
					that.oEditor.renderer.updateFull(true);
					that.oEditor.renderer.scrollToY(0);				
				}
				
				that.setAnnotations(that.getAnnotations());
			};

			this.oEditor.renderer.on("afterRender", onEditorAfterRender);

			this._onScroll = function(oEvent) {
				that.fireEditorScroll();
			};

			this.getSession().off("changeScrollTop", this._onScroll);
			this.getSession().off("changeScrollLeft", this._onScroll);
			this.getSession().on("changeScrollTop", this._onScroll);
			this.getSession().on("changeScrollLeft", this._onScroll);
		}

		return bNewSession;
	},

	_getSessionIndex : function(sDocFullPath) {
		for ( var i = 0; i < this._aSessions.length; i++) {
			if (this._aSessions[i].path === sDocFullPath) {
				return i;
			}
		}
		return -1;
	},
	
	_navigate : function() {
		if (this.oEditor) {
			this.oEditor.focus();
			if (this._cursorPosition) {
				this.oEditor.moveCursorTo(this._cursorPosition.row, this._cursorPosition.column);
				this.oEditor.scrollToLine(this._cursorPosition.row, true, true, null);
			}
		}
	},

	reload : function(sValue) {
		this.oEditor.getSession().setValue(sValue); // also reset undo manager
		this._prevUndoState = this._prevRedoState = false;
		this.oEditor.renderer.updateFull(true); // update all layers
	},

	renderer : function(rm, oControl) {
		rm.write("<pre");
		rm.writeControlData(oControl);
		rm.writeClasses();
		rm.addStyle("position", "relative");
		rm.addStyle("font-size", oControl.getFontSize());
		rm.addStyle("line-height", "150%");
		rm.addStyle("width", oControl.getWidth());
		rm.addStyle("height", oControl.getHeight());
		rm.writeStyles();
		rm.write(">");
		if (oControl.getValue()) {
			rm.writeEscaped(oControl.getValue());
		}
		rm.write("</pre>");
	},

	addEventListener : function(name, handler) {
		var target = this.getSession();
		if (target) {
			if (name == 'changeCursor') {
				target = target.selection;
			} else if (name == 'gutterClick') {
				target = this.oEditor;
			}
			target.addEventListener(name, handler);
		}
	},

	removeEventListener : function(name, handler) {
		var target = this.getSession();
		if (target) {
			if (name == 'changeCursor') {
				target = target.selection;
			} else if (name == 'gutterClick') {
				target = this.oEditor;
			}
			target.removeEventListener(name, handler);
		}
	},

	getMarkers : function(inFront) {
		if (this.getSession()) {
			return this.getSession().getMarkers(inFront);
		}
		return null;
	},

	removeMarker : function(markerId) {
		if (this.getSession()) {
			this.getSession().removeMarker(markerId);
		}
	},

	indexToPosition : function(index, startRow) {
		if (this.getSession() && this.getSession().doc) {
			return this.getSession().doc.indexToPosition(index, startRow);
		}
		return null;
	},

	positionToIndex : function(pos, startRow) {
		if (this.getSession() && this.getSession().doc) {
			if ((pos === null) || (pos === undefined)) {
				pos = this.oEditor.selection.getCursor();
			}
			return this.getSession().doc.positionToIndex(pos, startRow);
		}
		return null;
	},

	getLine : function(row) {
		if (this.getSession() && this.getSession().getDocument()) {
			return this.getSession().getDocument().getLine(row);
		}
		return null;
	},

	getAllLines : function() {
		if (this.getSession() && this.getSession().getDocument()) {
			return this.getSession().getDocument().getAllLines();
		}
		return null;
	},

	addMarker : function(range, clazz, type, inFront) {
		if (this.getSession()) {
			return this.getSession().addMarker(range, clazz, type, inFront);
		}
		return null;
	},

	setModuleUrl : function(name, subst) {
		ace.config.setModuleUrl(name, subst);
	},

	gotoLine : function(lineNumber, column, animate) {
		if (this.oEditor) {
			// perform sync rendering to ensure scrollToLine will work
			this.oEditor.renderer.updateFull(true);
			this.oEditor.gotoLine(lineNumber, column, animate);
		}
	},
	replace : function(range, text) {
		if (this.getSession()) {
			this.getSession().replace(range, text);
		}
	},

	getSelectionRange : function() {
		if (this.oEditor) {
			return this.oEditor.getSelectionRange();
		}
		return null;
	},

	getSelection : function() {
		if (this.oEditor) {
			return this.oEditor.getSelection();
		}
		return null;
	},

	clearSelection : function() {
		if (this.oEditor) {
			this.oEditor.clearSelection();
		}
	},

	getCursorPosition : function() {
		if (this.oEditor) {
			return this.oEditor.getCursorPosition();
		}
		return null;
	},

	moveCursorTo : function(row, column) {
		if (this.oEditor) {
			this.oEditor.moveCursorTo(row, column);
		}
	},

	setFocus : function() {
		if (this.oEditor) {
			this.oEditor.focus();
		}
	},
	getFocusElement : function() {
		if (this.oEditor) {
			return this.oEditor.textInput.getElement();
		}else{
			return this;
		}
	},
	navigateTo : function(row, column) {
		if (this.oEditor) {
			this.oEditor.navigateTo(row, column);
		}
	},
	getContainer : function() {
		if (this.oEditor) {
			return this.oEditor.container;
		}
		return null;
	},

	getFileURI : function() {
		return this.getId();
	},

	getAnnotations : function() {
		if (this.getSession()) {
			return this.getSession().getAnnotations();
		}
		return null;
	},

	setBreakpoint : function(row, className) {
		if (this.getSession()) {
			this.getSession().setBreakpoint(row, className);
		}
	},

	clearBreakpoint : function(row) {
		if (this.getSession()) {
			this.getSession().clearBreakpoint(row);
		}
	},

	removeGutterDecoration : function(row, className) {
		if (this.getSession()) {
			this.getSession().removeGutterDecoration(row, className);
		}
	},

	addGutterDecoration : function(row, className) {
		if (this.getSession()) {
			this.getSession().addGutterDecoration(row, className);
		}
	},

	replaceAll : function(replacement, options) {
		if (this.oEditor) {
			return this.oEditor.replaceAll(replacement, options);
		}
		return null;
	},

	find : function(needle, options, animate) {
		if (this.oEditor) {
			this.oEditor.find(needle, options, animate);
		}
	},

	getTabSize : function() {
		if (this.getSession()) {
			return this.getSession().getTabSize();
		}
		return null;
	},

	moveCursorToPosition : function(pos) {
		if (this.selection) {
			this.selection.moveCursorToPosition(pos);
		}
	},

	setCurrentFilePath : function(sPath) {
		this._sTargetFile = sPath;
	},

	getCurrentFilePath : function() {
		return this._sTargetFile;
	},

	getNativeEditor : function() {
		return this.oEditor;
	},

	deleteCurrentSelection : function() {
		if (this.getSession()) {
			this.getSession().remove(this.oEditor.getSelectionRange());
		}
	},
	isVisible : function() {
		return this._aSessions.length > 0;
	},
	toggleComment: function() {
		if (this.oEditor) {
			this.oEditor.toggleCommentLines();
		}		
	},
	toggleBlockComment: function() {
		if (this.oEditor) {
			this.oEditor.toggleBlockComment();
		}		
	},
	setShowInvisibles : function(visible) {		
		if (this.oEditor) {
			this.oEditor.setShowInvisibles(visible);
		}
	},
	getShowInvisibles : function() {		
		if (this.oEditor) {
			return this.oEditor.getShowInvisibles();
		}
		return false;
	},
	toggleShowInvisibles : function() {				
		this.setShowInvisibles(!this.oEditor.getShowInvisibles());
	},
	expandAll: function() {
		if (this.oEditor) {
		    this.oEditor.session.unfold();
		}		
	},
	collapseAll: function() {
		if (this.oEditor) {
		    this.oEditor.session.foldAll();
		}		
	},
	setDocValue : function(value) {				
		if (this.getSession() && this.getSession().getDocument()) {
			this.getSession().getDocument().setValue(value);
		}
	},
	executeCommand : function(name) {			
		if (this.oEditor) {
			if (this.oEditor.commands.commands[name]){
				this.oEditor.commands.commands[name].exec(this.oEditor);
			}
		}
	},
	showGutter : function(show) {
		if (this.oEditor && this.oEditor.renderer) {
			this.oEditor.renderer.setShowGutter(show);
		}
	}
});