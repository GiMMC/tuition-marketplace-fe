# Tuition Marketplace Frontend

This is the frontend application for the Tuition Marketplace, built with React, Vite, TypeScript, and Tailwind CSS.

## Features
- **Role-based Dashboards:** Dedicated views for Parents and Tutors.
- **Authentication:** JWT & HttpOnly cookie-based session handling.
- **Case Management:** Create, view, and manage tuition cases.
- **Tutor Directory:** Browse tutors, view profiles, and send case invitations.
- **Document Management:** Securely upload and download past papers, briefs, and qualifications.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory (based on `.env.example` if available) or use the defaults:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment (Docker)

This application is ready to be containerized using Docker and served via Nginx.

### Using Docker Compose

You can spin up the production build of the frontend easily using Docker Compose:

1. Update your production API URL in `.env.production`:
   ```
   VITE_API_URL=http://your-production-backend-ip:5001/api
   ```

2. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```

The application will be served on port `80`.

### Manual Docker Build

If you are not using Docker Compose, you can build and run the image manually:

```bash
docker build -t tuition-marketplace-fe .
docker run -p 80:80 -d tuition-marketplace-fe
```

## Integrating with the Backend

The backend (located in the `tuition-marketplace-be` repository) also has its own `docker-compose.yml` file which orchestrates the PostgreSQL database, Redis, and the Node.js API server. 

When deploying both together on the same server, you have two options:
1. **Separate Networks**: Expose the backend API on a specific port (e.g., `5001`) and point the frontend's `.env.production` to `http://<SERVER_IP>:5001/api`.
2. **Unified Setup (Optional)**: Combine the services into a single `docker-compose.yml` file in a root repository, allowing the Nginx container to reverse-proxy requests directly to the backend container over a shared Docker network.
