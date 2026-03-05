/**
 * Seed script: creates first admin user and optionally seed site config.
 * Run: npx tsx script/seed-admin.ts
 *
 * Env: ADMIN_USERNAME, ADMIN_PASSWORD (or prompted)
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import * as readline from "readline";
import { db } from "../server/db";
import {
  adminUsers,
  siteConfig,
  navCards,
  galleryWorks,
  products,
} from "@shared/schema";
import { DEFAULT_SITE_CONFIG } from "@shared/defaults";
import { eq } from "drizzle-orm";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log("Tony The Witch - Admin seed\n");

  const username =
    process.env.ADMIN_USERNAME || (await question("Admin username: "));
  const password =
    process.env.ADMIN_PASSWORD || (await question("Admin password: "));

  if (!username?.trim() || !password?.trim()) {
    console.error("Username and password are required.");
    rl.close();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));

    if (existing.length > 0) {
      console.log(`Admin user "${username}" already exists. Skipping.`);
    } else {
      await db.insert(adminUsers).values({ username, passwordHash });
      console.log(`Admin user "${username}" created.`);
    }

    // Ensure site_config has one row
    const [configRow] = await db.select().from(siteConfig).limit(1);
    if (!configRow) {
      await db.insert(siteConfig).values({ data: DEFAULT_SITE_CONFIG });
      console.log("Site config seeded with defaults.");
    } else {
      console.log("Site config already exists.");
    }

    // Optionally seed nav_cards, gallery, products if empty
    const navCount = await db.select().from(navCards);
    if (navCount.length === 0) {
      await db.insert(navCards).values([
        {
          title: "View Portfolio",
          subtitle: "Selected Works",
          href: "/portfolio",
          external: false,
          image:
            "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=800&auto=format&fit=crop",
          sortOrder: 0,
        },
        {
          title: "Shop",
          subtitle: "Merch & Prints",
          href: "/shop",
          external: false,
          image:
            "https://images.unsplash.com/photo-1542848284-8afa78a08ccb?q=80&w=800&auto=format&fit=crop",
          sortOrder: 1,
        },
        {
          title: "Contact",
          subtitle: "WhatsApp",
          href: "https://wa.me/1234567890",
          external: true,
          image:
            "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?q=80&w=800&auto=format&fit=crop",
          sortOrder: 2,
        },
        {
          title: "Instagram",
          subtitle: "@tonythewitch",
          href: "https://instagram.com/tonythewitch",
          external: true,
          image:
            "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=800&auto=format&fit=crop",
          sortOrder: 3,
        },
      ]);
      console.log("Nav cards seeded.");
    }

    console.log("\nDone.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
