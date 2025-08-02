
import { currentUser } from "@clerk/nextjs/server";


export const getUserInfo = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: user.imageUrl,
  };
};