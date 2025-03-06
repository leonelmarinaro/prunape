from datetime import datetime, date
from decimal import Decimal
from typing import Optional

class Child:
    """
    Represents a child with birth date, gestational age, and methods 
    to calculate chronological and corrected ages.
    """
    
    def __init__(self, 
                 birth_date: date, 
                 survey_date: Optional[date] = None,
                 gestational_age_weeks: int = 40):
        """
        Initialize a child with birth date and optional gestational age.
        
        Args:
            birth_date: The child's date of birth
            survey_date: Date of the survey/assessment (defaults to today)
            gestational_age_weeks: Gestational age in completed weeks (defaults to 40 - full term)
        """
        self.birth_date = birth_date
        self.survey_date = survey_date or date.today()
        self.gestational_age_weeks = gestational_age_weeks
    
    def calculate_age(self) -> Decimal:
        """
        Calculate chronological age in decimal years.
        
        Returns:
            Age in decimal years (e.g., 1.65 for 1 year and ~8 months)
        """
        # Calculate age in days
        delta = self.survey_date - self.birth_date
        days_in_year = 365.25  # Account for leap years
        
        # Convert to decimal years with 2 decimal precision
        age_years = Decimal(delta.days / days_in_year).quantize(Decimal('0.01'))
        return age_years
    
    def calculate_corrected_age(self) -> Decimal:
        """
        Calculate age corrected for prematurity if applicable.
        Correction applies only to children under 2 years who were born before 37 weeks.
        
        Returns:
            Corrected age in decimal years
        """
        chronological_age = self.calculate_age()
        
        # Correction only applies to children under 2 years born before 37 weeks
        if chronological_age < 2 and self.gestational_age_weeks < 37:
            # Calculate weeks of prematurity
            weeks_premature = 40 - self.gestational_age_weeks
            
            # Convert weeks to decimal years
            years_correction = Decimal(weeks_premature / 52).quantize(Decimal('0.01'))
            
            # Apply correction
            corrected_age = chronological_age - years_correction
            return corrected_age
        
        # No correction needed
        return chronological_age
    
    def __str__(self) -> str:
        """
        String representation showing both chronological and corrected ages.
        """
        chronological_age = self.calculate_age()
        corrected_age = self.calculate_corrected_age()
        
        result = f"Edad: {chronological_age} años"
        
        # Add corrected age only if different from chronological age
        if corrected_age != chronological_age:
            result += f", Edad corregida: {corrected_age} años"
            
        return result