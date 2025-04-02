import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Lightbulb, Zap, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// AI Recommendation type
interface Recommendation {
  id: string;
  title: string;
  description: string;
  savingsAmount: string;
  icon: React.ReactNode;
  bgColor: string;
  action: string;
}

export default function AiRecommendations() {
  // Recommendations would typically come from an API call
  // For now, we'll use static recommendations
  const recommendations: Recommendation[] = [
    {
      id: "1",
      title: "Dining out expenses are high",
      description: "Reducing restaurant visits by 25% could save you about $120 this month.",
      savingsAmount: "$120",
      icon: <Utensils className="text-primary" />,
      bgColor: "bg-blue-50 border-blue-100",
      action: "See detailed analysis"
    },
    {
      id: "2",
      title: "Energy bill optimization",
      description: "Your energy bill is 15% higher than similar households. Check for savings.",
      savingsAmount: "$35",
      icon: <Zap className="text-green-600" />,
      bgColor: "bg-green-50 border-green-100",
      action: "View energy saving tips"
    },
    {
      id: "3",
      title: "Phone plan savings",
      description: "You could save $15/month by switching to a more suitable phone plan.",
      savingsAmount: "$15",
      icon: <Smartphone className="text-purple-600" />,
      bgColor: "bg-purple-50 border-purple-100",
      action: "Compare alternatives"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            AI Savings Recommendations
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div 
              key={recommendation.id} 
              className={`p-4 rounded-lg border ${recommendation.bgColor}`}
            >
              <div className="flex items-start">
                <div className="bg-white p-2 rounded-full mr-3 flex-shrink-0 shadow-sm">
                  {recommendation.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                  <Button 
                    variant="link" 
                    className="mt-2 h-auto p-0 text-xs text-primary font-medium"
                  >
                    {recommendation.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
