export const parseListInput = (value) => {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => String(item).trim().toLowerCase())
        .filter(Boolean);
    }

    return value
      .split(",")
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);
  }

  return null;
};