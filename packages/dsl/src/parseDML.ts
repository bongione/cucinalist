import { CharStream, CommonTokenStream, ParseTreeWalker } from "antlr4";
import CucinalistLexer from "./__generated__/cucinalistLexer";
import CheffieParser from "./__generated__/cucinalistParser";
import { CucinalistWalker } from "./cucinalistWalker";
import { readFile } from "node:fs/promises";
import { CucinalistDMLStatement, IncludeStatement } from "./semanticModel";
import { dirname, join } from "node:path";
import {
  CucinalistSemanticTokenWalker
} from "./cucinalistSemanticTokenWalker";

export async function parseCucinalistDslFile(
  baseDir: string,
  dslFilename: string
) {
  const initialFilename = join(baseDir, dslFilename);
  const initialDir = dirname(initialFilename);
  const data = await readFile(initialFilename, "utf8");

  const statements = parseCucinalistDsl(data);
  for (
    let nextIncludeIndex = statements.findIndex(
      (s) => s.type === "IncludeStatement"
    );
    nextIncludeIndex !== -1;
    nextIncludeIndex = statements.findIndex(
      (s) => s.type === "IncludeStatement"
    )
  ) {
    console.log(
      "Processing include statement",
      JSON.stringify(statements[nextIncludeIndex], null, 2)
    );
    console.log(
      `Parsing file ${join(initialDir, (statements[nextIncludeIndex] as IncludeStatement).fileToInclude)}`
    );
    const includeData = await readFile(
      join(
        initialDir,
        (statements[nextIncludeIndex] as IncludeStatement).fileToInclude
      ),
      "utf8"
    );
    const includeStatements = parseCucinalistDsl(includeData);
    statements.splice(nextIncludeIndex, 1, ...includeStatements);
  }
  return statements as Exclude<CucinalistDMLStatement, IncludeStatement>[];
}

export function parseCucinalistDsl(cucinalistDslString: string) {
  const chars = new CharStream(cucinalistDslString);
  const lexer = new CucinalistLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new CheffieParser(tokens);
  const tree = parser.program();
  const walker = new CucinalistWalker();
  ParseTreeWalker.DEFAULT.walk(walker, tree);
  return walker.statements;
}

export function parseCucinalistSemanticTokensDsl(cucinalistDslString: string) {
  const chars = new CharStream(cucinalistDslString);
  const lexer = new CucinalistLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new CheffieParser(tokens);
  const tree = parser.program();
  const walker = new CucinalistSemanticTokenWalker();
  ParseTreeWalker.DEFAULT.walk(walker, tree);
  return walker.semantiTokens;
}
