/*
 * exposive v2.0.2 08/08/2015
 * http://github.com/michalrusina/exposive
 *
 * Michal Rusina
 * email@michalrusina.sk
 *
 */

 /* global jQuery */

;(function($) {
	'use strict';

	var methods = {
		init: function(init) {
			var opts = $.extend({
				pause: true,
				interval: 6000,
				event: 'click',
				callback: false,
				slideSelector: '.slide',
				arrowText: false,
				arrowSelector: '.arrows a',
				arrowContainer: '',
				bulletText: false,
				bulletSelector: '.bullets a',
				bulletContainer: ''
			}, init);

			return this.each(function() {
				var $this = $(this),
				data = $this.data('exposive');

				if (data !== undefined) {
					return;
				}

				var slides = $this.exposive('_get', opts.slideSelector),
					size = slides.size(),
					current = 0;
					
				if (!size) {
					return;
				}

				data = {
					opts: opts,
					slides: slides,
					size: size,
					current: current
				};

				$this
				.data('exposive', data)
				.exposive('decorate')
				.exposive('goto', 0)
				.exposive('resume')
				.hover(
					function() {
						$(this).addClass('hover').exposive('pause');
					},
					function() {
						$(this).removeClass('hover').exposive('resume');
					}
				);
			});
		},

		goto: function(index) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive'),
					slides = data.slides,
					callback = data.opts.callback;

				if (index <= 0) {
					index = 0;
				} else if (index >= data.size) {
					index = data.size - 1;
				}

				data.current = index;

				if (data.bullets !== undefined) {
					data.bullets
					.eq(index).addClass('active')
					.siblings().removeClass('active');
				}

				var current = slides
					.removeClass('previous active next')
					.eq(index).addClass('active'),
					previous = slides.eq((index <= 0) ? data.size - 1 : index - 1).addClass('previous'),
					next = slides.eq((index >= data.size - 1) ? 0 : index + 1).addClass('next');

				$this
				.toggleClass('first', index === 0)
				.toggleClass('last', index === data.size - 1)
				.data('exposive', data);

				if (callback !== false) {
					callback($this, current, previous, next);
				}
			});
		},


		move: function(dir) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive'),
					index = data.current + dir;

				if (index >= data.size) {
					index = 0;
				} else if (index < 0) {
					index = data.size - 1;
				}

				$this.exposive('goto', index);
			});
		},

		resume: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive');

				if (data.interval === undefined || data.opts.pause) {
					clearInterval(data.interval);

					data.interval = setInterval(function() {
						$this.exposive('move', 1);
					}, data.opts.interval);
				}
			});
		},

		pause: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive');

				if (data.opts.pause) {
					clearInterval(data.interval);
				}
			});
		},

		decorate: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive');

				if (data.opts.arrowContainer !== false) {
					data.arrowContainer = (data.opts.arrowContainer === '') ? data.arrowContainer = $('<nav class="arrows"></nav>').appendTo($this) : $this.exposive('_get', data.opts.arrowContainer);
				}

				if (data.opts.arrowText && data.arrowContainer.size() && data.opts.arrowText.length === 2) {
					data.arrows = $('<button class="previous">' + data.opts.arrowText[0] + '</button><button class="next">' + data.opts.arrowText[1] + '</button>').appendTo(data.arrowContainer);
				} else {
					data.arrows = $this.exposive('_get', data.opts.arrowSelector);
				}

				if (data.opts.bulletContainer !== false) {
					data.bulletContainer = (data.opts.bulletContainer === '') ? $('<nav class="bullets"></nav>').appendTo($this) : $this.exposive('_get', data.opts.bulletContainer);
				}

				if (data.opts.bulletText && data.bulletContainer.size()) {
					var	bullets = '';

					for (var i = 1; i < data.size + 1; i += 1) {
						bullets += '<button>' + data.opts.bulletText.replace('$', i) + '</button>';
					}

					data.bullets = $(bullets).appendTo(data.bulletContainer);
				} else {
					data.bullets = $this.exposive('_get', data.opts.bulletSelector);
				}

				data.arrows.on(data.opts.event, function($event) {
					$event.preventDefault();

					if ($(this).hasClass('previous')) {
						$this.exposive('move', -1);
					} else if ($(this).hasClass('next')) {
						$this.exposive('move', 1);
					}
				});

				data.bullets.on(data.opts.event, function($event) {
					$event.preventDefault();

					$this.exposive('goto', $this.data('exposive').bullets.index($(this)));
				});
			});
		},

		_get: function(element) {
			var $this = $(this);

			return (element instanceof jQuery) ? element : $this.find(element);
		}
	};

	$.fn.exposive = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
	};
})(jQuery);