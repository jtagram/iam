import { Header } from "@/app/components/header";
import { HomeShell } from "@/app/components/home-shell";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <HomeShell />
    </div>
  );
}
