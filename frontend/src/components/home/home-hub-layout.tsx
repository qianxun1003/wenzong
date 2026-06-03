import { HomeEntryCarousel } from "@/components/home/home-entry-carousel";
import { HomeDailyTasksPanel } from "@/components/home/home-daily-tasks-panel";
import { MapPageShell } from "@/components/map/map-page-shell";

export function HomeHubLayout() {
  return (
    <MapPageShell scrollable className="home-map-shell flex flex-1 flex-col">
      <section className="home-entry-hub map-entry-hub mx-auto flex min-h-full flex-1 flex-col px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="home-entry-hub__shell mx-auto flex w-full min-h-full max-w-[min(100%,40rem)] flex-1 flex-col sm:max-w-[min(100%,56rem)]">
          <header className="home-entry-hub__header">
            <p className="home-entry-hub__eyebrow">Japan and the World</p>
            <h1 className="home-entry-hub__heading">EJU 文综・学习平台</h1>
            <p
              className="home-entry-hub__quote"
              title="把死记硬背留给过去。现在，一起用逻辑和地图重新解构留考文综。"
            >
              「把死记硬背留给过去。现在，一起用逻辑和地图重新解构留考文综。」
            </p>
          </header>

          <div className="home-entry-hub__body">
            <div className="home-entry-hub__main">
              <HomeEntryCarousel />
              <hr className="home-entry-hub__divider" aria-hidden />
              <HomeDailyTasksPanel />
            </div>
          </div>
        </div>
      </section>
    </MapPageShell>
  );
}
