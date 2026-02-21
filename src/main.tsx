import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error and unhandled rejection tracking for production stability
window.addEventListener("unhandledrejection", (event) => {
    console.error("Critical: Unhandled promise rejection:", event.reason);
    // In a real production app, we would send this to Sentry/LogRocket here
});

window.addEventListener("error", (event) => {
    console.error("Critical: Runtime error captured:", event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
