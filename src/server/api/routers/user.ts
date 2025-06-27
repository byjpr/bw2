import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure, platformAdminProcedure } from "~/server/api/trpc";
import { UserRole } from "@prisma/client";

export const userRouter = createTRPCRouter({
  // Public procedures
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      username: z.string().min(3),
      motivation: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // In a real implementation, this would create a user using NextAuth
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Protected procedures
  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          weaver: true,
        },
      });
      
      return user;
    }),
  
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          email: input.email,
        },
      });
      
      return user;
    }),
  
  deleteAccount: protectedProcedure
    .mutation(async ({ ctx }) => {
      // In a real implementation, this would delete the user's account
      // For now, we'll just return a mock success response
      return { success: true };
    }),
  
  // Admin procedures
  isPlatformAdmin: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.session.user.role === UserRole.PLATFORM_ADMIN;
    }),
});