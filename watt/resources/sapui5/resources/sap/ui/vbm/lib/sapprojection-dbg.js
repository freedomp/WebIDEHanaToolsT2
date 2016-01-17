// ...........................................................................//
// this module deals with the projections ...................................//

// Author: Jürgen Gatter
/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
VBI.LinearProjection = function(target) {
	"use strict";
	var projection = {};
	projection.vbiclass = "Projection/Linear";
	projection.m_nXYRatio = 2;
	projection.m_nXMin = -2;
	projection.m_nXMax = 2;
	projection.m_nGeometrySize = 4;

	projection.m_nUCSMin = -0.5;
	projection.m_nUCSMax = 1.5;
	projection.m_bIsIsogonal = true;

	projection.LonLatToUCS = function(lonlat, uxy) {
		var xSize = uxy[0];
		var ySize = uxy[1];
		uxy[0] = xSize * (0.5 + lonlat[0] / Math.PI);
		uxy[1] = ySize * (0.5 - lonlat[1] / Math.PI);
		return uxy;
	};

	projection.UCSToLonLat = function(uxy, lonlat) {
		lonlat[0] = Math.PI * (projection.m_nUCSMin + uxy[0] / 2);
		lonlat[1] = -Math.PI * (uxy[1] / 2);
		return lonlat;
	};

	return projection;
};

VBI.MercatorProjection = function(target) {
	"use strict";
	var projection = {};
	projection.vbiclass = "Projection/Mercator";
	projection.m_nXYRatio = 1;
	projection.m_nXMin = -1;
	projection.m_nXMax = 1;
	projection.m_nGeometrySize = 2;

	projection.m_nUCSMin = 0;
	projection.m_nUCSMax = 1;
	projection.m_bIsIsogonal = true;

	projection.LonLatToUCS = VBI.MathLib.LonLatToUCS;
	projection.UCSToLonLat = VBI.MathLib.UCSToLonLat;

	return projection;

};
