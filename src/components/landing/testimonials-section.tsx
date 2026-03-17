"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Maria Silva",
    role: "CEO",
    company: "Boutique Fashion",
    avatar: "",
    content: "Aumentamos nossas vendas em 40% no primeiro mês. A IA atende 24h e meus vendedores só precisam fechar as vendas quentes.",
    rating: 5,
  },
  {
    name: "Carlos Santos",
    role: "Proprietário",
    company: "Clínica Estética CS",
    avatar: "",
    content: "Antes perdíamos muitos agendamentos por não atender fora do horário. Agora a IA agenda, confirma e remarca automaticamente.",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Gerente",
    company: "Pizzaria do Bairro",
    avatar: "",
    content: "Nosso tempo de resposta caiu de horas para segundos. Clientes mais satisfeitos e pedidos aumentaram significativamente.",
    rating: 5,
  },
  {
    name: "Roberto Lima",
    role: "Fundador",
    company: "AutoPeças RL",
    avatar: "",
    content: "A IA aprendeu nosso catálogo de 2.000 peças e agora responde consultas técnicas que antes só eu sabia. Impressionante!",
    rating: 5,
  },
  {
    name: "Juliana Costa",
    role: "Diretora",
    company: "Imobiliária Nova Era",
    avatar: "",
    content: "Qualificamos leads automaticamente e agendamos visitas sem intervenção humana. Nossa equipe foca no que importa: fechar negócios.",
    rating: 5,
  },
  {
    name: "Fernando Alves",
    role: "Sócio",
    company: "Delivery Gourmet",
    avatar: "",
    content: "Integramos com nosso sistema de pedidos e agora a IA anota pedidos, tira dúvidas sobre cardápio e acompanha entregas.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Depoimentos
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              clientes dizem
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Milhares de negócios já transformaram seu atendimento com a SaaSWPP AI.
          </p>
        </div>
        
        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg bg-background relative">
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-emerald-100 dark:text-emerald-900/50" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-muted-foreground mb-6 relative z-10">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
