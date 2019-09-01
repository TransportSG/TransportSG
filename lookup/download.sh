curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=1503277849" > data/SG.csv
curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=2137214531" > data/SMRT.csv
curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=819371872" > data/SBST.csv
curl "https://docs.google.com/spreadsheets/u/1/d/1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs/export?format=csv&id=1GCRG9OhR8A7pqYUUTm42-RW0VX-9_g0nNH-NB9WdARs&gid=1534016276" > data/TIBS.csv

curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1276928138" > data/PA.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1216385463" > data/PC.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1118081745" > data/PD.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1885202379" > data/PH.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1531514622" > data/PZ.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=199506525" > data/SH.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1649578794" > data/RU.csv
curl "https://docs.google.com/spreadsheets/u/1/d/13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A/export?format=csv&id=13c7WAhrzQ4g2MUgVcNk4a2h05b91RWpG5ras7fL5G-A&gid=1415588182" > data/CB.csv

node load.js
node svcs.js
