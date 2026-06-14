import { Switch, Route, Router as WouterRouter } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Rip from "@/pages/Rip";
import Collection from "@/pages/Collection";
import About from "@/pages/About";
import Profile from "@/pages/Profile";
import Leaderboard from "@/pages/Leaderboard";
import { Layout } from "@/components/layout/Layout";
import { GameStateProvider } from "@/hooks/use-game-state";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/rip" component={Rip} />
        <Route path="/collection" component={Collection} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/about" component={About} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameStateProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </GameStateProvider>
    </AuthProvider>
  );
}

export default App;
