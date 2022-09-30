# contentful-clean-space

Delete all entries from a contentful space.

[Contentful CLI](https://github.com/contentful/contentful-cli) doesn't have a command to delete all entries from a space without deleting the space itself. However, this can be very useful, e.g. for user contract testing.

## Installation

Using npm:

```
npm install -g contentful-clean-space
```

## Usage

```
contentful-clean-space
Options:
      --help                  Show help                                [boolean]
      --space-id              Contentful space id            [string] [required]
      --env                   Contentful environment         [string] [required]
      --accesstoken           Contentful access token        [string] [required]
      --batch-size            Number of parallel Contentful requests
                                                           [number] [default: 5]
      --content-type          Specify the entries to delete from the specified
                              content type                [string] [default: ""]
      --delete-content-types  Delete content types as well
                                                      [boolean] [default: false]
      --assets                Delete assets as well   [boolean] [default: false]
  -y, --yes                   Auto-confirm delete prompt
                                                      [boolean] [default: false]
  -v, --verbose                                       [boolean] [default: false]
```

All parameters can be provided from environment variables, too. To do that, just set an environment variable using UPPER_CASE casing.

## Example Usage

To delete all entries, content types, as well as assets in the "master" environment, and without the safety prompt, use `contentful-clean-space --space-id [space id] --accesstoken [personal access token]  --env master --content-type [contentTypeId]`
