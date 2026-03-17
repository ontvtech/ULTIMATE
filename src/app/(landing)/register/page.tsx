"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  Check,
  Store,
  Scissors,
  UtenselsCrossed,
  Car,
  Home,
  Briefcase,
  Dumbbell,
  Stethoscope,
  GraduationCap,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const niches = [
  { id: "varejo", name: "Varejo / E-commerce", icon: Store },
  { id: "salao", name: "Salão de Beleza", icon: Scissors },
  { id: "restaurante", name: "Restaurante / Delivery", icon: UtenselsCrossed },
  { id: "auto", name: "Autopeças / Oficina", icon: Car },
  { id: "imobiliaria", name: "Imobiliária", icon: Home },
  { id: "servicos", name: "Serviços Gerais", icon: Briefcase },
  { id: "academia", name: "Academia / Fitness", icon: Dumbbell },
  { id: "saude", name: "Clínica / Consultório", icon: Stethoscope },
  { id: "educacao", name: "Educação / Cursos", icon: GraduationCap },
  { id: "manutencao", name: "Manutenção / Reparos", icon: Wrench },
];

const plans = [
  {
    id: "basico",
    name: "Básico",
    price: 97,
    messages: "1.000",
    features: ["1 número WhatsApp", "IA básica", "Agendamentos", "Suporte email"],
  },
  {
    id: "profissional",
    name: "Profissional",
    price: 197,
    messages: "5.000",
    features: ["2 números WhatsApp", "IA avançada", "Catálogo e pedidos", "CRM", "Suporte prioritário"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 397,
    messages: "20.000",
    features: ["5 números WhatsApp", "IA personalizada", "API", "Gerente dedicado", "SLA garantido"],
  },
];

interface FormData {
  companyName: string;
  phone: string;
  email: string;
  niche: string;
  plan: string;
  ownerName: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  companyName: "",
  phone: "",
  email: "",
  niche: "",
  plan: "",
  ownerName: "",
  password: "",
  confirmPassword: "",
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);
  
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.companyName.trim()) {
          toast({ title: "Erro", description: "Informe o nome da empresa", variant: "destructive" });
          return false;
        }
        if (!formData.phone.trim()) {
          toast({ title: "Erro", description: "Informe o telefone", variant: "destructive" });
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          toast({ title: "Erro", description: "Informe um email válido", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.niche) {
          toast({ title: "Erro", description: "Selecione um nicho", variant: "destructive" });
          return false;
        }
        return true;
      case 3:
        if (!formData.plan) {
          toast({ title: "Erro", description: "Selecione um plano", variant: "destructive" });
          return false;
        }
        return true;
      case 4:
        if (!formData.ownerName.trim()) {
          toast({ title: "Erro", description: "Informe seu nome", variant: "destructive" });
          return false;
        }
        if (formData.password.length < 8) {
          toast({ title: "Erro", description: "A senha deve ter pelo menos 8 caracteres", variant: "destructive" });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ title: "Erro", description: "As senhas não conferem", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.ownerName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          companyName: formData.companyName,
          nicheTemplateId: formData.niche,
          planId: formData.plan,
          linkId: refCode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });
      
      // Redirect to login or dashboard
      router.push("/login?registered=true");
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-emerald-50/30 to-background dark:from-background dark:via-emerald-950/10 dark:to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-xl">SaaSWPP AI</span>
          </Link>
          
          {refCode && (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg text-sm mb-4">
              Você foi convidado por um revendedor! Ganhe benefícios especiais.
            </div>
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Crie sua conta</h1>
          <p className="text-muted-foreground">Passo {step} de {totalSteps}</p>
        </div>
        
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={cn(step >= 1 && "text-emerald-600 font-medium")}>Empresa</span>
            <span className={cn(step >= 2 && "text-emerald-600 font-medium")}>Nicho</span>
            <span className={cn(step >= 3 && "text-emerald-600 font-medium")}>Plano</span>
            <span className={cn(step >= 4 && "text-emerald-600 font-medium")}>Conta</span>
          </div>
        </div>
        
        {/* Form Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Informações da empresa</h2>
                  <p className="text-muted-foreground text-sm">Vamos começar com os dados básicos</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Nome da empresa</Label>
                    <div className="relative mt-1">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Sua Empresa LTDA"
                        value={formData.companyName}
                        onChange={(e) => updateFormData("companyName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Choose Niche */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Qual seu tipo de negócio?</h2>
                  <p className="text-muted-foreground text-sm">Isso nos ajuda a configurar a IA para você</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {niches.map((niche) => (
                    <button
                      key={niche.id}
                      type="button"
                      onClick={() => updateFormData("niche", niche.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        formData.niche === niche.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
                      )}
                    >
                      <niche.icon className={cn(
                        "w-6 h-6",
                        formData.niche === niche.id ? "text-emerald-600" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-xs text-center",
                        formData.niche === niche.id ? "text-emerald-600 font-medium" : "text-muted-foreground"
                      )}>
                        {niche.name}
                      </span>
                      {formData.niche === niche.id && (
                        <Check className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 3: Choose Plan */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Escolha seu plano</h2>
                  <p className="text-muted-foreground text-sm">Comece com 7 dias grátis</p>
                </div>
                
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => updateFormData("plan", plan.id)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all relative",
                        formData.plan === plan.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-border hover:border-emerald-200 dark:hover:border-emerald-800"
                      )}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.messages} mensagens/mês</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">R$ {plan.price}</div>
                          <div className="text-xs text-muted-foreground">/mês</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {plan.features.map((feature, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 4: Create Account */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Crie sua conta</h2>
                  <p className="text-muted-foreground text-sm">Último passo para começar</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ownerName">Seu nome</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="ownerName"
                        placeholder="João Silva"
                        value={formData.ownerName}
                        onChange={(e) => updateFormData("ownerName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Digite a senha novamente"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Ao criar a conta, você concorda com nossos{" "}
                    <Link href="#" className="text-emerald-600 hover:underline">
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link href="#" className="text-emerald-600 hover:underline">
                      Política de Privacidade
                    </Link>
                  </p>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                className="text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando...
                  </span>
                ) : step === totalSteps ? (
                  <>
                    Criar Conta
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Login link */}
        <div className="text-center mt-6">
          <span className="text-muted-foreground text-sm">Já tem uma conta?</span>{" "}
          <Link href="/login" className="text-emerald-600 hover:underline text-sm font-medium">
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
