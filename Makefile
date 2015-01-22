all: site

site:
    haml markup/index.haml index.html
    lessc stylesheets/main.less stylesheets/style.css
