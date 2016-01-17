/*eslint-disable no-eq-null,eqeqeq,camelcase*/
// based on commit
//f3bbf86a1daee77433bb9dca8cfffb1c525fcff6 StatementContainerImpl#isStatementContainerInstance
define(
    ["commonddl/DdlRndParserApi"], //dependencies
    function (DdlRndParserApi) {
        function DdlParserFactoryBackendVersion() {
        }
        DdlParserFactoryBackendVersion.prototype = Object.create(null);
        DdlParserFactoryBackendVersion.DDL_CONTENT_TYPE_XML = "application/vnd.sap.adt.ddl.ddlParserInfo.v1+xml";
        DdlParserFactoryBackendVersion.DDL_CONTENT_TYPE_TEXT = "text/plain";
        DdlParserFactoryBackendVersion.DDL_PROPERTY_PARSER_VERSION = "ddlParserVersion";
        DdlParserFactoryBackendVersion.SUPPORTED_ANNOTATION_NAME = "supportedAnnotationName";
        DdlParserFactoryBackendVersion.xmlPropertiesByProject = {};
        DdlParserFactoryBackendVersion.parserByProject = {};
        DdlParserFactoryBackendVersion.prototype.versionFactory = null;

		function PredefinedDataType() { } 
		PredefinedDataType.prototype.name = "";
		PredefinedDataType.prototype.pattern = "";
		PredefinedDataType.prototype.description = "";
		function DdlParserBackendInfo() { } 
		DdlParserBackendInfo.prototype.version = "";
		DdlParserBackendInfo.prototype.annotationDefinitions = "";
		DdlParserBackendInfo.prototype.predefinedDataTypeList = [];
        function DdlErrorneousParserBackendInfo(ts) {
            this.timestamp = ts;
        }
        DdlErrorneousParserBackendInfo.prototype.timestamp = 0;
      DdlParserFactoryBackendVersion.prototype.getVersionFactory = function() {
            if (this.versionFactory == null) {
                this.versionFactory = this.createVersionFactory();
            }
            return this.versionFactory;
        };
        DdlParserFactoryBackendVersion.prototype.getOrCreateParser = function(project) {
            var parser = DdlParserFactoryBackendVersion.parserByProject[project];
            if (parser != null) {
                return parser;
            }
            var version = this.mapToClientVersion(project);
            parser = this.createParser(version);
            var supportedAnnotations = this.getSupportedAnnotations3(project,parser,version);
            parser.setSupportedAnnotations(supportedAnnotations);
            if (project != null) {
                DdlParserFactoryBackendVersion.parserByProject[project] = parser;
            }
            return parser;
        };
        DdlParserFactoryBackendVersion.prototype.getSupportedAnnotations3 = function(project,parser,version) {
            var supportedAnnotations = null;
            if (DdlParserFactoryBackendVersion.xmlPropertiesByProject[project]) {
                var info = DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
                supportedAnnotations = this.getSupportedAnnotations3(info,parser,project);
            }
            return supportedAnnotations;
        };
        DdlParserFactoryBackendVersion.prototype.mapToClientVersion = function(project) {
        };
        DdlParserFactoryBackendVersion.prototype.createVersionFactory = function() {
        };
        DdlParserFactoryBackendVersion.prototype.releaseParser = function(project) {
            delete DdlParserFactoryBackendVersion.parserByProject[project];
            delete DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
        };
        /*global console*/
        var Console = null;
        if (typeof console !== "undefined") {
            Console = console;
        }else{
            Console = {log:function() {}};
        }

        DdlParserFactoryBackendVersion.prototype.getSupportedAnnotations3 = function(info,iDdlParser,project) {
            if (info == null) {
                return null;
            }
            var parseAnnotationDefinition = null;
            var source = info.annotationDefinitions;
            var version = DdlParserFactoryBackendVersion.getParserVersion(project);
            var resolver = this.createResolver(version);
            parseAnnotationDefinition = iDdlParser.parseAnnotationDefinition(resolver,source);
            if (parseAnnotationDefinition == null || parseAnnotationDefinition.getStatements() == null || parseAnnotationDefinition.getStatements().length == 0) {
                var projectName = project.getName();
                Console.log("DDL annotations for " + projectName + " couldn't be parsed! All features related to annoations will not work! ");
            }
            return parseAnnotationDefinition;
        };
        DdlParserFactoryBackendVersion.prototype.createParser = function(version) {
            return DdlRndParserApi.DdlRndParserApi8(version,this.getVersionFactory(),true,true,false,false,false,false,false);
        };
        DdlParserFactoryBackendVersion.prototype.createResolver = function(version) {
            return this.getVersionFactory().createPadFileResolver(version);
        };
        DdlParserFactoryBackendVersion.getParserVersion = function(project) {
            var parserVersion = null;
            if (DdlParserFactoryBackendVersion.xmlPropertiesByProject[project]) {
                var info = DdlParserFactoryBackendVersion.xmlPropertiesByProject[project];
                parserVersion = info.version;
            }
            return parserVersion;
        };
        DdlParserFactoryBackendVersion.isPropertiesForProjectExist = function(project) {
            throw new Error();
        };
        return DdlParserFactoryBackendVersion;
    }
);