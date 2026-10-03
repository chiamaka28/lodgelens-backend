import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from './db';

const email = process.env.ADMIN_EMAIL!;
const user = await db.orm.public.User.where({ email }).first();

console.log('user found:', !!user);
if (user) {
  console.log('hash prefix:', user.password.slice(0, 7));
  const ok = await bcrypt.compare(process.env.ADMIN_PASSWORD!, user.password);
  console.log('env password matches stored hash:', ok);
}
await db.close();
