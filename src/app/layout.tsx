import { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SaaSWPP AI - Inteligência Artificial para WhatsApp',
  description: 'Plataforma SaaS multitenant para operação comercial via WhatsApp com inteligência artificial integrada. Automatize vendas, agendamentos e atendimento.',
  keywords: ['WhatsApp Business', 'IA', 'Chatbot', 'Automação', 'CRM', 'Vendas', 'Atendimento'],
  authors: [{ name: 'SaaSWPP AI Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SaaSWPP AI - Inteligência Artificial para WhatsApp',
    description: 'Automatize vendas, agendamentos e atendimento com IA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
