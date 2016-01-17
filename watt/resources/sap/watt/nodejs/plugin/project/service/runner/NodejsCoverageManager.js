define([], function() {

	"use strict";

	var Range = ace.require("ace/range").Range;

	var COVERAGE_MARKER_CLASS_COVERED_LINE = "nodejs-coverage-covered-line";
	var COVERAGE_MARKER_CLASS_UNCOVERED_LINE = "nodejs-coverage-uncovered-line";

	var NodejsCoverageManager = function(oContext) {
		this._oContext = oContext;
	};

	NodejsCoverageManager.prototype._setDataModel = function(oModel) {
		this._oModel = oModel;
	};

	NodejsCoverageManager.prototype._bCoverageVisible;
	NodejsCoverageManager.prototype._oContext;
	NodejsCoverageManager.prototype._oModel;
	NodejsCoverageManager.prototype._oFilePath2SessionData = {};

	NodejsCoverageManager.prototype.setCoverage = function(sProjectPath, oCoverage) {

		var that = this;

		this._oModel.setData({});

		// remove all old cov info for given project
		jQuery.each(this._oFilePath2SessionData, function(sFilePath, oSessionData) {
			//			if(sFilePath.indexOf(sProjectPath) === 0) {
			that._removeEditorChangeListener(oSessionData);
			that._removeMarkers(oSessionData);
			//				delete that._oFilePath2SessionData[sFilePath];
			//			}
		});
		this._oFilePath2SessionData = {};
		var coverageResult = {
			totalCoveredLineCount: 0,
			totalLineCount: 0,
			sessionData: []
		};

		// copy coverage to session data
		if (oCoverage) {
			jQuery.each(oCoverage, function(idx, value) {

				// project local path
				var sFilePath = sProjectPath + "/" + idx;

				// remove superflous double slashes AND BACKSLASHES
				sFilePath = sFilePath.replace(/[\/\\]+/gm, "/");

				var oSessionData = that._createSessionData(value);
				oSessionData.path = idx;
				that._oFilePath2SessionData[sFilePath] = oSessionData;
				coverageResult.totalCoveredLineCount = coverageResult.totalCoveredLineCount + oSessionData.coveredLineCount;
				coverageResult.totalLineCount = coverageResult.totalLineCount + oSessionData.lineCount;

				coverageResult.sessionData.push(oSessionData);
			});

			jQuery.each(coverageResult.sessionData, function(idx, oSessionData) {
				oSessionData.totalPercentage = Math.round(oSessionData.coveredLineCount / coverageResult.totalLineCount * 100);
			});

			// this._oModel.setData(this._oFilePath2SessionData);
			this._oModel.setData(coverageResult);

			// refresh editor if open
			if (this._bCoverageVisible) {
				return this._oContext.service.content.getCurrentEditor().then(function(oEditor) {
					oEditor.getUI5Editor().then(function(oUI5Editor) {
						if (that._addEditorChangeListener(oUI5Editor)) {
							that._decorate(oUI5Editor);
						}
					});
				});
			}
		}

		return Q();
	};

	NodejsCoverageManager.prototype._onEditorRendered = function(oEvent) {

		var that = this;

		oEvent.source.getUI5Editor().then(function(oUI5Editor) {
			if (that._addEditorChangeListener(oUI5Editor)) {
				that._decorate(oUI5Editor);
			}
		});
	};

	NodejsCoverageManager.prototype._createSessionData = function(oCoverage) {
		var sessionData = {
			coverage: oCoverage,
			markerInfos : [],
			lineCount : 0,
			coveredLineCount : 0
		};

		var aFunctionLineSet = this._getFunctionLineSet(sessionData);

		if(oCoverage.statementMap) {
			jQuery.each(oCoverage.statementMap, function(idx, value) {

				sessionData.lineCount++;

				// function declarations span the complete function in coverage
				// and therefore would highlite the completet function, even uncovered parts
				// -> see if current line is a function declaration line and if so
				// make coverage info a single line
				if (jQuery.inArray(value.start.line, aFunctionLineSet) >= 0) {
					value.end.line = value.start.line;
				}

				var oLineRange = new Range(
					value.start.line - 1,
					value.start.column,
					value.end.line - 1,
					value.end.column);

				var markerInfo = {
					range: oLineRange
				};

				if (oCoverage.s[idx] > 0) {
					sessionData.coveredLineCount++;
					markerInfo.type = COVERAGE_MARKER_CLASS_COVERED_LINE;
				} else {
					markerInfo.type = COVERAGE_MARKER_CLASS_UNCOVERED_LINE;
				}

				sessionData.markerInfos.push(markerInfo);
			});

			sessionData.percentage = Math.round(sessionData.coveredLineCount / sessionData.lineCount * 100);
		}

		return sessionData;
	};

	NodejsCoverageManager.prototype._decorate = function(oUI5Editor) {

		var sFilePath = oUI5Editor.getCurrentFilePath();
		var oSessionData = this._oFilePath2SessionData[sFilePath];

		if (oSessionData && oSessionData.coverage && !oSessionData.markers) {
			oSessionData.markers = [];
			var oSession = oUI5Editor.getSession();
			jQuery.each(oSessionData.markerInfos, function(idx, markerInfo) {
				var iMarker = oSession.addMarker(markerInfo.range, markerInfo.type, "fullLine");
				oSessionData.markers.push(iMarker);
			});
		}
	};

	NodejsCoverageManager.prototype._getFunctionLineSet = function(oSessionData) {
		if (!oSessionData.functionLineSet && oSessionData.coverage.fnMap) {
			oSessionData.functionLineSet = [];
			jQuery.each(oSessionData.coverage.fnMap, function(idx, value) {
				oSessionData.functionLineSet.push(value.line);
			});
		}

		return oSessionData.functionLineSet;
	};

	NodejsCoverageManager.prototype._onEditorTabClosed = function(oEvent) {

		var sFilePath = oEvent.params.document.getEntity().getFullPath();
		var oSessionData = this._oFilePath2SessionData[sFilePath];

		if(oSessionData) {
			this._removeEditorChangeListener(oSessionData);
			this._removeMarkers(oSessionData);

			delete oSessionData.session;
		}
	};

	NodejsCoverageManager.prototype._addEditorChangeListener = function(oUI5Editor) {

		var that = this;

		var sFilePath = oUI5Editor.getCurrentFilePath();
		var oSessionData = this._oFilePath2SessionData[sFilePath];

		// coverage for current file
		if (oSessionData) {
			if (!oSessionData.changeListener) {
				var oSession = oUI5Editor.getSession();
				oSessionData.session = oSession;

				var fnChange = function(e) {
					that._removeEditorChangeListener(oSessionData);
					that._removeMarkers(oSessionData);
					delete that._oFilePath2SessionData[sFilePath];
				};

				oSessionData.changeListener = fnChange;
				oSession.on("change", fnChange);
			}

			return true;
		}

		return false;
	};

	NodejsCoverageManager.prototype._removeEditorChangeListener = function(oSessionData) {

		if (oSessionData.session && oSessionData.changeListener) {
			oSessionData.session.off("change", oSessionData.changeListener);
			delete oSessionData.changeListener;
		}
	};

	NodejsCoverageManager.prototype._removeMarkers = function(oSessionData) {
		if (oSessionData.markers) {
			jQuery.each(oSessionData.markers, function(idx, marker) {
				oSessionData.session.removeMarker(marker);
			});

			delete oSessionData.markers;
		}
	};

	NodejsCoverageManager.prototype.setCoverageVisible = function(bVisible) {

		var that = this;

		if (this._bCoverageVisible !== bVisible) {
			this._bCoverageVisible = bVisible;

			if (this._bCoverageVisible) {
				this._oContext.service.aceeditor.attachEvent("rendered", this._onEditorRendered, this);
				this._oContext.service.content.attachEvent("tabClosed", this._onEditorTabClosed, this);

				// should be: getAllVisibleEditors but IDE only supports one editor
				return this._oContext.service.content.getCurrentEditor().then(function(oEditor) {
					oEditor.getUI5Editor().then(function(oUI5Editor) {
						if (that._addEditorChangeListener(oUI5Editor)) {
							that._decorate(oUI5Editor);
						}
					});
				});

			} else {
				this._oContext.service.aceeditor.detachEvent("rendered", this._onEditorRendered, this);
				this._oContext.service.content.detachEvent("tabClosed", this._onEditorTabClosed, this);

				jQuery.each(this._oFilePath2SessionData, function(sFilePath, oSessionData) {
					that._removeMarkers(oSessionData);
					that._removeEditorChangeListener(oSessionData);
				});

				return Q();
			}
		}
	};

	return NodejsCoverageManager;
});
