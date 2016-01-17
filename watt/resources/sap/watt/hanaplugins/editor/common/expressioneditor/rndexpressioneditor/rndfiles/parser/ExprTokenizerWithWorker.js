/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
//ace editor mode implementation for HANA DDL grammar
define(
    ["rndrt/rnd", "commonddl/commonddlNonUi","commonddl/commonddlUi","sap/watt/hanaplugins/editor/common/expressioneditor/rndexpressioneditor/rndfiles/parser/ParserAPI"], //dependencies
	function(rnd,  commonddlui, commonddlui1, ParserAPI) {
		var SapDdlConstants = commonddlui.SapDdlConstants;

		//TODO: @Catalog.index inserts complete annotation - missing today
		//TODO: predefined type length/decimals - set cursor positions

		//DONE: multi line coloring -> remove */ at end and add it again --> next line not colored correctly
		//DONE: bug coco: association <coco press t and then enter>
		//DONE: take DdlCompletionType into account (what about annotation)
		//DONE: sort order in coco list wrong ( view v as select from context.entity { <elements strange>
		//DONE: different colors for annotations and comments
		//DONE: make type usage italic
		//DONE: */context test {
		//DONE: multi line comment
		//DONE: take multi line comment handling from console
		//DONE: annotations not colored in a correct way
		//DONE: coloring for following scenario:
		//entity entity {
		//element
		//    : cc 
		//    };
		
		ExprTokenizerWithWorker.prototype = Object.create(commonddlui.BaseDdlTokenizerWithWorker.prototype);

		function ExprTokenizerWithWorker(Range, language) {
			var that = this;
			that.language = language;
			commonddlui.BaseDdlTokenizerWithWorker.call(that, Range, null, "ParserAPI.js");
			that.resolver = null;

			that.parser = new ParserAPI(null, null, null, language);
			that.padFilePath = commonddlui.BaseDdlTokenizerWithWorker.prototype.getTokenizerPath.call(that);
		}

		ExprTokenizerWithWorker.prototype.isMyEditorSessionMode = function(session) {
			if (session.$modeId == "ace/mode/expr") {
				return true;
			}
			return false;
		};

		ExprTokenizerWithWorker.prototype.getTokenizerPath = function() {
			var path = commonddlui.BaseDdlTokenizerWithWorker.prototype.getTokenizerPath.call(this);
			if (this.language === "SQL") {
				path += "/ace/sql";
			} else {
				path += "/ace/hana";
			}
			return path;
		};

		ExprTokenizerWithWorker.prototype.addNavigationHandler = function(editor) {
			//not implemented
			//var nh = new EditorNavigationHandler(editor, this.parser, this.resolver, this.Range);
			//nh.registerEventListeners();
			//nh.registerKeyboardShortcut();
		};

		ExprTokenizerWithWorker.prototype.getCompls = function(pos, prefix) {
			var buf = new rnd.StringBuffer();
			for (var i = 0; i < this.sourceDocument.$lines.length; i++) {
				buf.append(this.sourceDocument.$lines[i]);
				buf.append("\n");
			}
			var str = buf.toString();

			var res = this.parser.getCompletions(str, pos.row, pos.column);
			if (res != null && res.length > 0) {
				if (res[0].doReplaceTokenAtCurrentOffset == true && res[0].replacementOffset > 0) {
					var pos = this.convertOffsetToRowColumn(str, res[0].replacementOffset);
					for (var i = 0; i < res.length; i++) {
						res[i].replacementRow = pos.row;
						res[i].replacementColumn = pos.column;
					}
				} else {
					//find replacement position
					for (var i = 0; i < res.length; i++) {
						res[i].replacementRow = pos.row;
						res[i].replacementColumn = pos.column - prefix.length;
						res[i].replacementLength = prefix.length;
					}
				}
			}
			return res;

		};

		ExprTokenizerWithWorker.prototype.convertRndTokensToAce = function(rndTokens, row) {
			this.deleteLastErrorTokenMarkers(row);
			var aceTokens = [];

			var lastEndTokenOffset = 0;
			for (var i = 0; i < rndTokens.length; i++) {
				if (rndTokens[i].m_num == SapDdlConstants.NUM_EOF)
					continue;
				var aceToken = {};
				var spaces = this.createSpaces(row, lastEndTokenOffset, rndTokens[i].m_column - 1);
				aceToken.value = spaces + rndTokens[i].m_lexem;
				var payload = rndTokens[i].mPayLoad;
				if (rndTokens[i].m_err_state.m_value == rnd.ErrorState.Erroneous.getValue()) {
					aceToken.type = "text";
					this.createMarkerForErrorToken(row, rndTokens[i].m_column - 1, rndTokens[i].m_lexem.length);
				} else if (rndTokens[i].m_category.value == rnd.Category.CAT_KEYWORD.value ||
					rndTokens[i].m_category.value == rnd.Category.CAT_MAYBE_KEYWORD.value ||
					rndTokens[i].m_category.value == rnd.Category.CAT_OPERATOR.value) {
					aceToken.type = "keyword";
				} else if (rndTokens[i].m_category.value == rnd.Category.CAT_LITERAL.value) {
					aceToken.type = "type";
				} else if (rndTokens[i].m_category.value == rnd.Category.CAT_COMMENT.value) {
					aceToken.type = "comment";
				} else {
					aceToken.type = "text";
				}
				if (payload !== undefined && payload.isDdlTypeUsage === true) {
					if (aceToken.type != "keyword") { //but not when keyword -> keyword can never be a type usage; incorrect parser behavior
						aceToken.type = "variable.parameter";
					}
				}
				if (payload !== undefined && payload.isAnnotationPayload === true) {
					aceToken.type = "meta.tag";
				}
				aceTokens.push(aceToken);
				if (rndTokens[i].m_lexem) {
					lastEndTokenOffset = rndTokens[i].m_column - 1 + rndTokens[i].m_lexem.length;
				}
			}
			return aceTokens;
		};
		
		return ExprTokenizerWithWorker;
	}
	
);
