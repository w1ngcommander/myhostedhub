# Docker Setup for My Hosted Hub

This guide explains how to run My Hosted Hub using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the container:
```bash
docker-compose up -d
```

2. Access the application at `http://localhost:3000`

3. View logs:
```bash
docker-compose logs -f
```

4. Stop the container:
```bash
docker-compose down
```

### Using Docker directly

1. Build the image:
```bash
docker build -t myhostedhub .
```

2. Run the container:
```bash
docker run -d \
  --name myhostedhub \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  myhostedhub
```

3. Access the application at `http://localhost:3000`

4. Stop the container:
```bash
docker stop myhostedhub
docker rm myhostedhub
```

## Data Persistence

The SQLite database is stored in the `./data` directory and is mounted as a volume. This ensures your data persists even if you remove and recreate the container.

## Environment Variables

You can customize the application by setting environment variables in `docker-compose.yml`:

- `PORT`: Port to run the application on (default: 3000)
- `NODE_ENV`: Node environment (default: production)

## Building for Production

The Dockerfile uses a multi-stage build to create an optimized production image:

1. **deps stage**: Installs dependencies including build tools for native modules
2. **builder stage**: Builds the Next.js application
3. **runner stage**: Creates a minimal production image

## Troubleshooting

### Database Issues

If you encounter database permission issues, ensure the `data` directory has proper permissions:
```bash
chmod 755 data
```

### Port Already in Use

If port 3000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Use port 8080 instead
```

### View Container Logs

```bash
docker-compose logs -f myhostedhub
```

Or with Docker directly:
```bash
docker logs -f myhostedhub
```

## Updating the Application

To update the application:

1. Pull the latest code
2. Rebuild the image:
```bash
docker-compose build
```
3. Restart the container:
```bash
docker-compose up -d
```

The database will persist across updates.


