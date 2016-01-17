/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

sap.ui.define([
    'sap/viz/ui5/format/ChartFormatter',
    'sap/ui/Device'
],
function(ChartFormatter, Device) {
    "use strict";

    var DefaultPropertiesHelper = {};

    var FIORI_MOBILE_PROP = { plotarea:{scrollbar: {spacing: 2} },
                              legend:{ scrollbar: {spacing: 2} }
                            };
    
    var isMobile = sap.ui.Device.system.tablet || sap.ui.Device.system.phone;
    var DEFAULT_FIORI_PROPS =  {
        'tooltip' : {
            'visible' : false
        },
        'general' : {
            'groupData' : true
        },
        'plotArea' : {
            'isFixedDataPointSize' : true,
            'dataLabel' : {
                'hideWhenOverlap' : true,
                'respectShapeWidth' : true,
                'style' : {
                    'color' : null
                }
            },
            'dataPointSize' : {
                'min' : (isMobile) ? 40 : 24,
                'max' : 96
            }
        },
        'interaction' : {
            'behaviorType' : 'noHoverBehavior',
            'selectability' : {
                'mode' : 'multiple'
            },
            'zoom': {
                'enablement': 'enabled',
                'direction': 'categoryAxis'
            },
            'enableKeyboard': true
        },
        'categoryAxis' : {
            'label' : {
                'angle' : 45,
                'rotation' : 'auto'
            }
        },
        'legendGroup' : {
            'layout' : {
                'position' : 'auto',
                'respectPlotPosition' : false
            },
            'forceToShow' : true,
        },
        'legend' : {
            'isScrollable' : true
        }
    };

    if(isMobile){
        jQuery.extend(true, DEFAULT_FIORI_PROPS, FIORI_MOBILE_PROP);
    }
             
    DefaultPropertiesHelper._getFiori = function(PropertyService, type) {
        var result =  PropertyService.mergeProperties(type, {}, 
            DefaultPropertiesHelper._general,
            DefaultPropertiesHelper._specified[type.replace('info/', '')] || {}
        );

        for (var key in result) {
            if (result[key].gridline) {
                result[key].gridline.visible = true;
            }
        }

        var defFiori = jQuery.extend(true, {}, DEFAULT_FIORI_PROPS);
        result = PropertyService.mergeProperties(type, defFiori, result);
        return result;
    };

    DefaultPropertiesHelper.get = function(PropertyService, type, applicationSet) {
        if(applicationSet === "fiori"){
            return DefaultPropertiesHelper._getFiori(PropertyService, type);
        }else{
            return PropertyService.mergeProperties(type, {}, 
                DefaultPropertiesHelper._general,
                DefaultPropertiesHelper._specified[type.replace('info/', '')] || {},
                applyDefaultFormatString({}, type)
                ); 
        }
    };

    function getPropertiesDefination(propDef, path) {
        if ( propDef == null || path.legnth === 0 ) {
            return propDef;
        }
        var e = propDef[ path[0] ];
        if (e && e.children) {
            return getPropertiesDefination( e.children, path.slice(1) );
        }
        return e;
    }

    function setPropertiesValue(properties, path, value) {
        if (path.length === 0) {
            return value;
        }
        properties = properties || {};
        var p = properties[ path[0] ];
        properties[ path[0] ] = setPropertiesValue( p, path.slice(1), value );
        return properties;
    }

    var DEFAULT_LABEL_FORMAT = "u";
    var formatStringPaths = [
        ["valueAxis", "label", "formatString"],
        ["valueAxis2", "label", "formatString"]
    ];
    function applyDefaultFormatString(properties, chartType) {
        var metadata = sap.viz.api.metadata.Viz.get(chartType);
        if (metadata) {
            var propDef = metadata.properties;
            formatStringPaths.forEach(function (path) {
                var p = getPropertiesDefination(propDef, path);
                if ( p && p.hasOwnProperty("defaultValue") ) {
                    setPropertiesValue(properties, path, DEFAULT_LABEL_FORMAT);
                }
            });
        }
        return properties;
    }

    DefaultPropertiesHelper._general = {
        "title" : {
            "visible" : true
        },
        "tooltip" : {
            "visible" : true
        },
        "dataLabel" : {
            "visible" : false
        },
        "plotArea" : {
            "animation" : {
                "dataLoading" : false,
                "dataUpdating" : false,
                "resizing" : false
            },
            // @formatter:off
            'colorPalette' : ['sapUiChartPaletteQualitativeHue1',
                              'sapUiChartPaletteQualitativeHue2',
                              'sapUiChartPaletteQualitativeHue3',
                              'sapUiChartPaletteQualitativeHue4',
                              'sapUiChartPaletteQualitativeHue5',
                              'sapUiChartPaletteQualitativeHue6',
                              'sapUiChartPaletteQualitativeHue7',
                              'sapUiChartPaletteQualitativeHue8',
                              'sapUiChartPaletteQualitativeHue9',
                              'sapUiChartPaletteQualitativeHue10',
                              'sapUiChartPaletteQualitativeHue11'],
            'primaryValuesColorPalette': ['sapUiChartPaletteSequentialHue1Light1', 
                                'sapUiChartPaletteSequentialHue1', 
                                'sapUiChartPaletteSequentialHue1Dark1'],
            'secondaryValuesColorPalette': ['sapUiChartPaletteSequentialHue2Light1', 
                                'sapUiChartPaletteSequentialHue2', 
                                'sapUiChartPaletteSequentialHue2Dark1'],
            // @formatter:on
        },
        "legend" : {
            "visible" : true
        }
    }
    
    DefaultPropertiesHelper._specified = (function() {
        var backgroundBorder = {
            "border" : {
                "left" : {
                    "visible" : false
                },
                "right" : {
                    "visible" : false
                },
                "top" : {
                    "visible" : false
                },
                "bottom" : {
                    "visible" : false
                }
            }
        };
        var xyChartConfig = {
            "background" : backgroundBorder,
            "xAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            }
        };
    
        var xyzChartConfig = {
            "background" : backgroundBorder,
            "xAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "zAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var barChartConfig = {
            "plotArea" : {
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var dualBarChartConfig = {
            "plotArea" : {
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var lineChartConfig = {
            "plotArea" : {
                "marker" : {
                    "shape" : "circle",
                    "size" : 6,
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var dualLineChartConfig = {
            "plotArea" : {
                "marker" : {
                    "shape" : "circle",
                    "size" : 6,
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var combinationChartConfig = {
            "plotArea" : {
                "line" : {
                    "marker" : {
                        "shape" : "circle",
                        "size" : 6,
                        "visible" : true
                    }
                },
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var dualCombinationChartConfig = {
            "plotArea" : {
                "line" : {
                    "marker" : {
                        "shape" : "circle",
                        "size" : 6,
                        "visible" : true
                    }
                }
            },
            "background" : backgroundBorder,
            "xAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            },
            "yAxis2" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            }
        };
    
        var trellisDualCombinationChartConfig = {
            "plotArea" : {
                "line" : {
                    "marker" : {
                        "shape" : "circle",
                        "size" : 6,
                        "visible" : true
                    }
                }
            },
            "background" : backgroundBorder,
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "xAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            },
            "yAxis2" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            }
        };
    
        var bubbleChartConfig = {
            "plotArea" : {
                "showNegativeValues" : true,
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "sizeLegend" : {
                "visible" : true
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var scatterChartConfig = {
            "plotArea" : {
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var scatterMatrixChartConfig = {
            "background" : backgroundBorder,
            "xAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            }
        };
    
        var trellisBarChartConfig = {
            "plotArea" : {
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var trellisDualChartConfig = {
            "plotArea" : {
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            },
            "categoryAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var trellisPieChartConfig = {
            "plotArea" : {
                "background" : backgroundBorder
            },
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var trellisScatterChartConfig = {
            "plotArea" : {
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            },
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var trellisBubbleChartConfig = {
            "plotArea" : {
                "showNegativeValues" : true,
                "gridline" : {
                    "visible" : false
                },
                "background" : backgroundBorder
            },
            "sizeLegend" : {
                "visible" : true
            },
            "valueAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "valueAxis2" : {
                "title" : {
                    "visible" : true
                }
            },
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };
    
        var multiChartConfig = {
            "background" : backgroundBorder,
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "xAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            }
        };
    
        var multiHorizontalChartConfig = {
            "background" : backgroundBorder,
            "rowAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "columnAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "xAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                }
            }
        };

        var waterfallChartConfig = {
            "background" : backgroundBorder,
            "xAxis" : {
                "title" : {
                    "visible" : true
                }
            },
            "yAxis" : {
                "title" : {
                    "visible" : true
                },
                "gridline" : {
                    "visible" : false
                }
            }
        };
    
        var result = {
            "bar" : barChartConfig,
            "column" : barChartConfig,
            "stacked_bar" : barChartConfig,
            "stacked_column" : barChartConfig,
            "100_stacked_bar" : barChartConfig,
            "100_stacked_column" : barChartConfig,
            "dual_bar" : dualBarChartConfig,
            "dual_column" : dualBarChartConfig,
            "mekko" : dualBarChartConfig,
            "100_mekko" : dualBarChartConfig,
            "horizontal_mekko" : dualBarChartConfig,
            "100_horizontal_mekko" : dualBarChartConfig,
            "line" : lineChartConfig,
            "horizontal_line" : lineChartConfig,
            "combination" : combinationChartConfig,
            "horizontal_combination" : combinationChartConfig,
            "dual_line" : dualLineChartConfig,
            "dual_horizontal_line" : dualLineChartConfig,
            "dual_combination" : dualCombinationChartConfig,
            "dual_horizontal_combination" : dualCombinationChartConfig,
            "stacked_combination" : combinationChartConfig,
            "horizontal_stacked_combination" : combinationChartConfig,
            "dual_stacked_combination" : dualCombinationChartConfig,
            "dual_horizontal_stacked_combination" : dualCombinationChartConfig,
            "pie" : {},
            "donut" : {},
            "scatter" : scatterChartConfig,
            "bubble" : bubbleChartConfig,
            "trellis_bar" : trellisBarChartConfig,
            "trellis_column" : trellisBarChartConfig,
            "trellis_stacked_bar" : trellisBarChartConfig,
            "trellis_stacked_column" : trellisBarChartConfig,
            "trellis_100_stacked_bar" : trellisBarChartConfig,
            "trellis_100_stacked_column" : trellisBarChartConfig,
            "trellis_dual_bar" : trellisDualChartConfig,
            "trellis_dual_column" : trellisDualChartConfig,
            "trellis_line" : trellisBarChartConfig,
            "trellis_horizontal_line" : trellisBarChartConfig,
            //"trellis_combination" : trellisBarChartConfig,
            //"trellis_horizontal_combination" : trellisBarChartConfig,
            "trellis_dual_line" : trellisDualChartConfig,
            "trellis_dual_horizontal_line" : trellisDualChartConfig,
            //"trellis_dual_combination" : trellisDualCombinationChartConfig,
            //"trellis_dual_horizontal_combination" : trellisDualCombinationChartConfig,
            "trellis_pie" : trellisPieChartConfig,
            "trellis_donut" : trellisPieChartConfig,
            "trellis_scatter" : trellisScatterChartConfig,
            "trellis_bubble" : trellisBubbleChartConfig,
            "area" : barChartConfig,
            "horizontal_area" : barChartConfig,
            "100_area" : barChartConfig,
            "100_horizontal_area" : barChartConfig,
            "trellis_area" : trellisBarChartConfig,
            "trellis_100_area" : trellisBarChartConfig,
            "trellis_horizontal_area" : trellisBarChartConfig,
            "trellis_100_horizontal_area" : trellisBarChartConfig,
            "3d_column" : xyzChartConfig,
            "3d_bar" : xyzChartConfig,
            "pie_with_depth" : {},
            "geobubble" : {
                "plotArea" : {
                    "showNegativeValues" : true
                },
                "sizeLegend" : {
                    "visible" : true
                },
                "geoContainer" : {
                    "isFixedScale" : false,
                    "scale" : null,
                    "center" : []
                }
            },
            "choropleth" : {
                "geoContainer" : {
                    "isFixedScale" : false,
                    "scale" : null,
                    "center" : []
                }
            },
            "geopie" : {
                "sizeLegend" : {
                    "visible" : true
                },
                "geoContainer" : {
                    "isFixedScale" : false,
                    "scale" : null,
                    "center" : []
                }
            },
            "geomap" : {
                "provider" : "ESRI"
            },
            "scatter_matrix" : scatterMatrixChartConfig,
            "treemap" : {},
            "heatmap" : {
                "plotArea": { "nullColor": "sapUiChoroplethRegionBG",
                              "colorPalette": [
                                            "sapUiChartPaletteSequentialHue1Light2",
                                            "sapUiChartPaletteSequentialHue1Light1",
                                            "sapUiChartPaletteSequentialHue1",
                                            "sapUiChartPaletteSequentialHue1Dark1",
                                            "sapUiChartPaletteSequentialHue1Dark2"],
                              "numOfSegments": 5
                },
                "categoryAxis" : {
                    "title" : {
                        "visible" : true
                    }
                },
                "categoryAxis2" : {
                    "title" : {
                        "visible" : true
                    }
                }
            },
            "number" : {},
            "boxplot" : xyChartConfig,
            "horizontal_boxplot" : xyChartConfig,
            "network" : {},
            "radar" : {
                "plotArea" : {
                    "marker" : {
                        "size" : 6
                    },
                    "valueAxis" : {
                        "title" : {
                            "visible" : true
                        }
                    },
                    "polarAxis" : {
                        "title" : {
                            "visible" : true
                        }
                    }
                }
            },
            "multi_radar" : {
                "rowAxis" : {
                    "title" : {
                        "visible" : true
                    }
                },
                "columnAxis" : {
                    "title" : {
                        "visible" : true
                    }
                },
                "plotArea" : {
                    "marker" : {
                        "size" : 6
                    },
                    "valueAxis" : {
                        "title" : {
                            "visible" : true
                        }
                    },
                    "polarAxis" : {
                        "title" : {
                            "visible" : true
                        }
                    }
                }
            },
            "tagcloud" : {},
            "tree" : {},
            "waterfall" : waterfallChartConfig,
            "horizontal_waterfall" : waterfallChartConfig
        }
    
        return result;
    })();

    return DefaultPropertiesHelper;
});
