all: site

site:
	cd site && haml-coffee -i markup/index.haml -o index.html
	cd site && lessc stylesheets/main.less stylesheets/style.css

.PHONY: all site
