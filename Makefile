VERSION = $(shell node -e 'require("./package.json").version' -p)
HEADER = "/*!\n * inception.js v$(VERSION) \n * Copyright 2012, Spider Strategies <nathan.bowser@spiderstrategies.com> \n * inception.js may be freely distributed under the BSD license. \n*/"
DIST = dist/inception-$(VERSION).js
MIN = dist/inception-$(VERSION).min.js

clean:
	@rm -rf dist

build: clean
	@mkdir dist
	@cp src/inception.css dist/inception-$(VERSION).css
	@echo $(HEADER) > $(DIST) && cat src/inception.js >> $(DIST)
	@echo $(HEADER) > $(MIN) && node_modules/.bin/uglifyjs src/inception.js >> $(MIN)

test:
	@open test/runner.html

.PHONY: test
