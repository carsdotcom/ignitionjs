describe('an ignition instance', function () {
    var ignition;

    beforeEach(function () {
        $LAB = {
            script: function () {
            }
        };
        angular = {
            bootstrap: function () {}
        };
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
                try {
                   ignition.registerModule('$foo');
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerModule(1);
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerModule([]);
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerModule({});
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerModule(function () {});
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
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
        describe('when called', function () {
            it('with an array should call registerModule once for each module in the given array', function () {
                spyOn(ignition, 'registerModule');
                ignition.registerModules([ 'foo', 'bar' ]);
                expect(ignition.registerModule.calls.count()).toEqual(2);
            });
            it('with something other than an array should throw an error', function () {
                try {
                    ignition.registerModules('foo');
                    expect(true).toEqual(false);
                } catch(e) {
                    expect(true).toEqual(true);
                }
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
                try {
                   ignition.registerDependency(1);
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerDependency([]);
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerDependency({});
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
                try {
                   ignition.registerDependency(function () {});
                   expect(true).toEqual(false);
                } catch(e) {
                   expect(true).toEqual(true);
                }
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
        describe('when called', function () {
            it('with an array should call registerDependency once for each module in the given array', function () {
                spyOn(ignition, 'registerDependency');
                ignition.registerDependencies([ 'foo', 'bar' ]);
                expect(ignition.registerDependency.calls.count()).toEqual(2);
            });
            it('with something other than an array should throw an error', function () {
                try {
                    ignition.registerDependencies('foo');
                    expect(true).toEqual(false);
                } catch(e) {
                    expect(true).toEqual(true);
                }
                try {
                    ignition.registerDependencies(1);
                    expect(true).toEqual(false);
                } catch(e) {
                    expect(true).toEqual(true);
                }
                try {
                    ignition.registerDependencies({});
                    expect(true).toEqual(false);
                } catch(e) {
                    expect(true).toEqual(true);
                }
                try {
                    ignition.registerDependencies(function () {});
                    expect(true).toEqual(false);
                } catch(e) {
                    expect(true).toEqual(true);
                }
            });
        });
    });

    describe('#buildModulePath', function () {
        beforeEach(function () {
            ignition = new Ignition();
        });
        it('should be a function', function () {
            expect(ignition.buildModulePath).toEqual(jasmine.any(Function));
        });
        describe('when called', function () {
            it('with a base directory and module name should return a formatted module path', function () {
                expect(ignition.buildModulePath('name', 'base/')).toEqual('base/name/name.js');
                expect(ignition.buildModulePath('name', 'base')).toEqual('base/name/name.js');
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
            it('should call $LAB.script with an array and then call $LAB.wait with a function', function () {
                spyOn($LAB, 'script').and.returnValue({
                    wait: function () {
                        return {
                            script: function () {
                                return { wait: function () {} };
                            }
                        };
                    }
                });
                ignition.load();
                expect($LAB.script).toHaveBeenCalledWith([]);
            });
        });
    });
});

