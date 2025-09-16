# Co-Watch

Stylish focus timer app featuring both a clock and timer. It boasts a clean, modern design with smooth animations and various themes.

## Features

- ⚡ **Next.js 15** with App Router and Turbopack
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS v4** for styling
- 🌙 **Dark mode** support
- 📱 **Responsive design**
- 🔍 **ESLint** for code quality
- ⏰ **Focus Timer** functionality
- 🎨 **Smooth animations** and modern UI

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
Co-Watch/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── components/
│       └── ui/
│           └── sliding-number.tsx  # Sliding number component
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── tailwind.config.ts       # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
