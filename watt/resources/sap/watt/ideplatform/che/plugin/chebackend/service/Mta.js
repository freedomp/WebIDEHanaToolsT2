define(["../dao/MtaDAO", "../util/PathMapping"], function (oMtaDao, mPathMapping) {
	"use strict";
	return {

		init: function () {
			var that = this;
	        this._mWorkspace = mPathMapping.workspace;

		},

		getProjectModules: function (sProjectPath) {
			return oMtaDao.getProjectModules(this._mWorkspace.id, sProjectPath);
		}
	};

});
