import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  platformAdminProcedure,
} from "~/server/api/trpc";
import { UserRole } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  // Get platform metrics
  getPlatformMetrics: platformAdminProcedure
    .query(async ({ ctx }) => {
      // In a real implementation, these would be calculated from database queries
      // For now, we'll return mock data
      return {
        totalUsers: 523,
        usersTrend: 8.4,
        pendingApplications: 12,
        totalAssociations: 18,
        totalLocations: 14,
        eventsThisWeek: 6,
      };
    }),

  // Get Weaver applications for platform admin
  getWeaverApplications: platformAdminProcedure
    .input(z.object({
      status: z.enum(["new", "under_review", "approved", "rejected", "all"]).optional(),
      sortField: z.enum(["date", "location", "score"]).default("date"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
      location: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would query the database with filters
      // For now, we'll return mock data
      return [
        {
          id: "1",
          user: { 
            id: "u1", 
            name: "John Smith", 
            email: "john@example.com" 
          },
          location: "London",
          status: "NEW",
          score: 7,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
        {
          id: "2",
          user: { 
            id: "u2", 
            name: "Jane Doe", 
            email: "jane@example.com" 
          },
          location: "New York",
          status: "UNDER_REVIEW",
          score: 9,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        },
        {
          id: "3",
          user: { 
            id: "u3", 
            name: "Bob Johnson", 
            email: "bob@example.com" 
          },
          location: "Berlin",
          status: "NEW",
          score: 5,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        },
      ];
    }),

  // Get Weaver application detail
  getWeaverApplicationDetail: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would fetch from the database
      // For now, we'll return mock data
      return {
        id: input.id,
        user: { 
          id: "u1", 
          name: "John Smith", 
          email: "john@example.com" 
        },
        location: "London",
        status: "NEW",
        score: 7,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        twitterHandle: "@johnsmith",
        discordUsername: "johnsmith#1234",
        answers: [
          {
            questionId: "q1",
            question: "What brings you to our community?",
            answer: "I'm interested in connecting with like-minded people in my area.",
          },
          {
            questionId: "q2",
            question: "What do you hope to contribute?",
            answer: "I have experience organizing events and would love to help with that.",
          },
        ],
        adminNotes: [
          {
            id: "n1",
            content: "Seems like a good fit.",
            createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            admin: { id: "a1", name: "Admin User" },
          }
        ],
        scoreFactors: {
          locationScore: 8,
          answerScore: 7,
          socialScore: 6,
        },
        suggestedAssociation: {
          id: "assoc1",
          name: "London Central",
          location: "London",
          population: 24,
          maxPopulation: 30,
        }
      };
    }),

  // Approve Weaver application
  approveWeaverApplication: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Reject Weaver application
  rejectWeaverApplication: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Flag Weaver application for further review
  flagWeaverApplication: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Add notes to an application
  addApplicationNotes: platformAdminProcedure
    .input(z.object({ 
      id: z.string(),
      notes: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Blacklist a user
  blacklistUser: platformAdminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Get all associations
  getAllAssociations: platformAdminProcedure
    .input(z.object({ 
      location: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would query the database with filters
      // For now, we'll return mock data
      return [
        {
          id: "1",
          name: "London Central",
          location: "London",
          population: 24,
          maxPopulation: 30,
          active: true,
          owner: { id: "u1", name: "John Smith", email: "john@example.com" },
        },
        {
          id: "2",
          name: "New York Downtown",
          location: "New York",
          population: 18,
          maxPopulation: 30,
          active: true,
          owner: { id: "u2", name: "Jane Doe", email: "jane@example.com" },
        },
        {
          id: "3",
          name: "Berlin Mitte",
          location: "Berlin",
          population: 22,
          maxPopulation: 30,
          active: true,
          owner: { id: "u3", name: "Bob Johnson", email: "bob@example.com" },
        },
      ];
    }),

  // Get association detail
  getAssociationDetail: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would fetch from the database
      // For now, we'll return mock data
      return {
        id: input.id,
        name: "London Central",
        location: "London",
        population: 24,
        maxPopulation: 30,
        active: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
        owner: { 
          id: "u1", 
          name: "John Smith", 
          email: "john@example.com" 
        },
        admins: [
          { 
            id: "u2", 
            name: "Jane Doe", 
            email: "jane@example.com" 
          },
        ],
        pendingApplications: 3,
        upcomingEvents: 2,
        retentionRate: 92,
      };
    }),

  // Update association
  updateAssociation: platformAdminProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().optional(),
      location: z.string().optional(),
      maxPopulation: z.number().int().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return {
        id: input.id,
        name: input.name || "London Central",
        location: input.location || "London",
        maxPopulation: input.maxPopulation || 30,
      };
    }),

  // Deactivate association
  deactivateAssociation: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Get association history
  getAssociationHistory: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would fetch from the database
      // For now, we'll return mock data
      return [
        {
          id: "h1",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          event: "JOIN",
          user: { id: "u4", name: "Alice Williams" },
          notes: "Application approved",
        },
        {
          id: "h2",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
          event: "LEAVE",
          user: { id: "u5", name: "Charlie Brown" },
          notes: "Requested transfer",
        },
        {
          id: "h3",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21), // 21 days ago
          event: "TRANSFER_IN",
          user: { id: "u6", name: "David Miller" },
          notes: "Transferred from Berlin",
        },
      ];
    }),

  // Get association moderation issues
  getAssociationModeration: platformAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would fetch from the database
      // For now, we'll return mock data
      return [
        {
          id: "m1",
          title: "Inappropriate message",
          description: "A user reported an inappropriate message in the event chat.",
          status: "NEW",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          reporter: { id: "u7", name: "Eve Jones" },
        },
        {
          id: "m2",
          title: "Event no-show",
          description: "Multiple users didn't show up to event without cancelling RSVP.",
          status: "IN_PROGRESS",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
          reporter: { id: "u8", name: "Frank White" },
        },
      ];
    }),

  // Get moderation items
  getModerationItems: platformAdminProcedure
    .input(z.object({ 
      status: z.enum(["new", "in_progress", "resolved", "dismissed", "all"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would query the database with filters
      // For now, we'll return mock data
      return [
        {
          id: "m1",
          type: "MESSAGE",
          association: { id: "a1", name: "London Central" },
          reporter: { id: "u7", name: "Eve Jones" },
          status: "NEW",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        },
        {
          id: "m2",
          type: "USER",
          association: { id: "a1", name: "London Central" },
          reporter: { id: "u8", name: "Frank White" },
          status: "IN_PROGRESS",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
        },
        {
          id: "m3",
          type: "CONTENT",
          association: { id: "a2", name: "New York Downtown" },
          reporter: { id: "u9", name: "Grace Lee" },
          status: "RESOLVED",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
        },
      ];
    }),

  // Update moderation status
  updateModerationStatus: platformAdminProcedure
    .input(z.object({ 
      id: z.string(),
      status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "DISMISSED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would update the database
      // For now, we'll just return a mock success response
      return { success: true };
    }),

  // Get platform insights
  getPlatformInsights: platformAdminProcedure
    .input(z.object({ 
      timeRange: z.enum(["week", "month", "quarter", "year", "all"]).default("month"),
    }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would calculate metrics from the database
      // For now, we'll return mock data
      return {
        userStats: {
          total: 523,
          growth: 8.4,
          new: 42,
          active: 486,
          approvalRate: 82,
          retention: 91,
        },
        associationStats: {
          active: 18,
          locations: 14,
          topPerforming: [
            {
              id: "a1",
              name: "London Central",
              location: "London",
              members: 24,
              events: 12,
              attendance: 86,
              retention: 94,
              status: "active",
            },
            {
              id: "a2",
              name: "New York Downtown",
              location: "New York",
              members: 18,
              events: 8,
              attendance: 82,
              retention: 92,
              status: "active",
            },
            {
              id: "a3",
              name: "Berlin Mitte",
              location: "Berlin",
              members: 22,
              events: 10,
              attendance: 78,
              retention: 89,
              status: "active",
            },
          ],
        },
        eventStats: {
          total: 124,
          growth: 12.6,
          avgAttendance: 82,
          attendanceGrowth: 3.2,
          avgSize: 15,
          totalAttendances: 1860,
          popularDay: "Saturday",
          popularTime: "7:00 PM",
        },
        applicationStats: {
          total: 642,
          approved: 523,
          rejected: 119,
        },
        geoStats: {
          topLocations: [
            { name: "London", percentage: 18 },
            { name: "New York", percentage: 14 },
            { name: "Berlin", percentage: 12 },
            { name: "Paris", percentage: 10 },
            { name: "Tokyo", percentage: 8 },
          ],
        },
      };
    }),

  // Assign association admin
  assignAssociationAdmin: platformAdminProcedure
    .input(z.object({ 
      associationId: z.string(),
      adminEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Find the user by email
      const user = await ctx.db.user.findUnique({
        where: { email: input.adminEmail },
      });
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found with the provided email",
        });
      }
      
      // Update the user's role if not already an admin
      if (user.role !== UserRole.ASSOCIATION_ADMIN && user.role !== UserRole.PLATFORM_ADMIN) {
        await ctx.db.user.update({
          where: { id: user.id },
          data: { role: UserRole.ASSOCIATION_ADMIN },
        });
      }
      
      // Connect the user as an admin to the association
      return ctx.db.association.update({
        where: { id: input.associationId },
        data: {
          admins: {
            connect: { id: user.id },
          },
        },
      });
    }),
});