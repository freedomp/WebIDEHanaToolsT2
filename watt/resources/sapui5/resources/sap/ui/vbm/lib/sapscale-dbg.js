/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.SupportedUnitsOfLength = [
	{
		RequestedUnit: "km",
		DisplayUnitDefault: "m",
		DisplayUnit2: "km",
		ConvFactor: 1000.0,
		ConvFactorMeter: 1.0
	}, {
		RequestedUnit: "mi",
		DisplayUnitDefault: "ft",
		DisplayUnit2: "mi",
		ConvFactor: 5280.0,
		ConvFactorMeter: 0.3048
	}, {
		RequestedUnit: "nm",
		DisplayUnitDefault: "ft",
		DisplayUnit2: "nm",
		ConvFactor: 6076.12,
		ConvFactorMeter: 0.3048
	}
];
VBI.Scale = function() {
	"use strict";
	var scale = {};
	scale.scene = null;
	scale.m_ID = null;
	scale.m_Image = null;
	scale.m_CurrentUnit = null;
	scale.m_DisplayUnit = null;
	scale.m_nDivider = 0;
	scale.m_nScalerLength = 0;
	scale.m_nDistance = 0;
	scale.m_bRtl = false;
	scale.clear = function() {

		var item = document.getElementById(scale.m_canvas.id);
		if (item) {
			item.parentNode.removeChild(item);
		}

		scale.m_Image = null;
		// remove scene reference..............................................//
		scale.scene = null;
	};

	scale.Awake = function(scene, target) {
		scale.scene = scene;
		var l_vbiObj = jQuery.sap.byId(target);
		scale.m_ID = jQuery(l_vbiObj).attr('id');
		scale.AppendCanvas();
	};

	scale.getId = function(a, b) {
		return b + '-' + a;
	};

	scale.AppendCanvas = function() {
		scale.m_bRtl = (document.dir == 'rtl') ? true : false;
		scale.m_canvas = document.createElement('canvas');
		scale.m_canvas.className = "vbi-scale";
// scale.m_canvas.style.position = "absolute";
// scale.m_canvas.style.zIndex = 5;
		scale.m_canvas.id = scale.getId('vbi-scale-canvas', scale.m_ID);
		scale.m_canvas.m_VBIType = "S";

		scale.scene.m_Div.appendChild(scale.m_canvas);
// if ( scale.m_bRtl )
// scale.m_canvas.style.right = "10px";
// else
// scale.m_canvas.style.left = "10px";
// scale.m_canvas.style.bottom = "10px";

	};

	scale.getConfig = function() {
		if (scale.m_CurrentUnit) {
			return scale.m_CurrentUnit;
		} else {
			var context = scale.scene.m_Ctx;
			var config, unit;
			if (context) {
				config = context.GetConfig();
			}
			if (config) {
				unit = config.GetData("UnitOfLength");
			}
			if (unit) {
				for (var nJ = 0; nJ < VBI.SupportedUnitsOfLength.length; ++nJ) {
					if (VBI.SupportedUnitsOfLength[nJ].RequestedUnit == unit) {
						scale.m_CurrentUnit = VBI.SupportedUnitsOfLength[nJ];
						break;
					}
				}
			}
		}
		if (!scale.m_CurrentUnit) {
			scale.m_CurrentUnit = VBI.SupportedUnitsOfLength[0];
		}
		return scale.m_CurrentUnit;
	};

	scale.getImage = function(lcb) {
		if (scale.m_Image) {
			return scale.m_Image;
		}

		var img = new Image();
		if (lcb) {
			img.onload = function() {
				if (typeof lcb === 'function') {
					lcb(img);
				}

				this.onload = null;
			};
		}

		img.src = sap.ui.resource("sap.ui.vbm", "themes/base/img/sapvisualbusiness.png");
		scale.m_Image = img;
		return img;
	};

	scale.CalcScaleDimensions = function() {
		var rect = scale.scene.GetInternalDivClientRect();

		var currentUnit = scale.getConfig();
		var ptStart = [
			parseInt(rect.width / 2 - 75, 10), parseInt(rect.height / 2, 10)
		];
		var ptMax = [
			ptStart[0] + 180, ptStart[1]
		];

		var dist = scale.scene.GetDistance(ptStart, ptMax);
		var displayDist;
		// convert to requested unit of length
		dist = dist * (1.0 / currentUnit.ConvFactorMeter);
		if (dist >= currentUnit.ConvFactor) {
			displayDist = parseInt(dist / currentUnit.ConvFactor, 10);
			scale.m_DisplayUnit = currentUnit.DisplayUnit2;
		} else {
			displayDist = dist;
			scale.m_DisplayUnit = currentUnit.DisplayUnitDefault;
		}

		var logarithm = parseInt(Math.log(displayDist) / Math.LN10, 10);

		displayDist = parseInt(displayDist / Math.pow(10, logarithm), 10);
		if (displayDist < 2) {
			displayDist = 1;
		} else if (displayDist < 5) {
			displayDist = 2;
		} else if (displayDist < 10) {
			displayDist = 5;
		}
		displayDist = parseInt(displayDist * Math.pow(10, logarithm), 10);

		// convert back
		var displayDistConv; // converted back into meters
		if (dist >= currentUnit.ConvFactor) {
			displayDistConv = displayDist * currentUnit.ConvFactor;
			displayDistConv = displayDistConv * currentUnit.ConvFactorMeter;
		} else {
			displayDistConv = displayDist * currentUnit.ConvFactorMeter;
		}

		// convert point to canvas ( apply offset )

// var ptStartOffset = [
// ptStart[0] - scale.scene.m_Canvas[0].getPixelLeft(), ptStart[1] - scale.scene.m_Canvas[0].getPixelTop()
// ];
		var ret = scale.scene.GetTargetPointForDistance(displayDistConv, ptStart);
		var ptEnd = [
			ret[0] + scale.scene.m_Canvas[0].getPixelLeft(), ret[1] + scale.scene.m_Canvas[0].getPixelTop()
		];

		// calculate the divider
		var tempDist = displayDist;
		var nDivider = 0;
		while (nDivider == 0 && tempDist > 0) {
			nDivider = tempDist % 5;
			tempDist /= 10;
		}
		if (nDivider != 2) {
			nDivider = 5;
		}

		// the scaler length
		var nScalerLength = Math.round(ptEnd[0] - ptStart[0]);

		// cross check
		// var nScalerLengthWithoutCorr = parseInt(((ptMax[0] - ptStart[0]) * displayDistConv) / dist, 10);

		if (nScalerLength > 60 && nScalerLength < (rect.right - rect.left)) {
			scale.m_nScalerLength = nScalerLength;
			scale.m_nDistance = displayDist;
			scale.m_nDivider = nDivider;
			return true;
		}

		return false;

	};

	scale.Update = function() {
		// left, top, width, height
		var rectLeft = [
			211, 304, 4, 8
		];
		var rectRightDark = [
			240, 304, 4, 8
		];
		var rectRightBright = [
			224, 304, 4, 8
		];
		var rectMidDark = [
			235, 304, 1, 8
		];
		var rectMidBright = [
			219, 304, 1, 8
		];
		var scaleDiv = document.getElementById(scale.m_canvas.id);
		if (!scaleDiv) {
			return;
		}
		var ctx = scaleDiv.getContext('2d');
		ctx.clearRect(0, 0, scale.m_canvas.width, scale.m_canvas.height);

		if (!scale.CalcScaleDimensions()) {
			return;
		}
		scale.m_canvas.width = scale.m_nScalerLength + 10;
		scale.m_canvas.height = 30;

		var image = scale.getImage(scale.scene.RenderAsync.bind(scale.scene));
		if (image) {
			// left side of the scale
			var leftOffset = 0;
			var topOffset = 20;
			ctx.drawImage(image, rectLeft[0], rectLeft[1], rectLeft[2], rectLeft[3], leftOffset, topOffset, rectLeft[2], rectLeft[3]);
			leftOffset += rectLeft[2];
			// mid parts of the scale
			var nDivider = 0;
			while (nDivider < scale.m_nDivider) {
				for (var nJ = 0; nJ < scale.m_nScalerLength / scale.m_nDivider; nJ++) {
					if (nDivider % 2) {// dark part
						ctx.drawImage(image, rectMidDark[0], rectMidDark[1], rectMidDark[2], rectMidDark[3], leftOffset, topOffset, rectMidDark[2], rectMidDark[3]);
						leftOffset += rectMidDark[2];
					} else {// bright part
						ctx.drawImage(image, rectMidBright[0], rectMidBright[1], rectMidBright[2], rectMidBright[3], leftOffset, topOffset, rectMidBright[2], rectMidBright[3]);
						leftOffset += rectMidBright[2];
					}
				}
				nDivider++;
			}
			// right side of the scale
			if (scale.m_nDivider % 2) {
				ctx.drawImage(image, rectRightBright[0], rectRightBright[1], rectRightBright[2], rectRightBright[3], leftOffset, topOffset, rectRightBright[2], rectRightBright[3]);
				leftOffset += rectRightBright[2];
			} else {
				ctx.drawImage(image, rectRightDark[0], rectRightDark[1], rectRightDark[2], rectRightDark[3], leftOffset, topOffset, rectRightDark[2], rectRightDark[3]);
				leftOffset += rectRightDark[2];
			}

			// now the text ( twice: in two different colors )
			var oldFillStyle = ctx.fillStyle;
			var oldFont = ctx.font;
			ctx.font = "12px arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "left";
			for (var nK = 0; nK < 2; ++nK) {
				ctx.fillText("0", nK, 15 + nK);
				var textOffset = scale.m_canvas.width - (ctx.measureText(scale.m_nDistance + scale.m_DisplayUnit).width + 1);
				ctx.fillText(scale.m_nDistance + scale.m_DisplayUnit, textOffset + nK, 15 + nK);
				ctx.fillStyle = "#212C34";
			}
			ctx.fillStyle = oldFillStyle;
			ctx.font = oldFont;
		}
	};

	return scale;
};
