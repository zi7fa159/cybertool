# Pentest Toolkit Web App

A web application that allows users to run pre-installed, open-source penetration testing tools through a simple and intuitive user interface, without requiring any authentication.

## Key Features

-   **User-Friendly Interface:** Select tools, input parameters, execute, and view results easily.
-   **Integrated Tools:** Currently supports Nmap with placeholder logic for Metasploit. Designed for easy addition of more tools.
-   **Isolated Execution:** Each tool runs in an isolated Docker container for security.
-   **Backend Management:** Node.js backend manages Docker container execution, parameter passing, and output capturing.
-   **Readable Output:** Displays text output and lists generated files (download functionality is a future improvement).
-   **Error Handling:** Provides informative messages for failures or invalid inputs.
-   **Input Validation & Sanitization:** Basic checks are in place to prevent common security issues.
-   **Rate Limiting:** Basic protection against abuse.
-   **Legal Disclaimer:** Emphasizes authorized and educational use only.

## Technical Stack

-   **Frontend:** React
-   **Backend:** Node.js with Express.js
-   **Tool Execution:** Docker
-   **Orchestration:** Docker Compose

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   npm (usually comes with Node.js)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
-   [Docker Compose](https://docs.docker.com/compose/install/) (often included with Docker Desktop)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Environment Variables

-   **Frontend:** The frontend expects a `.env` file in the `frontend/` directory:
    ```env
    # frontend/.env
    REACT_APP_API_BASE_URL=http://localhost:3001/api
    ```
    This file is typically created automatically during the setup if you follow instructions but ensure it exists and points to your backend URL. The default `http://localhost:3001/api` is correct for the Docker Compose setup.

-   **Backend:** The backend primarily uses port `3001`, which is configured in `docker-compose.yml` and `backend/index.js`. No separate `.env` file is strictly required for the backend's current setup if run via Docker Compose as provided.

### 3. Build and Run with Docker Compose

This is the recommended way to run the application for development or production-like testing:

```bash
docker-compose up --build
```

-   `--build`: Forces Docker Compose to rebuild the images if there are changes to Dockerfiles or source code.
-   The first build might take some time as it downloads base images and installs dependencies.

### 4. Accessing the Application

-   **Frontend Web App:** Open your browser and navigate to `http://localhost` (or `http://localhost:80`).
-   **Backend API:** The API will be accessible at `http://localhost:3001`. For example, `http://localhost:3001/api/tools`.

## Directory Structure

```
.
├── backend/        # Node.js backend application
│   ├── Dockerfile
│   ├── tools.json  # Configuration for penetration testing tools
│   └── ...         # Other backend files (index.js, package.json, etc.)
├── frontend/       # React frontend application
│   ├── Dockerfile
│   ├── nginx.conf  # Nginx configuration for serving the React app
│   └── ...         # Other frontend files (src/, public/, package.json, etc.)
├── docker-compose.yml # Orchestrates the backend and frontend services
└── README.md
```

## Available Tools

The application currently supports:
-   **Nmap:** Network scanner.
-   **Metasploit:** (Placeholder execution logic) Advanced penetration testing platform.

Tools are defined in `backend/tools.json`.

### Adding New Tools

1.  **Define the Tool:** Add a new entry to `backend/tools.json`. This includes:
    *   `name`, `id`, `description`
    *   `dockerImage`: The Docker image to use (e.g., from Docker Hub).
    *   `parameters`: An array defining the input parameters for the tool (name, type, flags, required, placeholder, options for select, etc.).
2.  **Update Backend Logic (If Necessary):**
    *   The backend (`backend/index.js`) has logic to construct commands for Docker. For Nmap, specific parameter handling is implemented.
    *   For new tools, especially those with complex command structures or output, you may need to add or modify the command construction logic in the `/api/tools/:toolName/run` endpoint handler.
    *   If the tool requires a custom Docker image (not available on public registries), you'll need to build and host that image or include its Dockerfile in this project.

## Security Considerations

-   **Input Sanitization:** The backend performs basic validation of user inputs. This should be continuously reviewed and hardened.
-   **Docker Isolation:** Tools are run in Docker containers, providing a layer of isolation from the host system and other tools.
-   **Rate Limiting:** The API has basic rate limiting to help prevent abuse.
-   **Docker Socket Access:** The backend container has access to the host's Docker socket (`/var/run/docker.sock`). This is necessary for its function but is a privileged operation. Secure the host environment appropriately.
-   **Responsible Use:** These tools are powerful. Only use them for authorized testing on systems you have explicit permission to test.

## Legal Disclaimer

Please refer to the legal disclaimer and usage guidelines presented within the web application's footer. Use of this toolkit implies acceptance of these terms.

## Deployment Notes

### Frontend

-   The React frontend (from the `frontend/` directory) is a static SPA after being built (`npm run build`).
-   It can be deployed to various static hosting platforms like **Vercel**, Netlify, GitHub Pages, AWS S3/CloudFront, etc.
-   When deploying, you will need to configure the `REACT_APP_API_BASE_URL` environment variable in your hosting platform's settings to point to the publicly accessible URL of your deployed backend.

### Backend

-   The Node.js backend (from the `backend/` directory) **requires a hosting environment with Docker daemon access** because it dynamically starts Docker containers for each tool run.
-   **This means it cannot be deployed directly to standard serverless function environments like Vercel, AWS Lambda (without significant re-architecture like Lambda Extensions for Docker, which is complex), or Google Cloud Functions.**
-   Suitable hosting options include:
    -   A Virtual Private Server (VPS) (e.g., DigitalOcean, Linode, AWS EC2, Azure VM) where you can install Docker.
    -   Container orchestration services like Kubernetes.
    -   Managed container platforms that allow privileged operations or Docker socket access (less common for shared platforms).
-   Ensure the backend is secured and the Docker socket access is managed carefully if exposed.

## Future Improvements

-   **Refine Metasploit:** Implement proper command construction and interaction for Metasploit, likely using resource scripts.
-   **File Downloads:** Implement secure download links for files generated by tools.
-   **Enhanced Input Validation:** More robust and tool-specific input validation.
-   **Real-time Output Streaming:** Stream tool output to the frontend in real-time.
-   **Testing:** Implement comprehensive unit, integration, and potentially end-to-end tests.
-   **User Authentication (Optional):** While the request was for no auth, this could be an extension.
