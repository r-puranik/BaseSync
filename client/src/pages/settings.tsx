import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Settings } from "@shared/schema";
import { insertSettingsSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"]
  });

  const form = useForm({
    resolver: zodResolver(insertSettingsSchema),
    defaultValues: {
      githubToken: "",
      webhookSecret: "",
      repositories: []
    }
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const mutation = useMutation({
    mutationFn: async (data: Settings) => {
      await apiRequest("POST", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your GitHub integration
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => mutation.mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="githubToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Token</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormDescription>
                  Personal access token with repo scope
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="webhookSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Webhook Secret</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormDescription>
                  Secret used to verify webhook payloads
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repositories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repositories</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value?.join("\n") || ""}
                    onChange={e => field.onChange(e.target.value.split("\n").filter(Boolean))}
                    placeholder="owner/repo
owner/another-repo"
                  />
                </FormControl>
                <FormDescription>
                  One repository per line in owner/repo format
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Form>
    </div>
  );
}