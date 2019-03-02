curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=1503277849" > data/SG.csv
curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=2137214531" > data/SMRT.csv
curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=819371872" > data/SBST.csv
curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=1534016276" > data/TIBS.csv

./sync.sh
node load.js
node svcs.js
