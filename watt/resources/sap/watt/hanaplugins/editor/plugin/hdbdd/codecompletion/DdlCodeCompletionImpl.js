/*eslint-disable no-eq-null,eqeqeq,camelcase,max-params,quotes,complexity,max-statements,curly,max-len,no-empty,no-proto,no-redeclare,radix,no-undef,no-console,valid-jsdoc*/
define(["hanaddl/hanaddlNonUi", "commonddl/commonddlNonUi"], function (hanaddlNonUi, commonddlNonUi) {

    return {
        getCaretPos: function () {
            var pos = this.ace.getCursorPosition();
            return this.ace.positionToIndex(pos);
        },
        getCodeCompletionTypeName: function(complType) {
            var IBaseCdsDdlParserConstants = hanaddlNonUi.IBaseCdsDdlParserConstants;
            var DdlCodeCompletionType = commonddlNonUi.DdlCodeCompletionType;

            if (DdlCodeCompletionType.ANNOTATION == complType) {
                return "annotation";
            }else if (IBaseCdsDdlParserConstants.WARNING_TYPE == complType) {
                return "warning";
            }else if (IBaseCdsDdlParserConstants.LOADING_TYPE == complType) {
                return "";
            }else if (IBaseCdsDdlParserConstants.ALIAS_TYPE == complType) {
                return "alias";
            }else if (IBaseCdsDdlParserConstants.TYPE_TYPE == complType) {
                return "type";
            }else if (IBaseCdsDdlParserConstants.ENTITY_TYPE == complType) {
                return "entity";
            }else if (IBaseCdsDdlParserConstants.CONST_TYPE == complType) {
                return "const";
            }else if (IBaseCdsDdlParserConstants.CONTEXT_TYPE == complType) {
                return "context";
            }else if (IBaseCdsDdlParserConstants.VIEW_TYPE == complType) {
                return "view";
            }else if (IBaseCdsDdlParserConstants.ASSOC_TYPE == complType) {
                return "association";
            }else if (IBaseCdsDdlParserConstants.ELEMENT_TYPE == complType) {
                return "element";
            }else if (IBaseCdsDdlParserConstants.ASPECT_TYPE == complType) {
                return "aspect";
            }else if (IBaseCdsDdlParserConstants.TABLE_TYPE == complType) {
                return "table";
            }else if (IBaseCdsDdlParserConstants.SYNONYM_TYPE == complType) {
                return "synonym";
            } else {
                return "keyword";
            }
        },
        getFullNamespaceForExternalCoCoObject:function(completion) {
            if (completion != null && completion.externalNameDecl != null) {
                if (typeof completion.externalNameDecl === "string") {
                    return completion.externalNameDecl;
                }else {
                    var fqn = hanaddlNonUi.ContextUtil.getFqnWithNamespace(completion.externalNameDecl);
                    return fqn;
                }
            }
        },
        getCodeCompletionCategory: function(complType) {
       	   var IBaseCdsDdlParserConstants = hanaddlNonUi.IBaseCdsDdlParserConstants;
           var DdlCodeCompletionType = commonddlNonUi.DdlCodeCompletionType;

           if (IBaseCdsDdlParserConstants.LOADING_TYPE == complType) {
                return "hdbddLoading";
           }else if (DdlCodeCompletionType.ANNOTATION == complType) {
               return "hdbddAnnotation";
           }else if (IBaseCdsDdlParserConstants.ALIAS_TYPE == complType) {
               return "hdbdd";
           }else if (IBaseCdsDdlParserConstants.TYPE_TYPE == complType) {
               return "hdbddType";
           }else if (IBaseCdsDdlParserConstants.ENTITY_TYPE == complType) {
               return "hdbddEntity";
           }else if (IBaseCdsDdlParserConstants.CONST_TYPE == complType) {
               return "hdbdd";
           }else if (IBaseCdsDdlParserConstants.CONTEXT_TYPE == complType) {
               return "hdbddContext";
           }else if (IBaseCdsDdlParserConstants.VIEW_TYPE == complType) {
               return "hdbddView";
           }else if (IBaseCdsDdlParserConstants.ASSOC_TYPE == complType) {
               return "hdbdd";
           }else if (IBaseCdsDdlParserConstants.ELEMENT_TYPE == complType) {
               return "hdbddElement";
           }else if (IBaseCdsDdlParserConstants.ASPECT_TYPE == complType) {
               return "hdbdd";
           }else if (IBaseCdsDdlParserConstants.TABLE_TYPE == complType) {
               return "hdbddTable";
           }else if (IBaseCdsDdlParserConstants.SYNONYM_TYPE == complType) {
               return "hdbdd";
           }else{
               return "hdbdd";
           }
       },
        changeListenerRegistered:false,
        addChangeSessionListenerToRemoveHdbddCompletionLogicExactlyOneTime:function(editor) {
            if (this.changeListenerRegistered === false) {
                this.changeListenerRegistered = true;
                var that = this;
                editor.on("changeSession",function(pData,pEditor) {
                    if (pEditor != null && pEditor.session && pEditor.session.$modeId != "ace/mode/hdbcds") {
                        //switched to a non hdbdd editor -> disable
                        that.disableHdbddCompletionLogic();
                    }
                });
            }
        },
       replaceCompletionInEditor : function(index) {
           if (index === undefined) {
               var prop = this.$$origGetInsertTerm();
               for (var i = 0;i < this.aProposals.length;i++) {
                    if (this.aProposals[i] === prop) {
                        index = i;
                        break;
                    }
                }
            }
            var theObj = this.aProposals[index].ddlCompletion;
            var that = this;
            return this.context.service.content.getCurrentEditor().then(function (ioCurrentEditor) {
                return ioCurrentEditor.getUI5Editor().then(function (ed) {
                    try {
                        // call original function so that popup will be closed (but ensure that nothing will be inserted) - we will do this later
                        if (that.$$origReplaceFunction) {
                            that.$$origReplaceFunction(index);
                        }
                        var tokenizer = ed.oEditor.rndTokenizer;
                        var beforeCursor = tokenizer.aceEditor.selection.getCursor();
                        tokenizer.insertCompletion(tokenizer.aceEditor, theObj, beforeCursor);
                    } catch (e) {
                        if (typeof console !== "undefined") {
                            console.log(e.stack);
                        }
                    }
                });
            });
        },
        getInsertTerm: function (index) {
            var emptyProposal = {
                proposal: "",
                overwrite: false,
                category: "hdbcds",
                helpDescription: "",
                helpTarget: "",
                description: ""
            };
            return emptyProposal;
        },
        enableHdbddCompletionLogic: function () {
            var that = this;
            var intellisenceService = this.context.service.intellisence;
            intellisenceService._getImpl().then(function (oImpl) {
                var sy = oImpl._oImplSync;
                if (sy.replace === that.replaceCompletionInEditor)
                    return;
                sy.$$origReplaceFunction = sy.replace;
                sy.replace = that.replaceCompletionInEditor;
                sy.$$origGetInsertTerm = sy.getInsertTerm;
                sy.getInsertTerm = that.getInsertTerm;
            });
        },
        disableHdbddCompletionLogic: function () {
            var that = this;
            var intellisenceService = this.context.service.intellisence;
            intellisenceService._getImpl().then(function (oImpl) {
                var sy = oImpl._oImplSync;
                if (sy.replace === that.replaceCompletionInEditor) {
                    sy.replace = sy.$$origReplaceFunction;
                    delete sy.$$origReplaceFunction;
                    sy.getInsertTerm = sy.$$origGetInsertTerm;
                    delete sy.$$origGetInsertTerm;
                }
            });
        },
        getWordSuggestions: function (oContentStatus) {
            var oDeferred = Q.defer();  // Start of Async acction using a defered object
            var text = oContentStatus.buffer;
            var coords = oContentStatus.offset;
            if (oContentStatus.isAutoHint) {
                oDeferred.resolve([]);
                return oDeferred;
            }
            var that = this;
            this.enableHdbddCompletionLogic();
            var lineArray = text.substring(0,coords).split('\n');
			var line = lineArray.length - 1;
			var col = (lineArray.length === 0) ? 0 : lineArray[line].length;
			return this.context.service.content.getCurrentEditor().then(function (ioCurrentEditor) {
                return ioCurrentEditor.getUI5Editor().then(function (ed) {

                    var pos = {row: line, column: col};
                    var tokenizer = ed.oEditor.rndTokenizer;
                    that.addChangeSessionListenerToRemoveHdbddCompletionLogicExactlyOneTime(tokenizer.aceEditor);
                    var completions = tokenizer.getCompls(pos, oContentStatus.prefix, coords);
                    var aProposals = [];

        			for (var i = 0;i < completions.length;i++) {
        				var compl = completions[i];
        				var additionalDisplayString = that.getCodeCompletionTypeName(compl.type);
        				var category = that.getCodeCompletionCategory(compl.type);
                        var desc = compl.name;
                        if (additionalDisplayString != null && additionalDisplayString.length > 0) {
                            desc = compl.name + " - " + additionalDisplayString;
                        }
        				var proposal = {
                            // @CHANGE
                            // proposal: chop(prefix.toUpperCase(), sKeyword),
                            proposal: compl.name,
                            overwrite: true,
                            category: category,
                            helpDescription: "",
                            helpTarget: "",
                            description: desc,
                            ddlCompletion: compl
                        };
                        var extNamespace = that.getFullNamespaceForExternalCoCoObject(compl);
                        if (extNamespace != null) {
                            proposal.description += " - " + extNamespace;
                        }
                        aProposals.push(proposal);
                    }
                    return {proposals: aProposals};
                });
            });
        },
        getCalculatedPrefix : function(oContentStatus) {
            // Example:
            //
            // entity myEntity {
            //    myAssociation:          assoc#coco#
            // }
            //
            // oContentStatus.prefix is equals to "          assoc", but our tokens don't have spaces, i.e. we need "assoc" instead
            return oContentStatus.prefix.trimLeft();
        }
    };
});
