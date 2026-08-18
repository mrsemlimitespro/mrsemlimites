import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  loader: () => redirect({ to: '/_app', replace: true }),
});

