({  // Configuration for "requireJs"'s JavaScript packager/optimizer/minifyer, details:
    //   http://requirejs.org/docs/optimization.html#options
    // ${...} are substituted in maven build (see requirejs-maven-plugin config in pom.xml)
    // for local generation
    // call it via:
    //C:\wbem\git\rndjs>c:\wbem\nodejs\node.exe c:\wbem\nodejs\r.js -o WebContent\commonddl\_optimize_local_config.js

    optimize: 'none',
    baseUrl: '../',
    name: 'commonddl/commonddl',
    paths: {
        'commonddl':  'commonddl'
        //,
        //'rndrt': '../../rndrt'
    },
    exclude : [
      'rndrt/rnd'
    ],
    out: '../_target/commonddl.js'
});
