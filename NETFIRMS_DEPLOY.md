# Netfirms deployment

This project is a static Vite application. Netfirms only needs to serve the generated files; Node.js is required only on the development/build machine.

## Build

```bash
npm install
npm run build
```

The final static files are generated in:

```text
dist/
```

## Upload

Upload the **contents** of `dist/` to the directory that serves the configurator, for example:

```text
public_html/garage-builder/
```

The application uses relative asset paths (`base: './'`) so it can live under a subdirectory instead of only at the domain root.

## Future API connection

The current quote workflow is intentionally static-hosting friendly. For a production CRM connection, replace the email adapter with `fetch()` to the TGB lead endpoint. No 3D code needs to change because the complete project state is represented by `GarageConfig`.
