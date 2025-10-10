import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRouter from '../routes/AppRouter';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AppRouter />
    </QueryClientProvider>
  );
}
