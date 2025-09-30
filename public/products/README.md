# Product Images

Place product images in this directory with the following naming convention:

## Expected Images (from seed data)

### IT Accessories
- `webcam-logitech-c270.jpg`
- `headset-jabra-evolve2-65.jpg`
- `headset-jabra-evolve2-40.jpg`
- `mouse-cherry-gentix.jpg`
- `mouse-logitech-lift.jpg`
- `keyboard-cherry-stream.jpg`
- `adapter-usbc-hdmi.jpg`
- `cable-hdmi-roline.jpg`
- `toner-generic.jpg`
- `speakers-generic.jpg`

### Office Supplies
- `whiteboard.jpg`
- `pinboard.jpg`
- `flipchart.jpg`
- `chair.jpg`
- `business-prints.jpg`

## Image Guidelines

- **Format:** JPG, PNG, or WebP
- **Recommended Size:** 800x800px (square aspect ratio)
- **Max File Size:** 500KB for optimal loading
- **Background:** White or transparent preferred

## Fallback Behavior

If an image is not found, the application will display:
- A placeholder icon
- The product name
- Default styling

This ensures the app works even without images during development.

## Adding Images

1. Place images in this directory
2. Update the `imageUrl` field in `prisma/seed.ts` to match the filename
3. Run `npm run prisma:seed` to update the database
4. Refresh the catalog page to see the images

## Free Image Resources

You can find free product images on:
- [Unsplash](https://unsplash.com)
- [Pexels](https://pexels.com)
- [Pixabay](https://pixabay.com)
- Manufacturer websites

## Example

```typescript
// In prisma/seed.ts
{
  name: "Logitech C270 HD-Webcam",
  imageUrl: "/products/webcam-logitech-c270.jpg", // Must match filename
  // ...
}
```

