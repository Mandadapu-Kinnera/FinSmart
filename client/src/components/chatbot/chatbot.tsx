import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Bot, User, AlertTriangle, Shield, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  escalate?: boolean;
  priority?: string;
  category?: string;
}

interface ChatResponse {
  response: string;
  escalate: boolean;
  priority: string;
  category: string;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your FinSmart AI assistant powered by advanced AI. I can help you with:\n\n🔒 Account security & fraud concerns\n💰 Budget and financial planning\n📊 Transaction management\n📱 App navigation\n💱 Currency conversion (USD ↔ INR)\n\nI'm equipped with fraud detection and can escalate urgent matters to our human agents. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [conversationContext, setConversationContext] = useState<Array<{role: string, content: string}>>([]);
  const { toast } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; context: Array<{role: string, content: string}> }) => {
      const res = await apiRequest("POST", "/api/chat", data);
      return await res.json();
    },
    onSuccess: (data: ChatResponse) => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isBot: true,
        timestamp: new Date(),
        escalate: data.escalate,
        priority: data.priority,
        category: data.category
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation context
      setConversationContext(prev => [
        ...prev,
        { role: "user", content: inputText },
        { role: "assistant", content: data.response }
      ]);

      // Show escalation alerts
      if (data.escalate) {
        if (data.category === "fraud") {
          toast({
            title: "Security Alert",
            description: "Your concern has been escalated to our security team. Please follow the provided instructions immediately.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Escalated to Human Agent",
            description: "Your query has been forwarded to our human support team for better assistance.",
          });
        }
      }
    },
    onError: (error: Error) => {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing technical difficulties. Please try again in a moment, or contact our support team directly if this persists.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputText.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");

    // Call the AI chat API
    chatMutation.mutate({
      message: currentInput,
      context: conversationContext
    });
  };

  const getQuickActions = () => {
    const actions = [
      "How do I reset my password?",
      "Convert 100 USD to INR",
      "How to create a budget?",
      "Help with suspicious transaction",
      "Set up bill reminders"
    ];
    
    return actions.map((action, index) => (
      <Button
        key={index}
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={() => {
          setInputText(action);
          // Auto-send after a brief delay to show the text was set
          setTimeout(() => handleSendMessage(), 100);
        }}
      >
        {action}
      </Button>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {getQuickActions()}
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">FinSmart AI Assistant</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              AI-Powered
            </Badge>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Online
            </Badge>
            <Shield className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.isBot ? "flex-row" : "flex-row-reverse"
                    } items-start space-x-2`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.isBot 
                          ? "bg-primary text-white" 
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {message.isBot ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.isBot
                          ? "bg-gray-100 text-gray-800"
                          : "bg-primary text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.isBot ? "text-gray-500" : "text-blue-100"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {message.priority && (
                          <Badge 
                            variant={message.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {message.priority} priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Escalation Alert */}
                {message.escalate && message.category === "fraud" && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Security Alert:</strong> This issue has been escalated to our fraud prevention team. 
                      For immediate assistance, call our 24/7 security hotline.
                      <div className="flex items-center mt-2 space-x-2">
                        <Phone className="h-4 w-4" />
                        <span className="font-semibold">1-800-FRAUD-HELP</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {message.escalate && message.category === "support" && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      This conversation has been escalated to our human support team for specialized assistance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">AI is thinking...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about FinSmart, report security concerns, or request help..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={chatMutation.isPending}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={chatMutation.isPending || !inputText.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                🔒 Fraud detection • 💱 Currency conversion • 📊 Financial guidance
              </p>
              <Badge variant="outline" className="text-xs">
                Powered by GPT-4o
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}