/* ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2015 SAP SE or an SAP affiliate company. 
 * All rights reserved.
 *
 * This file is based on code coming from Ace
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

ace.define('ace/theme/sap-basement', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-sap-basement";
exports.cssText = ".ace-sap-basement .ace_gutter {					/* line numbers */\
background: #161719;												/* @sapUiExtraLightBG */\
color: #707070;														/* @sapUiExtraLightText */\
}\
.ace-sap-basement .ace_print-margin {								/* right line */\
background: #e5e5e5;												/* @sapUiExtraLightBorder */\
width: 1px;\
}\
.ace-sap-basement {													/* editor and text in general  */\
background-color: #161719;											/* dark theme bg */\
font-family: 'Consolas', 'Lucida Console', 'Andale Mono', 'Monospace';\
line-height: 18px;\
font-size: 14px;\
color: white;\
}\
.ace-sap-basement .ace_cursor {										/* cursor | */\
color: rgb(0, 124, 192)												/* @sapUiHighlight */\
}\
.ace-sap-basement .ace_marker-layer .ace_selection {				/* text selection */\
background: rgba(0, 124, 192, 0.5);	 								/* @sapUiHighlight */\
}\
.ace-sap-basement.ace_multiselect .ace_selection.ace_start {		/* ? */\
box-shadow: 0 0 3px 0px transparent;										/* ? */\
border-radius: 2px\
}\
.ace-sap-basement .ace_marker-layer .ace_step {						/* ? */\
background: silver;													/* ? */\
}\
.ace-sap-basement .ace_marker-layer .ace_bracket {					/* highlight for closing bracket */\
margin: 0 0 0 0;\
border: 1px solid rgb(0, 124, 192)									/* @sapUiHighlight */\
}\
.ace-sap-basement .ace_marker-layer .ace_active-line {				/* highlighted row */\
background: rgba(0, 124, 192, 0.2);									/* @sapUiHighlight */\
}\
.ace-sap-basement .ace_gutter-active-line {							/* highlighted line number */\
background-color: rgba(0, 124, 192, 0.2);							/* @sapUiHighlight */\
}\
.ace-sap-basement .ace_marker-layer .ace_selected-word {			/* border around single selected word */\
border: 1px solid rgba(0, 124, 192, 0.5)							/* @sapUiHighlight */\
}\
.ace-sap-basement .ace_invisible {									/* ? */\
color: green 														/* ? */\
}\
.ace-sap-basement .ace_keyword {									/* syntax keyword, like 'new' */\
color: #d629b2;														/* lighten(@sapUiAccent4, 10%) */\
font-weight: bold; 													\
}\
.ace-sap-basement .ace_storage {									/* syntax keyword, like 'var' */\
color: #009de0;														/* just dark */\
font-weight: bold; 													\
}\
.ace-sap-basement .ace_meta {										/* syntax keyword, like ? */\
color: rgb(0, 73, 144);												/* ? */\
}\
.ace-sap-basement .ace_constant,									/* ? */\
.ace-sap-basement .ace_constant.ace_character,\
.ace-sap-basement .ace_constant.ace_character.ace_escape,\
.ace-sap-basement .ace_constant.ace_other,\
.ace-sap-basement .ace_support.ace_constant {\
color: #d128ae;														/* ? */\
}\
.ace-sap-basement .ace_invalid {									/* ? */\
color: #e22525 ;													/* ? */\
background-color: #FF0000;											/* ? */\
}\
.ace-sap-basement .ace_fold {										/* collapse indicator <-> */\
background-color: transparent;										/* - */\
border-color: transparent;											/* - */\
}\
.ace-sap-basement .ace_support.ace_function {						/* syntax keyword for functions like alert */\
color: #d629b2;														/* lighten(@sapUiAccent4, 10%) */\
}\
.ace-sap-basement .ace_variable.ace_parameter {						/* ? */\
color: #d128ae;														/* ? */\
font-style: italic\
}\
.ace-sap-basement .ace_string {										/* text in quotes */\
color: #007cc0;														/* app designer dark */\
}\
.ace-sap-basement .ace_string.ace_regexp {							/* regex */\
color: #CCCC33														/* app designer dark */\
}\
.ace-sap-basement .ace_comment {									/* text in quotes */\
color: #e5f2f9;														/* @sapUiMediumBorder */\
}\
.ace-sap-basement .ace_meta.ace_tag {								/* ? */\
color: #d128ae;														/* ? */\
}\
.ace-sap-basement .ace_entity.ace_name {							/* function name */\
color: #009de0;														/* app designer dark */\
}\
.ace-sap-basement .ace_collab.ace_user1 {							/* ? */\
color: #323232;														/* ? */\
background-color: #FFF980											/* ? */\
}\
.ace-sap-basement .ace_indent-guide {								/* indent line */\
border-right: 1px dotted #CCCCCC;									/* @sapUiMediumBorder */\
margin-right: -1px;													/* correction for right border */\
}\
.ace_gutter-tooltip {											/* tooltip for error, warning and info */\
background: white;											\
border: none;												\
box-shadow: 0 0 3px rgba(0,0,0, 0.3);						\
font-family: Arial, sans-serif;								\
font-size: 12px;											\
}\
.ace_gutter-cell {												/* give gutter box relative pos for marker */\
position: relative;											\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});