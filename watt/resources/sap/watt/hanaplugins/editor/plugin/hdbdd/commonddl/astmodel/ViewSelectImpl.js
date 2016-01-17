// based on commit
//befacfd49184d0b5debe89d5078bc32e1abe40e0 CDS: Fix NPE
/*eslint-disable max-statements*/
define(
    ["rndrt/rnd", "commonddl/astmodel/SourceRangeImpl", "commonddl/astmodel/JoinDataSourceImpl",
        "commonddl/astmodel/EObjectContainmentEList", "require", "commonddl/astmodel/SelectImpl"], //dependencies
    function (rnd, SourceRangeImpl, JoinDataSourceImpl, EObjectContainmentEList, require, SelectImpl) {
        var Utils = rnd.Utils;
        var StringBuffer = rnd.StringBuffer;
        function ViewSelectImpl() {
            SelectImpl.call(this);
        }
        ViewSelectImpl.prototype = Object.create(SelectImpl.prototype);
        ViewSelectImpl.prototype.selectList = null;
        ViewSelectImpl.prototype.from = null;
        ViewSelectImpl.prototype.associations = null;
        ViewSelectImpl.prototype.where = null;
        ViewSelectImpl.prototype.groupBy = null;
        ViewSelectImpl.prototype.having = null;
        ViewSelectImpl.prototype.union = null;
        ViewSelectImpl.UNION_ALL_EDEFAULT = false;
        ViewSelectImpl.prototype.unionAll = ViewSelectImpl.UNION_ALL_EDEFAULT;
        ViewSelectImpl.UNION_TYPE_EDEFAULT = null;
        ViewSelectImpl.prototype.dataSources = null;
        ViewSelectImpl.NAME_EDEFAULT = null;
        ViewSelectImpl.prototype.name = ViewSelectImpl.NAME_EDEFAULT;
        ViewSelectImpl.UNION_TOKEN_EDEFAULT = null;
        ViewSelectImpl.prototype.unionToken = ViewSelectImpl.UNION_TOKEN_EDEFAULT;
        ViewSelectImpl.ALL_TOKEN_EDEFAULT = null;
        ViewSelectImpl.prototype.allToken = ViewSelectImpl.ALL_TOKEN_EDEFAULT;
        ViewSelectImpl.prototype.constructor = ViewSelectImpl;
        ViewSelectImpl.prototype.getSelectList = function () {
            return this.selectList;
        };
        ViewSelectImpl.prototype.basicSetSelectList = function (newSelectList, msgs) {
            var oldSelectList = this.selectList;
            this.selectList = newSelectList;
            this.selectList.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setSelectList = function (newSelectList) {
            if (newSelectList !== this.selectList) {
                this.basicSetSelectList(newSelectList);
            }
        };
        ViewSelectImpl.prototype.getFrom = function () {
            return this.from;
        };
        ViewSelectImpl.prototype.basicSetFrom = function (newFrom, msgs) {
            var oldFrom = this.from;
            this.from = newFrom;
            this.from.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setFrom = function (newFrom) {
            if (newFrom !== this.from) {
                this.basicSetFrom(newFrom);
            }
        };
        ViewSelectImpl.prototype.getAssociations = function () {
            /*eslint-disable no-eq-null*/
            if (this.associations == null) {
                this.associations = new EObjectContainmentEList(this);
            }
            return this.associations;
        };
        ViewSelectImpl.prototype.getWhere = function () {
            return this.where;
        };
        ViewSelectImpl.prototype.basicSetWhere = function (newWhere, msgs) {
            var oldWhere = this.where;
            this.where = newWhere;
            this.where.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setWhere = function (newWhere) {
            if (newWhere !== this.where) {
                this.basicSetWhere(newWhere);
            }
        };
        ViewSelectImpl.prototype.getGroupBy = function () {
            return this.groupBy;
        };
        ViewSelectImpl.prototype.basicSetGroupBy = function (newGroupBy, msgs) {
            var oldGroupBy = this.groupBy;
            this.groupBy = newGroupBy;
            this.groupBy.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setGroupBy = function (newGroupBy) {
            if (newGroupBy !== this.groupBy) {
                this.basicSetGroupBy(newGroupBy);
            }
        };
        ViewSelectImpl.prototype.getHaving = function () {
            return this.having;
        };
        ViewSelectImpl.prototype.basicSetHaving = function (newHaving, msgs) {
            var oldHaving = this.having;
            this.having = newHaving;
            this.having.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setHaving = function (newHaving) {
            if (newHaving !== this.having) {
                this.basicSetHaving(newHaving);
            }
        };
        ViewSelectImpl.prototype.getUnion = function () {
            return this.union;
        };
        ViewSelectImpl.prototype.basicSetUnion = function (newUnion, msgs) {
            var oldUnion = this.union;
            this.union = newUnion;
            this.union.setContainer(this);
            return msgs;
        };
        ViewSelectImpl.prototype.setUnion = function (newUnion) {
            if (newUnion !== this.union) {
                this.basicSetUnion(newUnion);
            }
        };
        ViewSelectImpl.prototype.isUnionAll = function () {
            return this.unionAll;
        };
        ViewSelectImpl.prototype.setUnionAll = function (newUnionAll) {
            var oldUnionAll = this.unionAll;
            this.unionAll = newUnionAll;
        };
        ViewSelectImpl.prototype.getDataSources = function () {
            /*eslint-disable no-eq-null*/
            if (this.dataSources == null) {
                this.dataSources = [];
                var ds = this.getFrom();
                ViewSelectImpl.getAllFlatDataSources(ds, this.dataSources);
                this.getAllAssocDataSources(this.dataSources);
            }
            return this.dataSources;
        };
        ViewSelectImpl.prototype.getName = function () {
            try {
                var root = this.getViewDefinition(this);
                var un = root.isSingleSelect();
                var names = root.getNames();
                /*eslint-disable no-eq-null*/
                if (names != null && names.getNames().length === 0) {
                    names = null;
                }
                /*eslint-disable no-eq-null*/
                if (un === true && names == null) {
                    var nameToken = root.getNameToken();
                    return nameToken.m_lexem;
                } else {
                    var index = root.getSelects().indexOf(this);
                    index = index + 1;
                    return "Result Set " + index;
                }
            }
            catch (e) { //eslint-disable-line no-empty
            }
            return null;
        };
        ViewSelectImpl.prototype.getUnionType = function () {
            if (this.eContainer() instanceof ViewSelectImpl) {
                var parent = this.eContainer();
                return parent.isUnionAll() ? "union all" : "union";
            }
            return "";
        };
        ViewSelectImpl.prototype.getFromDataSource = function () {
            var from = this.getFrom();
            /*eslint-disable no-eq-null*/
            if ((from != null) && from.isPrimary()) {
                return from;
            }
            if (from instanceof JoinDataSourceImpl) {
                var leftJoin = from;
                /*eslint-disable no-constant-condition*/
                while (true) {
                    var next = leftJoin.getLeft();
                    if (next instanceof JoinDataSourceImpl) {
                        leftJoin = next;
                    } else {
                        return next;
                    }
                }
            }
            return null;
        };
        ViewSelectImpl.prototype.getUnionToken = function () {
            return this.unionToken;
        };
        ViewSelectImpl.prototype.setUnionToken = function (newUnionToken) {
            var oldUnionToken = this.unionToken;
            this.unionToken = newUnionToken;
        };
        ViewSelectImpl.prototype.getAllToken = function () {
            return this.allToken;
        };
        ViewSelectImpl.prototype.setAllToken = function (newAllToken) {
            var oldAllToken = this.allToken;
            this.allToken = newAllToken;
        };
        ViewSelectImpl.prototype.getAllLocalContents = function () {
            var result = [];
            this.getAllLocalContentsRecursively(result, this);
            return result;
        };

        ViewSelectImpl.prototype.getAllLocalContentsRecursively = function (result, obj) {
            if (Utils.arrayContains(result, obj)) {
                return; //ensure no endless loop
            }

            if (obj instanceof ViewSelectImpl) {
                var union = obj.getUnion();
                /*eslint-disable no-eq-null*/
                if (union != null) {
                    var children = obj.eContents();
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (union !== child) {
                            this.getAllLocalContentsRecursively(result, child);
                        }
                    }
                    return;
                }
            }

            result.push(obj);
            var o = obj.eContents();
            /*eslint-disable no-redeclare*/
            for (var i = 0; i < o.length; i++) {
                this.getAllLocalContentsRecursively(result, o[i]);
            }
        };

        ViewSelectImpl.prototype.recomputeUncertainCachedValues = function () {

        };
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }
        ViewSelectImpl.prototype.isComputingExpressionColumns = false;
        ViewSelectImpl.prototype.computeAllExpressionColumns = function () {
            if (this.isComputingExpressionColumns) {
                return;
            }
            this.isComputingExpressionColumns = true;
            try {
                var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
                var localContents = this.getAllLocalContents();
                for (var i = 0; i < localContents.length; i++) {
                    var subObj = localContents[i];
                    if (subObj instanceof PathExpressionImpl) {
                        (subObj).getDataSourceColumn();
                    }
                }
            }
            catch (e) {
                Console.log(e.stack);
            }
            this.isComputingExpressionColumns = false;
        };
        ViewSelectImpl.prototype.isComputingExpressionAssociations = false;
        ViewSelectImpl.prototype.computeAllExpressionAssociations = function () {
            if (this.isComputingExpressionAssociations) {
                return;
            }
            this.isComputingExpressionAssociations = true;
            try {
                var PathExpressionImpl = require("commonddl/astmodel/PathExpressionImpl");
                var contents = this.getAllLocalContents();
                for (var i = 0; i < contents.length; i++) {
                    var subObj = contents[i];
                    if (subObj instanceof PathExpressionImpl) {
                        (subObj).getDataSourceAssociation();
                    }
                }
            }
            catch (e) {
                Console.log(e.stack);
            }
            this.isComputingExpressionAssociations = false;
        };
        ViewSelectImpl.prototype.getViewDefinition = function (select) {
            var ViewDefinitionImpl = require("commonddl/astmodel/ViewDefinitionImpl");
            var parent = select;
            while (!(parent instanceof ViewDefinitionImpl)) {
                parent = parent.eContainer();
                /*eslint-disable no-eq-null*/
                if (parent == null) {
                    return null;
                }
            }
            return parent;
        };
        ViewSelectImpl.prototype.getAllDataSourcesWithoutAssociations = function () {
            var result = [];
            var ds = this.getFrom();
            ViewSelectImpl.getAllFlatDataSources(ds, result);
            return result;
        };
        ViewSelectImpl.getAllFlatDataSources = function (ds, list) {
            if (!(ds instanceof JoinDataSourceImpl)) {
                /*eslint-disable no-eq-null*/
                if (ds != null) {
                    list.push(ds);
                }
            }
            if (ds instanceof JoinDataSourceImpl) {
                var join = ds;
                var left = join.getLeft();
                ViewSelectImpl.getAllFlatDataSources(left, list);
                var right = join.getRight();
                ViewSelectImpl.getAllFlatDataSources(right, list);
            }
        };
        ViewSelectImpl.prototype.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList = function () {
            var result = [];
            var from = this.getFrom();
            if (!(from instanceof JoinDataSourceImpl)) {
                /*eslint-disable no-eq-null*/
                if (from != null) {
                    result.push(from);
                }
            }
            if (from instanceof JoinDataSourceImpl) {
                this.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2(from, result);
            }
            return result;
        };
        ViewSelectImpl.prototype.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2 = function (ds, result) {
            if (ds instanceof JoinDataSourceImpl) {
                var join = ds;
                result.push(join);
                this.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2(join.getLeft(), result);
                this.getAllDataSourcesIncludingJoinsWithoutAssociationsAsFlatList2(join.getRight(), result);
            } else {
                /*eslint-disable no-eq-null*/
                if (ds != null) {
                    result.push(ds);
                }
            }
        };
        ViewSelectImpl.prototype.getAllAssocDataSources = function (list) {
            var assocs = this.getAssociations();
            for (var assocCount = 0; assocCount < assocs.length; assocCount++) {
                var assoc = assocs[assocCount];
                var targetDataSource = assoc.getTargetDataSource();
                /*eslint-disable no-eq-null*/
                if (targetDataSource != null) {
                    list.push(targetDataSource);
                }
            }
        };
        ViewSelectImpl.prototype.isDistinct = function () {
            throw new Error();
        };
        ViewSelectImpl.prototype.toString = function () {
            var result = new StringBuffer(SelectImpl.prototype.toString.call(this));
            result.append(" (unionAll: ");
            result.append(this.unionAll);
            result.append(", name: ");
            result.append(this.name);
            result.append(", unionToken: ");
            result.append(this.unionToken);
            result.append(", allToken: ");
            result.append(this.allToken);
            result.append(")");
            return result.toString();
        };
        return ViewSelectImpl;
    }
);