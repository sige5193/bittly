#!/bin/bash
LAST_TAG_COMMIT=$(git rev-list --tags --max-count=1)
git log $LAST_TAG_COMMIT..HEAD --oneline > build/release-notes.md