"use client";

import { 
  Bot, 
  MessageSquare, 
  Calendar, 
  ShoppingCart, 
  Brain, 
  BarChart3,
  Zap,
  Shield
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "IA Inteligente",
    description: "Assistente virtual treinado para seu negócio. Aprende com suas respostas e melhora continuamente.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    description: "Conecte seu WhatsApp Business em minutos. Receba e responda mensagens automaticamente.",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: Calendar,
    title: "Agendamentos Automáticos",
    description: "Cliente agenda, confirma e remarca pelo WhatsApp. Você só se preocupa em atender.",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: ShoppingCart,
    title: "Vendas no Automático",
    description: "Catálogo de produtos, pedidos e pagamentos. Sua IA vende 24 horas por dia.",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: Brain,
    title: "Base de Conhecimento",
    description: "Ensine sua IA sobre produtos, políticas e processos. Ela consulta e responde com precisão.",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: BarChart3,
    title: "Analytics Completo",
    description: "Acompanhe conversas, vendas, agendamentos e performance da IA em tempo real.",
    color: "text-pink-500",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: "Respostas Instantâneas",
    description: "Resposta em menos de 2 segundos",
  },
  {
    icon: Shield,
    title: "Handoff Inteligente",
    description: "Transfere para humano quando necessário",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Recursos
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              automatizar seu negócio
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa para gerenciar seu atendimento, vendas e agendamentos via WhatsApp.
          </p>
        </div>
        
        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional features */}
        <div className="flex flex-wrap justify-center gap-6">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 bg-background rounded-full px-6 py-3 shadow-md">
              <feature.icon className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
