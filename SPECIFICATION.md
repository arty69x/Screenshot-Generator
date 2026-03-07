# Pixel-Perfect AI Assistant Specification

## Overview
The Pixel-Perfect AI Assistant is a robust, production-ready tool designed to reverse-engineer UI screenshots into pixel-perfect Tailwind HTML and TSX components.

## Core Functionality
- **Image-to-Code Generation**: Analyzes screenshots and generates Tailwind/TSX in a single attempt.
- **Unsplash Integration**: Automatically fetches high-quality images from Unsplash.
- **Project Management**: Saves, loads, and deletes projects via `localStorage` with confirmation dialogs and loading indicators.
- **Responsive Preview**: Provides a preview toggle with locked resolutions (Mobile: 375px, Tablet: 768px, Desktop: 100%, Widescreen: 1440px) with smooth transitions.
- **Code Management**: Copy-to-clipboard functionality for generated TSX code.

## Robustness and Error Handling
- **API Fallback**: Implements a primary (`NEXT_PUBLIC_GEMINI_API_KEY`) and fallback (`NEXT_PUBLIC_GEMINI_SUB_API_KEY`) API key mechanism.
- **Error Handling**: Comprehensive feedback for API key issues (401, 403), rate limits (429), and network failures.
- **Error Boundary**: Catches UI rendering errors, preventing full application crashes.

## Design & Responsiveness
- **Responsive Design**: Built with Tailwind CSS, optimized for both mobile and desktop (1:1 preview).
- **Preview Tool**: Includes a responsive preview toggle with locked resolutions for testing.

## Environment Configuration
- `NEXT_PUBLIC_GEMINI_API_KEY`: Primary Gemini API key.
- `NEXT_PUBLIC_GEMINI_SUB_API_KEY`: Fallback Gemini API key.
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`: Unsplash API access key.

## Dependencies
- `@google/genai`
- `lucide-react`
- `next`
- `tailwindcss`
- `shiki`
