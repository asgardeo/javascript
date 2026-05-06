# Vue SDK Playground

A comprehensive interactive playground showcasing the **Asgardeo Vue SDK** (`@asgardeo/vue`). This application demonstrates all major features, components, and composables available in the SDK through practical, interactive examples.

## 📋 Overview

The Vue SDK Playground is a feature-rich demo application built with Vue 3 and Vite that provides hands-on examples of:

- **Authentication Components** - Ready-to-use auth flows and login adapters
- **UI Primitives** - Reusable low-level Vue components
- **Presentation Components** - High-level display components
- **Control Components** - Interactive form and control elements
- **Social Login Adapters** - Integration with popular social login providers
- **Action Components** - Event and action-based components
- **Field Factory Pattern** - Dynamic form field generation
- **Composables** - Vue 3 composables for common tasks

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v20.19.0 or >=22.12.0
- **pnpm** or **npm**: For package management

### Installation

```sh
# Install dependencies
pnpm install
```

### Development

```sh
# Start the development server with hot-reload
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

```sh
# Type-check and build for production
pnpm run build

# Preview the production build
pnpm run preview
```

## 📚 Feature Demonstrations

Navigate through the sidebar to explore different aspects of the SDK:

| Section | Description |
|---------|-------------|
| **Overview** | Introduction and quick navigation to all features |
| **Action Components** | Event-driven components and action handlers |
| **Primitive Components** | Basic, reusable UI building blocks |
| **Presentation Components** | Display and layout components |
| **Control Components** | Form controls, inputs, and interactive elements |
| **Social Login Adapters** | Pre-built social login integrations (Google, Facebook, GitHub, etc.) |
| **Auth Flow Components** | Complete authentication flow examples |
| **Field Factory** | Dynamic form field generation patterns |
| **Composables Demo** | Vue 3 composables for authentication, state management, and utilities |

## 🛠️ Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue 3
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Asgardeo Vue SDK** - Authentication and identity management

## 📦 Project Structure

```
src/
├── App.vue                 # Root component with Asgardeo provider
├── main.ts                 # Application entry point
├── components/
│   └── Sidebar.vue        # Navigation sidebar
├── router/
│   └── index.ts           # Vue Router configuration
└── views/
    ├── OverviewView.vue      # Overview/landing page
    ├── ActionsView.vue       # Action components demo
    ├── PrimitivesView.vue    # Primitive components demo
    ├── PresentationView.vue  # Presentation components demo
    ├── ControlView.vue       # Control components demo
    ├── AdaptersView.vue      # Social login adapters demo
    ├── AuthFlowView.vue      # Auth flow components demo
    ├── FactoriesView.vue     # Field factory demo
    └── ComposablesView.vue   # Composables demo
```

## 🔧 Configuration

### Asgardeo Setup

The application is configured with the Asgardeo provider in `App.vue`. Update the following properties for your application:

- `base-url`: Your Asgardeo organization URL
- `client-id`: Your OIDC application client ID
- `after-sign-in-url`: Redirect URL after login
- `after-sign-out-url`: Redirect URL after logout

```vue
<AsgardeoProvider
  base-url="https://api.asgardeo.io/t/your-org"
  client-id="your-client-id"
  after-sign-in-url="http://localhost:5173"
  after-sign-out-url="http://localhost:5173"
>
  <!-- Your app content -->
</AsgardeoProvider>
```

## 🎨 IDE & Browser Setup

### Recommended IDE

- **VS Code** with:
  - [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - Disable Vetur if installed

### Recommended Browser Extensions

**Chromium-based (Chrome, Edge, Brave):**
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Turn on Custom Object Formatter in DevTools](http://bit.ly/object-formatters)

**Firefox:**
- [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
- [Custom Object Formatter](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## 📖 Available Scripts

```sh
# Development server with hot-reload
pnpm run dev

# Type-check the project
pnpm run type-check

# Build for production
pnpm run build

# Build without type-checking
pnpm run build-only

# Preview production build
pnpm run preview

# Run all checks and build
pnpm run build  # Runs type-check and build-only in parallel
```

## 🔗 Related Documentation

- [Asgardeo Vue SDK](https://github.com/asgardeo/asgardeo-auth-vue-sdk) - Official SDK repository
- [Vue 3 Guide](https://vuejs.org/) - Vue 3 documentation
- [Vite Documentation](https://vite.dev/) - Vite build tool docs
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - TypeScript documentation

## 💡 Tips for Learning

1. Start with the **Overview** section to get an overview of all features
2. Explore each component category to understand the available components
3. Check the source code of each view to see implementation examples
4. Use the browser's Vue DevTools to inspect component state and props
5. Refer to the official Asgardeo Vue SDK documentation for detailed API information

## 🤝 Contributing

This is a demonstration project. For contributions to the main Asgardeo Vue SDK, please refer to the [main project repository](https://github.com/asgardeo/asgardeo-auth-vue-sdk).

## 📄 License

This project is licensed under the same license as the main Asgardeo project. See the LICENSE file for details.
