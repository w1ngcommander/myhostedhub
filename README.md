# My Hosted Hub

A beautiful, self-hosted service manager for organizing and accessing your self-hosted services. Manage multiple servers, their services, and monitor their health status all in one place.

![My Hosted Hub](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey?style=flat-square&logo=sqlite)

## Features

- 🖥️ **Server Management** - Add and manage multiple servers
- 🔌 **Service Configuration** - Configure services with ports, protocols, icons, and images
- 🏥 **Health Checks** - Monitor service health with configurable health check endpoints
- 🌐 **Public URL Support** - Set public URLs for services with automatic availability checking
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 💾 **SQLite Database** - Simple, file-based database for easy backup and portability
- 🐳 **Docker Support** - Fully containerized for easy deployment
- 📊 **Visual Indicators** - Color-coded health status and public URL availability

## Screenshots

- Dashboard view with all servers and services
- Service cards with health indicators
- Configuration pages for servers and services

## Getting Started

### Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)
- npm or yarn

### Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd MyHostedHub
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

The database will be automatically created in the `data/` directory on first run.

### Docker Deployment

1. **Build and start the container**
```bash
docker-compose up -d
```

2. **Access the application**
Open [http://localhost:3000](http://localhost:3000)

3. **View logs**
```bash
docker-compose logs -f
```

4. **Stop the container**
```bash
docker-compose down
```

For more detailed Docker instructions, see [README-DOCKER.md](./README-DOCKER.md).

## Usage

### Adding Servers

1. Click "Configure Servers" on the home page
2. Click "Add Server"
3. Fill in:
   - **Name**: Display name for your server
   - **Host**: IP address or domain name (e.g., `192.168.1.100` or `server.example.com`)
   - **Description**: Optional description

### Adding Services

1. Navigate to a server and click "Manage Services"
2. Click "Add Service"
3. Configure your service:
   - **Name**: Service name (e.g., "Plex Media Server")
   - **Description**: Optional description
   - **Ports**: Comma-separated list (e.g., `8080, 443`)
   - **Protocol**: HTTP or HTTPS
   - **Icon**: Emoji or icon URL
   - **Image URL**: Optional logo/image URL
   - **Color**: Hex color code for theming
   - **Tags**: Comma-separated tags for categorization
   - **Public URL**: Optional public-facing URL
   - **Health Check**: Enable and configure health check endpoint

### Health Checks

Health checks allow you to monitor if your services are running:

1. Enable "Enable Health Check" checkbox
2. The health check URL defaults to your service URL
3. Optionally specify a custom health check endpoint
4. Set expected status code (default: 200)
5. Health status is displayed as a colored indicator:
   - 🟢 Green: Service is healthy
   - 🔴 Red: Service is unhealthy or unreachable
   - ⚪ Gray (pulsing): Checking status

### Public URLs

When a public URL is specified:
- The service card links to the public URL by default
- A LAN icon button appears to access the local URL
- A globe icon shows public URL availability:
  - 🟢 Green globe: Public URL is accessible
  - 🔴 Red globe: Public URL is unavailable

## Project Structure

```
MyHostedHub/
├── app/
│   ├── api/              # API routes
│   │   ├── healthcheck/  # Health check endpoint
│   │   ├── servers/      # Server CRUD operations
│   │   └── services/     # Service CRUD operations
│   ├── components/       # React components
│   │   ├── ServerCard.tsx
│   │   └── ServiceCard.tsx
│   ├── servers/          # Server management pages
│   │   └── [id]/
│   │       └── services/ # Service management pages
│   └── page.tsx          # Home page
├── lib/
│   ├── db/               # Database functions
│   │   ├── database.ts   # SQLite setup
│   │   ├── servers.ts     # Server operations
│   │   └── services.ts   # Service operations
│   └── models/           # Data models
│       ├── Server.ts
│       └── Service.ts
├── data/                 # SQLite database (auto-created)
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── package.json
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (better-sqlite3)
- **Runtime**: Node.js 20+

## API Endpoints

- `GET /api/servers` - Get all servers
- `POST /api/servers` - Create a server
- `PUT /api/servers` - Update a server
- `DELETE /api/servers?id={id}` - Delete a server
- `GET /api/services?serverId={id}` - Get services for a server
- `POST /api/services` - Create a service
- `PUT /api/services` - Update a service
- `DELETE /api/services?id={id}` - Delete a service
- `GET /api/healthcheck?url={url}&expectedStatus={code}` - Check URL health

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database

The SQLite database is stored in `data/servers.db`. The database schema is automatically created on first run. To reset the database, simply delete the `data/` directory.

## Configuration

### Environment Variables

- `PORT` - Port to run the server on (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

### Database Location

By default, the database is stored in `data/servers.db`. This can be changed by modifying `lib/db/database.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
