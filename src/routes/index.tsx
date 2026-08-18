import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard', // Alvo mais provável de existir e ser válido
      replace: true,
    });
  },
  component: () => null,
});
