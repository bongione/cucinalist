delete from StepPreconditionInputIngredient;
delete from StepPrecondition;
delete from StepInputIngredient;
delete from StepOutputIngredient;
delete from UnitOfMeasureAcceptedLabel;
delete from RecipeIngredient;
delete from CookingStep;
delete from StoreBoughtIngredient;
delete from CookingTechnique;
delete from UnitOfMeasure;
delete from Recipe;
delete from NamedEntity;
delete from Context where id not in ('public', 'root');
