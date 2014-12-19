describe('an ignition instance', function () {
    var ignition, LabConstructor, newLab;

    beforeEach(function () {
        LabConstructor = function () {};
        newLab = function (arg) { if (typeof arg === 'function') arg(); return new LabConstructor(); };
        LabConstructor.prototype.script = newLab;
        LabConstructor.prototype.wait = newLab;
        $LAB = new LabConstructor();
        spyOn($LAB, 'script').and.callThrough();
        spyOn($LAB, 'wait').and.callThrough();
        angular = {
            bootstrap: function () {}
        };
    });

    describe('when instantiated with an options object', function () {
        describe('the dependencyValidation property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                function option() {}
                ignition = new Ignition({
                    dependencyValidation: option
                });
                expect(ignition.dependencyValidation).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        dependencyValidation: option
                    });
                }).toThrow();
            });
        });
        describe('the pluginValidation property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                function option() {}
                ignition = new Ignition({
                    pluginValidation: option
                });
                expect(ignition.pluginValidation).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        pluginValidation: option
                    });
                }).toThrow();
            });
        });
        describe('the moduleValidation property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                function option() {}
                ignition = new Ignition({
                    moduleValidation: option
                });
                expect(ignition.moduleValidation).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        moduleValidation: option
                    });
                }).toThrow();
            });
        });
        describe('the moduleDir property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                var option = 'foo';
                ignition = new Ignition({
                    moduleDir: option
                });
                expect(ignition.moduleDir).toEqual(option);
            });
            it('will throw if value is not of type `string`', function () {
                function option() {};
                expect(function () {
                    ignition = new Ignition({
                        moduleDir: option
                    });
                }).toThrow();
            });
        });
        describe('the moduleBootstrap property', function () {
            it('will be set based a property of the same name in the the options object', function () {
                function option() {};
                ignition = new Ignition({
                    moduleBootstrap: option
                });
                expect(ignition.moduleBootstrap).toEqual(option);
            });
            it('will throw if value is not of type `function`', function () {
                var option = 'foo';
                expect(function () {
                    ignition = new Ignition({
                        moduleBootstrap: option
                    });
                }).toThrow();
            });
        });
    });

    describe('#_isString', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `string`', function () {
            expect(ignition._isString('')).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `string`', function () {
            expect(ignition._isString(true)).toEqual(false);
            expect(ignition._isString(1)).toEqual(false);
            expect(ignition._isString(function () {})).toEqual(false);
            expect(ignition._isString({})).toEqual(false);
            expect(ignition._isString([])).toEqual(false);
        });
        it('should throw if called with an argument not of a type `string` and a truthy second argument is passed', function () {
            expect(function () { ignition._isString(true, true); }).toThrow();
            expect(function () { ignition._isString(1, true); }).toThrow();
            expect(function () { ignition._isString(function () {}, true); }).toThrow();
            expect(function () { ignition._isString({}, true); }).toThrow();
            expect(function () { ignition._isString([], true); }).toThrow();
        });
    });

    describe('#_isFunction', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `function`', function () {
            expect(ignition._isFunction(function () {})).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `function`', function () {
            expect(ignition._isFunction(true)).toEqual(false);
            expect(ignition._isFunction(1)).toEqual(false);
            expect(ignition._isFunction('foo')).toEqual(false);
            expect(ignition._isFunction({})).toEqual(false);
            expect(ignition._isFunction([])).toEqual(false);
        });
        it('should throw if called with an argument not of a type `function` and a truthy second argument is passed', function () {
            expect(function () { ignition._isFunction(true, true); }).toThrow();
            expect(function () { ignition._isFunction(1, true); }).toThrow();
            expect(function () { ignition._isFunction('foo', true); }).toThrow();
            expect(function () { ignition._isFunction({}, true); }).toThrow();
            expect(function () { ignition._isFunction([], true); }).toThrow();
        });
    });

    describe('#_isObject', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `object`', function () {
            expect(ignition._isObject({})).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `object`', function () {
            expect(ignition._isObject(true)).toEqual(false);
            expect(ignition._isObject(1)).toEqual(false);
            expect(ignition._isObject('foo')).toEqual(false);
            expect(ignition._isObject(function () {})).toEqual(false);
            expect(ignition._isObject([])).toEqual(false);
        });
        it('should throw if called with an argument not of a type `object` and a truthy second argument is passed', function () {
            expect(function () { ignition._isObject(true, true); }).toThrow();
            expect(function () { ignition._isObject(1, true); }).toThrow();
            expect(function () { ignition._isObject('foo', true); }).toThrow();
            expect(function () { ignition._isObject(function () {}, true); }).toThrow();
            expect(function () { ignition._isObject([], true); }).toThrow();
        });
    });

    describe('#_isArray', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should return `true` if called with an argument of type `array`', function () {
            expect(ignition._isArray([])).toEqual(true);
        });
        it('should return `false` if called with an argument not of type `array`', function () {
            expect(ignition._isArray(true)).toEqual(false);
            expect(ignition._isArray(1)).toEqual(false);
            expect(ignition._isArray('foo')).toEqual(false);
            expect(ignition._isArray(function () {})).toEqual(false);
            expect(ignition._isArray({})).toEqual(false);
        });
        it('should throw if called with an argument not of a type `array` and a truthy second argument is passed', function () {
            expect(function () { ignition._isArray(true, true); }).toThrow();
            expect(function () { ignition._isArray(1, true); }).toThrow();
            expect(function () { ignition._isArray('foo', true); }).toThrow();
            expect(function () { ignition._isArray(function () {}, true); }).toThrow();
            expect(function () { ignition._isArray({}, true); }).toThrow();
        });
    });

    describe('#_isRegistered', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given an array of strings and a string should return `true` if a matching string is found in the array', function () {
            expect(ignition._isRegistered([ 'foo', 'bar' ], 'foo')).toEqual(true);
        });
        it('given an array of functions and a function should return `true` if a matching function is found in the array', function () {
            /*eslint no-unused-vars:0*/
            expect(ignition._isRegistered(

                [
                    function () { var foo; },
                    function () { var bar; }
                ],

                function () { var foo; }

                )).toEqual(true);
        });
        it('given an array of functions and a function should return `false` if no matching function is found in the array', function () {
            /*eslint no-unused-vars:0*/
            expect(ignition._isRegistered(

                [
                    function () { var foo; },
                    function () { var bar; }
                ],

                function () { var baz; }

                )).toEqual(false);
        });
        it('will return false if second argument is a function but the collection is strings', function () {
            expect(ignition._isRegistered(['foo'], function() {})).toEqual(false);
        });
        it('will return false if second argument is not of either type `string` or `function`', function () {
            expect(ignition._isRegistered(['foo'], true)).toEqual(false);
            expect(ignition._isRegistered(['foo'], 1)).toEqual(false);
            expect(ignition._isRegistered(['foo'], [])).toEqual(false);
            expect(ignition._isRegistered(['foo'], {})).toEqual(false);
            expect(ignition._isRegistered([function () {}], true)).toEqual(false);
            expect(ignition._isRegistered([function () {}], 1)).toEqual(false);
            expect(ignition._isRegistered([function () {}], [])).toEqual(false);
            expect(ignition._isRegistered([function () {}], {})).toEqual(false);
        });
        it('will throw if first argument is not of type `array`', function () {
            expect(function () { ignition._isRegistered(''); }).toThrow();
        });
    });

    describe('#_generateRegistration', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given an array and a function should return a function', function () {
            expect(ignition._generateRegistration(['foo','bar'], function (foo) { return !!foo; })).toEqual(jasmine.any(Function));
        });
    });

    describe('#_registerMulti', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given a function and an array should call the given function once for each item in the array', function () {
            var spy = jasmine.createSpy(),
                arr = [ 'foo', 'bar' ];
            ignition._registerMulti(spy, arr);
            expect(spy.calls.count()).toEqual(arr.length);
        });
    });

    describe('#_execFunctionQueue', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('given an array of functions should call each function', function () {
            var spyOne = jasmine.createSpy(),
                spyTwo = jasmine.createSpy(),
                spyThree = jasmine.createSpy();
            ignition._execFunctionQueue([ spyOne, spyTwo, spyThree ]);
            expect(spyOne).toHaveBeenCalled();
            expect(spyTwo).toHaveBeenCalled();
            expect(spyThree).toHaveBeenCalled();
        });
    });

    describe('#getModules', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.getModules).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array', function () {
                var modules = ignition.getModules();
                expect(modules).toEqual(jasmine.any(Object));
                expect(modules.length).toEqual(jasmine.any(Number));
            });
        });
    });

    describe('#getModuleSources', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.getModuleSources).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array of the same length as getModules', function () {
                var arr, moduleSources;
                arr = [ 'foo', 'bar', 'baz' ];
                spyOn(ignition, 'getModules').and.callFake(function () {
                    return arr;
                });
                moduleSources = ignition.getModuleSources();
                expect(moduleSources).toEqual(jasmine.any(Object));
                expect(moduleSources.length).toEqual(arr.length);
            });
        });
    });

    describe('#registerModule', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerModule).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a valid module name which hasn\'t already been added should add the module to the modules array', function () {
                ignition.registerModule('foo');
                expect(ignition.getModules().indexOf('foo') >= 0).toEqual(true);
                expect(ignition.getModules().length === 1).toEqual(true);
            });
            it('with a valid module name which has already been added should not add the module to the modules array', function () {
                ignition.registerModule('foo');
                ignition.registerModule('foo');
                expect(ignition.getModules().length === 1).toEqual(true);
            });
            it('with a invalid module name should throw an error', function () {
                expect(function () { ignition.registerModule('$foo'); }).toThrow();
                expect(function () { ignition.registerModule(1); }).toThrow();
                expect(function () { ignition.registerModule([]); }).toThrow();
                expect(function () { ignition.registerModule({}); }).toThrow();
                expect(function () { ignition.registerModule(function () {}); }).toThrow();
            });
        });
    });

    describe('#registerModules', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerModules).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with registerModule and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.registerModules(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.registerModule, arr);
        });
    });

    describe('#getDependencies', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.getDependencies).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array', function () {
                var dependencies = ignition.getDependencies();
                expect(dependencies).toEqual(jasmine.any(Object));
                expect(dependencies.length).toEqual(jasmine.any(Number));
            });
        });
    });

    describe('#registerDependency', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerDependency).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a string which hasn\'t already been added should add the string to the dependencies array', function () {
                ignition.registerDependency('foo');
                expect(ignition.getDependencies().indexOf('foo') >= 0).toEqual(true);
                expect(ignition.getDependencies().length === 1).toEqual(true);
            });
            it('with a string which has already been added should not add the string to the dependencies array', function () {
                ignition.registerDependency('foo');
                ignition.registerDependency('foo');
                expect(ignition.getDependencies().length === 1).toEqual(true);
            });
            it('with something other than a string should throw an error', function () {
                expect(function () { ignition.registerDependency(1); }).toThrow();
                expect(function () { ignition.registerDependency([]); }).toThrow();
                expect(function () { ignition.registerDependency({}); }).toThrow();
                expect(function () { ignition.registerDependency(function () {}); }).toThrow();
            });
        });
    });

    describe('#registerDependencies', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerDependencies).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with registerDependency and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.registerDependencies(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.registerDependency, arr);
        });
    });

    describe('#registerPlugins', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerPlugins).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with registerPlugin and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.registerPlugins(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.registerPlugin, arr);
        });
    });

    describe('#registerDependencyBootstraps', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerDependencyBootstraps).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with registerDependencyBootstrap and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.registerDependencyBootstraps(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.registerDependencyBootstrap, arr);
        });
    });

    describe('#registerPluginBootstraps', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerPluginBootstraps).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with registerPluginBootstrap and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.registerPluginBootstraps(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.registerPluginBootstrap, arr);
        });
    });

    describe('#registerPostLoadBootstraps', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.registerPostLoadBootstraps).toEqual(jasmine.any(Function));
        });
        it('should call _registerMulti with registerPostLoadBootstrap and an array', function () {
            var arr = [ 'foo', 'bar' ];
            spyOn(ignition, '_registerMulti');
            ignition.registerPostLoadBootstraps(arr);
            expect(ignition._registerMulti).toHaveBeenCalledWith(ignition.registerPostLoadBootstrap, arr);
        });
    });

    describe('#getPlugins', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.getPlugins).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should return an array', function () {
                var plugins = ignition.getPlugins();
                expect(plugins).toEqual(jasmine.any(Object));
                expect(plugins.length).toEqual(jasmine.any(Number));
            });
        });
    });


    describe('#getModulePath', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.getModulePath).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a base directory and module name should return a formatted module path', function () {
                expect(ignition.getModulePath('name', 'base/')).toEqual('base/name/name.js');
                expect(ignition.getModulePath('name', 'base')).toEqual('base/name/name.js');
            });
        });
    });

    describe('#load', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.load).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('should throw if $LAB is not set', function () {
                $LAB = null;
                ignition = new Ignition();
                expect(function () { ignition.load(); }).toThrow();
            });
            it('should call $LAB.script with an array and then call $LAB.wait with a function', function () {
                ignition.load();
                expect($LAB.script).toHaveBeenCalledWith(jasmine.any(Function));
            });
            it('should call moduleBootstrap once', function () {
                spyOn(ignition, 'moduleBootstrap').and.callThrough();
                ignition.load();
                expect(ignition.moduleBootstrap.calls.count()).toEqual(1);
            });
            it('should call _execFunctionQueue three times', function () {
                spyOn(ignition, '_execFunctionQueue').and.callThrough();
                ignition.load();
                expect(ignition._execFunctionQueue.calls.count()).toEqual(3);
            });
        });
    });
});

