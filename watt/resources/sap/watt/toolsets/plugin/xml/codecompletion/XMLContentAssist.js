define(["./XMLVisitor", "./UI5XmlTypes", "./XMLMetadataContentAssist", "./SchemaMetadataContentAssist", "./XMLTemplateContentAssist"],
	function(XMLVisitor, UI5XmlTypes, XMLMetadataAssist, SchemaMetadataAssist, XMLTemplateAssist) {

		var XMLContentAssist = function() {
			this.xmlTypes = new UI5XmlTypes();
			this.xmlVisitor = new XMLVisitor();
			this.schemaMetadataAssist = new SchemaMetadataAssist();
			this.category = {
				"XML_NAMESPACE": 0,
				"XML_ELEMENT": 1,
				"XML_PROPERTY": 2,
				"XML_EVENT": 3,
				"XML_SYNTAX": 5,
				"XML_SNIPPET": 6,

				"XML_PROPERTY_DEFAULT": 11,
				"XML_PROPERTY_BOOL": 12,
				"XML_PROPERTY_ENUM": 13,

				"XML_PROP_OPTIONS": 21
			};
			this.categoryDesc = {
				"6": "SNIPPET"
			};

			this.prefix;

		};

		XMLContentAssist.prototype = {

			throwError: function(msg) {
				var err = new Error(msg);
				throw err;
			},

			/**
			 * provide proposals of xml syntax
			 */
			candidateXMLSyntaxs: function(env) {
				var candidateResult = [];
				if (((env.type == "attr") && (env.prefix === "")) || env.type == "intag") {
					candidateResult.push({
						name: ">",
						syntax: ">",
						type: "syntax"
					});
					candidateResult.push({
						name: "/>",
						syntax: "/>",
						type: "syntax"
					});
				}
				if ((env.type == "attr" && (env.element == "View" || env.element == "FragmentDefinition") && "xmlns"
					.indexOf(env.prefix) == 0)) {
					candidateResult.push({
						name: "xmlns",
						syntax: "xmlns",
						type: "syntax"
					});
					candidateResult.push({
						name: "xmlns:",
						syntax: "xmlns:",
						type: "syntax"
					});
				}
				return candidateResult;
			},

			/**
			 * provide snippet proposals of xml syntax
			 */
			candidateXMLSyntaxSnippets: function(env) {
				var candidateResult = [];
				if ((env.type == "attr"&& (env.prefix === "")) || env.type == "intag") {
					var tmpStr = env.element;
					if (env.namespace && env.namespace.length > 0) {
						tmpStr = env.namespace + ":" + tmpStr;
					}
					tmpStr = "></" + tmpStr + ">";
					candidateResult.push({
						name: ">",
						proposal: tmpStr,
						type: "syntax"
					});
				}
				return candidateResult;
			},

			/**
			 * provide proposals of namespaces
			 */
			candidateNameSpaces: function(env) {
				var candidateResult = [];
				for (var i = 0; i < env.nslist.length; i++) {
					var name = env.nslist[i].name;
					var ns = env.nslist[i].ns;
					if (name != "xmlns" && (env.prefix == "" || name.toLowerCase().indexOf(env.prefix.toLowerCase()) == 0)) {
						candidateResult.push({
							name: name,
							type: "xmlns",
							fullName: ns
						});
					}
				}
				return candidateResult;
			},

			addTemplates: function(template) {
				if (!this.xmlTemplateAssistant) {
					this.xmlTemplateAssistant = new XMLTemplateAssist.XMLTemplateContentAssistProvider();
				}
				this.xmlTemplateAssistant.addTemplates(template.XML_TEMPLATES);
				this.xmlTemplateAssistant.addKeywords(template.XML_KEYWORDS);
			},

			addMetadata: function(metadata) {
				if (!this.xmlMetadataAssist) {
					this.xmlMetadataAssist = new XMLMetadataAssist(metadata);
				} else {
					this.xmlMetadataAssist.addMetadata(metadata);
				}
			},

			resetTemplatesAndMetadata: function() {
				if (this.xmlTemplateAssistant) {
					this.xmlTemplateAssistant.resetTemplateAndKeywords();
				}
				if (this.xmlMetadataAssist) {
					this.xmlMetadataAssist.resetMetadata();
				}
			},

			/**
			 * provide proposals of snippet
			 */
			candidateSnippet: function(buffer, offset, context) {

				var snippetProposals = [];
				if (this.xmlTemplateAssistant && ((context.ns && context.ns.length > 0) || (context.ns === "" && context.prefix === "root"))) {
					snippetProposals = this.xmlTemplateAssistant.computeProposals(buffer, offset, context);
				}
				return snippetProposals;
			},

			getRefNS: function(env, ns) {
				var namespace = ns;
				var item = null;
				if (namespace == "") {
					for (var i = 0; i < env.xmlnsList.length; i++) {
						item = env.xmlnsList[i];
						if (item.name == "xmlns") {
							namespace = item.ns;
							break;
						}
					}
				} else {
					for (var i = 0; i < env.xmlnsList.length; i++) {
						item = env.xmlnsList[i];
						if (item.name == namespace) {
							namespace = item.ns;
							break;
						}
					}
				}
				return namespace;
			},
			/**
			 * get namesapces list from xml env
			 */
			getNS: function(env) {
				var namespace = env.prefixns;
				var item = null;
				if (env.type == "attr" || env.type == "value") {
					namespace = env.currentTagns;
				}
				if (namespace == "") {
					for (var i = 0; i < env.xmlnsList.length; i++) {
						item = env.xmlnsList[i];
						if (item.name == "xmlns") {
							namespace = item.ns;
							break;
						}
					}
				} else {
					for (var i = 0; i < env.xmlnsList.length; i++) {
						item = env.xmlnsList[i];
						if (item.name == namespace) {
							namespace = item.ns;
							break;
						}
					}
				}
				return namespace;
			},

			getAllNS: function(env, sPrefix) {
				var i;
				var sNamespace = env.prefixns;
				var aNamespace = [];
				var item = null;
				if (env.type === "attr" || env.type === "value") {
					sNamespace = env.currentTagns;
				}
				if (sNamespace === "") {
					for (i = 0; i < env.xmlnsList.length; i++) {
						item = env.xmlnsList[i];
						if (item) {
							if (item.name === "xmlns") {
								item.name = "";
							}
							aNamespace.push(item);
						}
					}
				} else {
					//If there is a default name ns use it
					for (i = 0; i < env.xmlnsList.length; i++) {
						item = env.xmlnsList[i];
						if (item.name === sNamespace) {
							aNamespace.push(item);
							break;
						}
					}
				}
				return aNamespace;
			},

			/**
			 * filter and sort the proposals as suggestions
			 */
			filterAndSortProposals: function(proposalsObj, contextPrefix) {

				var iSnippetCategory = this.category.XML_SNIPPET;
				var iXmlSyntaxCategory = this.category.XML_SYNTAX;
				proposalsObj.sort(function(a, b) {
					if ((a == undefined) || (b == undefined)) {
						return 0;
					}

					if (a.category === iSnippetCategory || a.category === iXmlSyntaxCategory ||
						b.category === iSnippetCategory || b.category === iXmlSyntaxCategory) {
						return 1;
					}

					if (a.description.toLowerCase() === b.description.toLowerCase()) {
						return (a.category > iSnippetCategory) ? 1 : -1;
					}
					
					return (a.description.toLowerCase() < b.description.toLowerCase()) ? -1 : 1;
				});
				return proposalsObj;
			},
			computeCommonProposals: function(buffer, offset, context, pcontext, envobj) {
				var oDeferred = Q.defer();
				var env = envobj.currentEnv;
				var proposalsObj = [];
				var isValue = false;
				var currentnamespace = this.getNS(env);
				var i = 0,
					j = 0;
				var xmlSyntaxs = null;
				var xmlSyntaxSnippets = null;
				var sy = null;
				var snippets = null;
				if (env.type == "rootsnippet") {
					//code for rootsnippet
					snippets = null;
				} else if (env.type == "tag") {
					var lbracket = env.lbracket ? "" : "<";
					if (env.prefixns == "") {
						var namespaces = this.candidateNameSpaces({
							//

							prefix: (this.prefix != undefined ? this.prefix : env.prefix),

							//
							nslist: env.xmlnsList
						});
						for (i = 0; i < namespaces.length; i++) {
							var ns = namespaces[i];
							//var nsDesc = "Namespace " + ns.fullName;
							proposalsObj.push({
								description: ns.name,
								type: ns.type,
								insertTerm: lbracket + ns.name + ":",
								helpDesc: ns.helpDescription,
								helpTarget: ns.fullName,
								category: this.category.XML_NAMESPACE
							});
						}
					}
				} else if (env.type == "attr") {
					xmlSyntaxs = this.candidateXMLSyntaxs({
						type: env.type,
						element: env.currentTag,
						prefix: (this.prefix != undefined ? this.prefix : env.prefix)
					});
					for (i = 0; i < xmlSyntaxs.length; i++) {
						sy = xmlSyntaxs[i];
						proposalsObj.push({
							description: sy.name,
							type: sy.type,
							insertTerm: sy.syntax,
							category: this.category.XML_SYNTAX
						});
					}
					xmlSyntaxSnippets = this.candidateXMLSyntaxSnippets({
						type: env.type,
						namespace: env.currentTagns,
						element: env.currentTag,
						prefix: env.prefix
					});
					for (j = 0; j < xmlSyntaxSnippets.length; j++) {
						sy = xmlSyntaxSnippets[j];
						proposalsObj.push({
							description: sy.name,
							type: sy.type,
							insertTerm: sy.proposal,
							category: this.category.XML_SNIPPET
						});
					}
				} else if (env.type == "value") {
					isValue = true;
				} else if (env.type == "intag") {
					xmlSyntaxs = this.candidateXMLSyntaxs({
						type: env.type,
						element: env.currentTag,
						prefix: env.prefix
					});
					for (i = 0; i < xmlSyntaxs.length; i++) {
						sy = xmlSyntaxs[i];
						proposalsObj.push({
							description: sy.name,
							type: sy.type,
							insertTerm: sy.syntax,
							category: this.category.XML_SYNTAX
						});
					}
					xmlSyntaxSnippets = this.candidateXMLSyntaxSnippets({
						type: env.type,
						namespace: env.currentTagns,
						element: env.currentTag,
						//change prefix to context.prefix?
						prefix: env.prefix
					});
					for (j = 0; j < xmlSyntaxSnippets.length; j++) {
						sy = xmlSyntaxSnippets[j];
						proposalsObj.push({
							description: sy.name,
							type: sy.type,
							insertTerm: sy.proposal,
							category: this.category.XML_SNIPPET
						});
					}
				}

				var retProposalsObj = this.filterAndSortProposals(proposalsObj, (this.prefix != undefined ? this.prefix : env.prefix));
				oDeferred.resolve(retProposalsObj);
				return oDeferred.promise;
			},

			computeXSDProposals: function(buffer, offset, context, pcontext, envobj) {
				var oDeferred = Q.defer();
				var sMetadataAssist = this.schemaMetadataAssist;
				var env = envobj.currentEnv;
				var rootobj = envobj.root;
				var proposalsObj = [];
				var isValue = false;
				var currentnamespace = this.getNS(env);
				var that = this;
				var snippets = null;
				sMetadataAssist.init(null, rootobj.schemaInfo, context.targetFile, pcontext).then(function(ret) {
					var pos = -1;
					var cns = "";
					var cname = "";
					if (env.type == "rootsnippet") {
						//code for rootsnippet
						snippets = null;
					} else if (env.type == "tag") {
						var lbracket = env.lbracket ? "" : "<";
						var pns = "";
						var pname = env.parentTag;
						pos = env.parentTag.indexOf(":");
						if (pos > 0) {
							pns = env.parentTag.slice(0, pos);
							pname = env.parentTag.slice(pos + 1);
						}
						pns = that.getRefNS(env, pns);
						var elements = sMetadataAssist.candidateElements({
							ns: currentnamespace,
							prefix: env.prefix,
							parent: {
								ns: pns,
								name: pname
							}
						});
						for (var i = 0; i < elements.length; i++) {
							var elem = elements[i];
							var elemDesc = null; //elem.description?elem.description:" ";
							proposalsObj.push({
								description: elem.name,
								type: elem.type,
								insertTerm: lbracket + elem.name,
								helpDesc: elemDesc,
								helpTarget: elem.fullName,
								fullName: elem.fullName,
								category: that.category.XML_ELEMENT
							});
						}
					} else if (env.type == "attr") {
						cns = "";
						cname = env.currentTag;
						pos = env.currentTag.indexOf(":");
						if (pos > 0) {
							cns = env.currentTag.slice(0, pos);
							cname = env.currentTag.slice(pos + 1);
						}
						cns = that.getRefNS(env, cns);
						var props = sMetadataAssist.candidateAttributes({
							ns: currentnamespace,
							prefix: env.prefix,
							element: {
								ns: cns,
								name: cname
							},
							attrs: env.currentAttrs
						});
						for (var i = 0; i < props.length; i++) {
							var prop = props[i];

							//separate boolean and enum from other properties 
							var ptype = that.category.XML_PROPERTY_DEFAULT;
							if (prop.dataType == "xs:boolean") {
								ptype = that.category.XML_PROPERTY_BOOL;
							} else if (prop.isEnum) {
								ptype = that.category.XML_PROPERTY_ENUM;
							} else {
								ptype = that.category.XML_PROPERTY_DEFAULT;
							}
							var propDesc = null; //prop.description?prop.description:" ";
							proposalsObj.push({
								description: prop.name,
								type: prop.type,
								insertTerm: prop.name,
								helpDesc: propDesc,
								helpTarget: prop.fullName.slice(0, prop.fullName.indexOf("#")),
								fullName: prop.fullName,
								category: ptype
							});
						}
					} else if (env.type == "value") {
						cns = "";
						cname = env.currentTag;
						pos = env.currentTag.indexOf(":");
						if (pos > 0) {
							cns = env.currentTag.slice(0, pos);
							cname = env.currentTag.slice(pos + 1);
						}
						cns = that.getRefNS(env, cns);
						var ans = "";
						var aname = env.currentAttr;
						pos = env.currentAttr.indexOf(":");
						if (pos > 0) {
							ans = env.currentAttr.slice(0, pos);
							aname = env.currentAttr.slice(pos + 1);
						}
						ans = that.getRefNS(env, ans);
						var options = sMetadataAssist.candidateAttributeValues({
							ns: currentnamespace,
							prefix: env.prefix,
							element: {
								ns: cns,
								name: cname
							},
							attr: {
								ns: ans,
								name: aname
							}
						});
						for (var i = 0; i < options.length; i++) {
							var option = options[i];
							var optionDesc = null; //option.description?option.description:" ";
							var sInsertTerm = that.calculateQuatesEnumarations(option.name, context);
							proposalsObj.push({
								description: option.name,
								type: option.type,
								insertTerm: sInsertTerm,
								helpDesc: optionDesc,
								helpTarget: "",
								fullName: option.fullName,
								category: that.category.XML_PROP_OPTIONS
							});
						}
						isValue = true;
					}
					/*else if (env.type == "intag") {
							//code for intag
						}*/

					var retProposalsObj = that.filterAndSortProposals(proposalsObj);
					oDeferred.resolve(retProposalsObj);
				});

				return oDeferred.promise;
			},
			computeUI5Proposals: function(buffer, offset, context, pcontext, envobj) {
				var i;
				var oDeferred = Q.defer();
				var metadataAssist = this.xmlMetadataAssist;
				var env = envobj.currentEnv;
				var proposalsObj = [];
				var isValue = false;
				var oCurrentNamespace = null;
				var sSpecificNamespace = this.getNS(env);
				var aSnippets = [];
				var sPrefix;
				var elem = null;
				if (env.type == "rootsnippet") {
					aSnippets = this.candidateSnippet(buffer, offset, {
						ns: "",
						prefix: "root",
						delimiter: context.delimiter,
						indentation: context.indentation,
						tab: context.tab
					});
					for (i = 0; i < aSnippets.length; i++) {
						elem = aSnippets[i];
						if (elem.name == "root") {
							proposalsObj.push({
								description: elem.description,
								type: elem.type,
								insertTerm: elem.proposal,
								category: this.category.XML_SNIPPET
							});
						}
					}
				} else if (env.type === "tag") {
					var lbracket = env.lbracket ? "" : "<";
					var term = "";
					sPrefix = (this.prefix && this.prefix.indexOf(":") > 0 && env.lbracket) ? env.prefix : ((env.prefix === "" && env.prefix.indexOf(".") <
						0 && !env.lbracket) ? this.prefix : env.prefix);
					var aNamesapce = this.getAllNS(env, sPrefix);
					for (i = 0; i < aNamesapce.length; i++) {
						aSnippets = this.candidateSnippet(buffer, offset, {
							ns: aNamesapce[i].ns,
							prefix: sPrefix,
							delimiter: context.delimiter,
							indentation: context.indentation,
							tab: context.tab
						});
						oCurrentNamespace = aNamesapce[i];
						for (var j = 0; j < aSnippets.length; j++) {
							elem = aSnippets[j];
							if (elem.name !== "root") {
								term = this._calculateTerm(elem, oCurrentNamespace, env);
								proposalsObj.push({
									description: term.sDescription,
									helpDesc: elem.helpDescription,
									type: elem.type,
									insertTerm: term.sTerm,
									category: this.category.XML_SNIPPET
								});
							}
						}
						if (metadataAssist) {
							var elements = metadataAssist.candidateElements({
								ns: aNamesapce[i].ns,
								prefix: sPrefix,
								parent: env.parentTag
							});
							var sInsertTermNS = (aNamesapce[i].name !== "") ? aNamesapce[i].name + ":" : "";
							for (var k = 0; k < elements.length; k++) {
								elem = elements[k];
								//var elemDesc = elem.description || " ";
								proposalsObj.push({
									description: elem.name + " in " + aNamesapce[i].ns,
									type: elem.type,
									insertTerm: lbracket + sInsertTermNS + elem.name,
									helpDesc: elem.helpDescription,
									helpTarget: elem.fullName,
									fullName: elem.fullName,
									category: this.category.XML_ELEMENT
								});
							}
						}
					}
				} else if (metadataAssist && env.type == "attr") {
					sPrefix = (this.prefix === " " ? "" : env.prefix);
					var props = metadataAssist.candidateProperties({
						ns: sSpecificNamespace,
						//
						prefix: sPrefix,
						element: env.currentTag,
						attrs: env.currentAttrs
					});
					for (i = 0; i < props.length; i++) {
						var prop = props[i];

						//separate boolean and enum from other properties 
						var ptype = this.category.XML_PROPERTY_DEFAULT;
						if (prop.dataType == "boolean") {
							ptype = this.category.XML_PROPERTY_BOOL;
						} else if (metadataAssist.isEnumType(prop.dataType)) {
							ptype = this.category.XML_PROPERTY_ENUM;
						} else {
							ptype = this.category.XML_PROPERTY_DEFAULT;
						}
						var propDesc = prop.description || " ";
						if (this.prefix === " ") {

						}
						proposalsObj.push({
							description: prop.name,
							type: prop.type,
							insertTerm: prop.name,
							helpDesc: propDesc,
							helpTarget: prop.fullName.slice(0, prop.fullName.indexOf("#")),
							fullName: prop.fullName,
							category: ptype
						});
					}

					var events = metadataAssist.candidateEvents({
						ns: sSpecificNamespace,
						prefix: env.prefix,
						element: env.currentTag,
						attrs: env.currentAttrs
					});
					for (i = 0; i < events.length; i++) {
						var envt = events[i];
						var envtDesc = envt.description || " ";
						proposalsObj.push({
							description: envt.name,
							type: envt.type,
							insertTerm: envt.name,
							helpDesc: envtDesc,
							helpTarget: envt.fullName.slice(0, envt.fullName.indexOf("#")),
							fullName: envt.fullName,
							category: this.category.XML_EVENT
						});
					}

				} else if (metadataAssist && env.type == "value") {
					var options = metadataAssist.candidateAttributeValues({
						ns: sSpecificNamespace,
						//
						prefix: (this.prefix != undefined ? this.prefix : env.prefix),
						element: env.currentTag,
						attr: env.currentAttr
					});
					for (i = 0; i < options.length; i++) {
						var option = options[i];
						var optionDesc = option.description || " ";
						var sInsertTerm = this.calculateQuatesEnumarations(option.name, context);
						proposalsObj.push({
							description: option.name,
							type: option.type,
							insertTerm: sInsertTerm,
							helpDesc: optionDesc,
							helpTarget: option.fullName.slice(0, option.fullName.indexOf("#")),
							fullName: option.fullName,
							category: this.category.XML_PROP_OPTIONS
						});
					}
					isValue = true;
				}
				/*else if (env.type == "intag") {
						//code for "intag"
					}*/

				var retProposalsObj = this.filterAndSortProposals(proposalsObj);
				//var retObj =  {proposalsObj:proposalsObj, isValue: isValue, prefix:env.prefix};
				oDeferred.resolve(retProposalsObj);
				return oDeferred.promise;
			},

			_calculatePrefix: function(oCurrentNamespace, oEnv) {
				var sPrefixns = oEnv.prefixns !== "" ? oEnv.prefixns + ":" : oCurrentNamespace.name === "" ? "" : oCurrentNamespace.name + ":";
				return sPrefixns;
			},

			_calculateTerm: function(oElement, oCurrentNamespace, oEnv) {
				var oTerm = {};
				var sLBracket = oEnv.lbracket ? "" : "<";
				//var startPos = oEnv.lbracket ? 1 : 0;
				var sTerm = oElement.proposal.slice(0);
				var sDisplayName = oElement.name ? oElement.name.slice(oCurrentNamespace.ns.length + 1) : "";
				var ename = sDisplayName.slice(sDisplayName.lastIndexOf(".") + 1);
				var sPrefixns = oEnv.prefixns !== "" ? oEnv.prefixns + ":" : oCurrentNamespace.name === "" ? "" : oCurrentNamespace.name + ":";
				var iPos = sTerm.indexOf(sDisplayName) + sDisplayName.length;
				//var iPos = oEnv.prefixns === "" ? (sTerm.indexOf(sPrefixns) < 0 ? 0 : sTerm.indexOf(sPrefixns) + sPrefixns.length) : sTerm.indexOf(sDisplayName) + sDisplayName.length;
				if (iPos > 0) {
					if (sDisplayName !== ename) {
						sDisplayName = sDisplayName.replace(".", "/");
						iPos = sTerm.indexOf(sDisplayName) + sDisplayName.length;
					}

					if (sTerm.slice(iPos).indexOf("/") === 0) {
						sTerm = sTerm.slice(iPos + sDisplayName.length + 1);
					} else {
						sTerm = sTerm.slice(iPos);
					}
					sTerm = sLBracket + sPrefixns + sDisplayName + sTerm;
					iPos = sTerm.lastIndexOf("</");
					if (iPos > 0) {
						sTerm = sTerm.slice(0, iPos + 2) + sPrefixns + sDisplayName + ">";
					}
				}

				var sDescription = sDisplayName + " in " + oCurrentNamespace.ns; //elem.prefix;
				if (sDescription) {
					iPos = sDescription.indexOf(",");
					if (iPos > 0) {
						sDescription = sDescription.slice(0, iPos);
					}
				}
				oTerm.sTerm = sTerm;
				oTerm.sDescription = sDescription;
				return oTerm;
			},

			/**
			 * implements the content assist API
			 */

			calculateQuatesEnumarations: function(sValue, context) {
				if (!context.stringValue && context.stringValue !== "" && context.buffer[context.offset - 1] !== '"' && !context.prefix) {
					return '"' + sValue + '"';
				}
				return sValue;
			},

			computeProposals: function(buffer, offset, context, pcontext) {

				try {
					var envobj = this.xmlVisitor.getEnv(buffer, offset);
					var env = envobj.currentEnv;
					if (env.currentAttr === "" && env.type === "attr" && (env.origText === "" || env.prefix === "")) {
						var space = true;
						var oldenv = env;
						var oldenvobj = envobj;

						while (space) {
							offset -= 1;
							envobj = this.xmlVisitor.getEnv(buffer, offset);
							env = envobj.currentEnv;
							if (env.currentAttr === "" && env.type === "attr" && (env.origText === "" || env.prefix === "")) {
								space = true;
							} else if (env.type === "value") {
								space = false;
							} else if ((env.type !== "attr" && (env.origText === "" || env.prefix === "")) || (env.origText !== "" || env.prefix !== "")) {
								space = false;
								env = oldenv;
								envobj = oldenvobj;
							}
						}
					}
					var isValue = false;
					var that = this;
					if (env.type == "value") {
						isValue = true;
					}
					this.prefix = (context.prefix != undefined ? context.prefix : env.prefix);
					// If there is already a root element and we try to add another one 
					// below it - return an object with no proposals
					if (envobj.root.documentElement && env.parentTag === "") {
						return Q({
							proposalsObj: [],
							isValue: isValue,
							prefix: env.prefix
						});
					}
					context.text = env.origText;
					var promises = [];
					promises.push(this.computeCommonProposals(buffer, offset, context, pcontext, envobj));
					if (env.isUI5 != false) {
						promises.push(this.computeUI5Proposals(buffer, offset, context, pcontext, envobj));
					}
					if (envobj.root.schema) {
						promises.push(this.computeXSDProposals(buffer, offset, context, pcontext, envobj));
					}
					return Q.all(promises).then(function(proposals) {
						var proposalsObj = [];
						var i = 0;
						for (i = 0; i < proposals.length; i++) {
							if (proposals[i]) {
								proposalsObj = proposalsObj.concat(proposals[i]);
							}
						}
						proposalsObj = that.filterAndSortProposals(proposalsObj);
						return {
							proposalsObj: proposalsObj,
							isValue: isValue,
							prefix: that.prefix || env.prefix
						};
					});
				} catch (e) {
					throw e;
				}
			}

		};
		return XMLContentAssist;
	});