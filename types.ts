export enum Category {
  FOOD = 'Alimentación',
  HOUSING = 'Vivienda',
  TRANSPORT = 'Transporte',
  GOODS = 'Bienes',
  SERVICES = 'Servicios',
}

export interface Option {
  label: string;
  value: number;
  description?: string;
}

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: Option[];
}

export interface CalculationResult {
  totalGha: number;
  numberEarths: number;
  overshootDate: string; // "DD MMM"
  carbonFootprint: number; // tCO2/year
  breakdown: Record<Category, number>;
}

export interface QuizState {
  [questionId: string]: number;
}

export interface StudentProfile {
  name: string;
  studentCode: string;
  courseCycle: string;
  professionalSchool: string;
}