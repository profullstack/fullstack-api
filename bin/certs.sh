#!/usr/bin/env sh

openssl req -x509 -newkey rsa:2048 -keyout ./sslcert/key.pem -out ./sslcert/cert.pem -days 100 -nodes
