/*
 * Slide v1.0.0 09/10/2014
 * http://github.com/michalrusina/slide
 *
 * Michal Rusina
 * email@michalrusina.sk
 *
 */

;(function($) {
	var methods = {
		init: function(options) {
		    var settings = $.extend({
				pause: true,
				interval: 6000,
				arrowText: false,
				bulletText: false,
				slideClass: 'feature',
				arrowClass: 'arrows',
				bulletClass: 'bullets',
				event: 'click',
				callback: false
			}, options);

			return this.each(function(options) {
				var $this = $(this),
				data = $this.data('slide');

				if (data !== undefined) return;

				var slides = $this.find('.' + settings.slideClass),
					size = slides.size(),
					current = 0,
					data = {
						settings: settings,
						slides: slides,
						size: size,
						current: current
					}

				$this
				.data('slide', data)
				.trigger('init.slide')
				.slide('decorate')
				.slide('move', 0)
				.slide('resume')
				.hover(
					function() { $(this).addClass('hover').slide('pause'); },
					function() { $(this).removeClass('hover').slide('resume'); }
				);
			});
		},

		move: function(index) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide'),
					slides = data.slides,
					callback = data.settings.callback;

				if (index <= 0) index = 0;
				if (index >= data.size) index = data.size - 1;

				data.current = index;

				if (data.bullets !== undefined) data.bullets
				.children()
				.eq(index).addClass('active')
				.siblings().removeClass('active');

				var current = slides
					.removeClass('previous active next')
					.eq(index).addClass('active'),
					previous = slides.eq((index <= 0) ? data.size - 1 : index - 1).addClass('previous'),
					next = slides.eq((index >= data.size - 1) ? 0 : index + 1).addClass('next');

				$this
				.toggleClass('first', index === 0)
				.toggleClass('last', index === data.size - 1)
				.data('slide', data)
				.trigger('move.slide');

				if (callback !== false) callback($this, current, previous, next);
			});
		},

		next: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide'),
					index = data.current + 1;

				if (index === data.size) index = 0;

				$this
				.trigger('next.slide')
				.slide('move', index);
			});
		},

		previous: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide'),
					index = data.current - 1;

				if (index < 0) index = data.size - 1;

				$this
				.trigger('previous.slide')
				.slide('move', index);
			});
		},

		resume: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide');

				if (data.interval === undefined || data.settings.pause) {
					clearInterval(data.interval);
					data.interval = setInterval(function() { $this.slide('next'); }, data.settings.interval);
				}
			});
		},

		pause: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide');

				if (data.settings.pause) clearInterval(data.interval);
			});
		},

		decorate: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide'),
					arrowContainer = $this.find('.' + data.settings.arrowClass),
					bulletContainer = $this.find('.' + data.settings.bulletClass);

				if (data.settings.arrowText !== false) {
					var arrows = '<a class="previous" href="#">' + data.settings.arrowText[0] + '</a><a class="next" href="#">' + data.settings.arrowText[1] + '</a>';

					data.arrows = (arrowContainer.size()) ? arrowContainer.append(arrows) : $('<nav class="' + data.settings.arrowClass + '">' + arrows + '</nav>').appendTo($this);
				}

				else data.arrows = arrowContainer;

				if (data.settings.bulletText !== false) {
					var bullets = '';

					for (i = 1; i < data.size + 1; i++) bullets += '<a class="bullet" href="#">' + data.settings.bulletText.replace('$', i) + '</a>';
					data.bullets = (bulletContainer.size()) ? bulletContainer.append(bullets) : $('<nav class="' + data.settings.bulletClass + '">' + bullets +'</nav>').appendTo($this);
				}

				else data.bullets = bulletContainer;

				$this
				.data('slide', data)
				.find('.' + data.settings.arrowClass + ' > *, .' + data.settings.bulletClass + ' > *')
				.on(data.settings.event, function($event) {
					var $element = $(this),
						data = $this.data('slide');

					$event.preventDefault();

					if ($element.hasClass('bullet')) $this.slide('move', data.bullets.children().index($element));
					if ($element.hasClass('previous')) $this.slide('previous');
					if ($element.hasClass('next')) $this.slide('next');
				});
			});
		},

		destroy: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('slide');

				$this
				.trigger('destroy.slide')
				.removeData('slide')
				.removeClass('first last hover')
				.off('.slide');

				data.slides.removeClass('previous next active')
				data.arrows.remove();
				data.bullets.remove();
			});
		}
	};

	$.fn.slide = function(method) {
		if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method) return methods.init.apply(this, arguments);
	};
})(jQuery);
