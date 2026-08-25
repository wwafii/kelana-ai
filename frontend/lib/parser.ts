import { DailyPlan, ParsedItinerary } from "@/types";

function isConclusionOrMeta(line: string): boolean {
  const lower = line.toLowerCase().trim();
  return (
    lower.startsWith("this itinerary") ||
    lower.startsWith("enjoy your") ||
    lower.startsWith("have a wonderful") ||
    lower.startsWith("note:") ||
    lower.startsWith("total budget") ||
    lower.includes("all within your daily budget") ||
    lower.includes("enjoy your journey") ||
    lower.startsWith("hope you") ||
    lower.startsWith("safe travels")
  );
}

export function parseAIItinerary(
  rawText: string,
  destination: string,
  daysCount: number,
  budget: number,
  dailyBudget: number,
  category: string
): ParsedItinerary {
  const dailyPlans: DailyPlan[] = [];
  const foodRecommendations: string[] = [];
  const travelTips: string[] = [];

  // Match Day blocks like "Day 1: Exploring Tokyo", "Day 1: ...", "### Day 1"
  const dayRegex = /(?:###\s*)?Day\s*(\d+)[:\s\-–]*([\s\S]*?)(?=(?:(?:###\s*)?Day\s*\d+|$))/gi;
  let match: RegExpExecArray | null;

  while ((match = dayRegex.exec(rawText)) !== null) {
    const dayNum = parseInt(match[1], 10);
    const dayContent = match[2];

    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    // Extract sections within day
    const morningMatch = dayContent.match(/Morning:?\s*([\s\S]*?)(?=Afternoon:|Evening:|$)/i);
    const afternoonMatch = dayContent.match(/Afternoon:?\s*([\s\S]*?)(?=Evening:|Morning:|$)/i);
    const eveningMatch = dayContent.match(/Evening:?\s*([\s\S]*?)(?=Morning:|Afternoon:|$)/i);

    const extractBullets = (text?: string): string[] => {
      if (!text) return [];
      return text
        .split("\n")
        .map((line) => line.replace(/^[\s*\-–•\d.]+\s*/, "").trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !line.toLowerCase().startsWith("morning") &&
            !line.toLowerCase().startsWith("afternoon") &&
            !line.toLowerCase().startsWith("evening") &&
            !isConclusionOrMeta(line)
        );
    };

    if (morningMatch) {
      morning.push(...extractBullets(morningMatch[1]));
    }
    if (afternoonMatch) {
      afternoon.push(...extractBullets(afternoonMatch[1]));
    }
    if (eveningMatch) {
      evening.push(...extractBullets(eveningMatch[1]));
    }

    // If day didn't follow the exact section pattern, extract general bullet points
    if (morning.length === 0 && afternoon.length === 0 && evening.length === 0) {
      const allBullets = extractBullets(dayContent);
      if (allBullets.length >= 3) {
        morning.push(allBullets[0]);
        afternoon.push(allBullets[1]);
        evening.push(...allBullets.slice(2));
      } else if (allBullets.length > 0) {
        morning.push(...allBullets);
      } else {
        const cleanContent = dayContent.trim();
        if (cleanContent && !isConclusionOrMeta(cleanContent)) {
          morning.push(cleanContent);
        }
      }
    }

    // Extract culinary highlights strictly
    [...morning, ...afternoon, ...evening].forEach((act) => {
      const lower = act.toLowerCase();
      const isCulinary =
        (lower.includes("breakfast") ||
          lower.includes("lunch") ||
          lower.includes("dinner") ||
          lower.includes("kaiseki") ||
          lower.includes("sushi") ||
          lower.includes("izakaya") ||
          lower.includes("restaurant") ||
          lower.includes("culinary") ||
          lower.includes("dining") ||
          lower.includes("tasting") ||
          lower.includes("omakase") ||
          lower.includes("bistro") ||
          lower.includes("ramen") ||
          lower.includes("bakery") ||
          lower.includes("street food") ||
          lower.includes("tea house")) &&
        !lower.includes("theme park") &&
        !lower.includes("shopping") &&
        !lower.includes("outlets") &&
        !isConclusionOrMeta(act);

      if (isCulinary && !foodRecommendations.includes(act)) {
        foodRecommendations.push(act);
      }
    });

    const rawTitle = match[0].split("\n")[0].replace(/^#+\s*/, "").replace(/^[*_~]+|[*_~]+$/g, "").trim();

    dailyPlans.push({
      dayNumber: dayNum,
      title: rawTitle.length > 5 ? rawTitle : `Day ${dayNum}: Discovering ${destination}`,
      morning: morning.length > 0 ? morning : ["Explore the neighborhood and enjoy local breakfast."],
      afternoon: afternoon.length > 0 ? afternoon : ["Visit cultural landmarks and scenic spots."],
      evening: evening.length > 0 ? evening : ["Dine at a local restaurant and experience the nightlife."],
    });
  }

  // Fallback if regex didn't find specific days
  if (dailyPlans.length === 0) {
    for (let i = 1; i <= daysCount; i++) {
      dailyPlans.push({
        dayNumber: i,
        title: `Day ${i}: Exploring ${destination}`,
        morning: [`Discover iconic sights and local morning spots in ${destination}.`],
        afternoon: [`Immerse in cultural heritage and scenic attractions suited for ${category} travel.`],
        evening: [`Savor regional specialties and unwind in vibrant evening districts.`],
      });
    }
  }

  // Generate contextual travel tips based on destination and category
  travelTips.push(`Optimized for ${category} travel style with ~$${dailyBudget.toFixed(0)}/day allowance.`);
  travelTips.push(`Use public transit (subway/trains) for efficient city navigation.`);
  travelTips.push(`Carry a lightweight daypack with reusable water bottle and power bank.`);
  travelTips.push(`Book major museum, landmark, and restaurant reservations in advance.`);

  // If no food extracted, add fallback recommendations
  if (foodRecommendations.length === 0) {
    foodRecommendations.push(`Sample authentic street food and local breakfast specialties.`);
    foodRecommendations.push(`Enjoy dinner at highly-rated local neighborhood eateries.`);
    foodRecommendations.push(`Try regional seasonal delicacies and popular dessert spots.`);
  }

  return {
    destination,
    daysCount,
    budget,
    dailyBudget,
    category,
    dailyPlans,
    travelTips: travelTips.slice(0, 4),
    foodRecommendations: foodRecommendations.slice(0, 4),
    rawText,
  };
}
