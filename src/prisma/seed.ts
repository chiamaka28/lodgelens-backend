import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./db";  

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const rawPassword = process.env.ADMIN_PASSWORD!;

  if (!email || !rawPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment");
  }

  const hashed = await bcrypt.hash(rawPassword, 10);

  await db.orm.public.User.upsert({
    update: {}, 
    create: {
      email,
      password: hashed,
      firstname: "Admin",
      lastname: "User",
      role: "ADMIN",       
      status: "APPROVED",
    },
    conflictOn: { email }, 
  });

  console.log(`Admin account ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.close());