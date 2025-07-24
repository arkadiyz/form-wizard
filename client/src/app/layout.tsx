import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Application Form',
  description: 'Multi-step job application form with advanced validation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <Providers>
          <div className="app-container">
            <header className="app-header">
              <h1>Job Application</h1>
            </header>
            <main className="app-main">{children}</main>
            <footer className="app-footer">
              <p>&copy; 2025 Company Name</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
