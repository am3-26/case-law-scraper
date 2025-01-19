# Setup

When you're ready, start your application by running:
`docker compose up --build`.

Your application will be available at http://localhost:3000.

If you're on an ARM-based CPU like me, you might need to use the `DOCKER_DEFAULT_PLATFORM=linux/amd64` argument when you build the Docker image.
(If you're on Apple Silicon, please also turn Rosetta support on for x86_64/amd64 emulation in your Docker Desktop).

`DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose up --build`

For GraphQL I'm using code-first approach (using TypeScript classes to generate the corresponding GraphQL schemas).

# Key decisions and any notable trade-offs.

# Anything you’d change or add to make the solution production-ready (e.g., tests, security enhancements).
