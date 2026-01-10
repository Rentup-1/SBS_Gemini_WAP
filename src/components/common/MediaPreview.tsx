import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageIcon,
  Video,
} from "lucide-react";
import { useState } from "react";

interface MediaPreviewProps {
  imageUrl?: string | null;
  imageUrls?: string[]; // Support for multiple images
  videoUrl?: string | null;
  mediaType?: string;
}

export const MediaPreview = ({
  imageUrl,
  imageUrls,
  videoUrl,
  mediaType,
}: MediaPreviewProps) => {
  // Combine single image with array of images
  const allImages: string[] = [];
  if (imageUrl) allImages.push(imageUrl);
  if (imageUrls)
    allImages.push(
      ...imageUrls.filter((url) => url && !allImages.includes(url))
    );

  const [currentIndex, setCurrentIndex] = useState(0);

  const hasMedia = allImages.length > 0 || videoUrl;
  if (!hasMedia) return null;

  const isVideo = mediaType === "video" || (allImages.length === 0 && videoUrl);
  const hasMultipleImages = allImages.length > 1;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 mt-6">
      <h4 className="text-sm font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
        {isVideo ? (
          <>
            <Video className="w-4 h-4" /> Video Attachment
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4" /> Image Attachment
            {hasMultipleImages && (
              <span className="text-xs font-normal text-muted-foreground">
                ({allImages.length} images)
              </span>
            )}
          </>
        )}
      </h4>

      {/* Thumbnails Grid */}
      {allImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allImages.map((url, idx) => (
            <Dialog key={idx}>
              <DialogTrigger asChild>
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setCurrentIndex(idx)}
                >
                  <img
                    src={url}
                    alt={`Media ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 group-hover:border-blue-400 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Expand className="w-5 h-5 text-white" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 bg-black/95 text-white border-none">
                <div className="relative flex items-center justify-center min-h-[60vh]">
                  {/* Navigation Arrows */}
                  {hasMultipleImages && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 z-10"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-10 w-10 z-10"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </>
                  )}

                  {/* Main Image */}
                  <img
                    src={allImages[currentIndex]}
                    alt={`Media ${currentIndex + 1}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg p-4"
                  />
                </div>

                {/* Dots Indicator */}
                {hasMultipleImages && (
                  <div className="flex justify-center gap-2 pb-4">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentIndex
                            ? "bg-white w-4"
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* Video Preview */}
      {videoUrl && allImages.length === 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer w-fit">
              <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 group-hover:border-blue-400 transition-all flex items-center justify-center">
                <Video className="w-8 h-8 text-slate-500" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Expand className="w-5 h-5 text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-2 bg-black/95 border-none">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto max-h-[80vh] rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
