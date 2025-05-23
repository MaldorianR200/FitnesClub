import { AbstractControl } from "@angular/forms";

// Валидатор для номера телефона
export function phoneNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  // Российский формат: +7XXXXXXXXXX или 8XXXXXXXXXX
  const russianRegex = /^(\+7|8)[0-9]{10}$/;

  const isValid = russianRegex.test(value);
  return isValid ? null : { invalidPhone: true };
}
