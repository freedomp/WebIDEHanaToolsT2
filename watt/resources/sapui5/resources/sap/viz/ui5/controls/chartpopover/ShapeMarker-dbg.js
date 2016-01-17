/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Control'
    ],
function(jQuery, Control) {
    /**
     * @author I071838
     */
    var ShapeMarker = Control.extend('sap.viz.ui5.controls.chartpopover.ShapeMarker', {
        metadata : {
            properties : {
                'type' : 'string',
                'color' : 'string',
                'markerSize' : 'int'
            }
        },

        renderer : {
            render : function(oRm, oControl) {
                var markerSize = oControl.getMarkerSize() ? oControl.getMarkerSize() : 10;
                var props = {
                    rx : markerSize / 2,
                    ry : markerSize / 2,
                    type : oControl.getType(),
                    borderWidth : 0
                };
                oRm.write('<div');
                oRm.writeClasses();
                oRm.write('>');
                oRm.write('<svg width=' + markerSize + 'px height=' + markerSize + 'px ');
                oRm.write('>');
                if(props.type){
                    oRm.write("<path d = '" + oControl._generateShapePath(props) + "'");
                    oRm.write(" fill = '" + oControl.getColor() + "'");
                    oRm.write(" transform = 'translate(" + markerSize / 2 + "," + markerSize / 2 + ")'");
                    oRm.write('</path>');
                }
                oRm.write('</svg>');
                oRm.write('</div>');
                oRm.writeStyles();
            }
        }
    });

    ShapeMarker.prototype._generateShapePath = function(props) {
        var result;
        var temp = props.borderWidth / 2;
        switch(props.type) {
            case "circle" :
                result = "M" + (-props.rx - temp) + ",0 A" + (props.rx + temp) + "," + (props.ry + temp) + " 0 1,0 " + (props.rx + temp) + ",0 A";
                result += (props.rx + temp) + "," + (props.ry + temp) + " 0 1,0 " + (-props.rx - temp) + ",0z";
                break;
            case "cross" :
                result = "M" + (-props.rx - temp) + "," + (-props.ry / 3 - temp) + "H" + (-props.rx / 3 - temp) + "V" + (-props.ry - temp) + "H" + (props.rx / 3 + temp);
                result += "V" + (-props.ry / 3 - temp) + "H" + (props.rx + temp) + "V" + (props.ry / 3 + temp) + "H" + (props.rx / 3 + temp);
                result += "V" + (props.ry + temp) + "H" + (-props.rx / 3 - temp) + "V" + (props.ry / 3 + temp) + "H" + (-props.rx - temp) + "Z";
                break;
            case "diamond" :
                result = "M0," + (-props.ry - temp) + "L" + (props.rx + temp) + ",0" + " 0," + (props.ry + temp) + " " + (-props.rx - temp) + ",0" + "Z";
                break;
            case "square" :
                case "sector" :
                result = "M" + (-props.rx - temp) + "," + (-props.ry - temp) + "L" + (props.rx + temp) + ",";
                result += (-props.ry - temp) + "L" + (props.rx + temp) + "," + (props.ry + temp) + "L" + (-props.rx - temp) + "," + (props.ry + temp) + "Z";
                break;
            case "triangle-down" :
            //TODO: remove duplicate
            case "triangleDown" :
                result = "M0," + (props.ry + temp) + "L" + (props.rx + temp) + "," + -(props.ry + temp) + " " + -(props.rx + temp) + "," + -(props.ry + temp) + "Z";
                break;
            case "triangle-up" :
            //TODO: remove duplicate
            case "triangleUp" :
                result = "M0," + -(props.ry + temp) + "L" + (props.rx + temp) + "," + (props.ry + temp) + " " + -(props.rx + temp) + "," + (props.ry + temp) + "Z";
                break;
            case "triangle-left" :
            //TODO: remove duplicate
            case "triangleLeft" :
                result = "M" + -(props.rx + temp) + ",0L" + (props.rx + temp) + "," + (props.ry + temp) + " " + (props.rx + temp) + "," + -(props.ry + temp) + "Z";
                break;
            case "triangle-right" :
            //TODO: remove duplicate
            case "triangleRight" :
                result = "M" + (props.rx + temp) + ",0L" + -(props.rx + temp) + "," + (props.ry + temp) + " " + -(props.rx + temp) + "," + -(props.ry + temp) + "Z";
                break;
            case "intersection" :
                result = "M" + (props.rx + temp) + "," + (props.ry + temp) + "L" + (props.rx / 3 + temp) + ",0L" + (props.rx + temp) + "," + -(props.ry + temp) + "L";
                result += (props.rx / 2 - temp) + "," + -(props.ry + temp) + "L0," + (-props.ry / 3 - temp) + "L" + (-props.rx / 2 + temp) + "," + -(props.ry + temp) + "L";
                result += -(props.rx + temp) + "," + -(props.ry + temp) + "L" + -(props.rx / 3 + temp) + ",0L" + -(props.rx + temp) + "," + (props.ry + temp) + "L";
                result += (-props.rx / 2 + temp) + "," + (props.ry + temp) + "L0," + (props.ry / 3 + temp) + "L" + (props.rx / 2 - temp) + "," + (props.ry + temp) + "Z";
                break;
            case 'squareWithRadius' :
                var r = props.rx;
                var radius = r - 3;
                result = "M0," + -r + "L" + -radius + "," + -r + "Q" + -r + "," + -r + " " + -r + "," + -radius + "L" + -r + "," + radius + "Q" + -r + "," + r + " " + -radius + "," + r;
                result += "L" + radius + "," + r + "Q" + r + "," + r + " " + r + "," + radius + "L" + r + "," + -radius + "Q" + r + "," + -r + " " + radius + "," + -r + "Z";
                break;
        }
        //symbolMap[props] = result;
        return result;
    };
    
    return ShapeMarker;
});
