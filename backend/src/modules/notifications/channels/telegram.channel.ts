import userRepository from "../../users/repositories/user.repository";
import { Notification } from "../entities/notification.entity";
import { formatNotificationMessage } from "../telegram/notification.formatter";
import { NotificationChannel } from "./notification-channel";

/**
 * Dependencia mínima que necesita el canal del bot: solo `api.sendMessage`. Así
 * el canal no se acopla al tipo completo de grammY y es fácil de mockear en tests.
 */
export type TelegramSender = {
    api: {
        sendMessage(
            chatId: number | string,
            text: string,
        ): Promise<unknown>;
    };
};

/**
 * Entrega notificaciones por Telegram. Es un canal más del `notificationService`,
 * al lado de `InAppChannel`: cualquier evento del facade sale también por acá sin
 * tocar los módulos que lo disparan.
 */
export class TelegramChannel implements NotificationChannel {
    constructor(private readonly bot: TelegramSender) {}

    async send(notification: Notification): Promise<void> {
        try {
            const user = await userRepository.findById(notification.userId);
            // No todos los usuarios vinculan Telegram: si no hay chat, no hacemos nada.
            if (!user?.telegramChatId) return;

            await this.bot.api.sendMessage(
                user.telegramChatId,
                formatNotificationMessage(notification),
            );
        } catch (error) {
            // Un fallo de Telegram no debe tumbar la entrega: capturamos y logueamos.
            console.error(
                "No se pudo enviar la notificación por Telegram:",
                error,
            );
        }
    }
}
