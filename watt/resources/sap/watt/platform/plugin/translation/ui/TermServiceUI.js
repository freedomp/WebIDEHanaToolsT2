define({

	/*******************************************
	 *Instance variables
	 */
	_service : undefined, // the translation plugin service
	_params : undefined, // store all parameters passed in to showTermsUI
	_searchText : undefined,
	_domain : undefined,
	//all text types supported by server
	_textTypes : [],
	// all terms returned from the service based on _params.oKeyValue.sValue 
	//format: [{id:123456, value:"", domainId:"", domainName:"", texttypeId:"", texttypeName:"", availableLanguages:12}]
	_terms : [],
	_intellisenseHTMLElement : undefined, // reference to Term dialog container HTML element
	_textBoxElem : undefined, // reference to the input text control
	_buttonElem : undefined, // reference to "Search >" button
	_domainsSelectControl : undefined, //reference to "domain" button
	_textTypesSelectControl : undefined, //reference to "TextType" select control
	_texttypelistElement : undefined,
	_imgElem : undefined,
	_termlistElement : undefined, // reference to the list of terms HTML element
	_callback : undefined,

	// temp Variables
	_doc : $(document)[0], // temporary keep document reference, later code editor will pass the info
	_rowHeight : 25,
	_rows : 10, // display 10 elements in the intellisense view

	/**
	 * Show a UI element to show all suggested terms for the specific text.
	 * <p>
	 * This method will list all suggested term in a UI element for users to choose. Before show the suggestion to users,
	 * it will use current domain and current text type as filters. By default, it provide a way for users to change
	 * text type in the UI.
	 * The users can choose any suggestion and press enter key to use it. the UI will disappear once the users select any term.
	 * @param 	callback {function}	the the callback function once the term was selected.
	 * @param 	oValue {sModel:"", sKey:"", sValue:""}	the term string, which needs suggestions for standard term. It could be a whole word or partial word.
	 * @param 	bShowDoamin {boolean} 	whether allow users to change domain. If it is missing, assume it is allowed.
	 * @param 	bShowTextType {boolean}	whether allow users to change domain. If it is missing, assume it is allowed.
	 * @param 	bAllowChangeTextType {boolean}	whether allow users to change text type. If it is missing, assume it is allowed.
	 * @param 	oPlaceAt 	a HTML element (placeholder) where this UI will be shown in. If it is missing, assume it is a top level UI.
	 * @param 	oCurrentStatus 	the extra data the caller want to passed in.
	 *
	 */
	showTermsUI : function(callback, service, oKeyValue, bShowDoamin, sDomain, bShowTextType, sTextType, bAllowChangeTextType, oPlaceAt,
						   oCurrentStatus) {
		this._callback = callback;
		this._terms = [];

		this.hideTermUI();

		this._service = service;

		this._params = {};
		this._params.oCurrentStatus = oCurrentStatus;
		this._params.oKeyValue = oKeyValue;
		this._params.bShowDoamin = bShowDoamin;
		this._params.sDomain = this._domain = sDomain;
		this._params.bShowTextType = bShowTextType;
		this._params.sTextType = sTextType || this._service.getCurrentTextType();
		this._params.bAllowChangeTextType = bAllowChangeTextType;

		var docWidth = $(document).width();

		if (oPlaceAt) {
			this._params.oPlaceAt = oPlaceAt;
		} else {
			this._params.oPlaceAt = {};
			this._params.oPlaceAt.top = 250;
			this._params.oPlaceAt.left = docWidth / 2 - 250;
		}

		this.initContainer(this._params.oPlaceAt);
		this.hookUpEvents();

	},
	/**
	 * hide the UI
	 */
	hideTermUI : function() {
		if (this._intellisenseHTMLElement) {
			$(body)[0].removeChild(this._intellisenseHTMLElement);
			this._intellisenseHTMLElement = undefined;
		}
	},


	isVisible : function() {
		if (this._intellisenseHTMLElement) {
			return true;
		} else {
			return false;
		}
	},

	/*
	 * *****************************************************************
	 * Initializes the intelligence container HTML element.            *
	 * *****************************************************************
	 */
	initContainer : function(oPlaceAt) {
		var dialogWidth = 300; //may need revise later
		var dialogHeight = 290; ////may need revise later		
		var docWidth = $(document).width();
		var docHeight = $(document).height();

		if (oPlaceAt.container){
			var offset=jQuery(oPlaceAt.container).offset();
			docWidth =offset.left+oPlaceAt.container.offsetWidth;
		}

		this._intellisenseHTMLElement = this._doc.createElement('div');
		this._intellisenseHTMLElement.className = "termservice_container";
		this._intellisenseHTMLElement.style.listStyleType = 'none';
		this._intellisenseHTMLElement.style.display='none';
		this._docWidth = docWidth;

		if (oPlaceAt.left) {
			var finalTop = parseInt(oPlaceAt.top) + 15;
			var finalLeft = parseInt(oPlaceAt.left);
			if (finalLeft + dialogWidth > docWidth) {
				finalLeft = docWidth - dialogWidth;
				if (finalLeft < 0) {
					finalLeft = 0;
				}
			}
			if (finalTop + dialogHeight > docHeight) {
				finalTop = finalTop - dialogHeight - 20; //docHeight - dialogHeight;
				if (finalTop < 0) {
					finalTop = 0;
				}
			}

			this._intellisenseHTMLElement.style.left = finalLeft + 'px';
			this._intellisenseHTMLElement.style.top = finalTop + 'px';
		}

		var that=this;
		$(body)[0].appendChild(that._intellisenseHTMLElement);
		that._intellisenseHTMLElement.style.display='block';

		this.createControls().then(function(){
			that._textBoxElem.select();
			that._textBoxElem.focus();
		}).done();
	},

	createTextTypeRelatedControls: function () {
		//input box
		this._textTypesSelectControl = this._doc.createElement('input');
		this._textTypesSelectControl.className = "termservice_select_texttype";
		this._textTypesSelectControl.setAttribute("value", "All text types");
		this._textTypesSelectControl_value = this._service.context.i18n.getText("i18n", "item_texttype_all");

		this._textTypesSelectControl.setAttribute("tabIndex", 2);
		if (this._params.sTextType) {
			this._textTypesSelectControl.setAttribute("value", this._params.sTextType);
			this._textTypesSelectControl_value = this._params.sTextType;

		}
		//this._textTypesSelectControl.setAttribute("readonly", true);

		this._intellisenseHTMLElement.appendChild(this._textTypesSelectControl);

		//dropdown button
		this._imgElem = this._doc.createElement('div');
		this._imgElem.className = ".sapUiTfComboIcon termservice_img_button";
		this._intellisenseHTMLElement.appendChild(this._imgElem);

		//list
		this._texttypelistElement = this._doc.createElement('ul');
		this._texttypelistElement.className = "termservice_texttype_list";
		this._texttypelistElement.style.visibility = "hidden";

		var texttypeStyle = this._textTypesSelectControl.currentStyle || window.getComputedStyle(this._textTypesSelectControl);

		var left = parseInt(this._intellisenseHTMLElement.style.left) + 240;//texttypeStyle.left;
		this._texttypelistElement.style.left = left.toString() + "px";

		this._texttypelistElement.style.maxWidth = (this._docWidth - left) + "px";

		var top = parseInt(this._intellisenseHTMLElement.style.top) + parseInt(texttypeStyle.marginTop)
			+ parseInt(texttypeStyle.marginBottom) + parseInt(texttypeStyle.paddingTop) + parseInt(texttypeStyle.paddingBottom)
			+ parseInt(texttypeStyle.height) + parseInt(texttypeStyle.borderTop) + parseInt(texttypeStyle.borderBottom);
		this._texttypelistElement.style.top = top.toString() + "px";

		this._intellisenseHTMLElement.appendChild(this._texttypelistElement);

		this.addTextTypes();

		var that = this;

		this._textTypesSelectControl.onkeydown = function (e) {
			if (e.keyCode === 9) {
				e.preventDefault();
				e.stopPropagation();
				that._textBoxElem.select();
				that._textBoxElem.focus();
			}
		};

		//event for "texttype" input box
		this._textTypesSelectControl.onkeyup = function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.keyCode === 13) {
				if (that._focusedTextType !== undefined) {
					that._selectTextType(that._focusedTextType);
				}
			} else if (that._textTypesSelectControl.value !== that._textTypesSelectControl_value) {
				that._filterTypeList(that._textTypesSelectControl.value);
				that._texttypelistElement.style.visibility = "visible";
			}
		};

		this._textTypesSelectControl.onclick = function (e) {
			e.preventDefault();
			e.stopPropagation();
			try {
				var visible = that._texttypelistElement.style.visibility;
				if (visible === "visible") {
					if (that._texttypelistElement) {
						that._texttypelistElement.style.visibility = "hidden";
						if (that._textTypesSelectControl.className.indexOf('selected') >= 0) {
							that._textTypesSelectControl.className = that._textTypesSelectControl.className.replace('selected', '');
						}
					}
				} else {
					if (that._texttypelistElement) {
						that._texttypelistElement.style.visibility = "visible";
						if (that._textTypesSelectControl.className.indexOf('selected') < 0) {
							that._textTypesSelectControl.className += ' selected';
						}
					}
				}

			} catch (e) {

			}
		};

		//event for "text type" list
		this._texttypelistElement.onclick = function (e) {
			e.preventDefault();
			e.stopPropagation();
			try {

				var elem = e.target.parentNode;
				var id = elem.attributes["selected_id"];
				var texttype = id.nodeValue;
				that._selectTextType(texttype);

			} catch (e) {

			}
		};

		this._texttypelistElement.onmouseover = function (e) {
			e.preventDefault();
			e.stopPropagation();
			try {
				var elem = e.target.parentNode;
				var id = elem.attributes["selected_id"];
				var value = id.nodeValue;
				that.textTypeFocusTo(value);
			} catch (e) {

			}
		};

		//event for "texttype button" button
		this._imgElem.onclick = function (e) {
			e.preventDefault();
			e.stopPropagation();
			try {
				var visible = that._texttypelistElement ? that._texttypelistElement.style.visibility : null;
				if (visible == "visible") {
					if (that._texttypelistElement) {
						that._texttypelistElement.style.visibility = "hidden";
					}

					if (that._params.bShowTextType) {
						if (that._textTypesSelectControl.className.indexOf('selected') >= 0) {
							that._textTypesSelectControl.className = that._textTypesSelectControl.className.replace('selected', '');
						}
					}
				} else {
					if (that._texttypelistElement) {
						that._texttypelistElement.style.visibility = "visible";
					}
					if (that._params.bShowTextType) {
						if (that._textTypesSelectControl.className.indexOf('selected') < 0) {
							that._textTypesSelectControl.className += ' selected';
						}
					}
				}

			} catch (e) {

			}
		};

		this._selectTextType = function(texttype) {
			var value = (texttype === "") ? this._service.context.i18n.getText("i18n", "item_texttype_all") : texttype;

			this._textTypesSelectControl.setAttribute("value", value);
			this._textTypesSelectControl.value = value;
			this._textTypesSelectControl_value = value;

			this._params.sTextType = texttype;
			if (this._texttypelistElement) {
				this._texttypelistElement.style.visibility = "hidden";
			}
			this.refresh();

			if (this._textTypesSelectControl.className.indexOf('selected') >= 0) {
				this._textTypesSelectControl.className = this._textTypesSelectControl.className.replace('selected','');
			}
			this._textTypesSelectControl.focus();
		};
	},

	createTermListControl: function () {
		this._termlistElement = this._doc.createElement('ul');
		this._termlistElement.className = "termservice_list";
		//this._termlistElement.setAttribute("tabIndex", 3);

		var textboxStyle = this._textBoxElem.currentStyle || window.getComputedStyle(this._textBoxElem);

		this._termlistElement.style.left = this._intellisenseHTMLElement.style.left;
		var top = parseInt(this._intellisenseHTMLElement.style.top) + parseInt(textboxStyle.height) + parseInt(textboxStyle.marginTop)
			+ parseInt(textboxStyle.marginBottom);
		top = top + parseInt(textboxStyle.paddingTop) + parseInt(textboxStyle.paddingBottom) + parseInt(textboxStyle.borderTop)
			+ parseInt(textboxStyle.borderBottom) + 10;

		this._termlistElement.style.top = top.toString() + "px";
		this._termlistElement.style.visibility = "hidden";
		this._intellisenseHTMLElement.appendChild(this._termlistElement);
	},

	/*
	 * *******************************************************
	 * Creates controls necessary controls.                  *
	 * *******************************************************
	 */
	createControls : function() {

		this._textBoxElem = this._doc.createElement('input');
		this._textBoxElem.className = "termservice_textbox";
		this._textBoxElem.setAttribute("tabIndex", 1);
		this._textBoxElem.setAttribute("value", this._params.oKeyValue.sValue);
		this._intellisenseHTMLElement.appendChild(this._textBoxElem);
		if (this._params.bShowDoamin) {

			this._domainControl = this._doc.createElement('input');
			this._domainControl.className = "termservice_select_domain";
			this._domainControl.setAttribute("disabled", true);
			this._domainControl.setAttribute("value", this._params.sDomain);
			//this._domainControl.setAttribute("placeholder", "ALL");
			this._intellisenseHTMLElement.appendChild(this._domainControl);
		} else {
			this._domainControl = undefined;
		}

		if (this._params.bShowTextType) {
			this.createTextTypeRelatedControls();
		} else {
			this._textTypesSelectControl = undefined;
		}

		//termlist
		this.createTermListControl();
		return this.getTerms();
	},

	/*
	 * **********************************************************************
	 * Adds term data to the select control.                               *
	 * **********************************************************************
	 */

	getTerms : function() {
		this._terms = [];

		this._termlistElement.style.visibility = "hidden";

		var that = this;
		var i;

		this._termlistElement.innerHTML = "";

		return this._service.getTerms(this._params.oKeyValue.sValue, this._params.sDomain, this._params.sTextType).then(function(result) {
			that._searchText = that._params.oKeyValue.sValue;
			that._terms = result.suggestions;

			if (that._terms && (that._terms.length > that._rows)) {
				that._termlistElement.style.height = that._rows * that._rowHeight + "px";

			} else {
				that._termlistElement.style.height = 'auto';

			}

			that._termlistElement.style.visibility = "visible";

			if (that._terms) {
				for (i = 0; i < that._terms.length; i++) {
					var elem = that._doc.createElement('li');
					elem.setAttribute("selected_id", i);

					termElem = that._doc.createElement('span');
					termElem.className = "termservice_intellisense_item";
					termElem.innerHTML = that._terms[i].value;
					elem.appendChild(termElem);

					if (that._params.bShowTextType) {
						spanElem = that._doc.createElement('span');
						spanElem.className = "termservice_intellisense_description";
						spanElem.innerHTML = that._terms[i].texttypeName + " (" + that._terms[i].texttypeId + ")";
						elem.appendChild(spanElem);
					}

					that._termlistElement.appendChild(elem);
				}

				that.ensureFocus();

			} else {
				return;
			}

			if (that._terms.length==0) {
				var noElem = that._doc.createElement('span');
				noElem.className = "termservice_intellisense_noitem";
				noElem.innerHTML = that._service.context.i18n.getText("i18n", "dlg_noSuggestionMsg");
				that._termlistElement.appendChild(noElem);
			}

			//try to get translations for the terms in asyn way
		}, function(error) {
			that._termlistElement.style.visibility = "visible";
		});
	},

	/*
	 * **************************************************
	 * Adds text type data to the select control.       *
	 * **************************************************
	 */
	addTextTypes : function() {

		//this._textTypes = [];

		//clear all options
		if (this._texttypelistElement) {
			this._texttypelistElement.innerHTML = "";
		}
		if (this._textTypes.length<1) {
			var that = this;
			this._service.getTextTypes().then(function(result) {
				that._textTypes = result.texttypes;
				that._addTextTypesHelper(that._textTypes);
			}).done();
		} else {
			this._addTextTypesHelper(this._textTypes);
		}

	},

	_addTextTypesHelper: function(textTypes){
		if (this._params.bShowTextType) {
			this._texttypelistElement.style.height = this._rows * this._rowHeight + "px";//that._terms.length * that._rowHeight + "px";
		}

		//add "All Types"
		var elem = this._doc.createElement('li');
		elem.setAttribute("selected_id", "");

		termElem = this._doc.createElement('span');
		termElem.className = "termservice_texttype_item";

		termElem.innerHTML = this._service.context.i18n.getText("i18n", "item_texttype_all");
		elem.appendChild(termElem);
		if (this._params.bShowTextType) {
			this._texttypelistElement.appendChild(elem);
		}

		//specific text types

		if (textTypes) {
			var max = textTypes.length;
			for (var i = 0; i < max; i++) {
				var elem = this._doc.createElement('li');
				elem.setAttribute("selected_id", textTypes[i].id);

				termElem = this._doc.createElement('span');
				termElem.className = "termservice_texttype_item";

				termElem.innerHTML = textTypes[i].name + " (" + textTypes[i].id + ")";
				elem.appendChild(termElem);
				this._texttypelistElement.appendChild(elem);
			}
		}
	},
	_adjustPosition : function() {
		//if (this._intellisenseHTMLElement) {
		//
		//}
	},

	/*
	 * **********************************************************************
	 * Hooks up events for term service text field.                         *
	 * **********************************************************************
	 */
	_timeout : null,
	_timeout4Translation : null,

	hookUpEvents : function() {

		var that = this;

		//event for "search" Textbox
		this._textBoxElem.onkeyup = function(e) {

			try {
				switch (e.which) {
					case 13: //enter
						e.preventDefault();
						e.stopPropagation();
						that.termSelected();
						break;
					case 40: //arrow down
					case 38:
						e.preventDefault();
						e.stopPropagation();
						if (that._termlistElement) {
							//that.refresh();
							that._termlistElement.focus();
						}
						break;
					case 27: //escape
						e.preventDefault();
						e.stopPropagation();
						that.termCancelled();
						break;
					default:
						var value = $('.termservice_textbox')[0].value;
						if (value != that._params.oKeyValue.sValue) {
							that._params.oKeyValue.sValue = value;

							//delay showing the suggestion
							if (that._timeout) {
								clearTimeout(that._timeout);
							}
							that._timeout = setTimeout(function() {
								if (that._termlistElement) {
									that.refresh();
								}
							}, 500);
						}
				}

			} catch (e) {

			}
		};

		this._textBoxElem.onfocus = function(e) {
			if (this._params && this._params.bShowTextType) {
				that._texttypelistElement.style.visibility = "hidden";
				if (that._textTypesSelectControl.className.indexOf('selected')>=0) {
					that._textTypesSelectControl.className = that._textTypesSelectControl.className.replace('selected','');
				}
			}
		};



		this._filterTypeList =  function(value){
			this._texttypelistElement.innerHTML = "";
			value=value.toUpperCase();
			this._focusedTextType=undefined;

			if (value.trim()===""){
				var elem = that._doc.createElement('li');
				elem.setAttribute("selected_id", "");

				termElem = that._doc.createElement('span');
				termElem.className = "termservice_texttype_item";

				termElem.innerHTML = that._service.context.i18n.getText("i18n", "item_texttype_all");
				elem.appendChild(termElem);
				that._texttypelistElement.appendChild(elem);
			}

			if (that._textTypes) {
				var max = that._textTypes.length;
				for (i = 0; i < max; i++) {
					if ((value.trim()!=="")&&(that._textTypes[i].id.indexOf(value)<0)) {
						continue;
					}
					var elem = that._doc.createElement('li');
					elem.setAttribute("selected_id", that._textTypes[i].id);

					termElem = that._doc.createElement('span');
					termElem.className = "termservice_texttype_item";

					termElem.innerHTML = that._textTypes[i].name + " (" + that._textTypes[i].id + ")";
					elem.appendChild(termElem);
					that._texttypelistElement.appendChild(elem);
				}
			}

			if (that._texttypelistElement.childNodes.length>0){
				var termElem = that._texttypelistElement.childNodes[0];
				var id = termElem.attributes["selected_id"];
				var value = id.nodeValue;
				that.textTypeFocusTo(value);
			}
		};

		//events for term list control

		this._intellisenseHTMLElement.onkeydown = function(e) {
			try {

				if (this._params.bShowTextType) {
					that._texttypelistElement.style.visibility = "hidden";

					if (that._textTypesSelectControl.className.indexOf('selected') >= 0) {
						that._textTypesSelectControl.className = that._textTypesSelectControl.className.replace('selected', '');
					}
				}

				if (e.which === 13) {
					e.preventDefault();
					e.stopPropagation();
					that.termSelected();

				} else if (e.which === 40) {
					e.preventDefault();
					e.stopPropagation();
					that.focusNext();
				} else if (e.which === 38) {
					e.preventDefault();
					e.stopPropagation();
					that.focusPrev();
				} else if (e.which === 27) {
					e.preventDefault();
					e.stopPropagation();
					that.termCancelled();
				}
			} catch (e) {

			}
		};

		/*
		 * ***********************************************************************
		 * Hooks up events for term list.                                        *
		 * ***********************************************************************
		 */
		this._termlistElement.onclick = function(e) {
			e.preventDefault();
			e.stopPropagation();
			try {
				if (that._texttypelistElement) {
					that._texttypelistElement.style.visibility = "hidden";
				}
				var elem = e.target.parentNode;
				var id = elem.attributes["selected_id"];
				var index = parseInt(id.nodeValue);
				that.termSelected(index);

				if (this._params.bShowTextType) {
					if (that._textTypesSelectControl.className.indexOf('selected') >= 0) {
						that._textTypesSelectControl.className = that._textTypesSelectControl.className.replace('selected', '');
					}
				}
			} catch (e) {

			}
		};

		this._termlistElement.onmouseover = function(e) {
			e.preventDefault();
			e.stopPropagation();
			try {
				if (that._texttypelistElement) {
					that._texttypelistElement.style.visibility = "hidden";
				}
				var elem = e.target.parentNode;
				var id = elem.attributes["selected_id"];
				var index = parseInt(id.nodeValue);
				that.focusTo(index);
				if (this._params.bShowTextType) {
					if (that._textTypesSelectControl.className.indexOf('selected') >= 0) {
						that._textTypesSelectControl.className = that._textTypesSelectControl.className.replace('selected', '');
					}
				}
			} catch (e) {

			}
		};

	},
	refresh : function() {
		this.getTerms();
	},

	//make sure one item was selected
	ensureFocus : function() {
		$('.termservice_list').scrollTop(0);
		if (!this.current()) {
			if (this._termlistElement.firstChild) {
				this._termlistElement.firstChild.className = 'termservice_selected';

				this.showTranslation4Term(this._termlistElement.firstChild,true);
				//this._termlistElement.focus();
			}
		}
		//else {
		//this._termlistElement.focus();
		//}
	},

	//get current selected element
	current : function current() {
		var children = this._termlistElement.childNodes;
		for ( var i = 0; i < children.length; i++) {
			var li = children[i];
			if (li.className === 'termservice_selected') {
				return li;
			}
		}
		return undefined;
	},

	//move focus to a item at index
	focusTo : function(index) {
		var elements = this._termlistElement.childNodes;
		if ((elements === undefined) || (elements.length <= 0) || (index >= elements.length)) {
			return;
		}

		var curr = this.current();
		if (curr !== undefined) {
			curr.className = ' ';
		}

		var focus = elements[index];
		focus.className = 'termservice_selected';

		var old_index = -1;
		if (curr !== undefined) {
			var id = curr.attributes["selected_id"];
			old_index = parseInt(id.nodeValue);
		}

		if (old_index !== index) {
			//changed
			this.showTranslation4Term(focus);
		}

	},

	//move focus to next item
	focusNext : function() {
		var elements = this._termlistElement.childNodes;
		if ((elements === undefined) || (elements.length <= 0) || (this._terms.length<=0)) {
			return;
		}

		var curr = this.current();
		if (curr !== undefined) {
			curr.className = ' ';

			var focus = curr.nextSibling || curr.parentNode.firstChild;
			focus.className = 'termservice_selected';

			if (focus === curr.parentNode.firstChild) {
				$('.termservice_list').scrollTop(0);
			} else {
				var top1 = $('.termservice_list').scrollTop();
				var cIndex = [].indexOf.call(focus.parentNode.childNodes, focus);

				if (cIndex * this._rowHeight - top1 >= this._rows * this._rowHeight) {
					$('.termservice_list').scrollTop(top1 + this._rowHeight);
				}
			}
			this.showTranslation4Term(focus);

		} else {
			this.focusTo(0);
		}
	},

	//move focus to prev item
	focusPrev : function() {
		var elements = this._termlistElement.childNodes;
		if ((elements === undefined) || (elements.length <= 0) || (this._terms.length<=0)) {
			return;
		}

		var curr = this.current();
		if (curr != undefined) {
			curr.className = ' ';

			var focus = curr.previousSibling || curr.parentNode.lastChild;
			focus.className = 'termservice_selected';

			if (focus === curr.parentNode.lastChild) {
				if (curr.parentNode.childNodes.length >= this._rows) {
					$('.termservice_list').scrollTop((curr.parentNode.childNodes.length - this._rows) * this._rowHeight);
				} else {
					$('.termservice_list').scrollTop(0);
				}
			} else {
				var cIndex = [].indexOf.call(curr.parentNode.childNodes, focus);
				var top1 = $('.termservice_list').scrollTop();

				if (cIndex * this._rowHeight < top1) {
					$('.termservice_list').scrollTop(top1 - this._rowHeight);
				}

			}
			this.showTranslation4Term(focus);

		} else {
			this.focusTo(0);
		}
	},

	showTranslation4Term : function(element, refresh) {
		var that = this;

		if (this._timeout4Translation) {
			clearTimeout(this._timeout4Translation);
		}
		this._timeout4Translation = setTimeout(function() {
			var id, index, term;
			id = element.attributes["selected_id"];
			if (!id) {
				return;
			}
			index = parseInt(id.nodeValue);
			term = that._terms[index];

			var translateUnit = {};
			translateUnit.key = "TEST_KEY";
			translateUnit.value = term.value;
			translateUnit.textType = term.texttypeId;

			if (term.translations) {
				that.showTranslationValue(term.translations,index,refresh);
			} else{
				var translateUnits = [];
				translateUnits.push(translateUnit);

				that._service.getTranslations(translateUnits).then(function(response) {
					if (response && response.length > 0) {
						term.translations = response[0].translations;
						that.showTranslationValue(term.translations, index, refresh);
					}
				}, function(error) {
					alert(error);
				}).done();
			}
			that._timeout4Translation=null;
		}, 100);
	},
	showTranslationValue: function(translations,index,refresh){
		if (translations && translations.length > 0) {
			// sort by language
			translations.sort(function(a, b) {
				return a.language.localeCompare(b.language);
			});
		}
		this._service.context.event.fireTranslated({
			text:this._searchText,
			terms: this._terms,
			index: index,
			refresh: refresh}).done();
	},
	//pass in -1 to set no focus
	textTypeFocusTo : function(id) {
		this._focusedTextType=id;
		var elements = this._texttypelistElement.childNodes;
		if ((elements === undefined) || (elements.length <= 0) || (id === undefined)) {
			return;
		}

		for ( var i = 0; i < elements.length; i++) {
			var li = elements[i];
			var idAttribute = li.attributes["selected_id"];
			var idValue = idAttribute.nodeValue;

			if (li.className === 'termservice_texttype_selected') {
				li.className = ' ';
			}
			if (idValue === id) {
				li.className = 'termservice_texttype_selected';
			}
		}
		this._textTypesSelectControl.focus();

	},

	//call back function, which will be called when users click (or enter) on an item
	//2 callback parameters are
	// 1. {sModel:"", sKey:"", sValue:""}
	// 2. {id:123456, value:"", domainId:"", domainName:"", texttypeId:"", texttypeName:"", availableLanguages:12, translatons:[{lang:"", value:""}, {lang:"", value:""}, ... }]}
	termSelected : function(index) {
		var that = this;
		var term;

		if (index === undefined) {
			//from key enter
			var elements = this._termlistElement.childNodes;
			if ((elements === undefined) || (elements.length <= 0)) {
				//no term available, return the text from Text Box
				var text = $('.termservice_textbox')[0].value;
				var term1 = {};
				term1.id = undefined;
				term1.value = text;
				term1.domainId = this._domain;
				term1.texttypeId = this.service.getCurrentTextType();
				term1.availableLanguages = 0;
				term1.translations = null;

				this.hideTermUI();
				if (this._callback) {
					this._callback(this._params.oKeyValue, term1);
				}

				return;
			}

			var curr = this.current();
			if (curr) {
				//return the selected term
				var cindex = [].indexOf.call(elements, curr);
				term = this._terms[cindex];
				if (term.translations) {
					//alert(JSON.stringify(term));
					this.hideTermUI();
					if (this._callback) {

						this._callback(this._params.oKeyValue, term);
					}

				} else {
					//move too fast to get translation for a term, get translation again
					that.hideTermUI();
					var translateUnit = {};
					translateUnit.key = "TEST_KEY";
					translateUnit.value = term.value;
					translateUnit.textType = term.texttypeId;

					var translateUnits = [];
					translateUnits.push(translateUnit);

					this._service.getTranslations(translateUnits).then(function(response) {
						if (response && response.length > 0) {
							term.translations = response[0].translations;

							if (that._callback) {
								that._callback(that._params.oKeyValue, term);
							}
						}
					}, function(error) {

						if (that._callback) {
							that._callback(that._params.oKeyValue, term);
						}
					}).done();
				}
			} else {
				//no selected item, return the text from Text Box
				text = $('.termservice_textbox')[0].value;
				term1 = {};
				term1.id = undefined;
				term1.value = text;
				term1.domainId = this._domain;
				term1.texttypeId = this.service.getCurrentTextType();
				term1.availableLanguages = 0;
				term1.translations = null;

				this.hideTermUI();
				if (this._callback) {

					this._callback(this._params.oKeyValue, term1);
				}

			}

		} else {
			//from mouse click
			term = this._terms[index];
			if (term.translations) {
				//alert(JSON.stringify(term));
				this.hideTermUI();
				if (this._callback) {
					this._callback(this._params.oKeyValue, term);
				}
			} else {
				//move too fast to get translation for a term, get translation again
				that.hideTermUI();
				translateUnit = {};
				translateUnit.key = "TEST_KEY";
				translateUnit.value = term.value;
				translateUnit.textType = term.texttypeId;

				translateUnits = [];
				translateUnits.push(translateUnit);

				this._service.getTranslations(translateUnits).then(function(response) {
					if (response && response.length > 0) {
						term.translations = response[0].translations;

						if (that._callback) {
							that._callback(that._params.oKeyValue, term);
						}
					}
				}, function(error) {

					if (that._callback) {
						that._callback(that._params.oKeyValue, term);
					}
				}).done();
			}

		}
	},
	//the term UI was cancelled  
	termCancelled : function() {
		this.hideTermUI();
		if (this._callback) {
			this._callback();
		}
	},
	/**
	 * add a css file to the document
	 */
	loadCSS : function(url) {
		var cssLink = $("<link rel='stylesheet' type='text/css' href='" + url + "'>");
		$("head").append(cssLink);
	}

});
