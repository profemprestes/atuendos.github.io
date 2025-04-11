# **App Name**: OutfitAI Stylist

## Core Features:

- Temperature Input Upgrade: Enhanced UI for temperature input with a more visually appealing slider or number input field.
- Style Selection Upgrade: Improved style selection with visually distinct style options (e.g., using cards or icons).
- Outfit Suggestion with Local Data: Outfit generation using a tool that filters clothing items from prendas.json based on user-selected temperature and style.
- Outfit Display Enhancement: Display the outfit suggestion in a visually appealing manner using cards with image placeholders for each clothing item. If the item does not have an image in the prendas.json, use a placeholder.
- Outfit Explanation: Use the AI model to justify why the generated outfit is appropriate for the weather and selected style. The AI model will decide if it needs to incorporate information from the user's closet to make a relevant suggestion.

## Style Guidelines:

- Primary color: Use a clean white or light gray (#F5F5F5) for the background.
- Secondary color: A calming blue (#E6F0FF) or light teal for accents and interactive elements.
- Accent color: Coral (#FF7F50) for calls to action and highlights to create a warm and inviting feel.
- Use a grid-based layout for a clean and organized presentation.
- Simple and modern icons for style options and clothing categories.
- Subtle transitions and animations for a smooth user experience.

## Original User Request:
You are an expert Next.js developer specializing in building AI-powered fashion applications. Based on the provided project structure, I need you to help me set up the initial steps for enhancing the OutfitAI application.

The project uses Next.js for the frontend, and includes AI logic (likely using a Large Language Model) to generate outfit suggestions. The core functionality revolves around taking user input for temperature and style, and then providing an outfit suggestion.

Here's a breakdown of the existing structure and key files:

* `src/app/page.tsx`: This is the main page component where the user interacts with the application. It currently handles temperature input, style selection, and displays the outfit suggestion.
* `src/ai/flows/generate-outfit-suggestion.ts`: This file contains the AI flow responsible for generating the outfit suggestion based on temperature and style.
* `src/components/ui/`: This directory contains reusable UI components (e.g., input fields, buttons, select dropdowns, cards).
* `src/prendas.json`: This file (which I intend to expand) will store data about the user's clothing items.
* The application fetches weather data from "https://api.open-meteo.com/v1/forecast..."

I want to improve and expand this application, focusing on these initial steps:

1.  **Enhance the `page.tsx` component:**
    * Improve the user interface and user experience. Make it more visually appealing, intuitive, and user-friendly. Leverage the UI components in `src/components/ui/`. Consider using Tailwind CSS classes for styling.
    * Refactor the component to be more organized and maintainable.
    * Ensure the temperature input and style selection are clear and easy to use.
    * Improve the display of the outfit suggestion, making it visually distinct and easy to read.
    * Incorporate better loading and error handling.
    * (This was already done in the last iteration, but keep it in mind for further changes)

2.  **Integrate `prendas.json` with the outfit generation:**
    * Modify the `generateOutfitSuggestion` flow (`src/ai/flows/generate-outfit-suggestion.ts`) to incorporate data from `prendas.json`.
    * The AI should use the clothing items defined in `prendas.json` to generate outfit suggestions.
    * This will involve filtering clothing items based on temperature and style.
    * Update the prompt sent to the AI to include relevant information from `prendas.json`.

3.  **Refine the data structure of `prendas.json`:**
    * Ensure it includes all necessary information about clothing items (name, category, color, material, styles, temperature suitability, etc.).
    * Optimize the structure for efficient filtering and use by the AI.
  