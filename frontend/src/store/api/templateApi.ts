import { baseApi } from "./baseApi";

export interface TemplateStickerDTO {
  number: number;
  state: "NEW" | "DAMAGED";
  type: "REGULAR" | "SHINY";
  description?: string;
  player: {
    name: string;
    nationalTeam?: { name: string } | null;
    club?: { name: string } | null;
    image: string | null;
  };
}

export interface TemplateDTO {
  _id: string;
  name: string;
  sticker: TemplateStickerDTO;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

type CreateTemplateArgs = {
  name: string;
  sticker: TemplateStickerDTO;
};

type UpdateTemplateArgs = {
  templateId: string;
  name?: string;
  sticker?: TemplateStickerDTO;
};

export const templateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<TemplateDTO[], void>({
      query: () => "/templates",
      providesTags: ["Templates"],
    }),
    createTemplate: builder.mutation<TemplateDTO, CreateTemplateArgs>({
      query: (body) => ({
        url: "/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    updateTemplate: builder.mutation<TemplateDTO, UpdateTemplateArgs>({
      query: ({ templateId, ...body }) => ({
        url: `/templates/${templateId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    deleteTemplate: builder.mutation<void, string>({
      query: (templateId) => ({
        url: `/templates/${templateId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates"],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = templateApi;
