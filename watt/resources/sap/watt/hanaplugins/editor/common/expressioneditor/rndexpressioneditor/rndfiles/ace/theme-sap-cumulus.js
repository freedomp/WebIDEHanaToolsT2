/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRAherve.mischler@sap.comCT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

ace.define('ace/theme/sap-cumulus', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

    exports.isDark = false;
    exports.cssClass = "ace-sap-cumulus";
    exports.cssText = ".ace-sap-cumulus .ace_gutter {				/* line numbers */\
background: #f2f2f2;											/* @sapFLatExtraLightBG */\
color: #666666;													/* @sapFlatMediumText */\
}																\
.ace-sap-cumulus .ace_print-margin {							/* right line */\
background: #e5e5e5;											/* @sapFlatExtraLightBorder */\
width: 1px;\
}																\
.ace-sap-cumulus {												/* editor and text in general  */\
background-color: white;										/* @sapFlatLightestBG */\
font-family: 'Arial monospaced for SAP', 'Lucida Console', 'Andale Mono';\
line-height: 18px;\
font-size: 12px;\
}																\
.ace-sap-cumulus .ace_cursor {									/* cursor | */\
color: rgb(0, 157, 224); 										/* @sapFlatBrand */\
}																\
.ace-sap-cumulus .ace_marker-layer .ace_selection {				/* text selection */\
background: rgba(0, 91, 141, 0.1); 								/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus.ace_multiselect .ace_selection.ace_start {		/* ? */\
box-shadow: 0 0 3px 0px #007cc0;								/* ? */\
border-radius: 2px;\
}																\
.ace-sap-cumulus .ace_marker-layer .ace_step {					/* ? */\
background: #666;												/* ? */\
}																\
.ace-sap-cumulus .ace_marker-layer .ace_bracket {				/* highlight for closing bracket */\
margin: 0 0 0 0;\
border: 1px solid rgb(0, 91, 141)								/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus .ace_marker-layer .ace_active-line {			/* highlighted row */\
background: rgba(0, 91, 141, 0.1);								/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus .ace_gutter-active-line {						/* highlighted line number */\
background-color: rgba(0, 91, 141, 0.1);						/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus .ace_marker-layer .ace_selected-word {			/* border around single selected word */\
border: 0px solid rgba(0, 91, 141, 0.2)							/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus .ace_invisible {								/* ? */\
color: rgba(0, 91, 141, 1) 										/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus .ace_constant,									/* ? */\
.ace-sap-cumulus .ace_constant.ace_character,\
.ace-sap-cumulus .ace_constant.ace_character.ace_escape,\
.ace-sap-cumulus .ace_constant.ace_other,\
.ace-sap-cumulus .ace_support.ace_constant {\
color: rgba(0, 91, 141, 1) 										/* @sapFlatHighlight */\
}																\
.ace-sap-cumulus .ace_invalid {									/* ? */\
color: gray;													/* ? */\
background-color: #FF0000;										/* ? */\
}																\
.ace-sap-cumulus .ace_fold {									/* collapse indicator <-> */\
background-color: transparent;									/* - */\
border-color: transparent;										/* - */\
}																\
.ace-sap-cumulus .ace_comment {									/* comments */\
color: #999999;													/* @sapFlatLightText */\
}																\
.ace-sap-cumulus .ace_meta.ace_tag {							/* ? */\
color: #d128ae;													/* ? */\
}																\
.ace-sap-cumulus .ace_collab.ace_user1 {						/* ? */\
color: #323232;													/* ? */\
background-color: #FFF980										/* ? */\
}																\
.ace-sap-cumulus .ace_indent-guide {							/* indent line */\
border-right: 1px dotted #CCCCCC;								/* @sapFlatMediumBorder */\
margin-right: -1px;												/* correction for right border */\
}																\
.ace-sap-cumulus .ace_gutter-cell.ace_error:before {			/* error (x) indicator */\
content: \"\";													/* ? */\
background: #e22525;											\
width: 8px;														\
height: 8px;													\
position: absolute;												\
top: 5px;														\
left: 5px;														\
}																\
.ace-sap-cumulus .ace_gutter-cell.ace_error {					/* error (x) at line numbers */\
background: #fbdfdf;											/* @sapFlatErrorBG */\
color: #cc1919; 												/* @sapFlatNegativeText */\
}																\
.ace-sap-cumulus .ace_gutter-cell.ace_warning:before {			/* warning (x) indicator */\
content: \"\";													/* ? */\
background: #d14900;											\
width: 8px;														\
height: 8px;													\
position: absolute;												\
top: 5px;														\
left: 5px;														\
}																\
.ace-sap-cumulus .ace_gutter-cell.ace_warning {					/* warning at line numbers */\
background: #fffcb5; 											/* @sapFlatWarningBG */\
color: #d14900;													/* @sapFlatCriticalText */\
}																\
.ace-sap-cumulus .ace_keyword {									/* syntax keyword, like 'new' */\
color: #ab218e;													/* @sapFlatAccent4 */\
font-weight: bold; 												\
}																\
.ace-sap-cumulus .ace_storage {									/* syntax keyword, like 'var' and 'function' */\
color: #004990;													/* @sapFlatAccent7 */\
font-weight: bold; 												\
}																\
.ace-sap-cumulus .ace_meta {									/* syntax keyword, like ? */\
color: ab218e;													/* @sapFlatAccent4 */\
}																\
.ace-sap-cumulus .ace_support.ace_function {					/* syntax keyword for functions like alert */\
color: #ab218e;													/* @sapFlatAccent4 */\
}																\
.ace-sap-cumulus .ace_entity.ace_name {							/* function name */\
color: #551047;													/* darken(@sapFlatAccent4, 20%) !*/\
}																\
.ace-sap-cumulus .ace_variable.ace_parameter {					/* function parameters */\
color: #d128ae;													/* darken(@sapFlatAccent4, 9%) !*/\
font-style: italic												\
}																\
.ace-sap-cumulus .ace_string {									/* text in quotes */\
color: #005b8d;													/* darken(sapFlatAccent5, 10%) !*/\
}																\
.ace-sap-cumulus .ace_string.ace_regexp {						/* regex */\
color: #002a41;													/* darken(sapFlatAccent5, 25%) !*/\
}																\
.ace-sap-cumulus .ace_gutter-cell.ace_info {					/* info */\							\
    background-image: none;										\
    background-color: #e5f2f9;									\
}																\
.ace-sap-cumulus .ace_gutter-cell.ace_info:before {				/* info (x) indicator */\
	content: \"\";												/* ? */\
	background: #007cc0 ;										\
	width: 8px;													\
	height: 8px;												\
	position: absolute;											\
	top: 5px;													\
	left: 5px;													\
}																\
.ace_gutter-tooltip {											/* tooltip for error, warning and info */\
	background: white;											\
	border: none;												\
	box-shadow: 0 0 3px rgba(0,0,0, 0.3);						\
	font-family: Arial, sans-serif;								\
	font-size: 12px;											\
}																\
.ace_gutter-cell {												/* give gutter box relative pos for marker */\
    position: relative;											\
}";

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
