"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const HeroBanner = () => {
  const scrollToPrincipal = () => {
    const principalSection = document.getElementById("principal-message");
    if (principalSection) {
      principalSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-blue-400 block sm:inline">
              Greenfield International School
            </span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8 font-light text-gray-200 max-w-3xl mx-auto">
            Empowering Students for a Brighter Future
          </p>
          <Button
            onClick={scrollToPrincipal}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Explore More
            <ChevronDown className="ml-2 w-5 h-5 animate-bounce" />
          </Button>
        </div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2 opacity-75">Scroll to explore</span>
          <ChevronDown className="w-6 h-6 opacity-75" />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
