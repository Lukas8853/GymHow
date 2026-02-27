export const exerciseOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY_2,
    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
  },
};
console.log(import.meta.env.VITE_RAPID_API_KEY_2);

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
  const data = await response.json();

  return data;
};
