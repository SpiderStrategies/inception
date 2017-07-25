var assert = require('assert')
  , Inception = require('../src/inception')
  , $ = require('jquery')

describe('Inception', function () {
  var inception

  describe('Initialization', function () {

    it('throws an error if a container is not set', function () {
      try {
        var i = new Inception
      } catch (e) {
        assert(e)
      }
    })

    it('sets proper defaults', function () {
      var inception = new Inception({
        container: $('#container')[0],
      })

      assert.equal(inception.opts.topOffset, 50)
      assert.equal(inception.opts.scale, .02)
      assert.equal(inception.opts.hiddenOverallHeight, 400)
    })

    it('overwrites  defaults', function () {
      var inception = new Inception({
        container: $('#container')[0],
        scale: .04,
        topOffset: 100,
        hiddenOverallHeight: 300
      })

      assert.equal(inception.opts.topOffset, 100)
      assert.equal(inception.opts.scale, .04)
      assert.equal(inception.opts.hiddenOverallHeight, 300)
    })

    it('initializes', function () {
      assert.equal($('#container ul.inception-stack').length, 1)
      assert.equal(0, inception.steps.length)
    })

  })

  describe('Events', function () {

    it('fires a close event when popped', function (done) {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')
        , layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')
      layer2.on('close', function (a) {
        assert.equal(this, layer2)
        done()
      })
      inception.pop()
    })

  })

  describe('Header label', function () {
    it('displays the header text when dropped', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')
      assert(!layer1.cover.$el.is(':visible'))

      var layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')

      assert(layer1.cover.$el.is(':visible'))
      assert(!layer2.cover.$el.is(':visible'))
    })

    it('Uses the correct label', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')
        , layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], function () {
          return 'Layer 2 Header'
        })

      inception.push($('<div>Top</div>')[0], 'Top')

      assert.equal(layer1.$el.find('header a').text(), 'Base View')
      assert.equal(layer2.$el.find('header a').text(), 'Layer 2 Header')
    })

  })

  describe('Class names', function () {

    it('applies inception-step-covered to all covered steps', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')
        , layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')
        , layer3 = inception.push($('<div id="layer3">Layer 3</div>')[0], 'Layer 3')

      assert(layer1.$el.hasClass('inception-step-covered'))
      assert(layer2.$el.hasClass('inception-step-covered'))
      assert(!layer3.$el.hasClass('inception-step-covered'))

      inception.pop()

      assert(layer1.$el.hasClass('inception-step-covered'))
      assert(!layer2.$el.hasClass('inception-step-covered'))

      inception.pop()

      assert(!layer1.$el.hasClass('inception-step-covered'))
    })

    it('applies inception-step to all steps', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')
        , layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')

      assert(layer1.$el.hasClass('inception-step'))
      assert(layer2.$el.hasClass('inception-step'))
    })

    it('applies inception-step-fade-in when pushing layers > 1', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')

      assert(!layer1.$el.hasClass('inception-step-fade-in')) // Never animate the base

      var layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')

      assert(layer2.$el.hasClass('inception-step-fade-in'))
    })

    it('applies inception-step-top', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')

      assert(!layer1.$el.hasClass('inception-step-top')) // It doesn't get top if there is exactly one layer

      var layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')

      assert(!layer1.$el.hasClass('inception-step-top'))
      assert(layer2.$el.hasClass('inception-step-top'))

      var layer3 = inception.push($('<div id="layer3">Layer 3</div>')[0], 'Layer 3')

      assert(!layer1.$el.hasClass('inception-step-top'))
      assert(!layer2.$el.hasClass('inception-step-top'))
      assert(layer3.$el.hasClass('inception-step-top'))

      inception.pop()

      assert(!layer1.$el.hasClass('inception-step-top'))
      assert(layer2.$el.hasClass('inception-step-top'))

      inception.pop()
      assert(!layer1.$el.hasClass('inception-step-top')) // Again, make sure the bottom never has inception-step-top
    })

  })

  beforeEach(function () {
    $('body').append('<div id="container">')
    inception = new Inception({ container: $('#container')[0], topOffset: 60, scale: .03 })
  })

  afterEach(function () {
    $('#container').remove()
  })

})
