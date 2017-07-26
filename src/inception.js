
// TODO Use node event emmiter since we're putting this in npm
var EventEmitter = function () {}
  , $ = require('jquery')

EventEmitter.prototype.init = function () {
 this.jq = $(this)
}

EventEmitter.prototype.emit = EventEmitter.prototype.trigger = function (evt, data) {
  !this.jq && this.init()
  this.jq.trigger(evt, data)
}

EventEmitter.prototype.once = function (evt, fn) {
  !this.jq && this.init()
  this.jq.one(evt, fn)
}

EventEmitter.prototype.on = function (evt, fn) {
  !this.jq && this.init()
  this.jq.on(evt, fn)
}

EventEmitter.prototype.off = function (evt, fn) {
  !this.jq && this.init()
  this.jq.off(evt, fn)
}

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
    , topOffset = this.opts.topOffset

  // Loop through all of the layers except for the top one, setting their correct CSS and height values.
  $.each(Array.prototype.slice.call(this.steps, 0, this.steps.indexOf(top)), function (i, step) {
    var stepScale = 1.0 - (self.opts.scale * (self.steps.length - step.index - 1))
    var hiddenHeightNoPadding = self.opts.hiddenOverallHeight - _calculateVerticalPadding(step)

    // We want to move up half of the height we lost by scaling, as viewed in the context of the parent step.  This
    // keeps the top of the header in the same place that it was before even though the step shrinks.
    // This equation can be written a little more efficiently, but I did it this way because it logically follows
    // how we determine the value.
    var stepTranslate = -1 * ((hiddenHeightNoPadding - (hiddenHeightNoPadding * stepScale)) / 2) * (1 / stepScale)
      , transform = 'scale(' + stepScale + ',' + stepScale + ') translate(0, ' + stepTranslate + 'px)'

    // The base step doesn't need to have a top margin because it's already where it needs to be.
    var topMargin = 0
    if (step.index > 0) {
      topMargin = _calculateTopMargin(step, stepScale, topOffset, hiddenHeightNoPadding)
    }

    // Set the height and CSS
    step.$el.height(hiddenHeightNoPadding)
            .css({
              transform: transform,
              'margin-top': topMargin + 'px',
              overflow: 'hidden' })
  })

  if (this.length() > 1) {
    var hiddenHeightNoPadding = this.opts.hiddenOverallHeight - _calculateVerticalPadding(top)
    top.$el.css('margin-top', _calculateTopMargin(top, 1, topOffset, hiddenHeightNoPadding) + 'px')
    this.bottom().$el.height(hiddenHeightNoPadding)
  } else {
    this.bottom().$el.css('height', 'auto')
  }
}

var _calculateVerticalPadding = function (step) {
  return parseInt(step.$el.css('padding-top'), 10) + parseInt(step.$el.css('padding-bottom'), 10)
}

var _calculateTopMargin = function (step, stepScale, topOffset, hiddenOverallHeight) {
  var heightPadding = _calculateVerticalPadding(step)
  return (topOffset * stepScale) - (hiddenOverallHeight + heightPadding)
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
    step.$el.addClass('inception-step-top inception-step-fade-in')
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
  this.cover = new Cover(label)

  var self = this
  this.cover.$el.on('click', function () {
    $(self).triggerHandler('remove', self)
  })

  this.$el = $('<li>').addClass('inception-step')
}

$.extend(Step.prototype, new EventEmitter)

Step.prototype.render = function () {
  if (this.index === 0) {
    this.$el.addClass('inception-step-bottom')
  }
  this.$el.append(this.view)
  return this
}

Step.prototype.drop = function () {
  this.$el.removeClass('inception-step-top')
          .addClass('inception-step-covered')
  this.cover.render().$el.show()
  this.$el.append(this.cover.$el)
  return this
}

Step.prototype.rise = function () {
  if (this.index) {
    this.$el.addClass('inception-step-top')
  }

  this.$el.css({
    height: '',
    transform: ''
  })

  this.$el.removeClass('inception-step-covered')

  this.cover.remove()
  return this
}

Step.prototype.remove = function () {
  this.emit('close')
  this.cover.remove()
  this.cover.$el.off('click', this.close)
  this.cover = null
  this.$el.remove()
  return this
}

var Cover = function (label) {
  this.label = label
  this.$el = $('<div>').addClass('inception-step-cover')
  this.$el.append('<header><a href="#"></a></header>')
}

Cover.prototype.render = function () {
  this.$el.find('a').text($.isFunction(this.label) ? this.label.apply(this) : this.label)
  return this
}

Cover.prototype.remove = function () {
  this.$el.hide()
}

module.exports = Inception
