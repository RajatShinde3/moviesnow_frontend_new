// app/(protected)/home/page.tsx
"use client";

/**
 * =============================================================================
 * Home Page - Ultra Modern Design Showcase
 * =============================================================================
 * Best practices: Clean sections, professional icons, comprehensive content
 */

import * as React from "react";
import { UltraHeroSection } from "@/components/ui/UltraHeroSection";
import { UltraContentRow } from "@/components/ui/UltraContentRow";
import { HeroSkeleton, ContentRowSkeleton } from "@/components/ui/LoadingStates";

// Demo data for showcase
const demoHeroContent = {
  title: "The Dark Knight",
  slug: "the-dark-knight",
  description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  backdrop: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
  rating: 9.0,
  year: 2008,
  genres: ["Action", "Crime", "Drama", "Thriller"],
};

const demoTrendingMovies = [
  {
    id: "1",
    title: "Inception",
    slug: "inception",
    thumbnail: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    type: "MOVIE" as const,
    rating: 8.8,
    year: 2010,
    duration: "2h 28m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "2",
    title: "Interstellar",
    slug: "interstellar",
    thumbnail: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    type: "MOVIE" as const,
    rating: 8.6,
    year: 2014,
    duration: "2h 49m",
    quality: "4K" as const,
  },
  {
    id: "3",
    title: "The Matrix",
    slug: "the-matrix",
    thumbnail: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    type: "MOVIE" as const,
    rating: 8.7,
    year: 1999,
    duration: "2h 16m",
    quality: "HD" as const,
  },
  {
    id: "4",
    title: "Parasite",
    slug: "parasite",
    thumbnail: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    type: "MOVIE" as const,
    rating: 8.5,
    year: 2019,
    duration: "2h 12m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "5",
    title: "Pulp Fiction",
    slug: "pulp-fiction",
    thumbnail: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    type: "MOVIE" as const,
    rating: 8.9,
    year: 1994,
    duration: "2h 34m",
    quality: "HD" as const,
  },
  {
    id: "6",
    title: "The Shawshank Redemption",
    slug: "shawshank-redemption",
    thumbnail: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    type: "MOVIE" as const,
    rating: 9.3,
    year: 1994,
    duration: "2h 22m",
    quality: "HD" as const,
  },
  {
    id: "7",
    title: "Fight Club",
    slug: "fight-club",
    thumbnail: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    type: "MOVIE" as const,
    rating: 8.8,
    year: 1999,
    duration: "2h 19m",
    quality: "HD" as const,
  },
  {
    id: "8",
    title: "Forrest Gump",
    slug: "forrest-gump",
    thumbnail: "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
    type: "MOVIE" as const,
    rating: 8.8,
    year: 1994,
    duration: "2h 22m",
    quality: "HD" as const,
  },
  {
    id: "9",
    title: "Oppenheimer",
    slug: "oppenheimer",
    thumbnail: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    type: "MOVIE" as const,
    rating: 8.4,
    year: 2023,
    duration: "3h 0m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "10",
    title: "Dune: Part Two",
    slug: "dune-part-two",
    thumbnail: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    type: "MOVIE" as const,
    rating: 8.6,
    year: 2024,
    duration: "2h 46m",
    quality: "4K" as const,
    isNew: true,
  },
];

