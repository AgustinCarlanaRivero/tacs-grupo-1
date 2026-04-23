import { Collection } from "../../collection/collection.entity";
import { UserRole } from "../enums/user-role.enum";

export class User {
  id: string;
  auth0Sub: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  reputation: number;
  collection: Collection | null;

  constructor(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    role: UserRole = UserRole.STANDARD,
    reputation = 0,
    collection: Collection | null = null,
  ) {
    this.id = crypto.randomUUID();
    this.auth0Sub = "";
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.role = role;
    this.reputation = reputation;
    this.collection = collection;
  }
}
