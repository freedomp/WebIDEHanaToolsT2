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

ace.define('ace/theme/sap-flowerpower', ['require', 'exports', 'module' , 'ace/lib/dom'], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-sap-flowerpower";
exports.cssText = ".ace-sap-flowerpower .ace_gutter {		/* line numbers */\
background: #f2f2f2;										/* @sapFLatExtraLightBG */\
color: #666666;												/* @sapFlatMediumText */\
}\
.ace-sap-flowerpower .ace_print-margin {					/* right line */\
background: #e5e5e5;										/* @sapFlatExtraLightBorder */\
width: 1px;\
}\
.ace-sap-flowerpower {										/* editor and text in general  */\
background-color: white;									/* @sapFlatLightestBG */\
font-family: 'Arial monospaced for SAP', 'Lucida Console', 'Andale Mono', 'Monospace';\
line-height: 18px;\
font-size: 12px;\
}\
.ace-sap-flowerpower .ace_cursor {							/* cursor | */\
color: rgb(0, 157, 224); 									/* @sapFlatBrand */\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_selection {		/* text selection */\
bacground: rgba(0, 91, 141, 1);								/* @sapFlatHighlight */\
}\
.ace-sap-flowerpower.ace_multiselect .ace_selection.ace_start {	/* ? */\
box-shadow: 0 0 3px 0px transparent;								/* ? */\
border-radius: 2px;\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_step {			/* ? */\
background: #f2f2f2												/* ? */\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_bracket {		/* highlight for closing bracket */\
margin: 0 0 0 0;\
border: 1px solid rgb(0, 91, 141);							/* @sapFlatHighlight */\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_active-line {	/* highlighted row */\
background: rgba(0, 91, 141, 0.1);							/* @sapFlatHighlight */\
}\
.ace-sap-flowerpower .ace_gutter-active-line {				/* highlighted line number */\
background-color: rgba(0, 91, 141, 0.1);					/* @sapFlatHighlight */\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_selected-word {	/* border around single selected word */\
border: 1px solid rgba(0, 91, 141, 0.25)						/* @sapFlatHighlight */\
}\
.ace-sap-flowerpower .ace_invisible {						/* ? */\
color: green; 												/* ? */\
}\
.ace-sap-flowerpower .ace_constant,							/* ? */\
.ace-sap-flowerpower .ace_constant.ace_character,\
.ace-sap-flowerpower .ace_constant.ace_character.ace_escape,\
.ace-sap-flowerpower .ace_constant.ace_other,\
.ace-sap-flowerpower .ace_support.ace_constant {\
color: green;												/* ? */\
}\
.ace-sap-flowerpower .ace_invalid {							/* ? */\
color: gray;												/* ? */\
background-color: #FF0000;									/* ? */\
}\
.ace-sap-flowerpower .ace_fold {							/* collapse indicator <-> */\
background-color: transparent;								/* - */\
border-color: transparent;									/* - */\
}\
.ace-sap-flowerpower .ace_comment {							/* comments */\
color: #FFF;												/* @sapFlatLightText */\
background-color: rgba(153, 153, 153, 0.75);				\
padding: 2px 0 1px 0;										\
}\
.ace-sap-flowerpower .ace_meta.ace_tag {					/* ? */\
color: red;													/* ? */\
}\
.ace-sap-flowerpower .ace_collab.ace_user1 {				/* ? */\
color: #323232;												/* ? */\
background-color: #FFF980									/* ? */\
}\
.ace-sap-flowerpower .ace_indent-guide {					/* indent line */\
border-right: 1px dotted #CCCCCC;							/* @sapFlatMediumBorder */\
margin-right: -1px;											/* correction for right border */\
}\
\
\
.ace-sap-flowerpower .ace_keyword {							/* syntax keyword, like 'new' */\
color: #ab218e;												/* @sapFlatAccent4 */\
}\
.ace-sap-flowerpower .ace_storage {							/* syntax keyword, like 'var' and 'function' */\
color: #004990;												/* @sapFlatAccent7 */\
font-weight: bold;											\
}\
.ace-sap-flowerpower .ace_meta {							/* syntax keyword, like ? */\
color: ab218e;												/* @sapFlatAccent4 */\
font-weight: bold;											\
}\
.ace-sap-flowerpower .ace_support.ace_function {			/* syntax keyword for functions like alert */\
color: #ab218e;												/* @sapFlatAccent4 */\
font-weight: bold;											\
}\
.ace-sap-flowerpower .ace_entity.ace_name {					/* function name */\
color: #551047;												/* darken(@sapFlatAccent4, 20%) !*/\
}\
.ace-sap-flowerpower .ace_variable.ace_parameter {			/* function parameters */\
background: rgba(171, 33, 142, 0.75);						/* darken(@sapFlatAccent4, 9%) !*/\
color: white;												\
padding: 2px 0 1px 0;										\
}\
.ace-sap-flowerpower .ace_string {							/* text in quotes */\
color: #FFF;												/* darken(sapFlatAccent5, 10%) !*/\
background: rgba(0, 157, 224, 0.75);							\
padding: 2px 0 1px 0;										\
}\
.ace-sap-flowerpower .ace_string.ace_regexp {				/* regex */\
color: #002a41;												/* darken(sapFlatAccent5, 25%) !*/\
}\
.ace_gutter-tooltip {											/* tooltip for error, warning and info */\
background: white;											\
border: none;												\
box-shadow: 0 0 3px rgba(0,0,0, 0.3);						\
font-family: Arial, sans-serif;								\
font-size: 12px;											\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_bracket {				\
    background: rgba(0, 124, 192, 0.25);		\
    color: #FFFFFF;													\
    margin: 0;														\
}\
.ace-sap-flowerpower .ace_marker-layer .ace_selection {				\
    background: rgba(0, 91, 141, 0.25);		\
    color: #FFFFFF;													\
    margin: 0;														\
}\
.ace_gutter-cell {												/* give gutter box relative pos for marker */\
position: relative;												\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});