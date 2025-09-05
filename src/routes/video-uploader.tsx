import { createFileRoute } from "@tanstack/react-router";
import { VideoUploader } from "@/components/video-uploader";
import { Navbar } from "@/components/navbar";

export const Route = createFileRoute("/video-uploader")({
  component: VideoUploaderPage,
});

function VideoUploaderPage() {
  return (
    <div className="w-full min-h-screen h-full flex flex-col p-10">
      <Navbar />
      <div className="flex-1 py-10">
        <VideoUploader />
      </div>
    </div>
  );
}
