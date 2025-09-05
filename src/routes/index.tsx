import { createFileRoute, Link } from "@tanstack/react-router";
import "../App.css";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="w-full min-h-screen h-full flex flex-col p-10">
      <Navbar />
      <div className="flex flex-col gap-6 mt-10">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Typescript Basics</h1>
            <p className="text-sm text-gray-400 font-medium">
              TypeScript has forever altered the lives of JavaScript developers.
              Learn why TS is so awesome and the basic concepts required to be
              successful
            </p>
          </div>
          <iframe
            className="w-full sm:w-2/3 aspect-video"
            src="https://www.youtube.com/embed/ahCwqrYpIuM?si=5DjgP1fg0o4HSMMc"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        </div>

        <div className="flex flex-col gap-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold">Video Upload & Player</h2>
          <p className="text-sm text-gray-600">
            Try out the custom video uploader component that allows you to
            upload your own videos and play them with a custom media player.
          </p>
          <Link
            to="/video-uploader"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#6420ff] font-semibold text-white rounded-md hover:scale-105 active:scale-95 transition-colors w-fit"
          >
            Go to Video Uploader
          </Link>
        </div>
      </div>
    </div>
  );
}
