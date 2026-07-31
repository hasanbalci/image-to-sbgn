# image-to-sbgn

**image-to-sbgn** is a web-service with a demo application that leverages Large Language Models (LLMs) to automatically convert hand-drawn biological network diagrams drawn in SBGN into machine-readable SBGNML files. This tool bridges the gap between sketching biological pathways on paper and creating formal, standardized digital representations.

## Demo

Try the live demo: [https://dev.sciluna.com/image2sbgn/](https://dev.sciluna.com/image2sbgn/)

## Setup of a service

### Prerequisites

- Node.js (v20.14.0 or higher)
- npm or yarn package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/sciluna/image-to-sbgn.git
cd image-to-sbgn
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory with the following variables:

```env
PORT=4000

# API Key for OpenAI
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

4. Build the client bundle:
```bash
npm run build
```

5. Start the service:

```bash
npm start
```

The service and the demo application will be available at `http://localhost:4000`

### Docker Deployment

Build and run using Docker:

```bash
# Build the Docker image
docker build -t image-to-sbgn .

# Run the container
docker run -p 4000:4000 \
  -e OPENAI_API_KEY=your_key \
  -e GEMINI_API_KEY=your_gemini_key \
  image-to-sbgn
```

## Usage

### Demo application

1. **Upload or Select a Sample**: 
   - Upload your hand-drawn SBGN diagram (PNG format recommended)
   - Or select one of the provided sample diagrams

2. **Choose SBGN Language**:
   - Process Description (PD): For molecular interaction maps
   - Activity Flow (AF): For high-level regulatory networks

3. **Select AI Model Provider**:
   - Gemini (Gemini 3.1 Pro)
   - OpenAI (GPT-5.2)

5. **Add Optional Comments**: Provide additional context or instructions for the AI

6. **Generate**: Click the "Process Data" button to process your diagram

7. **Review and Edit**: 
   - View the converted network in the interactive editor
   - Make adjustments if needed
   - Ground biological entities using the annotation feature

8. **Export**: Download the SBGNML file for use in other tools

### CLI usage

You can also convert images without the web UI:

```bash
OPENAI_API_KEY=your_openai_key node src/cli.js --image ./diagram.png --language PD --model gpt-5.2 --output ./diagram.sbgn
```

Or, after installing dependencies:

```bash
OPENAI_API_KEY=your_openai_key npm run cli -- --image ./diagram.png --language PD --model gpt-5.2 --output ./diagram.sbgn
```

Global install from a local checkout:

```bash
npm install -g /path/to/image-to-sbgn
image-to-sbgn --image ./diagram.png --language PD --output ./diagram.sbgn
```

Notes:
- `--image` accepts a local file path or a URL.
- `--output` is optional; omit it to print SBGNML to stdout.
- `--language` supports `PD` and `AF` (default: `PD`).

### Unsupported SBGN Elements

The following SBGN elements are currently not supported:
- **Submap**
- **Ports**

## API Endpoints

### POST `/sbgnml/from-image`

Convert hand-drawn SBGN image to SBGNML format.

**Request Body:**
```json
{
  "image": "base64_encoded_image_or_url",
  "language": "PD",  // or "AF"
  "model": "gpt-5.2", // or another OpenAI model
  "context:": "Optional additional instructions"
  "annotate": false // whether to annotate with identifiers
}
```

**Response:**
```json
{
  "answer": "SBGNML content as string"
}
```

### POST `/sbgnml/edit`

Edit given SBGNML content.

**Request Body:**
```json
{
  "sbgnml": "SBGNML content as string", 
  "language": "PD",  // or "AF"
  "model": "gpt-5.2", // or another OpenAI model
  "instructions:": "Instructions to edit SBGNML content"
}
```

**Response:**
```json
{
  "answer": "SBGNML content as string"
}
```

### POST `/anno`

Ground biological entities using INDRA service.

**Request Body:**
```json
[
  {
    "text": "Entity name"
  }
]
```

**Response:**
```json
[
  {
    "term": {
      "id": "database_id",
      "db": "database_name",
      "entry_name": "entity_name"
    }
  }
]
```

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your PR:
- Follows the existing code style
- Includes appropriate documentation
- Has been tested with multiple SBGN diagrams

## Contact

For questions or support, please open an issue on GitHub.

## Team
[Hasan Balci](https://github.com/hasanbalci) and [Augustin Luna](https://github.com/cannin) of [Luna Lab](https://github.com/sciluna)
