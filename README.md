# IgnitionJS v4.1.0

IgnitionJS is a fast and flexible, script loader/bootstrapper for AngularJS. IgnitionJS utilizes Cars.com's fork of LABjs to provide simple mechanisms for non-intrusive dependency management, script loading, and function queueing. IgnitionJS is not an attempt to replicate the functionality of module frameworks such as RequireJS (AMD) or CommonJS; instead, it is intended to provide a simple and efficient alternative to these systems with a strong focus on AngularJS.

IngitionJS was built to provide a simple framework which addresses the front-end performance challenges that come with running AngularJS atop an enterprise platform. More specifically, it provides a solution for allowing contributors to place any module on any page without having to load all of the JS required for every module. IgnitionJS solves this problem through the implementation of a simple registration framework. Any module defined within the platform can effectively register its corresponding AngularJS module (along with any dependecies and additional bootstrapping) so that when the page is dynamically generated, it loads and executes exactly what it needs and nothing more.

Instead of explict dependency declarations (through comments, closures, configurations, or otherwise), IgnitionJS implements a tier-based loading and execution system with an easy to learn, easy to configure API.

## Bower Install

```text
bower install ignition
```

## Download

* [ignition.js](http://git.cars.com/projects/FE/repos/ignition/browse/dist/ignition.js)
* [ignition.min.js](http://git.cars.com/projects/FE/repos/ignition/browse/dist/ignition.min.js)

### Examples


```html
<!doctype html>
<html>
    <head>
        <title>Examples</title>

        <!-- LABjs is required by IgnitionJS -->
        <script src="js/vendor/LAB/LAB.min.js" />

        <!-- Include IgnitionJS -->
        <script src="js/vendor/ignition/ignition.min.js" />

        <script>

            // Use the Ignition constructor to create a new global instance.
            // In this example, we'll name it `ignition`...

            var ignition = new Ignition(

                    // Every Ingition instance can be configured via an options
                    // object.

                    {
                        // There are many options available.
                        //
                        // Here we define the `sources` options property to
                        // assign to names to sources.
                        sources: {
                            angular: 'js/vendor/angular/angular.min.js',
                            lodash: 'js/vendor/lodash/lodash.min.js',
                            gpt: '//www.googletagservices.com/tag/js/gpt.js',
                            optimizely: '//cdn.optimizely.com/js/7544042.js',
                            facebook: '//connect.facebook.net/en_US/sdk.js#xfbml=1'
                        },

                        // Here we define the `tiers` options property.

                        tiers: [

                            // `tiers` is an array, each item represents a
                            // loading & execute tier. Each tier accepts
                            // an options object.

                            // Here we provide options for the first tier.

                            {
                                // For any given tier, you can define `aliases`
                                // which are more semantic names by which to
                                // reference the tier you are configuring. Any
                                // alias defined here will be added as a
                                // property on the Ignition instance.

                                // For example, by defining `libraries` in the
                                // array below, `ignition.libraries` becomes
                                // an alias for `ignition.tiers[0]`.

                                aliases: [
                                    'libraries',
                                    'standalone'
                                ]
                            },

                            // Here we provide options for the second tier.

                            {

                                aliases: [
                                    'plugins',
                                    'extensions',
                                    'ads'
                                ]
                            }

                        ]

                    }
                );

            // Here we are registering both AngularJS and lodash to be loaded
            // as part of the first tier.

            // Note the use of the `libraries` alias previously defined above.

            ignition.libraries.register([
                'angular',
                'lodash'
            ]);

            // Here we register a bundle along with the names of the two 
            // Angular modules which it contains

            ignition.bundles.register('myBundle', [ 'common', 'user' ]);

            // This will load the file {{bundlesDir}}/myBundle.js and bootstrap
            // two Angular modules: 'common' and 'user'

            // If you would like to load a bundle containing a single module of
            // the same name, you can use this shorthand

            ignition.bundles.register('common');

            // This will load the file {{bundlesDir}}/common.js and bootstrap an Angular module called 'common'

            
            // Here we're registering the Google Publisher Tags (GPT) library
            // as a first tier dependency. We could have also added this to
            // the sources registered in the array above (Angular and lodash),
            // but if this page was being dynamically compiled on the
            // server-side, a separate registration call, such as this, would
            // be needed.

            ignition.libraries.register('gpt');

            // Many times, we not only need to load scripts, but we also need
            // to run some code to configure or initialize these scripts.

            // Here we register an anonymous function to be called after the
            // first tier (`libraries`) has finished loading. In this
            // specific example, we initialize GPT and define an ad slot.

            ignition.libraries.registerFn(function () {

                var googletag = googletag || {};
                googletag.cmd = googletag.cmd || [];
                googletag.cmd.push(function() {
                    googletag.defineSlot("/1234/travel/asia/food", [[468, 60], [728, 90], [300, 250]], "div-gpt-ad-123456789-1")
                        .addService(googletag.pubads())
                        .setTargeting("interests", ["sports", "music", "movies"]);
                        .setTargeting("gender", "male")
                        .setTargeting("age", "20-30");
                    googletag.pubads().setTargeting("topic","basketball");
                    googletag.pubads().enableSingleRequest();
                    googletag.enableServices();
                });

            });

            // Occasionally there will be some code which you only want to run
            // after everything else has been completely loaded and
            // bootstrapped. To accomplish this, IngitionJS provides one
            // additional execution tier accessible via the `ready` property.

            // Here we include optimizely in the first tier and then activate
            // optimizely by registering a function to the `ready` tier.
            // We append `optimizely` with a `?` so that this will be loaded as an
            // optional dependency. If optimizely fails to load for any reason,
            // remaining scripts will still continue to load.

            ignition.libraries.register('optimizely?');
            ignition.ready.registerFn(function () {
                window.optimizely.push(["activate"]);
            });

        </script>
    </head>
    <body>

        <h1>IgnitionJS Example</h1>

        <!--

        Common Modules

        The following directives work because we've registered the modules they
        are dependent on in the document head.

        -->
        <my-common-directive></my-common-directive>
        <my-user-directive></my-user-directive>



        <!--

        Module with Third-Party Dependency

        Assume the following block has been rendered via server-side include.
        It needs to register an additional dependency (facebook sdk)
        as well as an additional AngularJS module before the directive it
        contains will work.

        -->
        <script>

            ignition.libraries.register('facebook');
            ignition.bundles.register('social');

        </script>
        <my-social-directive></my-social-directive>



        <!--

        Function Registration

        As with the above example, assume the following block has been rendered
        via server-side include. In this example, we make a GPT ad call by
        registering a function to be called on the second tier. Note we use
        the alias `ads` which we defined in the page head. Also note, we're
        registering this function to the second tier instead of the first to
        ensure that the GPT bootstrapping which we registered on the first tier
        runs prior to our attempt to make an the ad call.

        -->
        <div id="div-gpt-ad-123456789-1">
            <script type="text/javascript">

                ignition.ads.registerFn(function () {

                     googletag.cmd.push(function() {
                         googletag.display("div-gpt-ad-123456789-1");
                     });

                 });

            </script>
        </div>


        <!--

        Finally, we call `load` immediately before the closing body tag to kick things off.

        -->
        <script>
            ignition.load();
        </script>

    </body>
</html>
```

### Additional configuration options

```js
var ignition = new Ignition({

        // Bundle tier options

        bundles: {

            // `bundles.dir` sets the base bundles directory

            dir: '/js/bundles',

            // `bundles.validation` is a predicate function which is used to validate module names

            validation: function (subject) { return ((typeof subject === 'string') && /^[A-Za-z\-]+\w*$/.test(subject)); },

            // `bundles.modules` is a map which assigns a set of module names to a given bundle
            bundles: {
                'common': [ 'commom', 'user', 'social' ]
            }

        },

        // `bootstrap` overrides the default angular bootstrap callback

        bootstrap: function (modules) {
            angular.bootstrap(document.getElementById('app'), modules);
        },

        // Dependency tier options

        tiers: [

            // First tier

            // Include an empty object for any tier for which you do not
            // want to provide any additional configuration. Defaults will
            // be applied.

            {},

            // Second tier

            {
                // As shown in the above example, you can define as many
                // aliases for any given tier as you need...

                aliases: [ 'base', 'first' ],

                // You can provide an optional predicate function for
                // validating all source registration attempts. If you
                // don't provide a validation function, any string value
                // will be accepted.

                validation: function (subject) { return /^\/vendor\/js\//.test(subject); }

            }

            // ... you can continue add as many tier configuration objects as you need.

        ]
    });
```

## Build

```text
gulp
gulp watch
```

## Lint

```text
gulp lint
```

## Test

```text
gulp test
gulp test --watch
gulp test --coverage
```

Requires LABjs 2.0.3 <http://labjs.com/>.
