SRC = $(shell find lib -type f -name "*.js")
TESTS = test/*.test.js
TESTTIMEOUT = 10000
REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS)

test-cov: lib-cov
	@TOPCOV=1 $(MAKE) test REPORTER=dot
	@TOPCOV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov: clean
	@rm -rf ./$@
	@jscoverage lib $@

clean:
	@rm -rf lib-cov
	@rm -f coverage.html

.PHONY: test test-cov lib-cov clean
