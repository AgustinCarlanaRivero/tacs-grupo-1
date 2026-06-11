import { Router } from "express";
import { asyncHandler } from "../../../shared/middleware/async-handler";
import {
  validateBody,
  validateParams,
} from "../../../shared/middleware/validation.middleware";
import { z } from "zod";
import {
  createTemplateRequestSchema,
  updateTemplateRequestSchema,
} from "../schemas/template.schemas";
import TemplateController from "../controllers/template.controller";

const router = Router();
const templateController = new TemplateController();

const templateIdParamSchema = z.object({
  templateId: z.string(),
});

// Base: /templates

/**
 * GET /templates - Get all templates for the authenticated user
 * POST /templates - Create a new template
 */
router
  .route("/")
  .get(asyncHandler(templateController.getTemplates as any))
  .post(
    validateBody(createTemplateRequestSchema),
    asyncHandler(templateController.createTemplate as any),
  );

/**
 * GET /templates/:templateId - Get a specific template
 * PATCH /templates/:templateId - Update a template
 * DELETE /templates/:templateId - Delete a template
 */
router
  .route("/:templateId")
  .get(
    validateParams(templateIdParamSchema),
    asyncHandler(templateController.getTemplate as any),
  )
  .patch(
    validateParams(templateIdParamSchema),
    validateBody(updateTemplateRequestSchema),
    asyncHandler(templateController.updateTemplate as any),
  )
  .delete(
    validateParams(templateIdParamSchema),
    asyncHandler(templateController.deleteTemplate as any),
  );

export default router;
