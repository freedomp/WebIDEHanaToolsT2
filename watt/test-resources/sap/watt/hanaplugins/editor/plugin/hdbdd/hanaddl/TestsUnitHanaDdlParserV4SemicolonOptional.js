//based on commit
//49c9fdd5c9953b189aadaf4a612170daeb91a74a CDS: Simplify parameterized tests
RequirePaths.setRequireJsConfigForHanaDdl(2);

define([ "rndrt/rnd", 
         "./AbstractV4HanaDdlParserTests"
         ], // dependencies
         function(rnd, AbstractV4HanaDdlParserTests) {
	var ErrorState = rnd.ErrorState;
	var Token = rnd.Token;
	function TestsUnitHanaDdlParserV4SemicolonOptional() {
	}
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype = Object.create(AbstractV4HanaDdlParserTests.prototype);
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsOptinalForContext = function() {
		var tokens = this.parseSource("CONTEXT c1 { CONTEXT c2{ } }");
		this.assertNoErrorTokens(tokens);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsOptinalForAccessPolicy = function() {
		var tokens = this.parseSource("ACCESSPOLICY acp1 {  }");
		this.assertNoErrorTokens(tokens);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsOptinalForRole = function() {
		var tokens = this.parseSource("ACCESSPOLICY acp1 { ROLE r1 {}; }");
		this.assertNoErrorTokens(tokens);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsOptinalForEntity = function() {
		var tokens = this.parseSource("CONTEXT c1 { ENTITY e1{ } ENTITY e1{ } }");
		this.assertNoErrorTokens(tokens);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsOptinalForStructured = function() {
		var tokens = this.parseSource("  TYPE t1 { e1 : Integer; e2 : Integer64; }");
		this.assertNoErrorTokens(tokens);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsNotOptinalForSimpleType = function() {
		var tokens = this.parseSource("  TYPE t1 : Integer ");
		equal(tokens[4].m_err_state, ErrorState.Erroneous);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsOptinalForStructuredInAnnotationDefinition = function() {
		var tokens = this.parseSource("  ANNOTATION a1 { e1 : Integer; e2 : Integer64; }");
		this.assertNoErrorTokens(tokens);
	};
	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.semicolonIsNotOptinalForSimpleTypeInAnnotationDefinition = function() {
		var tokens = this.parseSource("ANNOTATION a1 : Integer ");
		equal(tokens[4].m_err_state, ErrorState.Erroneous);
	};

	// TEST METHODS

	TestsUnitHanaDdlParserV4SemicolonOptional.prototype.testAllMethodsInSupportedVersions();

	QUnit.start();

});