import { render, screen } from '@testing-library/react';
import Login from '../../features/auth/Login';
import { MemoryRouter } from 'react-router-dom';

test('muestra título Iniciar sesión', () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
});
