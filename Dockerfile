FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY visualizations.js /usr/share/nginx/html/visualizations.js
COPY success.html /usr/share/nginx/html/success.html
COPY cancel.html /usr/share/nginx/html/cancel.html
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
EXPOSE 80
