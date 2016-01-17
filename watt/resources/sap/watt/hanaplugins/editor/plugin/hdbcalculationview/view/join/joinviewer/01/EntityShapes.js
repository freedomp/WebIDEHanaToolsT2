/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// Globals
var HEADER_HEIGHT = 30;
var ELEMENT_HEIGHT = 25;

// Globals, strictly not used outside
var __MAIN_SVG_CONTAINER;

// Global function to give valid ui ID


function getValidUiId(id) {
    return id.replace(/\./g, "46"); // Ascii value of . is 46
}

// Global function to check if point lies within boundary


function isPointInBoundary(point, boundary) {
    if (point !== undefined && point !== null && boundary !== undefined && boundary !== null) {
        return (point.x >= boundary.left && point.x <= boundary.right && point.y >= boundary.top && point.y <= boundary.bottom);
    } else {
        return false;
    }
}

// @class Canvas
// @param container: id of the container which would hold the table shapes
// @param model: Root model. refer ...
var Canvas = function(container, rootModel) {
    this.model = rootModel;
    this.entityShapes = [];
    this.joinShapes = [];
    this.canJoinListeners = [];
    this.selectionListeners = [];
    this.tip;
    this.typeOfShape = {
        ENTITY_SHAPE: "EntityShape",
        ELEMENT_SHAPE: "ElementShape",
        JOIN_SHAPE: "JoinShape"
    };
    this.events = {
        CAN_JOIN: "CanJoin",
        SELECTION: "Selection"
    };
    var that = this;

    //tooltip
    // Define 'div' for tooltips
    this.tip = d3.select("#" + container)
        .append("div") // declare the tooltip div 
    .attr("class", "tooltip") // apply the 'tooltip' class
    .style("opacity", 0); // set the opacity to nil

    var parentDiv = d3.select("#" + container);

    // Create EntityShapes
    this.model.entities.forEach(function(entity) {
        var entityShape = new EntityShape(that, entity);
        that.entityShapes.push(entityShape);
    });

    // Utility method to get EntityShape for given entity ID	
    this.getEntityShapeForId = function(entityId) {
        var esMatched;
        this.entityShapes.forEach(function(es) {
            if (entityId === es.model.id) {
                esMatched = es;
            }
        });
        return esMatched;
    };


    this.getShapeForId = function(type, id) {
        var shape;
        if (id !== undefined && id !== null && type !== undefined && type !== null) {
            switch (type) {
                case this.typeOfShape.ENTITY_SHAPE:
                    shape = this.getEntityShapeForId(id);
                    break;
                case this.typeOfShape.ELEMENT_SHAPE:
                    for (var i = 0; i < that.entityShapes.length; i++) {
                        var es = that.entityShapes[i];
                        shape = es.getElementShapeForId(id);
                        if (shape !== undefined && shape !== null) {
                            break;
                        }
                    }
                    break;
                case this.typeOfShape.JOIN_SHAPE:
                    for (var j = 0; j < that.joinShapes.length; j++) {
                        var js = that.joinShapes[j];
                        for (var c = 0; c < js.model.columns.length; c++) {
                            if (id === js.model.columns[c].id) {
                                shape = js;
                                break;
                            }
                        }
                        if (shape !== undefined && shape !== null) {
                            break;
                        }
                    }
                    break;
            }
        }
        return shape;
    };

    this.getEntityAtPoint = function(point) {
        // Checking this from reverse - 
        // when two entities have overlaping area the one drawn later is on top;
        // so thie method has to return the one on top
        for (var idx = that.entityShapes.length - 1; idx >= 0; idx--) {
            var entityBoundary = that.entityShapes[idx].getBoundary();
            if (isPointInBoundary(point, entityBoundary)) {
                return that.entityShapes[idx];
            }
        }
        return null;
    };

    //Create JoinShapes
    this.model.joins.forEach(function(join) {
        var joinShape = new JoinShape(that, join);
        that.joinShapes.push(joinShape);
    });

    this.draw = function() {
        var svgContainer = parentDiv.append("svg:svg")
            .attr("id", "svgContainer")
            .attr("width", "100%")
            .attr("height", "100%")
            .on("click", function() {
                //if click point not contained within any shape, then deselect selection
                if (d3.event.target.tagName === "svg") {
                    d3.select(".selected").classed("selected", false);
                }
                this.selectionListeners.forEach(function(listener) {
                    listener(that.model);
                });
            });
        //.call(that.tip);

        __MAIN_SVG_CONTAINER = svgContainer;

        // Draw entities
        svgContainer.selectAll(".entity").data(this.model.entities)
        .enter().append("svg:g").attr("id", function(entity) {
            return getValidUiId("ENTITY_" + entity.id);
        }).attr("class", "entity").each(function(entity) {
            // Rest of the things are done in draw of EntityShape
            var entityShape = that.getEntityShapeForId(entity.id);
            entityShape.draw();
        });

        // Draw Joins
        this.joinShapes.forEach(function(joinShape) {
            joinShape.svgContainer = svgContainer;
            joinShape.draw();
        });
    };

     this.remove = function(modelObject) {
        if (modelObject !== undefined && modelObject !== null) {
            var shape = this.getShapeForId(modelObject.id);
            
        }
    };

    this.addListener = function(event, listener) {
        if (event !== undefined && event !== null && listener !== undefined && listener !== null) {
            switch (event) {
                case this.events.CAN_JOIN:
                    {
                        this.canJoinListeners.push(listener);
                    }
                    break;
                case this.events.SELECTION:
                    {
                        this.selectionListeners.push(listener);
                    }
                    break;
            }
        }
    };

    this.removeListener = function(event, listener) {
        if (event !== undefined && event !== null && listener !== undefined && listener !== null) {
            switch (event) {
                case this.events.CAN_JOIN:
                    {
                        for (var i = this.canJoinListeners.length - 1; i >= 0; i--) {
                            if (this.canJoinListeners[i] === listener) {
                                this.canJoinListeners.splice(i, 1);
                            }
                        }
                    }
                    break;
                case this.events.SELECTION:
                    {
                        for (var i = this.selectionListeners.length - 1; i >= 0; i--) {
                            if (this.selectionListeners[i] === listener) {
                                this.selectionListeners.splice(i, 1);
                            }
                        }
                    }
                    break;
            }
        }
    };

    this.__fireSelection = function(shape, modelObject) {
        //https://github.com/mbostock/d3/wiki/Drag-Behavior#on
        //if (d3.event.defaultPrevented) return;
        //console.log("click");
        d3.select(".selected").classed("selected", false);
        d3.select(shape).classed("selected", true);
        this.selectionListeners.forEach(function(listener) {
            listener(modelObject);
        });
    };

    this.__getCanJoinListeners = function() {
        return this.canJoinListeners;
    };

    this.__getToolTipHtml = function(model) {
        if (model.title !== undefined && model.title !== null) {
            return '<span><b>Name:</b>&nbsp' + model.title + '</span>';
        } else if (model.text !== undefined && model.text !== null) {
            var html = '<span><b>Name:</b>&nbsp' + model.text + '</span>';
            if (model.dataType !== undefined && model.dataType !== null) {
                if (model.dataType.type !== undefined && model.dataType.type !== null) {
                    html += '<br><span><b>Data Type:</b>&nbsp' + model.dataType.type + '</span>';
                }
                if (model.dataType.length !== undefined && model.dataType.length !== null) {
                    html += '<br><span><b>Length:</b>&nbsp' + model.dataType.length + '</span>';
                }
                if (model.dataType.scale !== undefined && model.dataType.scale !== null) {
                    html += '<br><span><b>Scale:</b>&nbsp' + model.dataType.scale + '</span>';
                }
            }
            return html;
        }
    };

    this.__showTooltip = function(d, shape) {
        //if (d3.event.defaultPrevented) return;
        if (shape !== undefined && shape !== null) {
            shape.style.setProperty("cursor", "default");
        }
        if (d !== null && d !== undefined) {
            that.tip.transition()
                .duration(100)
                .style("opacity", 0);
            that.tip.transition()
                .duration(200)
                .style("opacity", 0.9);
            that.tip.html(that.__getToolTipHtml(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }
    };

    this.__hideTooltip = function(d, shape) {
        //if (d3.event.defaultPrevented) return;
        that.tip.transition()
            .duration(500)
            .style("opacity", 0);
        if (shape !== undefined && shape !== null) {
            shape.style.setProperty("cursor", "default");
        }
    };

    // Get model updated object
    this.getModel = function() {
        var cloneModel = {
            entities: [],
            joins: []
        };

        // update trans in entities
        for (var idx = 0; idx < that.entityShapes.length; idx++) {
            var cloneEntity = that.entityShapes[idx].__getModel();
            cloneModel.entities.push(cloneEntity);
        }

        // get Joins with uptodate details
        for (idx = 0; idx < that.joinShapes.length; idx++) {
            var cloneJoin = that.joinShapes[idx].__getModel();
            cloneModel.joins.push(cloneJoin);
        }
        return cloneModel;
    };
};

// @class EntityShape
var EntityShape = function(parent, entityModel) {
    this.model = entityModel;
    this.parent = parent;
    this.elementShapes = [];

    var entityShape;
    var trans = {
        x: 0,
        y: 0
    };
    var headerShape;

    var arrElements = this.model.elements;
    var that = this;

    Object.defineProperty(this, 'left', {
        get: function() {
            return this.model.layout.x + trans.x;
        }
    });

    Object.defineProperty(this, 'top', {
        get: function() {
            return this.model.layout.y + trans.y;
        }
    });

    Object.defineProperty(this, 'right', {
        get: function() {
            return this.left + this.model.layout.width;
        }
    });

    Object.defineProperty(this, 'bottom', {
        get: function() {
            return this.top + HEADER_HEIGHT + ELEMENT_HEIGHT * this.model.elements.length;
        }
    });

    this.getBoundary = function() {
        return {
            "left": that.left,
            "top": that.top,
            "right": that.right,
            "bottom": that.bottom
        };
    };

    this.getElementAtPoint = function(point) {
        for (var idx = 0; idx < that.elementShapes.length; idx++) {
            var elementBoundary = that.elementShapes[idx].getBoundary();
            if (isPointInBoundary(point, elementBoundary)) {
                return that.elementShapes[idx];
            }
        }
        return null;
    };

    for (var i = 0; i < arrElements.length; i++) {
        var elementShape = new ElementShape(this, arrElements[i]);
        elementShape.order = i;
        this.elementShapes.push(elementShape);
    }

    // Utility method to get EntityShape for given entity ID	
    this.getElementShapeForId = function(elementId) {
        var esMatched;
        this.elementShapes.forEach(function(es) {
            if (elementId === es.model.id) {
                esMatched = es;
            }
        });
        return esMatched;
    };

    this.draw = function() {
        entityShape = d3.select("#" + getValidUiId("ENTITY_" + this.model.id));

        headerShape = entityShape.append("svg:g");
        headerShape.append("svg:rect")
            .attr("x", this.model.layout.x)
            .attr("y", this.model.layout.y)
            .attr("width", this.model.layout.width)
            .attr("height", HEADER_HEIGHT)
            .attr("class", "entityheader");

        // Header image if supplied
        headerShape.append("svg:image")
            .attr("xlink:href", this.model.iconPath)
            .attr("x", this.model.layout.x + 5)
            .attr("y", this.model.layout.y + 5)
            .attr("width", HEADER_HEIGHT - 10)
            .attr("height", HEADER_HEIGHT - 10);


        // Header text to show Entity Name
        headerShape.append("svg:text")
            .attr("x", this.model.layout.x + HEADER_HEIGHT)
            .attr("y", this.model.layout.y + 25)
            .attr("width", this.model.layout.width)
            .attr("height", HEADER_HEIGHT)
            .attr("class", "entityheadertext")
            .text(this.model.title);


        // Add drag behavior to header
        var dragBehavior = d3.behavior.drag().origin(function() {
            return {
                x: trans.x,
                y: trans.y
            };
        }).on("drag", drag)
            .on("dragstart", function(d) {
                // d3.event.sourceEvent.stopPropagation(); 
            });
        headerShape.call(dragBehavior);

        // Create the element container and delegate draw
        entityShape.selectAll(".element").data(this.model.elements).enter().append("svg:g").attr("id", function(element) {
            return getValidUiId("ELEMENT_" + element.id);
        }).attr("class", "element").each(function(element) {
            // Rest of the things are done in draw of ElementShape
            var elementShape = that.getElementShapeForId(element.id);
            elementShape.draw();
        });
        /*.on("click", function() {
            that.parent.__fireSelection(this, this.model);
        });*/

        headerShape.on("click", function() {
            that.parent.__fireSelection(this.parentElement, this.model);
        })
        /*.on('mouseover', function(d) {
            that.parent.__showTooltip(d, this);
        })
        .on('mouseout', function(d) {
            that.parent.__hideTooltip(d, this);
        })*/
        ;
    };

    // Drag listener registry
    this.dragListeners = [];
    var drag = function(d) {
        trans.x = d3.event.x;
        trans.y = d3.event.y;

        entityShape.selectAll("g").attr("transform", "translate(" + trans.x + ", " + trans.y + ")");

        // Call the drag listeners so attached shapes adjust themselves
        if (that.dragListeners !== undefined) {
            that.dragListeners.forEach(function(dragListener) {
                dragListener(trans);
            });
        }
    };

    this.__getModel = function() {
        var cloneModel = JSON.parse(JSON.stringify(that.model));
        cloneModel.layout.x += trans.x;
        cloneModel.layout.y += trans.y;
        return cloneModel;
    };
};

// @class ElementShape
var ElementShape = function(parent, elementModel) {
    this.model = elementModel;
    this.parent = parent;
    var elementShape;
    var that = this;

    this.getClosestJoinAnchor = function(referencePoint) {
        var anchors = getJoinAnchors();
        // Check rp is closure to left or right anchor
        if (Math.abs(referencePoint.x - that.left) < Math.abs(referencePoint.x - that.right)) {
            return anchors.left;
        } else {
            return anchors.right;
        }
    };

    Object.defineProperty(this, '__trans', {
        get: function() {
            return getTrans();
        }
    });

    function getTrans() {
        var trans = {
            x: 0,
            y: 0
        };
        if (elementShape) {
            var strTransform = elementShape.attr("transform");
            if (strTransform) {
                var strFromTranslate = strTransform.substring(strTransform.indexOf("translate") + 10);
                var endIndex = strFromTranslate.indexOf(")");
                var strTranslate = strFromTranslate.substring(0, endIndex);
                var arrFragments = strTranslate.split(",");
                trans.x = parseFloat(arrFragments[0]);
                trans.y = parseFloat(arrFragments[1]);
            }
        }
        return trans;
    }

    // Get join anchors (coordinates).
    // There will be two anchors; one on left and the second one on right


    function getJoinAnchors() {
        var anchors = {};
        var leftAnchor = {
            "x": that.left,
            "y": that.top + ELEMENT_HEIGHT / 2
        };
        anchors.left = leftAnchor;

        var rightAnchor = {
            "x": that.left + that.parent.model.layout.width,
            "y": that.top + ELEMENT_HEIGHT / 2
        };
        anchors.right = rightAnchor;
        return anchors;
    }

    Object.defineProperty(this, 'left', {
        get: function() {
            return this.parent.model.layout.x + getTrans().x;
        }
    });

    Object.defineProperty(this, 'top', {
        get: function() {
            return this.parent.model.layout.y + HEADER_HEIGHT + that.order * ELEMENT_HEIGHT + getTrans().y;
        }
    });

    Object.defineProperty(this, 'right', {
        get: function() {
            return this.left + this.parent.model.layout.width;
        }
    });

    Object.defineProperty(this, 'bottom', {
        get: function() {
            return this.top + ELEMENT_HEIGHT;
        }
    });

    this.getBoundary = function() {
        return {
            "left": that.left,
            "top": that.top,
            "right": that.right,
            "bottom": that.bottom
        };
    };

    this.draw = function() {
        elementShape = d3.select("#" + getValidUiId("ELEMENT_" + this.model.id));

        // Add drag behavior to element
        var dragBehavior = d3.behavior.drag()
            .on("drag", drag)
            .on("dragend", drop)
            .on('dragstart', function() {
                //https://github.com/mbostock/d3/wiki/Drag-Behavior#on
                //d3.event.sourceEvent.stopPropagation();
                //console.log("drag start");
            });

        // Create the rectangle
        //that.top = that.parent.model.layout.y + HEADER_HEIGHT + that.order * ELEMENT_HEIGHT;
        elementShape.append("svg:rect")
            .attr("x", that.left)
            .attr("y", that.top)
            .attr("width", that.parent.model.layout.width)
            .attr("height", ELEMENT_HEIGHT)
            .attr("class", "element")
            .call(dragBehavior)
            .on("click", function() {
                that.parent.parent.__fireSelection(this, this.model);
            })
        /*.on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            })*/
        ;

        // Show icon for data type
        elementShape.append("svg:image")
            .attr("xlink:href", function(element) {
                if (element.dataType && element.dataType.type) {
                    if (element.dataType.type === "decimal" || element.dataType.type === "integer") {
                        return "Number.png";
                    } else if (element.dataType.type === "varchar") {
                        return "Text.gif";
                    } else {
                        return null;
                    }
                } else {
                    // return some generic type
                    return null;
                }
            }).attr("x", this.parent.model.layout.x + 5)
            .attr("y", this.parent.model.layout.y + HEADER_HEIGHT + that.order * ELEMENT_HEIGHT + 5)
            .attr("width", ELEMENT_HEIGHT - 10)
            .attr("height", ELEMENT_HEIGHT - 10)
            .on("click", function() {
                that.parent.parent.__fireSelection(this.parentElement, this.model);
            })
        /*.on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            })*/
        ;

        // Show Text
        elementShape.append("svg:text")
            .attr("x", this.parent.model.layout.x + ELEMENT_HEIGHT)
            .attr("y", this.parent.model.layout.y + HEADER_HEIGHT + that.order * ELEMENT_HEIGHT + 20)
            .attr("width", this.parent.model.layout.width)
            .attr("height", ELEMENT_HEIGHT)
            .attr("class", "elementtext")
            .text(this.model.text)
            .on("click", function() {
                that.parent.parent.__fireSelection(this.parentElement, this.model);
            })
        /*.on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            })*/
        ;
    };

    var tmpJoinLine;
    var endPoint;

    function drag(d) {
        //console.log("drag");
        // Draw temporary join line
        endPoint = {
            "x": d3.event.x,
            "y": d3.event.y
        };
        endPoint.x += getTrans().x;
        endPoint.y += getTrans().y;
        //console.log("epx: " + endPoint.x + " epy: " + endPoint.y);
        if (tmpJoinLine === undefined || tmpJoinLine === null) {
            var startPoint = that.getClosestJoinAnchor(endPoint);
            //console.log("spx: " + startPoint.x + " spy: " + startPoint.y);
            tmpJoinLine = __MAIN_SVG_CONTAINER.append("svg:line")
                .attr("x1", startPoint.x)
                .attr("y1", startPoint.y)
                .attr("x2", endPoint.x)
                .attr("y2", endPoint.y)
                .attr("class", "joinline");
        } else {
            tmpJoinLine.attr("x2", endPoint.x).attr("y2", endPoint.y);
        }
    }

    function drop(d) {
        //console.log("drop");
        var dropPoint = endPoint;
        // Identify the Entity at drop area
        var entityShape = that.parent.parent.getEntityAtPoint(dropPoint);
        if (entityShape !== null && entityShape !== that.parent) {
            // Identity the Element at drop area
            var elementShape = entityShape.getElementAtPoint(dropPoint);
            if (elementShape !== null) {
                // Correct join line end point
                var anc = elementShape.getClosestJoinAnchor(dropPoint);
                tmpJoinLine.attr("x2", anc.x)
                    .attr("y2", anc.y)
                    .on("click", function() {
                        that.parent.parent.__fireSelection(this, this.model);
                    });

                // Check if already join exists
                var existingJoin;
                for (var ji = 0; ji < that.parent.parent.joinShapes.length; ji++) {
                    if (that.parent.parent.joinShapes[ji].isBetweenEntityShapes(that.parent, entityShape)) {
                        existingJoin = that.parent.parent.joinShapes[ji];
                        break;
                    }
                }
                //if element join exists, don't create again
                var canCreate = true;
                var columns = existingJoin.model.columns;
                for (var col = 0; col < columns.length; col++) {
                    if (columns[col].leftColumn === that.model.id && columns[col].rightColumn === elementShape.model.id) {
                        canCreate = false;
                        break;
                    }
                }
                canCreate = canCreate && __callCanJoinListeners(that.model, elementShape.model);
                if (canCreate) { // For existing only add new join column
                    if (existingJoin !== undefined && existingJoin !== null) {
                        existingJoin.addJoinColumn(that, elementShape, tmpJoinLine);
                    } else {

                        // Create real join and remove the temp line
                        var joinModel = {};
                        joinModel.leftEntity = that.parent.model;
                        joinModel.rightEntity = elementShape.model;
                        joinModel.columns = {};

                        var joinShape = new JoinShape(that.parent.parent);
                    }
                } else {
                    // Drop area is not valid; Delete the temp join line
                    if (tmpJoinLine !== undefined && tmpJoinLine !== null)
                        tmpJoinLine.remove();
                }
            } else {
                // Drop area is not valid; Delete the temp join line
                if (tmpJoinLine !== undefined && tmpJoinLine !== null)
                    tmpJoinLine.remove();
            }
        } else {
            // Drop area is not valid; Delete the temp join line
            if (tmpJoinLine !== undefined && tmpJoinLine !== null)
                tmpJoinLine.remove();
        }
        tmpJoinLine = null;
    }

    __callCanJoinListeners = function(leftElement, rightElement) {
        var canCreate = true;
        var listeners = that.parent.parent.__getCanJoinListeners();
        listeners.forEach(function(listener) {
            canCreate = canCreate && listener(leftElement, rightElement);
        });
        return canCreate;
    };
};

// @class JoinShape
var JoinShape = function(parent, joinModel) {
    this.parent = parent;
    this.model = joinModel;
    for (var c = 0; c < this.model.columns.length; c++) {
        var col = this.model.columns[c];
        col.id = col.leftColumn + "_" + col.rightColumn;
    }
    var joinLineObjects = [];
    var leftEntityShape;
    var rightEntityShape;
    var joinColumnShapeObjects = [];

    var that = this;
    this.draw = function() {
        // Remember the required shapes
        leftEntityShape = this.parent.getEntityShapeForId(this.model.leftEntity);
        rightEntityShape = this.parent.getEntityShapeForId(this.model.rightEntity);

        this.model.columns.forEach(function(joinColumnObject) {
            var joinColumnShapeObject = {};
            if (joinColumnObject !== undefined) {
                if (joinColumnObject.leftColumn !== undefined) {
                    joinColumnShapeObject.leftColumnShape = leftEntityShape.getElementShapeForId(joinColumnObject.leftColumn);
                }
                if (joinColumnObject.rightColumn !== undefined) {
                    joinColumnShapeObject.rightColumnShape = rightEntityShape.getElementShapeForId(joinColumnObject.rightColumn);
                }
            }
            joinColumnShapeObjects.push(joinColumnShapeObject);

            var joinData = {
                sourceElement: joinColumnShapeObject.leftColumnShape,
                targetElement: joinColumnShapeObject.rightColumnShape
            };

            // Draw the line
            var joinLineObj = {};
            joinLineObj.data = joinData;
            var id = "line_" + joinColumnObject.id;
            joinLineObj.line = that.svgContainer
                .append("svg:line")
                .attr("id", id)
                .attr("data-model-id", joinColumnObject.id)
                .attr("data-model-leftColumn", joinColumnObject.leftColumn)
                .attr("data-model-rightColumn", joinColumnObject.rightColumn)
                .attr("x1", joinLineObj.x1 = leftEntityShape.model.layout.x + leftEntityShape.model.layout.width)
                .attr("y1", joinLineObj.y1 = joinColumnShapeObject.leftColumnShape.top + ELEMENT_HEIGHT / 2)
                .attr("x2", joinLineObj.x2 = rightEntityShape.model.layout.x)
                .attr("y2", joinLineObj.y2 = joinColumnShapeObject.rightColumnShape.top + ELEMENT_HEIGHT / 2)
                .attr("class", "joinline")
                .on("click", function(d) {
                    that.parent.__fireSelection(this, model);
                });
            joinLineObjects.push(joinLineObj);
            d3.select("#" + id).data(joinColumnObject).enter();
        });

        // Register drag listeners for the entities
        leftEntityShape.dragListeners.push(function(trans) {
            if (trans !== undefined && joinLineObjects !== undefined) {
                joinLineObjects.forEach(function(joinLineObj) {
                    if (trans.x !== undefined && trans.x !== 0) {
                        if (joinLineObj.data.sourceElement.parent === leftEntityShape) {
                            joinLineObj.line.attr("x1", joinLineObj.x1 + trans.x);
                        } else {
                            joinLineObj.line.attr("x2", joinLineObj.x2 + trans.x);
                        }
                    }
                    if (trans.y !== undefined && trans.y !== 0) {
                        if (joinLineObj.data.sourceElement.parent === leftEntityShape) {
                            joinLineObj.line.attr("y1", joinLineObj.y1 + trans.y);
                        } else {
                            joinLineObj.line.attr("y2", joinLineObj.y2 + trans.y);
                        }
                    }
                });
            }
        });
        rightEntityShape.dragListeners.push(function(trans) {
            if (trans !== undefined && joinLineObjects !== undefined) {
                joinLineObjects.forEach(function(joinLineObj) {
                    if (trans.x !== undefined && trans.x !== 0) {
                        if (joinLineObj.data.targetElement.parent === rightEntityShape) {
                            joinLineObj.line.attr("x2", joinLineObj.x2 + trans.x);
                        } else {
                            joinLineObj.line.attr("x1", joinLineObj.x1 + trans.x);
                        }
                    }
                    if (trans.y !== undefined && trans.y !== 0) {
                        if (joinLineObj.data.targetElement.parent === rightEntityShape) {
                            joinLineObj.line.attr("y2", joinLineObj.y2 + trans.y);
                        } else {
                            joinLineObj.line.attr("y1", joinLineObj.y1 + trans.y);
                        }
                    }
                });
            }
        });
    };

    this.addJoinColumn = function(es1, es2, jl) {
        // Determine left and right
        var les, res;
        les = es1;
        res = es2;

        // Update model
        var joinColumn = {
            "id": les.model.id + "_" + res.model.id,
            "leftColumn": les.model.id,
            "rightColumn": res.model.id
        };
        jl.attr("id", "line_" + joinColumn.id);
        that.model.columns.push(joinColumn);

        // Update ui model
        var joinColumnShapeObject = {
            "leftColumnShape": les,
            "rightColumnShape": res
        };
        joinColumnShapeObjects.push(joinColumnShapeObject);

        var joinData = {
            "sourceElement": les,
            "targetElement": res
        };
        // Update join line
        var joinLineObj = {
            "line": jl,
            "data": joinData,
            "x1": parseFloat(jl.attr("x1")) - les.__trans.x,
            "y1": parseFloat(jl.attr("y1")) - les.__trans.y,
            "x2": parseFloat(jl.attr("x2")) - res.__trans.x,
            "y2": parseFloat(jl.attr("y2")) - res.__trans.y
        };
        joinLineObjects.push(joinLineObj);
    };

    this.isBetweenEntityShapes = function(e1, e2) {
        return (leftEntityShape === e1 && rightEntityShape === e2) || (leftEntityShape === e2 && rightEntityShape === e1);
    };

    this.__getModel = function() {
        var cloneModel = JSON.parse(JSON.stringify(that.model));
        return cloneModel;
    };
};
