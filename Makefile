all: site

site:
	cd site && haml markup/index.haml index.html
	cd site && lessc stylesheets/main.less stylesheets/style.css

.PHONY: all site
