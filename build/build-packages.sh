#!/bin/bash
source ./build-config.sh

# request build event
echo "Building workflow ... [start]"
curl --location --request POST 'https://api.github.com/repos/sige5193/bittly/dispatches' \
  --header 'Accept: application/vnd.github+json' \
  --header 'X-GitHub-Api-Version: 2022-11-28' \
  --header "Authorization: Basic $GithubAccessToken" \
  --header 'Content-Type: application/json' \
  --data-raw '{"event_type": "build-packages","client_payload": {}}' \
  --silent
echo "Building workflow ... [started]"