const demoPopularSeries = [
  {
    id: "10",
    title: "Breaking Bad",
    slug: "breaking-bad",
    thumbnail: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    type: "SERIES" as const,
    rating: 9.5,
    year: 2008,
    duration: "5 Seasons",
    quality: "4K" as const,
    progress: 65,
  },
  {
    id: "11",
    title: "Stranger Things",
    slug: "stranger-things",
    thumbnail: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    type: "SERIES" as const,
    rating: 8.7,
    year: 2016,
    duration: "4 Seasons",
    quality: "4K" as const,
    isNew: true,
    inWatchlist: true,
  },
  {
    id: "12",
    title: "The Crown",
    slug: "the-crown",
    thumbnail: "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
    type: "SERIES" as const,
    rating: 8.6,
    year: 2016,
    duration: "6 Seasons",
    quality: "4K" as const,
  },
  {
    id: "13",
    title: "The Witcher",
    slug: "the-witcher",
    thumbnail: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    type: "SERIES" as const,
    rating: 8.2,
    year: 2019,
    duration: "3 Seasons",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "14",
    title: "Game of Thrones",
    slug: "game-of-thrones",
    thumbnail: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    type: "SERIES" as const,
    rating: 9.3,
    year: 2011,
    duration: "8 Seasons",
    quality: "4K" as const,
  },
  {
    id: "15",
    title: "The Mandalorian",
    slug: "the-mandalorian",
    thumbnail: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    type: "SERIES" as const,
    rating: 8.7,
    year: 2019,
    duration: "3 Seasons",
    quality: "4K" as const,
  },
  {
    id: "16",
    title: "The Last of Us",
    slug: "the-last-of-us",
    thumbnail: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    type: "SERIES" as const,
    rating: 8.8,
    year: 2023,
    duration: "1 Season",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "17",
    title: "House of the Dragon",
    slug: "house-of-the-dragon",
    thumbnail: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    type: "SERIES" as const,
    rating: 8.5,
    year: 2022,
    duration: "2 Seasons",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "18",
    title: "Wednesday",
    slug: "wednesday",
    thumbnail: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    type: "SERIES" as const,
    rating: 8.1,
    year: 2022,
    duration: "1 Season",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "19",
    title: "The Boys",
    slug: "the-boys",
    thumbnail: "https://image.tmdb.org/t/p/w500/stTEycfG9928HYGEISBFaG1ngjM.jpg",
    type: "SERIES" as const,
    rating: 8.7,
    year: 2019,
    duration: "4 Seasons",
    quality: "4K" as const,
  },
];

const demoAnime = [
  {
    id: "20",
    title: "Attack on Titan",
    slug: "attack-on-titan",
    thumbnail: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    type: "ANIME" as const,
    rating: 9.0,
    year: 2013,
    duration: "4 Seasons",
    quality: "HD" as const,
  },
  {
    id: "21",
    title: "Death Note",
    slug: "death-note",
    thumbnail: "https://image.tmdb.org/t/p/w500/8RKBHHRqOMCLAGdSJUdyhBVLDAl.jpg",
    type: "ANIME" as const,
    rating: 9.0,
    year: 2006,
    duration: "1 Season",
    quality: "HD" as const,
  },
  {
    id: "22",
    title: "One Punch Man",
    slug: "one-punch-man",
    thumbnail: "https://image.tmdb.org/t/p/w500/iE3s0lG5QVdEHOEZnoAxjmMtvne.jpg",
    type: "ANIME" as const,
    rating: 8.8,
    year: 2015,
    duration: "2 Seasons",
    quality: "HD" as const,
    isNew: true,
  },
  {
    id: "23",
    title: "Demon Slayer",
    slug: "demon-slayer",
    thumbnail: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    type: "ANIME" as const,
    rating: 8.7,
    year: 2019,
    duration: "3 Seasons",
    quality: "HD" as const,
    isNew: true,
  },
  {
    id: "24",
    title: "My Hero Academia",
    slug: "my-hero-academia",
    thumbnail: "https://image.tmdb.org/t/p/w500/fvSiMKN0Ea0YQZMtU0DDjtmLdap.jpg",
    type: "ANIME" as const,
    rating: 8.4,
    year: 2016,
    duration: "6 Seasons",
    quality: "HD" as const,
  },
  {
    id: "25",
    title: "Naruto Shippuden",
    slug: "naruto-shippuden",
    thumbnail: "https://image.tmdb.org/t/p/w500/zAYRe2bJxpWTVrwwmBc00VFkAf4.jpg",
    type: "ANIME" as const,
    rating: 8.7,
    year: 2007,
    duration: "21 Seasons",
    quality: "HD" as const,
  },
  {
    id: "26",
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    thumbnail: "https://image.tmdb.org/t/p/w500/9xeEGZZsl6V8FXHqhsHXfBxEhoS.jpg",
    type: "ANIME" as const,
    rating: 8.6,
    year: 2020,
    duration: "2 Seasons",
    quality: "HD" as const,
    isNew: true,
  },
  {
    id: "27",
    title: "Fullmetal Alchemist",
    slug: "fullmetal-alchemist",
    thumbnail: "https://image.tmdb.org/t/p/w500/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg",
    type: "ANIME" as const,
    rating: 9.1,
    year: 2009,
    duration: "1 Season",
    quality: "HD" as const,
  },
  {
    id: "28",
    title: "Spy x Family",
    slug: "spy-x-family",
    thumbnail: "https://image.tmdb.org/t/p/w500/vxZF4pmj4GG5psPQnbAqxPu7ZG2.jpg",
    type: "ANIME" as const,
    rating: 8.6,
    year: 2022,
    duration: "2 Seasons",
    quality: "HD" as const,
    isNew: true,
  },
  {
    id: "29",
    title: "Steins;Gate",
    slug: "steins-gate",
    thumbnail: "https://image.tmdb.org/t/p/w500/3RPAY83sW8FqWr5ZBedJGSF5b9N.jpg",
    type: "ANIME" as const,
    rating: 9.1,
    year: 2011,
    duration: "1 Season",
    quality: "HD" as const,
  },
];

