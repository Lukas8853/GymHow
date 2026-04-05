const RAPID_API_KEY =
  import.meta.env.VITE_RAPID_API_KEY ||
  import.meta.env.VITE_RAPID_API_KEY_2 ||
  import.meta.env.VITE_RAPID_API_KEY_3 ||
  "";

export const exerciseOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": RAPID_API_KEY,
    "x-rapidapi-host": "exercises11.p.rapidapi.com",
  },
};

export const animationOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": RAPID_API_KEY,
    "x-rapidapi-host": "exercises11.p.rapidapi.com",
  },
};

export const EXERCISES11_BASE_URL = "https://exercises11.p.rapidapi.com";
export const EXERCISES_CACHE_KEY = "exercises_all_alphabet_v5";
export const BODYPARTS_CACHE_KEY = "bodyParts_v2";

const safeParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const readCachedJson = (key, fallback = null) => {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) {
    return fallback;
  }

  const parsedValue = safeParseJson(storedValue);
  return parsedValue === null ? fallback : parsedValue;
};

export const writeCachedJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to cache ${key}:`, error);
  }
};

export const youtubeOptions = {
  method: "GET",
  url: "https://youtube-search-and-download.p.rapidapi.com/video/related",
  headers: {
    "x-rapidapi-host": "youtube-search-and-download.p.rapidapi.com",
    "x-rapidapi-key": RAPID_API_KEY,
  },
};

export const fetchData = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 429) {
      return null;
    }

    if (response.status === 403) {
      console.warn(
        `RapidAPI key is not authorized for this endpoint: ${url}. Check VITE_RAPID_API_KEY in .env.`,
      );
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const data = await response.json();

  return data;
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const normalizeId = (exercise) => {
  const candidate =
    exercise?.id ??
    exercise?.exerciseId ??
    exercise?.exercise_id ??
    exercise?._id ??
    exercise?.uuid;

  if (candidate === undefined || candidate === null) {
    return "";
  }

  return String(candidate).trim();
};

const animationIdFromExerciseId = (exerciseId) => {
  const cleanId = String(exerciseId || "").trim();
  if (!cleanId) {
    return "";
  }

  if (/^\d+$/.test(cleanId)) {
    return cleanId.padStart(4, "0");
  }

  return cleanId;
};

export const getExerciseAnimationUrl = (exerciseId) => {
  const animationId = animationIdFromExerciseId(exerciseId);
  if (!animationId) {
    return "";
  }

  return `${EXERCISES11_BASE_URL}/images/${animationId}.gif`;
};

const animationBlobUrlCache = new Map();
const animationRequestCache = new Map();
const animationFailedCache = new Set();

export const fetchExerciseAnimationBlobUrl = async (exerciseId) => {
  const cacheKey = String(exerciseId || "").trim();
  if (!cacheKey) {
    return null;
  }

  if (animationBlobUrlCache.has(cacheKey)) {
    return animationBlobUrlCache.get(cacheKey);
  }

  if (animationFailedCache.has(cacheKey)) {
    return null;
  }

  if (animationRequestCache.has(cacheKey)) {
    return animationRequestCache.get(cacheKey);
  }

  const animationUrl = getExerciseAnimationUrl(cacheKey);
  if (!animationUrl) {
    return null;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(animationUrl, animationOptions);
      if (!response.ok) {
        animationFailedCache.add(cacheKey);
        return null;
      }

      const blob = await response.blob();
      if (!blob || !blob.type.startsWith("image/")) {
        animationFailedCache.add(cacheKey);
        return null;
      }

      const blobUrl = URL.createObjectURL(blob);
      animationBlobUrlCache.set(cacheKey, blobUrl);
      return blobUrl;
    } catch {
      animationFailedCache.add(cacheKey);
      return null;
    } finally {
      animationRequestCache.delete(cacheKey);
    }
  })();

  animationRequestCache.set(cacheKey, requestPromise);
  return requestPromise;
};

const normalizeExercise = (exercise) => {
  const id = normalizeId(exercise);

  const name =
    exercise?.name ??
    exercise?.exercise ??
    exercise?.title ??
    exercise?.value ??
    "";
  const bodyPart =
    exercise?.bodyPart ??
    exercise?.body_part ??
    exercise?.bodypart ??
    exercise?.muscleGroup ??
    exercise?.muscle_group ??
    "";
  const target =
    exercise?.target ??
    exercise?.targetMuscle ??
    exercise?.target_muscle ??
    exercise?.muscle ??
    "";
  const equipment =
    exercise?.equipment ??
    exercise?.equipmentType ??
    exercise?.equipment_type ??
    "body weight";

  const rawGifUrl =
    exercise?.gifUrl ??
    exercise?.gif ??
    exercise?.image ??
    exercise?.animation ??
    "";
  const gifUrl =
    typeof rawGifUrl === "string" && /^https?:\/\//i.test(rawGifUrl)
      ? rawGifUrl
      : getExerciseAnimationUrl(id);

  return {
    ...exercise,
    id,
    name: String(name || "").trim(),
    bodyPart: String(bodyPart || "")
      .trim()
      .toLowerCase(),
    target: String(target || "")
      .trim()
      .toLowerCase(),
    equipment: String(equipment || "")
      .trim()
      .toLowerCase(),
    gifUrl,
    instructions: normalizeList(exercise?.instructions),
  };
};

export const normalizeExercisesResponse = (data) => {
  const sourceList = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.exercises)
          ? data.exercises
          : [];

  const normalized = sourceList
    .map((item) => normalizeExercise(item))
    .filter((item) => item.id && item.name);

  const dedupedById = new Map();
  normalized.forEach((exercise) => {
    if (!dedupedById.has(exercise.id)) {
      dedupedById.set(exercise.id, exercise);
    }
  });

  return Array.from(dedupedById.values());
};

export const fetchAllExercises = async () => {
  const data = await fetchData(
    `${EXERCISES11_BASE_URL}/data.json`,
    exerciseOptions,
  );
  return normalizeExercisesResponse(data);
};

export const filterExercisesByQuery = (exercises, query) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return Array.isArray(exercises) ? exercises : [];
  }

  if (!Array.isArray(exercises)) {
    return [];
  }

  return exercises.filter((exercise) => {
    const name = normalizeText(exercise?.name);

    if (normalizedQuery.length === 1) {
      return name.startsWith(normalizedQuery);
    }

    const searchable = [
      exercise?.name,
      exercise?.target,
      exercise?.equipment,
      exercise?.bodyPart,
    ]
      .map((value) => normalizeText(value))
      .join(" ");

    return searchable.includes(normalizedQuery);
  });
};

export const getBodyPartsFromExercises = (exercises) => {
  if (!Array.isArray(exercises)) {
    return [];
  }

  return Array.from(
    new Set(
      exercises
        .map((exercise) => normalizeText(exercise?.bodyPart))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
};

export const findExerciseById = (exercises, id) => {
  if (!Array.isArray(exercises)) {
    return null;
  }

  const targetId = String(id || "").trim();
  if (!targetId) {
    return null;
  }

  return (
    exercises.find((exercise) => String(exercise?.id || "") === targetId) ||
    null
  );
};
