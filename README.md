# Mercury UI
<img src="ui/public/mercury-logo.png" width="128" height="128" align="right" />

A simple UI for Mercury that uses React and Redux.

## Introduction
This project was bootstrapped with Create React App and uses Neutralinojs for being a native
application on Windows and Linux.

## Build and Run
To build the project, run the following command:

```bash
cd mercury-ui-react
yarn install
yarn build
cd ..
neu run
neu run --frontend-lib-dev
neu run --frontend-lib-dev -- --window-enable-inspector
```