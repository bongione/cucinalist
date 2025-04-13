import Button from "@suid/material/Button";
import Container from "@suid/material/Container";
import Card from "@suid/material/Card";
import { Stack, CardContent, Typography, TextField } from "@suid/material";
import { createSignal } from "solid-js";
import { Recipe as RecipeAST } from "@cucinalist/dsl";

export default function App() {
  const [recipeDSL, setRecipeDSL] = createSignal(emptyRecipeAST());
  return (
    <Container maxWidth={false} sx={{ p: 0 }}>
      <Stack
        sx={{ bgcolor: "#cfe8fc", height: "100vh" }}
        alignItems="center"
        justifyContent="center"
      >
        <Card
          sx={{
            width: "80%",
            maxWidth: "24rem",
          }}
        >
          <CardContent>
            <Stack spacing={3} direction="column">
              <TextField
                id="recipe-id"
                label="Recipe id"
                fullWidth
                required
                value={recipeDSL().id}
                onChange={(e) =>
                  setRecipeDSL((recipe) => ({
                    ...recipe,
                    id: e.currentTarget.value,
                  }))
                }
              />
              <TextField
                id="recipe-full-name"
                label="Recipe full name"
                fullWidth
                required
                value={recipeDSL().name}
                onChange={(e) =>
                  setRecipeDSL((recipe) => ({
                    ...recipe,
                    name: e.currentTarget.value,
                  }))
                }
              />
              <TextField
                id="Serves"
                defaultValue="4"
                label="Serves"
                type="number"
                fullWidth
                required
              />
              <TextField
                id="recipe-description"
                defaultValue=""
                label="Description"
                multiline
                minRows={5}
                fullWidth
              />
              <Button variant="contained">{"Create recipe"}</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

function emptyRecipeAST(): RecipeAST {
  return {
    type: "Recipe",
    id: "",
    name: "",
    serves: 0,
    ingredients: [],
    cookingSteps: [],
  };
}
