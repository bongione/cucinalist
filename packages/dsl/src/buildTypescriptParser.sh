#!/bin/sh
antlr cucinalistLexer.g4 -Dlanguage=TypeScript -o __generated__ && antlr cucinalistParser.g4 -Dlanguage=TypeScript -o __generated__ -lib __generated__ 

