import { CodeChat } from "@/components/code-chat";

export default function ChatPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Code Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions about your code and get AI-powered responses
        </p>
      </div>

      <CodeChat />
    </div>
  );
}
