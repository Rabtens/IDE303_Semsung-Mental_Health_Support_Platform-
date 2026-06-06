# MindfulChat React Website

A beautiful, responsive React website for the MindfulChat mental health support platform.

## Project Structure

```
react-app/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/
│   │   ├── Header.js        # Navigation & logo
│   │   ├── Footer.js        # Footer section
│   │   ├── Hero.js          # Hero section
│   │   ├── Features.js      # Features grid
│   │   ├── About.js         # About section
│   │   ├── Testimonials.js  # User testimonials
│   │   ├── Resources.js     # Mental health resources
│   │   ├── CTA.js           # Call-to-action section
│   │   └── *.css            # Component styles
│   ├── pages/
│   │   ├── LandingPage.js   # Main landing page
│   │   └── ChatPage.js      # Chatbot page (embeds iframe)
│   ├── App.js               # Main app component with routing
│   ├── App.css              # Global styles
│   ├── index.js             # React entry point
│   └── index.css            # Global CSS
├── package.json
└── README.md (this file)
```

## Features

- **React 18** — Modern React with hooks
- **React Router v6** — Client-side routing (Landing & Chat pages)
- **Responsive Design** — Mobile, tablet, desktop optimized
- **Sage/Cream Theme** — Consistent with chatbot branding
- **Integrated Chatbot** — Embedded chatbot on `/chat` route
- **API Integration** — Connected to backend conversation storage

## Setup & Installation

### 1. Install dependencies
```bash
cd /path/to/mhsp/react-app
npm install
```

### 2. Build the React app
```bash
npm run build
```
This creates an optimized build in `react-app/build/`.

### 3. Run the server
From the parent `/mhsp` folder:
```bash
node server-react.js
```

Expected output:
```
🌿 MindfulChat server running at http://localhost:3000
```

### 4. Open in browser
Visit: **http://localhost:3000**

---

## Development Mode

For development with hot-reload:

```bash
cd react-app
npm start
```
This runs the React dev server on `http://localhost:3000` with auto-refresh.

---

## Build for Production

```bash
npm run build
```

The optimized build is output to `react-app/build/`.

---

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage` | Homepage with hero, features, about, testimonials, resources |
| `/chat` | `ChatPage` | Embedded chatbot iframe |

---

## Component Breakdown

### Pages
- **LandingPage** — Composes all landing sections
- **ChatPage** — Embeds `mindful_chat.html` in an iframe

### Sections
- **Hero** — Eye-catching headline + dual CTAs
- **Features** — 6-card grid of platform features
- **About** — Mission statement + brand story
- **Testimonials** — User testimonials with 5-star ratings
- **Resources** — Mental health tips & resources grid
- **CTA** — Final call-to-action section

### Layout
- **Header** — Sticky navigation + logo
- **Footer** — Links + disclaimer + copyright

---

## Styling

All styles use CSS custom properties defined in `App.css`:
- `--sage`, `--sage-light`, `--sage-dark` — Green palette
- `--cream`, `--warm`, `--mist` — Neutral palette
- `--charcoal`, `--mid` — Text colors
- `--radius` — Border radius
- `--shadow` — Box shadow

Each component has its own `.css` file for scoped styling.

---

## Routing

Uses `react-router-dom` v6 for client-side routing:
- Landing page sections are within the same page (scroll navigation)
- `/chat` is a separate page that embeds the chatbot iframe
- All navigation is instant (no page reloads)

---

## Next Steps (Optional)

- **Add animations** — Framer Motion or React Spring
- **Dark mode** — Add theme toggle
- **Blog section** — Mental health articles
- **Booking** — Schedule therapy sessions
- **Analytics** — Google Analytics integration
- **Form validation** — Contact form with validation

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| Port 3000 in use | Change PORT in `server-react.js` |
| Build fails | Delete `node_modules`, run `npm install` again |
| Chatbot not loading | Ensure `mindful_chat.html` exists in parent directory |

---

**Made with 💚 for mental health.**
