import type { ReactNode } from 'react';

interface AlertProps {
  kind?: 'error' | 'info' | 'success';
  children: ReactNode;
}

export function Alert({ kind = 'info', children }: AlertProps) {
  const color = kind === 'error' ? 'bg-red-50 text-red-700 border-red-300' : kind === 'success' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-300';
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`text-sm rounded border px-3 py-2 ${color}`}>{children}</div>
  );
}
