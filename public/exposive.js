/*
 * exposive v1.0.0 09/10/2014
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
		init: function(options) {
			var settings = $.extend({ // jshint ignore:line
				pause: true,
				interval: 6000,
				arrowText: false,
				bulletText: false,
				exposiveClass: 'feature',
				arrowClass: 'arrows',
				bulletClass: 'bullets',
				event: 'click',
				callback: false
			}, options);

			return this.each(function(settings) {
				var $this = $(this),
				data = $this.data('exposive');

				if (data !== undefined) {
					return;
				}

				var exposives = $this.find('.' + settings.exposiveClass),
					size = exposives.size(),
					current = 0;

				data = {
					settings: settings,
					exposives: exposives,
					size: size,
					current: current
				};

				$this
				.data('exposive', data)
				.trigger('init.exposive')
				.exposive('decorate')
				.exposive('move', 0)
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

		move: function(index) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive'),
					exposives = data.exposives,
					callback = data.settings.callback;

				if (index <= 0) {
					index = 0;
				}

				if (index >= data.size) {
					index = data.size - 1;
				}

				data.current = index;

				if (data.bullets !== undefined) {
					data.bullets
					.children()
					.eq(index).addClass('active')
					.siblings().removeClass('active');
				}

				var current = exposives
					.removeClass('previous active next')
					.eq(index).addClass('active'),
					previous = exposives.eq((index <= 0) ? data.size - 1 : index - 1).addClass('previous'),
					next = exposives.eq((index >= data.size - 1) ? 0 : index + 1).addClass('next');

				$this
				.toggleClass('first', index === 0)
				.toggleClass('last', index === data.size - 1)
				.data('exposive', data)
				.trigger('move.exposive');

				if (callback !== false) {
					callback($this, current, previous, next);
				}
			});
		},

		next: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive'),
					index = data.current + 1;

				if (index === data.size) {
					index = 0;
				}

				$this
				.trigger('next.exposive')
				.exposive('move', index);
			});
		},

		previous: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive'),
					index = data.current - 1;

				if (index < 0) {
					index = data.size - 1;
				}

				$this
				.trigger('previous.exposive')
				.exposive('move', index);
			});
		},

		resume: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive');

				if (data.interval === undefined || data.settings.pause) {
					clearInterval(data.interval);

					data.interval = setInterval(function() {
						$this.exposive('next');
					}, data.settings.interval);
				}
			});
		},

		pause: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive');

				if (data.settings.pause) {
					clearInterval(data.interval);
				}
			});
		},

		decorate: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive'),
					arrowContainer = $this.find('.' + data.settings.arrowClass),
					bulletContainer = $this.find('.' + data.settings.bulletClass);

				if (data.settings.arrowText !== false) {
					var arrows = '<a class="previous" href="#">' + data.settings.arrowText[0] + '</a><a class="next" href="#">' + data.settings.arrowText[1] + '</a>';

					data.arrows = (arrowContainer.size()) ? arrowContainer.append(arrows) : $('<nav class="' + data.settings.arrowClass + '">' + arrows + '</nav>').appendTo($this);
				} else {
					data.arrows = arrowContainer;
				}

				if (data.settings.bulletText !== false) {
					var bullets = '';

					for (var i = 1; i < data.size + 1; i += 1) {
						bullets += '<a class="bullet" href="#">' + data.settings.bulletText.replace('$', i) + '</a>';
					}

					data.bullets = (bulletContainer.size()) ? bulletContainer.append(bullets) : $('<nav class="' + data.settings.bulletClass + '">' + bullets +'</nav>').appendTo($this);
				} else {
					data.bullets = bulletContainer;
				}

				$this
				.data('exposive', data)
				.find('.' + data.settings.arrowClass + ' > *, .' + data.settings.bulletClass + ' > *')
				.on(data.settings.event, function($event) {
					var $element = $(this),
						data = $this.data('exposive');

					$event.preventDefault();

					if ($element.hasClass('bullet')) {
						$this.exposive('move', data.bullets.children().index($element));
					}

					if ($element.hasClass('previous')) {
						$this.exposive('previous');
					}

					if ($element.hasClass('next')) {
						$this.exposive('next');
					}
				});
			});
		},

		destroy: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('exposive');

				$this
				.trigger('destroy.exposive')
				.removeData('exposive')
				.removeClass('first last hover')
				.off('.exposive');

				data.exposives.removeClass('previous next active');
				data.arrows.remove();
				data.bullets.remove();
			});
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