const demoActionMovies = [
  {
    id: "30",
    title: "John Wick",
    slug: "john-wick",
    thumbnail: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    type: "MOVIE" as const,
    rating: 7.4,
    year: 2014,
    duration: "1h 41m",
    quality: "4K" as const,
  },
  {
    id: "31",
    title: "Mad Max: Fury Road",
    slug: "mad-max-fury-road",
    thumbnail: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    type: "MOVIE" as const,
    rating: 8.1,
    year: 2015,
    duration: "2h 0m",
    quality: "4K" as const,
  },
  {
    id: "32",
    title: "Gladiator",
    slug: "gladiator",
    thumbnail: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    type: "MOVIE" as const,
    rating: 8.5,
    year: 2000,
    duration: "2h 35m",
    quality: "HD" as const,
  },
  {
    id: "33",
    title: "The Avengers",
    slug: "the-avengers",
    thumbnail: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    type: "MOVIE" as const,
    rating: 8.0,
    year: 2012,
    duration: "2h 23m",
    quality: "4K" as const,
  },
  {
    id: "34",
    title: "Spider-Man: No Way Home",
    slug: "spider-man-no-way-home",
    thumbnail: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    type: "MOVIE" as const,
    rating: 8.2,
    year: 2021,
    duration: "2h 28m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "35",
    title: "Top Gun: Maverick",
    slug: "top-gun-maverick",
    thumbnail: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    type: "MOVIE" as const,
    rating: 8.3,
    year: 2022,
    duration: "2h 11m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "36",
    title: "Mission: Impossible",
    slug: "mission-impossible",
    thumbnail: "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
    type: "MOVIE" as const,
    rating: 7.9,
    year: 2023,
    duration: "2h 43m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "37",
    title: "The Batman",
    slug: "the-batman",
    thumbnail: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    type: "MOVIE" as const,
    rating: 7.8,
    year: 2022,
    duration: "2h 56m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "38",
    title: "Avatar: The Way of Water",
    slug: "avatar-the-way-of-water",
    thumbnail: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    type: "MOVIE" as const,
    rating: 7.7,
    year: 2022,
    duration: "3h 12m",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "39",
    title: "Everything Everywhere All at Once",
    slug: "everything-everywhere-all-at-once",
    thumbnail: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    type: "MOVIE" as const,
    rating: 8.0,
    year: 2022,
    duration: "2h 19m",
    quality: "4K" as const,
    isNew: true,
  },
];

