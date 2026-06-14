import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
    buildNotificationRepoMock as mockBuildNotifRepo,
    buildUserRepoMock as mockBuildUserRepo,
} from "../helpers/repo-mocks";

jest.mock("../../modules/users/repositories/user.repository", () => ({
    __esModule: true,
    default: mockBuildUserRepo(),
}));
jest.mock("../../modules/notifications/repositories/notification.repository", () => ({
    __esModule: true,
    default: mockBuildNotifRepo(),
}));

import { NotificationChannel } from "../../modules/notifications/channels/notification-channel";
import {
    TelegramChannel,
    type TelegramSender,
} from "../../modules/notifications/channels/telegram.channel";
import { Notification } from "../../modules/notifications/entities/notification.entity";
import { NotificationType } from "../../modules/notifications/enums/notification-type.enum";
import notificationRepository from "../../modules/notifications/repositories/notification.repository";
import notificationService from "../../modules/notifications/services/notification.service";
import userRepository from "../../modules/users/repositories/user.repository";
import { buildNotification, buildUser } from "../helpers/builders";

beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("TelegramChannel.send", () => {
    const makeSender = (
        impl: () => Promise<unknown> = async () => ({}),
    ): { bot: TelegramSender; sendMessage: ReturnType<typeof jest.fn> } => {
        const sendMessage =
            jest.fn<(chatId: number | string, text: string) => Promise<unknown>>(
                impl,
            );
        return { bot: { api: { sendMessage } }, sendMessage };
    };

    beforeEach(async () => {
        await userRepository.clear();
    });

    it("no envía si el usuario no tiene telegramChatId", async () => {
        await userRepository.save(buildUser("u1"));
        const { bot, sendMessage } = makeSender();

        await new TelegramChannel(bot).send(buildNotification("n1", "u1"));

        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("envía al chat vinculado con el texto formateado", async () => {
        const user = buildUser("u1");
        user.telegramChatId = "555";
        await userRepository.save(user);

        const { bot, sendMessage } = makeSender();
        await new TelegramChannel(bot).send(
            buildNotification("n1", "u1", {
                type: NotificationType.OFFER_RECEIVED,
                message: "Tenés una oferta nueva",
            }),
        );

        expect(sendMessage).toHaveBeenCalledTimes(1);
        const [chatId, text] = sendMessage.mock.calls[0] as [string, string];
        expect(chatId).toBe("555");
        expect(text).toContain("Tenés una oferta nueva");
    });

    it("no propaga si el envío por Telegram falla", async () => {
        const user = buildUser("u1");
        user.telegramChatId = "555";
        await userRepository.save(user);

        const { bot, sendMessage } = makeSender(async () => {
            throw new Error("telegram caído");
        });

        await expect(
            new TelegramChannel(bot).send(buildNotification("n1", "u1")),
        ).resolves.toBeUndefined();
        expect(sendMessage).toHaveBeenCalled();
    });
});

describe("notify (aislamiento de canales)", () => {
    beforeEach(async () => {
        await notificationRepository.clear();
    });

    it("un canal que falla no corta la entrega por los demás", async () => {
        const send = jest.fn<(n: Notification) => Promise<void>>(async () => {
            throw new Error("canal caído");
        });
        const failing: NotificationChannel = { send };
        notificationService.addChannel(failing);

        const notification = await notificationService.notify(
            "u1",
            NotificationType.STICKER_AVAILABLE,
            "hay figuritas",
        );

        // El InAppChannel por defecto persistió igual la notificación.
        expect(await notificationRepository.findById(notification.id)).toBe(
            notification,
        );
        expect(send).toHaveBeenCalledTimes(1);
    });
});
