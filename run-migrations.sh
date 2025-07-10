#!/bin/sh

set -e

echo "Installing knex CLI..."
npm install -g knex

echo "Running migrations..."
knex migrate:latest

echo "Seeding sample data..."
knex seed:run

echo "Starting server..."
node server.js
# end of it