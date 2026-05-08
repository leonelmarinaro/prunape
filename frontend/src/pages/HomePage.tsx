import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const infoCards = [
  {
    title: "¿Qué es PRUNAPE?",
    description:
      "Herramienta de screening del desarrollo infantil para niños de 0 a 6 años. Evalúa 79 hitos en áreas como motricidad, lenguaje, personal-social y coordinación.",
  },
  {
    title: "¿Cómo funciona?",
    description:
      "Se registran los hitos que el niño cumple o no cumple. El sistema calcula la edad cronológica (y corregida para prematuros) y determina automáticamente si el niño PASA o NO PASA la pesquisa.",
  },
  {
    title: "Resultado de la evaluación",
    description:
      "Si el niño no cumple 1 hito Tipo A o 2 hitos Tipo B acordes a su edad, el resultado es NO PASA y se sugiere derivación para evaluación especializada.",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">PRUNAPE</h1>
        <p className="text-[var(--muted-foreground)] text-lg mb-8">
          Prueba Nacional de Pesquisa — Sistema de Evaluación del Desarrollo Infantil
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link to="/patients">Ver Pacientes</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/patients/new">Nuevo Paciente</Link>
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {infoCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
