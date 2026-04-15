import { createRoot } from 'react-dom/client'
import { Component, type ReactNode, type ErrorInfo } from 'react'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "@/components/ThemeProvider"

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', fontFamily: 'monospace' }}>
          <h1>Application Error</h1>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="health-app-theme">
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
} catch (e) {
  console.error('Fatal render error:', e);
  document.getElementById("root")!.innerHTML = '<pre style="color:red;padding:40px">' + (e as Error).message + '\n' + (e as Error).stack + '</pre>';
}
