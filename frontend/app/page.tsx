"use client";

import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TravelForm from "@/components/TravelForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import ItineraryResult from "@/components/ItineraryResult";
import DestinationShowcase from "@/components/DestinationShowcase";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TripFormData, ParsedItinerary } from "@/types";
import { createTrip, generateItinerary } from "@/lib/api";
import { parseAIItinerary } from "@/lib/parser";

function HomeContent() {
  const [formData, setFormData] = useState<TripFormData>({
    destination: "Tokyo, Japan",
    days: 5,
    budget: 2000,
    travelStyle: "Standard",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ParsedItinerary | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById("planner");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToDestinations = () => {
    const el = document.getElementById("destinations");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectQuickDestination = (
    dest: string,
    days: number,
    budget: number,
    style: string
  ) => {
    setFormData({
      destination: dest,
      days,
      budget,
      travelStyle: style,
    });
    setError(null);
    scrollToForm();
  };

  const handleFormSubmit = async (data: TripFormData) => {
    setFormData(data);
    setIsLoading(true);
    setError(null);
    setItinerary(null);

    // Scroll to results area
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);

    try {
      // 1. Create Trip in FastAPI backend (POST /api/v1/trips - ownership assigned from JWT)
      const createdTrip = await createTrip(data);

      // 2. Generate AI Itinerary from Amazon Bedrock (POST /api/v1/trips/{id}/generate)
      const genResult = await generateItinerary(createdTrip.id);

      // 3. Parse recommendation into rich UI sections
      const parsed = parseAIItinerary(
        genResult.recommendation,
        createdTrip.destination,
        createdTrip.days,
        createdTrip.budget,
        createdTrip.daily_budget,
        createdTrip.category
      );

      setItinerary(parsed);
    } catch (err: any) {
      console.error("Trip generation error:", err);
      setError(
        err?.message ||
          "Could not connect to FastAPI backend at http://localhost:8000. Please ensure the backend server is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItinerary(null);
    setError(null);
    scrollToForm();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar onPlanClick={scrollToForm} onExploreClick={scrollToDestinations} />

      {/* Main Page Content */}
      <main className="flex-1 w-full pb-16">
        {/* Hero Section with Destination Visual & Quick Filters */}
        <Hero
          onSelectQuickDestination={handleSelectQuickDestination}
          onScrollToForm={scrollToForm}
        />

        {/* Travel Planner Form */}
        <div ref={formRef}>
          <TravelForm
            initialValues={formData}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Dynamic State Feedback Container */}
        <div ref={resultRef} className="scroll-mt-24">
          {/* Loading Spinner with Bedrock feedback */}
          {isLoading && <LoadingSpinner destination={formData.destination} />}

          {/* Graceful Error Display with Retry */}
          {error && !isLoading && (
            <ErrorMessage
              message={error}
              onRetry={() => handleFormSubmit(formData)}
            />
          )}

          {/* Structured Rich AI Itinerary Result */}
          {itinerary && !isLoading && (
            <ItineraryResult itinerary={itinerary} onReset={handleReset} />
          )}
        </div>

        {/* Popular Destinations Showcase */}
        <DestinationShowcase onSelectDestination={handleSelectQuickDestination} />

        {/* Features & Architecture Section */}
        <Features />
      </main>

      {/* Complete Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
