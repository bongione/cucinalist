import { Reference } from "../types/reference";

/**
 * A meal is where you collect recipes to be prepared together, grouped in
 * one or more courses. A meal can be a single recipe, or a collection of recipes
 * for each course.
 *
 * A wedding may for instance have seven courses, and some of the courses, like the
 * starter, may involve several recipes.
 */
export interface Meal {
  id: string;
  name: string;
  description?: string;
  diners: number;
  courses: Course[];
}

export interface Course {
  name?: string;
  recipesIds: Reference<'Recipe'>[];
}

export interface MealProvider {
  getMealById: (id: string) => Promise<Meal | null>;
  getMealsByName: (name: string) => Promise<Meal[]>;
}
