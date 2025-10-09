import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Employees from '../pages/Employees';
import { Analytics } from '../pages/Analytics';
import { isAuthed } from '../auth';

const Protected = ({ children }: { children: JSX.Element }) => {
  return isAuthed() ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/employees',
    element: (
      <Protected>
        <Employees />
      </Protected>
    ),
  },
  {
    path: '/analytics',
    element: (
      <Protected>
        <Analytics />
      </Protected>
    ),
  },
  { path: '*', element: <Navigate to="/employees" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
