"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

const footerLinks = {
  product: {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#features" },
      { label: "Planos", href: "#pricing" },
      { label: "Integrações", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  company: {
    title: "Empresa",
    links: [
      { label: "Sobre nós", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Contato", href: "#" },
    ],
  },
  support: {
    title: "Suporte",
    links: [
      { label: "Central de Ajuda", href: "#" },
      { label: "Documentação", href: "#" },
      { label: "Status", href: "#" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Termos de Uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
};

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Twitter", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">SaaSWPP AI</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Automatize seu atendimento no WhatsApp com inteligência artificial.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>contato@saaswpp.ai</span>
            </div>
          </div>
          
          {/* Links */}
          {Object.values(footerLinks).map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom footer */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SaaSWPP AI. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
