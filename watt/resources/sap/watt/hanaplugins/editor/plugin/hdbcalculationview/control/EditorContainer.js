/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.EditorContainer", {



    metadata: {

        aggregations: {

            "content": {

                singularName: "content",

                type: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.Editor"

            }

        },

        defaultAggregation: "content"

    },



    addContent: function(content) {
    
     this.addAggregation("content", content);

       /* if (this.$().length === 0) {

            this.addAggregation("content", content);

        } else {

            this.addAggregation("content", content, true);

            var rm = new sap.ui.core.RenderManager();

            var element = document.createElement("div");

            element.setAttribute("style", "width: 100%; height: 100%;");

            content._doNotRenderContent = true;

            rm.render(content, element);

            content._doNotRenderContent = false;

            content.invalidate(); 

            rm.destroy();

            this.$().append(element);

        } */

    },



    /*removeContent: function(content) {

        if (this.$().length === 0) {

            this.removeAggregation("content", content);

        } else {

            var control = this.removeAggregation("content", content, true);

            if (control) {

                control.$().parent().remove();

            }

        }

    } ,*/



    renderer: function(rm, control) {

        rm.write("<div");

        rm.writeControlData(control);

        rm.addStyle("width", "100%");

        rm.addStyle("height", "100%");

        rm.writeStyles();

        rm.writeClasses();

        rm.write(">"); 


        var children = control.getContent();

        for (var i = 0; i < children.length; i++) {

            var child = children[i];

            rm.renderControl(child);

        }



        rm.write("</div>");

    },



    exit: function() {

        this.destroyAggregation("content", true);

    }



});



sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.Editor", {



    metadata: {

        properties: {

            "hidden": {

                type: "boolean",

                defaultValue: false

            }

        },

        aggregations: {

            "content": {

                singularName: "content",

                multiple: false

            }

        },

        defaultAggregation: "content"

    },



    setHidden: function(hidden) {

        this.setProperty("hidden", hidden, true);

        var domId = this.getId();

        var editorElement = jQuery.sap.domById(domId);

        if (editorElement) {

            editorElement.style.display = hidden ? "none" : ""; 

        }

    },



    init: function() {

        this._doNotRenderContent = false;

    },



    renderer: function(rm, control) {

        rm.write("<div");

        rm.writeControlData(control);

        rm.addStyle("width", "100%");

        rm.addStyle("height", "100%");

        rm.addStyle("display", control.getProperty("hidden") === true ? "none" : "");

        rm.writeStyles();

        rm.writeClasses();

        rm.write(">");

        if (!control._doNotRenderContent) {

            rm.renderControl(control.getContent());

        }



        rm.write("</div>");

    },



    exit: function() {

        this.destroyAggregation("content", true);

    }



});

