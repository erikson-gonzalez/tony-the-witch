import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { InsertInquiry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateInquiry() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInquiry) => {
      // Validate data against schema before sending
      const validated = api.inquiries.create.input.parse(data);
      
      const res = await fetch(api.inquiries.create.path, {
        method: api.inquiries.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        // Handle validation errors or server errors
        if (res.status === 400 || res.status === 500) {
          const errorData = await res.json();
          // We can parse this against errorSchemas if we want strict typing
          // but for the hook message, the backend message is usually sufficient
          throw new Error(errorData.message || "Failed to submit inquiry");
        }
        throw new Error("An unexpected error occurred");
      }

      return api.inquiries.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent",
        description: "Tony has received your message. You will hear back soon.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
