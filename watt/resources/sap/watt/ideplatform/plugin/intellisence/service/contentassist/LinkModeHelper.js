define(function () {

	var _oLinkMode;

	var initLinkMode = function (parent) {
		_oLinkMode = new LinkModeHelper(parent);
	};

	var exitLinkMode = function (bConfirm) {		
		while ((_oLinkMode.aMarkerId) && (_oLinkMode.aMarkerId.length > 0)) {
			var id = _oLinkMode.aMarkerId.pop();
			_oLinkMode._oEditorControl.removeMarker(id);
		}		
		_oLinkMode._oEditorControl.clearSelection();

		if (bConfirm) {
			if (_oLinkMode.escapePosition) {
				_oLinkMode._oEditorControl.moveCursorTo(_oLinkMode.escapePosition.row, _oLinkMode.escapePosition.column);
			} else if ((_oLinkMode.aLinkPositions) && (_oLinkMode.aLinkPositions.length > 0)) {
				var p = _oLinkMode.aLinkPositions.pop();
				_oLinkMode._oEditorControl.moveCursorTo(p.end.row, p.end.column + 1);
			}
		}

		_oLinkMode.bLinkPosition = false;
		_oLinkMode.bLinkGroup = false;
		_oLinkMode.aLinkPositions = [];
		_oLinkMode.aLinkGroups = [];
		_oLinkMode._oEditorControl.removeEventListener('change', _oLinkMode._onEditorChange);		
	};

	var nextLinkPos = function () {
		if (_oLinkMode.bLinkPosition) {			
			var cursorPosition = _oLinkMode._oEditorControl.getCursorPosition();

			var index = _oLinkMode._getLinkPositionIndexByCursor(_oLinkMode.aLinkPositions, cursorPosition);
			if (index < 0) {
				exitLinkMode(false);
			} else {
				if (_oLinkMode.aLinkPositions.length < 2) {
					return;
				} else {
					if (index < (_oLinkMode.aLinkPositions.length - 1)) {
						index++;
					} else {
						index = 0;
					}
				}
			}
			_oLinkMode._setSelection(_oLinkMode.aLinkPositions[index]);
		} else if (_oLinkMode.bLinkGroup) {
			var cursorPosition = _oLinkMode._oEditorControl.getCursorPosition();

			var index = _oLinkMode._getLinkGroupIndexByCursor(cursorPosition);
			if (index < 0) {
				exitLinkMode(false);
			} else {
				if (_oLinkMode.aLinkGroups.length < 2) {
					return;
				} else {
					if (index < (_oLinkMode.aLinkGroups.length - 1)) {
						index++;
					} else {
						index = 0;
					}
				}
			}
			_oLinkMode._setGroupSelection(_oLinkMode.aLinkGroups[index]);

		}

	};

	var preLinkPos = function () {
		if (_oLinkMode.bLinkPosition) {			
			var cursorPosition = _oLinkMode._oEditorControl.getCursorPosition();

			var index = _oLinkMode._getLinkPositionIndexByCursor(_oLinkMode.aLinkPositions, cursorPosition);
			if (index < 0) {
				exitLinkMode(false);
			} else {
				if (_oLinkMode.aLinkPositions.length < 2) {
					return;
				} else {
					if (index > 0) {
						index--;
					} else {
						index = _oLinkMode.aLinkPositions.length - 1;
					}
				}
			}
			_oLinkMode._setSelection(_oLinkMode.aLinkPositions[index]);
		} else if (_oLinkMode.bLinkGroup) {
			var cursorPosition = _oLinkMode._oEditorControl.getCursorPosition();

			var index = _oLinkMode._getLinkGroupIndexByCursor(cursorPosition);
			if (index < 0) {
				exitLinkMode(false);
			} else {
				if (_oLinkMode.aLinkGroups.length < 2) {
					return;
				} else {
					if (index > 0) {
						index--;
					} else {
						index = _oLinkMode.aLinkGroups.length - 1;
					}
				}
			}
			_oLinkMode._setGroupSelection(_oLinkMode.aLinkGroups[index]);

		}

	};
	
	var getLinkMode = function () {
		return _oLinkMode && (_oLinkMode.bLinkPosition || _oLinkMode.bLinkGroup);
	};

	var enterLinkMode = function (insertTerm) {			
		if (getLinkMode()) {
			return;
		}
		if (((insertTerm.groups == undefined) || (insertTerm.groups == null) || (insertTerm.groups.length == 0)) &&
			((insertTerm.positions == undefined) || (insertTerm.positions == null) || (insertTerm.positions.length == 0))) {
			_oLinkMode._oEditorControl.setFocus();
		} else {
			_oLinkMode.bLinkPosition = false;
			_oLinkMode.bLinkGroup = false;
			if (insertTerm.escapePosition) {
				_oLinkMode.escapePosition =  _oLinkMode._offsetToPos(insertTerm.escapePosition);
			} else {
				_oLinkMode.escapePosition = null;
			}	
			
			_oLinkMode._onEditorChange = function (e) {
				if (_oLinkMode.bIgnoreChange) {
					return;
				}
				if (_oLinkMode.bLinkPosition) {
					var change = e.data;
					var index = -1;

					if (e.data.action == "removeText") {
						index = _oLinkMode._getLinkPositionIndexByRange(_oLinkMode.aLinkPositions, change.range, 'remove');
					} else if (e.data.action == "insertText") {
						index = _oLinkMode._getLinkPositionIndexByRange(_oLinkMode.aLinkPositions, change.range, 'insert');
					}

					if (index < 0) {
						exitLinkMode(false);
					} else {
						if (e.data.action == "removeText") {
							_oLinkMode._updateLinkMode(index, e.data, 'remove');
						} else if (e.data.action == "insertText") {
							_oLinkMode._updateLinkMode(index, e.data, 'insert');
						}
					}
				} else if (_oLinkMode.bLinkGroup) {
					var change = e.data;
					var index = -1;

					if (e.data.action == "removeText") {
						index = _oLinkMode._getLinkGroupIndexByRange(change.range, 'remove');
					} else if (e.data.action == "insertText") {
						index = _oLinkMode._getLinkGroupIndexByRange(change.range, 'insert');
					}

					if (index < 0) {
						exitLinkMode(false);
					} else {
						if (e.data.action == "removeText") {
							_oLinkMode._updateLinkMode(index, e.data, 'remove');
						} else if (e.data.action == "insertText") {
							_oLinkMode._updateLinkMode(index, e.data, 'insert');
						}
					}
				}

			};
			_oLinkMode._oEditorControl.addEventListener('change', _oLinkMode._onEditorChange);			

			if (insertTerm.positions && (insertTerm.positions.length > 0)) {
				_oLinkMode.bLinkPosition = true;
				_oLinkMode.aLinkPositions = [];
				_oLinkMode.aMarkerId = [];				

				for (var i = 0; i < insertTerm.positions.length; i++) {
					_oLinkMode.aLinkPositions.push({
						start: _oLinkMode._offsetToPos(insertTerm.positions[i].offset),
						end: _oLinkMode._offsetToPos(insertTerm.positions[i].offset + insertTerm.positions[i].length)					
					});
				}

				_oLinkMode._setSelection(_oLinkMode.aLinkPositions[0]);
				_oLinkMode._setMarker(_oLinkMode.aLinkPositions);

			} else if (insertTerm.groups && (insertTerm.groups.length > 0)) {
				_oLinkMode.bLinkGroup = true;
				_oLinkMode.aLinkGroups = [];
				_oLinkMode.aMarkerId = [];				
				
				for (var i = 0; i < insertTerm.groups.length; i++) {
					var positions = [];
					for (var j = 0; j < insertTerm.groups[i].positions.length; j++) {
						positions.push({
							start: _oLinkMode._offsetToPos(insertTerm.groups[i].positions[j].offset),							
							end: _oLinkMode._offsetToPos(insertTerm.groups[i].positions[j].offset + insertTerm.groups[i].positions[j].length)	
							});
					}
					_oLinkMode.aLinkGroups.push(positions);
					_oLinkMode._setMarker(positions);
				}

				_oLinkMode._setGroupSelection(_oLinkMode.aLinkGroups[0]);
			}
		}
	};

	var LinkModeHelper = function (parent) {
		this.bLinkPosition = false;
		this.bLinkGroup = false;
		this.parent=parent;
		this._oEditorControl = parent._oEditorControl;
	};

	LinkModeHelper.prototype = {
		_setMarker: function (positions) {
			for (var i = 0; i < positions.length; i++) {
				var p = positions[i];
				var range = this._oEditorControl.getRange(p.start.row, p.start.column, p.end.row, p.end.column);
				this.aMarkerId.push(this._oEditorControl.addMarker(range, "acmark", "text", false));
			}
		},
		
		_setSelection: function (selRange) {
			var sel = this._oEditorControl.getSelection();
			var range = sel.getRange();
			range.setStart(selRange.start.row, selRange.start.column);
			range.setEnd(selRange.end.row, selRange.end.column);
			sel.clearSelection();
			sel.setSelectionRange(range);
		},
		_offsetToPos: function (offset) {			
			var lines = this._oEditorControl.getAllLines();
			var row = 0,
				col = 0;
			var pos = 0;
			while (row < lines.length && pos + lines[row].length < offset) {
				pos += lines[row].length;
				pos++;
				row++;
			}
			col = offset - pos;
			return {
				row: row,
				column: col
			};
		},
		_setGroupSelection: function (selRanges) {
			this._setSelection(selRanges[0]);
		},

		_updateLinkMode: function (index, data, type) {

			while ((this.aMarkerId) && (this.aMarkerId.length > 0)) {
				var id = this.aMarkerId.pop();
				this._oEditorControl.removeMarker(id);
			}

			if (this.bLinkPosition) {
				if (type == "remove") {
					var length = data.range.end.column - data.range.start.column;

					this.aLinkPositions[index].end.column -= length;

					for (var i = index + 1; i < this.aLinkPositions.length; i++) {
						this.aLinkPositions[i].start.column -= length;
						this.aLinkPositions[i].end.column -= length;
					}

					if ((this.escapePosition.row == this.aLinkPositions[index].end.row) && (this.escapePosition.column >= this.aLinkPositions[index].end.column)) {
						this.escapePosition.column -= length;
					}
				} else if (type == "insert") {
					var length = (data.range.end.column - data.range.start.column);
					this.aLinkPositions[index].end.column += length;

					for (var i = index + 1; i < this.aLinkPositions.length; i++) {
						this.aLinkPositions[i].start.column += length;
						this.aLinkPositions[i].end.column += length;
					}

					if ((this.escapePosition.row == this.aLinkPositions[index].end.row) && (this.escapePosition.column >= this.aLinkPositions[index].start.column)) {
						this.escapePosition.column += length;
					}
				}

				this.aMarkerId = [];
				this._setMarker(this.aLinkPositions);
			} else if (this.bLinkGroup) {

				var originalPositions = [];
				for (var i = 0; i < this.aLinkGroups[index].length; i++) {
					originalPositions.push({
						start: {
							row: this.aLinkGroups[index][i].start.row,
							column: this.aLinkGroups[index][i].start.column
						},
						end: {
							row: this.aLinkGroups[index][i].end.row,
							column: this.aLinkGroups[index][i].end.column
						}
					});
				}

				var range = this._oEditorControl.getSelectionRange();				
				var pos = this._getLinkPositionIndexByRange(this.aLinkGroups[index], data.range, type);

				if (type == "remove") {
					var length = data.range.end.column - data.range.start.column;
					for (var i = 0; i < this.aLinkGroups[index].length; i++) {
						this._updateGroupPosition(index, i, length, 'remove');
					}
				} else if (type == "insert") {
					var length = (data.range.end.column - data.range.start.column);
					for (var i = 0; i < this.aLinkGroups[index].length; i++) {
						this._updateGroupPosition(index, i, length, 'insert');
					}
				}

				this._updateSameGroupText(originalPositions, index, pos);
				this.aMarkerId = [];
				for (var i = 0; i < this.aLinkGroups.length; i++) {
					this._setMarker(this.aLinkGroups[i]);
				}

			}
		},
		
		_updateSameGroupText: function (originalPositions, index, pos) {

			var newText = this._oEditorControl.getTextRange(this.aLinkGroups[index][pos].start.row, this.aLinkGroups[index][pos].start.column,
				this.aLinkGroups[index][pos].end.row, this.aLinkGroups[index][pos].end.column);

			var newLength = this.aLinkGroups[index][pos].end.column - this.aLinkGroups[index][pos].start.column;
			var oldLength = originalPositions[pos].end.column - originalPositions[pos].start.column;
			var oEditor = this._oEditorControl.oEditor;
			for (var i = 0; i < originalPositions.length; i++) {
				if (i != pos) {
					var range;
					if (i < pos) {
						range = this._oEditorControl.getRange(originalPositions[i].start.row, originalPositions[i].start.column,
							originalPositions[i].end.row, originalPositions[i].end.column);

					} else if (i > pos) {
						if (originalPositions[i].start.row == originalPositions[pos].start.row) {
							originalPositions[i].start.column += newLength - oldLength;
							originalPositions[i].end.column += newLength - oldLength;
						}
						range = this._oEditorControl.getRange(originalPositions[i].start.row, originalPositions[i].start.column,
							originalPositions[i].end.row, originalPositions[i].end.column);

					}
					this.bIgnoreChange = true;
					
					oEditor.session.bIgnoreChange = true;
					this._oEditorControl.replace(range, newText);
					oEditor.session.bIgnoreChange = false;
					this.bIgnoreChange = false;

					for (var j = i + 1; j < originalPositions.length; j++) {
						if (originalPositions[j].start.row == originalPositions[pos].start.row) {
							originalPositions[j].start.column += newLength - oldLength;
							originalPositions[j].end.column += newLength - oldLength;
						}
					}
				}
			}
		},
		_updateGroupPosition: function (index, pos, length, type) {
			if (type == 'remove') {
				this.aLinkGroups[index][pos].end.column -= length;
				for (var i = 0; i < this.aLinkGroups.length; i++) {
					for (var j = 0; j < this.aLinkGroups[i].length; j++) {
						if ((i == index) && (j == pos)) {
							continue;
						}
						if ((this.aLinkGroups[i][j].start.row == this.aLinkGroups[index][pos].end.row) && (this.aLinkGroups[i][j].start.column > this.aLinkGroups[index][pos].start.column)) {
							this.aLinkGroups[i][j].start.column -= length;
							this.aLinkGroups[i][j].end.column -= length;
						}
					}
				}
			} else if (type == 'insert') {
				this.aLinkGroups[index][pos].end.column += length;
				for (var i = 0; i < this.aLinkGroups.length; i++) {
					for (var j = 0; j < this.aLinkGroups[i].length; j++) {
						if ((i == index) && (j == pos)) {
							continue;
						}
						if ((this.aLinkGroups[i][j].start.row == this.aLinkGroups[index][pos].end.row) && (this.aLinkGroups[i][j].start.column > this.aLinkGroups[index][pos].start.column)) {
							this.aLinkGroups[i][j].start.column += length;
							this.aLinkGroups[i][j].end.column += length;
						}
					}
				}
			}
		},
		
		_getLinkGroupIndexByCursor: function (cursorPosition) {
			for (var i = 0; i < this.aLinkGroups.length; i++) {
				var index = this._getLinkPositionIndexByCursor(this.aLinkGroups[i], cursorPosition);
				if (index >= 0) {
					return i;
				}
			}
			return -1;
		},

		_getLinkPositionIndexByCursor: function (positions, curPosition) {

			for (var i = 0; i < positions.length; i++) {
				if ((curPosition.row >= positions[i].start.row) && (curPosition.row <= positions[i].end.row) &&
					(curPosition.column >= positions[i].start.column) && (curPosition.column <= positions[i].end.column)) {
					return i;
				}
			}
			return -1;
		},

		_getLinkGroupIndexByRange: function (range, type) {
			for (var i = 0; i < this.aLinkGroups.length; i++) {
				var index = this._getLinkPositionIndexByRange(this.aLinkGroups[i], range, type);
				if (index >= 0) {
					return i;
				}
			}
			return -1;
		},

		_getLinkPositionIndexByRange: function (positions, range, type) {
			if (type == 'insert') {
				for (var i = 0; i < positions.length; i++) {
					if ((range.start.row == positions[i].end.row) && (range.start.column >= positions[i].start.column) && (range.start.column <= positions[i].end.column)) {
						return i;
					}
				}
			} else if (type == 'remove') {
				for (var i = 0; i < positions.length; i++) {
					if ((range.start.row >= positions[i].start.row) && (range.start.row <= positions[i].end.row) &&
						(range.end.column >= positions[i].start.column) && (range.end.column <= positions[i].end.column)) {
						return i;
					}
				}
			}
			return -1;
		}
	};
	
	return {
		initLinkMode: initLinkMode,
		exitLinkMode: exitLinkMode,
		nextLinkPos: nextLinkPos,
		preLinkPos: preLinkPos,
		getLinkMode: getLinkMode,
		enterLinkMode: enterLinkMode
	};
});