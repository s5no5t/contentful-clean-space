contentful-clean-space
======================
Delete all entries from a contentful space.

[Contentful CLI](https://github.com/contentful/contentful-cli) doesn't have a command to delete all entries from a space without deleting the space itself. However, this can be very useful, e.g. for user contract testing.

Installation
------------
Using npm:
```
npm install -g contentful-clean-space
```

Usage
-----
Use the `--help` parameter to display help.
```
contentful-clean-space --help
```
All parameters can be provided from environment variables, too. To do that, just set an environment variable using UPPER_CASE casing.
