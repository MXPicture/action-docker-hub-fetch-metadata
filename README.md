# Github Action: Fetch Tags from DockerHub

## Example

```yaml
name: 'Example workflow'
on:
  pull_request:
  push:
    branches:
      - main

  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch tags from DockerHub
        id: fetch_tags
        uses: mxpicture/action-docker-hub-fetch-tags@v1
        with:
          repository: owner/repo
          max_items: '100'

      - name: An example step
        run: |
          echo '${{ steps.fetch_tags.outputs.count }}'

      - name: An example step
        run: |
          echo '${{ steps.fetch_tags.outputs.results }}'
```
