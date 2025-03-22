lexer grammar cucinalistLexer;

SINGLE_LINE_COMMENT: '//' ~[\r\n]* -> skip;
MULTI_LINE_COMMENT: '/*' .*? '*/' -> skip;
WS: [ \t\n\r]+ -> skip;
INT: DIGIT+;
FLOAT: INT '.' INT;

INCLUDE: [Ii][nN][cC][lL][uU][dD][eE];
CREATE_CONTEXT: [cC][rR][eE][aA][tT][eE] ' '+ [cC][oO][nN][tT][eE][xX][tT];
AND_SWITCH: [aA][nN][dD] ' '+ [sS][wW][iI][tT][cC][hH];
CONTEXT: [cC][oO][nN][tT][eE][xX][tT];
PARENT: [pP][aA][rR][eE][nN][tT];
COURSE: [cC][oO][uU][rR][sS][eE];
RECIPES: [rR][eE][cC][iI][pP][eE][sS];
RECIPE: [rR][eE][cC][iI][pP][eE];
FULLNAME: [fF][uU][lL][lL][nN][aA][mM][eE];
SERVES: [sS][eE][rR][vV][eE][sS];
INGREDIENTS: [iI][nN][gG][rR][eE][dD][iI][eE][nN][tT][sS];
INGREDIENT: [iI][nN][gG][rR][eE][dD][iI][eE][nN][tT];
OPTIONAL: '('[oO][pP][tT][iI][oO][nN][aA][lL]')';
STEPS: [sS][tT][eE][pP][sS];
WHEN: [wW][hH][eE][nN];
DASH: '-';
AND: [aA][nN][dD];
FROM: [fF][rR][oO][mM];
TO: [tT][oO];
IN: [iI][nN];
ON: [oO][nN];
OUTPUTS: [oO][uU][tT][pP][uU][tT][sS];
RA: '->';
RA_PARALLEL_TIME_LEFT: '-[';
RA_PARALLEL_TIME_RIGHT: ']->';
RA_KEEPYE_TIME_LEFT: '-(';
RA_KEEPYE_TIME_RIGHT: ')->';
UNITOFMEASURE: [uU][nN][iI][tT][oO][fF][mM][eE][aA][sS][uU][rR][eE];
COMMA: ',';
MEASURING: [mM][eE][aA][sS][uU][rR][iI][nN][gG];
MEASURED_AS: [mM][eE][aA][sS][uU][rR][eE][dD][aA][sS];
DEFAULTSYMBOL: [dD][eE][fF][aA][uU][lL][tT][sS][yY][mM][bB][oO][lL];
PLURAL: [pP][lL][uU][rR][aA][lL];
MEAL: [mM][eE][aA][lL];
DINERS: [dD][iI][nN][eE][rR][sS];
AKA: [aA][kK][aA];
SM: ';';
LCURLY: '{';
RCURLY: '}';

SINGLE_ID: [a-zA-Z][a-zA-Z_0-9]*;
LQUOTE: '\'' -> more, pushMode(STR);

fragment DIGIT: [0-9];


mode STR;

STRING: '\'' -> popMode;
TEXT: ('\\\'' | ~'\'') -> more;

