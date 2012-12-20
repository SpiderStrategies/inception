(function (Backbone) {
  "use strict"

  var Inception = function (opts) {
    this.container = opts.container
    if (!opts.container) {
      throw new Error('inception needs a container')
    }

    _.defaults(opts, {
      topOffset: 50,
      scale: .02,
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
      , hiddenOverallHeight = this.opts.topOffset //the underlying height is currently being set to the offset, but that will change

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
      , step = new Step({ view: view, opts: this.opts, label: view[this.opts.labelField], index: this.steps.length })

    if (last) {
      last.drop()
      step.$el.addClass('inception-step-top')
    }

    step.on('close', this._retreat, this)
    this.stack.append(step.render().el)
    this.steps.push(step)
    this._resize()
  }

  Inception.prototype._retreat = function (step) {
    _.each(_.rest(this.steps, _.indexOf(this.steps, step) + 1), this.pop, this)
  }

  Inception.prototype.pop = function () {
    this.steps.pop().destroy()
    _.last(this.steps).rise()
    this._resize()
  }

  Inception.prototype.length = function () {
    return this.steps.length
  }

  var Step = Backbone.View.extend({

    tagName: 'li',

    className: 'inception-step',

    events: {
      'click .inception-step-cover': 'close'
    },

    initialize: function () {
      this.cover = new Cover({label: this.options.label, linkPop: this.options.opts.linkPop}).render()
      this.view = this.options.view
      this.index = this.options.index
      this.topOffset = this.options.opts.topOffset
    },

    render: function () {
      this.$el.append(this.view.render().el)
      return this
    },

    close: function () {
      this.trigger('close', this)
    },

    drop: function () {
      this.$el.append(this.cover.el)
      return this
    },

    rise: function () {
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
    },

    destroy: function () {
      this.cover.remove()
      this.remove()
      this.cover = null
    }

  })

  var Cover = Backbone.View.extend({
    className: 'inception-step-cover',

    initialize: function () {
      this.linkpop = this.options.linkPop
      this.label = this.options.label

      this.events = {}
      this.events['click' + (this.linkPop ? ' a' : '')] = 'close'
    },

    close: function (e) {
      e.preventDefault()
    },

    render: function () {
      this.$el.html('<header><a href="#">' + this.label + '</a></header>')
      return this
    }
  })

  Backbone.Inception = Inception

  return Backbone

})(window.Backbone)
