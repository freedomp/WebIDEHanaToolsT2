/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(function () {

	var _oPopupMode;

	var initPopupMode = function (parent) {
		_oPopupMode = new PopupModeHelper(parent);
	};

	var getPopupMode = function () {
		return (_oPopupMode && _oPopupMode.bPopupMode);
	};
	
	var showPopup = function () {
		var k, html, w, h, docWidth, docHeight, sItemClass,parentWidth;
		_oPopupMode.bPopupMode = true;

		html = "";
		
		parentWidth=_oPopupMode.parent._oContainer.offsetWidth;
		
		docWidth =jQuery(_oPopupMode.parent._oContainer).offset().left+parentWidth;
		
		docHeight = document.documentElement.clientHeight;


		if (_oPopupMode.parent.aProposals.length > _oPopupMode._nRows) {
			_oPopupMode._oElement.style.height = _oPopupMode._nRows * _oPopupMode._nRowHeight + "px";
		} else {
			_oPopupMode._oElement.style.height = 'auto';
		}		
		_oPopupMode._oElement.setAttribute("unselectable", "on");
		if (_oPopupMode.parent.aProposals.length > 0) {
		//@changed
        var sDesc, iconPath, idx;
			for (k = 0; k < _oPopupMode.parent.aProposals.length; k++) {
				iconPath = _oPopupMode._getIconPath(_oPopupMode.parent.aProposals[k].category);
				sDesc = _oPopupMode.parent.aProposals[k].description;
				idx = sDesc.toUpperCase().indexOf(_oPopupMode.parent.sPrefix.toUpperCase());
				if(idx >= 0){
    				sDesc = jQuery.sap.encodeHTML(sDesc.substring(0, idx)) +
    				    "<strong>" + jQuery.sap.encodeHTML(sDesc.substring(idx, idx + _oPopupMode.parent.sPrefix.length)) + 
    				    "</strong>" + jQuery.sap.encodeHTML(sDesc.substr(idx + _oPopupMode.parent.sPrefix.length));
				}
				if (iconPath !== "") {					
					sItemClass = _oPopupMode.parent.aProposals[k].unselectable ? "unselectable" : "selectable";
					html += '<li  selected_id="' + k + '"' + ' class="' + sItemClass + '-item"><img src="' + iconPath + '" /><span class="intellisense_description ' + sItemClass + '">' +
						sDesc + '</span></li>';
				} else {
					sItemClass = _oPopupMode.parent.aProposals[k].unselectable ? "unselectable" : "selectable";
					html += '<li class="proposalitem ' + sItemClass + '-item" selected_id="' + k + '"><span class="' + sItemClass + '">' + sDesc + '</span></li>';
				}
			}
		}

		_oPopupMode._oElement.innerHTML = html;
		_oPopupMode._oElement.style.width='auto';
		_oPopupMode._oElement.style.display = 'block';
		_oPopupMode._oElement.style.maxWidth = parentWidth-50+'px';
		//avoid scroll flicker in MAC
		setTimeout(function () {_oPopupMode._oElement.style.width=_oPopupMode._oElement.offsetWidth+"px";},100);
		

		w = _oPopupMode._oElement.offsetWidth;
		h = _oPopupMode._oElement.offsetHeight;

		if (_oPopupMode.parent.oCoords.pageX + w > docWidth) {
			_oPopupMode._oElement.style.left = docWidth - w - 2 + 'px';
		} else {
			_oPopupMode._oElement.style.left = _oPopupMode.parent.oCoords.pageX + -2 + 'px';
		}
		if (_oPopupMode.parent.oCoords.pageY + h + _oPopupMode._nRowHeight > docHeight && (_oPopupMode.parent.oCoords.pageY - 2 - _oPopupMode._dynamicConfiguration.aceEditorFontSize) >= h) {
			_oPopupMode._oElement.style.top = _oPopupMode.parent.oCoords.pageY - h - 6 - _oPopupMode._dynamicConfiguration.aceEditorFontSize + 'px';
		} else {
			_oPopupMode._oElement.style.top = _oPopupMode.parent.oCoords.pageY + 6 + 'px';
		}
		_oPopupMode._ensureFocus();
		
		_oPopupMode.parent.context.event.fireHelpTipShown({
			index:_oPopupMode.parent.selectedIndex, 
			proposals: _oPopupMode.parent.aProposals, 
			website: _oPopupMode.parent._sHelpWebsite, 
			refresh: true
		}).done();
			
		
		jQuery(".selectable-item, .selectable-item > img, .selectable-item > span").hover(
			function (e) {
				if (!_oPopupMode.bPopupMode || (_oPopupMode.bInScrolling===true)) {
					return;
				}
				
				try {
					var elem = e.target;
					if (elem.tagName!='LI') {
						var elem = elem.parentNode;
					}
					
					var id = elem.attributes["selected_id"];
					if (id && (id.nodeValue)) {
						var index = parseInt(id.nodeValue);
							
						_oPopupMode._focusIndex(index);											
						
					}
				} catch (e) {}
			},
			function (e) {
				if (!_oPopupMode.bPopupMode) {
					return;
				}			
			}
		);
				
	};
 
	var updatePosition = function (pageX,pageY) {	
		
		var offset=jQuery(_oPopupMode.parent._oContainer).offset();
		
		if ((pageX<offset.left) || (pageY<offset.top) ||(pageX>offset.left+_oPopupMode.parent._oContainer.offsetWidth)||(pageY>offset.top+_oPopupMode.parent._oContainer.offsetHeight)) {
			this.deactivate();
			return;
		}
		
		var w = _oPopupMode._oElement.offsetWidth, 
		h = _oPopupMode._oElement.offsetHeight,
		docWidth =offset.left+_oPopupMode.parent._oContainer.offsetWidth, 
		docHeight = document.documentElement.clientHeight;
		
		if (pageX + w > docWidth) {
			_oPopupMode._oElement.style.left = docWidth - w - 2 + 'px';
		} else {
			_oPopupMode._oElement.style.left = pageX + -2 + 'px';
		}
		
		if (pageY + h + _oPopupMode._nRowHeight > docHeight && (pageY - 2 - _oPopupMode._dynamicConfiguration.aceEditorFontSize) >= h) {
			_oPopupMode._oElement.style.top = pageY - h - 6 - _oPopupMode._dynamicConfiguration.aceEditorFontSize + 'px';
		} else {
			_oPopupMode._oElement.style.top = pageY + 6 + 'px';
		}
		
	};
	
	var updatePopupProposals = function () {
		var that=this;
		_oPopupMode.parent._oEditor.getContentStatus(true, false).then(function (oContentStatus) {
			if (!oContentStatus) {				
				alert(_oPopupMode.parent.context.i18n.getText("i18n", "msg_no_editor_content"));
				return;
			}
			if (!_oPopupMode.parent._oCodeCompletionService) {
				alert(_oPopupMode.parent.context.i18n.getText("i18n", "msg_no_codecompletion"));
				return;
			}
			_oPopupMode.parent.oContentStatus = oContentStatus;
			oContentStatus.ignoreSnippetProposals = false;
			oContentStatus.ignoreContextProposals = false;
			oContentStatus.isAutoHint = false;
			_oPopupMode.parent._oCodeCompletionService.getWordSuggestions(oContentStatus).then(function (aProposals) {
				if (aProposals.prefix) {
					oContentStatus.prefix = aProposals.prefix;
				}

				if (aProposals.isValue && (aProposals.proposals.length == 0)) {} else {
					_oPopupMode._updatePopup(aProposals.proposals, oContentStatus.coords, oContentStatus.prefix);
				}
			}).done();
		}).done();

	};

	var current = function () {
		var children = _oPopupMode._oElement.childNodes;
		for (var i = 0; i < children.length; i++) {
			var li = children[i];
			if (li.className.indexOf('ace_autocomplete_selected') >= 0) {
				return li;
			}
		}
	};

	var pageDown = function () {
		var newSelected = _oPopupMode._getBottomIndex();
		if (_oPopupMode._oElement.childNodes[newSelected].className.indexOf("ace_autocomplete_selected") >-1) {			
			_oPopupMode._scrollIntoView(_oPopupMode._oElement.childNodes[newSelected], true);
			newSelected = _oPopupMode._getBottomIndex();
		}
		return _oPopupMode._lineDown(newSelected);

	};

	var pageUp = function () {
		var newSelected = _oPopupMode._getTopIndex();
		if (_oPopupMode._oElement.childNodes[newSelected].className.indexOf("ace_autocomplete_selected") >-1) {			
			_oPopupMode._scrollIntoView(_oPopupMode._oElement.childNodes[newSelected], false);
			newSelected = _oPopupMode._getTopIndex();
		}
		return _oPopupMode._lineUp(newSelected);
	};

	var deactivate = function () {		
		_oPopupMode._oElement.style.display = 'none';
		_oPopupMode.bPopupMode = false;
	};

	var lineDown = function () {
		var newSelected = (_oPopupMode.parent.selectedIndex === _oPopupMode.parent.aProposals.length - 1) ? 0 : _oPopupMode.parent.selectedIndex + 1;
		return _oPopupMode._lineDown(newSelected);
	};

	var lineUp = function () {
		var newSelected = (_oPopupMode.parent.selectedIndex === 0) ? _oPopupMode.parent.aProposals.length - 1 : _oPopupMode.parent.selectedIndex - 1;
		return _oPopupMode._lineUp(newSelected);
	};

	var PopupModeHelper = function (parent) {
		this.parent = parent;
		this._oContainer = parent._oContainer;
		this._oEditorControl = parent._oEditorControl;

		this._nRows = 10;
		this._nRowHeight = 22;
		this._oElement = {};
		this._dynamicConfiguration = {
			aceEditorFontSize: 13,
			bLogViewerShown: false,
			bDebuggerShown: false
		};
		this.bPopupMode = false;
		this._initPopupDiv();
	};

	PopupModeHelper.prototype = {

		_initPopupDiv: function () {
			//init div
			var aTemp=jQuery(".ace_autocomplete_popup");			
			var bFound=false;
			if (aTemp && aTemp.length>0) {
				for (var i = 0; i < aTemp.length; i++) {
					if (aTemp[i].parentNode===this._oContainer){
						this._oElement=aTemp[i];
						jQuery(this._oElement).unbind("contextmenu");
						jQuery(this._oElement).unbind("mouseup");						
						bFound=true;
						break;
					}
				}				
			}
			
			if (!bFound){
				this._oElement = document.createElement('ul');
				this._oElement.className = 'ace_autocomplete_popup';
				this._oElement.style.display = 'none';
				this._oContainer.appendChild(this._oElement);
			}						
			
			var self = this;			
			jQuery(this._oElement).bind("contextmenu", function (e) {
				self._oEditorControl.setFocus();
				return false;

			});	
			
			jQuery(this._oElement).bind("mouseup", function (e) {
				self._oEditorControl.setFocus();
				return false;

			});	

		},


		_updatePopup: function (aProposals, oCoords, sPrefix) {
			this.parent.aProposals = aProposals;
			this.parent.oCoords = oCoords;
			this.parent.sPrefix = sPrefix;

			if (this.parent.aProposals.length == 0) {
				deactivate();
				return;
			}

			var newSelected = 0;
			while (newSelected < this.parent.aProposals.length - 1 && this.parent.aProposals[newSelected].unselectable) {
				newSelected++;
			}
			this.parent.selectedIndex = newSelected;


			showPopup();
		},

		_getIconPath: function (category) {
			var path = "";
			if (category != undefined) {
				for (var i = 0; i < this.parent._aCategoryIcon.length; i++) {
					if (this.parent._aCategoryIcon[i].type == category) {
						if (this.parent._aCategoryIcon[i].isRoot) {
							return this.parent._aCategoryIcon[i].path;
						} else {
							return (this.parent._sIconRoot + this.parent._aCategoryIcon[i].path);
						}
					}
				}
			}
			return path;
		},
		
		_getSelectedIconPath: function (category) {
			var path = "";
			if (category != undefined) {
				for (var i = 0; i < this.parent._aCategoryIcon.length; i++) {
					if (this.parent._aCategoryIcon[i].type == category) {
						if (this.parent._aCategoryIcon[i].isRoot) {
							return this.parent._aCategoryIcon[i].pathSelected;
						} else {
							return (this.parent._sIconRoot + this.parent._aCategoryIcon[i].pathSelected);
						}
					}
				}
			}
			return path;
		},
		_focusElement: function (focus, curr) {
			if (curr == undefined) {
				curr = current();
			}

			if (curr == undefined) {
				return;
			}

			curr.className =curr.className.replace( 'ace_autocomplete_selected','');
			if ((curr.childNodes.length > 0) && (curr.childNodes[0].nodeName=="IMG")) {
				var id = curr.attributes["selected_id"];
				if (id && (id.nodeValue)) {
					var preIndex = parseInt(id.nodeValue);																					
					curr.childNodes[0].src=this._getIconPath(this.parent.aProposals[preIndex].category);
				}				
			}
				
			if (focus.className.indexOf('ace_autocomplete_selected') <0) { 
				focus.className = focus.className+ ' ace_autocomplete_selected';
				if ((focus.childNodes.length > 0) && (focus.childNodes[0].nodeName=="IMG")) {
					focus.childNodes[0].src=this._getSelectedIconPath(this.parent.aProposals[this.parent.selectedIndex].category);
				}
			}
			focus.focus();
			var parentNode = this._oElement;
			if (focus.offsetTop < parentNode.scrollTop) {
				this._scrollIntoView(focus, true);
			} else if ((focus.offsetTop + focus.offsetHeight) > (parentNode.scrollTop + parentNode.clientHeight)) {		
				this._scrollIntoView(focus, false);
			}
			
			this.parent.context.event.fireHelpTipShown({
				index:this.parent.selectedIndex, 
				proposals: this.parent.aProposals, 
				website: this.parent._sHelpWebsite, 
				refresh: false
			}).done();
		},

		_ensureFocus: function () {
			this._oElement.scrollTop = 0;
			var node=this._oElement.childNodes[this.parent.selectedIndex];
			if (node) {				
				if (node.className.indexOf('ace_autocomplete_selected') <0) {
					node.className = node.className+ ' ace_autocomplete_selected';
				}
				
				if ((node.childNodes.length > 0) && (node.childNodes[0].nodeName=="IMG")) {
					node.childNodes[0].src=this._getSelectedIconPath(this.parent.aProposals[this.parent.selectedIndex].category);
				}
			}	
		},

		_lineDown: function (newSelected) {
			while (this.parent.aProposals[newSelected].unselectable && newSelected < this.parent.aProposals.length - 1) {
				newSelected++;
			}
			return this._focusIndex(newSelected);
		},
		
		_lineUp: function (newSelected) {
			while (this.parent.aProposals[newSelected].unselectable && newSelected > 0) {
				newSelected--;
			}
			return this._focusIndex(newSelected);
		},		
		
		_focusIndex: function(newSelected) {
			this.parent.selectedIndex = newSelected;

			var element = this._oElement.childNodes[newSelected];
			this._focusElement(element);

			return true;
		},		
		_getTopIndex: function () {
			var nodes = this._oElement.childNodes;
			for (var i = 0; i < nodes.length; i++) {
				var child = nodes[i];
				if (child.offsetTop >= this._oElement.scrollTop) {
					return i;
				}
			}
			return 0;
		},
		
		_getBottomIndex: function () {
			var nodes = this._oElement.childNodes;
			for (var i = 0; i < nodes.length; i++) {
				var child = nodes[i];
				if ((child.offsetTop + child.offsetHeight) > (this._oElement.scrollTop + this._oElement.clientHeight)) {
					return Math.max(0, i - 1);
				}
			}
			return nodes.length - 1;
		},	
		
		_scrollIntoView: function (element,next) {
			this.bInScrolling=true;
			
			//element.scrollIntoView(next);			
			if (next) {
				element.parentNode.scrollTop = element.offsetTop;
			} else {			
				element.parentNode.scrollTop = element.offsetTop - element.parentNode.offsetHeight+ element.offsetHeight+4;
			}
			
			if (this._scrollingTimer) {
				jQuery.sap.clearDelayedCall(this._scrollingTimer);
			}
			
			this._scrollingTimer = jQuery.sap.delayedCall(200, this, function() {					
				this.bInScrolling=false;				
				this._scrollingTimer=null;
			});		
			
		}
		
	};
	
	return {
		initPopupMode: initPopupMode,
		showPopup: showPopup,
		updatePopupProposals: updatePopupProposals,
		current: current,
		pageDown: pageDown,
		pageUp: pageUp,
		lineDown: lineDown,
		lineUp: lineUp,
		deactivate: deactivate,
		getPopupMode: getPopupMode,
		updatePosition: updatePosition
	};
});