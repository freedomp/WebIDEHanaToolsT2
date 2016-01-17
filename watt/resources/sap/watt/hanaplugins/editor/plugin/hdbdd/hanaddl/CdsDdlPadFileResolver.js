/*eslint-disable no-eq-null,eqeqeq,sap-browser-api-warning,guard-for-in,no-undef*/
define(
    ["rndrt/rnd","require"], //dependencies
    function (rnd,require) {

        function CdsDdlPadFileResolver(version, padFilePath) {
            this.version = version;
            this.padFilePath = padFilePath;
        }
        CdsDdlPadFileResolver.prototype = Object.create(null);
        CdsDdlPadFileResolver.prototype.version = "";
        CdsDdlPadFileResolver.prototype.padFilePath = "";


        function getPadFileContent(path) {
            if (rnd.Utils.stringEndsWith(path,".pad") === false || path.indexOf("?") >= 0 || path.indexOf("#") >= 0 ||
                path.indexOf("\n") > 0 || path.indexOf("&") >= 0){
                return null; // not a valid .pad file path
            }
            // limit XHR call to pad files
            var http = null;
            if ((typeof document !== "undefined") && document.defaultView.navigator.appName === "Microsoft Internet Explorer") {
                http = new ActiveXObject("Microsoft.XMLHTTP");
            } else if (typeof XMLHttpRequest !== "undefined") {
                http = new XMLHttpRequest();
            } else {
                var fs = require("fs");
                var res = fs.readFileSync(path, "utf8");
                return res;
            }

            http.open("GET", path, false);
            http.send(null);
            return http.responseText;
        }

        CdsDdlPadFileResolver.prototype.getPadFileContent = function() {
            var path = "";
            if (this.padFilePath != null && this.padFilePath.length > 0) {
                path = this.padFilePath + "/hanav" + this.version + "/CdsDdlParserJs.pad";
            } else {
                path = CdsDdlPadFileResolver.getPadFilePath() + "/hanav" + this.version + "/CdsDdlParserJs.pad";
            }
            var result = getPadFileContent(path);
            return result;
        };
        CdsDdlPadFileResolver.getPadFilePath = function () {
            var scripts = document.getElementsByTagName("script");
            if (scripts.length === 0) {
                //running in jsdom?
                return document.rnd_config.hanaddl_root ? document.rnd_config.hanaddl_root : "";
            }
            for (var q in scripts) {
                var s = scripts[q].src;
                if (s != null && rnd.Utils.stringEndsWith(s, "hanaddlNonUi.js")) { //find DdlParser.js entry in loaded scripts
                    var lind = s.lastIndexOf("/");
                    var p = s.substring(0,lind);
                    return p;
                }
            }
            return "";
        };
        CdsDdlPadFileResolver.prototype.getRelease = function() {
            var VersionsFactory = require("./VersionsFactory");
            if (this.version === VersionsFactory.version1) {
                return "cdsddl_1";
            }else if (this.version === VersionsFactory.version2) {
                return "cdsddl_2";
            }else if (this.version === VersionsFactory.version3) {
                return "cdsddl_3";
            }else if (this.version === VersionsFactory.version4) {
            	return "cdsddl_4";
            }else if (this.version === VersionsFactory.version5) {
            	return "cdsddl_5";
            }
            return null;
        };
        return CdsDdlPadFileResolver;
    }
);