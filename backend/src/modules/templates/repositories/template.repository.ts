import { Template } from "../entities/template.entity";
import { TemplateModel } from "../schemas/template.model";

class TemplateRepository {
  /**
   * Get all templates for a user
   */
  async getTemplatesByUserId(userId: string): Promise<Template[]> {
    const templates = await TemplateModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return (templates || []) as unknown as Template[];
  }

  /**
   * Get a specific template by ID
   */
  async getTemplateById(templateId: string): Promise<Template | null> {
    const template = await TemplateModel.findById(templateId).lean().exec();
    return (template || null) as unknown as Template | null;
  }

  /**
   * Create a new template
   */
  async createTemplate(template: Template): Promise<Template> {
    const newTemplate = await TemplateModel.create(template);
    return newTemplate.toObject() as unknown as Template;
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    updateData: Partial<Template>,
  ): Promise<Template | null> {
    const updated = await TemplateModel.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true },
    )
      .lean()
      .exec();
    return (updated || null) as unknown as Template | null;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<boolean> {
    const result = await TemplateModel.deleteOne({ _id: templateId }).exec();
    return result.deletedCount > 0;
  }

  /**
   * Delete all templates for a user
   */
  async deleteTemplatesByUserId(userId: string): Promise<number> {
    const result = await TemplateModel.deleteMany({ userId }).exec();
    return result.deletedCount;
  }

  /**
   * Get public templates (optional: shared templates visible to all users)
   */
  async getPublicTemplates(limit: number = 10): Promise<Template[]> {
    // This is a future feature - currently all templates are private
    const templates = await TemplateModel.find()
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return (templates || []) as unknown as Template[];
  }
}

export default new TemplateRepository();
