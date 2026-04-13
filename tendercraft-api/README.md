# TenderCraft API

Backend API for TenderCraft — AI-powered yacht tender design. Analyzes yacht photos via Claude Vision and generates matching tender renders via Flux on Replicate.

## Setup

```bash
npm install
cp .env.example .env
# Fill in your API keys in .env
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude Vision |
| `REPLICATE_API_TOKEN` | Replicate API token for Flux generation |
| `PORT` | Server port (default: 3001) |
| `FRONTEND_URL` | CORS origin (default: http://localhost:5173) |
| `NODE_ENV` | Environment (development/production) |

## Development

```bash
npm run dev
```

## API Endpoints

### `GET /api/health`
Health check. Returns `{ status: "ok", timestamp: "..." }`.

### `POST /api/analyze`
Upload a yacht photo for AI analysis.

- **Content-Type**: `multipart/form-data`
- **Field**: `image` (JPEG/PNG/WebP, max 10MB)
- **Response**: `{ success: true, data: { analysis: YachtAnalysis } }`

### `POST /api/generate`
Generate a tender render from analysis results.

- **Content-Type**: `application/json`
- **Body**: `{ analysis: YachtAnalysis, options?: { cabin, stern_style, size, custom_instructions } }`
- **Response**: `{ success: true, data: { render_id, status: "pending", prompt_used } }`

### `GET /api/render/:id`
Poll render status. When completed, saves image locally.

- **Response**: `{ success: true, data: { id, status, image_url? } }`

### `GET /api/render/:id/image`
Serve the rendered image file (PNG).

### `POST /api/edit`
Edit an existing render via Flux Fill inpainting.

- **Content-Type**: `application/json`
- **Body**: `{ render_id, edit_type, mask_area?, new_prompt?, custom_instructions? }`
- **Response**: `{ success: true, data: { render_id, status: "pending" } }`

## Build

```bash
npm run build
npm start
```
