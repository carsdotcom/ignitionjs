# IgnitionJS v3.2.1

IgnitionJS is a fast and flexible, script loader/bootstrapper for AngularJS. IgnitionJS utilizes on LABjs to provide simple mechanisms for non-intrusive dependency management, script loading, and function queueing. IgnitionJS is not an attempt to replicate the functionality of module frameworks such as RequireJS (AMD) or CommonJS; instead, it is intended to provide a simple and efficient alternative to these systems with a strong focus on AngularJS.

IngitionJS was built to provide a simple framework which addresses the front-end performance challenges that come with running AngularJS atop an enterprise platform. More specifically, it provides a solution for allowing contributors to place any module on any page without having to load all of the JS required for every module. IgnitionJS solves this problem through the implementation of a simple registration framework. Any module defined within the platform can effectively register it's corresponding AngularJS module (along with any dependecies and additional bootstrapping) so that when the page is dynamically generated, it loads exactly what it needs and nothing more.

Instead of explict dependency declarations (through comments, closures, configurations, or otherwise), IgnitionJS implements a tier-based loading and execution system with an easy to learn, easy to configure API.

## Project Structure Requirements

IgnitionJS favors convention over configuration. To make use of IgnitionJS, you first must adhere the following structure within your modules directory.

```text
{{modulesDir}}/{{moduleName}}/{{moduleName}}.js
```

For example...

```text
/app/js/modules/common/common.js
```

Additionally, your AngularJS modules must use the same name as is used in the file system.

Building on the above example, inside `common.js` you would need to define a AngularJS module named `common`:

```js
angular.module('common');
```

This naming consistency is what allows IgnitionJS to work so simply. Please note that it's recommend that you use a build task (grunt or gulp) to create these single module files and that you adhere to standard AngularJS directory structure for each module within your original source.

Here's an example of what the structure of your original source might look like:

```text
/src/app/js/modules/common/common.js
/src/app/js/modules/common/controllers/navController.js
/src/app/js/modules/common/directives/navDirective.js
/src/app/js/modules/common/services/userService.js
/src/app/js/modules/common/filter/noFractionCurrency.js
```

Your build task would then concatenate all of these files into a single file (`/dist/app/js/modules/common/common.js`).

## Bower Install

```text
bower install ignition
```

## Download

* [ignition.js](http://git.cars.com/projects/FE/repos/ignition/browse/dist/ignition.js)
* [ignition.min.js](http://git.cars.com/projects/FE/repos/ignition/browse/dist/ignition.min.js)

## Usage

Once you have established a compatible project structure (see above), you're ready to configure IgnitionJS to handle all of script loading and bootstrapping.

_Complete API documentation coming soon!_

For the time being, please review the examples below...

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

            ignition.libraries.registerSrcs([
                'js/vendor/angular/angular.min.js',
                'js/vendor/lodash/lodash.min.js'
            ]);

            // Here we register a few AngularJS modules which we wish to be
            // common to every page.

            ignition.modules.register([
                'common',
                'user'
            ]);

            // Here we're registering the Google Publisher Tags (GPT) library
            // as a first tier dependency. Note that we've used the
            // `registerSrc` method to register a single source instead of the
            // `registerSrcs` method used above. We could have also added this
            // source to the array above, along with Angular and lodash, but
            // if this page was being dynamically compiled on the server-side,
            // a separate registration call, such as this, would be needed.

            ignition.libraries.registerSrc('//www.googletagservices.com/tag/js/gpt.js');

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

            ignition.libraries.registerSrc('//cdn.optimizely.com/js/7544042.js');
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

            ignition.libraries.registerSrc('//connect.facebook.net/en_US/sdk.js#xfbml=1');
            ignition.modules.register('social');

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

        // Module tier options

        modules: {

            // `modules.dir` sets the base modules directory

            dir: '/js/modules',

            // `modules.validation` is a predicate function which is used to validate module names

            validation: function (subject) { return ((typeof subject === 'string') && /^[A-Za-z\-]+\w*$/.test(subject)); },

            // `modules.bootstrap` overrides the default angular bootstrap callback

            bootstrap: function (modules) {
                angular.bootstrap(document.getElementById('app'), modules);
            }

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
