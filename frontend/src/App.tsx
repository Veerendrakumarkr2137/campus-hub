import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router/AppRouter';
import ThreeBackground from '@/components/ui/ThreeBackground';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="relative min-h-screen w-full overflow-hidden">
            {/* 3D Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <ThreeBackground />
            </div>
            
            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
              <AppRouter />
            </div>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
