k# TrialDocs — Frontend

Next.js interface for [TrialDocs](https://github.com/Vishesh559/trialdocs-backend), a retrieval-augmented question-answering tool for clinical trial protocols. Upload a protocol PDF, ask questions in plain language, and get answers grounded strictly in the document.

Deployed on AWS Amplify, connected directly to this GitHub repo, every push to `main` triggers an automatic rebuild.

## Design

The interface is styled as a document-review tool rather than a generic chat UI: a dark, document-annotation backdrop, monospace section markers (`§1`, `§2`, `§3`) instead of standard headings, a serif typeface for answer text (protocol prose is formal document material), and citations rendered as numbered margin tags, echoing how a real reviewed document gets annotated, rather than a plain "sources" list at the bottom.

## Stack

| Piece | Technology |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS |
| Hosting | AWS Amplify |
| Fonts | IBM Plex Mono, Source Serif 4, Inter |

## Configuration

The backend URL is read from an environment variable rather than hardcoded, so the same build works against a local backend in development and the deployed HTTPS backend in production:

NEXT_PUBLIC_API_BASE=https://your-backend-url

In Amplify, this is set under the app's environment variables. Locally, create a `.env.local` file with the same key.

**Why HTTPS matters here specifically:** browsers block a page served over HTTPS from calling a plain-HTTP API (mixed-content policy). Since Amplify serves this frontend over HTTPS by default, the backend had to be placed behind Nginx with a Let's Encrypt certificate before the two could talk to each other in production:- see the [backend README](https://github.com/Vishesh559/trialdocs-backend) for how that's set up.

## Local development

```bash
git clone https://github.com/Vishesh559/trialdocs-frontend.git
cd trialdocs-frontend
npm install
```

Create `.env.local`:

NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000

Run:
```bash
npm run dev
```

Requires the [backend](https://github.com/Vishesh559/trialdocs-backend) running (locally or deployed) to actually answer requests — the frontend alone has no logic of its own.

---

Backend repo: [trialdocs-backend](https://github.com/Vishesh559/trialdocs-backend) (FastAPI, RAG pipeline, deployed on EC2 + RDS)
