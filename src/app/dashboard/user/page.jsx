
export const dynamic = "force-dynamic";

import { models } from "../../models/index.js";
import UsersClient from "../component/UsersClient.jsx";


async function getUsers() {
  const userModel = await models.userModel();

  if (!userModel) throw new Error("User model not initialised!");

  const users = await userModel.findAll({
    limit: 70,
    offset: 0,
    attributes: ["id", "name", "email", "role", "password","documents","dateOfJoining","dateOfBirth","operatorPercentage"],
  });

  return users.map((u) => u.get({ plain: true }));
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient initialUsers={users} />;
}