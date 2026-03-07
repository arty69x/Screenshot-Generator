# Pixel-Perfect AI Assistant Specification

## Overview
The Pixel-Perfect AI Assistant is a robust, production-ready tool designed to reverse-engineer UI screenshots into pixel-perfect Tailwind HTML and TSX components.

## Core Functionality
- **Image-to-Code Generation**: Analyzes screenshots and generates Tailwind/TSX.
- **Unsplash Integration**: Fetches relevant images from Unsplash based on prompts, with a fallback to Picsum.
- **Multi-Step Generation**: Supports generating specific UI sections (Header, Hero, etc.).
- **Responsive Preview**: Provides a preview toggle with locked resolutions (Mobile, Tablet, Desktop).
- **Project Management**: Saves and loads projects via `localStorage`.

## Robustness and Error Handling
- **API Fallback**: Implements a primary (`NEXT_PUBLIC_GEMINI_API_KEY`) and fallback (`NEXT_PUBLIC_GEMINI_SUB_API_KEY`) API key mechanism.
- **Exponential Backoff**: API retries with increasing delays to handle transient failures.
- **Error Boundary**: Catches UI rendering errors, preventing full application crashes.
- **LocalStorage Health Check**: Validates and cleans corrupted `localStorage` data.
- **Reset Mechanism**: Provides a manual "Reset App" option.

## Design & Responsiveness
- **Responsive Design**: Built with Tailwind CSS for seamless adaptation across all device sizes.
- **Preview Tool**: Includes a responsive preview toggle with locked resolutions for testing.

## Environment Configuration
- `NEXT_PUBLIC_GEMINI_API_KEY`: Primary Gemini API key.
- `NEXT_PUBLIC_GEMINI_SUB_API_KEY`: Fallback Gemini API key.
- `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`: Unsplash API access key.
- `APP_URL`: Application URL.

## Dependencies
- `@google/genai`
- `lucide-react`
- `next`
- `tailwindcss`
- `shiki`