const demoComedySeries = [
  {
    id: "40",
    title: "The Office",
    slug: "the-office",
    thumbnail: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
    type: "SERIES" as const,
    rating: 9.0,
    year: 2005,
    duration: "9 Seasons",
    quality: "HD" as const,
  },
  {
    id: "41",
    title: "Friends",
    slug: "friends",
    thumbnail: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
    type: "SERIES" as const,
    rating: 8.9,
    year: 1994,
    duration: "10 Seasons",
    quality: "HD" as const,
  },
  {
    id: "42",
    title: "Brooklyn Nine-Nine",
    slug: "brooklyn-nine-nine",
    thumbnail: "https://image.tmdb.org/t/p/w500/hgRMSOt7a1ujUyJpa5YL4nnIyJH.jpg",
    type: "SERIES" as const,
    rating: 8.4,
    year: 2013,
    duration: "8 Seasons",
    quality: "HD" as const,
  },
  {
    id: "43",
    title: "The Big Bang Theory",
    slug: "the-big-bang-theory",
    thumbnail: "https://image.tmdb.org/t/p/w500/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg",
    type: "SERIES" as const,
    rating: 8.1,
    year: 2007,
    duration: "12 Seasons",
    quality: "HD" as const,
  },
  {
    id: "44",
    title: "Parks and Recreation",
    slug: "parks-and-recreation",
    thumbnail: "https://image.tmdb.org/t/p/w500/dDuzrl9rUIBYieZjqmtNCdncrmZ.jpg",
    type: "SERIES" as const,
    rating: 8.6,
    year: 2009,
    duration: "7 Seasons",
    quality: "HD" as const,
  },
  {
    id: "45",
    title: "How I Met Your Mother",
    slug: "how-i-met-your-mother",
    thumbnail: "https://image.tmdb.org/t/p/w500/b34jPzmB0wZy7EjUZoleXOl2RRI.jpg",
    type: "SERIES" as const,
    rating: 8.3,
    year: 2005,
    duration: "9 Seasons",
    quality: "HD" as const,
  },
  {
    id: "46",
    title: "Ted Lasso",
    slug: "ted-lasso",
    thumbnail: "https://image.tmdb.org/t/p/w500/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg",
    type: "SERIES" as const,
    rating: 8.8,
    year: 2020,
    duration: "3 Seasons",
    quality: "4K" as const,
    isNew: true,
  },
  {
    id: "47",
    title: "Schitt's Creek",
    slug: "schitts-creek",
    thumbnail: "https://image.tmdb.org/t/p/w500/iRfSzrPS5VYWQv7KVSEg2BZZL6C.jpg",
    type: "SERIES" as const,
    rating: 8.5,
    year: 2015,
    duration: "6 Seasons",
    quality: "HD" as const,
  },
  {
    id: "48",
    title: "Modern Family",
    slug: "modern-family",
    thumbnail: "https://image.tmdb.org/t/p/w500/klL4yhwiU8aF4AuF5dCfJA9sRnS.jpg",
    type: "SERIES" as const,
    rating: 8.5,
    year: 2009,
    duration: "11 Seasons",
    quality: "HD" as const,
  },
  {
    id: "49",
    title: "Community",
    slug: "community",
    thumbnail: "https://image.tmdb.org/t/p/w500/3KUjDt8XY7w2Ku70UE0SECmv1zP.jpg",
    type: "SERIES" as const,
    rating: 8.5,
    year: 2009,
    duration: "6 Seasons",
    quality: "HD" as const,
  },
];

