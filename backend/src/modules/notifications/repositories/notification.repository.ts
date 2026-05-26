import type { FilterQuery, HydratedDocument } from "mongoose";
import { BaseRepository } from "../../../infra/database/base.repository";
import {
    createObjectIdString,
    toIdString,
    toObjectId,
    type PersistenceId,
} from "../../../infra/database/schema-helpers";
import { Notification } from "../entities/notification.entity";
import { NotificationType } from "../enums/notification-type.enum";
import { NotificationModel } from "../schemas/notification.model";

type NotificationPersistence = {
    _id: PersistenceId;
    userId: PersistenceId;
    type: NotificationType;
    message: string;
    read: boolean;
    payload: Record<string, unknown>;
    createdAt: Date;
};

class NotificationRepository extends BaseRepository<
    NotificationPersistence,
    Notification
> {
    constructor() {
        super(NotificationModel);
    }

    protected toEntity(
        doc: HydratedDocument<NotificationPersistence>,
    ): Notification {
        const notification = new Notification(
            toIdString(doc.userId),
            doc.type,
            doc.message,
            doc.payload ?? {},
            doc.createdAt,
            toIdString(doc._id),
        );
        notification.read = doc.read;
        return notification;
    }

    protected toPersistence(
        notification: Notification,
    ): Partial<NotificationPersistence> & { _id?: PersistenceId } {
        const id = notification.id || createObjectIdString();
        if (!notification.id) {
            notification.setId(id);
        }

        return {
            _id: toObjectId(id),
            userId: toObjectId(notification.userId),
            type: notification.type,
            message: notification.message,
            read: notification.read,
            payload: notification.payload ?? {},
            createdAt: notification.createdAt,
        };
    }

    async save(notification: Notification): Promise<Notification> {
        return super.save(notification);
    }

    async findById(id: string): Promise<Notification | null> {
        return super.findById(id);
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        return this.findMany(
            { userId } as FilterQuery<NotificationPersistence>,
            { sort: { createdAt: -1 } },
        );
    }

    async findUnreadByUserId(userId: string): Promise<Notification[]> {
        return this.findMany(
            { userId, read: false } as FilterQuery<NotificationPersistence>,
            { sort: { createdAt: -1 } },
        );
    }

    async countUnreadByUserId(userId: string): Promise<number> {
        return NotificationModel.countDocuments({
            userId,
            read: false,
        } as FilterQuery<NotificationPersistence>).exec();
    }

    async countAll(): Promise<number> {
        return NotificationModel.countDocuments(
            {} as FilterQuery<NotificationPersistence>,
        ).exec();
    }

    async findAll(): Promise<Notification[]> {
        return this.findMany();
    }

    /**
     * Vacía los índices. Sólo se usa en tests para aislar casos.
     */
    async clear(): Promise<void> {
        await this.deleteMany({} as FilterQuery<NotificationPersistence>);
    }
}

export default new NotificationRepository();

