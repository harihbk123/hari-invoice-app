// src/app/layout.tsx
import { AppLayout } from '@/components/layout/app-layout';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
