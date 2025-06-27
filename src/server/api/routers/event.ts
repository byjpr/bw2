import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  associationAdminProcedure,
} from "~/server/api/trpc";
import { canManageEvent, canAttendEvent, isAdminOfAssociation } from "~/lib/auth-utils";

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
        userRsvp: event.rsvps[0] || null,
      };
    }),

  // Create RSVP for an event
  createRsvp: protectedProcedure
    .input(z.object({ 
      eventId: z.string(),
      status: z.enum(['YES', 'NO', 'MAYBE', 'LATE', 'CANCELLED']),
      comment: z.string().optional(),
      guestsCount: z.number().int().min(0).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can attend this event
      const hasAccess = await canAttendEvent(ctx.session.user.id, input.eventId);
      
      if (!hasAccess) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You don't have access to this event" 
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

  // Create a new event (admin only)
  create: protectedProcedure
    .input(z.object({ 
      name: z.string(),
      location: z.string(),
      associationId: z.string(),
      date: z.date(),
      arrivalTime: z.date(),
      arrivalRules: z.enum(['ON_TIME', 'BRITISH_SOCIAL', 'BRITISH_BUSINESS', 'GERMAN']).default('ON_TIME'),
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
      
      return ctx.db.event.create({
        data: {
          name: input.name,
          location: input.location,
          associationId: input.associationId,
          date: input.date,
          arrivalTime: input.arrivalTime,
          arrivalRules: input.arrivalRules,
          descriptionMd: input.descriptionMd,
          ticketLink: input.ticketLink,
        },
      });
    }),

  // Update an event (admin only)
  update: protectedProcedure
    .input(z.object({ 
      id: z.string(),
      name: z.string().optional(),
      location: z.string().optional(),
      date: z.date().optional(),
      arrivalTime: z.date().optional(),
      arrivalRules: z.enum(['ON_TIME', 'BRITISH_SOCIAL', 'BRITISH_BUSINESS', 'GERMAN']).optional(),
      descriptionMd: z.string().optional(),
      ticketLink: z.string().optional(),
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
      
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.location && { location: input.location }),
          ...(input.date && { date: input.date }),
          ...(input.arrivalTime && { arrivalTime: input.arrivalTime }),
          ...(input.arrivalRules && { arrivalRules: input.arrivalRules }),
          ...(input.descriptionMd !== undefined && { descriptionMd: input.descriptionMd }),
          ...(input.ticketLink !== undefined && { ticketLink: input.ticketLink }),
        },
      });
    }),

  // Get RSVPs for an event (admin only)
  getRsvps: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user can manage this event
      const canManage = await canManageEvent(ctx.session.user.id, input.eventId);
      
      if (!canManage) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Only association admins can view all RSVPs" 
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
        orderBy: { respondedAt: 'desc' },
      });
    }),

  // Check in a user to an event (admin only)
  checkInUser: protectedProcedure
    .input(z.object({ 
      eventId: z.string(),
      userId: z.string(),
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
      
      // First check if the user being checked in is a member
      const canAttend = await canAttendEvent(input.userId, input.eventId);
      
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
            userId: input.userId,
          },
        },
        update: {
          checkedInAt: new Date(),
          checkedInById: ctx.session.user.id,
          notes: input.notes,
        },
        create: {
          eventId: input.eventId,
          userId: input.userId,
          checkedInById: ctx.session.user.id,
          notes: input.notes,
        },
      });
    }),
});