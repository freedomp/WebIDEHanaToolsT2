(function() {
    "use strict";

    // =======================================================================
    // import and declare packages
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter');
    var module = sap.ushell.renderers.fiori2.search.SearchTabStripsFormatter = {};

    // =======================================================================
    // tree node
    // =======================================================================

    module.Node = function() {
        this.init.apply(this, arguments);
    };

    module.Node.prototype = {

        init: function(dataSource, count) {
            this.dataSource = dataSource;
            this.children = [];
            this.parent = null;
            this.count = count;
        },

        _arraysEqual: function(a, b) {
            if (a === b) {
                return true;
            }
            if (a == null || b == null) {
                return false;
            }
            if (a.length != b.length) {
                return false;
            }

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        },

        equals: function(otherNode) {
            var parentsEqual = false;
            var eq = this.dataSource.equals(otherNode.dataSource) &&
                this.count === otherNode.count &&
                this._arraysEqual(this.children, otherNode.children);
            if (this.parent) {
                if (otherNode.parent) {
                    parentsEqual = this.parent.equals(otherNode.parent);
                } else {
                    parentsEqual = false;
                }
            } else {
                if (otherNode.parent) {
                    parentsEqual = false;
                } else {
                    parentsEqual = true;
                }
            }
            return eq && parentsEqual;
        },

        setCount: function(count) {
            this.count = count;
        },

        childrenHaveUpToDateCount: function() {
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                if (child.count === null) {
                    return false;
                }
            }
            return true;
        },

        invalidateCount: function() {
            this.count = null;
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                child.invalidateCount();
            }
        },

        getChildrenSortedByCount: function() {
            if (!this.childrenHaveUpToDateCount()) {
                throw 'Count invalidated - cannot sort';
            }
            var children = this.children.slice();
            children.sort(function(c1, c2) {
                return c2.count - c1.count;
            });
            return children;
        },

        clearChildren: function() {
            this.children = [];
        },

        appendNode: function(node) {
            node.parent = this;
            this.children.push(node);
        },

        removeChildNode: function(node) {
            var index = this.children.indexOf(node);
            if (index < 0) {
                return;
            }
            this.children.splice(index, 1);
        },

        findNode: function(dataSource, result) {
            if (this.dataSource.equals(dataSource)) {
                result.push(this);
                return;
            }
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                child.findNode(dataSource, result);
                if (result.length > 0) {
                    return;
                }
            }
        },

        hasChild: function(node) {
            for (var i = 0; i < this.children.length; ++i) {
                var child = this.children[i];
                if (child === node) {
                    return true;
                }
            }
            return false;
        },


        hasSibling: function(node) {
            if (this.equals(node)) {
                // self
                return false;
            }
            if (!this.parent) {
                return null;
            }
            for (var i = 0; i < this.parent.children.length; ++i) {
                var child = this.parent.children[i];
                if (child === node) {
                    return true;
                }
            }
            return false;
        },

        getLevel1Node: function() {
            if (!this.parent) {
                return null;
            }
            if (this.parent.dataSource.key && this.parent.dataSource.key.indexOf('$$ALL$$') > -1) {
                return this;
            }
            return this.parent.getLevel1Node();
        }

    };

    // =======================================================================
    // tree
    // =======================================================================
    module.Tree = function() {
        this.init.apply(this, arguments);
    };

    module.Tree.prototype = {

        init: function() {
            this.rootNode = null;
        },

        findNode: function(dataSource) {
            if (!this.rootNode) {
                return null;
            }
            var result = [];
            this.rootNode.findNode(dataSource, result);
            return result.length > 0 ? result[0] : null;
        },

        hasChild: function(ds1, ds2) {
            if (ds2 && ds2.key && ds2.key.indexOf('$$ALL$$') > -1) {
                return false;
            }
            var node1 = this.findNode(ds1);
            if (!node1) {
                //throw 'No node for datasource ' + ds1.toString();
                return false;
            }
            var node2 = this.findNode(ds2);
            if (!node2) {
                //throw 'No node for datasource ' + ds2.toString();
                return false;
            }
            return node1.hasChild(node2);
        },

        hasSibling: function(ds1, ds2) {
            if (ds2 && ds2.key && ds2.key.indexOf('$$ALL$$') > -1) {
                return false;
            }
            var node1 = this.findNode(ds1);
            if (!node1) {
                //throw 'No node for datasource ' + ds1.toString();
                return false;
            }
            var node2 = this.findNode(ds2);
            if (!node2) {
                //throw 'No node for datasource ' + ds2.toString();
                return false;
            }
            return node1.hasSibling(node2);
        },

        updateFromPerspective: function(dataSource, perspective, model) {

            // no tree -> create tree using current datasource
            if (!this.rootNode) {
                this.rootNode = new module.Node(dataSource, null);
            }

            // update current tree node
            var currentCount = null;
            try {
                currentCount = perspective.getSearchFacet().getQuery().getResultSetSync().totalcount;
            } catch (e) {
                // do nothing
            }
            var currentNode = this.findNode(dataSource);
            if (!currentNode) {
                // node not found -> create new tree
                this.rootNode = new module.Node(dataSource, currentCount);
                currentNode = this.rootNode;
            } else {
                currentNode.setCount(currentCount);
            }

            // update child datasources
            this.updateFromPerspectiveChildDataSources(currentNode, perspective);

            // update app tree node
            this.updateAppTreeNode(dataSource, model);

        },

        updateAppTreeNode: function(dataSource, model) {

            // update only if root node = all
            if (!this.rootNode.dataSource.equals(model.allDataSource)) {
                return;
            }

            // update only for all or app datasource
            if (!dataSource.equals(model.allDataSource) && !dataSource.equals(model.appDataSource)) {
                return;
            }

            // remove old appNode
            var appCount = model.getProperty('/appCount');
            var appNode = this.findNode(model.appDataSource);
            if (appNode) {
                this.rootNode.removeChildNode(appNode);
            }

            // no apps -> return
            if (appCount === 0) {
                return;
            }

            // insert new app node
            appNode = new module.Node(model.appDataSource, appCount);
            if (!this.rootNode.childrenHaveUpToDateCount()) {
                this.rootNode.clearChildren();
            }
            this.rootNode.appendNode(appNode);

        },

        updateFromPerspectiveChildDataSources: function(currentNode, perspective) {

            // extract child datasources from perspective
            if (!perspective) {
                return;
            }
            var facets = perspective.getChartFacets();
            if (facets.length === 0) {
                return;
            }
            var dataSourceFacet = facets[0];
            if (dataSourceFacet.facetType !== 'datasource') {
                return;
            }
            var childDataSourceElements = dataSourceFacet.getQuery().getResultSetSync().getElements();

            // append children to tree node
            currentNode.clearChildren();
            for (var i = 0; i < childDataSourceElements.length; ++i) {
                var childDataSourceElement = childDataSourceElements[i];
                currentNode.appendNode(new module.Node(childDataSourceElement.dataSource, childDataSourceElement.valueRaw));
            }

        }
    };

    // =======================================================================
    // formatter
    // =======================================================================
    module.Formatter = function() {
        this.init.apply(this, arguments);
    };

    module.Formatter.prototype = {

        init: function() {
            this.tree = new module.Tree();
        },

        format: function(dataSource, perspective, model) {
            this.tree.updateFromPerspective(dataSource, perspective, model);
            var tabStrips = this.generateTabStrips(dataSource, model);
            return tabStrips;
        },

        invalidateCount: function() {
            if (!this.tree.rootNode) {
                return;
            }
            this.tree.rootNode.invalidateCount();
        },

        generateTabStrips: function(dataSource, model) {
            /* eslint no-lonely-if:0 */

            // init
            var tabStripLimit = 9999;
            var i, child, children;
            var tabStrips = {
                strips: [],
                selected: null
            };
            var node = this.tree.findNode(dataSource);

            // 1) no node in tree -> show ALL+ current datasource (should never happen)
            if (!node) {
                if (!dataSource.equals(model.allDataSource)) {
                    tabStrips.strips.push(model.allDataSource);
                }
                tabStrips.strips.push(dataSource);
                tabStrips.selected = dataSource;
                return tabStrips;
            }

            // 2) node is $$ALL$$ -> show $$ALL$$ + children of $$ALL$$
            if (node.dataSource.equals(model.allDataSource)) {
                tabStrips.strips.push(model.allDataSource);
                if (node.childrenHaveUpToDateCount()) {
                    children = node.getChildrenSortedByCount();
                    for (i = 0; i < children.length && tabStrips.strips.length < tabStripLimit; ++i) {
                        child = children[i];
                        tabStrips.strips.push(child.dataSource);
                    }
                }
                tabStrips.selected = model.allDataSource;
                return tabStrips;
            }

            // 3) node is direct child of $$ALL$$ -> show $$ALL$$ + children of $$ALL$$
            if (node.parent && node.parent.dataSource.equals(model.allDataSource)) {
                tabStrips.strips.push(model.allDataSource);
                if (node.parent.childrenHaveUpToDateCount()) {

                    // limit number of tabstrips but ensure that selected
                    // node is included
                    var includesNode = false;
                    children = node.parent.getChildrenSortedByCount();
                    for (i = 0; i < children.length; ++i) {
                        child = children[i];
                        if (includesNode) {
                            if (tabStrips.strips.length >= tabStripLimit) {
                                break;
                            }
                            tabStrips.strips.push(child.dataSource);
                        } else {
                            if (tabStrips.strips.length < tabStripLimit - 1 || node === child) {
                                tabStrips.strips.push(child.dataSource);
                                if (node === child) {
                                    includesNode = true;
                                }
                            }
                        }
                    }

                } else {
                    tabStrips.strips.push(node.dataSource);
                }
                tabStrips.selected = node.dataSource;
                return tabStrips;
            }

            // 4) node not direct child of $$ALL$$ or unknown whether node is direct child of $$ALL$$
            // -> show $$ALL$$ + node
            tabStrips.strips.push(model.allDataSource);
            tabStrips.strips.push(node.dataSource);
            tabStrips.selected = node.dataSource;
            return tabStrips;

        }
    };

})();
