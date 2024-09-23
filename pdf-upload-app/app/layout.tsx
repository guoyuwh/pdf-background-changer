// app/layout.tsx
import ThemeRegistry from './theme/ThemeRegistry';

export const metadata = {
  title: 'PDF Background Coler Change App',
  description: 'Upload a PDF file and change the background color of the whole file.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
