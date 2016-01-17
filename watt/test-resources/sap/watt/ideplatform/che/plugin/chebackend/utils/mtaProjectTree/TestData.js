define(function () {

    return {
        "name": "root",
        "type": "folder",
        "content": [
            {
                "name": "mta_project",
                "type": "folder",
                "content": [
                    {
                        "name": "p1",
                        "type": "folder",
                        "content": [{
                                "name": ".codenvy",
                                "type": "folder",
                                "content": [
                                    {
                                        "name": "project.json",
                                        "type": "file",
                                        "content": '{ "type" : "blank" }'
                                    }
                                ]
                            }, {
                                "name": "someJsFile.js",
                                "type": "file",
                                "content": "{}"
                            }]
                    },
                    {
                        "name": "mta.yaml",
                        "type": "file",
                        "content": "ID: mta_project\nversion: 0.5.0\nmodules:\n    - name: p1\n      type: blank\n      path: p1\n      properties:\n          diLinkedProject: linkedProject\n          otherProperty: someProperty"
                    }
                ]
            }, {
                "name": ".codenvy",
                "type": "folder",
                "content": [
                    {
                        "name": "project.json",
                        "type": "file",
                        "content": '{"type":"mta","attributes":{},"description":"","builders":{"default":"mtabuilder","configs":{}},"mixinTypes":[],"runners":{"configs":{}}}'
                    }
                ]
            }
        ]

    };

});
