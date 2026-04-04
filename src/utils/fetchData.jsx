export const exerciseOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY_2,
    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
  },
};

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
    "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY_2,
  },
};

export const fetchData = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 429) {
      console.warn(`Rate limited while fetching ${url}`);
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
