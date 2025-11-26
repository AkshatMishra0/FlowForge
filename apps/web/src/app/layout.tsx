import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowForge - WhatsApp Automation & Invoicing',
  description: 'WhatsApp Automation + Smart Invoicing + Payment Reminder SaaS for Local Businesses',
  keywords: ['WhatsApp automation', 'invoicing', 'payment reminders', 'CRM', 'booking system'],
  authors: [{ name: 'FlowForge Team' }],
  openGraph: {
    title: 'FlowForge - WhatsApp Automation & Invoicing',
    description: 'WhatsApp Automation + Smart Invoicing + Payment Reminder SaaS for Local Businesses',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
