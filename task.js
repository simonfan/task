define(['fsm','underscore','_.mixins','jquery','json2'], function(FSM, _, undef, $, undef) {

	// internal
	var task = {
		run: function(args) {
			// the result is a deferred object
			this.result = $.Deferred();

			var hash = JSON.stringify(args);

			// 1: if caching is enabled, check cache for response
			if (this._cacheLimit > 0 && this.cache[ hash ]) {
				if (typeof this.cache[ hash ] !== 'undefined') {

					this.result.resolve(this.cache[ hash ]);
				}

			} else {

				args.unshift(this.result);

				// check if the function returns a synch response
				var synch = this.task.apply(this.context, args);

				// caching
				var _this = this;
				this.result.then(function(res) {
					// hash the arguments only if caching is enabled
					if (_this._cacheLimit > 0) {

						// hash should have been created outside this function's clouse,
						// right at the beginning
						_this.t('cache', hash, res);
					}
				});

				// if the function returns a synch response, solve the deferral
				this.result = (typeof synch === 'undefined') ? this.result : this.result.resolve(synch);
			}

			return this.result;
		},

		cache: function(hash, value) {
			if (hash && typeof value === 'undefined') {
				// getter
				return this.cache[ hash ];

			} else if (hash) {
				// setter
				// 1: check cache limit
				if (this._cacheTimeline.length >= this._cacheLimit) {
					delete this.cache[ this._cacheTimeline.unshift() ];
				}

				// 2: set 
				this.cache[ hash ] = value;

				return this;
			}
		}
	};

	var Task = Object.create(FSM);
	Task.extend({
		init: function(data) {

			_.bindAll(this,'t');

			/// OPTIONS ///
			// max times this task may be run. false = infinite
			this.max = data.max || 1;

			// run count
			this.count = 0;

			// the result
			this.result = undefined;

			// enable caching?
			// data.cache should be a number that determines the max
			// number of records in cache.
			this._cacheLimit = typeof data.cache === 'undefined' ? 0 : data.cache;

			// return false when exausted?
			this.falseWhenExhausted = data.falseWhenExhausted;

			/// OPTIONS ///


			// references
			// save reference to the task
			this.task = data.task;

			this.cache = {};
			this._cacheTimeline = [];
		},

		///////////////////////////////
		/// overwrite initial state ///
		///////////////////////////////
		initial: function() {
			return 'not-initiated';
		},

		t: function(method) {
			var args = _.args(arguments, 1);
			return task[method].apply(this, args);
		},

		reset: function() {
			this.count = 0;
			this.result = undefined;
		},

		states: {
			'not-initiated': {
				run: function() {
					var _this = this,
						args = _.args(arguments);

					this.set('running');

					var result = task['run'].call(this, args);

					result.then(function() { _this.set('done') });

					return result;
				}
			},

			'running': {
				__enter: function() {
					this.count ++;
				},

				run: function() { return this.result; },
			},

			'done': {
				__enter: function() {
					// check run count
					if (this.count !== false && this.count >= this.max) {
						this.set('exhausted');
					}
				},

				run: function() {
					var args = _.args(arguments);

					// check if arguments are equivalent
					// only if cache
					if (this.cache && this.hash === $.param(args)) {
						this.set('running');
						this.set('done');
						return this.result;
					} else {
						// run!
						this.set('running');
						var _this = this,
							result = task['run'].call(this,args);

						result.then(function() { _this.set('done') });

						return result;
					}
				},
			},

			'exhausted': {
				__enter: function() {
					if (this.falseWhenExhausted) {
						var _this = this;
						setTimeout(function() {
							_this.result = $.Deferred().resolve(false);
						}, 0);
					}
				},

				run: function() {
					// directly return the last result
					return this.result;
				}
			},
		}
	});


	return Task;
});