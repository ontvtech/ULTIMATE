"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona a integração com o WhatsApp?",
    answer:
      "Conectamos via API oficial do WhatsApp Business ou através de parceiros certificados. Você escaneia um QR Code e sua conta fica conectada em minutos, sem perder histórico ou contatos.",
  },
  {
    question: "A IA consegue entender meu negócio?",
    answer:
      "Sim! Você alimenta a Base de Conhecimento com informações sobre seus produtos, preços, políticas e processos. A IA usa essas informações para responder com precisão. Quanto mais você ensina, melhor ela fica.",
  },
  {
    question: "E se a IA não souber responder?",
    answer:
      "Nossa IA detecta quando não tem confiança suficiente para responder e transfere automaticamente para um atendente humano. Você também pode configurar palavras-chave que acionam handoff.",
  },
  {
    question: "Posso usar meu número atual do WhatsApp?",
    answer:
      "Sim, mas recomendamos usar um número dedicado para o negócio. Se quiser usar seu número pessoal, ele será convertido para Business e você não poderá usar simultaneamente no celular.",
  },
  {
    question: "Quanto tempo leva para configurar?",
    answer:
      "A configuração básica leva cerca de 15 minutos: conectar o WhatsApp, criar sua conta e adicionar algumas informações na Base de Conhecimento. Em 1-2 horas você já pode estar com automação ativa.",
  },
  {
    question: "A IA funciona 24 horas?",
    answer:
      "Sim, a IA responde automaticamente 24 horas por dia, 7 dias por semana. Você pode configurar mensagens diferentes para horário comercial e fora do horário.",
  },
  {
    question: "Qual a diferença entre os planos?",
    answer:
      "Os planos variam em quantidade de mensagens, números de WhatsApp e recursos disponíveis. O Básico é ideal para começar, o Profissional para negócios em crescimento, e o Premium para empresas que precisam de mais capacidade e personalização.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim, não há fidelidade. Você pode cancelar sua assinatura a qualquer momento e seus dados ficam disponíveis por 30 dias caso queira retornar.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              Frequentes
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre a plataforma e como ela pode ajudar seu negócio.
          </p>
        </div>
        
        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background rounded-lg border px-6"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-emerald-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
