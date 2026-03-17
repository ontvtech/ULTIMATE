import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "SaaSWPP AI - Automatize seu Atendimento com Inteligência Artificial",
  description: "Plataforma SaaS de atendimento via WhatsApp com IA. Automatize vendas, agendamentos e suporte com inteligência artificial avançada.",
  keywords: ["WhatsApp", "IA", "Atendimento", "Automação", "SaaS", "Vendas", "Agendamentos"],
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        {/* Minimal Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">SaaSWPP AI</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Planos
              </Link>
              <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
