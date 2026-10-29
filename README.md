# Atmosphere Weather Intelligence

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=111111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/dependencies-none-2ea44f)](package.json)
[![API](https://img.shields.io/badge/data-Open--Meteo-2f80ed)](https://open-meteo.com/)
[![Responsive](https://img.shields.io/badge/design-responsive-8b5cf6)](styles.css)
[![License](https://img.shields.io/badge/license-not_specified-lightgrey)](#license)

Atmosphere is a responsive weather intelligence dashboard for exploring current conditions and short-term forecasts for cities around the world. It combines live Open-Meteo data with a focused, shareable interface that turns weather information into practical outdoor guidance.

The project is intentionally lightweight: it is a static browser application served by a small Node.js HTTP server, with no build step, framework, database, API key, or runtime dependency installation required.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Running in VS Code](#running-in-vs-code)
- [How it works](#how-it-works)
- [Data and API usage](#data-and-api-usage)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Available commands](#available-commands)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Accessibility and UX](#accessibility-and-ux)
- [Contributing](#contributing)
- [License](#license)

## Features

### Weather intelligence

- Live current conditions for a selected city.
- Current temperature and feels-like temperature.
- Relative humidity, wind, pressure, UV index, and visibility.
- Sunrise and sunset times.
- A 12-hour forecast timeline with precipitation probabilities.
- A seven-day forecast with weather summaries, high/low temperatures, and precipitation outlook.
- Weather-code interpretation for clear skies, cloud, fog, rain, snow, showers, and thunderstorms.

### Practical planning tools

- An outdoor activity score derived from precipitation, wind, and UV conditions.
- A smart briefing such as umbrella, sun-protection, or high-wind guidance.
- City search powered by Open-Meteo geocoding.
- Up to eight locally stored favorite locations.
- Shareable forecast URLs that preserve the selected city and coordinates.
- Celsius/Fahrenheit switching.
- Dark/light theme switching.
- Manual refresh, loading, empty, error, and offline states.

### Design and implementation

- Responsive layout for desktop and mobile screens.
- Semantic HTML structure with clear interactive controls.
- No API key required for the Open-Meteo endpoints used by this project.
- No frontend framework or build pipeline required.
- Safe rendering of user-selected city names and country labels.
- Browser persistence through `localStorage`.

## Technology

| Area | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 with responsive layout rules |
| Application logic | Modern browser JavaScript using ES modules-compatible syntax |
| Local server | Node.js built-in `http` module |
| Weather data | [Open-Meteo Forecast API](https://open-meteo.com/en/docs) |
| Geocoding | [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) |
| Persistence | Browser `localStorage` |

## Requirements

- Node.js 18 or newer. Node.js 20 or 22 is recommended.
- npm, included with Node.js.
- An internet connection for live geocoding and forecast data.
- A modern browser such as Chrome, Edge, Firefox, or Safari.

The project has no third-party npm dependencies, so `npm install` is not required for normal use.

## Quick start

### 1. Open the project directory

```bash
cd atmosphere
```

### 2. Start the development server

```bash
npm run dev
```

The server listens on `localhost:3000` by default and serves the application at:

```text
http://localhost:3000
```

### 3. Open the application

Open `http://localhost:3000` in your browser. The default location is Johannesburg, South Africa. Use the search field to find another city.

Press `Ctrl+C` or `Control+C` in the terminal to stop the server.

## Running in VS Code

1. Open Visual Studio Code.
2. Select **File → Open Folder**.
3. Choose the project folder containing `package.json`.
4. Open **Terminal → New Terminal**.
5. Run:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000` in a browser.

The terminal output should look like this:

```text
Atmosphere listening on http://localhost:3000
```

Open the exact local address below in your browser:

```text
http://localhost:3000
```

### Optional VS Code launch configuration

For a one-click launch, create `.vscode/tasks.json` with the following content:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Atmosphere",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "isBackground": true,
      "problemMatcher": []
    }
  ]
}
```

You can then run **Terminal → Run Task → Start Atmosphere**.

## How it works

1. The browser loads `index.html`, `styles.css`, and `app.js` from the Node.js server.
2. The app starts with Johannesburg as the default location unless a shared forecast URL or saved favorite is available.
3. A city search sends a request to the Open-Meteo geocoding endpoint.
4. Selecting a result sends a forecast request using the selected latitude and longitude.
5. The returned current, hourly, and daily data is rendered into the dashboard.
6. Favorites, unit preference, and theme preference are stored locally in the current browser.
7. Sharing a forecast writes the city and coordinates to the URL query string and copies the resulting URL when clipboard access is available.

## Data and API usage

Atmosphere uses the following public Open-Meteo services directly from the browser:

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecasts: `https://api.open-meteo.com/v1/forecast`

Forecast requests include current values for:

- Temperature
- Relative humidity
- Apparent temperature
- Day/night state
- Precipitation
- Weather code
- Wind speed
- Mean sea-level pressure
- UV index
- Visibility

Hourly data includes temperature, precipitation probability, weather code, wind speed, and humidity. Daily data includes weather code, high/low temperature, sunrise, sunset, maximum UV index, maximum precipitation probability, and maximum wind speed.

Open-Meteo provides the data without an application API key. Please review the [Open-Meteo terms](https://open-meteo.com/en/license) and attribution requirements before deploying a public or commercial copy.

## Project structure

```text
atmosphere/
├── app.config.ts       # Project metadata and logo configuration
├── app.js              # Client-side weather, search, state, and rendering logic
├── favicon.svg         # Browser favicon / project mark
├── index.html          # Application shell and dashboard markup
├── manus-routes.json   # Route manifest for the root application route
├── package.json        # Project metadata and npm scripts
├── server.js           # Dependency-free static Node.js HTTP server
├── styles.css          # Responsive visual system and component styles
├── TODO.md             # Original project requirements and delivery notes
└── README.md           # Project documentation
```

## Configuration

### Port

The default port is `3000`. To use another port, set the `PORT` environment variable before starting the server.

#### macOS/Linux

```bash
PORT=8080 npm run dev
```

#### Windows PowerShell

```powershell
$env:PORT=8080
npm run dev
```

Then open `http://localhost:8080`.

### Host

The server binds to `0.0.0.0` by default so it can be accessed from the local machine and, where permitted, other devices on the same network. To bind only to the local computer:

#### macOS/Linux

```bash
HOST=127.0.0.1 npm run dev
```

#### Windows PowerShell

```powershell
$env:HOST="127.0.0.1"
npm run dev
```

### Browser storage

The following keys are saved in browser `localStorage`:

| Key | Purpose |
| --- | --- |
| `atmosphere-favorites` | Saved locations, limited to eight entries |
| `atmosphere-unit` | Celsius or Fahrenheit preference |
| `atmosphere-theme` | Dark or light theme preference |

Clearing site data resets these preferences.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server |
| `npm start` | Starts the same Node.js server for a production-style run |

## Troubleshooting

### `ERR_ADDRESS_INVALID` when opening the site

Do not open `http://0.0.0.0:3000`. Use one of these browser addresses instead:

```text
http://localhost:3000
http://127.0.0.1:3000
```

### Port 3000 is already in use

Start the site on another port.

PowerShell:

```powershell
$env:PORT=3001
npm run dev
```

macOS/Linux:

```bash
PORT=3001 npm run dev
```

Then open `http://localhost:3001`.

### The forecast does not load

- Confirm that the terminal is still running the server.
- Confirm that the browser has internet access.
- Check the browser developer console for blocked requests or network errors.
- Check whether Open-Meteo is temporarily unavailable.
- Try the **Refresh** or **Retry** control in the dashboard.

### City search returns no results

Use a city name, region, or country in English and try a shorter query. For example, search for `London`, `Cape Town`, or `Tokyo`.

### Changes are not visible

Refresh the page with `Ctrl+R`. If styles or scripts appear stale, use a hard refresh with `Ctrl+Shift+R` or clear the browser cache for `localhost:3000`.

### `npm` or `node` is not recognized on Windows

Install the current Node.js LTS release from [nodejs.org](https://nodejs.org/), restart VS Code, and verify the installation:

```powershell
node --version
npm --version
```

## Deployment

Atmosphere is a static frontend with a small Node.js file server. It can be deployed in several ways:

### Node-compatible host

Copy the project files to the host, install Node.js 18 or newer, and run:

```bash
npm start
```

Set the host's `PORT` environment variable when required by the platform.

### Static hosting

The client assets can also be served by any static web server. At minimum, publish:

- `index.html`
- `app.js`
- `styles.css`
- `favicon.svg`
- `manus-routes.json`

For a static deployment, configure the host to serve `index.html` for the root path. Because forecast data is requested from the browser, the deployed site must allow outbound HTTPS requests to the Open-Meteo endpoints.

### Production recommendations

Before a public deployment:

- Configure HTTPS.
- Add a Content Security Policy suitable for the selected deployment host.
- Confirm Open-Meteo attribution and licensing requirements.
- Add monitoring for upstream API failures.
- Consider caching or a server-side proxy if usage volume requires it.
- Add a project-specific license file if the code will be distributed.

## Accessibility and UX

The interface includes semantic controls, visible loading and error states, keyboard activation for search, and accessible labels for icon-based actions. When extending the application, preserve keyboard navigation, readable contrast, reduced-motion preferences, and meaningful labels for interactive elements.

## Contributing

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-change
   ```

2. Make focused changes.
3. Run the local server and test the dashboard in a modern browser.
4. Test city search, forecast loading, favorites, sharing, unit switching, theme switching, refresh, and offline/error states.
5. Keep the implementation dependency-free unless a dependency is clearly justified.
6. Submit a pull request with a concise summary and screenshots for visual changes.

## License

No license has been specified for this project yet. Until a license is added, all rights remain with the copyright holder. Add a `LICENSE` file and update this section before distributing the project or accepting external contributions.

## Acknowledgements

- Weather data and geocoding are provided by [Open-Meteo](https://open-meteo.com/).
- The application is designed as a lightweight, shareable weather dashboard with no required API key.
