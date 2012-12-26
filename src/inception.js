(function (Backbone) {
  "use strict"

  var Inception = function (opts) {
    this.container = opts.container
    if (!opts.container) {
      throw new Error('Inception needs a container')
    }

    _.defaults(opts, {
      topOffset: 50,
      scale: .02,
      hiddenOverallHeight: 400,
      labelField: 'name',
      linkPop: false,
      animate: true
    })

    this.stack = $('<ul>').addClass('inception-stack')

    $(this.container).append(this.stack)

    this.steps = []
    this.opts = opts
  }

  Inception.prototype.on = Backbone.Events.on
  Inception.prototype.off = Backbone.Events.off
  Inception.prototype.trigger = Backbone.Events.trigger

  Inception.prototype._resize = function () {
    if (this.length() === 1) { return }

    var top = this.top()
      , underlyingHeaderHeight = 0
      , hiddenOverallHeight = this.opts.hiddenOverallHeight

    _.each(_.first(this.steps, _.indexOf(this.steps, top)), function (step, i) {
      step.$el.removeClass('inception-step-top')

      var stepScale = 1.0 - (this.opts.scale * (this.steps.length - step.index - 1))

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
      underlyingHeaderHeight += this.opts.topOffset * stepScale
    }, this)

    top.$el.css('margin-top', underlyingHeaderHeight + 'px')
    this.bottom().$el.height(hiddenOverallHeight)
  }

  Inception.prototype.top = function () {
    return _.last(this.steps)
  }

  Inception.prototype.bottom = function () {
    return _.first(this.steps)
  }

  Inception.prototype.push = function (view, rendered) {
    var last = this.top()
      , step = new Step(view[this.opts.labelField], view, this.steps.length, this.opts.topOffset)

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
  }

  Inception.prototype._retreat = function (step) {
    _.each(_.rest(this.steps, _.indexOf(this.steps, step) + 1), this.pop, this)
  }

  Inception.prototype.pop = function () {
    this.steps.pop().remove()
    _.last(this.steps).rise()
    this._resize()
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
      self.close()
    })

    this.$el = $('<li>').addClass('inception-step')
  }

  Step.prototype.render = function () {
    if (this.index === 0) {
      this.$el.addClass('inception-step-bottom')
    }
    this.$el.append(this.view.render().el)
    return this
  }

  Step.prototype.close = function () {
    // TODO Emit close event
    $(this).trigger('remove', this)
  }

  Step.prototype.drop = function () {
    this.$el.append(this.cover.$el)
    return this
  }

  Step.prototype.rise = function () {
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
    this.$el.remove()
  }

  Backbone.Inception = Inception

  return Backbone

})(window.Backbone)
