/*
 * featurette v1.0.0 09/10/2014
 * http://github.com/michalrusina/featurette
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
				featuretteClass: 'feature',
				arrowClass: 'arrows',
				bulletClass: 'bullets',
				event: 'click',
				callback: false
			}, options);

			return this.each(function(options) {
				var $this = $(this),
				data = $this.data('featurette');

				if (data !== undefined) return;

				var featurettes = $this.find('.' + settings.featuretteClass),
					size = featurettes.size(),
					current = 0,
					data = {
						settings: settings,
						featurettes: featurettes,
						size: size,
						current: current
					}

				$this
				.data('featurette', data)
				.trigger('init.featurette')
				.featurette('decorate')
				.featurette('move', 0)
				.featurette('resume')
				.hover(
					function() { $(this).addClass('hover').featurette('pause'); },
					function() { $(this).removeClass('hover').featurette('resume'); }
				);
			});
		},

		move: function(index) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette'),
					featurettes = data.featurettes,
					callback = data.settings.callback;

				if (index <= 0) index = 0;
				if (index >= data.size) index = data.size - 1;

				data.current = index;

				if (data.bullets !== undefined) data.bullets
				.children()
				.eq(index).addClass('active')
				.siblings().removeClass('active');

				var current = featurettes
					.removeClass('previous active next')
					.eq(index).addClass('active'),
					previous = featurettes.eq((index <= 0) ? data.size - 1 : index - 1).addClass('previous'),
					next = featurettes.eq((index >= data.size - 1) ? 0 : index + 1).addClass('next');

				$this
				.toggleClass('first', index === 0)
				.toggleClass('last', index === data.size - 1)
				.data('featurette', data)
				.trigger('move.featurette');

				if (callback !== false) callback($this, current, previous, next);
			});
		},

		next: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette'),
					index = data.current + 1;

				if (index === data.size) index = 0;

				$this
				.trigger('next.featurette')
				.featurette('move', index);
			});
		},

		previous: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette'),
					index = data.current - 1;

				if (index < 0) index = data.size - 1;

				$this
				.trigger('previous.featurette')
				.featurette('move', index);
			});
		},

		resume: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette');

				if (data.interval === undefined || data.settings.pause) {
					clearInterval(data.interval);
					data.interval = setInterval(function() { $this.featurette('next'); }, data.settings.interval);
				}
			});
		},

		pause: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette');

				if (data.settings.pause) clearInterval(data.interval);
			});
		},

		decorate: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette'),
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
				.data('featurette', data)
				.find('.' + data.settings.arrowClass + ' > *, .' + data.settings.bulletClass + ' > *')
				.on(data.settings.event, function($event) {
					var $element = $(this),
						data = $this.data('featurette');

					$event.preventDefault();

					if ($element.hasClass('bullet')) $this.featurette('move', data.bullets.children().index($element));
					if ($element.hasClass('previous')) $this.featurette('previous');
					if ($element.hasClass('next')) $this.featurette('next');
				});
			});
		},

		destroy: function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data('featurette');

				$this
				.trigger('destroy.featurette')
				.removeData('featurette')
				.removeClass('first last hover')
				.off('.featurette');

				data.featurettes.removeClass('previous next active')
				data.arrows.remove();
				data.bullets.remove();
			});
		}
	};

	$.fn.featurette = function(method) {
		if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method) return methods.init.apply(this, arguments);
	};
})(jQuery);
