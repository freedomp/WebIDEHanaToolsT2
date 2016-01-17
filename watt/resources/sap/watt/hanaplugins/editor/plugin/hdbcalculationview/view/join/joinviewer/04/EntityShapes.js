/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// Globals
var HEADER_HEIGHT = 30;
var ELEMENT_HEIGHT = 25;
var LINE_ID = "line_";
var ENTITY_ID = "ENTITY_";
var ELEMENT_ID = "ELEMENT_";
var canvasCount = 1;

var MIN_WIDTH = 500,
    MIN_HEIGHT = 500,
    BUFFER_AREA = 50;


// Globals, strictly not used outside

// Global function to give valid ui ID
function generateCanvasId() {
    var prefix = "svgContainer";
    var id = prefix;
    while (document.getElementById(id) !== null) {
        id = prefix + (canvasCount++);
    }
    return id;
}

function getValidUiId(id) {
    id = id.replace(/\./g, "46"); // Ascii value of . is 46
    return id.replace(/\//g, "47"); // Ascii value of / is 47
}

function removeItemFromList(list, item) {
    if (item !== undefined && item !== null && list !== undefined && list !== null) {
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] === item) {
                list.splice(i, 1);
            }
        }
    }
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
var Canvas = function(container, rootModel, imagePathProvider) {
    this.model = rootModel;
    this.entityShapes = [];
    this.joinShapes = [];
    this.canJoinListeners = [];
    this.joinCreatedListeners = [];
    this.selectionListeners = [];
    this.tip;
    this.canvasId;
    this.svgContainer;
    this.typeOfShape = {
        ENTITY_SHAPE: "EntityShape",
        ELEMENT_SHAPE: "ElementShape",
        JOIN_SHAPE: "JoinShape",
        NONE: "None" // canvas area
    };
    this.events = {
        CAN_JOIN: "CanJoin",
        JOIN_CREATED: "JoinCreated",
        SELECTION: "Selection",
    };
    var that = this;

    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };

    // Utility method to get EntityShape for given entity ID	
    this.__getEntityShapeForId = function(entityId) {
        var esMatched;
        this.entityShapes.forEach(function(es) {
            if (entityId === es.model.id) {
                esMatched = es;
            }
        });
        return esMatched;
    };

    this.__getCanvasId = function() {
        if (!this.canvasId) {
            this.canvasId = generateCanvasId();
        }
        return this.canvasId;
    };

    this.__getJoinId = function(id) {
        return LINE_ID + id + this.__getCanvasId();
    };

    this.__getEntityId = function(id) {
        return getValidUiId(ENTITY_ID + id) + this.__getCanvasId();
    };

    this.__getElementId = function(id) {
        return getValidUiId(ELEMENT_ID + id) + this.__getCanvasId();
    };

    this.__getShapeForId = function(type, id) {
        var shape;
        if (id !== undefined && id !== null && type !== undefined && type !== null) {
            switch (type) {
                case this.typeOfShape.ENTITY_SHAPE:
                    shape = this.__getEntityShapeForId(id);
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

    this.__getSvgWidth = function(divWidth) {
        var width = MIN_WIDTH;
        if (that.entityShapes !== undefined && that.entityShapes !== null && that.entityShapes.length > 0) {
            for (var es = 0; es < that.entityShapes.length; es++) {
                var shape = that.entityShapes[es];
                if (width < shape.right) {
                    width = shape.right + BUFFER_AREA;
                }
            }
        }
        if (divWidth !== undefined && divWidth !== null)
            return Math.max(width, divWidth);
        else return width;
    };

    this.__getSvgHeight = function(divHeight) {
        var height = MIN_HEIGHT;
        if (that.entityShapes !== undefined && that.entityShapes !== null && that.entityShapes.length > 0) {
            for (var es = 0; es < that.entityShapes.length; es++) {
                var shape = that.entityShapes[es];
                if (height < shape.bottom) {
                    height = shape.bottom + BUFFER_AREA;
                }
            }
        }
        if (divHeight !== undefined && divHeight !== null)
            return Math.max(height, divHeight);
        else return height;
    };

    this.__resetSvgDimensions = function(width, height) {
        // var width = that.__getSvgWidth($("#" + container).width());
        //var height = that.__getSvgHeight($("#" + container).height());

        if ($("#" + container).width() < width) {
            $("#" + container).css({
                overflowX: "scroll"
            });
        } else {
            $("#" + container).css({
                overflowX: "hidden"
            });
        }

        if ($("#" + container).height() < height) {
            $("#" + container).css({
                overflowY: "scroll"
            });
        } else {
            $("#" + container).css({
                overflowY: "hidden"
            });
        }
        $("#" + this.__getCanvasId()).css({
            "width": width.toString(),
            "height": height.toString()
        });

    };

    this.__getSvgContainer = function() {
        return this.svgContainer;
    };

    this.draw = function() {
        var parentDiv = d3.select("#" + container);
        //tooltip
        // Define 'div' for tooltips
        this.tip = parentDiv
            .append("div") // declare the tooltip div 
        .attr("class", "tooltip") // apply the 'tooltip' class
        .style("opacity", 0); // set the opacity to nil


        // Create EntityShapes
        this.model.entities.forEach(function(entity) {
            var entityShape = new EntityShape(that, entity, imagePathProvider);
            entityShape.dragListeners.push(that.__entityDragListener);
            that.entityShapes.push(entityShape);
        });

        //Create JoinShapes
        this.model.joins.forEach(function(join) {
            var joinShape = new JoinShape(that, join);
            that.joinShapes.push(joinShape);
        });

        this.svgContainer = parentDiv.append("svg:svg")
            .attr("id", this.__getCanvasId())
            .on("click", function() {
                //if click point not contained within any shape, then deselect selection
                if (d3.event.target.tagName === "svg") {
                    d3.select(".selected").classed("selected", false);
                    that.selectionListeners.forEach(function(listener) {
                        var eventInfo = {
                            data: that.model,
                            typeOfShapeSelected: that.typeOfShape.NONE
                        };
                        listener(eventInfo);
                    });
                }
            });

        that.__resetSvgDimensions(that.__getSvgWidth($("#" + container).width()), that.__getSvgHeight($("#" + container).height()));
        //that.__resetSvgDimensions();
        // Draw entities
        this.svgContainer.selectAll(".entity").data(this.model.entities)
            .enter().append("svg:g").attr("id", function(entity) {
                return that.__getEntityId(entity.id);
            }).attr("class", "entity").each(function(entity) {
                // Rest of the things are done in draw of EntityShape
                var entityShape = that.__getEntityShapeForId(entity.id);
                entityShape.draw();
            });

        // Draw Joins
        this.joinShapes.forEach(function(joinShape) {
            joinShape.svgContainer = this.svgContainer;
            joinShape.draw();
        });
    };

    this.redraw = function() {
        this.dispose();
        this.draw();
    };

    this.remove = function(type, modelObject) {
        if (modelObject !== undefined && modelObject !== null && type !== undefined && type !== null) {
            var shape = this.__getShapeForId(type, modelObject.id);
            var rem;
            switch (type) {
                case this.typeOfShape.JOIN_SHAPE:
                    for (var c = 0; c < shape.model.columns.length; c++) {
                        if (modelObject.id === shape.model.columns[c].id) {
                            rem = shape.model.columns[c];
                            break;
                        }
                    }
                    if (rem !== undefined && rem !== null) {
                        d3.select("#" + this.__getJoinId(rem.id)).remove();
                        removeItemFromList(shape.model.columns, rem);
                    }
                    if (shape.model.columns.length === 0) {
                        removeItemFromList(this.joinShapes, shape);
                    }
                    break;
                case this.typeOfShape.ELEMENT_SHAPE:
                    throw "Unsupported operation";
                case this.typeOfShape.ENTITY_SHAPE:
                    throw "Unsupported operation";
            }
        }
    };

    this.addListener = function(event, listener) {
        if (event !== undefined && event !== null && listener !== undefined && listener !== null) {
            switch (event) {
                case this.events.CAN_JOIN:
                    this.canJoinListeners.push(listener);
                    break;
                case this.events.JOIN_CREATED:
                    this.joinCreatedListeners.push(listener);
                    break;
                case this.events.SELECTION:
                    this.selectionListeners.push(listener);
                    break;
            }
        }
    };

    this.removeListener = function(event, listener) {
        if (event !== undefined && event !== null && listener !== undefined && listener !== null) {
            switch (event) {
                case this.events.CAN_JOIN:
                    for (var i = this.canJoinListeners.length - 1; i >= 0; i--) {
                        removeItemFromList(this.canJoinListeners, listener);
                    }
                    break;
                case this.events.JOIN_CREATED:
                    for (var i = this.joinCreatedListeners.length - 1; i >= 0; i--) {
                        removeItemFromList(this.joinCreatedListeners, listener);
                    }
                    break;
                case this.events.SELECTION:
                    for (var i = this.selectionListeners.length - 1; i >= 0; i--) {
                        removeItemFromList(this.selectionListeners, listener);
                    }
                    break;
            }
        }
    };

    this.dispose = function() {
        $("#" + container).empty();
        this.entityShapes = [];
        this.joinShapes = [];
        this.canJoinListeners = [];
        this.joinCreatedListeners = [];
        this.selectionListeners = [];
    };

    this.__entityDragListener = function(trans, entityShape) {
        var curWidth = $("#" + this.__getCanvasId()).width();
        var curHeight = $("#" + this.__getCanvasId()).height();
        if (entityShape.right > curWidth && entityShape.bottom > curHeight) {
            that.__resetSvgDimensions(entityShape.right + BUFFER_AREA, entityShape.bottom + BUFFER_AREA);
        } else if (entityShape.right > curWidth && entityShape.bottom < curHeight) {
            that.__resetSvgDimensions(entityShape.right + BUFFER_AREA, curHeight);
        } else if (entityShape.right < curWidth && entityShape.bottom > curHeight) {
            that.__resetSvgDimensions(curWidth, entityShape.bottom + BUFFER_AREA);
        }
    };

    this.__fireSelection = function(type, shape, modelObject) {
        //https://github.com/mbostock/d3/wiki/Drag-Behavior#on
        //if (d3.event.defaultPrevented) return;
        //console.log("click");
        d3.select(".selected").classed("selected", false);
        d3.select(shape).classed("selected", true);
        if (type !== undefined && type !== null) {
            var eventInfo = {
                data: modelObject,
                typeOfShapeSelected: type
            };
            this.selectionListeners.forEach(function(listener) {
                listener(eventInfo);
            });
        }
    };

    this.__getCanJoinListeners = function() {
        return this.canJoinListeners;
    };

    this.__getJoinCreatedListeners = function() {
        return this.joinCreatedListeners;
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
var EntityShape = function(parent, entityModel, imagePathProvider) {
    this.model = entityModel;
    this.parent = parent;
    this.elementShapes = [];
    // Drag listener registry
    this.dragListeners = [];

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
        var elementShape = new ElementShape(this, arrElements[i], imagePathProvider);
        elementShape.order = i;
        this.elementShapes.push(elementShape);
    }

    // Utility method to get ElementShape for given entity ID	
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
        entityShape = d3.select("#" + this.parent.__getEntityId(this.model.id));

        headerShape = entityShape.append("svg:g");
        headerShape.append("svg:rect")
            .attr("x", this.model.layout.x)
            .attr("y", this.model.layout.y)
            .attr("width", this.model.layout.width)
            .attr("height", HEADER_HEIGHT)
            .attr("class", "entityheader");

        // Header image if supplied
        if (imagePathProvider !== null && imagePathProvider !== undefined) {
            headerShape.append("svg:image")
                .attr("xlink:href", imagePathProvider(parent.typeOfShape.ENTITY_SHAPE, this.model))
                .attr("x", this.model.layout.x + 5)
                .attr("y", this.model.layout.y + 5)
                .attr("width", HEADER_HEIGHT - 10)
                .attr("height", HEADER_HEIGHT - 10);
        }


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
            .on("dragend", function(d) {
                // d3.event.sourceEvent.stopPropagation(); 
                //console.log();
            });
        //headerShape.call(dragBehavior);

        // Create the element container and delegate draw
        entityShape.selectAll(".element").data(this.model.elements).enter().append("svg:g").attr("id", function(element) {
            return that.parent.__getElementId(element.id);
        }).attr("class", "element").each(function(element) {
            // Rest of the things are done in draw of ElementShape
            var elementShape = that.getElementShapeForId(element.id);
            elementShape.draw();
        });
        /*.on("click", function() {
            that.parent.__fireSelection(this, this.model);
        });*/

        headerShape.on("click", function() {
            that.parent.__fireSelection(parent.typeOfShape.ENTITY_SHAPE, this.parentElement, this.model);
        })
        /*.on('mouseover', function(d) {
            that.parent.__showTooltip(d, this);
        })
        .on('mouseout', function(d) {
            that.parent.__hideTooltip(d, this);
        })*/
        ;
    };

    var drag = function(d) {
        if ((that.parent.__getEntityShapeForId(d.id).left > 0 && that.parent.__getEntityShapeForId(d.id).top > 0) ||
            (that.parent.__getEntityShapeForId(d.id).left - trans.x + d3.event.x > 0 && that.parent.__getEntityShapeForId(d.id).top - trans.y + d3.event.y > 0)) {
            trans.x = d3.event.x;
            trans.y = d3.event.y;

            entityShape.selectAll("g").attr("transform", "translate(" + trans.x + ", " + trans.y + ")");
            var sel = d3.select(this.parentElement);
            sel.moveToFront();

            // Call the drag listeners so attached shapes adjust themselves
            if (that.dragListeners !== undefined) {
                that.dragListeners.forEach(function(dragListener) {
                    dragListener(trans, that);
                });
            }
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
var ElementShape = function(parent, elementModel, imagePathProvider) {
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
        elementShape = d3.select("#" + this.parent.parent.__getElementId(this.model.id));

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
                that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this, this.model);
            })
        /*.on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            })*/
        ;

        // Show icon for data type
        if (imagePathProvider !== null && imagePathProvider !== undefined) {
            elementShape.append("svg:image")
                .attr("xlink:href", imagePathProvider(this.parent.parent.typeOfShape.ELEMENT_SHAPE, this.model)).attr("x", this.parent.model.layout.x + 5)
                .attr("y", this.parent.model.layout.y + HEADER_HEIGHT + that.order * ELEMENT_HEIGHT + 5)
                .attr("width", ELEMENT_HEIGHT - 10)
                .attr("height", ELEMENT_HEIGHT - 10)
                .on("click", function() {
                    that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this.parentElement, this.model);
                });
        }
        /*.on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            })*/

        // Show Text
        elementShape.append("svg:text")
            .attr("x", this.parent.model.layout.x + ELEMENT_HEIGHT)
            .attr("y", this.parent.model.layout.y + HEADER_HEIGHT + that.order * ELEMENT_HEIGHT + 20)
            .attr("width", this.parent.model.layout.width)
            .attr("height", ELEMENT_HEIGHT)
            .attr("class", "elementtext")
            .text(this.model.text)
            .on("click", function() {
                that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this.parentElement, this.model);
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
    var startPoint;
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
            startPoint = that.getClosestJoinAnchor(endPoint);
            //console.log("spx: " + startPoint.x + " spy: " + startPoint.y);
            tmpJoinLine = that.parent.parent.__getSvgContainer().append("svg:line")
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
                        var id = $("#" + this.id).data('id');
                        var model = that.parent.parent.__getShapeForId(that.parent.parent.typeOfShape.JOIN_SHAPE, id).getJoinLineModel(id);
                        that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.JOIN_SHAPE, this, model);
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
                if (existingJoin !== undefined && existingJoin !== null) {
                    var columns = existingJoin.model.columns;
                    for (var col = 0; col < columns.length; col++) {
                        if (columns[col].leftColumn === that.model.id && columns[col].rightColumn === elementShape.model.id) {
                            canCreate = false;
                            break;
                        }
                    }
                }
                canCreate = canCreate && __callCanJoinListeners(that.model, elementShape.model);
                if (canCreate) { // For existing only add new join column
                    if (existingJoin !== undefined && existingJoin !== null) {
                        existingJoin.addJoinColumn(that, elementShape, tmpJoinLine);
                    } else {

                        // Create real join and remove the temp line
                        var joinModel = {
                            leftEntity: that.parent.model.id,
                            rightEntity: entityShape.model.id,
                            columns: [{
                                id: that.model.id + "_" + elementShape.model.id,
                                leftColumn: that.model.id,
                                rightColumn: elementShape.model.id
                            }]
                        };

                        that.parent.parent.model.joins.push(joinModel);
                        var joinShape = new JoinShape(that.parent.parent, joinModel);
                        that.parent.parent.joinShapes.push(joinShape);
                        if (tmpJoinLine !== undefined && tmpJoinLine !== null)
                            tmpJoinLine.remove();
                        joinShape.draw(startPoint, anc);
                    }
                    __callJoinCreatedListeners(that.model, elementShape.model);
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

    __callCanJoinListeners = function(sourceElement, targetElement) {
        var canCreate = true;
        var listeners = that.parent.parent.__getCanJoinListeners();
        listeners.forEach(function(listener) {
            canCreate = canCreate && listener(sourceElement, targetElement);
        });
        return canCreate;
    };

    __callJoinCreatedListeners = function(sourceElement, targetElement) {
        that.parent.parent.__getJoinCreatedListeners().forEach(function(listener) {
            listener(sourceElement, targetElement);
        });
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
    this.draw = function(startPoint, endPoint) {
        // Remember the required shapes
        leftEntityShape = this.parent.__getEntityShapeForId(this.model.leftEntity);
        rightEntityShape = this.parent.__getEntityShapeForId(this.model.rightEntity);

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
            var id = that.parent.__getJoinId(joinColumnObject.id);
            joinLineObj.line = that.parent.__getSvgContainer()
                .append("svg:line")
                .attr("id", id)
                .attr("data-id", joinColumnObject.id)
            /* .attr("data-leftColumn", joinColumnObject.leftColumn)
                .attr("data-rightColumn", joinColumnObject.rightColumn)*/
            .attr("x1", function() {
                if (startPoint !== undefined && startPoint !== null) {
                    joinLineObj.x1 = startPoint.x;
                } else {
                    joinLineObj.x1 = leftEntityShape.model.layout.x + leftEntityShape.model.layout.width;
                }
                return joinLineObj.x1;
            })
                .attr("y1", function() {
                    if (startPoint !== undefined && startPoint !== null) {
                        joinLineObj.y1 = startPoint.y;
                    } else {
                        joinLineObj.y1 = joinColumnShapeObject.leftColumnShape.top + ELEMENT_HEIGHT / 2;
                    }
                    return joinLineObj.y1;
                })
                .attr("x2", function() {
                    if (endPoint !== undefined && endPoint !== null) {
                        joinLineObj.x2 = endPoint.x;
                    } else {
                        joinLineObj.x2 = rightEntityShape.model.layout.x;
                    }
                    return joinLineObj.x2;
                })
                .attr("y2", function() {
                    if (endPoint !== undefined && endPoint !== null) {
                        joinLineObj.y2 = endPoint.y;
                    } else {
                        joinLineObj.y2 = joinColumnShapeObject.rightColumnShape.top + ELEMENT_HEIGHT / 2;
                    }
                    return joinLineObj.y2;
                })
                .attr("class", "joinline")
                .on("click", function(d) {
                    var model = that.getJoinLineModel($("#" + this.id).data('id'));
                    /* "leftColumn" : $("#" + this.id).data('leftColumn'),
                        "rightColumn" : $("#" + this.id).data('rightColumn')*/
                    that.parent.__fireSelection(that.parent.typeOfShape.JOIN_SHAPE, this, model);
                });
            joinLineObjects.push(joinLineObj);
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

    this.getJoinLineModel = function(id) {
        for (var c = 0; c < this.model.columns.length; c++) {
            var col = this.model.columns[c];
            if (col.id === id) {
                return col;
            }
        }
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
        jl.attr("id", this.parent.__getJoinId(joinColumn.id))
            .attr("data-id", joinColumn.id);
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
