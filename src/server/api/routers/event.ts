import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  associationAdminProcedure,
} from "~/server/api/trpc";
import { canManageEvent, canAttendEvent, isAdminOfAssociation, isAssociationMember } from "~/lib/auth-utils";

export const eventRouter = createTRPCRouter({
  // Get event details (requires association membership)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user can attend this event
      const hasAccess = await canAttendEvent(ctx.session.user.id, input.id);
      
      if (!hasAccess) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You don't have access to this event" 
        });
      }
      
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        include: {
          association: {
            select: {
              id: true,
              location: true,
            },
          },
          rsvps: {
            where: { userId: ctx.session.user.id },
            take: 1,
          },
        },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      return {
        ...event,
        rsvp: event.rsvps[0] || null,
        showAttendees: true, // This would come from the database in a real implementation
      };
    }),

  // Get association's events
  getAssociationEvents: protectedProcedure
    .input(z.object({ 
      associationId: z.string(),
      filter: z.enum(["upcoming", "past", "all"]).default("upcoming"),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user is a member of this association
      const isMember = await isAssociationMember(ctx.session.user.id, input.associationId);
      
      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a member to view association events",
        });
      }

      // Define date filter based on input
      const dateFilter = input.filter === "upcoming" 
        ? { gte: new Date() } 
        : input.filter === "past" 
          ? { lt: new Date() } 
          : undefined;

      const events = await ctx.db.event.findMany({
        where: {
          associationId: input.associationId,
          ...(dateFilter && { date: dateFilter }),
        },
        include: {
          rsvps: {
            where: { userId: ctx.session.user.id },
          },
        },
        orderBy: input.filter === "past" 
          ? { date: "desc" } 
          : { date: "asc" },
      });

      // Include user's RSVP with each event
      return events.map(event => ({
        ...event,
        rsvp: event.rsvps[0] || null,
      }));
    }),

  // Get user's RSVP for an event
  getUserRSVP: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user can attend this event
      const hasAccess = await canAttendEvent(ctx.session.user.id, input.eventId);
      
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this event",
        });
      }

      const rsvp = await ctx.db.rSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id,
          },
        },
      });

      return rsvp;
    }),

  // Update user's RSVP for an event
  updateRSVP: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      status: z.enum(["YES", "NO", "MAYBE", "LATE", "CANCELLED"]),
      comment: z.string().optional(),
      guestsCount: z.number().int().min(0).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can attend this event
      const hasAccess = await canAttendEvent(ctx.session.user.id, input.eventId);
      
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this event",
        });
      }

      // Upsert the RSVP (create or update)
      return ctx.db.rSVP.upsert({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id,
          },
        },
        update: {
          status: input.status,
          comment: input.comment,
          guestsCount: input.guestsCount,
          respondedAt: new Date(),
        },
        create: {
          eventId: input.eventId,
          userId: ctx.session.user.id,
          status: input.status,
          comment: input.comment,
          guestsCount: input.guestsCount,
        },
      });
    }),

  // Get check-in QR code for an event
  getCheckinQrCode: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user can attend this event
      const hasAccess = await canAttendEvent(ctx.session.user.id, input.eventId);
      
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this event",
        });
      }

      // Check if the user has RSVP'd YES to this event
      const rsvp = await ctx.db.rSVP.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id,
          },
        },
      });

      if (!rsvp || rsvp.status !== "YES") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must RSVP 'Going' to access the check-in code",
        });
      }

      // In a real implementation, we would generate a QR code here
      // For now, we'll return a mock URL
      return {
        qrCodeUrl: "https://example.com/qr-code-placeholder.png",
      };
    }),

  // Get attendees for an event
  getAttendees: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user can attend this event
      const hasAccess = await canAttendEvent(ctx.session.user.id, input.eventId);
      
      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this event",
        });
      }

      // Get event to check if attendees are public
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        select: { showAttendees: true },
      });

      if (!event || !event.showAttendees) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Attendee list is not public for this event",
        });
      }

      // Get users who RSVP'd YES
      const rsvps = await ctx.db.rSVP.findMany({
        where: {
          eventId: input.eventId,
          status: "YES",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return rsvps.map(rsvp => rsvp.user);
    }),

  // Get event association
  getEventAssociation: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        select: { association: true },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      return event.association;
    }),

  // Admin Procedures
  getAllAssociationEvents: associationAdminProcedure
    .input(z.object({ associationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only association admins can view all events",
        });
      }

      const events = await ctx.db.event.findMany({
        where: { associationId: input.associationId },
        orderBy: { date: "asc" },
        include: {
          _count: {
            select: {
              rsvps: {
                where: {
                  status: { in: ["YES", "MAYBE"] },
                },
              },
            },
          },
        },
      });

      // Get RSVP counts
      return events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        arrivalTime: event.arrivalTime,
        rsvpCounts: {
          yes: event._count.rsvps,
          maybe: 0, // We would get this from a separate count in a real implementation
        },
      }));
    }),

  getEventRSVPs: associationAdminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get event to check association
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        select: { associationId: true },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, event.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only association admins can view all RSVPs",
        });
      }

      return ctx.db.rSVP.findMany({
        where: { eventId: input.eventId },
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
        orderBy: { respondedAt: "desc" },
      });
    }),

  getEventCheckins: associationAdminProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get event to check association
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        select: { associationId: true },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      // Check if user is an admin of this association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, event.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only association admins can view check-ins",
        });
      }

      return ctx.db.checkin.findMany({
        where: { eventId: input.eventId },
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
        orderBy: { checkedInAt: "desc" },
      });
    }),

  // Create a new event (admin only)
  createEvent: protectedProcedure
    .input(z.object({ 
      name: z.string(),
      location: z.string(),
      associationId: z.string(),
      date: z.date(),
      arrivalTime: z.string(), // Allow string for frontend compatibility
      arrivalRules: z.enum(["ON_TIME", "BRITISH_SOCIAL", "BRITISH_BUSINESS", "GERMAN"]).default("ON_TIME"),
      descriptionMd: z.string().optional(),
      ticketLink: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is an admin of the association
      const isAdmin = await isAdminOfAssociation(ctx.session.user.id, input.associationId);
      
      if (!isAdmin) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can create events" 
        });
      }
      
      // Convert string arrival time to Date
      const arrivalTime = new Date(input.arrivalTime);

      return ctx.db.event.create({
        data: {
          name: input.name,
          location: input.location,
          associationId: input.associationId,
          date: input.date,
          arrivalTime,
          arrivalRules: input.arrivalRules,
          descriptionMd: input.descriptionMd,
          ticketLink: input.ticketLink,
        },
      });
    }),

  // Update an event (admin only)
  updateEvent: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().optional(),
      location: z.string().optional(),
      date: z.date().optional(),
      arrivalTime: z.string().optional(), // Allow string for frontend compatibility
      arrivalRules: z.enum(["ON_TIME", "BRITISH_SOCIAL", "BRITISH_BUSINESS", "GERMAN"]).optional(),
      descriptionMd: z.string().optional(),
      ticketLink: z.string().optional(),
      showAttendees: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can manage this event
      const canManage = await canManageEvent(ctx.session.user.id, input.id);
      
      if (!canManage) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can update events" 
        });
      }
      
      // Convert string arrival time to Date if provided
      const arrivalTime = input.arrivalTime ? new Date(input.arrivalTime) : undefined;

      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.location && { location: input.location }),
          ...(input.date && { date: input.date }),
          ...(arrivalTime && { arrivalTime }),
          ...(input.arrivalRules && { arrivalRules: input.arrivalRules }),
          ...(input.descriptionMd !== undefined && { descriptionMd: input.descriptionMd }),
          ...(input.ticketLink !== undefined && { ticketLink: input.ticketLink }),
          ...(input.showAttendees !== undefined && { showAttendees: input.showAttendees }),
        },
      });
    }),

  // Delete an event (admin only)
  deleteEvent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can manage this event
      const canManage = await canManageEvent(ctx.session.user.id, input.id);
      
      if (!canManage) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can delete events" 
        });
      }

      return ctx.db.event.delete({
        where: { id: input.id },
      });
    }),

  // Check in a user to an event (admin only)
  checkInUser: protectedProcedure
    .input(z.object({ 
      eventId: z.string(),
      userId: z.string().optional(),
      email: z.string().email().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can manage this event
      const canManage = await canManageEvent(ctx.session.user.id, input.eventId);
      
      if (!canManage) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can check in users" 
        });
      }
      
      // Find user ID if email is provided
      let userId = input.userId;
      if (!userId && input.email) {
        const user = await ctx.db.user.findUnique({
          where: { email: input.email },
          select: { id: true },
        });
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found with the provided email",
          });
        }
        
        userId = user.id;
      }
      
      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either userId or email must be provided",
        });
      }
      
      // First check if the user being checked in is a member
      const canAttend = await canAttendEvent(userId, input.eventId);
      
      if (!canAttend) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "This user is not a member of the association" 
        });
      }
      
      // Upsert the check-in (create or update)
      return ctx.db.checkin.upsert({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId,
          },
        },
        update: {
          checkedInAt: new Date(),
          checkedInById: ctx.session.user.id,
          notes: input.notes,
        },
        create: {
          eventId: input.eventId,
          userId,
          checkedInById: ctx.session.user.id,
          notes: input.notes,
        },
      });
    }),
});