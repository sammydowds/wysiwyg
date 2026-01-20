import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Edit } from './pages/Edit';
import { Create } from './pages/Create';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/posts" element={<Home />} />
          <Route path="/posts/new" element={<Create />} />
          <Route path="/posts/edit/:filename" element={<Edit />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
