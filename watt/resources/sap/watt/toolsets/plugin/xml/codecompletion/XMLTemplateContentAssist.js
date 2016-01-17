/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * Copyright (c) 2012 VMware, Inc.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *     Andrew Eisenberg - rename to jsTemplateContentAssist.js
 *******************************************************************************/
/*global define */

define(['./templates'],
	function(mTemplates) {

		function findPreviousChar(buffer, offset) {
			var c = "";
			while (offset >= 0) {
				c = buffer[offset];
				if (c === '\n' || c === '\r') { //$NON-NLS-1$ //$NON-NLS-0$
					//we hit the start of the line so we are done
					break;
				} else if (/\s/.test(c)) {
					offset--;
				} else {
					// a non-whitespace character, we are done
					break;
				}
			}
			return c;
		}

		var typeofValues = {
			type: "link", //$NON-NLS-0$
			values: ["undefined", //$NON-NLS-0$
				"object", //$NON-NLS-0$
				"boolean", //$NON-NLS-0$
				"number", //$NON-NLS-0$
				"string", //$NON-NLS-0$
				"function", //$NON-NLS-0$
				"xml" //$NON-NLS-0$
				]
		};

		function fromJSON(o) {
			return JSON.stringify(o).replace("}", "\\}"); //$NON-NLS-1$ //$NON-NLS-0$
		}

		var uninterestingChars = ":!@#$^&*.?<>"; //$NON-NLS-0$

        var templates = [
		{
			name: "root",
            prefix: "root", 
            description: "root",
            template: "<core:View \n\txmlns:core=\"sap.ui.core\" \n\txmlns=\"sap.m\" \n\txmlns:commons=\"sap.ui.commons\" \n\txmlns:layout=\"sap.ui.layout\" \n\tcontrollerName=\"\" \n\tviewName=\"\">\n\t\n</core:View>\n" 
		}
		];
		/**
		 * @name XmlTemplateContentAssistProvider
		 * @class Provides content assist for JavaScript keywords.
		 */
		function XMLTemplateContentAssistProvider() {

		}

	   
		
		XMLTemplateContentAssistProvider.prototype = new mTemplates.TemplateContentAssist(null,templates);
		XMLTemplateContentAssistProvider.prototype.resetTemplateAndKeywords = function() {
			this._templates = [];
            this._keywords = [];
            
            this.addTemplates(templates);
		};

		/** 
		 * Determines if the invocation location is a valid place to use
		 * templates.  We are not being too precise here.  As an approximation,
		 * just look at the previous character.
		 *
		 * @return {Boolean} true if the current invocation location is
		 * a valid place for template proposals to appear.
		 * This means that the invocation location is at the start of a new statement.
		 */
		XMLTemplateContentAssistProvider.prototype.isValid = function(prefix, buffer, offset, context) {
			return true;
			//var previousChar = findPreviousChar(buffer, offset-prefix.length-1);
			//return !previousChar || uninterestingChars.indexOf(previousChar) === -1;
		};

		return {
			XMLTemplateContentAssistProvider: XMLTemplateContentAssistProvider
		};
	});