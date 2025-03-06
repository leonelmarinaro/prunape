from datetime import date
from decimal import Decimal
from child import Child
from percetiles import PautasRepository


def run_assessment():
    """Ejemplo de evaluación con corrección de edad por prematurez"""

    # Crear el repositorio de pautas
    repo = PautasRepository()

    # Datos del caso de ejemplo
    birth_date = date(2016, 1, 18)
    survey_date = date(2019, 5, 16)
    gestational_age = 38  # semanas

    # Crear el niño
    child = Child(birth_date, survey_date, gestational_age)

    # Mostrar información de edad
    print(f"Fecha de nacimiento: {birth_date.strftime('%d/%m/%Y')}")
    print(f"Fecha de evaluación: {survey_date.strftime('%d/%m/%Y')}")
    print(f"Edad gestacional: {gestational_age} semanas")
    print(f"Edad cronológica: {child.calculate_age()} años")
    print(f"Edad corregida: {child.calculate_corrected_age()} años")
    print("-" * 50)

    # Obtener todas las pautas apropiadas para la edad del niño
    age_to_use = child.calculate_corrected_age()
    suitable_pautas = []

    for pauta in repo.pautas:
        if pauta.should_evaluate(age_to_use):
            suitable_pautas.append(pauta)

    # Asegurar que hay pautas de cada área del desarrollo
    areas_covered = set(pauta.area.name for pauta in suitable_pautas)
    print(f"Áreas cubiertas en la evaluación: {areas_covered}")
    print(f"Total de pautas a evaluar: {len(suitable_pautas)}")

    # Usar las pautas seleccionadas en lugar de IDs hardcodeados
    print("Resultados de la evaluación:")
    print("-" * 50)

    for pauta in suitable_pautas:
        is_a = pauta.is_pauta_a(age_to_use)
        is_b = pauta.is_pauta_b(age_to_use)

        result = "Normal"
        if is_a:
            result = "Por encima de P90 (desarrollo avanzado)"
        elif is_b:
            result = "Entre P75-P90 (desarrollo superior al promedio)"

        print(f"Pauta {pauta.id}: {pauta.name} ({pauta.area}) - {result}")
        print(f"  P75: {pauta.p75}, P90: {pauta.p90}, Edad corregida: {age_to_use}")
        print()

    # Diccionario para almacenar resultados (pasa/falla) para cada pauta
    resultados = {}

    # En un caso real permitiríamos al evaluador ingresar los resultados
    print("\nIngrese resultados para cada pauta (S=Pasa, N=Falla):")
    for pauta in suitable_pautas:
        while True:
            print(f"Pauta {pauta.id}: {pauta.name} ({pauta.tipo_pauta})")
            respuesta = input("¿Pasa esta prueba? (S/N): ").strip().upper()
            if respuesta in ["S", "N"]:
                resultados[pauta.id] = respuesta == "S"
                break
            print("Por favor, ingrese S o N.")

    # Mostrar resultados finales
    print("\nResultados finales:")
    for pauta_id, pasa in resultados.items():
        resultado = "Pasa" if pasa else "Falla"
        print(f"Pauta {pauta_id}: {resultado}")


if __name__ == "__main__":
    run_assessment()
