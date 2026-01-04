# C2W2 Virtual Runway - Premium Edition

A commercial-ready, high-performance Single Page Application (SPA) for interactive 3D architectural visualization using Three.js and WebXR.

## 🚀 Features

- **Modern SPA Architecture**: Modular, maintainable TypeScript codebase
- **High Performance**: Optimized asset loading, code splitting, and rendering
- **WebXR Support**: Full VR compatibility with hand controller support
- **Multiple Scene Types**: Auto-rotate, orbit controls, and first-person walk-through
- **Physics System**: Collision detection and player movement with gravity
- **Progressive Loading**: Loading screens and fallback assets
- **Responsive Design**: Works on desktop, mobile, and VR headsets
- **Commercial Ready**: Production-optimized build configuration

## 📦 Tech Stack

- **Three.js**: 3D rendering engine
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **CSS3**: Modern styling with backdrop filters and animations

## 🏗️ Project Structure

```
├── src/
│   ├── core/            # Core application logic
│   │   └── Application.ts
│   ├── managers/        # Feature managers
│   │   ├── SceneManager.ts
│   │   ├── CameraManager.ts
│   │   ├── ModelLoader.ts
│   │   ├── AudioManager.ts
│   │   ├── PhysicsManager.ts
│   │   ├── UIManager.ts
│   │   └── SequenceManager.ts
│   ├── config/          # Configuration files
│   │   └── app.config.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── styles/          # CSS stylesheets
│   │   └── main.css
│   └── main.ts          # Application entry point
├── index.html           # Main HTML file
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Controls

### Desktop Mode
- **Mouse**: Look around (in walk-through mode)
- **W, A, S, D**: Move forward, left, backward, right
- **Space**: Jump
- **Shift**: Sprint
- **F**: Toggle fullscreen
- **Mouse Drag**: Rotate view (in orbit mode)
- **Mouse Wheel**: Zoom (in orbit mode)

### VR Mode
- **Left Joystick**: Move
- **Right Joystick**: Turn
- **Grip Button**: Sprint
- **Headset Movement**: Look around

## 🎨 Scenes

1. **Scene 0 - Pre-Start**: Auto-rotating city view
2. **Scene 1 - Concept & Context**: Interactive conceptual models
3. **Scene 2 - Design Options**: A/B comparison of building facades
4. **Scene 3 - Structural View**: Orbit controls for detailed inspection
5. **Scene 4 - Interior Tour**: Pre-defined camera positions for room views
6. **Scene 5 - Walk-through**: First-person exploration with physics

## ⚙️ Configuration

All configuration is centralized in `src/config/app.config.ts`:

- Asset URLs (models, textures, sounds)
- Scene definitions and camera positions
- Rendering settings (shadows, post-processing)
- Physics parameters
- UI theme colors

## 🔧 Performance Optimizations

- **Code Splitting**: Separate chunks for Three.js core, addons, and post-processing
- **Lazy Loading**: Models and assets loaded on-demand per scene
- **Memory Management**: Automatic disposal of unused resources
- **Shadow Map Optimization**: Reduced shadow resolution for better performance
- **SSAO Conditional**: Disabled for orthographic camera views
- **Pixel Ratio Limiting**: Capped at 2x for high-DPI displays

## 📝 Development

### Adding a New Scene

1. Define scene configuration in `src/config/app.config.ts`
2. Add scene logic in `src/managers/SequenceManager.ts`
3. Add HTML content panels in `index.html`

### Adding New Models

1. Upload model to CDN
2. Add URL to `APP_CONFIG.assets.models` array
3. Reference by index in scene configuration

### Customizing UI

- Modify `src/styles/main.css` for styling
- Update `src/managers/UIManager.ts` for behavior

## 🚢 Deployment

```bash
# Build for production
npm run build

# Output will be in ./dist directory
# Deploy to any static hosting service:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3 + CloudFront
```

### Environment Variables

Create `.env` file for environment-specific configuration:

```env
VITE_API_URL=https://api.example.com
VITE_ASSET_CDN=https://cdn.example.com
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Credits

**Digital Forgery Workshop** - Creative Design Studio

## 🐛 Troubleshooting

### Models not loading
- Check network connectivity
- Verify CORS headers on model URLs
- Check browser console for errors

### VR not working
- Ensure HTTPS connection (required for WebXR)
- Check browser WebXR compatibility
- Verify VR headset is properly connected

### Poor performance
- Reduce shadow map size in config
- Disable post-processing effects
- Lower model poly counts
- Check browser hardware acceleration

## 📚 Documentation

For detailed API documentation, see the JSDoc comments in each TypeScript file.

---

Built with ❤️ by Digital Forgery Workshop