const demoDocumentaries = [
  {
    id: "50",
    title: "Planet Earth II",
    slug: "planet-earth-ii",
    thumbnail: "https://image.tmdb.org/t/p/w500/eVuftxSPXKNMCa87IbHfQhMu8vj.jpg",
    type: "DOCUMENTARY" as const,
    rating: 9.5,
    year: 2016,
    duration: "6 Episodes",
    quality: "4K" as const,
  },
  {
    id: "51",
    title: "Blue Planet II",
    slug: "blue-planet-ii",
    thumbnail: "https://image.tmdb.org/t/p/w500/8kRJbGTpX6EZRWJYJdaNpuNWQnV.jpg",
    type: "DOCUMENTARY" as const,
    rating: 9.3,
    year: 2017,
    duration: "7 Episodes",
    quality: "4K" as const,
  },
  {
    id: "52",
    title: "Our Planet",
    slug: "our-planet",
    thumbnail: "https://image.tmdb.org/t/p/w500/3ctbcb9XFAdKnKU1wGVRwHtbzN4.jpg",
    type: "DOCUMENTARY" as const,
    rating: 9.2,
    year: 2019,
    duration: "8 Episodes",
    quality: "4K" as const,
  },
  {
    id: "53",
    title: "The Last Dance",
    slug: "the-last-dance",
    thumbnail: "https://image.tmdb.org/t/p/w500/fq8YufFq2gYlVJfJHJwo5PMLRJr.jpg",
    type: "DOCUMENTARY" as const,
    rating: 9.1,
    year: 2020,
    duration: "10 Episodes",
    quality: "4K" as const,
  },
  {
    id: "54",
    title: "Making a Murderer",
    slug: "making-a-murderer",
    thumbnail: "https://image.tmdb.org/t/p/w500/wwTbIz3YYm3gH0rfHHGfpzn4f9Y.jpg",
    type: "DOCUMENTARY" as const,
    rating: 8.6,
    year: 2015,
    duration: "2 Seasons",
    quality: "HD" as const,
  },
  {
    id: "55",
    title: "The Social Dilemma",
    slug: "the-social-dilemma",
    thumbnail: "https://image.tmdb.org/t/p/w500/4uCRjSP4evZjwiuVWCDg6Wfk0pY.jpg",
    type: "DOCUMENTARY" as const,
    rating: 7.6,
    year: 2020,
    duration: "1h 34m",
    quality: "4K" as const,
  },
  {
    id: "56",
    title: "Cosmos",
    slug: "cosmos",
    thumbnail: "https://image.tmdb.org/t/p/w500/4WJ9kNejI8qzloWElikes4bsp4J.jpg",
    type: "DOCUMENTARY" as const,
    rating: 9.3,
    year: 2014,
    duration: "3 Seasons",
    quality: "4K" as const,
  },
  {
    id: "57",
    title: "Free Solo",
    slug: "free-solo",
    thumbnail: "https://image.tmdb.org/t/p/w500/v4QfYZMACODlWul9doN9RxE99ag.jpg",
    type: "DOCUMENTARY" as const,
    rating: 8.2,
    year: 2018,
    duration: "1h 40m",
    quality: "4K" as const,
  },
  {
    id: "58",
    title: "13th",
    slug: "13th",
    thumbnail: "https://image.tmdb.org/t/p/w500/sNW4zeD7wb2xKe13kH8sBd8mq3k.jpg",
    type: "DOCUMENTARY" as const,
    rating: 8.2,
    year: 2016,
    duration: "1h 40m",
    quality: "4K" as const,
  },
  {
    id: "59",
    title: "Won't You Be My Neighbor?",
    slug: "wont-you-be-my-neighbor",
    thumbnail: "https://image.tmdb.org/t/p/w500/2JPayD88LGM2RwtU5ZLnFjUZx6T.jpg",
    type: "DOCUMENTARY" as const,
    rating: 8.4,
    year: 2018,
    duration: "1h 34m",
    quality: "4K" as const,
  },
];

