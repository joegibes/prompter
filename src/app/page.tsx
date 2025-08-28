"use client";

import {
  useEffect,
  useState,
  useRef,
  FormEvent,
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, PlusCircle } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const slideContainerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const slideImageStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  flex: 1,
};

const captionContainerStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center",
  backgroundColor: "rgba(0, 0, 0, .7)",
  color: "#fff",
  padding: "10px",
  cursor: "pointer",
  overflow: "hidden",
  position: "relative",
};

const captionTextStyle: CSSProperties = {
  whiteSpace: "pre-wrap",
};

const captionGradientStyle: CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: "1.5em",
  background:
    "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
};

const moreTextStyle: CSSProperties = {
  display: "block",
  marginTop: "4px",
  fontWeight: "bold",
};

interface HistoryItem {
  src: string;
  prompt: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function HomePage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Image generation state
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-image-preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // History and lightbox state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && !isChatLoading) {
      setFinalPrompt(lastMessage.content);
    }
  }, [messages, isChatLoading]);

  useEffect(() => {
    setIsCaptionExpanded(false);
  }, [lightboxIndex]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const toggleCaption = () =>
    setIsCaptionExpanded((prev) => !prev);

  const handleCaptionKeyDown = (
    event: KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCaption();
    }
  };

  const handleGenerateImage = async () => {
    if (!finalPrompt) {
      setGenerationError("Please generate a prompt first.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, model: selectedModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image.");
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
      setHistory((prevHistory) => [
        { src: data.imageUrl, prompt: finalPrompt },
        ...prevHistory,
      ]);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setGenerationError(error.message);
        } else {
          setGenerationError("Failed to generate image.");
        }
      } finally {
        setIsGenerating(false);
      }
    };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.content }),
      });
      const data = await res.json();
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleNewCreation = () => {
    setMessages([]);
    setInput("");
    setFinalPrompt("");
    setGeneratedImageUrl("");
    setGenerationError(null);
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="p-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-serif text-amber-400">
            Nano Banana Prompter
          </h1>
          <Button variant="secondary" onClick={handleNewCreation}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Creation
          </Button>
        </header>

        <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:overflow-hidden">
          {/* Left Panel: Chat */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Chat Assistant</CardTitle>
              <CardDescription>Refine your vision here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
              <ScrollArea className="flex-grow p-4 border rounded-lg" ref={scrollAreaRef}>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    No messages yet.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex mb-3 ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg max-w-md ${
                          m.role === "user"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary/50 text-secondary-foreground"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your idea..."
                  disabled={isChatLoading}
                />
                <Button type="submit" variant="secondary" disabled={isChatLoading}>
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Panel: Creation */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Creation Canvas</CardTitle>
              <CardDescription>Your final prompt and generated image.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="aspect-square w-full bg-secondary rounded-lg flex items-center justify-center relative">
                {isGenerating ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Generated image"
                    className="object-contain w-full h-full rounded-lg"
                  />
                ) : (
                  <img
                    src="/placeholder.svg"
                    alt="Placeholder"
                    className="object-contain w-1/3 opacity-20"
                  />
                )}
              </div>
              {generationError && <p className="text-sm text-destructive">{generationError}</p>}
              <div>
                <label htmlFor="prompt-canvas" className="text-sm font-medium text-muted-foreground">Prompt Canvas</label>
                <Textarea id="prompt-canvas" readOnly value={finalPrompt || "Final, detailed prompt will be displayed here..."} className="mt-1 h-32" />
              </div>
              <div className="flex items-center justify-between">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagen-4.0-generate-001">Imagen 4.0</SelectItem>
                    <SelectItem value="gemini-2.5-flash-image-preview">Gemini 2.5 Flash Image</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !finalPrompt}
                >
                  {isGenerating ? "Generating..." : "Generate Image"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Bottom Panel: History */}
        <footer className="p-4 border-t">
          <h2 className="text-lg font-semibold mb-2">Generation History</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {history.map((item, index) => (
              <button key={index} className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg" onClick={() => setLightboxIndex(index)}>
                <img
                  src={item.src}
                  alt={`Generated image for prompt: ${item.prompt}`}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                />
              </button>
            ))}
          </div>
        </footer>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={history.map((item) => ({ src: item.src }))}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        animation={{ swipe: 0, fade: 0 }}
        carousel={{ finite: true }}
        plugins={[Zoom]}
        render={{
          slide: ({ slide }) => (
            <div style={slideContainerStyle}>
              <img
                src={slide.src}
                alt={history[lightboxIndex]?.prompt}
                style={slideImageStyle}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={toggleCaption}
                onKeyDown={handleCaptionKeyDown}
                style={
                  isCaptionExpanded
                    ? captionContainerStyle
                    : { ...captionContainerStyle, maxHeight: "4.5em" }
                }
              >
                <span style={captionTextStyle}>
                  {history[lightboxIndex]?.prompt}
                </span>
                {!isCaptionExpanded && (
                  <>
                    <div style={captionGradientStyle} />
                    <span style={moreTextStyle}>more...</span>
                  </>
                )}
              </div>
            </div>
          ),
        }}
      />
    </>
  );
}
