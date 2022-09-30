# Changelog

## [Unreleased]

## [0.9.0]

- Update deps
- Require Node 12

## [0.8.0]

- Drop support for Node 10

## [0.7.4]

- Revert faulty ts-node usage

## [0.7.0]

- Don't default to "master" environment any more as a safety measure agains unintended deletions
- Fix assets deletion log messages
- Log environment name on start

## [0.6.1]

- remove outdated dep on ts-lint

## [0.6.0]

- Add option to remove Assets/Media (contributed by [@anisval](https://github.com/anisval)
- Update to latest contentful-manangement release

## [0.5.0]

- Add env option to specify Contentful environment (contributed by @Ikstar)
- Update dependencies

## [0.4.2]

- Return exit code 1 when exception is thrown

## [0.4.1]

- Improve README

## [0.4.0]

- Add --delete-content-types parameter to delete content types as well

## [0.3.0]

- Prompt for confirmation before deleting all entries
- New option `--yes` to override above confirmation
