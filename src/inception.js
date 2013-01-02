(function (global) {
  "use strict"

  var Inception = function (opts) {
    this.container = opts.container
    if (!opts.container) {
      throw new Error('Inception needs a container')
    }

    opts = $.extend({}, {
      topOffset: 50,
      scale: .02,
      hiddenOverallHeight: 400
    }, opts)

    this.stack = $('<ul>').addClass('inception-stack')

    $(this.container).append(this.stack)

    this.steps = []
    this.opts = opts
  }

  Inception.prototype._resize = function () {
    if (this.length() === 0) { return }

    var top = this.top()
      , self = this
      , underlyingHeaderHeight = 0
      , hiddenOverallHeight = this.opts.hiddenOverallHeight

    $.each(Array.prototype.slice.call(this.steps, 0, this.steps.indexOf(top)), function (i, step) {
      var stepScale = 1.0 - (self.opts.scale * (self.steps.length - step.index - 1))

      // We want to move up half of the height we lost by scaling, as viewed in the context of the parent step.  This
      // keeps the top of the header in the same place that it was before even though the step shrinks.
      // This equation can be written a little more efficiently, but I did it this way because it logically follows
      // how we determine the value.
      var stepTranslate = -1 * ((hiddenOverallHeight - (hiddenOverallHeight * stepScale)) / 2) * (1 / stepScale)
        , transform = 'scale(' + stepScale + ',' + stepScale + ') translate(0, ' + stepTranslate + 'px)'

      // Set the height and CSS
      step.$el.height(hiddenOverallHeight)
              .css({
                '-webkit-transform': transform,
                '-moz-transform': transform,
                '-ms-transform': transform,
                '-o-transform': transform,
                'transform': transform,
                'margin-top': underlyingHeaderHeight + 'px',
                'overflow': 'hidden' })

      // We want the margin to be the sum of all of the heights of underlying step headers.  Those headers are scaled,
      // though, so we keep a running total of their relative heights.
      underlyingHeaderHeight += self.opts.topOffset * stepScale
    })

    top.$el.css('margin-top', underlyingHeaderHeight + 'px')

    if (this.length() > 1) {
      this.bottom().$el.height(hiddenOverallHeight)
    } else {
      this.bottom().$el.css('height', 'auto')
    }
  }

  Inception.prototype.top = function () {
    return this.steps[this.steps.length - 1]
  }

  Inception.prototype.bottom = function () {
    return this.steps[0]
  }

  Inception.prototype.push = function (view, label) {
    var last = this.top()
      , step = new Step(label, view, this.steps.length, this.opts.topOffset)

    if (last) {
      last.drop()
      step.$el.addClass('inception-step-top')
    }

    var self = this
    $(step).on('remove', function () {
      self._retreat(this)
    })

    this.stack.append(step.render().$el)
    this.steps.push(step)
    this._resize()

    return step
  }

  Inception.prototype._retreat = function (step) {
    var self = this
    $.each(Array.prototype.slice.call(this.steps, this.steps.indexOf(step) + 1), function () {
      self.pop()
    })
  }

  Inception.prototype.pop = function () {
    var step = this.steps.pop()
    step.remove()

    if (this.top()) {
      this.top().rise()
    }
    this._resize()

    return step
  }

  Inception.prototype.length = function () {
    return this.steps.length
  }

  var Step = function (label, view, index, offset) {
    this.view = view
    this.index = index
    this.offset = offset
    this.cover = new Cover(label).render()

    var self = this
    this.cover.$el.on('click', function () {
      $(self).triggerHandler('remove', self)
    })

    this.$el = $('<li>').addClass('inception-step')
  }

  Step.prototype.render = function () {
    if (this.index === 0) {
      this.$el.addClass('inception-step-bottom')
    }
    this.$el.append(this.view)
    return this
  }

  Step.prototype.drop = function () {
    this.$el.removeClass('inception-step-top')
    this.cover.$el.show()
    this.$el.append(this.cover.$el)
    return this
  }

  Step.prototype.rise = function () {
    if (this.index) {
      this.$el.addClass('inception-step-top')
    }

    this.$el.css({
      'height': '',
      '-webkit-transform': '',
      '-moz-transform': '',
      '-ms-transform': '',
      '-o-transform': '',
      'transform': ''
    })
    this.cover.remove()
    return this
  }

  Step.prototype.remove = function () {
    this.cover.remove()
    this.cover.$el.unbind('click', this.close)
    this.cover = null
    this.$el.remove()
    return this
  }

  var Cover = function (label) {
    this.label = label
    this.$el = $('<div>').addClass('inception-step-cover')
  }

  Cover.prototype.render = function () {
    this.$el.html('<header><a href="#">' + this.label + '</a></header>')
    return this
  }

  Cover.prototype.remove = function () {
    this.label = null
    this.$el.hide()
  }

  global.Inception = Inception

})(window)
