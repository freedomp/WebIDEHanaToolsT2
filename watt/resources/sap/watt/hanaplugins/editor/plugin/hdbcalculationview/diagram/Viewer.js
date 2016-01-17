/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["./galilei"], function() {
    "use strict";

    return sap.galilei.core.defineClass({
        fullClassName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.diagram.Viewer",
        parent: sap.galilei.ui.common.svg.Viewer,
        methods: {
            _preInitialize: function() {
                var that = this;
                //var superOnResize = this.onResize;
                var superAddSvgRoot = this.addSvgRoot;

                function onResize() {
                    this.updateViewSize();
                    // do not call superOnResize since it sets fixed height/width which causes resizing issues on Firefox
                    this.notifyLayers("onResize");
                    return this;
                }

                function addSvgRoot() {
                    var svgRoot = superAddSvgRoot.apply(that, arguments);
                    svgRoot.attr("width", null);
                    svgRoot.attr("height", null);
                    return svgRoot;
                }

                this.onResize = onResize;
                this.addSvgRoot = addSvgRoot;
            }
        }
    });

});
