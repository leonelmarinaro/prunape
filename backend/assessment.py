from datetime import date
from decimal import Decimal
from child import Child
from percetiles import PautasRepository

def run_assessment():
    """Ejemplo de evaluación con corrección de edad por prematurez"""
    
    # Crear el repositorio de pautas
    repo = PautasRepository()
    
    # Datos del caso de ejemplo
    birth_date = date(2017, 9, 18)
    survey_date = date(2019, 5, 22)
    gestational_age = 33  # semanas
    
    # Crear el niño
    child = Child(birth_date, survey_date, gestational_age)
    
    # Mostrar información de edad
    print(f"Fecha de nacimiento: {birth_date.strftime('%d/%m/%Y')}")
    print(f"Fecha de evaluación: {survey_date.strftime('%d/%m/%Y')}")
    print(f"Edad gestacional: {gestational_age} semanas")
    print(f"Edad cronológica: {child.calculate_age()} años")
    print(f"Edad corregida: {child.calculate_corrected_age()} años")
    print("-" * 50)
    
    # Evaluar algunas pautas usando la edad corregida
    age_to_use = child.calculate_corrected_age()
    
    # Ejemplo: evaluar habilidades de un niño de alrededor de 1.5 años
    milestone_ids = [7, 8, 9, 27, 28, 68, 69]
    
    print("Resultados de la evaluación:")
    print("-" * 50)
    for id in milestone_ids:
        pauta = repo.find_by_id(id)
        if pauta:
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

if __name__ == "__main__":
    run_assessment()