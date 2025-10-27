# Arkiv

This is the frontend application for **Arkiv**, built with [Vite](https://vitejs.dev/), React.js and TypeScript.  
---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/vitwit/arkiv.git
cd webapp
npm install
```

### ⚙️ Environment Variables

This project uses environment variables for configuration.

### Setup

1. Copy the example environment file:
  ```bash
  cp .env.example .env
  ```
2. Open `.env` and update values as needed:

```
VITE_CONTRACT="0x1f8C9254C237e0562b05bF55a7cEBD4618d0009a"
VITE_RPC_URL="https://sepolia.infura.io/v3/<api-key>"
VITE_TX_HASH_URL="https://sepolia.etherscan.io/tx/"
```



### Available Commands

In the project directory, you can run:

```
npm run dev
```

Starts the development server with Vite.
Accessible at:

Local: http://localhost:5173

```
npm run build
```
Builds the project for production. The output will be in the `dist/` folder.


```
npm run preview
```

Locally preview the production build.
Runs a local server to serve files from the dist/ folder.

```
npm run lint
```

Runs `ESLint` to check for code quality and style issues.

### 🛠️ Tech Stack
- Vite
- React.js
- TypeScript
- ESLint
 