const demoSciFiMovies = [
  {
    id: "60",
    title: "Blade Runner 2049",
    slug: "blade-runner-2049",
    thumbnail: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    type: "MOVIE" as const,
    rating: 8.0,
    year: 2017,
    duration: "2h 44m",
    quality: "4K" as const,
  },
  {
    id: "61",
    title: "Arrival",
    slug: "arrival",
    thumbnail: "https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    type: "MOVIE" as const,
    rating: 7.9,
    year: 2016,
    duration: "1h 56m",
    quality: "4K" as const,
  },
  {
    id: "62",
    title: "Ex Machina",
    slug: "ex-machina",
    thumbnail: "https://image.tmdb.org/t/p/w500/btTbkY9e2LLa6pSlRKLZQFgf0wO.jpg",
    type: "MOVIE" as const,
    rating: 7.7,
    year: 2014,
    duration: "1h 48m",
    quality: "4K" as const,
  },
  {
    id: "63",
    title: "2001: A Space Odyssey",
    slug: "2001-a-space-odyssey",
    thumbnail: "https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg",
    type: "MOVIE" as const,
    rating: 8.3,
    year: 1968,
    duration: "2h 29m",
    quality: "HD" as const,
  },
  {
    id: "64",
    title: "The Martian",
    slug: "the-martian",
    thumbnail: "https://image.tmdb.org/t/p/w500/5BHuvQ6p9kfc091Z8RiFNhCwL4b.jpg",
    type: "MOVIE" as const,
    rating: 7.9,
    year: 2015,
    duration: "2h 24m",
    quality: "4K" as const,
  },
  {
    id: "65",
    title: "Gravity",
    slug: "gravity",
    thumbnail: "https://image.tmdb.org/t/p/w500/2IRjbi9cADuDMKmHdLK9qqSWt7g.jpg",
    type: "MOVIE" as const,
    rating: 7.7,
    year: 2013,
    duration: "1h 31m",
    quality: "4K" as const,
  },
  {
    id: "66",
    title: "Tenet",
    slug: "tenet",
    thumbnail: "https://image.tmdb.org/t/p/w500/k68nPLbIST6NP96JmTxmZijEvCA.jpg",
    type: "MOVIE" as const,
    rating: 7.4,
    year: 2020,
    duration: "2h 30m",
    quality: "4K" as const,
  },
  {
    id: "67",
    title: "District 9",
    slug: "district-9",
    thumbnail: "https://image.tmdb.org/t/p/w500/c1udKfKcCfHPyIIIqJaL3OXe2B.jpg",
    type: "MOVIE" as const,
    rating: 7.9,
    year: 2009,
    duration: "1h 52m",
    quality: "HD" as const,
  },
  {
    id: "68",
    title: "Edge of Tomorrow",
    slug: "edge-of-tomorrow",
    thumbnail: "https://image.tmdb.org/t/p/w500/tpoVEYvm6qcXueZrQYJNRLXL88s.jpg",
    type: "MOVIE" as const,
    rating: 7.9,
    year: 2014,
    duration: "1h 53m",
    quality: "4K" as const,
  },
  {
    id: "69",
    title: "Her",
    slug: "her",
    thumbnail: "https://image.tmdb.org/t/p/w500/eCOtqtfvN7T7a2DhcDXO5Y2gall.jpg",
    type: "MOVIE" as const,
    rating: 8.0,
    year: 2013,
    duration: "2h 6m",
    quality: "HD" as const,
  },
];

