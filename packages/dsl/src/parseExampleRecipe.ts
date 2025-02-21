import { parseCucinalistDslFile } from "./parseDML";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Please provide a file name as an argument.");
    process.exit(1);
  }
  console.log('Working directory: ', process.cwd());

  const statements = await parseCucinalistDslFile(process.cwd(), args[0]);
  console.log(JSON.stringify(statements, replacer, 2));
}

function replacer(key: string, value: unknown) {
  if (value && value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
