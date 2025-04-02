import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, DollarSign, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi there! I'm FinSmart Assistant. How can I help you today? You can ask me questions about the app or convert USD to INR.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conversion rate (this would typically come from an API)
  const usdToInrRate = 83.16; // Current exchange rate as of April 2023

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Process the message
    setTimeout(() => {
      const response = processUserMessage(userMessage.text);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 500);
  };

  const processUserMessage = (text: string): Message => {
    // Check for currency conversion
    const usdRegex = /(\$?\d+(\.\d+)?)\s?(usd|dollar|dollars)?(\s?to\s?inr|\s?in\s?rupees|\s?in\s?rs)/i;
    const match = text.match(usdRegex);

    if (match) {
      const amount = parseFloat(match[1].replace('$', ''));
      const inrAmount = (amount * usdToInrRate).toFixed(2);
      return {
        id: Date.now().toString(),
        text: `$${amount} USD is approximately ₹${inrAmount} INR at the current exchange rate.`,
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Common FAQs
    if (text.toLowerCase().includes("budget") || text.toLowerCase().includes("how to budget")) {
      return {
        id: Date.now().toString(),
        text: "To create a budget, go to the Budgets section and click 'Add Budget'. You can set amounts for different categories and track your spending against these limits.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    if (text.toLowerCase().includes("transaction") || text.toLowerCase().includes("add transaction")) {
      return {
        id: Date.now().toString(),
        text: "To add a transaction, go to the Transactions page and click the 'Add Transaction' button. Fill in the details like amount, description, category, and date.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    if (text.toLowerCase().includes("bill") || text.toLowerCase().includes("payment reminder")) {
      return {
        id: Date.now().toString(),
        text: "You can manage your bills in the Bills section. Add a new bill with amount and due date to receive reminders before the payment is due.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    if (text.toLowerCase().includes("subscription") || text.toLowerCase().includes("recurring payment")) {
      return {
        id: Date.now().toString(),
        text: "Track your subscriptions in the Subscriptions section. Add your recurring payments to see your monthly subscription expenses and get insights on potential savings.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    if (text.toLowerCase().includes("goal") || text.toLowerCase().includes("saving goal")) {
      return {
        id: Date.now().toString(),
        text: "Set financial goals in the Goals section. Define a target amount and deadline, and the app will help you track your progress and suggest saving strategies.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    if (text.toLowerCase().includes("profile") || text.toLowerCase().includes("account settings")) {
      return {
        id: Date.now().toString(),
        text: "You can update your profile information in Settings > Account. You can change personal details, password, and notification preferences.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Currency converter instruction
    if (text.toLowerCase().includes("convert") || text.toLowerCase().includes("exchange") || text.toLowerCase().includes("usd to inr")) {
      return {
        id: Date.now().toString(),
        text: "I can convert USD to INR for you. Just type something like '10 USD to INR' or '100 dollars in rupees'.",
        sender: "bot",
        timestamp: new Date(),
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      text: "I'm here to help with questions about using FinSmart and converting USD to INR. Can you please ask about specific features or try a currency conversion?",
      sender: "bot",
      timestamp: new Date(),
    };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        text: "Hi there! I'm FinSmart Assistant. How can I help you today? You can ask me questions about the app or convert USD to INR.",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <Card className="w-full h-[500px] flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarFallback className="bg-primary text-white">AI</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">FinSmart Assistant</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={clearChat}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[360px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-center mb-1">
                      <Bot className="h-3 w-3 mr-1" />
                      <span className="text-xs font-medium">Assistant</span>
                      <span className="text-xs ml-auto opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">{message.text}</div>
                  {message.sender === "user" && (
                    <div className="flex justify-end mt-1">
                      <span className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-.15s]"></div>
                    <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question or convert USD to INR..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div>
            <span>Try asking: </span>
            <Badge variant="outline" className="ml-1 cursor-pointer" onClick={() => setInputValue("How do I create a budget?")}>
              How do I create a budget?
            </Badge>
            <Badge variant="outline" className="ml-1 cursor-pointer" onClick={() => setInputValue("Convert 50 USD to INR")}>
              Convert 50 USD to INR
            </Badge>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>1 USD = ₹{usdToInrRate} INR</span>
          </div>
        </div>
      </div>
    </Card>
  );
}