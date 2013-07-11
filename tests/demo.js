define(['task'], function(Task) {


	window.synchtask = Task.build({
		max: 3,
		falseWhenExhausted: true,
		cache: 0,
		task: function() {
			return 700;
		}
	})

	synchtask.on('changestate', function(state) {
		console.log('synchtask has changed state: ' + state);
	});


	window.asynchtask = Task.build({
		max: 4,
		falseWhenExhausted: false,
		cache: 3,
		task: function(defer) {
			setTimeout(function() {
				defer.resolve('bananas');
			}, 1000);
		}
	});

	asynchtask.on('changestate', function(state) {
		console.log('asynchtask has changed state: ' + state);
	});
});