define(function() {

	var _oHintMode;

	var initHintMode = function(parent) {
		_oHintMode = new HintModeHelper(parent);
	};

	var getHintMode = function() {
		return (_oHintMode && _oHintMode.bHintMode);
	};

	var showHint = function(aProposals, oCoords, sPrefix, bSuffix) {
		_oHintMode.bSuffix = bSuffix;
		if (aProposals == undefined) {
			if (_oHintMode.bHintMode) {
				_oHintMode._oHintElement.style.display = 'none';
				_oHintMode.bHintMode = false;
				_oHintMode._replaceBySpace(_oHintMode._oHintStatus, 0);
			}
			return;
		}

		_oHintMode.parent.aProposals = aProposals;
		_oHintMode.parent.oCoords = oCoords;
		_oHintMode.parent.sPrefix = sPrefix;

		var newSelected = 0;

		while (newSelected < _oHintMode.parent.aProposals.length - 1 && _oHintMode.parent.aProposals[newSelected].unselectable) {
			newSelected++;
		}
		_oHintMode.parent.selectedIndex = newSelected;

		return showHtmlHint();
	};

	var cancelHint = function(bOnlyHide, bFromMouse) {
		if (_oHintMode.bHintMode) {
			_oHintMode._oHintElement.style.display = 'none';
			_oHintMode.bHintMode = false;
			if (bOnlyHide) {
				_oHintMode._oHintStatus.column = -1;
				_oHintMode._oHintStatus.row = -1;
				_oHintMode._oHintStatus.length = 0;
			} else {
				_oHintMode._replaceBySpace(_oHintMode._oHintStatus, 0, true, bFromMouse);
			}
		}
	};

	var setHintStatus = function(iColumn, iRow, iLength) {
		if (iColumn) {
			_oHintMode._oHintStatus.column = iColumn;
		}
		if (iRow) {
			_oHintMode._oHintStatus.row = iRow;
		}
		if (iLength) {
			_oHintMode._oHintStatus.length = iLength;
		}
	};

	var showHtmlHint = function() {

		if (_oHintMode.parent.aProposals.length > 0) {
			if (!_oHintMode.parent.selectedIndex) {
				_oHintMode.parent.selectedIndex = 0;
			}
			var curProposal = _oHintMode.parent.aProposals[_oHintMode.parent.selectedIndex];
			var hint = "",
				prefix = _oHintMode.parent.sPrefix,
				html = "",
				nHintLength = 0;
				
			if (curProposal.proposal && prefix && curProposal.proposal.toLowerCase().indexOf(prefix.toLowerCase()) >= 0){	
                prefix = curProposal.proposal.slice(0, curProposal.proposal.toLowerCase().indexOf(prefix.toLowerCase()) + prefix.length);				
			}
			
			if (prefix == undefined) {
				prefix = "";
			}

			var i = 0,
				tempHint;

			tempHint = curProposal.proposal;

			while ((tempHint[i] != "\n") && (i < tempHint.length)) {
				hint += tempHint[i];
				i++;
			}
			if ((i < tempHint.length) && tempHint[i] == "\n") {
				hint += "...";
			}

			if ((curProposal.overwrite && (hint.length >= prefix.length)) || ((!curProposal.overwrite) && (hint.length >= 0))) {
				var sYPosition = _oHintMode._getPosition(_oHintMode.parent.selectedIndex);
				var parentWidth = _oHintMode.parent._oContainer.offsetWidth - 60;

				parentWidth = (parentWidth > 20) ? parentWidth : 1000;
				
                var helpDes = curProposal.helpDescription;
                var bStrike = false;
				if(helpDes && helpDes.length > 0){
                    if(helpDes.indexOf("Deprecated!") !== -1){
                        bStrike = true;
                    }
				}
				
				if (curProposal.overwrite) {
				    if(bStrike){
    					html = "<span class='description' style='text-decoration:line-through; max-width:" + (parentWidth - 10) + "px' >" + hint.substring(prefix.length) +
    						"</span><div class='arrows' style='background-position:0% " + sYPosition + "'></div>";
				    }else{
				        html = "<span class='description' style='max-width:" + (parentWidth - 10) + "px' >" + hint.substring(prefix.length) +
    						"</span><div class='arrows' style='background-position:0% " + sYPosition + "'></div>";
				    }
    					nHintLength = hint.substring(prefix.length).length;
				} else {
				    if(bStrike){
					html = "<span class='description' style='text-decoration:line-through; max-width:" + (parentWidth - 20) + "px' >" + hint +
						"</span><div class='arrows' style='background-position:0% " + sYPosition + "'></div>";
				    }else{
				        html = "<span class='description' style='max-width:" + (parentWidth - 20) + "px' >" + hint +
						"</span><div class='arrows' style='background-position:0% " + sYPosition + "'></div>";
				    }	
					nHintLength = hint.length;
				}
				_oHintMode._oHintElement.innerHTML = html;
				h = jQuery(_oHintMode._oHintElement).height();
				_oHintMode._oHintElement.style.top = _oHintMode.parent.oCoords.pageY + 'px';
				_oHintMode._oHintElement.style.left = _oHintMode.parent.oCoords.pageX + 'px';
				_oHintMode._oHintElement.style.display = 'block';

				var aFilteredProposals = _oHintMode.parent.aProposals.filter(function(proposal) {
					return !proposal.unselectable;
				});
				if (_oHintMode.bHintMode) {
					if ((nHintLength == 0) && (_oHintMode.parent.aProposals.length == 1)) {
						_oHintMode._oHintElement.style.display = 'none';
						_oHintMode.bHintMode = false;
						_oHintMode._replaceBySpace(_oHintMode._oHintStatus, 0); //added arrow space
					} else {
						if (aFilteredProposals.length > 1) {
							_oHintMode._replaceBySpace(_oHintMode._oHintStatus, nHintLength + 1); //added arrow space
						} else {
							_oHintMode._replaceBySpace(_oHintMode._oHintStatus, nHintLength);
						}
					}
				} else {
					if ((nHintLength == 0) && (_oHintMode.parent.aProposals.length == 1)) {
						_oHintMode._oHintElement.style.display = 'none';
						_oHintMode.bHintMode = false;
					} else {
						_oHintMode.bHintMode = true;
						_oHintMode._oHintStatus.length = 0;
						if (aFilteredProposals.length > 1) {
							_oHintMode._replaceBySpace(_oHintMode._oHintStatus, nHintLength + 1); //added arrow space
						} else {
							_oHintMode._replaceBySpace(_oHintMode._oHintStatus, nHintLength);
						}
					}
				}
			} else {
				if (_oHintMode.bHintMode) {
					_oHintMode._oHintElement.style.display = 'none';
					_oHintMode.bHintMode = false;
					_oHintMode._replaceBySpace(_oHintMode._oHintStatus, 0);
				}
			}
			//_oHintMode.parent.showHelpTip();
		} else {
			if (_oHintMode.bHintMode) {
				_oHintMode._oHintElement.style.display = 'none';
				_oHintMode.bHintMode = false;
				_oHintMode._replaceBySpace(_oHintMode._oHintStatus, 0);
			}
		}
	};

	var updatePosition = function(pageX, pageY) {

		var offset = jQuery(_oHintMode.parent._oContainer).offset();

		if ((pageX < offset.left) || (pageY < offset.top) || (pageX > offset.left + _oHintMode.parent._oContainer.offsetWidth) || (pageY >
			offset.top + _oHintMode.parent._oContainer.offsetHeight)) {
			this.cancelHint();
			return;
		}
		_oHintMode._oHintElement.style.top = pageY + 'px';
		_oHintMode._oHintElement.style.left = pageX + 'px';

	};

	var lineDown = function() {
		if (_oHintMode._checkBottomIndex(_oHintMode.parent.selectedIndex)) {
			return false;
		}

		var newSelected = (_oHintMode.parent.selectedIndex === _oHintMode.parent.aProposals.length - 1) ? 0 : _oHintMode.parent.selectedIndex +
			1;
		return _oHintMode._lineDown(newSelected);
	};

	var lineUp = function() {
		if (_oHintMode._checkTopIndex(_oHintMode.parent.selectedIndex)) {
			return false;
		}
		var newSelected = (_oHintMode.parent.selectedIndex === 0) ? _oHintMode.parent.aProposals.length - 1 : _oHintMode.parent.selectedIndex -
			1;
		return _oHintMode._lineUp(newSelected);
	};

	tryShowHint = function() {

		var oCodeCompletionService = _oHintMode.parent._oCodeCompletionService;
		var oEditor = _oHintMode.parent._oEditor;
		if (!oCodeCompletionService) {
			return;
		}

		oEditor.getContentStatus(true, true).then(function(oContentStatus) {
			var oCurrentContentStatus = oContentStatus;
			oContentStatus.ignoreSnippetProposals = true;
			oContentStatus.ignoreContextProposals = false;
			oContentStatus.isAutoHint = true;
			oContentStatus.caseSensitive = true;
			_oHintMode.parent.oContentStatus = oContentStatus;

			if (oCodeCompletionService.instanceOf("sap.watt.common.service.editor.PrefixCalculation")) {
				return oCodeCompletionService.getCalculatedPrefix(oCurrentContentStatus).then(function(sPrefix) {
					oCurrentContentStatus.prefix = sPrefix;
					return oCurrentContentStatus;
				});
			}
			return Q(oCurrentContentStatus);
		}).then(function(oContentStatus) {
		    var oCurrentContentStatus = oContentStatus;
			if (oContentStatus.bComment && (!_oHintMode.parent._bHintComment)) {
				return;
			}

			oCodeCompletionService.getWordSuggestions(oContentStatus).then(function(aProposals) {
				//return _oHintMode.parent._oEditor.getContentStatus(true, true).then(function(oCurrentContentStatus) {
					if (aProposals.targetFile && aProposals.targetFile != oCurrentContentStatus.targetFile) {
						// no match in files
						return;
					}

					if (aProposals.asyncId && aProposals.asyncId != oCurrentContentStatus.prefix) {
						// no match in prefix
						return;
					}

					if (aProposals.isValue && (aProposals.proposals.length == 0)) {
						//terms?
						if ((oCurrentContentStatus.prefix === "") && (_oHintMode.bHintMode)) {
							showHint(undefined, undefined, undefined, oCurrentContentStatus.bSuffix);
						}
					} else if (!_oHintMode._canShowHint(oCurrentContentStatus, aProposals.proposals)) {
						showHint(undefined, undefined, undefined, oCurrentContentStatus.bSuffix);
						return;
					} else {
						showHint(aProposals.proposals, oCurrentContentStatus.coords, oCurrentContentStatus.prefix, oCurrentContentStatus.bSuffix);
					}
				//});
			}).fail(function(error) {
				console.warn(error);
			}).done();
		}).done();
	};

	var HintModeHelper = function(parent) {
		this.bHintMode = false;
		this.parent = parent;
		this._oContainer = parent._oContainer;
		this._oEditorControl = parent._oEditorControl;
		this._oHintStatus = {
			column: -1,
			row: -1,
			length: 0
		};
		this._initHintDiv();
	};

	HintModeHelper.prototype = {

		_initHintDiv: function() {

			var aTemp = jQuery(".ace_autocomplete_hint");
			var bFound = false;
			if (aTemp && aTemp.length > 0) {
				for (var i = 0; i < aTemp.length; i++) {
					if (aTemp[i].parentNode === this._oContainer) {
						this._oHintElement = aTemp[i];
						bFound = true;
						break;
					}
				}
			}

			if (!bFound) {
				this._oHintElement = document.createElement('div');
				this._oHintElement.className = 'ace_autocomplete_hint';
				this._oHintElement.style.display = 'none';
				this._oContainer.appendChild(this._oHintElement);
			}
		},

		_replaceBySpace: function(oFrom, nNewLength, bCancel, bMouse) {
			if (!this.bSuffix) {
				var docWidth = jQuery(this.parent._oContainer).offset().left; //+ this.parent._oContainer.offsetWidth;
				if (this.parent.oCoords.pageX + this._oHintElement.offsetWidth <= docWidth) {
					return;
				}
			}

			var cursorPosition = this._oEditorControl.getCursorPosition();

			if ((oFrom.length == nNewLength) && (oFrom.column == cursorPosition.column) && (oFrom.row == cursorPosition.row)) {
				return;
			}

			var nStartRow = -1,
				nStartColumn = -1,
				nEndRow = -1,
				nEndColumn = -1,
				nLength = -1;

			if ((oFrom.length == 0) && (nNewLength > 0)) {
				nStartRow = cursorPosition.row;
				nStartColumn = cursorPosition.column;
				nEndRow = cursorPosition.row;
				nEndColumn = cursorPosition.column;
				nLength = nNewLength;
			} else if ((oFrom.length > 0) && (nNewLength == 0)) {
				if (bCancel || bMouse) {
					nStartRow = oFrom.row;
					nStartColumn = oFrom.column;
					nEndRow = oFrom.row;
					nEndColumn = oFrom.column + oFrom.length;
				} else {
					nStartRow = cursorPosition.row;
					nStartColumn = cursorPosition.column;
					nEndRow = cursorPosition.row;
					nEndColumn = cursorPosition.column + oFrom.length;
				}
				nLength = 0;
			} else {
				nEndRow = ((oFrom.column == cursorPosition.column) && (oFrom.row == cursorPosition.row)) ? cursorPosition.row : oFrom.row;
				nStartRow = cursorPosition.row;
				nStartColumn = cursorPosition.column;
				nEndColumn = cursorPosition.column + oFrom.length;
				nLength = nNewLength;
			}

			this._oHintStatus.length = nNewLength;
			this._oHintStatus.column = cursorPosition.column;
			this._oHintStatus.row = cursorPosition.row;
			if ((this._oHintStatus.row != nEndRow) && (!bMouse)) {
				this._oHintStatus.column = -1;
				this._oHintStatus.row = -1;
				this._oHintStatus.length = 0;
				return;
			}
			var sSpace = "";
			//FIXME fix this is now removed so the horizontal scroller will not work
 			for (var i = 0; i < nLength; i++) {
 				sSpace += " ";
 			}

			if (nLength == -1) {
				return;
			}

			if (this._oEditorControl && this._oEditorControl.oEditor) {
				var oEditor = this._oEditorControl.oEditor;
				var oRange = this._oEditorControl.getRange(nStartRow, nStartColumn, nEndRow, nEndColumn);

				oEditor.session.bIgnoreChange = true;
				try {
					this._oEditorControl.replace(oRange, sSpace);
					if (sSpace == "") {
						this._oEditorControl.moveCursorTo(cursorPosition.row, cursorPosition.column + 1);
					}
					this._oEditorControl.moveCursorTo(cursorPosition.row, cursorPosition.column);
				} catch (e) {
					oEditor.session.bIgnoreChange = false;
				}
				oEditor.session.bIgnoreChange = false;
			}
		},

		_getPosition: function(index) {
			var i = 0,
				bIsTop = false,
				bIsBottom = false;
			if ((index < 0) || (index >= this.parent.aProposals.length)) {
				return "-100%";
			}

			bIsTop = this._checkTopIndex(index);

			bIsBottom = this._checkBottomIndex(index);

			if (bIsTop && bIsBottom) {
				return "-100%";
			} else if (!bIsTop && !bIsBottom) {
				return "50%";
			} else if (!bIsTop) {
				return "100%";
			} else if (!bIsBottom) {
				return "0%";
			}
			return "-100%";
		},

		_canShowHint: function(oContentStatus, proposals) {
			if (oContentStatus.offset == 0) {
				return false;
			}

			var cPreChar = oContentStatus.buffer[oContentStatus.offset - 1];
			if (cPreChar == "\n" || cPreChar == "\t" || cPreChar == " ") {
				return false;
			}

			if (proposals.length == 0) {
				return false;
			}

			if (oContentStatus.offset < oContentStatus.buffer.length) {
				var cNextChar = oContentStatus.buffer[oContentStatus.offset];
				if ((cNextChar >= "a" && cNextChar <= "z") || (cNextChar >= "A" && cNextChar <= "Z") ||
					(cNextChar >= "0" && cNextChar <= "9") || (cNextChar === "_")) {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}

			return true;

		},

		_lineDown: function(newSelected) {
			while (this.parent.aProposals[newSelected].unselectable && newSelected < this.parent.aProposals.length - 1) {
				newSelected++;
			}
			this.parent.selectedIndex = newSelected;
			showHtmlHint();
			return true;
		},

		_lineUp: function(newSelected) {
			while (this.parent.aProposals[newSelected].unselectable && newSelected > 0) {
				newSelected--;
			}
			this.parent.selectedIndex = newSelected;
			showHtmlHint();

			return true;
		},

		_checkTopIndex: function(index) {
			if ((index >= 0) && (index < this.parent.aProposals.length)) {
				var i = 0;
				while (i < index && this.parent.aProposals[i].unselectable) {
					i++;
				}
				if (i == index) {
					return true;
				} else {
					return false;
				}
			}
			return false;
		},

		_checkBottomIndex: function(index) {
			if ((index >= 0) && (index < this.parent.aProposals.length)) {
				var i = index + 1;
				while (i < this.parent.aProposals.length && this.parent.aProposals[i].unselectable) {
					i++;
				}
				if (i == this.parent.aProposals.length) {
					return true;
				} else {
					return false;
				}
			}
			return false;
		}

	};

	return {
		initHintMode: initHintMode,
		showHint: showHint,
		cancelHint: cancelHint,
		setHintStatus: setHintStatus,
		showHtmlHint: showHtmlHint,
		lineDown: lineDown,
		lineUp: lineUp,
		tryShowHint: tryShowHint,
		getHintMode: getHintMode,
		updatePosition: updatePosition
	};

});