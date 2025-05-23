# Calendar Project

This is a simple calendar project.

## Setup

1. Navigate to the `project` directory:

   ```bash
   cd project
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

## Running the project

To run the project in development mode:

```bash
npm run dev
```

This will start the development server, and you can access the application in your browser.

## Building the project

To build the project for production:

```bash
npm run build
```

This will create a `dist` directory with the production build.

## Special Instructions

If you are running on Windows and encounter issues, you might need to set the `ROLLUP_NO_NATIVE=1` environment variable before running the `dev` script. This is already included in the `dev` script in `package.json`, but if you run into problems, ensure this variable is set in your environment. 