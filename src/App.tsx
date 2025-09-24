import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { MuiThemeProvider } from '@/app/providers/ThemeProvider';
import { QueryProvider } from '@/app/providers/QueryProvider';

export default function App() {
  return (
    <MuiThemeProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </MuiThemeProvider>
  );
}
