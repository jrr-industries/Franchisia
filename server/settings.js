import prisma from "./prisma.js";

const DEFAULTS = {
  maintenanceMode: false,
  featureFlags: {
    registration: true,
    messaging: true,
    listings: true,
    marketplace: true,
    analytics: true,
  },
};

let cached = null;

async function load() {
  if (cached) return cached;
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ["maintenanceMode", "featureFlags"] } },
  });
  cached = { ...DEFAULTS };
  for (const row of rows) {
    if (row.key === "maintenanceMode") cached.maintenanceMode = row.value;
    if (row.key === "featureFlags") cached.featureFlags = { ...cached.featureFlags, ...(typeof row.value === "object" ? row.value : {}) };
  }
  return cached;
}

export async function getMaintenanceMode() {
  const s = await load();
  return s.maintenanceMode;
}

export async function setMaintenanceMode(v) {
  await prisma.siteSetting.upsert({
    where: { key: "maintenanceMode" },
    update: { value: v },
    create: { key: "maintenanceMode", value: v },
  });
  cached = null;
}

export async function getFeatureFlags() {
  const s = await load();
  return { ...s.featureFlags };
}

export async function setFeatureFlags(f) {
  const s = await load();
  const merged = { ...s.featureFlags, ...f };
  await prisma.siteSetting.upsert({
    where: { key: "featureFlags" },
    update: { value: merged },
    create: { key: "featureFlags", value: merged },
  });
  cached = null;
}
