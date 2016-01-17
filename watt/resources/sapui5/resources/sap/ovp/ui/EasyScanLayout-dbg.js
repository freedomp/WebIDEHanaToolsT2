/*!
* ${copyright}
*/

/*global sap window*/
sap.ui.define(["jquery.sap.global", "sap/ovp/library"],
function(jQuery) {
    "use strict";

    var EasyScanLayout = sap.ui.core.Control.extend("sap.ovp.ui.EasyScanLayout", {

        metadata: {
            library: "sap.ovp",
            aggregations: {
                content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
            },
            defaultAggregation: "content",
            events: {
                afterRendering: {}
            },
            properties: {
                useMediaQueries: {group: "Misc", type: "sap.ui.core/boolean", defaultValue: false},
                debounceTime: {group: "Misc", type: "sap.ui.core/int", defaultValue: 150}
            }
        },

        renderer: {
            render: function (oRm, oControl) {
                oRm.write("<div");
                oRm.writeControlData(oControl);
                oRm.addClass("sapUshellEasyScanLayout");
                oRm.writeClasses();
                oRm.write(">");

                var columnCount = oControl.columnCount;
                var columnList = Array.apply(null, new Array(columnCount)).map(function() {
                    return [];
                });
                var content = oControl.getContent();
                for (var i = 0; i < content.length; i++) {
                    columnList[i % columnCount].push(content[i]);
                }

                columnList.forEach(function (column) {
                    oRm.write("<div");
                    oRm.addClass("easyScanLayoutColumn");
                    oRm.writeClasses();
                    oRm.write(">");
                    column.forEach(function (item) {
                        oRm.write("<div");
                        oRm.addClass("easyScanLayoutItemWrapper");
                        oRm.writeClasses();
                        oRm.write(">");
                        oRm.renderControl(item);
                        oRm.write("</div>");
                    });
                    oRm.write("</div>");
                });

                oRm.write("</div>");
            }
        }

    });

    var getColumnResolutionList = function () {
        return [
            {minWidth: 0, styleClass: "columns-blank", columnCount: 1},
            {minWidth: 240, styleClass: "columns-block", columnCount: 1},
            {minWidth: 352, styleClass: "columns-narrow", columnCount: 1},
            {minWidth: 433, styleClass: "columns-wide", columnCount: 1},
            {minWidth: 704, styleClass: "columns-narrow", columnCount: 2},
            {minWidth: 864, styleClass: "columns-wide", columnCount: 2},
            {minWidth: 1024, styleClass: "columns-narrow", columnCount: 3},
            {minWidth: 1280, styleClass: "columns-wide", columnCount: 3},
            {minWidth: 1440, styleClass: "columns-narrow", columnCount: 4},
            {minWidth: 1920, styleClass: "columns-wide", columnCount: 4},
            {minWidth: 2560, styleClass: "columns-narrow", columnCount: 5},
            {minWidth: 3008, styleClass: "columns-wide", columnCount: 5},

            //This is for 8K and 4K Screens (on 3600px flp make 1rem - 32px)
            {minWidth: 3600, styleClass: "columns-narrow", columnCount: 4},
            {minWidth: 3840, styleClass: "columns-wide", columnCount: 4},
            {minWidth: 5120, styleClass: "columns-wide", columnCount: 5},
            {minWidth: 6016, styleClass: "columns-wide", columnCount: 5}
        ];
    };

    EasyScanLayout.prototype.init = function () {
        this.columnResolutionList = getColumnResolutionList();
        this.columnCount = this.columnResolutionList[0].columnCount;
        this.columnStyle = "";
        this.updateColumnClass(this.columnResolutionList[0].styleClass);
        if (this.getUseMediaQueries()) { //if full page --> use media queries
            this.mediaQueryList = this.initMediaListeners(this.columnResolutionList);
        } else { //if not full page --> use resize handler
            this.resizeHandlerId = this.initResizeHandler(this.columnResolutionList);
        }
    };

    var mediaListenerHandlerTimerId;

    var mediaListenersDebounce = function (columnCount, columnStyle, mq) {
        var mediaListenerHandler = function (cols, className) {
            this.updateColumnClass(className);
            this.refreshColumnCount(cols, this.getContent());
        };
        if (mq.matches) {
            window.clearTimeout(mediaListenerHandlerTimerId);
            mediaListenerHandlerTimerId = window.setTimeout(mediaListenerHandler.bind(this, columnCount, columnStyle), this.getDebounceTime());
        }
    };

    var buildQuery = function (bottomRes, topRes) {
        var min = bottomRes.minWidth;
        var max = topRes && topRes.minWidth;
        return "(min-width: " + min + "px)" + (max ? " and (max-width: " + (max - 1) + "px)" : "");
    };

    EasyScanLayout.prototype.initMediaListeners = function (colResList) {
        var mediaQueryList = [];
        for (var i = 0; i < colResList.length; i++) {
            var query = buildQuery(colResList[i], colResList[i + 1]);
            var mediaQuery = window.matchMedia(query);
            var boundedListener = mediaListenersDebounce.bind(this, colResList[i].columnCount, colResList[i].styleClass);
            mediaQuery.addListener(boundedListener);
            mediaQuery.bindedListener = boundedListener;
            boundedListener(mediaQuery);
            mediaQueryList.push(mediaQuery);
        }
        return mediaQueryList;
    };

    EasyScanLayout.prototype.initResizeHandler = function (colResList) {
        var resizeHandlerTimerId;
        var debounceTime = this.getDebounceTime();
        var resizeHandlerDebounce = function () {
            window.clearTimeout(resizeHandlerTimerId);
            resizeHandlerTimerId = window.setTimeout(this.oControl.resizeHandler.bind(this, colResList), debounceTime);
        };

        return sap.ui.core.ResizeHandler.register(this, resizeHandlerDebounce);
    };

    EasyScanLayout.prototype.resizeHandler = function (colResList) {
        var width = this.iWidth;
        var oControl = this.oControl;
        var resObject;
        for (var i = 0; i < colResList.length; i++) {
            if (!colResList[i + 1]) {
                resObject = colResList[i];
                break;
            }
            if (colResList[i].minWidth <= width && colResList[i + 1].minWidth > width) {
                resObject = colResList[i];
                break;
            }
        }

        oControl.refreshColumnCount(resObject.columnCount, oControl.getContent());
        oControl.updateColumnClass(resObject.styleClass);
    };

    EasyScanLayout.prototype.refreshColumnCount = function (columnCount, content) {
        if (this.columnCount === columnCount) {
            return;
        }
        this.columnCount = columnCount;
        var jqColumnsNew = jQuery();
        for (var i = 0; i < columnCount; i++) {
            jqColumnsNew = jqColumnsNew.add("<div class='easyScanLayoutColumn'/>");
        }
        for (var j = 0; j < content.length; j++) {
            jqColumnsNew.get(j % columnCount).appendChild(content[j].getDomRef().parentNode);
        }

        this.$().empty().append(jqColumnsNew);

    };

    EasyScanLayout.prototype.updateColumnClass = function (columnClass) {
        if (this.columnStyle === columnClass) {
            return;
        }
        this.removeStyleClass(this.columnStyle);
        this.addStyleClass(columnClass);
        this.columnStyle = columnClass;
    };

    EasyScanLayout.prototype.onAfterRendering = function () {
        this.fireAfterRendering();
    };

    EasyScanLayout.prototype.exit = function () {
        if (this.mediaQueryList) {
            this.mediaQueryList.forEach(function (mediaQuery) {
                mediaQuery.removeListener(mediaQuery.bindedListener);
            });
            delete this.mediaQueryList;
        }
        if (this.resizeHandlerId) {
            sap.ui.core.ResizeHandler.deregister(this.resizeHandlerId);
        }
    };

    return EasyScanLayout;

}, /* bExport= */ true);
