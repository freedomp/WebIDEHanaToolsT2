/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*global define*/

define([], function() { //$NON-NLS-0$

	/** 
	 * Removes prefix from string.
	 * @param {String} prefix
	 * @param {String} string
	 */
	function chop(prefix, string) {
		return string.substring(prefix.length);
	}
	
	var tabVar = "${tab}"; //$NON-NLS-0$
	var delimiterVar = "${delimiter}"; //$NON-NLS-0$
	var cursorVar = "${cursor}"; //$NON-NLS-0$
	
	function Template (prefix, description, template, helpDescription) {
		this.prefix = prefix;
		this.description = description;
		this.helpDescription = helpDescription;
		this.template = template;
		this._parse();
	}
	Template.prototype = /** @lends orion.editor.Template.prototype */ {
		getProposal: function(prefix, offset, context) {
			//any returned positions need to be offset based on current cursor position and length of prefix
			var startOffset = offset-prefix.length;
			var groups = {};
			var escapePosition;
			var delimiter = context.delimiter !== undefined ? context.delimiter : "\n"; //$NON-NLS-0$
			if (context.indentation) {
				delimiter += context.indentation;
			}
			var tab = context.tab !== undefined ? context.tab : "\t"; //$NON-NLS-0$
			var delta = 0;
			var variables = this.variables;
			var segments = this.segments, proposal = [];
			for (var i = 0; i < segments.length; i++) {
				var segment = segments[i];
				var variable = variables[segment];
				if (variable !== undefined) {
					switch (segment) {
						case tabVar:
							segment = tab;
							break;
						case delimiterVar:
							segment = delimiter;
							break;
						case cursorVar:
							segment = "";
							escapePosition = delta;
							break;
						default:
							var g = groups[segment];
							if (!g) {
								g = groups[segment] = {data: variable.data, positions: []};
							}
							segment = variable.substitution;
							if (g.data && g.data.values) { segment = g.data.values[0]; }
							g.positions.push({
								offset: startOffset + delta,
								length: segment.length
							});
					}
				}
				proposal.push(segment);
				delta += segment.length;
			}
			var newGroups = [];
			for (var p in groups) {
				if (groups.hasOwnProperty(p)) {
					newGroups.push(groups[p]);
				}
			}
			proposal = proposal.join("");
			if (escapePosition === undefined) {
				escapePosition = proposal.length;
			}
			return {
				proposal: proposal,
				category: "template",
				description: this.description,
				helpDescription: this.helpDescription,
				groups: newGroups,
				escapePosition: startOffset + escapePosition
			};
		},
		match: function(prefix, caseSensitive) {
			if (this.prefix.indexOf(prefix) === 0) {
				return true;
			} else if (caseSensitive) {
				return false;
			}
			else { // loosely match
				if (prefix) {
					return this.prefix.toLowerCase().indexOf(prefix.toLowerCase()) === 0;
				} else {
					return false;
				}
			}
		},
		_parse: function() {
			var template = this.template;
			var segments = [], variables = {}, segment, start = 0;
			template = template.replace(/\n/g, delimiterVar);
			template = template.replace(/\t/g, tabVar);
			template.replace(/\$\{((?:[^\\}]+|\\.))*\}/g, function(group, text1, index) {
				var text = group.substring(2,group.length-1);
				var variable = group, substitution = text, data = null;
				var colon = substitution.indexOf(":"); //$NON-NLS-0$
				if (colon !== -1) {
					substitution = substitution.substring(0, colon);
					variable = "${"+ substitution + "}"; //$NON-NLS-1$ //$NON-NLS-0$
					data = JSON.parse(text.substring(colon + 1).replace("\\}", "}").trim()); //$NON-NLS-1$ //$NON-NLS-0$
				}
				var v = variables[variable];
				if (!v) { v = variables[variable] = {}; }
				v.substitution = substitution;
				if (data) {
					v.data = data;
				}
				segment = template.substring(start, index);
				if (segment) { segments.push(segment); }
				segments.push(variable);
				start = index + group.length;
				return substitution;
			});
			segment = template.substring(start, template.length);
			if (segment) { segments.push(segment); }
			this.segments = segments;
			this.variables = variables;
		}
	};
	
	function TemplateContentAssist (keywords, templates) {
		this._keywords = keywords || [];
		this._templates = [];
		
		var json = [];
		if (templates) {
			json = json.concat(templates);
		}
		this.addTemplates(json);
	}
	
	TemplateContentAssist.prototype = /** @lends orion.editor.TemplateContentAssist.prototype */ {
		addTemplates: function(json) {
			var templates = this.getTemplates();
			for (var j = 0; j < json.length; j++) {
				templates.push(new Template(json[j].prefix, json[j].description, json[j].template,json[j].helpDescription));
			}
		},
		computeProposals: function(buffer, offset, context) {
			var prefix = this.getPrefix(buffer, offset, context);
			var proposals = [];
			if (!this.isValid(prefix, buffer, offset, context)) {
				return proposals;
			}
			proposals = proposals.concat(this.getTemplateProposals(prefix, offset, context));
			proposals = proposals.concat(this.getKeywordProposals(prefix, context));
			return proposals;
		},
		computeTemplateProposals: function(buffer, offset, context) {
			var prefix = this.getPrefix(buffer, offset, context);
			var proposals = [];
			if (!this.isValid(prefix, buffer, offset, context)) {
				return proposals;
			}
			return proposals.concat(this.getTemplateProposals(prefix, offset, context));
		},
		computeKeywordProposals: function(buffer, offset, context) {
			var prefix = this.getPrefix(buffer, offset, context);
			var proposals = [];
			if (!this.isValid(prefix, buffer, offset, context)) {
				return proposals;
			}
			return proposals.concat(this.getKeywordProposals(prefix, context));
		},
		
		getKeywords: function() {
			return this._keywords;
		},
		getKeywordProposals: function(prefix, context) {
			var proposals = [];
			var caseSensitive = context.caseSensitive;
			var keywords = this.getKeywords();
			if (keywords) {
				for (var i = 0; i < keywords.length; i++) {
					var isMatched = false;
					if (caseSensitive) {
						isMatched = (keywords[i].indexOf(prefix) === 0);
					} else {
						// all the existing keywords are in the lower case
						isMatched = (keywords[i].indexOf(prefix.toLowerCase()) === 0);
					}
					if (isMatched) {
						proposals.push({
							proposal: chop(prefix, keywords[i]),
							category: "keyword",
							description: keywords[i]
						});
					}
				}
			}
			return proposals;
		},
		getPrefix: function(buffer, offset, context) {
			return context.prefix;
		},
		getTemplates: function() {
			return this._templates;
		},
		getTemplateProposals: function(prefix, offset, context) {
			var proposals = [];
			var templates = this.getTemplates();
			for (var t = 0; t < templates.length; t++) {
				var template = templates[t];
				if (template.match(prefix, context.caseSensitive)) {
					var proposal = template.getProposal(prefix, offset, context);
					this.removePrefix(prefix, proposal);
					proposals.push(proposal);
				}
			}
			return proposals;
		},
		
		// Summary****************************
		findTemplateFullyQualified: function(sMetaSymbol) {
			return [];
		},
		
		removePrefix: function(prefix, proposal) {
			var overwrite = proposal.overwrite = proposal.proposal.substring(0, prefix.length) !== prefix;
			if (!overwrite) {
				proposal.proposal = chop(prefix, proposal.proposal);
			}
		},
		isValid: function(prefix, buffer, offset, context) {
			return true;
		}
	};
	
	return {
		Template: Template,
		TemplateContentAssist: TemplateContentAssist
	};
});