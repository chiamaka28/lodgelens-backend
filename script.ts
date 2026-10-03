import { db } from "./src/prisma/db";

async function main() {
  const users = await db.orm.public.User
    .select("id", "email", "firstname")
    .limit(2)
    .all();
    
  console.log("Users in database:", users);
  
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});