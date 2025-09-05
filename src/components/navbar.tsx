import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export const Navbar = () => {
  return (
    <div className="w-full flex items-center justify-between">
      <Link to="/" className="text-2xl font-semibold">
        Ustack
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/video-uploader">
          <Button className="bg-[#6420ff] hover:bg-[#6420ff] text-white font-semibold p-3 rounded-md">
            Video Uploader
          </Button>
        </Link>
      </div>
    </div>
  );
};
