import type {
    FilterQuery,
    HydratedDocument,
    Model,
    PopulateOptions,
    QueryWithHelpers,
    UpdateQuery,
} from "mongoose";
import type { PaginatedResult } from "../../shared/utils/query";

export type PopulateSpec = PopulateOptions | string;
export type PopulateProfiles = Record<string, PopulateSpec[]>;
type PopulateArg = string | PopulateOptions | Array<string | PopulateOptions>;

export type RepositoryFindOptions = {
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
};

export type RepositoryPageOptions = {
    page: number;
    limit: number;
    sort?: Record<string, 1 | -1>;
};

type RepositoryOptions = {
    defaultPopulate?: PopulateSpec[];
    populateProfiles?: PopulateProfiles;
};

export abstract class BaseRepository<TPersistence, TEntity> {
    protected readonly model: Model<TPersistence>;
    protected readonly defaultPopulate: PopulateSpec[];
    protected readonly populateProfiles: PopulateProfiles;

    protected constructor(
        model: Model<TPersistence>,
        options: RepositoryOptions = {},
    ) {
        this.model = model;
        this.defaultPopulate = options.defaultPopulate ?? [];
        this.populateProfiles = options.populateProfiles ?? {};
    }

    protected abstract toEntity(doc: HydratedDocument<TPersistence>): TEntity;

    protected abstract toPersistence(
        entity: TEntity,
    ): Partial<TPersistence> & { _id?: string };

    protected resolvePopulate(
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): PopulateSpec[] {
        const populate: PopulateSpec[] = [];

        if (this.defaultPopulate.length > 0) {
            populate.push(...this.defaultPopulate);
        }

        if (profiles) {
            const names = Array.isArray(profiles) ? profiles : [profiles];
            for (const name of names) {
                const entry = this.populateProfiles[name];
                if (entry && entry.length > 0) {
                    populate.push(...entry);
                }
            }
        }

        if (extraPopulate && extraPopulate.length > 0) {
            populate.push(...extraPopulate);
        }

        return populate;
    }

    protected hydrateQuery<
        TResult,
        TDoc,
        TQuery extends QueryWithHelpers<TResult, TDoc>,
    >(
        query: TQuery,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): TQuery {
        const populate = this.resolvePopulate(profiles, extraPopulate);
        if (populate.length > 0) {
            query.populate(populate);
        }
        return query;
    }

    protected async hydrateDoc(
        doc: HydratedDocument<TPersistence>,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<void> {
        const populate = this.resolvePopulate(profiles, extraPopulate);
        if (populate.length === 0) return;
        await (
            doc as unknown as {
                populate: (arg: PopulateArg) => Promise<unknown>;
            }
        ).populate(populate as PopulateArg);
    }

    async create(
        entity: TEntity,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<TEntity> {
        const payload = this.toPersistence(entity);
        const doc = await this.model.create(
            payload as UpdateQuery<TPersistence>,
        );
        await this.hydrateDoc(doc, profiles, extraPopulate);
        return this.toEntity(doc);
    }

    async save(
        entity: TEntity,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<TEntity> {
        const payload = this.toPersistence(entity);
        const id = payload._id;

        if (!id) {
            return this.create(entity, profiles, extraPopulate);
        }

        const doc = await this.model
            .findByIdAndUpdate(id, payload, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
                runValidators: true,
            })
            .exec();

        if (!doc) {
            return this.create(entity, profiles, extraPopulate);
        }

        await this.hydrateDoc(doc, profiles, extraPopulate);
        return this.toEntity(doc);
    }

    async findById(
        id: string,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<TEntity | null> {
        const query = this.model.findById(id);
        this.hydrateQuery(query, profiles, extraPopulate);
        const doc = await query.exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findOne(
        filter: FilterQuery<TPersistence>,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<TEntity | null> {
        const query = this.model.findOne(filter);
        this.hydrateQuery(query, profiles, extraPopulate);
        const doc = await query.exec();
        return doc ? this.toEntity(doc) : null;
    }

    async findMany(
        filter: FilterQuery<TPersistence> = {},
        options: RepositoryFindOptions = {},
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<TEntity[]> {
        let query = this.model.find(filter);
        if (options.sort) {
            query = query.sort(options.sort);
        }
        if (options.skip !== undefined) {
            query = query.skip(options.skip);
        }
        if (options.limit !== undefined) {
            query = query.limit(options.limit);
        }
        this.hydrateQuery(query, profiles, extraPopulate);
        const docs = await query.exec();
        return docs.map((doc) => this.toEntity(doc));
    }

    async paginate(
        filter: FilterQuery<TPersistence> = {},
        options: RepositoryPageOptions,
        profiles?: string | string[],
        extraPopulate?: PopulateSpec[],
    ): Promise<PaginatedResult<TEntity>> {
        const page = Math.max(options.page, 1);
        const limit = Math.max(options.limit, 1);
        const skip = (page - 1) * limit;

        const countPromise = this.model.countDocuments(filter).exec();
        let query = this.model.find(filter).skip(skip).limit(limit);

        if (options.sort) {
            query = query.sort(options.sort);
        }

        this.hydrateQuery(query, profiles, extraPopulate);

        const [total, docs] = await Promise.all([countPromise, query.exec()]);
        return {
            data: docs.map((doc) => this.toEntity(doc)),
            page,
            limit,
            total,
        };
    }

    async deleteById(id: string): Promise<boolean> {
        const result = await this.model
            .deleteOne({ _id: id } as FilterQuery<TPersistence>)
            .exec();
        return (result.deletedCount ?? 0) > 0;
    }

    async deleteMany(filter: FilterQuery<TPersistence>): Promise<number> {
        const result = await this.model.deleteMany(filter).exec();
        return result.deletedCount ?? 0;
    }
}
