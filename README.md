Linkedevents-UI - form-style UI for Linked Events API
=====================================================

[![Build Status](https://travis-ci.org/City-of-Turku/linkedevents-ui.svg?branch=turku-specific-changes)](https://travis-ci.org/City-of-Turku/linkedevents-ui)
[![codecov](https://codecov.io/gh/City-of-Turku/linkedevents-ui/branch/turku-specific-changes/graph/badge.svg)](https://codecov.io/gh/City-of-Turku/linkedevents-ui)

Linkedevents-UI is a user interface for creating and changing events through
Linked Events API. It exposes many capabilities of the API including:

* Creation, changing and deletion of events
* Managing multipart events
* Showing available actions based on user permissions

# Prerequisites
* Yarn
* Node v8 LTS 
* Python 2 (due to node-sass using node-gyp)

# Development Installation

## Configuration

Copy the contents of `config_dev.json.example` to `config_dev.json`.

`config_dev.json` contains partially working settings giving you read only
access to our test API. If you have your own API and/or authentication
credentials you can change the relevant settings therein.

The UI is now compatible with the `courses` extension for the Linked Events API.
If you wish to include the extra fields specified in the `courses` extension,
please change the `ui_mode` setting from `events` to `courses`.

## Running development server

```
$ yarn
$ yarn start
```

Then point your browser to the webpack dev server at http://localhost:8080/.

# Production installation

## Configuration

For production builds, all configuration is done using environment
variables. This way, no errant configuration files should cause mysterious
build failures or, worse, dormant configuration errors. The environment variables
are named exactly the same as the ones in `config_dev.json`. For example,
if you'd like to change the base address for Linkedevents API, you would:
```
export api_base="https://api.hel.fi/linkedevents/v1"
```

Most if not all build automation tools provide for setting environment
variables. Check the documentation for the one you are using. If you are
testing locally you can `source config_build_example.sh` to get started.

### Building

After setting the config you can build install dependencies and build the
static files:
```
$ yarn
$ yarn build
```

You should now have the bundled javascript + some non-bundled assets in
`dist`. You can serve these using your favorite web server at whatever
address suits your fancy.
