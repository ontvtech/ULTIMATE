"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Básico",
    description: "Para pequenos negócios começando com automação",
    price: 97,
    period: "mês",
    features: [
      "1 número de WhatsApp",
      "1.000 mensagens/mês",
      "IA com base de conhecimento básica",
      "Agendamentos simples",
      "Relatórios básicos",
      "Suporte por email",
    ],
    cta: "Começar Agora",
    popular: false,
  },
  {
    name: "Profissional",
    description: "Para negócios em crescimento que precisam de mais",
    price: 197,
    period: "mês",
    features: [
      "2 números de WhatsApp",
      "5.000 mensagens/mês",
      "IA avançada com aprendizado",
      "Agendamentos completos",
      "Catálogo e pedidos",
      "CRM integrado",
      "Analytics detalhado",
      "Suporte prioritário",
    ],
    cta: "Escolher Profissional",
    popular: true,
  },
  {
    name: "Premium",
    description: "Para empresas que querem o máximo",
    price: 397,
    period: "mês",
    features: [
      "5 números de WhatsApp",
      "20.000 mensagens/mês",
      "IA personalizada",
      "Múltiplos atendentes",
      "API e integrações",
      "White-label disponível",
      "Gerente de sucesso dedicado",
      "SLA garantido",
      "Treinamento personalizado",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Planos
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha o plano{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              ideal para você
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece gratuitamente e evolua conforme seu negócio cresce. Todos os planos incluem 7 dias grátis.
          </p>
        </div>
        
        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative border-2 transition-all ${
                plan.popular 
                  ? "border-emerald-500 shadow-xl scale-105" 
                  : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2 pt-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-end justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                </div>
                
                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <Link href="/register" className="block">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white" 
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Todos os planos incluem: <span className="font-medium">7 dias grátis</span> •{" "}
            <span className="font-medium">Sem fidelidade</span> •{" "}
            <span className="font-medium">Cancele quando quiser</span>
          </p>
        </div>
      </div>
    </section>
  );
}
