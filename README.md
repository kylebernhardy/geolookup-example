# Geolookup Example

An example [Harper](https://www.harper.fast/) application that demonstrates how to use the [geolookup](https://github.com/kylebernhardy/geolookup) plugin for reverse geocoding US coordinates.

[![Built with Harper](https://img.shields.io/badge/Built_with-Harper-6762FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTdMMTIgMjJMMjAgMTdWN0wxMiAyWiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=)](https://www.harper.fast/)

## Overview

This project is a minimal Harper application with no code of its own. It pulls in the [geolookup](https://github.com/kylebernhardy/geolookup) plugin as a dependency and configures it via `config.yaml` to expose reverse geocoding and data loading endpoints. It serves as a reference for how to integrate the geolookup plugin into your own Harper application.

## Configuration

All behavior is controlled through `config.yaml`:

```yaml
rest: true

'geolookup-plugin':
  package: 'geolookup-plugin'
  exposeGeoService: true
  geoServiceName: 'geo'
  exposeDataLoadService: true
  dataLoadServiceName: 'data'
```

### Settings

| Setting | Value | Description |
|---------|-------|-------------|
| `rest` | `true` | Enables the Harper REST interface for all exported resources |
| `package` | `'geolookup-plugin'` | Tells Harper to load the geolookup-plugin npm package as a plugin |
| `exposeGeoService` | `true` | Registers the reverse geocoding endpoint |
| `geoServiceName` | `'geo'` | Exposes the geocoding service at `/geo` |
| `exposeDataLoadService` | `true` | Registers the bulk data loading endpoint. Set to `false` after data is loaded. |
| `dataLoadServiceName` | `'data'` | Exposes the data loading service at `/data` |

## API Usage

### Reverse Geocoding

Look up a location by coordinates (returns place, county subdivision, and county):

```sh
curl "http://localhost:9926/geo?lat=40.7128&lon=-74.0060"
```

Request specific tiers only:

```sh
# County only
curl "http://localhost:9926/geo?lat=40.7128&lon=-74.0060&tiers=3"

# Place and county
curl "http://localhost:9926/geo?lat=40.7128&lon=-74.0060&tiers=1,3"
```

### Loading Data

Initiate a data load for a state (returns immediately with a job ID):

```sh
curl "http://localhost:9926/data?state=Wyoming"
```

Response:

```json
{
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Checking Job Progress

The `DataLoadJob` table is exported automatically. Query it with the job ID:

```sh
curl "http://localhost:9926/DataLoadJob/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

List all jobs:

```sh
curl "http://localhost:9926/DataLoadJob"
```

See the [geolookup plugin documentation](https://github.com/kylebernhardy/geolookup) for full details on tiers, job statuses, and available states.

## CLI Data Loader

The project includes an interactive terminal CLI (built with [Ink](https://github.com/vadimdemedes/ink)) for loading geographic data into your Harper instance. Instead of manually calling the data loading API for each state, the CLI lets you select multiple states and territories from a scrollable list and loads them sequentially with real-time progress.

### Running the CLI

From the project root:

```sh
npm run cli
```

This builds and launches the CLI from the `cli/` directory.

### Prerequisites

The CLI connects to a running Harper instance with the geolookup-example application deployed. Make sure your Harper server is running (`npm run dev` or deployed to Harper Fabric) before launching the CLI.

### Setup

Create a `.env` file in the `cli/` directory pointing to your running Harper instance:

```sh
cp cli/.env.example cli/.env
```

Then edit `cli/.env`:

```
HARPER_URL='http://localhost:9926'
HARPER_DATA_ENDPOINT='data'
HARPER_USERNAME='YOUR_USERNAME'
HARPER_PASSWORD='YOUR_PASSWORD'
```

### Controls

| Key | Action |
|-----|--------|
| Up/Down | Scroll through the list of states and territories |
| Space | Toggle selection on the current item |
| A | Toggle all items |
| Enter | Confirm selection and start loading |
| Esc | Exit the CLI |

### How It Works

1. **Select states** — Browse all 50 US states and 6 territories in a scrollable list. Toggle individual items with Space or select all with A.
2. **Loading** — After confirming, each state is loaded sequentially. The CLI triggers the data load endpoint, then polls the `DataLoadJob` table every 2 seconds to show real-time status (extracting, loading locations, loading cells).
3. **Summary** — When all jobs finish, a summary shows succeeded/failed counts with totals for locations and cells loaded.
4. **Load more** — Press Enter to go back to the state picker and load additional states, or Esc to exit.

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `cli` | `npm run cli` | Launches the interactive data loading CLI |
| `dev` | `npm run dev` | Starts the Harper dev server at http://localhost:9926 |
| `start` | `npm run start` | Starts the Harper production server |
| `deploy` | `npm run deploy` | Deploys to Harper Fabric (requires `.env` credentials) |
| `lint` | `npm run lint` | Runs ESLint |
| `format` | `npm run format` | Runs Prettier |
| `agent:run` | `npm run agent:run` | Runs the Harper agent |
| `agent:skills:update` | `npm run agent:skills:update` | Installs/updates Harper agent skills |

### Deploying to Harper Fabric

The `deploy` script uses [dotenv-cli](https://www.npmjs.com/package/dotenv-cli) to load credentials from a `.env` file, then runs `harperdb deploy_component` to push the application to your Harper Fabric cluster.

1. Copy the example env file and fill in your credentials:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env` with your Harper Fabric cluster details:

   ```
   CLI_TARGET_USERNAME='YOUR_CLUSTER_USERNAME'
   CLI_TARGET_PASSWORD='YOUR_CLUSTER_PASSWORD'
   CLI_TARGET='YOUR_FABRIC.HARPER.FAST_CLUSTER_URL_HERE'
   ```

3. Deploy:

   ```sh
   npm run deploy
   ```

   This runs `harperdb deploy_component . restart=rolling replicated=true`, which deploys the application with a rolling restart and replication enabled across your cluster.

> **Important:** Never commit your `.env` file. It contains sensitive credentials. Only `.env.example` should be checked into source control.

## Prerequisites

- [Node.js](https://nodejs.org/) v24+ (see geolookup plugin's `.nvmrc`)
- [Harper](https://docs.harperdb.io/docs/deployments/install-harper) installed globally: `npm install -g harperdb`
