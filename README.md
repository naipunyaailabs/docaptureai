# Docapture

Docapture is a document processing platform that leverages AI to extract, analyze, and transform documents into structured data.

## Features

- Document field extraction
- Document summarization
- RFP (Request for Proposal) generation
- Excel import/export capabilities
- Batch document processing
- Dynamic UI generation for various document types

## Security Notice

**Important**: This repository has been cleaned to remove all sensitive information. 
- All API keys, passwords, and secrets have been replaced with placeholder values
- Environment files (`.env`, `.env.docker`, `.env.production`) are ignored via `.gitignore`
- Docker Compose files use environment variable references instead of hardcoded values

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB (if not using Docker)

### Installation

1. Clone the repository
2. Copy `.env.docker` to `.env` and configure your environment variables with your actual values
3. Run `docker-compose up -d` to start the services
4. Access the application at `http://localhost:3000`

## Deployment

For production deployment, use the `docker-compose.prod.yml` file with appropriate environment variables.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.