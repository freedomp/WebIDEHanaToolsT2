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

ace.define('ace/theme/sap-morlock', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-sap-morlock";
exports.cssText = ".ace-sap-morlock .ace_gutter {					/* line numbers */\
background: #f2f2f2;												/* @sapUiExtraLightBG */\
color: #707070;														/* @sapUiExtraLightText */\
}\
.ace-sap-morlock .ace_print-margin {								/* right line */\
background: #e5e5e5;												/* @sapUiExtraLightBorder */\
width: 1px;\
}\
.ace-sap-morlock {													/* editor and text in general  */\
background-color: #212629;											/* dark theme bg */\
font-family: 'Arial monospaced for SAP', 'Lucida Console', 'Andale Mono', 'Monospace';\
line-height: 18px;\
font-size: 13px;\
color: white;\
}\
.ace-sap-morlock .ace_cursor {										/* cursor | */\
color: rgb(0, 124, 192)												/* @sapUiHighlight */\
}\
.ace-sap-morlock .ace_marker-layer .ace_selection {					/* text selection */\
background: rgba(171, 33, 142, 0.5); 								/* @sapUiHighlight */\
}\
.ace-sap-morlock.ace_multiselect .ace_selection.ace_start {			/* ? */\
box-shadow: 0 0 3px 0px transparent;										/* ? */\
border-radius: 2px\
}\
.ace-sap-morlock .ace_marker-layer .ace_step {						/* ? */\
background: #d128ae;														/* ? */\
}\
.ace-sap-morlock .ace_marker-layer .ace_bracket {					/* highlight for closing bracket */\
margin: 0 0 0 0;\
border: 1px solid rgb(0, 124, 192)									/* @sapUiHighlight */\
}\
.ace-sap-morlock .ace_marker-layer .ace_active-line {				/* highlighted row */\
background: rgba(171, 33, 142, 0.2);								/* @sapUiHighlight */\
}\
.ace-sap-morlock .ace_gutter-active-line {							/* highlighted line number */\
background-color: rgba(0, 124, 192, 0.2);							/* @sapUiHighlight */\
}\
.ace-sap-morlock .ace_marker-layer .ace_selected-word {				/* border around single selected word */\
border: 1px solid rgba(0, 124, 192, 0.5)							/* @sapUiHighlight */\
}\
.ace-sap-morlock .ace_invisible {									/* ? */\
color: green 														/* ? */\
}\
.ace-sap-morlock .ace_keyword {										/* syntax keyword, like 'new' */\
color: #d629b2;														/* lighten(@sapUiAccent4, 10%) */\
font-weight: bold; 													\
}\
.ace-sap-morlock .ace_storage {										/* syntax keyword, like 'var' */\
color: #009de0;														/* just dark */\
font-weight: bold; 													\
}\
.ace-sap-morlock .ace_meta {										/* syntax keyword, like ? */\
color: rgb(0, 73, 144);												/* ? */\
}\
.ace-sap-morlock .ace_constant,										/* ? */\
.ace-sap-morlock .ace_constant.ace_character,\
.ace-sap-morlock .ace_constant.ace_character.ace_escape,\
.ace-sap-morlock .ace_constant.ace_other,\
.ace-sap-morlock .ace_support.ace_constant {\
color: #d128ae;														/* ? */\
}\
.ace-sap-morlock .ace_invalid {										/* ? */\
color: #e22525 ;															/* ? */\
background-color: #FF0000;											/* ? */\
}\
.ace-sap-morlock .ace_fold {										/* collapse indicator <-> */\
background-color: transparent;										/* - */\
border-color: transparent;											/* - */\
-moz-box-sizing: border-box;\
border: 1px solid #000000;\
cursor: pointer;\
display: inline-block;\
height: 14px;\
margin-top: -2px;\
pointer-events: auto;\
vertical-align: middle;\
background: white;\
border-radius: 0;\
}\
.ace-sap-morlock .ace_fold:after {\
content: '...';\
}\
.ace-sap-morlock .ace_support.ace_function {						/* syntax keyword for functions like alert */\
color: #f27020;														/* lighten(@sapUiAccent4, 10%) */\
}\
.ace-sap-morlock .ace_variable.ace_parameter {						/* ? */\
color: #d128ae;															/* ? */\
font-style: italic\
}\
.ace-sap-morlock .ace_string {										/* text in quotes */\
color: #fffcb5;														/* @sapUiYellow */\
}\
.ace-sap-morlock .ace_string.ace_regexp {							/* regex */\
color: #CCCC33														/* app designer dark */\
}\
.ace-sap-morlock .ace_comment {										/* comments */\
color: #ade6ff;														/* lighten(@sapUiBrand,40%) */\
}\
.ace-sap-morlock .ace_meta.ace_tag {								/* ? */\
color: #d128ae;														/* ? */\
}\
.ace-sap-morlock .ace_entity.ace_name {								/* function name */\
color: #f0ab00;														/* @sapUiYellow */\
}\
.ace-sap-morlock .ace_collab.ace_user1 {							/* ? */\
color: #323232;														/* ? */\
background-color: #FFF980											/* ? */\
}\
.ace-sap-morlock .ace_indent-guide {								/* indent line */\
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
position: relative;												\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});