RequirePaths.setRequireJsConfigForHanaDdl(2);

require(
    [
        "rndrt/rnd", "hanaddl/hanaddlNonUi", "commonddl/commonddlNonUi",
        "hanaddl/BaseCdsDdlParser",
        "commonddl/astmodel/SourceRangeImpl",
        "commonddl/astmodel/EObjectContainmentEList"
    ],

    function (rnd, hanaddlNonUi, commonddlNonUi, BaseCdsDdlParser, SourceRangeImpl, EObjectContainmentEList) {
        "use strict";

        var NEXT_TOKEN_INDEX = 42;
        var LAST_TOKEN_INDEX = 59;

        var baseParser = new BaseCdsDdlParser();
        baseParser.getNextTokenIndex = function() {
            return NEXT_TOKEN_INDEX;
        };
        baseParser.getLastMatchedTokenIndex = function() {
            return LAST_TOKEN_INDEX;
        };


        test("startRule_and_endRule", function (assert) {
            var rule = baseParser.startRule("MyRule");

            assert.ok(rule instanceof SourceRangeImpl, "Opened rule must be derived from SourceRangeImpl");
            assert.equal("MyRule", rule.constructor.name, "Rule must be derived from (synthetic) MyRule prototype");

            assert.equal(NEXT_TOKEN_INDEX, rule.getStartTokenIndex(), "Wrong start token index");
            assert.equal(-1, rule.getEndTokenIndex(), "Wrong end token index");

            assert.ok("endRule" in rule, "Opened rule must contain endRule() method");
            assert.ok("attachChild" in rule, "Opened rule must contain attachChild() method");
            assert.ok("linkToParent" in rule, "Opened rule must contain linkToParent() method");

            rule.endRule();
            assert.equal(LAST_TOKEN_INDEX, rule.getEndTokenIndex(), "Wrong end token index");

            assert.ok(!("endRule" in rule), "Finished rule must not contain endRule() method");
            assert.ok(!("attachChild" in rule), "Finished rule must not contain attachChild() method");
            assert.ok(!("linkToParent" in rule), "Finished rule must not contain linkToParent() method");
        });

        test("startArrayRule_and_endRule_unparented", function (assert) {
            var rule = baseParser.startArrayRule("MyArrayRule");
            rule.level2 = true;

            assert.ok(rule instanceof EObjectContainmentEList, "Opened rule must be derived from EObjectContainmentEList");
            assert.equal("MyArrayRule", rule.constructor.name, "Rule must be derived from (synthetic) MyArrayRule prototype");

            assert.equal(NEXT_TOKEN_INDEX, rule.startTokenIndex, "Wrong start token index");
            assert.equal(-1, rule.endTokenIndex, "Wrong end token index");

            assert.ok("endRule" in rule, "Opened rule must contain endRule() method");
            assert.ok("attachChild" in rule, "Opened rule must contain attachChild() method");
            assert.ok("linkToParent" in rule, "Opened rule must contain linkToParent() method");

            var o = {
                level3:true,
                setContainer : function(parent) {
                    this.c = parent;
                }
            };

            assert.equal(0,rule.length);
            rule.attachChild(o);
            assert.equal(1,rule.length);
            assert.equal(o,rule[0]);
            assert.equal(rule, o.c, "container must be array before endRule() called");

            // Test case: attachChild done before array's parent set.
            rule.linkToParent({level1:true});

            rule.endRule();
            assert.equal(rule.owner,o.c,"Container of array element must be owner of array after endRule() called.");

            assert.equal(LAST_TOKEN_INDEX, rule.endTokenIndex, "Wrong end token index");

            assert.ok(!("endRule" in rule), "Finished rule must not contain endRule() method");
            assert.ok(!("attachChild" in rule), "Finished rule must not contain attachChild() method");
            assert.ok(!("linkToParent" in rule), "Finished rule must not contain linkToParent() method");
        });

        test("startArrayRule_and_endRule_lazyParented", function (assert) {
            var parent = {level1:true};
            var rule = baseParser.startArrayRule("MyArrayRule", parent);
            rule.level2 = true;

            assert.ok(rule instanceof EObjectContainmentEList, "Opened rule must be derived from EObjectContainmentEList");
            assert.equal("MyArrayRule", rule.constructor.name, "Rule must be derived from (synthetic) MyArrayRule prototype");

            assert.equal(NEXT_TOKEN_INDEX, rule.startTokenIndex, "Wrong start token index");
            assert.equal(-1, rule.endTokenIndex, "Wrong end token index");

            assert.ok("endRule" in rule, "Opened rule must contain endRule() method");
            assert.ok("attachChild" in rule, "Opened rule must contain attachChild() method");
            assert.ok("linkToParent" in rule, "Opened rule must contain linkToParent() method");

            var o = {
                level3:true,
                setContainer : function(parent) {
                    this.c = parent;
                }
            };

            assert.equal(0,rule.length);

            var propName = "myArrayRule";
            assert.ok(!(propName in parent), "Parent must not have array unless it contains children");

            rule.attachChild(o);

            assert.ok(propName in parent, "Parent must have array if it contains children");

            assert.equal(1,rule.length);
            assert.equal(o,rule[0]);
            assert.equal(rule.owner, o.c, "container must be parent even before endRule() called");

            rule.endRule();
            assert.equal(rule.owner,o.c,"Container of array element must be owner of array after endRule() called.");

            assert.equal(LAST_TOKEN_INDEX, rule.endTokenIndex, "Wrong end token index");

            assert.ok(!("endRule" in rule), "Finished rule must not contain endRule() method");
            assert.ok(!("attachChild" in rule), "Finished rule must not contain attachChild() method");
            assert.ok(!("linkToParent" in rule), "Finished rule must not contain linkToParent() method");
        });

        test("startArrayRule_and_endRule_preParented", function (assert) {
            var parent = {level1:true};
            var rule = baseParser.startArrayRule("MyArrayRule", parent, true);
            rule.level2 = true;

            assert.ok(rule instanceof EObjectContainmentEList, "Opened rule must be derived from EObjectContainmentEList");
            assert.equal("MyArrayRule", rule.constructor.name, "Rule must be derived from (synthetic) MyArrayRule prototype");

            assert.equal(NEXT_TOKEN_INDEX, rule.startTokenIndex, "Wrong start token index");
            assert.equal(-1, rule.endTokenIndex, "Wrong end token index");

            assert.ok("endRule" in rule, "Opened rule must contain endRule() method");
            assert.ok("attachChild" in rule, "Opened rule must contain attachChild() method");
            assert.ok("linkToParent" in rule, "Opened rule must contain linkToParent() method");

            var o = {
                level3:true,
                setContainer : function(parent) {
                    this.c = parent;
                }
            };

            assert.equal(0,rule.length);

            var propName = "myArrayRule";
            assert.ok(propName in parent, "Parent must have array even it does not contain children");

            rule.attachChild(o);

            assert.ok(propName in parent, "Parent must have array if it contains children");

            assert.equal(1,rule.length);
            assert.equal(o,rule[0]);
            assert.equal(rule.owner, o.c, "container must be parent even before endRule() called");

            rule.endRule();
            assert.equal(rule.owner,o.c,"Container of array element must be owner of array after endRule() called.");

            assert.equal(LAST_TOKEN_INDEX, rule.endTokenIndex, "Wrong end token index");

            assert.ok(!("endRule" in rule), "Finished rule must not contain endRule() method");
            assert.ok(!("attachChild" in rule), "Finished rule must not contain attachChild() method");
            assert.ok(!("linkToParent" in rule), "Finished rule must not contain linkToParent() method");
        });

        test("attachChild_on_rule", function (assert) {
            var rule = baseParser.startRule("MyRule");

            var ruleChild = baseParser.startRule("MyRuleChild");

            rule.attachChild(ruleChild);

            assert.equal(ruleChild, rule.myRuleChild, "RuleChild expected as property 'myRuleChild' on rule");
            assert.equal(rule, ruleChild.eContainer(), "Rule expected as container of ruleChild");
        });

        test("attachChild_on_arrayRule", function (assert) {
            var rule = baseParser.startArrayRule("MyArrayRule");

            var ruleChild = baseParser.startRule("MyRule");

            rule.attachChild(ruleChild);

            assert.equal(ruleChild, rule[0], "RuleChild expected as array element on rule");
            assert.equal(rule, ruleChild.eContainer(), "Rule expected as container of ruleChild before endRule()");

            rule.linkToParent({level1:true});
            rule.endRule();
            assert.equal(rule.owner, ruleChild.eContainer(), "Rule's owner expected as container of ruleChild after endRule()");
        });

        test("tokenAndValue", function (assert) {
            var tav = baseParser.tokenAndValue("MyToken", 1);

            assert.ok(tav instanceof SourceRangeImpl, "TokenAndValue must be derived from SourceRangeImpl");
            assert.equal("TokenAndValue", tav.constructor.name, "TokenAndValue must be derived from (synthetic) TokenAndValue prototype");

            assert.equal("MyToken", tav.token, "Expected token is wrong");
            assert.equal(1, tav.value, "Expected value is wrong");

            var ruleValue = baseParser.startRule("MyRuleValue");
            tav = baseParser.tokenAndValue("MyToken", ruleValue);
            assert.equal(ruleValue, tav.value, "Expected value is wrong");
            assert.equal(tav, ruleValue.eContainer(), "RuleValue must have TokenAndValue as container");
        });

        test("linkChild_to_classicParent", function (assert) {
            var rule = baseParser.startRule("MyRule");

            var classicParent = {};

            rule.linkToParent(classicParent);

            assert.equal(classicParent, rule.eContainer(), "Rule must have classicParent as container");
            assert.equal(rule, classicParent.myRule, "Rule must be property 'myRule' on classicParent");
        });

        test("nestedArrays_reparent_lateIntoRoot", function (assert) {
            var array1 = baseParser.startArrayRule("MyArrayRule1");
            var array2 = baseParser.startArrayRule("MyArrayRule2");
            var object3 = baseParser.startRule("MyRule3");

            array2.attachChild(object3);
            assert.equal(array2, object3.eContainer());

            array1.attachChild(array2);

            assert.equal(array1, object3.eContainer());
            assert.equal(null, array1.owner);
            assert.equal(array1, array2.owner);

            var object0 = {level0:true};
            array1.linkToParent(object0);

            assert.equal(object0.myArrayRule1, array1);
            assert.equal(object0, array1.owner);

            assert.equal(array1, array2.owner);
            assert.equal(array1[0], array2);

            assert.equal(array2[0], object3);
            assert.equal(object0, object3.eContainer());
        });

        test("nestedArrays_reparent_lateLeaf", function (assert) {
            var array1 = baseParser.startArrayRule("MyArrayRule1");
            var array2 = baseParser.startArrayRule("MyArrayRule2");
            var object3 = baseParser.startRule("MyRule3");

            array1.attachChild(array2);

            assert.equal(null, array1.owner);
            assert.equal(array1, array2.owner);

            var object0 = {level0:true};
            array1.linkToParent(object0);

            assert.equal(object0.myArrayRule1, array1);
            assert.equal(object0, array1.owner);

            assert.equal(array1, array2.owner);
            assert.equal(array1[0], array2);

            array2.attachChild(object3);
            assert.equal(object0, object3.eContainer());
        });

        QUnit.start();
    }
);
