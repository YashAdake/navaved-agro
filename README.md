# NAVAVED - Ayurvedic Products Website

An Ayurvedic Blend with a Traditional Touch

## Quick Start

1. Open `index.html` in your browser to view the website
2. Or use a local server for best results

## Project Structure

```
navavedh2/
├── index.html          # Main HTML file
├── styles.css          # CSS stylesheet
├── script.js           # JavaScript functionality
├── assets/
│   ├── hero-bg.png     # Hero section background
│   ├── logo/
│   │   └── logo.png    # NAVAVED logo
│   ├── products/       # Product images
│   │   ├── aayurgul.jpg
│   │   └── annapurna.jpg
│   └── team/           # Team member photos
└── resources/          # Raw resource files
```

## Features

- ✅ Fully responsive design (Mobile, Tablet, Desktop)
- ✅ Modern UI with glassmorphism effects
- ✅ Animated counters for business stats
- ✅ Product cards with modal details
- ✅ Smooth scrolling navigation
- ✅ Marquee reviews section
- ✅ SEO optimized

## Deployment on Netlify

### Option 1: Drag & Drop

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag the entire `navavedh2` folder to the deploy area
4. Your site is live!

### Option 2: Git Repository

1. Push this folder to GitHub/GitLab
2. Connect Netlify to your repository
3. Deploy automatically on every push

## Customization

### Adding New Products

Edit the `products` object in `script.js`:

```javascript
const products = {
    newProduct: {
        name: "Product Name",
        tagline: "Product Tagline",
        tag: "New",
        image: "assets/products/image.jpg",
        description: "Description...",
        ingredients: ["Ingredient 1", "Ingredient 2"],
        benefits: ["Benefit 1", "Benefit 2"],
        price: "₹XXX"
    }
};
```

Then add the product card in `index.html` under the products grid.

### Updating Team Members

Edit the team cards in `index.html` and add photos to `assets/team/`

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #E87722;      /* Main orange */
    --secondary: #5C4033;     /* Brown */
    --cream: #F5E6D3;        /* Background */
}
```

## License

© 2026 NAVAVED. All Rights Reserved.
