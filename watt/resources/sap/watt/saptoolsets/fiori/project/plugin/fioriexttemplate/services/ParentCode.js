define([], function() {
	var oCompare;
	return {

		PARENT_PREFIX : "version-parentcode-",
		_oDocument : null,
		_DocumentEditorMap : {},

		init : function() {
			this.context.service.perspective.attachEvent("splitterPositionChanged", this.onSplitterPositionChanged, this);
			this.context.service.content.attachEvent("tabDoubleClicked", this.onSplitterPositionChanged, this);
			return Q.sap.require("sap.watt.ideplatform.compare/lib/built-compare").then(function(_oCompare) {
				oCompare = _oCompare;
			});
		},

		configure : function(mConfig) {
			this.context.service.resource.includeStyles(mConfig.styles).done();
		},

		getContent : function() {
			var that = this;
			var oWrapperDiv;
			if (that._DocumentEditorMap[this._oDocument.getKeyString()]
					&& that._DocumentEditorMap[this._oDocument.getKeyString()].wrapperDiv) {
				oWrapperDiv = that._DocumentEditorMap[this._oDocument.getKeyString()].wrapperDiv;
			} else {
				oWrapperDiv = new sap.ui.core.HTML({
					content : "<div id='" + that._getDivId(this._oDocument) + "' style='width=100%;height:100%;background-color:white;'"
							+ ' class="rdeCompare"' + "'></div>"
				});
				that._DocumentEditorMap[this._oDocument.getKeyString()].wrapperDiv = oWrapperDiv;
			}
			return oWrapperDiv;
		},

		open : function(oDocument) {

			this._oDocument = oDocument;
			//TODO validate XSS
			var $compareDiv = $("div[id='" + this._getDivId(oDocument) + "']");
			if ($compareDiv.length > 0) {
				$compareDiv.empty();
			}
			return this._openPreview(this._oDocument);
		},

		close : function(oDocument) {
			var $compareDiv = $("div[id='" + this._getDivId(oDocument) + "']");
			if ($compareDiv.length > 0) {
				$compareDiv.empty();
			}
		},

		/*
		 * Writes the content in the editor into current document
		 */
		flush : function() {
			return Q();
		},
		
		setVisible : function(isVisible) {
			return Q(isVisible);
		},
		
		isVisible : function() {
			return Q();
		},
		
		isAvailable : function() {
			return Q();
		},
		

		getTitle : function() {
			return this._oDocument.getEntity().getName() + " [read only]";
		},
		getTooltip : function() {
			return this._oDocument.getEntity().getFullPath() + " [read only]";
		},
		
		getState: function() {
			return Q();
		},
		
		readOnly : function(oDocument, sContent) {
			this._oDocument = oDocument;
			var sDivId = this._getDivId(oDocument);
			var sName = oDocument.getEntity().getName();
			if (/.*\.(xml)$/.test(sName)) {//In order to highlight xml files 
				sName = sName.substring(0, sName.lastIndexOf(".xml")) + ".html";
			}
			var oOptions = {
				viewType : "inline",
				parentDivId : sDivId,
				newFile : {/*new file's content is added in _openPreview method is order to support up to date content when opening the tab*/
					InitialContent : sContent,
					readonly : true,
					Name : sName
				},
				oldFile : {
					readonly : true,
					Content : sContent,
					Name : sName
				}
			};
			if (!this._DocumentEditorMap[oDocument.getKeyString()]) {
				this._DocumentEditorMap[oDocument.getKeyString()] = {};
			}
			this._DocumentEditorMap[oDocument.getKeyString()].options = oOptions;
			this.context.service.content.open(oDocument, this.context.service.parentcode).done(); 
		},

		getFocusElement : function() {
			return document.getElementById(this._getDivId(this._oDocument));
		},

		getSelection : function() {
			return {
				document : this._oDocument
			};
		},

		onSplitterPositionChanged : function() {
			if (this._oDocument && this._DocumentEditorMap && this._DocumentEditorMap[this._oDocument.getKeyString()]) {
				var oEditor = this._DocumentEditorMap[this._oDocument.getKeyString()].editor;
				if (oEditor && oEditor.getCompareView() && oEditor.getCompareView().getWidget()) {
					var compareWidget = oEditor.getCompareView().getWidget();
					if (compareWidget.type === "twoWay") {
						compareWidget._uiFactory.getSplitter()._resize();
					}
				}
			}
		},
		
		isRestorable: function() {
			return false;
		},

		_openPreview : function(oDocument) {
			var that = this;
			var oOptions = this._DocumentEditorMap[oDocument.getKeyString()].options;
			return Q(oOptions.newFile.InitialContent ? oOptions.newFile.InitialContent : oDocument.getContent()).then(function(sContent) {
				oOptions.newFile.Content = sContent;
				that._DocumentEditorMap[oDocument.getKeyString()].editor = new oCompare(oOptions, "", oOptions.viewType);
				that._DocumentEditorMap[oDocument.getKeyString()].editor.getCompareView().removeRulers();
				that._DocumentEditorMap[oDocument.getKeyString()].editor.getCompareView()._textView.redraw();
			});
		},

		_getDivId : function(oDocument) {
			return this.PARENT_PREFIX + oDocument.getKeyString();
		}
	};
});