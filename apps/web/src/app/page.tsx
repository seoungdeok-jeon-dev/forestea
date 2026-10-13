import { HomeLanding } from "@/components/home-landing";
import { HomeNews } from "@/components/home-news";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HomeLanding />
      <HomeNews />
    </>
  );
}
