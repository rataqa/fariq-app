import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import HomePage from './pages/HomePage';
import { ApiProvider } from './contexts/ApiContext';

const queryClient = new QueryClient();

function App() {
  return (
    <ApiProvider>
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </ApiProvider>
  );
}

export default App;
