define(function () {

	var _bTermMode = false;	
	var _oEditorControl;
	var _oContentStatus;
	var _nColumn, _nRow, _nOffSet,_sPrefix;

	var initTermMode = function (parent) {
		_bTermMode = false;		
		_oEditorControl = parent._oEditorControl;
	};

	var getTermMode = function () {
		return _bTermMode;
	};
	
	/**
	 * Init the context for terms service.
	 * <p>
	 * This method inits the terms service with current content status.
	 * @param 	oContentStatus 	{object}, the current content status.
	 */
	var initTermsContext = function (oContentStatus) {
		var text = oContentStatus.prefix;
		var offset = oContentStatus.offset;
		_nOffSet=oContentStatus.offset;
		_sPrefix=oContentStatus.prefix;
		
		_bTermMode = true;
		_oContentStatus = oContentStatus;		
		var cursorPosition = _oEditorControl.getCursorPosition();
		_nColumn = cursorPosition.column;
		_nRow = cursorPosition.row;
		
		//set hightlight
		var nColStart, nColEnd, nPrefix=0,nLength = 0;
		if (_sPrefix) {
			nPrefix = _sPrefix.length;
		}
		if (oContentStatus.stringValue){
			nLength=oContentStatus.stringValue.length;
		}
		nColStart = _nColumn - nPrefix;
		nColEnd = _nColumn-nPrefix+nLength;			
		_highlightRange(_nRow, nColStart, _nRow, nColEnd);				
		return {stringValue:oContentStatus.stringValue,container:_oEditorControl.getContainer()};
	};

	/**
	 * Replace the current value with return value of terms service.
	 * <p>
	 * This method replaces the current value with value of terms service.
	 * @param 	sTerm 	{string}, the return value from terms service.
	 */
	var replaceByTerm = function (sTerm) {
		if (sTerm) {
			var insertTerm = sTerm;
			if (_oEditorControl && _oEditorControl.oEditor) {
				var nColStart, nColEnd, nPrefix = 0;
				if (_sPrefix) {
					nPrefix = _sPrefix.length;
				}

				nColStart = _nColumn - nPrefix;
				nColEnd = _nColumn;

				var range = _adjustRangeByTerm(_nRow, nColStart, _nRow, nColEnd);
				var oRange = _oEditorControl.getRange(range.start.row, range.start.column, range.end.row, range.end.column);
				_oEditorControl.replace(oRange, sTerm);
				_oEditorControl.navigateTo(_nRow, _nColumn); // restore original cursor position
			}
		}
		_bTermMode = false;
		setTimeout(function () {
			_oEditorControl.setFocus();
		}, 0);
	};
	
	var _highlightRange = function (nStartRow, nStartCol, nEndRow, nEndCol) {
		var oRange = _oEditorControl.getRange(nStartRow, nStartCol, nEndRow, nEndCol);		
		var oSelection = _oEditorControl.getSelection();
		if (oSelection){
			oSelection.setSelectionRange(oRange);						
		}
	};
	
	var _adjustRangeByTerm = function (nStartRow, nStartCol, nEndRow, nEndCol) {
		var offset = _nOffSet;
		var sCurrentLine = _oEditorControl.getLine(_nRow);
		var sFrontStr = sCurrentLine.substring(0, _nColumn);
		var iPosQuote = sFrontStr.lastIndexOf("\"");
		var iPosCurlyBracket = sFrontStr.lastIndexOf("{");

		var bFound = false;
		while (_oContentStatus.buffer[offset] !== "<" && (_oContentStatus.buffer[offset] !== ">" || 
			_oContentStatus.buffer[offset] === ">" && iPosCurlyBracket === iPosQuote + 1)) {	// continue to get full term if text is "{model>
			if (_oContentStatus.buffer[offset] === "\"" || _oContentStatus.buffer[offset] === "\'") {
				bFound = true;
				break;
			}
			offset++;
		}

		if (offset > _nOffSet && bFound) {
			nEndCol = nEndCol + (offset - _nOffSet);
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
		initTermMode: initTermMode,
		initTermsContext: initTermsContext,
		replaceByTerm: replaceByTerm,
		getTermMode: getTermMode
	};
});