const demoCrimeThrillers = [
  {
    id: "70",
    title: "The Godfather",
    slug: "the-godfather",
    thumbnail: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    type: "MOVIE" as const,
    rating: 9.2,
    year: 1972,
    duration: "2h 55m",
    quality: "HD" as const,
  },
  {
    id: "71",
    title: "Se7en",
    slug: "seven",
    thumbnail: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg",
    type: "MOVIE" as const,
    rating: 8.6,
    year: 1995,
    duration: "2h 7m",
    quality: "HD" as const,
  },
  {
    id: "72",
    title: "The Silence of the Lambs",
    slug: "the-silence-of-the-lambs",
    thumbnail: "https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",
    type: "MOVIE" as const,
    rating: 8.6,
    year: 1991,
    duration: "1h 58m",
    quality: "HD" as const,
  },
  {
    id: "73",
    title: "Gone Girl",
    slug: "gone-girl",
    thumbnail: "https://image.tmdb.org/t/p/w500/lv5xShBIDPe7m4ufdlV0IAc7Avk.jpg",
    type: "MOVIE" as const,
    rating: 8.1,
    year: 2014,
    duration: "2h 29m",
    quality: "4K" as const,
  },
  {
    id: "74",
    title: "Zodiac",
    slug: "zodiac",
    thumbnail: "https://image.tmdb.org/t/p/w500/zXSpxc7M5fellCTxXoUhfrRfLXz.jpg",
    type: "MOVIE" as const,
    rating: 7.7,
    year: 2007,
    duration: "2h 37m",
    quality: "HD" as const,
  },
  {
    id: "75",
    title: "Prisoners",
    slug: "prisoners",
    thumbnail: "https://image.tmdb.org/t/p/w500/tuaMPhMgOYRzJnYKvOoEQb1rNJk.jpg",
    type: "MOVIE" as const,
    rating: 8.1,
    year: 2013,
    duration: "2h 33m",
    quality: "4K" as const,
  },
  {
    id: "76",
    title: "Shutter Island",
    slug: "shutter-island",
    thumbnail: "https://image.tmdb.org/t/p/w500/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg",
    type: "MOVIE" as const,
    rating: 8.2,
    year: 2010,
    duration: "2h 18m",
    quality: "HD" as const,
  },
  {
    id: "77",
    title: "No Country for Old Men",
    slug: "no-country-for-old-men",
    thumbnail: "https://image.tmdb.org/t/p/w500/bj1v6YKF8yHqA489VFfnQvOJpnc.jpg",
    type: "MOVIE" as const,
    rating: 8.2,
    year: 2007,
    duration: "2h 2m",
    quality: "HD" as const,
  },
  {
    id: "78",
    title: "Heat",
    slug: "heat",
    thumbnail: "https://image.tmdb.org/t/p/w500/umSVjVdbVwtx5ryCA2QXL44Durz.jpg",
    type: "MOVIE" as const,
    rating: 8.3,
    year: 1995,
    duration: "2h 50m",
    quality: "HD" as const,
  },
  {
    id: "79",
    title: "Sicario",
    slug: "sicario",
    thumbnail: "https://image.tmdb.org/t/p/w500/kWFzvzZhn1rJJp6nM8NwPXR5z8R.jpg",
    type: "MOVIE" as const,
    rating: 7.6,
    year: 2015,
    duration: "2h 1m",
    quality: "4K" as const,
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate loading for demo
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <HeroSkeleton />
        <ContentRowSkeleton />
        <ContentRowSkeleton />
        <ContentRowSkeleton />
      </div>
    );
  }

  // Filter only new releases
  const newReleases = [...demoTrendingMovies, ...demoPopularSeries, ...demoActionMovies].filter(m => m.isNew);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black">
      {/* Hero Section */}
      <UltraHeroSection
        title={demoHeroContent.title}
        slug={demoHeroContent.slug}
        description={demoHeroContent.description}
        backdrop={demoHeroContent.backdrop}
        rating={demoHeroContent.rating}
        year={demoHeroContent.year}
        genres={demoHeroContent.genres}
      />

      {/* Content Rows - Content-Focused Layout */}
      <div className="relative z-10 -mt-32 space-y-12 pb-20">
        {/* Trending Now */}
        <UltraContentRow
          title="Trending Now"
          items={demoTrendingMovies}
          viewAllHref="/browse?sort=trending"
          cardSize="md"
        />

        {/* Popular Series */}
        <UltraContentRow
          title="Popular Series"
          items={demoPopularSeries}
          viewAllHref="/browse?type=SERIES"
          cardSize="md"
        />

        {/* Action & Adventure */}
        <UltraContentRow
          title="Action & Adventure"
          items={demoActionMovies}
          viewAllHref="/browse?genre=action"
          cardSize="md"
        />

        {/* Sci-Fi Masterpieces */}
        <UltraContentRow
          title="Sci-Fi Masterpieces"
          items={demoSciFiMovies}
          viewAllHref="/browse?genre=scifi"
          cardSize="md"
        />

        {/* Crime & Thrillers */}
        <UltraContentRow
          title="Crime & Thrillers"
          items={demoCrimeThrillers}
          viewAllHref="/browse?genre=crime"
          cardSize="md"
        />

        {/* New Releases */}
        <UltraContentRow
          title="New Releases"
          items={newReleases}
          viewAllHref="/browse?filter=new"
          cardSize="md"
        />
      </div>
    </div>
  );
}
