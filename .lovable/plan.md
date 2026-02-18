
# Update Favicon

## What changes

Copy the uploaded rocket logo image to the `public/` directory and update `index.html` to reference it as the favicon.

## Technical Changes

### 1. Copy the image
Copy `user-uploads://image-11.png` → `public/favicon.png`

### 2. File: `index.html`
Add a `<link rel="icon">` tag in the `<head>` pointing to `/favicon.png`:

```html
<link rel="icon" href="/favicon.png" type="image/png">
```
