import fs from "fs";
import path from "path";

import { bookingData } from "./bookingData.js";
import { destinationData } from "./destinationData.js";

const OUT_DIR = path.resolve("out");
fs.mkdirSync(OUT_DIR, { recursive: true });

function writeJSON(filename, data) {
  const fullPath = path.join(OUT_DIR, filename);
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(fullPath, json, "utf8");
}

function escapeCSV(value) {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/[",\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toCSV(rows, headers) {
  const EOL = "\r\n";
  const headerLine = headers.map((h) => escapeCSV(h.label)).join(",") + EOL;
  const body =
    rows
      .map((row) => headers.map((h) => escapeCSV(row[h.key])).join(","))
      .join(EOL) + EOL;
  return "\uFEFF" + headerLine + body;
}

function writeCSV(filename, rows, headers) {
  const csv = toCSV(rows, headers);
  const fullPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(fullPath, csv, "utf8");
}

//Map of unique travelers by id. bookings=allBookings booking=eachInstance. if not there, create a new blank array
const groupedByTraveler = (bookings) => {
  const grouped = new Map();

  for (const booking of bookings) {
    const travelerId = booking.traveler_id;
    if (!grouped.has(travelerId)) {
      grouped.set(travelerId, []);
    }
    grouped.get(travelerId).push(booking);
  }
  return grouped;
};

const singleTraveler = groupedByTraveler(bookingData);

const travelerSummaries = Array.from(
  singleTraveler,
  ([travelerId, bookings]) => {
    const totalBookings = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + b.cost, 0);
    const averageCostPerBooking = totalSpent / bookings.length;

    return {
      travelerId,
      totalBookings,
      totalSpent,
      averageCostPerBooking,
    };
  }
);

//console.log(travelerSummaries);

const groupedByRegion = (bookings) => {
  const grouped = new Map();

  for (const booking of bookings) {
    const region = booking.region;

    if (!grouped.has(region)) {
      grouped.set(region, []);
    }
    grouped.get(region).push(booking);
  }
  return grouped;
};

const singleRegion = groupedByRegion(destinationData);

//combining logic from a single data set
const cityRegionGroup = (destinations) => {
  const cityRegionMap = new Map();

  for (const destination of destinations) {
    const city = destination.city;
    cityRegionMap.set(city, {
      region: destination.region,
      popularityScore: destination.popularity_score,
    });
  }
  return cityRegionMap;
};

const cityRegionalMap = cityRegionGroup(destinationData);

//console.log(cityRegionalMap);

//enrich (combine) data from multiple data sets, handle missing data
const travelerPlusDestination = (bookings, cityRegionalMap) => {
  return bookings.map((booking) => {
    const cityInfo = cityRegionalMap.get(booking.city);

    if (!cityInfo) {
      return { ...booking, region: "Unkownn", popularity_score: 0 };
    }

    return { ...booking, ...cityInfo };
  });
};

const travelersPlusDestination = travelerPlusDestination(
  bookingData,
  cityRegionalMap
);

console.log(travelersPlusDestination);

const groupTravelersByRegion = (bookings) => {
  const grouped = new Map();

  for (const booking of bookings) {
    const region = booking.region;

    if (!grouped.has(region)) {
      grouped.set(region, []);
    }

    grouped.get(region).push(booking);
  }
  return grouped;
};

const travelersGroupedByRegion = groupTravelersByRegion(
  travelersPlusDestination
);

//console.log(travelersGroupedByRegion);

//Set used here to count out unique Ids. Sets can only have one unqie value
const regionSummaries = Array.from(
  travelersGroupedByRegion,
  ([region, bookings]) => {
    const totalRegionalSpent = bookings.reduce(
      (sum, b) => sum + (b.cost || 0),
      0
    );

    const uniqueTravelersByRegion = new Set(bookings.map((b) => b.traveler_id))
      .size;

    return { region, totalRegionalSpent, uniqueTravelersByRegion };
  }
);

console.log(regionSummaries);

const popularityInDescending = travelersPlusDestination.toSorted(
  (a, b) => b.popularityScore - a.popularityScore || b.cost - a.cost
);

//alt to above const popularityInDescending = travelersPlusDestination.toSorted((a, b) => {
//    if (!b.popularityScore !== a.popularityScore) {
//      return b.popularityScore - a.popularityScore;
//    }
//    return b.cost - a.cost;
//  });

//console.log(popularityInDescending);

const finalOutput = {
  travelerSummary: travelerSummaries,
  regionalSummary: regionSummaries,
  detailedBookings: popularityInDescending,
};

writeJSON("travelerSummary.json", travelerSummaries);
writeJSON("regionSummary.json", regionSummaries);
writeJSON("bookingsSorted.json", popularityInDescending);

writeJSON("finalOutput.json", {
  travelerSummary: travelerSummaries,
  regionSummary: regionSummaries,
  detailedBookings: popularityInDescending,
});

writeCSV("travelerSummary.csv", travelerSummaries, [
  { key: "travelerId", label: "Traveler ID" },
  { key: "totalBookings", label: "Total Bookings" },
  { key: "totalSpent", label: "Total Spent" },
  { key: "averageCostPerBooking", label: "Avg Cost / Booking" },
]);

writeCSV("regionSummary.csv", regionSummaries, [
  { key: "region", label: "Region" },
  { key: "totalRegionalVisits", label: "Total Visits" },
  { key: "uniqueTravelers", label: "Unique Travelers" },
  { key: "totalRegionalSpent", label: "Total Spent" },
]);

writeCSV("bookingsSorted.csv", popularityInDescending, [
  { key: "booking_id", label: "Booking ID" },
  { key: "traveler_id", label: "Traveler ID" },
  { key: "city", label: "City" },
  { key: "region", label: "Region" },
  { key: "start_date", label: "Start Date" },
  { key: "end_date", label: "End Date" },
  { key: "cost", label: "Cost" },
  { key: "popularityScore", label: "Popularity Score" },
]);

//add timestamps
//// create timestamp string once per run
//const now = new Date().toISOString().replace(/[:.]/g, "-");
//
//// write files with timestamped names
//writeJSON(`travelerSummary-${now}.json`, travelerSummaries);
//writeJSON(`regionSummary-${now}.json`, regionSummaries);
//writeJSON(`bookingsSorted-${now}.json`, popularityInDescending);
//
//writeJSON(`finalOutput-${now}.json`, {
//  travelerSummary: travelerSummaries,
//  regionSummary: regionSummaries,
//  detailedBookings: popularityInDescending,
//});
