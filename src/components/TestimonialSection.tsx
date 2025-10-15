"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { useRef } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials1 = [
  {
    name: "Sarah Chen",
    role: "DeFi Trader",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "Portfolio tracking has never been easier. Real-time insights and seamless DeFi integration.",
  },
  {
    name: "Marcus Kim",
    role: "Crypto Investor",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "Advanced analytics and risk management tools that actually work for my investment strategy.",
  },
  {
    name: "Alex Rivera",
    role: "Yield Farmer",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "Multi-chain support and automated rebalancing saved me countless hours of manual tracking.",
  },
  {
    name: "Emma Watson",
    role: "NFT Collector",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Finally, a platform that understands both traditional crypto and NFT portfolio management.",
  },
  {
    name: "David Park",
    role: "DAO Contributor",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "Governance token tracking and staking rewards visualization is incredibly comprehensive here.",
  },
  {
    name: "Lisa Chang",
    role: "DeFi Enthusiast",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "The security features and wallet integration give me complete confidence in my holdings.",
  },
];
const testimonials2 = [
  {
    name: "Michael Torres",
    role: "Hedge Fund Manager",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "Professional-grade analytics with institutional security. Perfect for managing large portfolios.",
  },
  {
    name: "Jessica Wu",
    role: "Crypto Analyst",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "Historical performance tracking and tax reporting features streamlined our entire workflow.",
  },
  {
    name: "Ryan Collins",
    role: "DeFi Developer",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "API integration and custom alerts help me stay on top of market movements effortlessly.",
  },
  {
    name: "Sophie Martinez",
    role: "Investment Advisor",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Client portfolio management and reporting tools exceed every expectation we had initially.",
  },
  {
    name: "James Wilson",
    role: "Liquidity Provider",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "Impermanent loss tracking and yield optimization insights are game-changing for LP strategies.",
  },
  {
    name: "Anna Thompson",
    role: "Crypto Educator",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "Educational resources and intuitive interface make this perfect for teaching crypto concepts.",
  },
];

const TestimonialSection = () => {
  const plugin1 = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
    })
  );

  const plugin2 = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
      direction: "backward",
    })
  );
  return (
    <section className="relative py-32 max-w-7xl mx-auto overflow-hidden">
      <div className="container flex flex-col items-center gap-6">
        <h2 className="mb-2 ">Trusted by Crypto Professionals</h2>
        <p className="text-center ">
          Advanced portfolio management, designed for serious crypto investors and DeFi enthusiasts.
        </p>
      </div>
      <div className="lg:container">
        <div className="mt-16 space-y-4 relative">
          {/* Left and right blur gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-background to-transparent z-10 pointer-events-none" />
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[plugin1.current]}
            onMouseLeave={() => plugin1.current.play()}
          >
            <CarouselContent>
              {testimonials1.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <Card className="max-w-96 p-6 select-none bg-white/80 dark:bg-black/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-md rounded-2xl">
                    <div className="mb-4 flex gap-4 items-center">
                      <Avatar className="size-10 rounded-full ring-2 ring-[#6EE7B7]/60 shadow">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <q className="text-base text-neutral-700 dark:text-neutral-200 italic">
                      {testimonial.content}
                    </q>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[plugin2.current]}
            onMouseLeave={() => plugin2.current.play()}
          >
            <CarouselContent>
              {testimonials2.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <Card className="max-w-96 p-6 select-none bg-white/80 dark:bg-black/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-md rounded-2xl">
                    <div className="mb-4 flex gap-4 items-center">
                      <Avatar className="size-10 rounded-full ring-2 ring-[#3B82F6]/60 shadow">
                        <AvatarImage
                          src={testimonial.avatar}
                          alt={testimonial.name}
                        />
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <q className="text-base text-neutral-700 dark:text-neutral-200 italic">
                      {testimonial.content}
                    </q>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export { TestimonialSection };