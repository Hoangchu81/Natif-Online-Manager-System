#!/bin/bash
export $(grep -v '^#' .env | xargs)
exec node dist/server.js
