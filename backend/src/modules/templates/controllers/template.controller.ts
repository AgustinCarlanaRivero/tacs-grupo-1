import { Request, Response } from "express";
import type { z } from "zod";
import { NotFoundError } from "../../../shared/errors/http-errors";
import { Club } from "../../stickers/entities/club.entity";
import { NationalTeam } from "../../stickers/entities/national-team.entity";
import { Player } from "../../stickers/entities/player.entity";
import { Sticker } from "../../stickers/entities/sticker.entity";
import { Template } from "../entities/template.entity";
import TemplateRepository from "../repositories/template.repository";
import {
  createTemplateRequestSchema,
  updateTemplateRequestSchema,
} from "../schemas/template.schemas";

type AuthenticatedRequest = Request & { user?: { id: string; role: string } };
type CreateTemplateBody = z.infer<typeof createTemplateRequestSchema>;
type UpdateTemplateBody = z.infer<typeof updateTemplateRequestSchema>;

/**
 * Mapper function to convert request sticker data to Sticker entity
 */
const mapToSticker = (stickerData: any): Sticker => {
  const nationalTeam = stickerData.player.nationalTeam
    ? new NationalTeam(stickerData.player.nationalTeam.name)
    : null;
  const club = stickerData.player.club
    ? new Club(stickerData.player.club.name)
    : null;

  const player = new Player(
    stickerData.player.name,
    nationalTeam ?? new NationalTeam(""),
    club ?? new Club(""),
    stickerData.player.image || "",
  );

  return new Sticker(
    stickerData.number,
    player,
    stickerData.state || "NEW",
    stickerData.type || "REGULAR",
    stickerData.description || "",
  );
};

export default class TemplateController {
  /**
   * GET /templates
   * Get all templates for the authenticated user
   */
  getTemplates = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const templates = await TemplateRepository.getTemplatesByUserId(userId);
    return res.status(200).json(templates);
  };

  /**
   * GET /templates/:templateId
   * Get a specific template (must be owned by the user)
   */
  getTemplate = async (req: Request, res: Response) => {
    const { templateId } = req.params as { templateId: string };
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const template = await TemplateRepository.getTemplateById(templateId);
    if (!template) {
      throw new NotFoundError(`Template with id ${templateId} not found`);
    }

    // Verify ownership (userId persiste como ObjectId; comparar como string)
    if (String(template.userId) !== String(userId)) {
      throw new NotFoundError(
        `Template with id ${templateId} not found or not owned by user`,
      );
    }

    return res.status(200).json(template);
  };

  /**
   * POST /templates
   * Create a new template
   */
  createTemplate = async (req: Request, res: Response) => {
    const body = req.body as CreateTemplateBody;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const sticker = mapToSticker(body.sticker);

    const template = new Template(body.name, sticker, userId);

    const created = await TemplateRepository.createTemplate(template);
    return res.status(201).json(created);
  };

  /**
   * PATCH /templates/:templateId
   * Update a template
   */
  updateTemplate = async (req: Request, res: Response) => {
    const { templateId } = req.params as { templateId: string };
    const body = req.body as UpdateTemplateBody;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const template = await TemplateRepository.getTemplateById(templateId);
    if (!template) {
      throw new NotFoundError(`Template with id ${templateId} not found`);
    }

    // Verify ownership (userId persiste como ObjectId; comparar como string)
    if (String(template.userId) !== String(userId)) {
      throw new NotFoundError(
        `Template with id ${templateId} not found or not owned by user`,
      );
    }

    const updateData: Partial<Template> = {};

    if (body.name) {
      updateData.name = body.name;
    }

    if (body.sticker) {
      updateData.sticker = mapToSticker(body.sticker);
    }

    updateData.updatedAt = new Date();

    const updated = await TemplateRepository.updateTemplate(
      templateId,
      updateData,
    );
    if (!updated) {
      throw new NotFoundError(
        `Template with id ${templateId} not found or could not be updated`,
      );
    }

    return res.status(200).json(updated);
  };

  /**
   * DELETE /templates/:templateId
   * Delete a template
   */
  deleteTemplate = async (req: Request, res: Response) => {
    const { templateId } = req.params as { templateId: string };
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const template = await TemplateRepository.getTemplateById(templateId);
    if (!template) {
      throw new NotFoundError(`Template with id ${templateId} not found`);
    }

    // Verify ownership (userId persiste como ObjectId; comparar como string)
    if (String(template.userId) !== String(userId)) {
      throw new NotFoundError(
        `Template with id ${templateId} not found or not owned by user`,
      );
    }

    const deleted = await TemplateRepository.deleteTemplate(templateId);
    if (!deleted) {
      throw new NotFoundError(
        `Template with id ${templateId} could not be deleted`,
      );
    }

    return res.status(204).send();
  };
}

