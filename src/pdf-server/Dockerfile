FROM --platform=linux/amd64 node:lts-alpine3.16

ENV VER_PDFTK=2.02

RUN mkdir /cache

RUN apk add qpdf poppler-utils ghostscript curl build-base musl libxml2 giflib

RUN apk --no-cache add msttcorefonts-installer fontconfig && \
  update-ms-fonts && \
  fc-cache -f

RUN cd ./tmp && \
  curl -s https://www.princexml.com/download/prince-14.3-alpine3.16-x86_64.tar.gz | tar xzf - && \
  cd prince* && \
  ./install.sh && \
  cd .. && \
  rm -Rf prince*

WORKDIR /app

COPY package.json /app/package.json

RUN yarn install --frozen-lockfile

COPY . /app/

COPY entrypoint.sh /

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["/bin/echo", "-n"]