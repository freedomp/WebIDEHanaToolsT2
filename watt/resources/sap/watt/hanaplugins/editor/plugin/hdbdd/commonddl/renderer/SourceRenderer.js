/*eslint-disable no-eq-null,eqeqeq,max-params*/
define(
    ["rndrt/rnd","commonddl/astmodel/ViewDefinitionImpl","commonddl/astmodel/PreAnnotationImpl",
        "commonddl/astmodel/AnnotationValueImpl","commonddl/astmodel/DataSourceImpl","commonddl/astmodel/PathExpressionImpl",
        "commonddl/astmodel/ExpressionContainerImpl","commonddl/astmodel/BooleanExpressionImpl","commonddl/astmodel/CompExpressionImpl",
        "commonddl/astmodel/LiteralExpressionImpl","commonddl/astmodel/AnnotationRecordValueImpl",
        "commonddl/astmodel/AnnotationNameValuePairImpl","commonddl/astmodel/PathEntryImpl",
        "commonddl/astmodel/SearchedCaseExpressionImpl","commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/ArithmeticExpressionImpl"
    ], //dependencies
    function (rnd,ViewDefinitionImpl,PreAnnotationImpl,AnnotationValueImpl,DataSourceImpl,PathExpressionImpl,
              ExpressionContainerImpl,BooleanExpressionImpl,CompExpressionImpl,LiteralExpressionImpl,
              AnnotationRecordValueImpl,AnnotationNameValuePairImpl,PathEntryImpl,SearchedCaseExpressionImpl,
              SourceRangeImpl,ArithmeticExpressionImpl) {

        var StringBuffer = rnd.StringBuffer;

        function SourceRenderer() {
        }

        SourceRenderer.prototype.render = function(ast) {
            if (ast == null) {
                return null;
            }
            var stmts = ast.getStatements();
            if (stmts == null || stmts.length != 1) {
                throw new Error("renderer supports only one stmt");
            }
            var stmt = stmts[0];
            if (stmt instanceof ViewDefinitionImpl) {
                var buffer = new StringBuffer();
                this.renderViewInternal(stmt,buffer);
                return buffer.toString();
            }else{
                throw new Error("stmt not supported");
            }
        };

        SourceRenderer.prototype.renderTokenListInternal = function(tokens,additionalLexemAfterToken,buffer) {
            for (var i = 0;i < tokens.length;i++) {
                buffer.append(tokens[i].m_lexem);
                if (additionalLexemAfterToken != null && i < tokens.length - 1){
                    buffer.append(additionalLexemAfterToken);
                }
            }
        };

        SourceRenderer.prototype.renderAnnotationValueInternal = function(value,buffer) {
            if (value == null) {return;}
            if (value instanceof AnnotationValueImpl) {
                var t = value.getValueToken();
                buffer.append(": ").append(t.m_lexem);
            }else if (value instanceof AnnotationRecordValueImpl) {
                var comps = value.getComponents();
                buffer.append(": { ");
                for (var i = 0;i < comps.length;i++) {
                    this.renderAnnotationValueInternal(comps[i],buffer);
                    if (i < comps.length - 1) {
                        buffer.append(", ");
                    }
                }
                buffer.append(" }");
            }else if (value instanceof AnnotationNameValuePairImpl) {
                var p = value.getNameTokenPath();
                for (var i2 = 0;i2 < p.length;i2++) {
                    buffer.append(p[i2].m_lexem);
                    if (i2 < p.length - 1) {
                        buffer.append(".");
                    }
                }
                var v = value.getValue();
                this.renderAnnotationValueInternal(v,buffer);
            }else{
                throw new Error("unsupported");
            }
        };

        SourceRenderer.prototype.renderAnnotationListInternal = function(annotationList,buffer) {
            if (annotationList == null) {
                return;
            }
            for (var i = 0;i < annotationList.length;i++) {
                if (annotationList[i] == null) {
                    continue;
                }
                if (!(annotationList[i] instanceof PreAnnotationImpl)) {
                    throw new Error("unsupported case");
                }
                //annot path
                var nameTokens = annotationList[i].getNameTokenPath();
                buffer.append("@");
                this.renderTokenListInternal(nameTokens,null,buffer);
                //annot value
                var value = annotationList[i].getValue();
                this.renderAnnotationValueInternal(value,buffer);
                buffer.append("\r\n");
            }
        };

        SourceRenderer.prototype.renderFromInternal = function(from,buffer) {
            if (from instanceof DataSourceImpl) {
                var name = from.getName();
                var alias = from.getAlias();
                buffer.append(name);
                if (alias != null) {
                    buffer.append(" as ");
                    buffer.append(alias);
                }
            }else{
                throw new Error("not supported");
            }
        };

        SourceRenderer.prototype.renderAssocsInternal = function(assocs,buffer){
            if (assocs != null && assocs.length > 0) {
                buffer.append("\r\n");
                for (var i = 0;i < assocs.length;i++) {
                    buffer.append("association to ");
                    var target = assocs[i].getTargetEntityName();
                    buffer.append(target);
                    var tds = assocs[i].getTargetDataSource();
                    if (tds != null) {
                        var ali = tds.getAlias();
                        if (ali != null) {
                            buffer.append(" as ").append(ali);
                        }
                    }
                    buffer.append(" on\r\n");
                    var on = assocs[i].getOnExpression();
                    this.renderConditionInternal(on,buffer);
                }
            }
        };

        SourceRenderer.prototype.renderPathStringWithFiltersAndCardinalityRestrictionsInternal = function (pathExpr,buffer) {
            var entries = pathExpr.getEntries();
            for (var i = 0;i < entries.length;i++) {
                var entry = entries[i];
                if (entry == null) {
                    continue;
                }
                if (i > 0) {
                    buffer.append(".");
                }
                var t = entry.getNameToken();
                if (t != null) {
                    buffer.append(t.m_lexem);
                }
                var filter = entry.getFilter();
                if (filter != null) {
                    var restr = entry.getCardinalityRestriction();
                    buffer.append("[");
                    if (restr != null) {
                        var v = restr.getValue();
                        if (v != null) {
                             buffer.append(v.m_lexem).append(": ");
                        }
                    }
                    this.renderExpressionInternal(filter,buffer);
                    buffer.append("]");
                }
            }
        };

        SourceRenderer.prototype.isInFilter = function(node) {
            var ori = node;
            while (node != null) {
                if (node instanceof PathEntryImpl) {
                    if (node.getFilter() === ori) {
                        return true;
                    }
                }
                node = node.eContainer();
            }
            return false;
        };

        SourceRenderer.prototype.renderExpressionInternal = function(expr,buffer) {
            if (expr instanceof PathExpressionImpl) {
                this.renderPathStringWithFiltersAndCardinalityRestrictionsInternal(expr,buffer);
            }else if (expr instanceof BooleanExpressionImpl) {
                var ob = expr.getOpenBracket();
                if (ob != null) {
                    buffer.append(ob.m_lexem).append(" ");
                }
                var conds = expr.getConditions();
                var ty = expr.getType();
                for (var i = 0; i < conds.length; i++) {
                    this.renderConditionInternal(conds[i], buffer);
                    if (i < conds.length - 1 && ty != null){
                        buffer.append(" ").append(ty.getName().toLowerCase());
                        if (this.isInFilter(expr) === false) {
                            buffer.append("\r\n");
                        }else{
                            buffer.append(" ");
                        }
                    }
                }
                var cb = expr.getCloseBracket();
                if (cb != null) {
                    buffer.append(" ").append(cb.m_lexem);
                }
            }else if (expr instanceof LiteralExpressionImpl) {
                var l = expr.getToken();
                buffer.append(l);
            }else if (expr instanceof CompExpressionImpl) {
                this.renderConditionInternal(expr,buffer);
            }else if (expr instanceof SearchedCaseExpressionImpl) {
                this.renderSearchedCaseExpressionInternal(expr, buffer);
            }else if (expr instanceof ArithmeticExpressionImpl) {
                this.renderArithmeticExpressionInternal(expr,buffer);
            }else{
                throw new Error("unsupported");
            }
        };

        SourceRenderer.prototype.renderArithmeticExpressionInternal = function(expr,buffer) {
            var left = expr.getLeft();
            this.renderExpressionInternal(left,buffer);
            var op = expr.getOperator();
            if (op != null) {
                buffer.append(" ").append(op.m_lexem).append(" ");
            }
            var right = expr.getRight();
            this.renderExpressionInternal(right,buffer);
        };

        SourceRenderer.prototype.renderSearchedCaseExpressionInternal = function(sc,buffer) {
            buffer.append("case");
            var whens = sc.getWhenExpressions();
            for (var i = 0;i < whens.length;i++) {
                var when = whens[i].getWhenExpression();
                buffer.append(" when ");
                this.renderExpressionInternal(when,buffer);
                var then = whens[i].getThenExpression();
                buffer.append(" then ");
                this.renderExpressionInternal(then,buffer);
            }
            var els = sc.getElseExpression();
            buffer.append(" end");
        };

        SourceRenderer.prototype.renderConditionInternal = function(cond,buffer) {
            if (cond instanceof BooleanExpressionImpl) {
                this.renderExpressionInternal(cond,buffer);
            }else if (cond instanceof CompExpressionImpl) {
                var l = cond.getLeft();
                this.renderExpressionInternal(l,buffer);
                var t = cond.getType(); // t is string
                buffer.append(" ").append(t).append(" ");
                var r = cond.getRight();
                this.renderExpressionInternal(r,buffer);
            }else{
                throw new Error("unsupported");
            }

        };

        SourceRenderer.prototype.renderSelectListInternal = function (list,buffer) {
            buffer.append(" {\r\n");
            if (list != null) {
                var entries = list.getEntries();
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry == null) {
                        continue;
                    }
                    //annotation
                    var annot = entry.getAnnotationList();
                    this.renderAnnotationListInternal(annot,buffer);
                    var expr = entry.getExpression();
                    this.renderExpressionInternal(expr, buffer);
                    var alias = entry.getAlias();
                    if (alias != null) {
                        buffer.append(" as ");
                        buffer.append(alias);
                    }
                    if (i < entries.length - 1) {
                        buffer.append(",\r\n");
                    }else{
                        buffer.append("\r\n");
                    }
                }
            }
            buffer.append("}");
        };

        SourceRenderer.prototype.renderWhereInternal = function(where,buffer) {
            if (where instanceof ExpressionContainerImpl) {
                var expr = where.getExpression();
                if (expr != null) {
                    buffer.append("\r\nwhere\r\n");
                    this.renderExpressionInternal(expr,buffer);
                }
            }
        };

        SourceRenderer.prototype.renderGroupByInternal = function (groupBy,buffer) {
            if (groupBy != null) {
                throw new Error("unsupported");
            }
        };

        SourceRenderer.prototype.renderHavingInternal = function(having,buffer) {
            if (having != null) {
                throw new Error("unsupported");
            }
        };

        SourceRenderer.prototype.renderSingleSelectInternal = function(select,buffer) {
            //from
            var from = select.getFrom();
            this.renderFromInternal(from,buffer);
            //associations
            var assoc = select.getAssociations();
            this.renderAssocsInternal(assoc,buffer);
            //select list
            var list = select.getSelectList();
            this.renderSelectListInternal(list,buffer);
            //where
            var where = select.getWhere();
            this.renderWhereInternal(where,buffer);
            //group by
            var groupBy = select.getGroupBy();
            this.renderGroupByInternal(groupBy,buffer);
            //having
            var having = select.getHaving();
            this.renderHavingInternal(having,buffer);
        };

        SourceRenderer.prototype.renderParamsInternal = function(params,buffer) {
            if (params != null && params.length > 0) {
                buffer.append("\r\nwith parameters\r\n");
                for (var i = 0;i < params.length;i++) {
                    var name = params[i].getName();
                    buffer.append(name);
                    var tns = params[i].getTypeNamespace();
                    if (tns != null) {
                        buffer.append(" : ").append(tns.m_lexem).append(".");
                    }
                    var tn = params[i].getTypeName();
                    if (tn != null) {
                        if (tns == null) {
                            buffer.append(" : ");
                        }
                        buffer.append(tn.m_lexem);
                    }
                    var len = params[i].getLength();
                    if (len != null) {
                        buffer.append("(").append(len.m_lexem);
                    }
                    var dec = params[i].getDecimals();
                    if (dec != null) {
                        buffer.append(",").append(dec.m_lexem);
                    }
                    if (len != null || dec != null) {
                        buffer.append(")");
                    }
                    // add comments after parameter
                    this.addCommentsAfterNodeInternal(params[i],buffer);
                    if (i < params.length - 1) {
                        buffer.append(",\r\n");
                    }
                    else {
                        buffer.append("\r\n");
                    }
                }
            }
        };

        SourceRenderer.prototype.addCommentsAfterNodeInternal = function(node,buffer) {
            var starti = node.getStartTokenIndex();
            var endi = node.getEndTokenIndexWithComments();
            var cu = SourceRangeImpl.getCompilationUnit(node);
            var tokens = cu.getTokenList();
            for (var i = starti;i <= endi;i++) {
                if (rnd.Category.CAT_COMMENT == tokens[i].m_category) {
                    buffer.append(" ").append(tokens[i].m_lexem);
                }
            }
        };

        SourceRenderer.prototype.renderViewInternal = function(viewDef,buffer) {
            // pre annotations
            var annots = viewDef.getAnnotationList();
            this.renderAnnotationListInternal(annots,buffer);
            // define view
            buffer.append("define ");
            buffer.append("view ");

            // view name
            buffer.append(viewDef.getName());

            var params = viewDef.getParameters();
            if (params == null || params.length == 0) {
                buffer.append(" ");
            }
            this.renderParamsInternal(params,buffer);

            // selects
            buffer.append("as select from ");

            var select = viewDef.getSelect();
            if (select == null) {
                var selectSet = viewDef.getSelectSet();
                //union
                throw new Error("not supported");
            }else {
                this.renderSingleSelectInternal(select, buffer);
            }

            // select list

            // where clause

            // group by  clause

            // having

            // ... (something missing?)
        };

        return SourceRenderer;
    }
);