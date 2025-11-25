# Orchestra AI Deployment Guide

This guide will help you deploy the Orchestra AI application to various platforms.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Google AI API Key (Get it from https://aistudio.google.com/apikey)

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   VITE_API_KEY=your_actual_api_key_here
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open browser at `http://localhost:3000`

## Building for Production

1. Build the project:
   ```bash
   npm run build
   ```

2. Preview production build:
   ```bash
   npm run preview
   ```

## Deployment Platforms

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Add environment variables in Vercel dashboard

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run `netlify deploy --prod`
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard

### GitHub Pages

1. Update `vite.config.ts` with base path
2. Run `npm run build`
3. Deploy `dist` folder to gh-pages branch

### Render

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## Environment Variables

Make sure to set these environment variables in your deployment platform:

- `VITE_GEMINI_API_KEY`: Your Google AI API key
- `VITE_API_KEY`: Additional API key (if needed)

## Troubleshooting

### Build Fails
- Ensure Node.js version is >= 18.0.0
- Run `npm install` to install all dependencies
- Check that all environment variables are set

### API Key Issues
- Verify your API key is valid at https://aistudio.google.com/apikey
- Ensure environment variables are properly prefixed with `VITE_`
- Check that `.env` file is not committed to version control

## Support

For issues or questions, please open an issue on GitHub.
