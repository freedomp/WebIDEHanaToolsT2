/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "./ElementSourceProvider",
        "./InputSourceProvider",
        "../viewmodel/model"

    ],

    function(ResourceLoader, ElementSourceProvider, InputSourceProvider, model) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        /**
         * @class
         */
        var PropertySourceProvider = function(parameters) {
            this._data = parameters.element;
            this._mLayout = parameters.layout;
            this._undoManager = parameters.undoManager;
            this._viewNode = parameters.viewNode;
            this._model = parameters.model;
            this._isSource = parameters.isSource;
            this._context = parameters.context;
        };

        PropertySourceProvider.prototype = {

            createContent: function() {
                var that = this;

                if (this._data instanceof model.Element) {
                    var _elementSourceProvider = new ElementSourceProvider({
                        data: that._data,
                        layout: that._mLayout,
                        undoManager: that._undoManager,
                        viewNode: that._viewNode,
                        model: that._model,
                        isSource: that._isSource
                    });
                    _elementSourceProvider.createContent();
                } else {
                    var _inputSourceProvider = new InputSourceProvider({
                        data: that._data,
                        layout: that._mLayout,
                        undoManager: that._undoManager,
                        viewNode: that._viewNode,
                        model: that._model,
                        isSource: that._isSource,
                        context: that._context
                    });
                    _inputSourceProvider.createContent();
                }


            }

        };
        return PropertySourceProvider;

    });
