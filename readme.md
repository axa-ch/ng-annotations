# ng-annotations
###angular wrapper based on es7 annotations
=======================

Ng-annotations is a small javascript library that helps to produce more structured angular applications using es6 classes and es7 decorators.  
This library was build with webpack in mind but should work well with the other transpilers/javascript supersets like babel or typescript (with es7 and es6 advanced features)

------------

### Installation
#### `npm`
`npm install --save ng-annotations`  
#### `Bower`
`bower install --save ng-annotations`  

------------
### Basic Usage
> all examples in this repo and below use the [babel-core](https://babeljs.io/) library as transpiler
> you're free to use any other supersets if they support the es7 decorator feature.

#### `webpack`  
> a configuration example is available in the [webpack dev config](./webpack/webpack.dev.config.js)

````javascript
import {service, inject} from 'node_modules/ng-annotations';

@service()
@inject('$http')
export default class MyService {
	controller($http) {
		/*do something*/
	}
}
````  

#### `es6 files`  
> a configuration example is available in the [gruntfile](./gruntfile.js)

````javascript
const {controllerName, inject} = ngAnnotations;

@controller('controllerName')
export default class theController {
	controller() {
		/*do something*/
	}
}
````

------------

### Information
> All examples below will show you the webpack way.  
> However, an implementation of the angular todolist with the basic es6 syntax is available in the [example/es6](./example/es6) folder 

### Available annotations
------------

## Utils

###`@inject`
> The inject annotation replaces the classic array syntax to declare a dependency injection  
> Basically, it will feed the $inject property with the list of dependencies

#### type: *function*
#### target: *class and methods*
#### Params:
 - **depsToInject**:    String|String[].   component(s) to inject
 - **...otherDeps**: *(Optional)* ...Strings.

#### Usage:
````javascript
import {inject, service} from 'node_modules/ng-annotations';

@service()
@inject('$http','$q') // could be @inject(['$http','$q'])
export default class CommunicationService {
	constructor(http, $q) {
		this.http = http;
		this.promise = $q;
	}
	do() {/*do something*/}
}
````

#### Note:
> The implicit dependency injection syntax is also available but shouldn't be used because of minification issues. 

#### Usage:
````javascript
import {inject, service} from 'node_modules/ng-annotations';

@service()
export default class CommunicationService {
	constructor($http, $q) {
		this.http = $http;
		this.promise = $q;
	}
	do() {/*do something*/}
}
````

###`@autobind`
> The autobind annotation gives the possibility to bind methods to its current context.  
> similar to *object.method.bind(object)*

#### type: *statement*
#### target: *method only*
#### Usage:
````javascript
import {service, inject, autobind} from 'node_modules/ng-annotations';

@service()
@inject('$timeout')
export default class CommunicationService {

	constructor(timeout) {
		this.timeout = $timeout;
		this.loop();
	}

	@autobind
	loop() {
		console.log('hello');
		this.timeout(this.loop, 1000);
	}
}
````

------------

## Note:
> all component annotations add 3 properties and 1 method to the given class  
> `$type`:   String.  the component type (controller, config, service...). Used by the `autodeclare` method.  
> `$name`:  String. the component name used by angular. Used by the `autodeclare` method. 
> Useful if you want to use the import system with the dependency injection system.
> With this method you'll avoid all hypothetical naming issues.

````javascript
/*file1.js*/
import {service} from 'ng-annotations';

@service()
export default class MyService {}


/*file2.js*/
import {controller, inject} from 'ng-annotations';

import {$name as myService} from './file1';

@controller()
@inject(myService)
export default class MyController {}
````

> `$component`: Object. the object/function used by angular, can be different than the original class (function wrap). Used by the `autodeclare` method.  
> `autodeclare`: Function(**ngModule**). declares the current component to angular. (replaces the traditional `angular.module('...').controller('name', fn)`)  
> the ngModule parameter can be a string (angular module name) or an angular module instance.  
 
````javascript
/*autodeclare way*/
import myService from './file1';
import myController from './file2';

var app = angular.module('app', []);
// useful is you want to use the import system with the module dependency injection system.
export app.name; 

[myService, myController].forEach(component => component.autodeclare(app));

/*alternative*/
import myService from './file1';
import myController from './file2';

var app = angular.module('app', []);
export app.name; // useful if you wanna use the import system with the module dependency injection system.

app.service(myService.$name, myService.$component);
app.controller(myController.$name, myController.$component);

/*without import*/
import {service} from 'ng-annotations';

@service()
class MyService {}

MyService.autodeclare('moduleName');
````

## Components

###`@controller`
> declare the given class as an angular controller

#### type: *function*
#### Params:
 - **name**: *(Optional)*    String.   angular controller name, by default the decorator will take the class name.

#### Usage:
````javascript
import {controller} from 'ng-annotations';

@controller('HelloWorld')
export default class MyController {
	prop = 0;
}
````

#### Note:
> With this syntax you should always use the controllerAs option and forget $scope (except in certain cases like $watch or $on usages).

#### Usage:
````jade
html
	head
	body
		section(ng-controller="HelloWorld as HW") {{HW.prop}}
		script(src="app.js")
````

###`@service`
> declare the given class as an angular service

#### type: *function*
#### Params:
 - **name**: *(Optional)*    String.   angular service name, by default the decorator will take the class name.

#### Usage:
````javascript
import {service} from 'ng-annotations';

@service('OtherName')
export default class MyService {
	method() { return 100 * Math.random()|0	}
}
````

###`@provider`
> declare the given class as an angular provider  
> like the native angular provider you must implement a `$get`. 

#### type: *function*
#### Params:
 - **name**: *(Optional)*    String.   angular provider name, by default the decorator will take the class name.

#### Usage:
````javascript
import {provider, inject} from 'ng-annotations';

@provider()
export default class MyProvider {
	@inject($http)
	$get($http) {}
}
````

###`@factory`
> declare the given class as an angular factory

#### type: *function*
#### Params:
 - **name**: *(Optional)*    String.   angular factory name, by default the decorator will take the class name.

#### Usage:
````javascript
import {factory} from 'ng-annotations';

@factory()
export default class MyFactory {
	items;
	constructor() {
		this.items = [];
	}
}
````

> by default the decorator return an instance of the factory class to angular
> so the example above is similar to the following code

````javascript
angular.module('...')
	.factory('MyFactory', function() {
		this.items = [];
		return angular.extend(this);
	})
````

> You can change this behaviour by defining an `expose` method 

````javascript
import {factory, autobind} from 'ng-annotations';

@factory()
export default class MyFactory {
	items;
	
	@autobind
	get() {
		return this.items;
	}
	
	@autobind
	load(list = []) {
		this.items = list;
	}
	
	expose() {
		return {
			load: this.load,
			get: this.get
		}
	}
}

angular.module('...')
	.factory('MyFactory', function() {
		this.items = [];
		
		this.get = function() { return this.items; }
		this.load = function(list) { this.items = list || []; }
		
		return {
			get: this.get.bind(this),
			load: this.load.bind(this)
		}
	})
````

###`@directive`
> declare the given class as an angular directive

#### type: *function*
#### Params:
 - **name**: *(Optional)*    String.   angular directive name, by default the decorator will take the class name.

#### Usage:
````javascript
import {directive} from 'ng-annotations';

@directive('myDirective')
export default class MyDirective {
	restrict = 'A';
	scope = {};
	link($scope, elem, attr) {
		console.log('directive triggered');;
	}
}
````

###`@animation`
> declare the given class as an angular animation

#### type: *function*
#### Params:
 - **selector**:    String.   css selector.

#### Usage:
````javascript
import {animation} from 'ng-annotations';

@animation('.foobar')
export default class FoobarAnimation {
	enter(elem, done) {
		elem.css('opacity', 0);
		/*do something*/
	}

	leave(elem, done) {
		elem.css('opacity', 1);
		/*do something*/
	}
}
````

###`@config`
> declare the given class as an angular config

#### type: *function*
#### Usage:
````javascript
import {config, inject} from 'ng-annotations';

@config()
@inject('$routeProvider')
export default class FooBarConfiguration {
	
	constructor(routeProvider) {
		this.route = routeProvider;
		this.setRoutes();
	}
	
	setRoutes() {
		this.route.when('/xxx', { template: '...' })
	}
	
}
````

###`@run`
> declare the given class as an angular run

#### type: *function*
#### Usage:
````javascript
import {run, inject} from 'ng-annotations';

@run()
@inject('myFactory')
export default class SomeRun {
	
	constructor(myFactory) {
		this.fact = myFactory;
		this.initModel();
	}
	
	initModel() {
		this.fact.load();
	}
	
}
````

###`@filter`
> declare the given class as an angular filter

#### type: *function*
#### Params:
 - **name**: *(Optional)*    String.   angular filter name, by default the decorator will take the class name.

#### Usage:
> The decorated filter is slightly different than the original.
> to make it work you need to implement a `$filter` method. This is the method used by angular.

````javascript
import {filter} from 'ng-annotations';

@filter('capitalizeFilter')
export default class Capitalize {
	
	toCapitalize(val) {
		return val[0].toUpperCase() + val.slice(1);
	}

	$filter(val) {
		return this.toCapitalize(val);
	}
}
````

## Wrappers
> the *Value* and *Constant* components can't be replaced by a class.  
> In order to simplify their declaration two wrappers are available.

###`constant`
#### Params:
 - **name**:    String.   constant name.
 - **value**:    Mix.   constant value.

#### Usage:
````javascript
import {constant} from 'ng-annotations';

export default constant('name', 'a constant');
````
###`value`
#### Params:
 - **name**:    String.   value name.
 - **value**:    Mix.   value value.

#### Usage:
````javascript
import {value} from 'ng-annotations';

export default value('name', 'a value');
````


### Modify and build
--------------------

`npm install webpack-dev-server -g`  
`npm install webpack`  
`npm install`  

*Build dist version:* `npm run build`  
*Build es6 example:* `npm run es6`  
*Start the dev server:* `npm run dev` then go to *http://localhost:8080/webpack-dev-server/*  