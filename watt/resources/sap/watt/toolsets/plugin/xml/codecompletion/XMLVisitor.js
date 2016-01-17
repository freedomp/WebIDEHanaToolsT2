define(function() {

	var XMLParser = function() {

	};
	XMLParser.prototype = {
		nodeTypes : {
			ELEMENT : 1,
			ATTRIBUTE : 2,
			TEXT : 3,
			CDATA_SECTION : 4,
			PROCESSING_INSTRUCTION : 7,
			COMMENT : 8,
			DOCUMENT : 9
		},
		offsetTypes : {
			root : "root",
			text : "text",
			tag : "tag",
			closetag : "closetag",
			attr : "attr",
			value : "value",
			entity : "entity",
			cdata : "cdata",
			comments : "comments",
			instruction : "instruction",
			intag : "intag",
			error : "error"
		},

		createDocNode : function() {
			return {
				nodeType : this.nodeTypes.DOCUMENT,
				nodeName : "#document",
				nameSpaces : {},
				childNodes : [],
				schema : false,
				schemaInfo : []
			};
		},

		createTextNode : function(v) {
			var normalize = /\s+/g;
			var egt = /\&gt;/g;
			var elt = /\&lt;/g;
			var equot = /\&quot;/g;
			var eapos = /\&apos;/g;
			var eamp = /\&amp;/g;
			return {
				nodeType : this.nodeTypes.TEXT,
				nodeName : "#text",
				isPrecedingOffset : this.isPrecedingOffset,
				nodeValue : v.replace(normalize, " ").replace(egt, ">").replace(elt, "<").replace(eapos, "'").replace(equot, '"').replace(
						eamp, "&")
			};
		},

		preParseCData : function(preData) {
			var reg = /<!\[CDATA\[([\u0001-\uFFFF]*?)\]\]>/g;
		},

		preParseComments : function(preData) {
			var reg = /<!--([\u0001-\uFFFF]*?)-->/g;
			var commentList = [], acomment;
			var sOffset = -1;
			var sPrefix = "";
			var rStr = "";
			var shift = 0;
			var num = 0;
			var lastIndex = 0;
			while ((acomment = reg.exec(preData.str)) != null) {
				sOffset = reg.lastIndex - acomment[0].length;
				lastIndex = reg.lastIndex;
				sPrefix = "";
				if (preData.offset > sOffset + 3) {
					if (preData.offset < sOffset + acomment[0].length - 1) {
						shift += preData.offset - sOffset - 3;
						sPrefix = acomment[0].slice(4, preData.offset - sOffset + 1);
					} else {
						rStr = "<!--" + num + "-->";
						shift += acomment[0].length - rStr.length;
					}
				}
				commentList.push({
					str : acomment[0].slice(4, -3),
					offset : sOffset,
					prefix : sPrefix
				});
				num++;
			}

			//for incomplete comments
			var hasIncomplet = false;
			reg = /<!--([\u0001-\uFFFF]*?)/g;
			reg.lastIndex = lastIndex;
			if ((acomment = reg.exec(preData.str)) != null) {
				sOffset = acomment.index;
				sPrefix = "";
				if (preData.offset > sOffset + 3) {
					rStr = "<!--" + num.toString();
					shift += preData.str.length - sOffset + 1 - rStr.length;
					sPrefix = preData.str.slice(sOffset + 4, preData.offset + 1);
				}
				commentList.push({
					str : preData.str.slice(sOffset + 4),
					offset : sOffset,
					prefix : sPrefix
				});
				preData.str = preData.str.slice(0, commentList[num].offset) + "<!--" + num.toString();
				hasIncomplet = true;
			}

			for (var i = hasIncomplet ? commentList.length - 2 : commentList.length - 1; i >= 0; i--) {
				preData.str = preData.str.slice(0, commentList[i].offset) + "<!--" + i + "-->"
						+ preData.str.slice(commentList[i].offset + commentList[i].str.length + 7);
			}

			preData.commentList = commentList;
			preData.offset -= shift;
		},

		preParseString : function(preData) {
			var reg = new RegExp("(\"([^\"]*)\")|('([^']*)')", "g");
			var strlist = [], astr;
			var shift = 0;
			var num = 0;
			var lastIndex = 0;
			var incompleteIndex = -1;
			var testReg = /['"]/g;
			var testStr = "";
			var sOffset = -1;
			var sPrefix = "";
			var rStr = "";
			while ((astr = reg.exec(preData.str)) !== null) {
				testReg = /['"]/g;
				testStr = testReg.exec(preData.str.slice(lastIndex));
				if (testStr && testStr[0].charAt(0) !== astr[0].charAt(0)) {
					incompleteIndex = lastIndex + testStr.index;
					break;
				}

				sOffset = astr.index;
				lastIndex = reg.lastIndex;
				sPrefix = "";
				rStr = "";
				if (preData.offset > sOffset) {
					if (preData.offset < sOffset + astr[0].length - 1) {
						rStr = num.toString();
						shift += preData.offset - sOffset - rStr.length;
						sPrefix = astr[0].slice(1, preData.offset - sOffset + 1);
					} else {
						rStr = "\"" + num + "\"";
						shift += astr[0].length - rStr.length;
					}
				}
				strlist.push({
					str : astr[0].slice(1, -1),
					offset : sOffset,
					prefix : sPrefix
				});
				num++;
			}

			//for incomplete string
			var hasIncomplet = false;
			if (incompleteIndex === -1) {
				testReg = /['"]/g;
				testStr = testReg.exec(preData.str.slice(lastIndex));
				if (testStr) {
					incompleteIndex = lastIndex + testStr.index;
				}
			}
			if (incompleteIndex > -1) {
				astr = preData.str.slice(incompleteIndex);
				sOffset = incompleteIndex;
				sPrefix = "";
				if (preData.offset > sOffset) {
					if (preData.offset < sOffset + astr.length) {
						rStr = num.toString();
						shift += preData.offset - sOffset - rStr.length;
						sPrefix = astr.slice(1, preData.offset - sOffset + 1);
					} else {
						rStr = "\"" + num.toString();
						shift += astr.length - rStr.length;
					}
				}
				strlist.push({
					str : astr.slice(1),
					offset : sOffset,
					prefix : sPrefix
				});
				preData.str = preData.str.slice(0, strlist[num].offset) + "\"" + num.toString();
				hasIncomplet = true;
			}

			for (var i = hasIncomplet ? strlist.length - 2 : strlist.length - 1; i >= 0; i--) {
				preData.str = preData.str.slice(0, strlist[i].offset) + "\"" + i + "\""
						+ preData.str.slice(strlist[i].offset + strlist[i].str.length + 2);
			}

			preData.strList = strlist;
			preData.offset -= shift;
		},

		preParse : function(str, offset) {
			var preData = {
				str : "",
				offset : 0
			};
			preData.str = str.slice(0);
			preData.offset = offset;

			//preparse for CDATA
			this.preParseCData(preData);

			//preparse for Comments
			this.preParseComments(preData);

			//preparse for String. targeting the scenario that there are special chars such as '>' in string value in UI5 XML. 
			this.preParseString(preData);

			return preData;
		},
		parseTag : function(content, regRes, root, curObj, preData, offset, parsedIndex) {
			var offsetStatus = {
				offsetType : "",//
				offsetSentence : "",
				offsetWord : "",
				offsetPrefix : "",
				offsetObj : undefined,
				tag : "",
				attr : ""
			};
			var defaultNamespace = "_defaultns_";
			var regTrim = new RegExp("^\\s+|\\s+$", "g");
			var reAttr = new RegExp("([^=]*)=((\"([^\"]*)\")|('([^']*)'))", "g");
			var normalize = new RegExp("\\s+", "g");
			var egt = new RegExp("\\&gt;", "g");
			var elt = new RegExp("\\&lt;", "g");
			var equot = new RegExp("\\&quot;", "g");
			var eapos = new RegExp("\\&apos;", "g");
			var eamp = new RegExp("\\&amp;", "g");

			var o = null;
			var valPrefix = null;
			var name = "";
			var val = "";
			var valObj = null;
			//
			if (offset && offset > parsedIndex + regRes[1].length + regRes[2].length + 2) {
				offsetStatus.offsetType = this.offsetTypes.text;
				offsetStatus.offsetPrefix = content.slice(parsedIndex + regRes[1].length + regRes[2].length + 3, offset + 1);
				offsetStatus.offsetObj = curObj;
			}

			//	closing tag
			if (regRes[2].charAt(0) === "/" && regRes[2].replace(regTrim, "").length > 0) {
				if (offset) {
					if (offsetStatus.offsetType === "") {
						if (regRes.length === 4 && offset < parsedIndex + regRes[1].length + regRes[2].length + 2) {
							offsetStatus.offsetType = this.offsetTypes.closetag;
							offsetStatus.offsetObj = curObj;
						}
						if (regRes.length === 3 && offset < parsedIndex + regRes[0].length + 1) {
							offsetStatus.offsetType = this.offsetTypes.closetag;
							offsetStatus.offsetObj = curObj;
						}
					} else if (curObj.parentNode) {
						offsetStatus.offsetObj = curObj.parentNode;
					}
				}
				if (curObj.parentNode) {
					curObj = curObj.parentNode;
				}
			}
			//	open tag
			else if (regRes[1].length >= 0) {
				if (regRes[1].length === 0) {
					if (offset && offsetStatus.offsetType === "") {
						offsetStatus.offsetType = this.offsetTypes.tag;
						offsetStatus.offsetPrefix = "";
						o = {
							nodeType : this.nodeTypes.ELEMENT,
							nodeName : "",
							localName : "",
							namespace : defaultNamespace,
							attributes : [],
							parentNode : curObj,
							isPrecedingOffset : this.isPrecedingOffset,
							childNodes : []
						};
						offsetStatus.offsetObj = o;
					}
				} else if (regRes[1].charAt(0) === "?") {
					if (offset && offsetStatus.offsetType === "") {
						offsetStatus.offsetType = this.offsetTypes.instruction;
						offsetStatus.offsetObj = curObj;
					}
				} else if (regRes[1].charAt(0) === "!") {
					if (regRes[1].indexOf("![CDATA[") === 0) {
						if (offset && offsetStatus.offsetType === "") {
							offsetStatus.offsetType = this.offsetTypes.cdata;
							offsetStatus.offsetObj = curObj;
						}
					} else if (regRes[1].indexOf("!--") === 0) {
						val = null;
						if (regRes[1].slice(-2) == "--") {
							val = regRes[1].slice(3, -2);
						} else {
							val = regRes[1].slice(3);
						}
						valPrefix = null;
						if (val.length > 0) {
							valObj = preData.commentList[parseInt(val, 10)];
							curObj.childNodes.push({
								nodeType : this.nodeTypes.COMMENT,
								nodeName : "#comment",
								nodeValue : valObj.str
							});
							valPrefix = valObj.prefix;
						}
						if (offset && offsetStatus.offsetType == "" && offset < parsedIndex + regRes[1].length + 2) {
							offsetStatus.offsetType = this.offsetTypes.comments;
							offsetStatus.offsetObj = curObj;
							offsetStatus.prefix = valPrefix || "";
						}
					}
				} else {
					if (offset && offset < parsedIndex + regRes[1].length + 2) {
						offsetStatus.offsetType = this.offsetTypes.tag;
						offsetStatus.offsetWord = regRes[1];
						offsetStatus.offsetPrefix = regRes[1].substring(0, offset - parsedIndex - 1);
					}

					//	create Element 
					name = regRes[1].replace(regTrim, "");
					o = {
						nodeType : this.nodeTypes.ELEMENT,
						nodeName : name,
						localName : name,
						namespace : defaultNamespace,
						attributes : [],
						parentNode : null,
						isPrecedingOffset : this.isPrecedingOffset,
						childNodes : []
					};

					//	check if it's namespace.
					if (name.indexOf(":") > -1) {
						var t = name.split(":");
						o.namespace = t[0];
						o.localName = t[1];
					}

					//	parse the attribute
					var attr;
					var attrParsedIndex;
					if (offset) {
						attrParsedIndex = -1;
					}
					var attrStartIndex = parsedIndex + regRes[1].length + 2;
					var ns = null;
					var schemas = null;
					var tmpstr = "";
					var words = null;
					while ((attr = reAttr.exec(regRes[2])) != null) {
						valPrefix = null;
						if (attr.length > 0) {
							name = attr[1].replace(regTrim, "");
							val = (attr[4] || attr[6] || "");
							if (val.length > 0) {
								valObj = preData.strList[parseInt(val, 10)];
								val = valObj.str;
								valPrefix = valObj.prefix;
							}
							val = val.replace(normalize, " ").replace(egt, ">").replace(elt, "<").replace(eapos, "'").replace(equot, '"')
									.replace(eamp, "&");
							if (name.indexOf("xmlns") == 0) {
								if (name == "xmlns:xsi" && val == "http://www.w3.org/2001/XMLSchema-instance") {
									root.schema = true;
								} else if (name.indexOf(":") > 0) {
									ns = name.split(":");
									if (curObj && curObj.nodeName === "#document") {
										root.nameSpaces[ns[1]] = val;
									}
								} else {
									if (curObj && curObj.nodeName === "#document") {
										root.nameSpaces[defaultNamespace] = val;
									}
								}
							} else {
								var ln = name;
								ns = defaultNamespace;
								if (name.toLowerCase() == "xsi:nonamespaceschemalocation") {
									schemas = val.split(" ");
									for (var si = 0; si < schemas.length; si++) {
										root.schemaInfo.push({
											"ns" : "",
											"loc" : schemas[si]
										});
									}
								} else if (name.toLowerCase() == "xsi:schemalocation") {
									schemas = val.split(" ");
									for (var si = 0; si < schemas.length; si += 2) {
										ns = schemas[si];
										root.schemaInfo.push({
											"ns" : ns,
											"loc" : schemas[si + 1]
										});
									}
								}

								if (name.indexOf(":") > 0) {
									var tp = name.split(":");
									ln = tp[1];
									ns = tp[0];
								}
								o.attributes.push({
									nodeType : this.nodeTypes.ATTRIBUTE,
									nodeName : name,
									localName : ln,
									namespace : ns,
									nodeValue : val
								});

							}
						}
						if (offset && offsetStatus.offsetType == "") {
							if (offset < attrStartIndex + attrParsedIndex + attr[1].length + 1) {
								offsetStatus.offsetType = this.offsetTypes.attr;
								tmpstr = content.slice(attrStartIndex + attrParsedIndex + 1, offset + 1);
								words = tmpstr.split(/[\n\s]+/);
								offsetStatus.offsetPrefix = words[words.length - 1];
							} else if (offset < attrStartIndex + reAttr.lastIndex - 1) {
								offsetStatus.offsetType = this.offsetTypes.value;
								offsetStatus.attr = attr[1].replace(regTrim, "");
								tmpstr = content.slice(attrStartIndex + attrParsedIndex + attr[1].length + 2, offset + 1);
								offsetStatus.offsetPrefix = valPrefix || tmpstr.slice(1);
							} else if (offset == attrStartIndex + reAttr.lastIndex - 1) {
								offsetStatus.offsetType = this.offsetTypes.intag;
							}
						}
						attrParsedIndex = reAttr.lastIndex - 1;
					}

					//for incomplete attr
					if (offset && offsetStatus.offsetType == "" && offset < parsedIndex + regRes[1].length + regRes[2].length + 2) {
						tmpstr = content.slice(attrStartIndex + attrParsedIndex + 1, offset + 1);
						words = tmpstr.split(/[\n\s]+/);
						var word = words[words.length - 1];
						var pos = word.indexOf("=");
						if (pos == -1) {
							offsetStatus.offsetType = this.offsetTypes.attr;
							offsetStatus.offsetPrefix = word;
						} else {
							offsetStatus.offsetType = this.offsetTypes.value;
							var prefix = word.substring(pos + 1);
							if (prefix.length > 1 && prefix.charAt(0) == '\"') {
								valObj = preData.strList[parseInt(prefix.slice(1), 10)];
								prefix = valObj.str;
							} else if (prefix[0] == '\"' || prefix[0] == '\'') {
								prefix = prefix.substring(1);
							}
							offsetStatus.offsetPrefix = prefix;
							offsetStatus.attr = word.slice(0, pos);
						}
					}

					if (curObj) {
						curObj.childNodes.push(o);
						o.parentNode = curObj;
						//	when not self-closing.
						if (regRes[2].charAt(regRes[2].length - 1) != "/") {
							curObj = o;
						}
					}
					if (offsetStatus.offsetType == this.offsetTypes.text) {
						offsetStatus.offsetObj = curObj;
					} else if (offsetStatus.offsetType != "") {
						offsetStatus.offsetObj = o;
					}

				}
			}
			var text = regRes[3];
			if (regRes[3] != null) {
				if (offset && offset<parsedIndex + regRes[1].length + regRes[2].length + 3) {
					this.isPrecedingOffset = false;
				}
				curObj.childNodes.push(this.createTextNode(text));
				if (offset && offsetStatus.offsetType == "") {
					offsetStatus.offsetType = this.offsetTypes.text;
					offsetStatus.offsetPrefix = content.slice(parsedIndex + regRes[1].length + regRes[2].length + 3, offset + 1);
					offsetStatus.offsetObj = curObj;
				}
			}

			return {
				curObj : curObj,
				offsetStatus : offsetStatus
			};
		},
		parse : function(str, offset) {
			var result = {};
			this.isPrecedingOffset = true;
			result.root = this.createDocNode();
			result.status = {
				origContent : str.slice(0),
				origOffset : offset - 1,
				content : "",
				offset : offset,
				offsetType : "",//
				offsetSentence : "",
				offsetWord : "",
				offsetPrefix : "",
				offsetObj : null,
				tag : "",
				attr : ""
			};

			if (str == null || str.length == 0) {
				result.status.offsetType = this.offsetTypes.root;
			} else {
				//preparse for CData, comments etc.
				var preData = this.preParse(result.status.origContent, result.status.origOffset);
				result.status.content = preData.str;
				result.status.offset = preData.offset;

				//parse the content				
				var parsedIndex = -1;
				if (parsedIndex == -1) {
					var pos = result.status.content.indexOf("<");
					parsedIndex = pos - 1;
					var text = pos > -1 ? result.status.content.substring(0, result.status.content.indexOf("<")) : result.status.content;
					result.root.childNodes.push(this.createTextNode(text));
					if (pos == -1 || result.status.offset < pos) {
						result.status.offsetType = this.offsetTypes.text;
						result.status.offsetSentence = text;
						result.status.offsetPrefix = result.status.content.substring(0, offset);
						result.status.tag = "#document";
						result.status.offsetObj = result.root;
						this.isPrecedingOffset = false;
					}
				}

				//parse complete tags				
				var regRes;
				var curObj = result.root;
				var regTags = new RegExp("<([^>\\/\\s+]*)([^>]*)>([^<]*)", "g");
				var regTrim = new RegExp("^\\s+|\\s+$", "g");
				var data;
				while ((regRes = regTags.exec(result.status.content)) != null) {
					data = null;
					if (result.status.offset > parsedIndex && result.status.offset < regTags.lastIndex) {
						data = this
								.parseTag(result.status.content, regRes, result.root, curObj, preData, result.status.offset, parsedIndex);
						if (data.offsetStatus.offsetType != "") {
							result.status.offsetType = data.offsetStatus.offsetType;
							result.status.offsetSentence = data.offsetStatus.offsetSentence;
							result.status.offsetWord = data.offsetStatus.offsetWord;
							result.status.offsetPrefix = data.offsetStatus.offsetPrefix;
							result.status.offsetObj = data.offsetStatus.offsetObj;
							result.status.tag = data.offsetStatus.tag;
							result.status.attr = data.offsetStatus.attr;
							this.isPrecedingOffset = false;
						}
					} else {
						data = this.parseTag(result.status.content, regRes, result.root, curObj, preData);
					}
					curObj = data.curObj;
					parsedIndex = regTags.lastIndex - 1;
				}

				//parse incomplete tag
				var regTag = new RegExp("<([^>\\/\\s+]*)([^>]*)", "g");
				regTag.lastIndex = parsedIndex + 1;
				if ((regRes = regTag.exec(result.status.content)) != null) {
					data = null;
					if (result.status.offset > parsedIndex && result.status.offset < regTag.lastIndex) {
						data = this
								.parseTag(result.status.content, regRes, result.root, curObj, preData, result.status.offset, parsedIndex);
						result.status.offsetType = data.offsetStatus.offsetType;
						result.status.offsetSentence = data.offsetStatus.offsetSentence;
						result.status.offsetWord = data.offsetStatus.offsetWord;
						result.status.offsetPrefix = data.offsetStatus.offsetPrefix;
						result.status.offsetObj = data.offsetStatus.offsetObj;//data.curObj;
						result.status.tag = data.offsetStatus.tag;
						result.status.attr = data.offsetStatus.attr;
						this.isPrecedingOffset = false;
					} else {
						data = this.parseTag(result.status.content, regRes, result.root, curObj, preData);
					}
				}

			}

			//	set the document element
			for (var i = 0; i < result.root.childNodes.length; i++) {
				var node = result.root.childNodes[i];
				if (node.nodeType == this.nodeTypes.ELEMENT) {
					result.root.documentElement = node;
					break;
				}
			}
			//result.curObj = curObj;
			return result;
		}

	};

	var XMLVisitor = function() {
		this._mParser = new XMLParser();
	};

	XMLVisitor.prototype = {
		_mParser : null,
		suggestTypes : {
			rootsnippet : "rootsnippet",
			tag : "tag",
			attr : "attr",
			value : "value",
			entity : "entity",
			cdata : "cdata",
			comments : "comments",
			instruction : "instruction",
			intag : "intag",
			error : "error"
		},

		getParser : function(){
			return this._mParser;
		},

		getEnv : function(buffer, offset, oSettings) {
			var currentEnv = {
				type : "",
				xmlnsList : [],
				currentTag : "",
				currentTagns : "",
				currentAttr : "",
				currentAttrs : [],
				parentTag : "",
				gparentTag : "",
				prefix : "",
				prefixns : "",
				lbracket : false,
				origText : ""
			};

			var root;
			var curobj;
			var parentTagObj;
			var defaultNamespace = "_defaultns_";

			if (this._mParser) {
				var syntax = null;
				if (oSettings && oSettings.bParsingAll) {
					syntax = buffer;
				} else {
					syntax = buffer.slice(0, offset);
				}
				
				var result = this._mParser.parse(syntax, offset);
				root = result.root;
				curobj = result.curobj;
				if (root) {
					var item = null;
					for (item in root.nameSpaces) {
						if (Object.prototype.hasOwnProperty.call(root.nameSpaces, item)) {
							if (item == defaultNamespace) {
								currentEnv.xmlnsList.push({
									name : "xmlns",
									ns : root.nameSpaces[item]
								});
							} else {
								currentEnv.xmlnsList.push({
									name : item,
									ns : root.nameSpaces[item]
								});
							}
						}
					}
					var rootNodeNameSpace = "";
					var rootNodeName = root.documentElement ? root.documentElement.nodeName : "";
					var pos = rootNodeName.indexOf(":");
					if (pos > 0) {
						rootNodeNameSpace = rootNodeName.slice(0, pos);
						if (rootNodeNameSpace == "") {
							rootNodeNameSpace = root.nameSpaces[defaultNamespace];
						} else if (root.nameSpaces[rootNodeNameSpace]) {
							rootNodeNameSpace = root.nameSpaces[rootNodeNameSpace];
						}
						rootNodeName = rootNodeName.slice(pos + 1);
					}
					var isValidRootNodeName = rootNodeName != "";
					if (oSettings && oSettings.rootNode && oSettings.rootNode.length>0) {
						isValidRootNodeName = false;
						for (var k = 0; k < oSettings.rootNode.length; k++) {
							if (rootNodeNameSpace == oSettings.rootNode[k].nameSpace && rootNodeName == oSettings.rootNode[k].name) {
								isValidRootNodeName = true;
								break;
							}
						}
						currentEnv.isUI5 = undefined;
					} else if (rootNodeNameSpace == "sap.ui.core" && (rootNodeName == "View" || rootNodeName == "FragmentDefinition")) {
						currentEnv.isUI5 = true;
					} else if (rootNodeNameSpace == "sap.ui.core.mvc" && rootNodeName == "View") {
						currentEnv.isUI5 = true;
					} else if (root.documentElement) {
						currentEnv.isUI5 = false;
					} else {
						currentEnv.isUI5 = undefined;
					}
					if (!root.documentElement || isValidRootNodeName) {
						var colonpos = -1;
						switch (result.status.offsetType) {
						case this._mParser.offsetTypes.root:
							currentEnv.type = this.suggestTypes.rootsnippet;
							currentEnv.prefix = syntax;
							currentEnv.origText = buffer.slice(0, offset);
							break;
						case this._mParser.offsetTypes.text:
							if (result.status.offsetObj.nodeName == "#document" || result.status.tag == "#document") {
								currentEnv.type = this.suggestTypes.rootsnippet;
								currentEnv.prefix = syntax;
								currentEnv.origText = buffer.slice(0, offset);
							} else {
								currentEnv.type = this.suggestTypes.tag;
								currentEnv.parentTag = result.status.offsetObj.nodeName;
								parentTagObj = result.status.offsetObj;
								currentEnv.gparentTag = result.status.offsetObj.parentNode ? result.status.offsetObj.parentNode.nodeName
										: "";
								currentEnv.prefix = "";
								currentEnv.lbracket = false;
								currentEnv.origText = currentEnv.prefix;
							}

							break;
						case this._mParser.offsetTypes.tag:
							currentEnv.type = this.suggestTypes.tag;
							currentEnv.parentTag = result.status.offsetObj.parentNode.nodeName;
							parentTagObj = result.status.offsetObj.parentNode;
							currentEnv.gparentTag = result.status.offsetObj.parentNode.parentNode ? result.status.offsetObj.parentNode.parentNode.nodeName
									: "";
							currentEnv.prefix = result.status.offsetPrefix;
							colonpos = currentEnv.prefix.indexOf(":");
							if (colonpos > -1) {
								currentEnv.prefixns = currentEnv.prefix.slice(0, colonpos);
								currentEnv.prefix = currentEnv.prefix.slice(colonpos + 1);
							}
							currentEnv.lbracket = true;
							currentEnv.origText = currentEnv.prefix;
							break;
						case this._mParser.offsetTypes.attr:
							currentEnv.type = this.suggestTypes.attr;
							currentEnv.currentTag = result.status.offsetObj.nodeName;
							currentEnv.parentTag = result.status.offsetObj.parentNode ? result.status.offsetObj.parentNode.nodeName : "";
							parentTagObj = result.status.offsetObj.parentNode;
							var attributes = result.status.offsetObj.attributes;
							for (var j = 0; j < attributes.length; j++) {
								var attr = attributes[j];
								if (attr.nodeName) {
									currentEnv.currentAttrs.push(attr.nodeName);
								}
							}
							currentEnv.prefix = result.status.offsetPrefix;
							colonpos = currentEnv.currentTag.indexOf(":");
							if (colonpos > -1) {
								currentEnv.currentTagns = currentEnv.currentTag.slice(0, colonpos);
								currentEnv.currentTag = currentEnv.currentTag.slice(colonpos + 1);
							}
							currentEnv.origText = currentEnv.prefix;
							break;
						case this._mParser.offsetTypes.value:
							currentEnv.type = this.suggestTypes.value;
							currentEnv.currentTag = result.status.offsetObj.nodeName;
							currentEnv.parentTag = result.status.offsetObj.parentNode ? result.status.offsetObj.parentNode.nodeName : "";
							parentTagObj = result.status.offsetObj.parentNode;
							currentEnv.currentAttr = result.status.attr;
							currentEnv.prefix = result.status.offsetPrefix;
							colonpos = currentEnv.currentTag.indexOf(":");
							if (colonpos > -1) {
								currentEnv.currentTagns = currentEnv.currentTag.slice(0, colonpos);
								currentEnv.currentTag = currentEnv.currentTag.slice(colonpos + 1);
							}
							currentEnv.origText = currentEnv.prefix;
							break;
						case this._mParser.offsetTypes.intag:
							currentEnv.type = this.suggestTypes.intag;
							currentEnv.currentTag = result.status.offsetObj.nodeName;
							currentEnv.origText = "";
							break;
						default:
							currentEnv.origText = "";
							break;
						}
					}

				}
			}

			return {
				currentEnv : currentEnv,
				root : root,
				curobj : curobj,
				parentTagObj : parentTagObj
			};
		}

	};

	return XMLVisitor;
});
