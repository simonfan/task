require.config({
	urlArgs: "bust=" + Math.random(),
	baseUrl: '',
	paths: {
		// basic libraries
		'jquery': 'components/jquery/jquery',
		'underscore': 'components/underscore-amd/underscore',
		'backbone': 'components/backbone/backbone',
		'json2': 'components/json2/json2',


		'buildable': 'components/buildable/buildable',
		'_.mixins': 'components/_.mixins/_.mixins',
		'fsm': 'components/fsm/fsm',
		'eventemitter2': 'components/eventemitter2/lib/eventemitter2',
		'wildcards': 'components/wildcards/wildcards',


		// the module files go here
		'task': '../task',

		// DEMO
		'demo-main': 'demo',	// the main file for the demo

		// UNIT TESTS
		'tests-main': 'tests',	// the main file for tests

		// other tests go here
		'example-tests': 'tests/example-tests',
	},
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		}
	}
});
	
if (window.__unit) {

	// load the tests
	require(['tests-main'], function(undef) {

		// tests were already run in the main tests file

		// QUnit was set not to autostart inline in tests.html
		// finally start the QUnit engine.
		QUnit.load();
		QUnit.start();
	});

} else {

	require(['demo-main'], function(demo) {

	});

}