import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  associationAdminProcedure,
  platformAdminProcedure,
} from "~/server/api/trpc";
import { isAdminOfAssociation, isAssociationMember } from "~/lib/auth-utils";

export const associationRouter = createTRPCRouter({
  // Public procedures
  findNearby: protectedProcedure
    .input(z.object({ location: z.string() }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would find associations near the provided location
      // For now, we'll return mock data
      return [
        { id: "1", location: "London", population: 25, maxPopulation: 30 },
        { id: "2", location: "New York", population: 18, maxPopulation: 30 },
        { id: "3", location: "Berlin", population: 22, maxPopulation: 30 },
      ];
    }),

  // Protected procedures
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

  getUserAssociation: protectedProcedure
    .query(async ({ ctx }) => {
      // Get the association the user is a member of
      const application = await ctx.db.application.findFirst({
        where: {
          userId: ctx.session.user.id,
          status: "APPROVED",
        },
        include: {
          association: true,
        },
      });

      if (!application) {
        return null;
      }

      return application.association;
    }),

  applyToJoin: protectedProcedure
    .input(z.object({
      associationId: z.string(),
      motivation: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if the user already has an application for this association
      const existingApplication = await ctx.db.application.findFirst({
        where: {
          userId: ctx.session.user.id,
          associationId: input.associationId,
        },
      });

      if (existingApplication) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already applied to this association",
        });
      }

      // Create a new application
      return ctx.db.application.create({
        data: {
          userId: ctx.session.user.id,
          associationId: input.associationId,
          status: "NEW",
          // If motivation is provided, we would store it here
        },
      });
    }),

  requestTransfer: protectedProcedure
    .input(z.object({
      associationId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if the user is a member of this association
      const isMember = await isAssociationMember(ctx.session.user.id, input.associationId);
      
      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this association",
        });
      }

      // In a real implementation, this would create a transfer request
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Admin procedures
  isUserAssociationAdmin: protectedProcedure
    .input(z.object({ associationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return isAdminOfAssociation(ctx.session.user.id, input.associationId);
    }),

  getMembers: associationAdminProcedure
    .input(z.object({ associationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view member details" 
        });
      }
      
      const applications = await ctx.db.application.findMany({
        where: { 
          associationId: input.associationId,
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

      // Enrich with admin info and join date
      return applications.map(app => ({
        id: app.user.id,
        name: app.user.name,
        email: app.user.email,
        image: app.user.image,
        joinedAt: app.createdAt,
        isAdmin: false, // We would set this based on association admins relation
      }));
    }),

  getApplications: associationAdminProcedure
    .input(z.object({ associationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view applications" 
        });
      }
      
      return ctx.db.application.findMany({
        where: { 
          associationId: input.associationId,
          status: { in: ['NEW', 'UNDER_REVIEW'] },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getAdminNotes: associationAdminProcedure
    .input(z.object({ associationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view admin notes" 
        });
      }
      
      // In a real implementation, this would fetch admin notes from the database
      // For now, we'll return mock data
      return [
        { 
          id: "1", 
          content: "Note about upcoming events", 
          createdAt: new Date(), 
          user: { id: "1", name: "Admin User" } 
        },
      ];
    }),

  addAdminNote: associationAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can add notes" 
        });
      }
      
      // In a real implementation, this would create a note in the database
      // For now, we'll just return a mock success response
      return { 
        id: "new-note-id", 
        content: input.content, 
        createdAt: new Date(),
        user: { id: ctx.session.user.id, name: ctx.session.user.name }
      };
    }),

  approveApplication: associationAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the application
      const application = await ctx.db.application.findUnique({
        where: { id: input.id },
        include: { association: true },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, application.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can approve applications" 
        });
      }

      // Update the application
      return ctx.db.application.update({
        where: { id: input.id },
        data: {
          status: "APPROVED",
          approved: true,
          approvedById: ctx.session.user.id,
        },
      });
    }),

  rejectApplication: associationAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the application
      const application = await ctx.db.application.findUnique({
        where: { id: input.id },
        include: { association: true },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, application.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can reject applications" 
        });
      }

      // Update the application
      return ctx.db.application.update({
        where: { id: input.id },
        data: {
          status: "REJECTED",
          approvedById: ctx.session.user.id,
        },
      });
    }),

  promoteToAdmin: associationAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can promote members" 
        });
      }

      // Update the association to add the user as an admin
      return ctx.db.association.update({
        where: { id: input.associationId },
        data: {
          admins: {
            connect: { id: input.userId },
          },
        },
      });
    }),

  demoteFromAdmin: associationAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the association
      const association = await ctx.db.association.findUnique({
        where: { id: input.associationId },
      });

      if (!association) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Association not found" });
      }

      // Check if user is the owner
      if (association.ownerId === ctx.session.user.id) {
        // Owners can demote other admins but not themselves
        if (input.userId === ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Association owners cannot demote themselves",
          });
        }
      } else {
        // Check if user is a platform admin
        if (ctx.session.user.role !== 'PLATFORM_ADMIN') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only association owners or platform admins can demote admins",
          });
        }
      }

      // Update the association to remove the user as an admin
      return ctx.db.association.update({
        where: { id: input.associationId },
        data: {
          admins: {
            disconnect: { id: input.userId },
          },
        },
      });
    }),

  removeMember: associationAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can remove members" 
        });
      }

      // Get the application for this user in this association
      const application = await ctx.db.application.findFirst({
        where: {
          userId: input.userId,
          associationId: input.associationId,
          status: "APPROVED",
        },
      });

      if (!application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is not a member of this association",
        });
      }

      // Update the application status to indicate the user was removed
      return ctx.db.application.update({
        where: { id: application.id },
        data: {
          status: "KICKED",
        },
      });
    }),

  getInsights: associationAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      timeRange: z.enum(["week", "month", "quarter", "year"]).default("month"),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view insights" 
        });
      }

      // In a real implementation, this would fetch insights from the database
      // For now, we'll return mock data
      return {
        applications: {
          total: 24,
          trend: 12,
        },
        newMembers: {
          total: 8,
          trend: 5,
        },
        events: {
          total: 6,
          trend: 0,
          avgRsvps: 18,
          avgAttendance: 82,
          popularDay: "Saturday",
        },
        attendance: {
          average: 76,
          trend: -2,
        },
        retention: {
          joined: 42,
          active: 38,
          left: 4,
          rate: 90,
        },
      };
    }),

  getFeedback: associationAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view feedback" 
        });
      }

      // In a real implementation, this would fetch feedback from the database
      // For now, we'll return mock data
      return [
        {
          id: "1",
          type: "FEEDBACK",
          content: "Great event last weekend!",
          status: "NEW",
          createdAt: new Date(),
          user: { id: "u1", name: "User 1" },
        },
        {
          id: "2",
          type: "ISSUE",
          content: "Had trouble finding the venue.",
          status: "RESOLVED",
          createdAt: new Date(),
          user: { id: "u2", name: "User 2" },
        },
      ];
    }),

  // Platform Admin procedures
  create: platformAdminProcedure
    .input(z.object({ 
      location: z.string(),
      ownerId: z.string().optional(),
      maxPopulation: z.number().int().min(1).default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.association.create({
        data: {
          location: input.location,
          maxPopulation: input.maxPopulation,
          ...(input.ownerId && {
            ownerId: input.ownerId,
            admins: {
              connect: { id: input.ownerId },
            },
          }),
        },
      });
    }),

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