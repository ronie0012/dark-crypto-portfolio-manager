"use client";
import { Clock, Zap, TrendingUp, PieChart, BarChart3, Wallet } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BentoGrid = () => {
  return (
    <section className="py-32">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="relative h-60 overflow-hidden rounded-3xl md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-full">
            <img
              src="https://cdn.dribbble.com/userupload/13892650/file/original-a50540491d069c691d3d67e5bc39b0d8.jpg?resize=1504x1128&vertical=center"
              alt="shadcn UI components showcase"
              className="absolute inset-0 h-full w-full object-[20%] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            <div className="absolute bottom-6 left-6 z-10 text-white">
              <h3 className="text-lg ">Track Your Crypto Journey.</h3>
            </div>
            <div className="absolute right-6 top-6 z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div
            className="relative h-60 overflow-hidden rounded-3xl border md:col-span-2 md:row-span-2 md:h-[400px] lg:col-span-4 lg:h-full"
            onMouseEnter={(e) => {
              const video = e.currentTarget.querySelector("video");
              video && video.play();
            }}
            onMouseLeave={(e) => {
              const video = e.currentTarget.querySelector("video");
              video && video.pause();
              video && (video.currentTime = 1);
            }}
          >
            <video
              src="https://cdn.dribbble.com/userupload/15831695/file/original-addc0352a88b56324a47a3606783ea73.mp4"
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              preload="auto"
              onLoadedMetadata={(e) => {
                e.currentTarget.currentTime = 0.1;
                e.currentTarget.pause();
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h3 className="text-sm leading-tight md:text-base lg:text-xl">
                Real-time portfolio tracking
              </h3>
            </div>
          </div>

          <Card className="col-span-1 rounded-3xl md:col-span-2 md:row-span-1 md:h-[192px] lg:col-span-2">
            <CardContent className="flex h-full flex-col justify-center p-4 md:p-6">
              <div className="mb-2 text-4xl font-bold md:text-4xl lg:text-6xl">
                24
                <span className="align-top text-2xl md:text-xl lg:text-3xl">
                  /7
                </span>
              </div>
              <p className="text-sm leading-tight md:text-sm">
                Portfolio monitoring
                <br />
                keeps you ahead always
              </p>
            </CardContent>
          </Card>

          <div className="relative col-span-1 h-60 overflow-hidden rounded-3xl border md:col-span-2 md:row-span-1 md:h-[192px] lg:col-span-2">
            <img
              src="https://cdn.cosmos.so/d7c375ce-1958-4a6d-8ec6-2dcaf3f58fb5?format=jpeg"
              alt="shadcn UI components"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <Card className="from-neutral-900 bg-gradient-to-br to-black col-span-1 rounded-3xl md:col-span-4 md:row-span-1 md:h-[300px] lg:col-span-4">
            <CardContent className="h-full p-4 md:p-5">
              <div className="flex h-full flex-col justify-end">
                <div className="space-y-2">
                  <div className="text-4xl font-normal md:text-5xl lg:text-6xl">
                    $19
                  </div>
                  <div className="text-muted-foreground">Price per month</div>
                  <Button>Start Trading</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 from-neutral-900 bg-gradient-to-br to-black  rounded-3xl md:col-span-2 md:row-span-1 md:h-[300px] lg:col-span-3">
            <CardContent className="flex h-full flex-col justify-center p-4 md:p-5">
              <div className="mb-3">
                <span className="text-4xl font-bold md:text-3xl lg:text-6xl">
                  50K
                </span>
                <span className="align-top text-2xl font-bold md:text-xl lg:text-3xl">
                  +
                </span>
              </div>
              <p className="mb-4 ml-0 text-sm md:text-sm">
                Active crypto traders
              </p>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar
                    key={i}
                    className="border-border h-8 w-8 border-2 md:h-8 md:w-8 lg:h-10 lg:w-10"
                  >
                    <AvatarImage src={`/images/block/avatar-${i + 1}.webp`} />
                    <AvatarFallback>TRD{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="relative col-span-1 h-60 overflow-hidden rounded-3xl md:col-span-3 md:row-span-1 md:h-[300px] lg:col-span-5">
            <img
              src="https://cdn.cosmos.so/d7c375ce-1958-4a6d-8ec6-2dcaf3f58fb5?format=jpeg"
              alt="shadcn UI components"
              className="absolute inset-0 h-full object-top-left w-full object-cover"
            />
          </Card>

          <Card className="relative col-span-1 h-60 overflow-hidden rounded-3xl md:col-span-3 md:row-span-1 md:h-[300px] lg:col-span-4">
            <img
              src="https://cdn.cosmos.so/65e91405-c093-4f37-bb49-10f8ca3d1f95?format=jpeg"
              alt="shadcn UI development"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />{" "}
            <div className="absolute inset-0 bg-gradient-to-tr from-background to-transparent" />
            <div className="absolute inset-0 z-10 flex items-center justify-start p-4 md:p-6">
              <div className="text-white">
                <div className="mb-2 flex items-center gap-2 md:gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 md:h-7 md:w-7">
                    <PieChart className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                  <span className="text-base  text-shadow-2xs md:text-lg">
                    Smart Portfolio
                  </span>
                </div>
                <p className="text-sm opacity-90 md:text-sm">
                  Advanced analytics for
                  <br />
                  <span className="text-sm font-semibold md:text-sm">
                    optimal crypto gains
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export { BentoGrid };