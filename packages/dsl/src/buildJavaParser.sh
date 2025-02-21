#!/bin/sh
antlr cucinalistLexer.g4 -o __generated__ && antlr cucinalistParser.g4 -o __generated__ -lib __generated__ && javac __generated__/*.java

