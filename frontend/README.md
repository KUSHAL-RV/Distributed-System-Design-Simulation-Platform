# 🎨 LiveSysDesign Frontend

The visual interface for the LiveSysDesign ecosystem, built with Next.js and React Flow.

## 🚀 Features

- **Glassmorphism UI**: Modern, dark-themed interface with high-fidelity effects.
- **Interactive Canvas**: Real-time architecture design using `React Flow`.
- **Dynamic Telemetry Charts**: Live visualization of system health using `Recharts`.
- **Responsive Layout**: Designed for high-resolution displays used by system architects.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Graphing**: @xyflow/react (React Flow)
- **Icons**: Lucide React
- **Data Visualization**: Recharts

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Environment Variables**:
   Ensure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are set to your Gateway address (default: `http://127.0.0.1:4000`).

## 📁 Structure

- `/app`: Next.js pages and layouts.
- `/components`: Reusable UI elements, builder components, and simulation widgets.
- `/hooks`: Custom React hooks for design and simulation logic.
- `/store`: Zustand state definitions.
- `/lib`: API client and shared utilities.
