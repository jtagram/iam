import { Header } from "@/app/components/header";
import { HomeShell } from "@/app/components/home-shell";

export default function HomePage() {
  return (
    <div className="d-flex flex-column vh-100">
      <Header />
      <HomeShell />
    </div>
  );
}
