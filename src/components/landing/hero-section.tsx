"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-emerald-50/30 to-background dark:from-background dark:via-emerald-950/10 dark:to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Automatize seu atendimento com IA</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Venda e Atenda 24h{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              no WhatsApp
            </span>{" "}
            com Inteligência Artificial
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automatize vendas, agendamentos e suporte com IA treinada para seu negócio. 
            Atenda mais clientes, venda mais e reduza custos.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 h-12 px-8">
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8">
                Conhecer Recursos
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">2.500+</div>
              <div className="text-sm text-muted-foreground">Empresas ativas</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">1M+</div>
              <div className="text-sm text-muted-foreground">Mensagens/mês</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">98%</div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
            </div>
          </div>
        </div>
        
        {/* Hero Image/Illustration */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl p-8 shadow-2xl">
            {/* Mock chat interface */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              {/* Chat header */}
              <div className="bg-emerald-600 text-white px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">Atendimento IA</div>
                  <div className="text-xs text-emerald-200">Online agora</div>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="p-4 space-y-4 h-64 bg-gray-50 dark:bg-gray-800">
                {/* Customer message */}
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
                    Olá! Gostaria de saber sobre os preços
                  </div>
                </div>
                
                {/* AI response */}
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs shadow-sm">
                    <p className="text-sm">Olá! 👋 Sou a IA da empresa. Temos planos a partir de R$ 97/mês. Posso te ajudar a escolher o ideal?</p>
                  </div>
                </div>
                
                {/* Customer message */}
                <div className="flex justify-end">
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-xs">
                    Quero o plano profissional
                  </div>
                </div>
                
                {/* AI response */}
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm max-w-xs shadow-sm">
                    <p className="text-sm">Ótima escolha! 🎉 O Plano Profissional inclui até 5.000 mensagens/mês. Vou te enviar o link de pagamento...</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">IA respondendo...</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hidden md:block">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Resposta em 0.8s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
