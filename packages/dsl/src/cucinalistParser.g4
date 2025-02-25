parser grammar cucinalistParser;

options {tokenVocab=cucinalistLexer;}

program: (statement)*;
statement: recipe | unitOfMeasure | meal | include | context | createContext;

include: INCLUDE fileToInclude=quotedString;
context: CONTEXT contextId=id;
createContext: CREATE_CONTEXT AND_SWITCH? contextId=id (PARENT parentId=id)?;

recipe: RECIPE reciepeId=id (FULLNAME fullname=quotedString)? serving ingredients steps;

serving: SERVES INT;
ingredients: INGREDIENTS (ingredientLine)+;
ingredientLine:  DASH (optional=OPTIONAL)? ingredientAmount? (unitOfMeasureId=id)? ingrediendNameId=id SM;

ingredientAmount: number # singleNumber
    | range # amountRange;

range: lowerBound=number DASH upperBound=number;
number: INT # intAmount
    | FLOAT # floatAmount;


steps: STEPS recipeStepLine+;
recipeStepLine: condition? cookingStep;
condition: DASH WHEN whenCondition (COMMA whenCondition)*;
whenCondition: id string?;
cookingStep: DASH OPTIONAL? action=id sourceIngredients=idList
    (FROM sourceOfStep=id)? ((TO|ON) targetOfStep=id)? (IN mediumOfStep=id)?
    (( DASH activeMinutes=INT RA
    | RA
    | RA_PARALLEL_TIME_LEFT parallellMinutes=INT RA_PARALLEL_TIME_RIGHT
    | RA_KEEPYE_TIME_LEFT keepEyelMinutes=INT RA_KEEPYE_TIME_RIGHT
    ) outputs=idList)? SM;
idList: id (COMMA id)* (AND id)?;

id: quotedString | unquotedString;

unitOfMeasure: UNITOFMEASURE name=id LCURLY MEASURING measuring=id DEFAULTSYMBOL  (defaultSymbol=string)? (PLURAL plural=string)? (AKA akaList=stringList)? RCURLY;
stringList: string (COMMA string)*;
string: unquotedString | quotedString;

unquotedString: SINGLE_ID;
quotedString: STRING;

meal: MEAL mealId=id (FULLNAME fullname=quotedString)? DINERS nDiners=number (RECIPES recipeLine+|course+);
course: COURSE courseName=id recipeLine+;
recipeLine: DASH recipeId=id SM;
