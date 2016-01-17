/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// Globals
CanvasGlobals = {
    HEADER_HEIGHT: 30,
    ELEMENT_HEIGHT: 25,
    SCREEN_OFFSET_Y: 0,
    LINE_ID: "LINE_",
    ENTITY_ID: "ENTITY_",
    ELEMENT_ID: "ELEMENT_",
    canvasCount: 1,
    MIN_CANVAS_WIDTH: 500,
    MIN_CANVAS_HEIGHT: 500,
    BUFFER_AREA: 50,
    TEXT_CHAR_LENGTH: 25
};

// Global function 
function generateCanvasId() {
    var prefix = "svgContainer";
    var id = prefix;
    while (document.getElementById(id) !== null) {
        id = prefix + (CanvasGlobals.canvasCount++);
    }
    return id;
}

// Global function to give valid ui ID
function getValidUiId(id) {
    id = id.replace(/\W/g, '_'); // replace all none word characters with underscore, i.e, all non [A-Z a-z 0-9 _]
    return id;
    //id = id.replace(/\./g, "46"); // Ascii value of . is 46
    //return id.replace(/\//g, "47"); // Ascii value of / is 47
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

var ContextMenuOption = {
    id: "",
    imagePath: "",
    text: "",
    enable: true,
    actionHandler: "",
    data: {
        //anything required to be passed to the actionHandler
    }
};

// @class Canvas
// @param container: id of the container which would hold the table shapes
// @param model: Root model. refer ...
var Canvas = function(container, rootModel, imagePathProvider, contextMenuProvider) {
    this.model = rootModel;
    this.entityShapes = [];
    this.joinShapes = [];
    this.canJoinListeners = [];
    this.joinCreatedListeners = [];
    this.selectionListeners = [];
    this.tip;
    this.contextMenu;
    this.canvasId;
    this.svgContainer;
    this.typeOfShape = {
        ENTITY_SHAPE: "EntityShape",
        ELEMENT_SHAPE: "ElementShape",
        JOIN_SHAPE: "JoinShape",
        NONE: "None" // canvas area
    };
    this.selectedObject = {
        typeOfShapeSelected: this.typeOfShape.NONE,
        data: ""
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

    this.__getElementShapeForId = function(id) {
        var shape;
        for (var i = 0; i < that.entityShapes.length; i++) {
            var es = that.entityShapes[i];
            shape = es.getElementShapeForId(id);
            if (shape !== undefined && shape !== null) {
                break;
            }
        }
        return shape;
    };

    this.__getJoinShapeForId = function(id) {
        var shape;
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
        return shape;
    };

    this.__getCanvasId = function() {
        if (!this.canvasId) {
            this.canvasId = generateCanvasId();
        }
        return this.canvasId;
    };

    this.__getJoinId = function(id) {
        return CanvasGlobals.LINE_ID + id + this.__getCanvasId();
    };

    this.__getEntityId = function(id) {
        return getValidUiId(CanvasGlobals.ENTITY_ID + id) + this.__getCanvasId();
    };

    this.__getElementId = function(id) {
        return getValidUiId(CanvasGlobals.ELEMENT_ID + id) + this.__getCanvasId();
    };

    this.__getShapeForId = function(type, id) {
        var shape;
        if (id !== undefined && id !== null && type !== undefined && type !== null) {
            switch (type) {
                case this.typeOfShape.ENTITY_SHAPE:
                    shape = this.__getEntityShapeForId(id);
                    break;
                case this.typeOfShape.ELEMENT_SHAPE:
                    shape = this.__getElementShapeForId(id);
                    break;
                case this.typeOfShape.JOIN_SHAPE:
                    shape = this.__getJoinShapeForId(id);
                    break;
            }
        } else if (id !== undefined && id !== null && type === null) {
            shape = this.__getEntityShapeForId(id);
            if (shape === undefined) {
                shape = this.__getElementShapeForId(id);
            }
            if (shape === undefined) {
                shape = this.__getJoinShapeForId(id);
            }
        }
        return shape;
    };

    this.__getShapeType = function(shape) {
        if (shape instanceof EntityShape) {
            return this.typeOfShape.ENTITY_SHAPE;
        } else if (shape instanceof ElementShape) {
            return this.typeOfShape.ELEMENT_SHAPE;
        } else if (shape instanceof JoinShape) {
            return this.typeOfShape.JOIN_SHAPE;
        } else {
            return this.typeOfShape.NONE;
        }
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
        var width = CanvasGlobals.MIN_CANVAS_WIDTH;
        if (that.entityShapes !== undefined && that.entityShapes !== null && that.entityShapes.length > 0) {
            for (var es = 0; es < that.entityShapes.length; es++) {
                var shape = that.entityShapes[es];
                if (width < shape.right) {
                    width = shape.right + CanvasGlobals.BUFFER_AREA;
                }
            }
        }
        if (divWidth !== undefined && divWidth !== null)
            return Math.max(width, divWidth);
        else return width;
    };

    this.__getSvgHeight = function(divHeight) {
        var height = CanvasGlobals.MIN_CANVAS_HEIGHT;
        if (that.entityShapes !== undefined && that.entityShapes !== null && that.entityShapes.length > 0) {
            for (var es = 0; es < that.entityShapes.length; es++) {
                var shape = that.entityShapes[es];
                if (height < shape.bottom) {
                    height = shape.bottom + CanvasGlobals.BUFFER_AREA;
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
        $(parentDiv.node()).empty();
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
                        that.selectedObject.typeOfShapeSelected = that.typeOfShape.NONE;
                        that.selectedObject.data = that.model;
                        /*var eventInfo = {
                            data: that.model,
                            typeOfShapeSelected: that.typeOfShape.NONE
                        };*/
                        listener(that.selectedObject);
                    });
                }
                that.__hideContextMenu();
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


        /* this need not be there if tooltip div has pointer-events:none
        this.tip.on('contextmenu', function() {
            d3.event.preventDefault();
            var element = that.svgContainer.node();
            var evt = element.ownerDocument.createEvent('MouseEvents');

            //event.initMouseEvent(type, canBubble, cancelable, view,  detail, screenX, screenY, clientX, clientY,  ctrlKey, altKey, shiftKey, metaKey,  button, relatedTarget);
            evt.initMouseEvent('contextmenu', d3.event.bubbles, d3.event.cancelable,
                element.ownerDocument.defaultView, d3.event.detail, d3.event.screenX,
                d3.event.screenY, d3.event.clientX, d3.event.clientY, d3.event.ctrlKey,
                d3.event.altKey, d3.event.shiftKey, d3.event.metaKey, d3.event.button, null);

            if (document.createEventObject) {
                // dispatch for IE
                return element.fireEvent('onclick', evt);
            } else {
                // dispatch for firefox + others
                return !element.dispatchEvent(evt);
            }
        });*/

        //context menu
        this.svgContainer.on('contextmenu', function() {
            d3.event.preventDefault();
            var target = d3.event.target;
            while (target.id === "") {
                target = target.parentElement;
            }
            var data = d3.select("#" + target.id).data()[0];
            var shape;
            if (data === undefined) {
                var node = d3.select("#" + target.id)[0][0];
                if (node.tagName === "line") {
                    var id = $("#" + target.id).data('id');
                    shape = that.__getShapeForId(that.typeOfShape.JOIN_SHAPE, id);
                    data = shape.getJoinLineModel(id);
                } else {
                    shape = that;
                    data = that.model;
                }
            } else {
                shape = that.__getShapeForId(null, data.id);
            }
            typeOfShape = that.__getShapeType(shape);
            that.__fireSelection(typeOfShape, target, data);
            if (typeOfShape !== null && typeOfShape !== undefined && data !== undefined && data !== null) {
                var contextMenuOptions = contextMenuProvider(typeOfShape, data);
                if (contextMenuOptions !== undefined && contextMenuOptions !== null && contextMenuOptions.length > 0) {
                    if (that.contextMenu === null || that.contextMenu === undefined) {
                        that.contextMenu = parentDiv.append("div");
                        that.contextMenu.on('contextmenu', function() {
                            d3.event.preventDefault();
                        });
                        $(that.contextMenu.node()).hide();
                    } else {
                        $(that.contextMenu.node()).empty();
                    }
                    var mousePosition = d3.mouse(that.svgContainer.node());
                    that.contextMenu
                        .style("left", mousePosition[0] + "px")
                        .style("top", mousePosition[1] + CanvasGlobals.SCREEN_OFFSET_Y + "px")
                        .style("z-index", 10)
                        .style("width", "auto")
                        .style("height", "auto")
                        .style("position", "absolute");
                    var popup = that.contextMenu.append("ul")
                        .attr("class", "context-menu-list");

                    for (var m = 0; m < contextMenuOptions.length; m++) {
                        var menu = contextMenuOptions[m];
                        var color = "black";
                        if (!menu.enable) {
                            color = "grey";
                        }
                        var menuId = menu.id;
                        if (menu.id === undefined || menu.id === null) {
                            menuId = menu.imagePath + "_" + menu.name + "_menuItem";
                        }

                        var listEntry = popup.append('li')
                            .attr("id", "li_" + menuId)
                            .attr("class", "context-menu-item")
                            .on("click", that.__contextMenuItemClickHandler);

                        $(listEntry.node()).css({
                            backgroundImage: 'url(' + menu.imagePath + ')'
                        });

                        listEntry.append("span")
                            .style("color", color)
                            .text(menu.text);
                        $(listEntry.node()).data("menu", menu);

                    }

                    canvasSize = [
                        that.svgContainer.node().offsetWidth,
                        that.svgContainer.node().offsetHeight
                    ];

                    popupSize = [
                        that.contextMenu.node().offsetWidth,
                        that.contextMenu.node().offsetHeight
                    ];

                    if (popupSize[0] + mousePosition[0] > canvasSize[0]) {
                        that.contextMenu.style("left", "auto");
                        that.contextMenu.style("right", 0);
                    }

                    if (popupSize[1] + mousePosition[1] > canvasSize[1]) {
                        that.contextMenu.style("top", "auto");
                        that.contextMenu.style("bottom", 0);
                    }
                    $(that.contextMenu.node()).show();
                }
            }
        });
    };

    this.__contextMenuItemClickHandler = function(e) {
        that.__hideContextMenu();
        var menuOption = $(d3.event.target).data("menu");
        if (menuOption === undefined) {
            menuOption = $(d3.event.target.parentElement).data("menu");
        }
        if (menuOption.enable) {
            if (menuOption.actionHandler !== undefined && menuOption.actionHandler !== null && menuOption.actionHandler !== "") {
                menuOption.actionHandler(menuOption.id, menuOption.data);
            }
        } else {
            d3.event.preventDefault();
        }
    };

    this.__hideContextMenu = function() {
        if (that.contextMenu !== undefined && that.contextMenu !== null) {
            if ($(that.contextMenu.node()).css('visibility') !== 'hidden') {
                $(that.contextMenu.node()).hide();
            }
        }
    };

    this.redraw = function() {
        this.dispose();
        this.draw();
    };

    this.remove = function(type, modelObject) {
        if (modelObject !== undefined && modelObject !== null && type !== undefined && type !== null) {
            var shape = this.__getShapeForId(type, modelObject.id);
            if (shape !== undefined) {
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
        this.tip = null;
        this.contextMenu = null;
        this.selectedObject = {
            typeOfShapeSelected: this.typeOfShape.NONE,
            data: ""
        };
    };

    this.__entityDragListener = function(trans, entityShape) {
        var curWidth = $("#" + this.__getCanvasId()).width();
        var curHeight = $("#" + this.__getCanvasId()).height();
        if (entityShape.right > curWidth && entityShape.bottom > curHeight) {
            that.__resetSvgDimensions(entityShape.right + CanvasGlobals.BUFFER_AREA, entityShape.bottom + CanvasGlobals.BUFFER_AREA);
        } else if (entityShape.right > curWidth && entityShape.bottom < curHeight) {
            that.__resetSvgDimensions(entityShape.right + CanvasGlobals.BUFFER_AREA, curHeight);
        } else if (entityShape.right < curWidth && entityShape.bottom > curHeight) {
            that.__resetSvgDimensions(curWidth, entityShape.bottom + CanvasGlobals.BUFFER_AREA);
        }
    };

    this.__fireSelection = function(type, shape, modelObject) {
        //https://github.com/mbostock/d3/wiki/Drag-Behavior#on
        //if (d3.event.defaultPrevented) return;
        //console.log("click");
        that.selectedObject.typeOfShapeSelected = type;
        that.selectedObject.data = modelObject;
        d3.select(".selected").classed("selected", false);
        d3.select(shape).classed("selected", true);
        if (type !== undefined && type !== null) {
            /*var eventInfo = {
                data: modelObject,
                typeOfShapeSelected: type
            };*/
            if (d3.event.button !== 2) { // if right click then don't call selection listeners
                that.selectionListeners.forEach(function(listener) {
                    listener(that.selectedObject);
                });
            }
        }
    };

    this.__getCanJoinListeners = function() {
        return this.canJoinListeners;
    };

    this.__getJoinCreatedListeners = function() {
        return this.joinCreatedListeners;
    };

    this.__getToolTipHtml = function(model) {
        if (model.htmlToolTip !== null && model.htmlToolTip !== undefined) {
            return model.htmlToolTip;
        }
        /* if (model.title !== undefined && model.title !== null) {
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
        }*/
    };

    this.__showTooltip = function(d, shape) {
        //if (d3.event.defaultPrevented) return;
        if (shape !== undefined && shape !== null) {
            shape.style.setProperty("cursor", "default");
        }
        var mousePos = d3.mouse(this.__getSvgContainer().node());
        var htmlText = that.__getToolTipHtml(d);
        if (htmlText !== null && htmlText !== undefined && d !== null && d !== undefined && mousePos.length == 2) {
            var elem = that.tip.node();
            // Make the element fully transparent.
            elem.style.opacity = 0;

            // Make sure the initial state is applied.
            window.getComputedStyle(elem).opacity;
            that.tip.html(htmlText);
            // Fade it in.
            setTimeout(function() {
                elem.style.left = (mousePos[0]) + "px";
                elem.style.top = (mousePos[1] + CanvasGlobals.SCREEN_OFFSET_Y) + "px";
                elem.style.opacity = 0.9;
            }, 1000);
        }
    };

    this.__hideTooltip = function(d, shape) {
        //if (d3.event.defaultPrevented) return;
        setTimeout(function() {
            that.tip.transition()
                .duration(800)
                .style("opacity", 0);
        }, 2000);
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
            return this.top + CanvasGlobals.HEADER_HEIGHT + CanvasGlobals.ELEMENT_HEIGHT * this.model.elements.length;
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
        var headerRect = headerShape.append("svg:rect")
            .attr("x", this.model.layout.x)
            .attr("y", this.model.layout.y)
            .attr("width", this.model.layout.width)
            .attr("height", CanvasGlobals.HEADER_HEIGHT)
            .attr("class", "entityheader");

        // Header image if supplied
        if (imagePathProvider !== null && imagePathProvider !== undefined) {
            headerShape.append("svg:image")
                .attr("xlink:href", imagePathProvider(parent.typeOfShape.ENTITY_SHAPE, this.model))
                .attr("x", this.model.layout.x + 5)
                .attr("y", this.model.layout.y + 5)
                .attr("width", CanvasGlobals.HEADER_HEIGHT - 10)
                .attr("height", CanvasGlobals.HEADER_HEIGHT - 10);
        }

        var title = this.model.title;
        if (title.length > CanvasGlobals.TEXT_CHAR_LENGTH) {
            title = title.substring(0, CanvasGlobals.TEXT_CHAR_LENGTH - 3) + "...";
        }

        //workaround --> rect for tooltip as text hover not working
        headerShape.append("svg:rect").attr("x", this.model.layout.x + CanvasGlobals.HEADER_HEIGHT)
            .attr("y", this.model.layout.y + 5)
            .attr("width", 150)
            .attr("height", CanvasGlobals.ELEMENT_HEIGHT - 2)
            .attr("class", "entityheader")
            .style("stroke", "transparent")
            .on("click", function() {
                that.parent.__fireSelection(parent.typeOfShape.ENTITY_SHAPE, this.parentElement, this.model);
            })
            .on('mouseover', function(d) {
                that.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.__hideTooltip(d, this);
            });
        // Header text to show Entity Name
        var textNode = headerShape.append("svg:text")
            .attr("x", this.model.layout.x + CanvasGlobals.HEADER_HEIGHT)
            .attr("y", this.model.layout.y + 20)
            .attr("width", this.model.layout.width)
            .attr("height", CanvasGlobals.HEADER_HEIGHT)
            .attr("class", "entityheadertext")
            .text(title);
        textNode.on('mouseover', function(d) {
            that.parent.__showTooltip(d, this);
        })
            .on('mouseout', function(d) {
                that.parent.__hideTooltip(d, this);
            });

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

        headerShape.on("click", function() {
            that.parent.__fireSelection(parent.typeOfShape.ENTITY_SHAPE, this.parentElement, this.model);
        });
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
            "y": that.top + CanvasGlobals.ELEMENT_HEIGHT / 2
        };
        anchors.left = leftAnchor;

        var rightAnchor = {
            "x": that.left + that.parent.model.layout.width,
            "y": that.top + CanvasGlobals.ELEMENT_HEIGHT / 2
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
            return this.parent.model.layout.y + CanvasGlobals.HEADER_HEIGHT + that.order * CanvasGlobals.ELEMENT_HEIGHT + getTrans().y;
        }
    });

    Object.defineProperty(this, 'right', {
        get: function() {
            return this.left + this.parent.model.layout.width;
        }
    });

    Object.defineProperty(this, 'bottom', {
        get: function() {
            return this.top + CanvasGlobals.ELEMENT_HEIGHT;
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
        elementShape.append("svg:rect")
            .attr("x", that.left)
            .attr("y", that.top)
            .attr("width", that.parent.model.layout.width)
            .attr("height", CanvasGlobals.ELEMENT_HEIGHT)
            .attr("class", "element")
            .call(dragBehavior)
            .on("click", function() {
                that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this, this.model);
            });

        // Show icon for data type
        if (imagePathProvider !== null && imagePathProvider !== undefined) {
            elementShape.append("svg:image")
                .attr("xlink:href", imagePathProvider(this.parent.parent.typeOfShape.ELEMENT_SHAPE, this.model)).attr("x", this.parent.model.layout.x + 5)
                .attr("y", this.parent.model.layout.y + CanvasGlobals.HEADER_HEIGHT + that.order * CanvasGlobals.ELEMENT_HEIGHT + 5)
                .attr("width", CanvasGlobals.ELEMENT_HEIGHT - 10)
                .attr("height", CanvasGlobals.ELEMENT_HEIGHT - 10)
                .on("click", function() {
                    that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this.parentElement, this.model);
                });
        }


        // rect for showing tooltip on hover---> workaround for text hover not working
        var rect = elementShape.append("svg:rect").attr("x", this.parent.model.layout.x + CanvasGlobals.ELEMENT_HEIGHT)
            .attr("y", this.parent.model.layout.y + CanvasGlobals.HEADER_HEIGHT + that.order * CanvasGlobals.ELEMENT_HEIGHT + 1)
            .attr("width", 100)
            .attr("height", CanvasGlobals.ELEMENT_HEIGHT - 2)
            .style("stroke", "transparent")
            .on("click", function() {
                that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this.parentElement, this.model);
            })
            .on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            });

        var title = this.model.text;
        if (title.length > CanvasGlobals.TEXT_CHAR_LENGTH) {
            title = title.substring(0, CanvasGlobals.TEXT_CHAR_LENGTH - 3) + "...";
        }
        elementShape.append("svg:text")
            .attr("x", this.parent.model.layout.x + CanvasGlobals.ELEMENT_HEIGHT)
            .attr("y", this.parent.model.layout.y + CanvasGlobals.HEADER_HEIGHT + that.order * CanvasGlobals.ELEMENT_HEIGHT + 18)
            .attr("width", this.parent.model.layout.width)
            .attr("height", CanvasGlobals.ELEMENT_HEIGHT)
            .attr("class", "elementtext")
            .text(title)
            .on("click", function() {
                that.parent.parent.__fireSelection(that.parent.parent.typeOfShape.ELEMENT_SHAPE, this.parentElement, this.model);
            })
            .on('mouseover', function(d) {
                that.parent.parent.__showTooltip(d, this);
            })
            .on('mouseout', function(d) {
                that.parent.parent.__hideTooltip(d, this);
            });
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
                        joinLineObj.y1 = joinColumnShapeObject.leftColumnShape.top + CanvasGlobals.ELEMENT_HEIGHT / 2;
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
                        joinLineObj.y2 = joinColumnShapeObject.rightColumnShape.top + CanvasGlobals.ELEMENT_HEIGHT / 2;
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
        for (var c = 0; c < that.model.columns.length; c++) {
            var col = that.model.columns[c];
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
