from decimal import Decimal
from typing import List, Dict, Optional
import locale

# Set locale for formatting
locale.setlocale(locale.LC_ALL, "es_ES")


class Area:
    """Represents a developmental area like 'Personal Social' or 'Motor Fino'"""

    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

    def __str__(self) -> str:
        return self.name


class TipoPauta:
    """Represents the type of guideline/test (Prueba, Pregunta, etc.)"""

    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

    def __str__(self) -> str:
        return self.name


class Pauta:
    """
    Represents a developmental milestone with percentile thresholds
    and methods to determine if a measurement falls into certain categories.
    """

    def __init__(
        self,
        numero: int,
        nombre: str,
        area: Area,
        p75: str,
        p90: str,
        tipo_pauta: TipoPauta,
        rango_aprobacion: str,
    ):
        self.id = numero
        self.numero = numero
        self.name = nombre
        self.area = area
        self.p75 = Decimal(p75)
        self.p90 = Decimal(p90)
        self.tipo_pauta = tipo_pauta
        self.rango_aprobacion = rango_aprobacion

    def __str__(self) -> str:
        return f"Pauta id: {self.id}. #{self.numero} {self.name} {self.area} P75: {self.p75} P90: {self.p90} Tipo: {self.tipo_pauta} R.Ap: {self.rango_aprobacion}"

    def is_pauta_a(self, age: Decimal) -> bool:
        """
        Returns True if the age is greater than P90 percentile threshold
        """
        return self.p90 < age

    def is_pauta_b(self, age: Decimal) -> bool:
        """
        Returns True if the age is between P75 and P90 percentile thresholds
        """
        return self.p75 <= age <= self.p90


