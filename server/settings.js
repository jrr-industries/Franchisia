let maintenanceMode = false;
let featureFlags = {
  registration: true,
  messaging: true,
  listings: true,
  marketplace: true,
  analytics: true,
};

export function getMaintenanceMode() {
  return maintenanceMode;
}

export function setMaintenanceMode(v) {
  maintenanceMode = v;
}

export function getFeatureFlags() {
  return { ...featureFlags };
}

export function setFeatureFlags(f) {
  featureFlags = { ...featureFlags, ...f };
}
