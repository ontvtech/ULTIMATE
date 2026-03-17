"use client";

import { Smartphone, Brain, Rocket, BarChart } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Smartphone,
    title: "Conecte seu WhatsApp",
    description: "Escaneie o QR Code e conecte seu número em menos de 5 minutos. Sem complicações técnicas.",
  },
  {
    step: "02",
    icon: Brain,
    title: "Ensine sua IA",
    description: "Adicione informações sobre seus produtos, serviços, preços e políticas na Base de Conhecimento.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Ative a automação",
    description: "Configure gatilhos, horários de atendimento e regras de handoff. Sua IA já pode atender.",
  },
  {
    step: "04",
    icon: BarChart,
    title: "Monitore e melhore",
    description: "Acompanhe conversas, vendas e agendamentos em tempo real. A IA aprende e melhora continuamente.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Como Funciona
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comece em{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              4 passos simples
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Configure sua automação de atendimento em minutos, não em dias.
          </p>
        </div>
        
        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-800 dark:to-teal-800 -translate-y-1/2" />
              )}
              
              <div className="text-center">
                {/* Step number */}
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-background border-2 border-emerald-500 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {step.step}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