class PautasRepository:
    """Repository to manage all Pautas (developmental milestones)"""

    def __init__(self):
        self.pautas: List[Pauta] = []
        self.areas: Dict[str, Area] = {}
        self.tipos_pauta: Dict[str, TipoPauta] = {}

        # Initialize the areas
        self._init_areas()
        # Initialize the tipos_pauta
        self._init_tipos_pauta()
        # Populate the pautas
        self._populate_pautas()

    def _init_areas(self):
        """Initialize the developmental areas"""
        areas = [
            Area(1, "Personal Social"),
            Area(2, "Motor Fino"),
            Area(3, "Lenguaje"),
            Area(4, "Motor Grueso"),
        ]
        for area in areas:
            self.areas[area.name] = area

    def _init_tipos_pauta(self):
        """Initialize the guideline types"""
        tipos = [
            TipoPauta(1, "Prueba"),
            TipoPauta(2, "Pregunta"),
            TipoPauta(3, "Prueba Demostrada"),
        ]
        for tipo in tipos:
            self.tipos_pauta[tipo.name] = tipo

    def get_area_by_name(self, name: str) -> Optional[Area]:
        """Find area by name"""
        return self.areas.get(name)

    def get_tipo_pauta_by_name(self, name: str) -> Optional[TipoPauta]:
        """Find tipo_pauta by name"""
        return self.tipos_pauta.get(name)

    def _populate_pautas(self):
        """Populate all the developmental milestones/guidelines"""
        # Personal Social - already complete
        self.pautas.append(
            Pauta(
                1,
                "Comunicación con el observador",
                self.get_area_by_name("Personal Social"),
                "0.12",
                "0.27",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                2,
                "Sonrisa social",
                self.get_area_by_name("Personal Social"),
                "0.12",
                "0.16",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                3,
                "Actitud frente al espejo",
                self.get_area_by_name("Personal Social"),
                "0.39",
                "0.50",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                4,
                "Se resiste a que le quiten un juguete",
                self.get_area_by_name("Personal Social"),
                "0.55",
                "0.68",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                5,
                "Juega a las escondidas",
                self.get_area_by_name("Personal Social"),
                "0.55",
                "0.68",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                6,
                "Busca objeto",
                self.get_area_by_name("Personal Social"),
                "0.76",
                "0.90",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                7,
                "Da un objeto",
                self.get_area_by_name("Personal Social"),
                "1.08",
                "1.46",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                8,
                "Juego simbólico",
                self.get_area_by_name("Personal Social"),
                "1.16",
                "1.52",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                9,
                "Come solo",
                self.get_area_by_name("Personal Social"),
                "1.34",
                "1.44",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                10,
                "Ayuda en tareas del hogar",
                self.get_area_by_name("Personal Social"),
                "1.25",
                "1.49",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                11,
                "Acude al llamado del observador",
                self.get_area_by_name("Personal Social"),
                "1.58",
                "2.35",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                12,
                "Imita tareas del hogar",
                self.get_area_by_name("Personal Social"),
                "1.29",
                "1.61",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                13,
                "Se quita ropa o zapatos",
                self.get_area_by_name("Personal Social"),
                "2.42",
                "2.81",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                14,
                "Se pone ropa o zapatos",
                self.get_area_by_name("Personal Social"),
                "2.63",
                "3.01",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                15,
                "Control de esfínteres diurno",
                self.get_area_by_name("Personal Social"),
                "2.39",
                "2.71",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                16,
                "Arma rompecabezas",
                self.get_area_by_name("Personal Social"),
                "2.74",
                "3.17",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                17,
                "Aparea colores",
                self.get_area_by_name("Personal Social"),
                "3.62",
                "3.80",
                self.get_tipo_pauta_by_name("Prueba"),
                "1-4",
            )
        )
        self.pautas.append(
            Pauta(
                18,
                "Junta dibujos semejantes",
                self.get_area_by_name("Personal Social"),
                "4.74",
                "5.74",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )

        # Motor Fino - complete the remaining items
        self.pautas.append(
            Pauta(
                19,
                "Seguimiento visual hasta la línea media",
                self.get_area_by_name("Motor Fino"),
                "0.18",
                "0.21",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                20,
                "Manos semiabiertas",
                self.get_area_by_name("Motor Fino"),
                "0.17",
                "0.24",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                21,
                "Mira su mano",
                self.get_area_by_name("Motor Fino"),
                "0.26",
                "0.33",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                22,
                "Junta manos",
                self.get_area_by_name("Motor Fino"),
                "0.34",
                "0.42",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                23,
                "Pasa un cubo de mano mirándolo",
                self.get_area_by_name("Motor Fino"),
                "0.39",
                "0.45",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                24,
                "Prensión cúbito palmar",
                self.get_area_by_name("Motor Fino"),
                "0.51",
                "0.58",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                25,
                "Prensión pinza superior",
                self.get_area_by_name("Motor Fino"),
                "0.87",
                "0.99",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                26,
                "Vierte / pasa de botella",
                self.get_area_by_name("Motor Fino"),
                "1.27",
                "1.61",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                27,
                "Introduce / pasa en botella",
                self.get_area_by_name("Motor Fino"),
                "1.21",
                "1.46",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                28,
                "Garabatea",
                self.get_area_by_name("Motor Fino"),
                "1.26",
                "1.60",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                29,
                "Torre de 4 cubos",
                self.get_area_by_name("Motor Fino"),
                "1.66",
                "1.98",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                30,
                "Torre de 8 cubos",
                self.get_area_by_name("Motor Fino"),
                "2.61",
                "3.12",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                31,
                "Corrige torre",
                self.get_area_by_name("Motor Fino"),
                "3.14",
                "3.82",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                32,
                "Imita puente",
                self.get_area_by_name("Motor Fino"),
                "3.07",
                "3.66",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                33,
                "Dibuja persona en 3 partes",
                self.get_area_by_name("Motor Fino"),
                "4.07",
                "4.80",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                34,
                "Copia cruz",
                self.get_area_by_name("Motor Fino"),
                "4.22",
                "4.93",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                35,
                "Dobla un papel en diagonal",
                self.get_area_by_name("Motor Fino"),
                "4.48",
                "4.92",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                36,
                "Dibuja persona en 6 partes",
                self.get_area_by_name("Motor Fino"),
                "4.90",
                "5.72",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                37,
                "Copia un triángulo",
                self.get_area_by_name("Motor Fino"),
                "5.53",
                "5.87",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )

        # Lenguaje - complete all items
        self.pautas.append(
            Pauta(
                38,
                "Cocleo palpebral",
                self.get_area_by_name("Lenguaje"),
                "0.04",
                "0.04",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                39,
                "Busca con la mirada a la madre",
                self.get_area_by_name("Lenguaje"),
                "0.47",
                "0.49",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                40,
                "Respuesta al no",
                self.get_area_by_name("Lenguaje"),
                "0.59",
                "0.82",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                41,
                "Silabeo da-da-da ta-ta-ta",
                self.get_area_by_name("Lenguaje"),
                "0.60",
                "0.70",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                42,
                "Silabeo pa-pama-ma, no específico",
                self.get_area_by_name("Lenguaje"),
                "0.69",
                "0.80",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                43,
                "papá-mamá específico",
                self.get_area_by_name("Lenguaje"),
                "1.36",
                "1.70",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                44,
                "Palabra frase",
                self.get_area_by_name("Lenguaje"),
                "1.41",
                "1.89",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                45,
                "Señala 2 figuras",
                self.get_area_by_name("Lenguaje"),
                "1.81",
                "2.25",
                self.get_tipo_pauta_by_name("Prueba"),
                "2-4",
            )
        )
        self.pautas.append(
            Pauta(
                46,
                "Tararea en presencia de terceros",
                self.get_area_by_name("Lenguaje"),
                "2.56",
                "2.84",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                47,
                "Nombra 2 figuras",
                self.get_area_by_name("Lenguaje"),
                "2.26",
                "2.39",
                self.get_tipo_pauta_by_name("Prueba"),
                "2-4",
            )
        )
        self.pautas.append(
            Pauta(
                48,
                "Frase (sustantivo y verbo)",
                self.get_area_by_name("Lenguaje"),
                "2.16",
                "2.41",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                49,
                "Dice su nombre completo",
                self.get_area_by_name("Lenguaje"),
                "2.81",
                "3.61",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                50,
                "Frases completas",
                self.get_area_by_name("Lenguaje"),
                "2.63",
                "3.13",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                51,
                "Comprende preposiciones",
                self.get_area_by_name("Lenguaje"),
                "3.44",
                "4.49",
                self.get_tipo_pauta_by_name("Prueba"),
                "3-4",
            )
        )
        self.pautas.append(
            Pauta(
                52,
                "Cumple 2 indicaciones consecutivas",
                self.get_area_by_name("Lenguaje"),
                "3.64",
                "4.61",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                53,
                "Analogías opuestas",
                self.get_area_by_name("Lenguaje"),
                "3.60",
                "4.28",
                self.get_tipo_pauta_by_name("Prueba"),
                "2-3",
            )
        )
        self.pautas.append(
            Pauta(
                54,
                "Uso de 2 objetos",
                self.get_area_by_name("Lenguaje"),
                "3.81",
                "4.91",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                55,
                "Reconoce 3 colores",
                self.get_area_by_name("Lenguaje"),
                "4.41",
                "4.70",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                56,
                "Sabe por qué es de día o de noche",
                self.get_area_by_name("Lenguaje"),
                "4.69",
                "5.44",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )

        # Motor Grueso - complete all items
        self.pautas.append(
            Pauta(
                57,
                "Sostén cefálico",
                self.get_area_by_name("Motor Grueso"),
                "0.13",
                "0.21",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                58,
                "Levanta cabeza 45º",
                self.get_area_by_name("Motor Grueso"),
                "0.20",
                "0.24",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                59,
                "Posición en línea media",
                self.get_area_by_name("Motor Grueso"),
                "0.21",
                "0.29",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                60,
                "Desaparición del Moro completo simétrico",
                self.get_area_by_name("Motor Grueso"),
                "0.22",
                "0.23",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                61,
                "Palanca",
                self.get_area_by_name("Motor Grueso"),
                "0.35",
                "0.41",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                62,
                "Trípode",
                self.get_area_by_name("Motor Grueso"),
                "0.43",
                "0.49",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                63,
                "Pasa de posición dorsal a lateral",
                self.get_area_by_name("Motor Grueso"),
                "0.46",
                "0.48",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                64,
                "Sentado alcanza objeto",
                self.get_area_by_name("Motor Grueso"),
                "0.62",
                "0.75",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                65,
                "Sentado sin sostén",
                self.get_area_by_name("Motor Grueso"),
                "0.59",
                "0.65",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                66,
                "Logra pararse",
                self.get_area_by_name("Motor Grueso"),
                "0.89",
                "0.95",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                67,
                "Camina sujeto a muebles",
                self.get_area_by_name("Motor Grueso"),
                "0.88",
                "0.98",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                68,
                "Camina de la mano",
                self.get_area_by_name("Motor Grueso"),
                "0.94",
                "1.04",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                69,
                "Camina solo",
                self.get_area_by_name("Motor Grueso"),
                "1.13",
                "1.25",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                70,
                "Se agacha y se levanta sin sostén",
                self.get_area_by_name("Motor Grueso"),
                "1.12",
                "1.30",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                71,
                "Patea pelota",
                self.get_area_by_name("Motor Grueso"),
                "1.28",
                "1.78",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                72,
                "Sube a una silla o sillón sin ayuda",
                self.get_area_by_name("Motor Grueso"),
                "1.35",
                "1.56",
                self.get_tipo_pauta_by_name("Pregunta"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                73,
                "Lanza pelota al examinador",
                self.get_area_by_name("Motor Grueso"),
                "1.85",
                "2.42",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                74,
                "Salta con ambos pies",
                self.get_area_by_name("Motor Grueso"),
                "2.48",
                "2.83",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                75,
                "Se para en un pie 5''",
                self.get_area_by_name("Motor Grueso"),
                "3.08",
                "3.80",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                76,
                "Salto amplio",
                self.get_area_by_name("Motor Grueso"),
                "3.03",
                "3.81",
                self.get_tipo_pauta_by_name("Prueba"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                77,
                "Salta en un pie",
                self.get_area_by_name("Motor Grueso"),
                "3.95",
                "4.69",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                78,
                "Camina talón punta",
                self.get_area_by_name("Motor Grueso"),
                "4.36",
                "5.11",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )
        self.pautas.append(
            Pauta(
                79,
                "Retrocede talón punta",
                self.get_area_by_name("Motor Grueso"),
                "5.28",
                "5.95",
                self.get_tipo_pauta_by_name("Prueba Demostrada"),
                "",
            )
        )

    def find_by_area(self, area_name: str) -> List[Pauta]:
        """Find all pautas for a specific area"""
        return [pauta for pauta in self.pautas if pauta.area.name == area_name]

    def find_by_id(self, id: int) -> Optional[Pauta]:
        """Find a pauta by its id"""
        for pauta in self.pautas:
            if pauta.id == id:
                return pauta
        return None


# Example usage
if __name__ == "__main__":
    repository = PautasRepository()

    # Example: Find all milestones in the "Personal Social" area
    personal_social_pautas = repository.find_by_area("Personal Social")
    print(f"Found {len(personal_social_pautas)} pautas for Personal Social area")

    # Example: Check if a 1.5 year old child meets the criteria for milestone #7
    pauta_7 = repository.find_by_id(7)
    if pauta_7:
        age = Decimal("1.5")
        is_a = pauta_7.is_pauta_a(age)
        is_b = pauta_7.is_pauta_b(age)
        print(f"Child age {age} for milestone '{pauta_7.name}':")
        print(f"  - Is Category A (above P90): {is_a}")
        print(f"  - Is Category B (between P75 and P90): {is_b}")
