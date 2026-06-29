import { User } from "../../users/entities/user.entity";
import { UserRole } from "../../users/enums/user-role.enum";
import userRepository from "../../users/repositories/user.repository";
import { createObjectIdString } from "../../../infra/database/schema-helpers";

interface Auth0Profile {
    email?: string;
    name?: string;
}

export default class AuthService {
    /**
     * Busca un usuario por su Auth0 sub. Si no existe, lo crea con datos del perfil
     * (JIT provisioning) y le asigna un id único antes de persistirlo.
     *
     * @param auth0Sub identificador único de Auth0 (claim `sub` del JWT)
     * @param profile datos opcionales tomados del access token / userinfo
     * @returns el usuario existente o el recién creado
     */
    static async getOrCreateUser(
        auth0Sub: string,
        profile: Auth0Profile,
    ): Promise<User> {
        const existing = await userRepository.findByAuth0Sub(auth0Sub);
        if (existing) return existing;

        // Derivamos nombre y apellido del `name` de Auth0. Si no viene un nombre
        // real, usamos la parte local del email como nombre y dejamos el apellido
        // vacío (NO duplicamos el email en ambos campos).
        const rawName = profile.name?.trim();
        const nameParts = rawName ? rawName.split(/\s+/).filter(Boolean) : [];
        const emailLocalPart = profile.email?.split("@")[0]?.trim();
        const firstName = nameParts[0] ?? emailLocalPart ?? "Usuario";
        const lastName = nameParts.slice(1).join(" ");

        const username = await this.generateUniqueUsername(
            profile.email,
            auth0Sub,
        );

        const user = new User(
            firstName,
            lastName,
            username,
            profile.email ?? "",
            UserRole.STANDARD,
            0,
            null,
            createObjectIdString(),
        );
        user.auth0Sub = auth0Sub;

        return userRepository.save(user);
    }

    /**
     * Deriva un username a partir de la parte local del email (o del sub si no
     * hay email), normalizándolo a caracteres seguros. Si ya existe otro usuario
     * con ese username, agrega un sufijo numérico hasta encontrar uno libre.
     */
    private static async generateUniqueUsername(
        email: string | undefined,
        fallback: string,
    ): Promise<string> {
        const source = email?.split("@")[0] ?? fallback;
        const base =
            source
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, "")
                .slice(0, 40) || "usuario";

        let username = base;
        let suffix = 1;
        while (await userRepository.findByUsername(username)) {
            username = `${base}${suffix++}`;
        }

        return username;
    }

    /**
     * Devuelve el usuario actual autenticado por su id interno.
     */
    static async getCurrentUser(userId: string): Promise<User | null> {
        return userRepository.findById(userId);
    }
}

