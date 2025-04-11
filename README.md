# Firebase Studio - Fashion Assistant ✨

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-site-id/deploy-status)](https://app.netlify.com/sites/your-netlify-site-name/deploys)

A cutting-edge fashion assistant built with Next.js, Firebase, Genkit, and Shadcn/ui, designed to revolutionize your wardrobe and style choices.

## Key Features 🚀

-   **AI-Powered Outfit Suggestions:** Get personalized outfit recommendations based on current weather conditions and your preferred style.
-   **Tomorrow's Forecast Ready:** Plan ahead with outfit suggestions tailored for the next day's weather.
-   **Style Selection:** Choose from a variety of styles including casual, formal, work, and more to match your needs.
-   **Detailed Outfit Information:** Each suggestion includes the garment name, category, color, material, and a helpful description.
-   **Explanation:** Understand why a particular outfit is recommended with AI-generated justifications.
-   **Modern and Responsive UI:** Enjoy a seamless experience on any device with a beautiful and intuitive user interface powered by Shadcn/ui.

## Tech Stack 🛠️

-   **Frontend:**
    -   [Next.js](https://nextjs.org/): React framework for building performant web applications.
    -   [Shadcn/ui](https://ui.shadcn.com/): Reusable components, easily customizable.
    -   [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework for rapid UI development.
    -   [Lucide React](https://lucide.dev/): Beautifully simple icons.
-   **Backend & AI:**
    -   [Firebase](https://firebase.google.com/): Comprehensive platform for app development.
    -   [Genkit](https://genkit.dev/): GenAI stack, toolkit for building reliable, scalable, and observable AI-powered features
-   **Other:**
    -   [Zod](https://zod.dev/): TypeScript-first schema validation with static type inference.
    -   [React Hook Form](https://www.react-hook-form.com/): For flexible and extensible forms.

## Getting Started 🚦

### Prerequisites

-   Node.js (version >= 18)
-   npm or yarn package manager
-   Firebase project set up
-   Genkit configured

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up environment variables:

    -   Create a `.env` file in the root directory.
    -   Add your Firebase configuration and any other necessary environment variables.

    ```
    # Example .env
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    # ... other Firebase config
    ```

4.  Run the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the application.

## Contributing 🤝

Contributions are welcome! Feel free to open issues, submit pull requests, or suggest improvements.

## License 📜

[MIT](LICENSE)
