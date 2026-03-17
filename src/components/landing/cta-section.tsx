"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "7 dias grátis para testar",
  "Sem cartão de crédito",
  "Setup em menos de 15 minutos",
  "Suporte em português",
];

export function CtaSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 md:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Pronto para transformar seu atendimento?
            </h2>
            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              Junte-se a mais de 2.500 empresas que já automatizaram seu WhatsApp com IA.
            </p>
            
            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-emerald-200" />
                  <span className="text-sm md:text-base">{benefit}</span>
                </div>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 h-12 px-8 shadow-lg">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                  Ver Planos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
