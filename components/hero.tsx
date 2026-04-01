"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Upload PDF",
    description: "Add your book file",
  },
  {
    number: "2",
    title: "AI Processing",
    description: "We analyze the content",
  },
  {
    number: "3",
    title: "Voice Chat",
    description: "Discuss with AI",
  },
];

const Hero = () => {
  return (
    <section className="library-hero-card">
      {/* Desktop: Grid layout with fixed columns */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_auto_200px] items-center gap-8 w-full">
        {/* Left - Text Content */}
        <div className="flex flex-col gap-4">
          <h1 className="library-hero-title">Your Library</h1>
          <p className="library-hero-description">
            Convert your books into interactive AI conversations.
            <br />
            Listen, learn, and discuss your favorite reads.
          </p>
          <Link href="/books/create" className="library-cta-primary w-fit mt-1">
            <Plus className="w-5 h-5" />
            Add new book
          </Link>
        </div>

        {/* Center - Illustration */}
        <div className="flex items-center justify-center">
          <Image
            src="/assets/hero-illustration.png"
            alt="Vintage books with globe and lamp"
            width={300}
            height={225}
            className="object-contain max-h-[200px] w-auto"
            priority
          />
        </div>

        {/* Right - Steps Card */}
        <div className="library-steps-card self-center">
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.number} className="library-step-item">
                <span className="library-step-number">{step.number}</span>
                <div>
                  <p className="library-step-title">{step.title}</p>
                  <p className="library-step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet: 2-column layout */}
      <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6 w-full">
        {/* Left - Text + Illustration */}
        <div className="flex flex-col gap-4">
          <h1 className="library-hero-title">Your Library</h1>
          <p className="library-hero-description">
            Convert your books into interactive AI conversations.
            <br />
            Listen, learn, and discuss your favorite reads.
          </p>
          <Link href="/books/create" className="library-cta-primary w-fit">
            <Plus className="w-5 h-5" />
            Add new book
          </Link>
          <div className="flex justify-center mt-2">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books with globe and lamp"
              width={240}
              height={180}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right - Steps Card */}
        <div className="library-steps-card self-center">
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.number} className="library-step-item">
                <span className="library-step-number">{step.number}</span>
                <div>
                  <p className="library-step-title">{step.title}</p>
                  <p className="library-step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="flex flex-col md:hidden gap-5 w-full">
        <h1 className="library-hero-title text-center">Your Library</h1>
        <p className="library-hero-description text-center">
          Convert your books into interactive AI conversations.
          Listen, learn, and discuss your favorite reads.
        </p>
        <Link href="/books/create" className="library-cta-primary">
          <Plus className="w-5 h-5" />
          Add new book
        </Link>
        <div className="flex justify-center">
          <Image
            src="/assets/hero-illustration.png"
            alt="Vintage books with globe and lamp"
            width={260}
            height={195}
            className="object-contain"
            priority
          />
        </div>
        <div className="library-steps-card">
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div key={step.number} className="library-step-item">
                <span className="library-step-number">{step.number}</span>
                <div>
                  <p className="library-step-title">{step.title}</p>
                  <p className="library-step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
