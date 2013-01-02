var assert = chai.assert

describe('Inception', function () {
  var inception

  describe('Class names', function () {

    it('applies inception-step to all steps', function () {
      var layer1 = inception.push($('<div id="base">Base View</div>')[0], 'Base View')
        , layer2 = inception.push($('<div id="layer2">Layer 2</div>')[0], 'Layer 2')

      assert(layer1.$el.hasClass('inception-step'))
      assert(layer2.$el.hasClass('inception-step'))
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
