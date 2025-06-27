import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const applicationRouter = createTRPCRouter({
  // Get the user's applications
  getUserApplications: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.application.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          association: {
            select: {
              id: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Withdraw an application
  withdrawApplication: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if the application belongs to the user
      const application = await ctx.db.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      if (application.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only withdraw your own applications",
        });
      }

      // Check if the application is in a state that can be withdrawn
      if (application.status !== "NEW" && application.status !== "UNDER_REVIEW") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This application cannot be withdrawn",
        });
      }

      // Delete the application
      return ctx.db.application.delete({
        where: { id: input.id },
      });
    }),
});