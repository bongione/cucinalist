import "@mantine/core/styles.css";
import { MantineProvider, Text, AppShell, Group, NavLink, Burger } from "@mantine/core";
import { theme } from "./theme";
import { MainEntityFormContextProvider } from "./__generated__/MainEntityFormContext.tsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";

function RecipesPage() {
  return <Text size="lg">Browse, edit and create recipes</Text>;
}

function MealsPage() {
  return (
    <Text size="lg">
      Browse, edit and create meals. You can also create a meal plan from here.
    </Text>
  );
}

function MealPlanExecutionPage() {
  return (
    <Text size="lg">
      Pick a meal plan and start execution. Shows current and next steps, with
      skip controls.
    </Text>
  );
}

function AppShellLayout() {
  const location = useLocation();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }}
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Group h="100%">Cucinalist</Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <NavLink
          component={Link}
          to="/recipes"
          label="Recipes"
          active={location.pathname === "/recipes"}
        />
        <NavLink
          component={Link}
          to="/meals"
          label="Meals & Meal Plans"
          active={location.pathname === "/meals"}
        />
        <NavLink
          component={Link}
          to="/execute"
          label="Meal Plan Execution"
          active={location.pathname === "/execute"}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Routes>
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/execute" element={<MealPlanExecutionPage />} />
          <Route path="*" element={<RecipesPage />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <MainEntityFormContextProvider>
        <Router>
          <AppShellLayout />
        </Router>
      </MainEntityFormContextProvider>
    </MantineProvider>
  );
}
