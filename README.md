# IgnitionJS v1.0.0

IgnitionJS is an opinionated, yet flexible, module loader/bootstrapper for AngularJS (though it can be configured to run any bootstrap code you require). IgnitionJS depends on LABjs for script loading. While not an attempt to replicate the functionality of module frameworks such as RequireJS (AMD) or CommonJS, ignition provides a simple and efficient alternative to these systems and makes AngularJS bootstrapping considerations a breeze.

## Project Structure Requirements

IgnitionJS favors convention over configuration. To make use of ignition, you first must adhere the following structure within your modules directory.

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

This naming consistency is what allows ignition to work so simply. Please note that it's recommend that you use a build task (grunt or gulp) to create these single module files and that you adhere to standard AngularJS directory structure for each module within your original source.

Here's an example of what the structure of your original source might look like:

```text
/app/js/modules/common/common.js
/app/js/modules/common/controllers/navController.js
/app/js/modules/common/directives/navDirective.js
/app/js/modules/common/services/userService.js
/app/js/modules/common/filter/noFractionCurrency.js
```

Your build task would then concatenate all of these files into a single file (`/app/js/modules/common/common.js`).

## Download

* [ignition.js](http://git.cars.com/projects/FE/repos/ignition/browse/dist/ignition.js)
* [ignition.min.js](http://git.cars.com/projects/FE/repos/ignition/browse/dist/ignition.min.js)

## Usage

### Example using default configuration

```html
<!doctype html>
<html>
    <head>
        <title>Example</title>
        <script src="js/vendor/LAB/LAB.min.js" />
        <script src="js/vendor/ignition/ignition.min.js" />
        <script>
            var ignition = new Ignition();
            ignition.registerDependencies([
                'js/vendor/angular/angular.min.js',
                'js/vendor/lodash/lodash.min.js'
            ]);
            ignition.registerModules([
                'common',
                'user'
            ]);
        </script>
    </head>
    <body>

        <h1>IgnitionJS Example</h1>

        <!--
        The following directives work because we've registered the modules they
        are dependent on in the document head.
        -->
        <my-common-directive></my-common-directive>
        <my-user-directive></my-user-directive>


        <!--
        Let's assume the following block has been included via server-side
        include. It needs to register an additional dependency (facebook)
        as well as an additional angular module before the directive it
        contains will work.
        -->
        <script>
            ignition.registerDependency('//connect.facebook.net/en_US/sdk.js#xfbml=1');
            ignition.registerModule('social');
        </script>
        <my-social-directive></my-social-directive>


        <!--
        Finally, add a call to `load` immediately before the closing body tag to kick things off.
        -->
        <script>
            ignition.load();
        </script>

    </body>
</html>
```

### Example with all options

```js
// when you instantiate ignition, you can pass an options object...
var ignition = new Ignition({
        // `modulesDir` sets the base modules directory
        modulesDir: '/js/modules',
        // `moduleNameValidation` is the regex which will be used to validate module names
        moduleNameValidation: /^[A-Za-z\-]+\w*$/,
        // `bootstrap` defines a custom bootstrap callback
        bootstrap: function (modules) {
            angular.bootstrap(document.getElementById('app'), modules);
        }
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
