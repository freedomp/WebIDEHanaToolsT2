// based on commit
// f822a4befb0df46f97a46045758275fe1b9c83d4 check annotation usages - mark them as red in syntax coloring run
RequirePaths.setRequireJsConfigForCommonCds(2);


define('TestsUnitAnnotationDefinitions',
    [ "rndrt/rnd", "commonddl/commonddlNonUi"

    ], // dependencies
    function(rnd, commonddlNonUi) {
        var DdlScanner = commonddlNonUi.DdlScanner;
        var AbstractDdlParser = commonddlNonUi.AbstractDdlParser;
        var RuleInfo = rnd.RuleInfo;
        var Stackframe = rnd.Stackframe;
        var RNDContext = rnd.RNDContext;
        var Instruction = rnd.Instruction;
        var ByteCode = rnd.ByteCode;
        
        function TestFiendlyRNDContext(stackframe, tokenIndex) {
            this.stackframe = stackframe;
            this.tokenIndex = tokenIndex;
        };
        TestFiendlyRNDContext.prototype.getStackframe = function () {
            return this.stackframe;
        };
        TestFiendlyRNDContext.prototype.getTokenIndex = function () {
            return this.tokenIndex;
        };   
        
        TestParser.prototype = Object.create(AbstractDdlParser.prototype);
        function TestParser(byte_code, scanner, repositoryAccess) {
            AbstractDdlParser.call(this, byte_code, scanner, repositoryAccess);
        };
        TestParser.prototype.getAnnotationDefinition2 = function(context, stopAtContextTokenIndex) {
            return AbstractDdlParser.prototype.getAnnotationDefinition2.call(this, context, stopAtContextTokenIndex);
        };
        
        function TestsUnitAnnotationDefinitions() {
        };
        TestsUnitAnnotationDefinitions.prototype.annotationDefinitionRecordCompoenentRule = function() {
            var source = "@EndUserText.label: 'Private view' @AbapCatalog.sqlViewName: 'ZP_vbapnew' define view v as select from sflight";
            var cut = new TestParser(this.getOrCreateByteCode(), this.createScanner(source), null);
            var annotDef = cut.getAnnotationDefinition2(this.createContext(AbstractDdlParser.RECORD_COMPONENT_RULE), false);
            equal("@EndUserText.label", annotDef);
        };
        TestsUnitAnnotationDefinitions.prototype.annotationDefinitionRecordCompoenentRuleStopAtTokenIndex = function() {
            var source = "@EndUserText.label: 'Private view' @AbapCatalog.sqlViewName: 'ZP_vbapnew' define view v as select from sflight";
            var cut = new TestParser(this.getOrCreateByteCode(), this.createScanner(source), null);
            var annotDef = cut.getAnnotationDefinition2(this.createContext(AbstractDdlParser.RECORD_COMPONENT_RULE), true);
            equal("@EndUserText", annotDef);
        };
        TestsUnitAnnotationDefinitions.prototype.annotationDefinitionPreAnnotationRuleStopAtTokenIndex = function() {
            var source = "@EndUserText.label: 'Private view' @AbapCatalog.sqlViewName: 'ZP_vbapnew' define view v as select from sflight";
            var cut = new TestParser(this.getOrCreateByteCode(), this.createScanner(source), null);
            var annotDef = cut.getAnnotationDefinition2(this.createContext(AbstractDdlParser.PRE_ANNOTATION_RULE), true);
            equal("EndUserText", annotDef);
        };
        TestsUnitAnnotationDefinitions.prototype.annotationDefinitionPostAnnotationRuleStopAtTokenIndex = function() {
            var source = "@EndUserText.label: 'Private view' @AbapCatalog.sqlViewName: 'ZP_vbapnew' define view v as select from sflight";
            var cut = new TestParser(this.getOrCreateByteCode(), this.createScanner(source), null);
            var annotDef = cut.getAnnotationDefinition2(this.createContext(AbstractDdlParser.POST_ANNOTATION_RULE), true);
            equal("EndUserText", annotDef);
        };
        TestsUnitAnnotationDefinitions.prototype.createContext = function(ruleName) {
            var rndContextStub = new TestFiendlyRNDContext(this.createStackframe(ruleName), 1);
            return rndContextStub;
        };
        TestsUnitAnnotationDefinitions.prototype.createStackframe = function(ruleName) {
            var stackframeStub = new Stackframe(null, this.createRuleInfo(ruleName), null);
            stackframeStub.getFirstTokenIndex = function() {
                return 0;
            }
            return stackframeStub;
        };
        TestsUnitAnnotationDefinitions.prototype.createRuleInfo = function(ruleName) {
            var ruleInfoStub = new RuleInfo(ruleName);
            return ruleInfoStub;
        };
        TestsUnitAnnotationDefinitions.prototype.createScanner = function(source) {
            var scanner = new DdlScanner(this.getOrCreateByteCode());
            scanner.setInput(source, new rnd.CursorPos(1, 1, null), new rnd.CursorPos(-1, -1, null));
            return scanner;
        };
        TestsUnitAnnotationDefinitions.prototype.bc = null;
        TestsUnitAnnotationDefinitions.prototype.getOrCreateByteCode = function() {
            if (this.bc != null) {
                return this.bc;
            }
            var instr = Instruction.createInstruction(Instruction.OP_PUSH_FRAME);
            this.bc = ByteCode.getTestByteCode([ instr, instr, instr, instr ]);
            return this.bc;
        };

        // TEST METHODS

        test("annotationDefinitionRecordCompoenentRule", function(assert) {
            var cut = new TestsUnitAnnotationDefinitions();
            cut.annotationDefinitionRecordCompoenentRule();
        });

        test("annotationDefinitionRecordCompoenentRuleStopAtTokenIndex", function(assert) {
            var cut = new TestsUnitAnnotationDefinitions();
            cut.annotationDefinitionRecordCompoenentRuleStopAtTokenIndex();
        });

        test("annotationDefinitionPreAnnotationRuleStopAtTokenIndex", function(assert) {
            var cut = new TestsUnitAnnotationDefinitions();
            cut.annotationDefinitionPreAnnotationRuleStopAtTokenIndex();
        });

        test("annotationDefinitionPostAnnotationRuleStopAtTokenIndex", function(assert) {
            var cut = new TestsUnitAnnotationDefinitions();
            cut.annotationDefinitionPostAnnotationRuleStopAtTokenIndex();
        });

        QUnit.start();
        return TestsUnitAnnotationDefinitions;
    });