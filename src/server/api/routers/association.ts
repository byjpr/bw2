import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  associationAdminProcedure,
  platformAdminProcedure,
} from "~/server/api/trpc";
import { isAdminOfAssociation, isAssociationMember } from "~/lib/auth-utils";

export const associationRouter = createTRPCRouter({
  // Public procedures - only returns limited public information
  getPublicById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const association = await ctx.db.association.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          location: true,
          population: true,
          maxPopulation: true,
        },
      });

      if (!association) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Association not found" });
      }

      return association;
    }),

  // Member-only procedures - requires association membership
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // First, check if user is a member of this association
      const isMember = await isAssociationMember(ctx.session.user.id, input.id);
      
      if (!isMember) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You don't have access to this association" 
        });
      }
      
      const association = await ctx.db.association.findUnique({
        where: { id: input.id },
        include: {
          events: {
            orderBy: { date: 'asc' },
            where: { date: { gte: new Date() } },
          },
        },
      });

      if (!association) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Association not found" });
      }

      return association;
    }),

  // Admin-only procedures
  getMembers: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.id);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view member details" 
        });
      }
      
      const applications = await ctx.db.application.findMany({
        where: { 
          associationId: input.id,
          status: 'APPROVED',
          approved: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              weaver: true,
            },
          },
        },
      });

      return applications.map(app => app.user);
    }),

  // Update association details (admin only)
  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      location: z.string().optional(),
      maxPopulation: z.number().int().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.id);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can update association details" 
        });
      }
      
      return ctx.db.association.update({
        where: { id: input.id },
        data: {
          ...(input.location && { location: input.location }),
          ...(input.maxPopulation && { maxPopulation: input.maxPopulation }),
        },
      });
    }),

  // Add an admin to an association (owner or platform admin only)
  addAdmin: protectedProcedure
    .input(z.object({ 
      associationId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const association = await ctx.db.association.findUnique({
        where: { id: input.associationId },
      });
      
      if (!association) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Association not found" });
      }
      
      // Check if user is the owner or a platform admin
      if (
        association.ownerId !== ctx.session.user.id && 
        ctx.session.user.role !== 'PLATFORM_ADMIN'
      ) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association owners or platform admins can add admins" 
        });
      }
      
      return ctx.db.association.update({
        where: { id: input.associationId },
        data: {
          admins: {
            connect: { id: input.userId },
          },
        },
      });
    }),

  // Create a new association (platform admin only)
  create: platformAdminProcedure
    .input(z.object({ 
      location: z.string(),
      ownerId: z.string(),
      maxPopulation: z.number().int().min(1).default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.association.create({
        data: {
          location: input.location,
          maxPopulation: input.maxPopulation,
          ownerId: input.ownerId,
          admins: {
            connect: { id: input.ownerId },
          },
        },
      });
    }),

  // List all associations (platform admin only)
  listAll: platformAdminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.association.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),
});