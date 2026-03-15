# Cigar Cloud UI - Case Study

### Live Site

https://cigar-cloud.netlify.app/

<img src="https://image.thum.io/get/width/800/https://cigar-cloud.netlify.app/" alt="Cigar Cloud live site screenshot" width="800" height="500" />

---

A modern, responsive Next.js application showcasing the Cigar Cloud case study with advanced animations, dark mode support, and a beautiful gradient-based UI.

## Features

- ✨ **Light & Dark Mode** - Seamless theme switching with system preference detection
- 📱 **Mobile Responsive** - Fully optimized for all device sizes
- 🎨 **Modern UI** - Beautiful gradient backgrounds and highlighted gradient text
- 🎬 **Advanced Animations** - Smooth scroll animations and micro-interactions using Framer Motion
- 🌈 **Gradient Design** - Stunning gradient backgrounds and text effects
- ⚡ **Performance** - Optimized with Next.js 14 App Router

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **next-themes** - Theme management

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
cigar-cloud-ui/
├── app/
│   ├── layout.tsx      # Root layout with theme provider
│   ├── page.tsx        # Main case study page
│   └── globals.css     # Global styles and utilities
├── components/
│   ├── ThemeProvider.tsx   # Theme context provider
│   ├── ThemeToggle.tsx     # Dark mode toggle button
│   └── ScrollAnimation.tsx # Scroll animation wrapper
└── public/             # Static assets
```

## Features Breakdown

### Dark Mode
- Toggle button in the top-right corner
- Respects system preferences
- Smooth transitions between themes

### Animations
- Scroll-triggered animations using Intersection Observer
- Hover effects on interactive elements
- Smooth page transitions
- Staggered animations for lists

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible grid layouts
- Adaptive typography

### Gradient Effects
- Gradient text for headings
- Gradient backgrounds for sections
- Animated gradient overlays

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme.

### Animations
Modify `components/ScrollAnimation.tsx` to adjust animation behavior.

### Theme
Update `app/globals.css` for custom gradient definitions.

## License

This project is created for demonstration purposes.
