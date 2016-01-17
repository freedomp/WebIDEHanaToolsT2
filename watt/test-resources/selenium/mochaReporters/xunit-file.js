/**
 * Module dependencies.
 */

var mocha = require("mocha")
  , Base = mocha.reporters.Base
  , utils = mocha.utils
  , escape = utils.escape
  , fs = require("fs")
  , path = require("path")
  , mkdirp = require("mkdirp")
  , filePath = process.env.XUNIT_FILE || process.cwd() + "/xunit.xml"
  , consoleOutput = {
        "suite" : true,
        "test" : true,
        "fail" : false
    };

/**
 * Save timer references to avoid Sinon interfering (see GH-237).
 */

var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;

/**
 * Expose `XUnitFile`.
 */

exports = module.exports = XUnitFile;

/**
 * Initialize a new `XUnitFile` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function XUnitFile(runner) {
  Base.call(this, runner);
  var stats = this.stats
    , tests = []
    , fd;

  /**
   * Create the test XML file and append the header
   */
  runner.on('start', function () {
      mkdirp.sync(path.dirname(filePath));
      if (fs.existsSync(filePath)) {
          var fileContent = fs.readFileSync(filePath);
          if (fileContent.length >= 14) {
              fs.truncateSync(filePath, fileContent.length - 14);
          }
          fd = fs.openSync(filePath, 'a', 0755);
      } else {
          // File does not exist - create the file and write the header
          fd = fs.openSync(filePath, 'w', 0755);
          appendLine(fd, '<testsuites disabled="" errors="" failures="" name="" tests="" time="">');
      }

  });

  /**
   * Append the footer and close the test XML file
   */
  runner.on('end', function () {
      appendLine(fd, '</testsuites>');
      fs.closeSync(fd);
  });

  runner.on('suite', function(suite){
    if(consoleOutput.suite){
      console.log('  ' + suite.title);
    }
  });

  runner.on('test', function(test){
    if(consoleOutput.test){
      console.log('  ◦ ' + test.title);
    }
  });

  runner.on('pass', function(test){
    tests.push(test);
  });

  runner.on('fail', function(test){
    if(consoleOutput.fail){
      console.log('  - ' + test.title);
    }
    tests.push(test);
  });

  runner.on('pending', function(test) {
      tests.push(test);
  });

  runner.on('suite end', function(){
    
    appendLine(fd, tag('testsuite', {
        name: process.env.SUITE_NAME || 'Mocha Tests'
      , tests: stats.tests
      , failures: stats.failures
      , errors: stats.failures
      , skipped: stats.tests - stats.failures - stats.passes
      , timestamp: (new Date).toUTCString()
      , time: stats.duration / 1000
    }, false));

    tests.forEach(function(test){
      writeTest(fd, test);
    });

    // Reset tests since they were already written to the file
    tests = [];
    appendLine(fd, '</testsuite>');
  });
}

/**
 * Inherit from `Base.prototype`.
 */

XUnitFile.prototype.__proto__ = Base.prototype;

/**
 * Output tag for the given `test.`
 */

function writeTest(fd, test) {
  var attrs = {
      classname: test.parent.fullTitle()
    , name: test.title
    // , time: test.duration / 1000 //old
    ,time: test.duration ? test.duration / 1000 : 0 //new
  };

  if ('failed' == test.state) {
    var err = test.err;
    appendLine(fd, tag('testcase', attrs, false, tag('failure', { message: escape(err.message) }, false, cdata(err.stack)) /*+ tag('system-out', {}, false, cdata(test.parent.ctx.attachments.join("\n")))*/));
  } else if (test.pending) {
    delete attrs.time;
    appendLine(fd, tag('testcase', attrs, false, tag('skipped', {}, true)));
  } else {
    appendLine(fd, tag('testcase', attrs, true) );
  }
}

/**
 * HTML tag helper.
 */

function tag(name, attrs, close, content) {
  var end = close ? '/>' : '>'
    , pairs = []
    , result;

  for (var key in attrs) {
    pairs.push(key + '="' + escape(attrs[key]) + '"');
  }

  result = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
  if (content) result += content + '</' + name + end;
  return result;
}

/**
 * Return cdata escaped CDATA `str`.
 */

function cdata(str) {
  return '<![CDATA[' + escape(str) + ']]>';
}

function appendLine(fd, line) {
    if (process.env.LOG_XUNIT) {
        console.log(line);
    }
    fs.writeSync(fd, line + "\n", null, 'utf8');
}
