import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { ApplicationStatus } from "@prisma/client";

export const weaverRouter = createTRPCRouter({
  // Public procedures
  getApplicationQuestions: publicProcedure
    .query(async ({ ctx }) => {
      // In a real implementation, these would come from the database
      // For now, we'll return mock questions
      return [
        { id: "1", text: "What brings you to our community?" },
        { id: "2", text: "What do you hope to contribute to our community?" },
        { id: "3", text: "What are your interests or hobbies?" },
      ];
    }),
  
  // Protected procedures
  applyToBeWeaver: protectedProcedure
    .input(z.object({
      location: z.string().min(1),
      twitterHandle: z.string().optional(),
      discordUsername: z.string().optional(),
      answers: z.record(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user already has a weaver profile
      const existingWeaver = await ctx.db.weaver.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (existingWeaver) {
        throw new Error("You have already applied to be a weaver");
      }
      
      // Create a new weaver profile
      const weaver = await ctx.db.weaver.create({
        data: {
          userId: ctx.session.user.id,
          location: input.location,
          // In a real implementation, we would also store the answers and social handles
        },
      });
      
      return weaver;
    }),
  
  getApplicationStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const weaver = await ctx.db.weaver.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!weaver) {
        return { status: "NOT_APPLIED" };
      }
      
      // In a real implementation, we would get the application status from the database
      // For now, we'll return a mock status
      return {
        status: "NEW",
        createdAt: weaver.createdAt,
      };
    }),
});