-- Homepage hero configuration: a singleton row (id = 'main') editable from the admin
-- panel. Stores copy, CTA links, and the optional background image + styling.

CREATE TABLE "HeroConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "eyebrow" TEXT NOT NULL DEFAULT 'A closet for every story',
    "title" TEXT NOT NULL DEFAULT 'PRE-LOVED. RE-LOVED.',
    "subtitle" TEXT NOT NULL DEFAULT 'Discover pieces with another story.',
    "backgroundUrl" TEXT,
    "backgroundObjectKey" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#3B2230',
    "overlayOpacity" INTEGER NOT NULL DEFAULT 35,
    "textAlign" TEXT NOT NULL DEFAULT 'left',
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'EXPLORE',
    "primaryCtaHref" TEXT NOT NULL DEFAULT '/explore',
    "secondaryCtaLabel" TEXT NOT NULL DEFAULT 'SELL SOMETHING',
    "secondaryCtaHref" TEXT NOT NULL DEFAULT '/sell',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "HeroConfig" ("id", "updatedAt") VALUES ('main', CURRENT_TIMESTAMP);
