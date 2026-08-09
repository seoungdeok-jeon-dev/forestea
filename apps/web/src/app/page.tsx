import { HomeNews } from "@/components/home-news";
import { ScrollShowcase } from "@/components/scroll-showcase";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <ScrollShowcase />
      <HomeNews />
    </>
  );
}
