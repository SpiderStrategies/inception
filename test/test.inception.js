var assert = chai.assert

describe('Inception', function () {
  var inception

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

      assert.equal(layer1.cover.label, 'Base View')
      assert.equal(layer2.cover.label, 'Layer 2 Header')
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
    inception = new Inception({ container: $('#container')[0], topOffset: 60, scale: .03 })
  })

  afterEach(function () {
    $('#container').empty()
  })

})
