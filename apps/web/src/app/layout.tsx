import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';

export const metadata: Metadata = {
  title: 'FLAIR — Web3 SocialFi',
  description: 'Creator economy powered by blockchain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
