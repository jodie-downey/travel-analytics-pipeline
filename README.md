# Travel Analytics Pipeline

[repository](https://github.com/jodie-downey/travel-analytics-pipeline)

A JavaScript project that demonstrates asynchronous data processing, grouping, and aggregation using mock booking and destination datasets — inspired by the Wanderlog engineering interview challenge.

## Features

Reads and merges two datasets: bookingData and destinationData

Enriches bookings with region and popularity data using a Map lookup

Groups data by traveler and region

Calculates:

Total bookings and spending per traveler

Total regional visits, spending, and unique traveler counts

Sorts all bookings by popularity score and cost

Exports clean JSON and CSV reports for analysis or visualization

Demonstrates use of Node’s fs module for file I/O

### Tech Stack

Language: JavaScript (ES Modules)

Runtime: Node.js v22+

Core modules: fs, path

Data structures: Arrays, Maps, Sets

Output formats: JSON and CSV

#### Output Files

All generated in the /out folder:

File Description
travelerSummary.json / .csv Total bookings and spending per traveler
regionSummary.json / .csv Total spending and distinct travelers per region
bookingsSorted.json / .csv Enriched detailed bookings sorted by popularity and cost
finalOutput.json Combined JSON of all summaries
🚀 How to Run
node main.js

All data is regenerated on each run.

##### Skills Demonstrated

Asynchronous programming fundamentals

Data transformation and enrichment

Efficient grouping using Maps and Sets

Multi-level sorting

File writing (JSON and CSV formats)

Clean functional code organization

🧾 Example Output (Region Summary)
region totalRegionalSpent uniqueTravelers
Europe 15,500 12
North America 9,400 8
Asia 7,800 10

###### Author

Jodie Downey
Building Scalable Web Solutions that Enhance User Experience
📍 Kentucky, USA
[repository](https://github.com/jodie-downey/travel-analytics-pipeline)
