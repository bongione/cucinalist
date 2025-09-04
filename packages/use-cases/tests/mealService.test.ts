import { it, expect, describe } from "vitest";
import { createMealService } from "../src";
import { createNaiveMealServiceDependencies, createNaiveRecipeServiceDependencies } from "./naive_dependencies";

describe('MealService', () => {
  describe('createMal', () => {
    it('Should return an empty meal', async () => {
      const service = createMealService(createNaiveMealServiceDependencies());
      const meal = await service.createMeal({
        name: '',
        diners: 1,
        courses: [
          {
            name: 'Test Course',
            recipesIds: []
          }
        ],
      });
      expect(meal).toMatchObject({
        name: '',
        diners: 1,
        courses: [
          {
            name: 'Test Course',
            recipesIds: []
          }
        ],
      });
      expect(meal.id).toBeDefined();
    });

    it('Should throw an error when creating a meal with an existing name', async () => {
      const initData = createNaiveMealServiceDependencies();
      const service = createMealService(initData);
      await service.createMeal({
        name: 'Duplicate Meal',
        diners: 2,
        courses: []
      });
      expect(
        service.createMeal({
          name: 'Duplicate Meal',
          diners: 2,
          courses: []
        }),
      ).rejects.toThrow('Meal with name "Duplicate Meal" already exists.');
    });

    it('Should create a meal with valid data', async () => {
      const initData = createNaiveMealServiceDependencies({
        recipes: [
          { id: 'r1', name: 'Test Recipe', servings: 4, ingredients: [], steps: [] }
        ]
      });
      const service = createMealService(initData);

      const meal = await service.createMeal({
        name: 'Test Meal',
        diners: 4,
        courses: [
          {
            name: 'Test Course',
            recipesIds: [{type: 'Recipe', id: 'r1'}]
          }
        ],
      });

      expect(meal).toMatchObject({
        name: 'Test Meal',
        diners: 4,
        courses: [
          {
            name: 'Test Course',
            recipesIds: [{type: 'Recipe', id: 'r1'}]
          }
        ],
      });
      expect(meal.id).toBeDefined();
    })
  });

  describe('updateMeal', () => {
    it('Should update an existing meal', async () => {
      const initData = createNaiveMealServiceDependencies();
      const service = createMealService(initData);
      const meal = await service.createMeal({
        name: 'Original Meal',
        diners: 2,
        courses: []
      });
      const updatedMeal = await service.updateMeal(meal.id, {
        name: 'Updated Meal',
        diners: 3,
        courses: []
      });
      expect(updatedMeal.name).toBe('Updated Meal');
      expect(updatedMeal.diners).toBe(3);
    });

    it('Should throw an error when updating a non-existing meal', async () => {
      const service = createMealService(createNaiveMealServiceDependencies());
      await expect(
        service.updateMeal('non-existing-id', { name: 'Updated Meal' })
      ).rejects.toThrow('Meal with id "non-existing-id" does not exist.');
    });
  });

  describe('deleteMeal', () => {
    it('Should delete an existing meal', async () => {
      const initData = createNaiveMealServiceDependencies();
      const service = createMealService(initData);
      const meal = await service.createMeal({
        name: 'Meal to Delete',
        diners: 2,
        courses: []
      });
      await service.deleteMeal(meal.id);
      await expect(await service.getMealById(meal.id)).toBeNull();
    });

    it('Should throw an error when deleting a non-existing meal', async () => {
      const service = createMealService(createNaiveMealServiceDependencies());
      await expect(service.deleteMeal('non-existing-id')).rejects.toThrow('Meal with id "non-existing-id" does not exist.');
    });
  })
})
