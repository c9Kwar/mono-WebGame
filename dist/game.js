'use strict';
// Hand-painted sheets are presentation only: stable game keys select independent cells.
const CREATURE_ATLAS={src:'art/mosslight-creatures.png',columns:4,rows:4,keys:['slime','mushroom','moth','snail','rabbit','eliteSlime','eliteMushroom','eliteMoth','eliteSnail','eliteRabbit','boss0','boss1','boss2','boss3','boss4','treasure']};
const EQUIPMENT_ATLAS={src:'art/mosslight-equipment.png',columns:6,rows:6,keys:['practiceblade','mossblade','acornblade','sunblade','groveblade','royalblade','tunic','scoutcoat','budcoat','owlcoat','guardiancoat','shellcoat','acorncoat','trousers','scoutlegs','guardianlegs','runelegs','boots','scoutboots','dewboots','windboots','moonboots','leaf','charm','ring','crown','foxring','crystal','amber','jadeorb','seed','blueprint','moss','spore','wing','medal']};
const MATERIAL_ART={jadeorb:'jadeorb',snailshell:'amber',budfluff:'moss',royalshell:'amber',runestone:'crystal',groveheart:'seed',moonfeather:'wing',acorniron:'amber',seal:'medal',stone_common:'crystal',stone_rare:'crystal',stone_epic:'crystal',stone_legendary:'crystal',stone_mythic:'crystal',skillstone:'jadeorb',dew:'jadeorb',cap:'spore',moonshard:'crystal',medal:'medal',moss:'moss',crystal:'crystal',dust:'wing',seed:'seed',core:'crystal',spore:'spore',wing:'wing',amber:'amber'};
// Square silhouette crops preserve paint edges and exclude neighboring figures.
const CREATURE_CROPS=[
 [22,22,286,"1.01% 86.83%,2.98% 62.72%,3.33% 60.94%,4.37% 57.74%,13.96% 30.98%,15.39% 28.14%,16.10% 27.42%,21.09% 23.13%,25.71% 20.97%,58.53% 6.48%,65.63% 4.76%,69.89% 4.08%,74.49% 4.10%,76.97% 4.47%,78.75% 5.18%,81.23% 6.60%,82.31% 8.37%,82.66% 9.07%,83.03% 10.13%,96.32% 62.73%,96.66% 64.86%,98.63% 87.20%,98.63% 87.55%,98.27% 88.97%,97.91% 89.67%,96.85% 90.74%,96.14% 91.10%,94.38% 91.47%,48.20% 95.63%,42.48% 95.61%,22.21% 94.41%,17.97% 94.02%,3.85% 91.44%,2.80% 91.08%,2.09% 90.72%,1.74% 90.37%,1.03% 89.30%"],
 [311,13,292,"94.35% 43.46%,94.35% 45.21%,90.30% 87.97%,76.75% 95.29%,76.05% 95.64%,75.01% 95.99%,54.49% 98.80%,52.75% 98.80%,39.52% 95.69%,38.13% 95.35%,37.08% 95.00%,35.69% 94.31%,33.94% 92.58%,16.36% 63.75%,5.99% 45.90%,5.65% 45.21%,5.65% 43.46%,9.49% 26.02%,9.84% 25.32%,18.15% 19.34%,32.81% 10.21%,33.51% 9.86%,37.70% 8.11%,38.75% 7.76%,41.20% 7.05%,63.92% 0.89%,67.75% 0.91%,68.80% 1.25%,69.50% 1.60%,72.99% 3.69%,73.34% 4.03%,75.09% 6.11%,91.59% 36.11%,92.28% 37.51%,93.66% 41.36%"],
 [615,0,327,"0.78% 30.42%,0.78% 30.11%,1.09% 29.80%,21.96% 19.20%,74.77% 7.51%,76.33% 7.21%,80.07% 7.23%,81.63% 7.55%,82.56% 7.86%,83.18% 8.17%,84.12% 8.79%,84.75% 9.41%,85.69% 11.26%,86.01% 12.18%,98.82% 64.01%,98.80% 65.87%,98.48% 67.11%,97.23% 69.60%,96.29% 71.15%,95.35% 72.40%,94.10% 73.65%,90.98% 76.45%,74.75% 90.05%,44.62% 90.90%,44.31% 90.90%,23.33% 90.46%,10.70% 86.70%"],
 [941,12,299,"16.38% 88.12%,7.19% 56.24%,0.89% 28.13%,0.90% 26.10%,1.57% 25.42%,49.56% 8.24%,50.58% 7.90%,51.95% 7.56%,75.78% 6.88%,77.82% 6.89%,79.86% 7.23%,80.20% 7.57%,87.45% 21.40%,90.91% 28.19%,96.77% 40.50%,97.11% 41.53%,97.80% 43.93%,98.48% 47.36%,98.83% 49.76%,98.58% 87.56%,98.23% 88.23%,97.55% 88.91%,95.51% 90.62%,94.15% 91.30%,92.80% 91.65%,82.96% 92.40%,66.93% 92.81%,54.64% 92.78%,34.94% 91.63%,18.07% 89.14%,17.06% 88.80%"],
 [3,301,316,"13.49% 53.24%,17.59% 17.70%,19.86% 12.92%,21.15% 11.01%,24.05% 7.19%,24.37% 6.87%,46.48% 0.79%,47.12% 0.79%,70.83% 4.32%,71.16% 4.64%,84.96% 70.06%,86.15% 82.95%,86.13% 85.20%,85.80% 87.13%,84.83% 89.38%,82.57% 91.64%,80.65% 92.94%,80.01% 93.26%,72.62% 95.89%,71.34% 96.22%,58.76% 98.23%,56.17% 98.56%,38.36% 98.85%,34.49% 98.83%,33.20% 98.50%,29.97% 97.20%,29.33% 96.87%,29.00% 96.55%,20.88% 85.27%,17.96% 79.45%,13.48% 54.21%"],
 [317,321,313,"0.90% 83.77%,4.38% 39.61%,4.71% 38.96%,11.54% 26.94%,15.46% 21.11%,24.58% 11.42%,25.55% 10.77%,38.85% 5.92%,39.18% 5.92%,42.10% 6.23%,62.22% 9.14%,62.87% 9.46%,79.45% 23.05%,79.78% 23.38%,90.22% 44.48%,98.82% 80.50%,98.80% 83.41%,98.16% 84.71%,96.87% 86.01%,94.94% 86.99%,79.79% 92.59%,77.85% 93.25%,76.55% 93.58%,73.32% 93.93%,70.41% 93.96%,18.34% 92.95%,16.72% 92.61%,15.75% 92.28%,2.52% 87.33%,1.88% 87.01%,1.56% 86.68%,0.91% 85.39%"],
 [607,305,316,"49.12% 2.69%,73.91% 8.55%,85.78% 17.60%,86.42% 18.24%,98.57% 38.84%,98.89% 39.80%,98.89% 42.05%,97.41% 92.94%,97.09% 93.58%,96.77% 93.90%,87.84% 96.82%,86.56% 97.14%,43.32% 97.31%,32.72% 96.34%,32.08% 95.70%,23.00% 81.69%,1.43% 41.08%,1.11% 40.43%,0.80% 39.47%,0.80% 38.82%,1.12% 37.21%,2.71% 33.99%,3.35% 33.02%,4.31% 31.73%,5.90% 30.11%,25.87% 10.71%,26.84% 10.06%,30.07% 8.45%,31.68% 7.80%,43.95% 3.01%,44.92% 2.69%"],
 [917,298,326,"98.76% 14.86%,98.76% 15.48%,97.66% 88.68%,97.35% 88.99%,96.73% 89.30%,95.48% 89.62%,71.86% 94.32%,45.43% 94.58%,45.12% 94.58%,20.67% 93.83%,13.24% 89.48%,0.79% 24.97%,0.79% 24.66%,1.40% 24.35%,29.15% 11.18%,30.08% 10.86%,82.22% 5.44%,85.33% 5.15%,87.51% 5.17%,89.07% 5.49%,91.87% 6.44%,93.74% 7.38%,94.05% 7.69%,94.99% 8.94%,98.44% 13.93%"],
 [12,606,309,"95.61% 42.23%,98.85% 60.66%,98.85% 62.97%,97.83% 72.16%,95.13% 87.23%,94.80% 87.89%,93.82% 88.87%,91.21% 89.54%,82.06% 90.92%,67.97% 92.00%,57.43% 92.38%,51.16% 92.39%,36.64% 92.03%,31.05% 91.67%,23.49% 90.64%,22.18% 90.30%,20.21% 89.31%,18.89% 87.99%,16.91% 85.04%,16.24% 83.73%,6.31% 53.43%,0.89% 28.13%,0.90% 26.82%,1.26% 20.93%,3.56% 16.34%,5.53% 13.71%,9.80% 9.45%,11.11% 8.79%,14.05% 7.79%,14.38% 7.79%,41.92% 7.94%,43.90% 8.26%,78.81% 14.25%,80.12% 14.58%,80.78% 14.91%,83.41% 17.55%,84.08% 18.53%,89.69% 27.41%,90.02% 28.07%"],
 [314,619,300,"90.59% 98.59%,13.50% 91.34%,12.82% 90.66%,12.48% 89.99%,5.50% 52.36%,5.50% 49.97%,5.83% 48.95%,15.08% 23.08%,18.54% 14.31%,21.26% 11.27%,26.03% 6.56%,34.19% 0.85%,70.06% 1.27%,70.40% 1.60%,93.83% 52.35%,94.30% 94.87%,94.29% 96.22%,93.27% 98.57%"],
 [611,610,317,"38.59% 14.38%,55.29% 7.42%,55.61% 7.42%,74.85% 14.15%,75.49% 14.47%,89.61% 28.58%,95.37% 37.24%,97.95% 54.88%,98.89% 63.53%,98.88% 65.45%,97.85% 82.09%,97.52% 83.68%,95.93% 85.60%,93.38% 86.90%,89.25% 88.20%,58.22% 91.94%,51.77% 92.59%,50.80% 92.59%,44.36% 92.26%,7.25% 87.22%,5.66% 86.57%,5.34% 86.25%,0.81% 45.26%,0.82% 42.38%,1.14% 40.46%,1.46% 39.18%,1.78% 38.22%,2.74% 37.25%,4.32% 35.97%,13.87% 29.19%"],
 [941,612,301,"10.52% 37.90%,19.65% 23.69%,19.99% 23.35%,23.03% 21.31%,35.89% 13.19%,49.09% 5.15%,49.43% 5.15%,59.57% 5.82%,61.26% 6.16%,62.27% 6.49%,64.30% 7.50%,71.08% 11.86%,72.09% 12.53%,73.79% 14.21%,76.86% 17.90%,82.98% 25.66%,88.75% 33.12%,95.18% 49.74%,95.51% 50.75%,98.49% 64.29%,98.81% 65.98%,98.79% 70.03%,97.73% 79.81%,97.38% 81.83%,94.99% 88.90%,94.31% 90.25%,93.64% 90.92%,92.63% 91.27%,82.22% 93.69%,79.53% 94.05%,64.00% 94.82%,56.54% 94.85%,11.01% 92.91%,9.00% 92.56%,5.65% 91.54%,4.65% 91.19%,3.31% 89.84%,2.63% 88.50%,0.90% 77.74%,0.87% 70.67%,1.19% 68.65%,1.84% 65.28%,6.15% 49.07%"],
 [0,882,358,"12.36% 96.03%,7.07% 8.14%,7.37% 4.77%,7.94% 3.37%,8.79% 1.96%,9.92% 0.83%,10.20% 0.83%,72.62% 4.38%,79.99% 11.42%,83.82% 34.53%,84.41% 38.21%,84.71% 40.20%,90.49% 88.71%,90.48% 89.83%,89.59% 97.15%,89.31% 97.43%,87.33% 98.01%,82.83% 98.32%,57.65% 99.01%,57.37% 99.01%,26.46% 98.37%,14.62% 98.01%,12.64% 96.31%"],
 [316,895,345,"7.70% 46.79%,10.30% 12.17%,10.90% 9.25%,12.09% 5.75%,12.39% 5.46%,22.66% 1.05%,34.70% 0.73%,35.28% 0.73%,55.57% 7.42%,55.87% 7.71%,91.66% 81.20%,91.94% 82.08%,91.94% 82.96%,89.26% 94.08%,88.96% 94.96%,85.74% 98.48%,85.44% 98.77%,35.27% 98.98%,28.49% 98.38%,21.13% 95.72%,18.78% 94.83%,18.48% 94.54%,8.55% 56.26%,8.26% 54.48%,7.69% 49.45%"],
 [590,908,340,"75.70% 7.63%,88.85% 22.82%,93.34% 35.05%,95.42% 41.02%,98.97% 58.03%,98.83% 89.84%,98.24% 90.44%,97.05% 90.74%,61.12% 95.40%,57.84% 95.42%,32.71% 92.17%,30.92% 91.86%,30.02% 91.27%,21.92% 84.71%,21.62% 84.41%,21.01% 83.22%,1.08% 34.44%,0.79% 33.55%,0.81% 29.08%,1.11% 28.19%,6.50% 17.16%,7.40% 16.27%,7.99% 15.97%,41.70% 4.56%,42.00% 4.56%,63.20% 5.78%"],
 [916,897,338,"12.45% 96.03%,6.96% 65.80%,6.66% 58.30%,6.42% 33.43%,6.42% 33.13%,12.50% 9.24%,12.80% 8.64%,13.10% 8.34%,27.14% 1.73%,60.66% 0.74%,66.65% 1.04%,72.66% 4.01%,73.56% 4.61%,75.06% 6.10%,91.07% 27.60%,94.10% 33.31%,94.40% 34.21%,95.63% 38.42%,96.27% 45.64%,96.25% 71.88%,95.92% 76.39%,95.30% 78.79%,95.00% 79.69%,94.09% 82.10%,93.48% 83.30%,92.27% 85.10%,89.86% 88.41%,87.75% 90.51%,86.25% 91.42%,83.84% 92.63%,78.13% 95.05%,76.62% 95.35%,55.84% 97.78%,29.44% 98.82%,24.07% 98.79%,13.94% 96.93%,13.04% 96.63%"]
];
const EQUIPMENT_CROPS=[
 [8,19,213,"1.43% 87.58%,1.38% 83.77%,1.84% 82.34%,2.77% 80.44%,21.38% 50.47%,22.34% 48.98%,22.82% 48.47%,24.26% 47.46%,88.61% 8.08%,92.39% 6.22%,94.28% 5.76%,96.64% 5.31%,98.06% 5.32%,98.06% 6.27%,96.68% 10.52%,96.22% 11.47%,93.89% 15.24%,48.17% 76.26%,47.67% 76.73%,46.17% 77.69%,14.80% 93.44%,13.85% 93.90%,12.43% 94.36%,7.67% 94.30%,4.80% 92.85%,2.88% 90.93%,1.92% 89.02%"],
 [210,17,229,"91.09% 1.34%,95.94% 1.39%,97.28% 2.72%,97.73% 4.49%,97.76% 8.01%,81.44% 45.32%,80.57% 47.14%,79.69% 48.50%,78.38% 49.87%,31.75% 82.16%,27.78% 84.75%,7.11% 95.99%,2.73% 98.16%,2.29% 98.15%,1.84% 97.71%,2.27% 96.39%,10.43% 74.38%,12.59% 70.85%,33.49% 39.75%,49.20% 23.37%,50.57% 22.06%,88.89% 2.20%,89.77% 1.77%"],
 [416,12,229,"89.79% 1.35%,90.23% 1.79%,90.33% 13.68%,79.23% 46.03%,78.36% 46.93%,25.68% 89.60%,22.14% 92.20%,19.50% 93.93%,16.41% 95.66%,11.12% 98.24%,9.80% 98.23%,9.79% 97.79%,10.22% 96.04%,11.51% 92.52%,13.23% 88.57%,15.82% 83.30%,47.25% 27.30%,48.16% 25.99%,48.61% 25.55%,51.31% 23.38%,77.90% 5.21%,79.66% 4.34%,88.02% 1.34%"],
 [624,6,242,"1.31% 98.23%,1.72% 97.40%,45.70% 25.74%,46.54% 24.87%,55.01% 19.57%,84.74% 2.78%,87.26% 1.57%,89.79% 1.18%,90.21% 1.19%,90.64% 1.61%,91.07% 2.45%,97.14% 15.13%,97.57% 16.40%,98.01% 18.10%,98.47% 21.08%,98.48% 21.51%,97.27% 25.33%,96.46% 27.04%,85.94% 45.27%,84.20% 47.02%,82.90% 47.90%,3.80% 97.41%,2.14% 98.23%"],
 [828,4,245,"85.09% 39.47%,75.59% 52.73%,74.32% 54.03%,11.99% 95.47%,10.76% 96.28%,6.66% 98.31%,6.25% 97.89%,6.65% 96.66%,7.46% 95.03%,42.56% 27.42%,45.15% 24.87%,83.41% 1.59%,84.23% 1.19%,85.89% 1.20%,89.20% 1.64%,92.53% 4.56%,92.95% 5.39%,93.80% 7.46%,93.82% 9.52%"],
 [1011,6,243,"91.94% 1.21%,94.02% 1.23%,94.45% 2.47%,96.65% 13.71%,96.67% 15.38%,85.37% 49.16%,84.53% 50.88%,83.69% 52.18%,82.43% 53.49%,19.51% 96.68%,17.03% 98.32%,16.62% 98.31%,16.61% 97.07%,17.42% 95.01%,46.20% 28.48%,47.52% 25.93%,49.26% 23.81%,80.24% 2.35%"],
 [2,233,209,"74.37% 94.76%,29.67% 93.44%,27.22% 92.94%,24.27% 91.94%,23.29% 91.44%,21.81% 90.46%,20.82% 89.48%,1.67% 54.54%,1.20% 53.07%,1.20% 52.58%,1.68% 51.59%,21.32% 19.12%,23.81% 15.23%,26.76% 13.27%,41.51% 5.03%,62.57% 5.08%,64.04% 5.57%,65.02% 6.06%,75.81% 12.90%,79.25% 16.32%,98.31% 47.69%,98.32% 49.65%,84.62% 88.84%,83.64% 89.82%,76.80% 94.25%,75.34% 94.75%"],
 [211,226,220,"80.69% 18.19%,98.41% 59.18%,98.40% 61.04%,93.20% 84.75%,92.27% 86.14%,84.85% 92.21%,83.46% 93.15%,82.53% 93.61%,79.28% 95.03%,77.89% 95.50%,74.64% 96.45%,34.55% 96.50%,22.51% 95.46%,20.65% 94.52%,19.25% 93.13%,2.08% 68.93%,1.62% 68.00%,1.16% 66.60%,1.61% 65.21%,18.74% 22.38%,21.57% 16.38%,22.99% 13.61%,40.20% 3.44%,43.45% 2.97%,57.39% 3.87%,60.18% 4.33%,61.57% 4.79%,62.50% 5.25%,73.21% 10.79%"],
 [428,235,207,"81.93% 15.98%,85.08% 78.91%,85.06% 80.39%,84.56% 81.38%,80.08% 86.84%,79.09% 87.84%,71.14% 94.28%,68.15% 96.26%,66.17% 97.25%,52.27% 98.31%,50.78% 97.82%,48.29% 96.86%,26.85% 87.95%,24.87% 86.95%,21.39% 84.94%,19.91% 83.93%,16.43% 80.44%,15.93% 79.45%,14.58% 23.81%,14.63% 19.90%,15.13% 18.43%,15.63% 17.93%,34.96% 2.21%,35.95% 1.72%,37.43% 1.23%,61.14% 1.24%,63.60% 1.73%,64.59% 2.22%,80.44% 14.50%"],
 [623,221,232,"79.68% 19.54%,85.86% 28.36%,95.43% 66.26%,95.85% 68.01%,98.29% 88.99%,98.27% 91.17%,89.14% 93.85%,37.31% 94.60%,18.40% 94.45%,8.35% 93.49%,1.81% 92.12%,1.36% 90.38%,1.31% 86.02%,2.92% 72.91%,4.15% 64.56%,8.01% 41.54%,15.13% 25.16%,30.25% 8.46%,30.70% 8.03%,32.91% 6.29%,37.76% 5.40%,42.18% 5.39%,62.46% 6.32%,68.18% 7.24%,76.14% 15.14%"],
 [845,233,215,"62.12% 98.34%,41.72% 97.90%,26.51% 90.83%,21.76% 88.46%,20.34% 87.51%,19.86% 86.57%,9.11% 50.07%,7.22% 33.80%,7.22% 33.32%,11.04% 21.36%,11.53% 19.93%,12.01% 18.97%,15.84% 12.76%,16.80% 11.33%,17.75% 10.37%,21.56% 7.96%,27.29% 5.06%,35.43% 1.23%,39.25% 1.20%,65.12% 2.19%,67.03% 2.68%,75.61% 5.60%,79.89% 8.01%,81.31% 8.97%,84.64% 11.85%,89.43% 21.39%,89.92% 22.82%,92.78% 32.85%,92.78% 33.81%,90.90% 49.10%,84.44% 84.17%,83.95% 86.05%,80.12% 93.57%,78.69% 94.98%"],
 [1042,230,212,"54.32% 98.35%,36.94% 97.83%,26.33% 93.96%,24.40% 92.99%,23.91% 92.51%,22.94% 91.08%,18.06% 83.41%,17.55% 81.01%,9.68% 41.80%,9.69% 39.86%,10.67% 35.49%,13.64% 23.41%,15.10% 20.51%,20.95% 11.83%,21.92% 10.86%,23.37% 9.89%,30.14% 6.02%,42.72% 1.20%,46.10% 1.19%,72.20% 3.65%,73.65% 4.14%,74.62% 4.62%,87.67% 15.73%,90.08% 18.15%,91.53% 20.08%,93.47% 23.46%,94.94% 28.29%,95.03% 40.36%,93.91% 76.59%,91.89% 87.13%,90.41% 92.39%,88.95% 95.26%,74.57% 96.82%,54.80% 98.35%"],
 [1,441,225,"21.06% 12.04%,25.62% 8.85%,42.02% 1.57%,44.29% 1.12%,52.03% 1.11%,59.32% 2.02%,61.14% 2.47%,77.08% 9.76%,77.99% 10.21%,78.45% 10.67%,81.68% 16.55%,97.09% 55.75%,97.08% 58.48%,84.71% 88.86%,79.69% 95.17%,76.96% 97.87%,76.05% 98.33%,74.70% 98.34%,44.76% 97.99%,32.95% 96.16%,25.23% 92.08%,24.77% 91.62%,2.49% 61.65%,2.47% 57.11%,3.78% 52.11%,6.45% 44.82%,18.75% 17.01%"],
 [219,438,222,"8.94% 74.44%,20.27% 22.75%,30.10% 3.51%,31.02% 2.60%,31.95% 2.14%,33.78% 1.67%,37.46% 1.19%,61.44% 1.14%,65.59% 1.61%,66.97% 2.07%,68.82% 2.98%,69.75% 3.89%,73.98% 13.44%,77.32% 21.68%,79.24% 26.75%,80.67% 30.92%,81.63% 34.17%,90.63% 67.65%,90.60% 70.40%,90.13% 71.79%,81.22% 92.85%,80.29% 93.77%,78.45% 94.69%,76.61% 95.16%,73.86% 95.63%,29.23% 98.31%,22.83% 98.25%,13.70% 97.72%,11.42% 96.79%,10.96% 95.88%,8.95% 76.27%"],
 [421,440,224,"13.42% 85.08%,18.79% 29.19%,19.73% 26.46%,23.00% 18.75%,23.93% 16.93%,29.48% 6.56%,31.78% 2.52%,32.24% 2.07%,33.60% 1.61%,35.42% 1.15%,65.03% 1.16%,69.12% 1.63%,73.22% 3.00%,74.13% 3.90%,78.32% 14.71%,85.33% 33.79%,86.26% 36.54%,86.80% 64.10%,86.78% 66.85%,85.23% 84.64%,84.77% 85.55%,80.64% 91.03%,79.72% 91.94%,78.35% 92.86%,77.44% 93.32%,76.07% 93.78%,72.43% 94.27%,34.44% 98.37%,28.06% 98.32%,26.24% 97.85%,23.51% 96.92%,21.68% 96.00%,20.31% 95.09%,18.94% 93.72%,14.35% 87.80%,13.44% 86.44%"],
 [645,439,233,"73.22% 8.19%,85.70% 93.93%,85.69% 94.79%,85.26% 95.23%,35.93% 98.49%,29.36% 98.47%,26.74% 98.03%,22.80% 96.71%,21.92% 96.28%,17.52% 92.36%,15.76% 90.62%,13.95% 47.71%,13.95% 47.26%,14.80% 10.31%,15.70% 7.27%,16.15% 6.40%,18.37% 2.49%,18.81% 2.06%,40.74% 1.50%,70.10% 1.24%,70.53% 1.24%,70.97% 1.68%,71.86% 3.41%,72.31% 4.71%"],
 [859,443,229,"75.76% 3.49%,86.91% 88.41%,86.47% 89.30%,84.26% 89.76%,34.39% 98.47%,31.71% 98.46%,29.02% 98.01%,25.45% 97.11%,22.76% 96.22%,20.97% 95.33%,19.62% 94.44%,18.72% 93.55%,16.47% 90.89%,16.01% 90.01%,12.93% 61.90%,12.89% 57.81%,14.95% 30.23%,18.32% 9.49%,19.25% 4.22%,19.70% 3.34%,20.60% 2.46%,22.38% 2.02%,69.55% 1.24%,73.53% 1.27%,74.42% 1.72%,75.31% 2.61%"],
 [1071,474,183,"2.53% 42.74%,3.37% 14.92%,3.93% 14.36%,50.26% 3.55%,53.62% 3.01%,65.93% 3.05%,69.29% 3.62%,72.08% 4.19%,81.01% 6.47%,82.14% 7.58%,84.41% 12.01%,99.10% 75.86%,99.09% 77.54%,98.53% 78.67%,97.98% 79.23%,94.66% 80.94%,63.30% 94.18%,59.90% 95.31%,57.63% 95.88%,54.79% 96.44%,51.39% 96.99%,41.77% 96.96%,38.37% 96.38%,36.11% 95.81%,31.03% 94.09%,25.39% 91.24%,23.70% 90.11%,11.36% 79.32%,8.02% 75.92%,7.46% 74.79%,2.50% 46.10%"],
 [9,659,217,"74.40% 11.04%,98.28% 75.14%,98.27% 76.55%,97.80% 77.49%,97.33% 77.96%,95.00% 79.38%,93.14% 80.33%,91.75% 80.82%,58.87% 91.88%,53.19% 93.30%,50.35% 93.77%,40.88% 93.77%,38.04% 93.30%,36.14% 92.83%,33.30% 91.88%,15.34% 83.79%,14.40% 83.31%,12.99% 82.36%,11.58% 80.94%,11.09% 79.07%,1.20% 36.99%,1.21% 36.04%,3.72% 15.86%,5.13% 14.44%,7.00% 13.49%,8.40% 13.01%,10.27% 12.52%,12.61% 12.03%,44.19% 6.22%,50.34% 5.77%,54.12% 5.78%,58.84% 6.27%,63.09% 6.76%,68.27% 7.73%,71.10% 8.69%,72.98% 9.64%"],
 [236,661,209,"72.38% 9.97%,98.20% 78.53%,98.19% 79.99%,96.25% 81.95%,94.79% 82.93%,93.83% 83.43%,92.38% 83.93%,59.68% 94.93%,57.71% 95.42%,54.76% 95.91%,45.90% 95.93%,42.46% 95.45%,39.99% 94.96%,38.02% 94.47%,13.02% 86.00%,10.58% 84.52%,10.09% 84.02%,2.74% 73.23%,1.30% 32.53%,1.30% 32.04%,11.18% 11.54%,13.14% 9.58%,14.11% 9.09%,15.58% 8.59%,17.52% 8.09%,43.45% 4.07%,54.73% 4.08%,60.12% 5.07%,64.53% 6.06%,67.96% 7.05%,70.90% 8.52%"],
 [453,659,206,"3.65% 64.19%,9.46% 14.56%,9.98% 12.11%,13.01% 3.79%,13.51% 2.81%,14.01% 2.32%,47.15% 1.22%,71.02% 15.95%,73.51% 18.42%,74.51% 19.90%,76.03% 22.86%,95.75% 85.97%,95.73% 87.95%,95.24% 88.45%,92.79% 89.45%,91.32% 89.96%,88.87% 90.48%,52.70% 97.78%,49.69% 98.29%,41.17% 98.30%,36.66% 97.79%,34.65% 97.29%,14.19% 90.67%,11.72% 89.65%,9.74% 88.63%,9.24% 87.64%,4.67% 73.19%,3.66% 68.19%"],
 [665,665,208,"72.88% 7.73%,98.20% 77.93%,98.18% 79.88%,95.75% 82.34%,94.29% 83.32%,92.35% 84.32%,89.92% 85.31%,87.98% 85.82%,32.54% 97.35%,30.08% 97.82%,21.23% 97.76%,15.33% 96.27%,12.38% 94.79%,10.41% 93.32%,7.45% 90.86%,6.96% 90.37%,5.46% 87.45%,4.46% 85.00%,3.95% 83.05%,3.40% 78.66%,1.39% 24.83%,1.43% 22.38%,3.03% 10.17%,3.53% 9.20%,4.02% 8.71%,5.98% 7.71%,7.45% 7.21%,9.41% 6.71%,11.86% 6.19%,44.86% 1.69%,54.71% 1.75%,58.15% 2.25%,65.51% 3.77%,67.47% 4.28%,68.94% 4.78%,71.89% 6.26%,72.38% 6.75%"],
 [890,683,181,"42.94% 25.15%,52.19% 20.74%,63.60% 18.10%,78.83% 16.65%,81.07% 16.69%,82.20% 17.26%,95.74% 31.50%,96.87% 33.76%,98.00% 36.60%,98.03% 40.56%,97.49% 42.83%,94.74% 47.92%,94.19% 48.49%,89.78% 52.47%,85.91% 55.90%,84.25% 57.05%,75.35% 62.29%,67.47% 66.48%,58.26% 70.18%,49.99% 73.18%,20.65% 82.82%,20.09% 82.81%,18.39% 82.22%,16.12% 81.05%,8.78% 76.43%,7.09% 75.27%,3.15% 71.26%,2.58% 70.12%,2.01% 68.41%,1.42% 64.43%,1.42% 63.86%,1.96% 61.59%,3.05% 58.17%,4.70% 55.32%,5.80% 53.61%,11.34% 47.86%,14.68% 44.96%,16.92% 43.20%"],
 [1051,659,203,"39.58% 40.95%,49.10% 5.18%,49.61% 4.20%,51.13% 2.71%,52.64% 1.73%,54.15% 1.23%,57.17% 1.23%,60.19% 2.71%,61.20% 3.70%,62.21% 5.18%,79.19% 36.07%,83.34% 44.22%,84.93% 51.39%,85.47% 57.55%,85.47% 60.12%,83.94% 67.84%,81.81% 77.05%,81.29% 78.07%,80.78% 78.58%,60.24% 95.80%,57.69% 97.29%,56.16% 97.78%,54.13% 98.27%,52.09% 98.27%,50.06% 97.77%,48.53% 97.27%,45.47% 95.76%,43.93% 94.76%,41.37% 92.26%,38.27% 88.24%,37.23% 86.73%,36.18% 84.71%,34.58% 80.16%,34.03% 78.13%,33.48% 75.59%,33.31% 66.88%,33.77% 64.30%"],
 [21,861,192,"1.30% 54.70%,2.35% 50.42%,4.45% 46.13%,5.50% 44.52%,8.13% 41.29%,8.66% 40.75%,23.03% 27.74%,27.34% 23.96%,33.81% 20.18%,37.59% 18.56%,39.21% 18.02%,41.36% 17.48%,42.44% 17.48%,44.60% 17.98%,50.54% 20.05%,87.12% 36.95%,90.28% 38.59%,93.44% 41.30%,95.01% 42.91%,96.59% 45.60%,97.12% 47.74%,98.18% 54.17%,98.17% 58.98%,97.64% 62.20%,97.11% 63.80%,96.06% 65.41%,94.48% 67.03%,92.38% 68.65%,87.12% 71.38%,84.48% 72.49%,76.54% 75.29%,72.27% 76.44%,64.20% 78.21%,60.94% 78.80%,57.12% 79.38%,36.40% 81.90%,34.25% 81.86%,19.83% 78.95%,17.18% 78.38%,15.07% 77.81%,10.32% 76.15%,7.16% 74.52%,3.99% 71.29%,2.93% 69.14%,1.32% 62.73%"],
 [237,858,174,"76.79% 91.90%,19.33% 94.31%,16.40% 94.27%,14.05% 93.65%,12.87% 93.05%,8.70% 87.16%,8.10% 85.99%,2.09% 69.43%,1.46% 62.32%,1.45% 61.13%,3.86% 36.20%,4.48% 32.65%,5.69% 29.11%,6.28% 28.51%,44.82% 4.89%,46.59% 4.89%,77.86% 10.34%,83.19% 15.64%,87.96% 25.05%,93.30% 36.86%,93.90% 39.22%,95.68% 47.50%,97.98% 58.73%,97.98% 60.51%,96.24% 64.06%,77.38% 91.31%"],
 [438,854,188,"16.69% 25.06%,42.42% 2.93%,44.06% 1.86%,45.15% 1.33%,46.23% 1.33%,70.69% 3.55%,71.24% 4.62%,93.34% 55.13%,94.41% 57.87%,94.95% 59.52%,95.48% 62.80%,95.46% 70.46%,94.91% 73.19%,94.36% 75.38%,92.72% 79.76%,91.08% 83.04%,87.82% 86.89%,85.65% 89.08%,82.93% 91.29%,75.30% 95.18%,72.03% 96.31%,69.85% 96.88%,64.92% 98.02%,59.44% 98.08%,56.14% 97.57%,53.39% 97.06%,51.18% 96.54%,42.87% 93.33%,37.86% 91.15%,31.19% 87.82%,24.57% 83.89%,18.53% 78.86%,15.27% 76.07%,12.57% 73.29%,9.33% 69.41%,6.12% 64.45%,5.05% 61.71%,4.00% 57.32%,4.04% 48.56%,5.17% 42.55%,5.72% 40.91%,7.37% 37.08%,7.92% 35.99%,9.01% 34.35%,10.66% 32.16%,13.39% 28.88%"],
 [653,852,202,"1.25% 61.56%,2.33% 34.15%,30.14% 18.20%,55.12% 5.21%,56.13% 5.21%,57.15% 5.71%,58.68% 7.21%,81.27% 35.51%,98.26% 60.54%,97.63% 80.78%,97.13% 81.29%,82.01% 92.51%,69.39% 94.16%,66.35% 94.20%,7.94% 86.41%,7.43% 85.90%,2.31% 72.73%,1.26% 63.09%"],
 [878,875,160,"97.07% 34.40%,97.72% 36.98%,97.79% 44.73%,94.65% 61.57%,94.00% 64.81%,92.00% 73.86%,90.69% 77.09%,89.39% 79.67%,87.44% 82.26%,84.21% 85.50%,71.93% 92.66%,68.04% 94.59%,63.50% 96.52%,61.56% 97.16%,57.03% 97.81%,17.15% 97.47%,13.97% 96.80%,12.06% 96.14%,9.51% 94.84%,5.66% 90.99%,3.73% 87.78%,3.08% 86.50%,2.43% 84.59%,2.23% 65.38%,2.84% 61.52%,3.45% 58.95%,14.83% 35.60%,16.77% 32.35%,21.93% 27.12%,29.06% 21.25%,46.02% 7.83%,48.61% 6.57%,51.85% 5.31%,55.72% 4.07%,60.23% 2.83%,66.66% 1.62%,73.72% 1.68%,76.94% 2.97%,79.51% 4.26%,81.44% 5.54%,82.73% 6.82%,84.03% 8.73%"],
 [1062,877,166,"53.64% 97.89%,23.98% 87.47%,22.12% 86.23%,20.88% 85.01%,2.21% 54.76%,1.59% 52.91%,1.58% 51.67%,8.15% 29.32%,8.75% 28.07%,9.97% 26.19%,19.81% 14.87%,21.05% 13.60%,22.91% 12.33%,36.65% 5.29%,39.80% 4.03%,42.32% 3.38%,45.47% 2.74%,53.04% 2.11%,53.67% 2.11%,70.00% 2.89%,72.49% 3.55%,74.36% 4.19%,83.67% 8.05%,86.16% 10.56%,89.88% 14.95%,97.26% 26.83%,97.87% 28.08%,97.89% 33.06%,94.77% 52.37%,93.49% 57.34%,92.87% 58.59%,91.00% 61.70%,85.99% 69.75%,67.21% 97.85%"],
 [6,1026,223,"56.25% 98.41%,24.28% 96.57%,16.44% 83.91%,5.64% 47.80%,5.18% 45.96%,5.17% 43.19%,5.61% 40.43%,7.40% 34.43%,7.86% 33.04%,9.22% 30.26%,11.49% 27.01%,14.68% 23.75%,38.79% 3.83%,41.11% 2.48%,42.97% 1.57%,44.35% 1.12%,46.20% 1.12%,55.45% 1.61%,57.30% 2.07%,60.07% 3.45%,92.13% 28.02%,93.48% 29.40%,94.38% 30.78%,94.84% 32.16%,94.84% 34.91%,89.97% 89.64%,84.03% 95.55%,76.76% 96.51%"],
 [220,1031,212,"74.71% 91.07%,69.87% 94.92%,22.52% 96.78%,20.61% 96.76%,17.73% 96.25%,15.32% 95.28%,12.44% 93.82%,11.00% 92.85%,6.67% 88.99%,4.73% 86.11%,2.79% 82.26%,2.30% 80.82%,1.29% 73.61%,1.26% 70.72%,1.73% 69.28%,2.19% 68.32%,17.22% 50.42%,18.64% 48.94%,64.08% 8.80%,74.14% 3.20%,75.57% 2.74%,79.88% 2.78%,81.80% 3.27%,83.24% 3.76%,86.12% 5.22%,88.52% 6.67%,92.85% 10.99%,96.70% 15.33%,97.66% 17.25%,98.15% 18.69%,98.16% 19.16%,95.92% 34.50%,79.61% 82.91%"],
 [429,1018,236,"39.96% 96.78%,39.10% 96.78%,9.37% 85.87%,8.94% 85.44%,1.49% 53.10%,1.06% 48.34%,6.65% 26.71%,7.08% 25.85%,12.67% 19.77%,16.11% 17.15%,32.94% 10.10%,90.58% 9.84%,92.72% 9.86%,96.58% 11.61%,97.01% 12.05%,98.32% 14.63%,98.33% 15.92%,96.76% 61.80%,94.14% 69.60%,93.70% 70.47%,84.98% 85.15%,77.57% 95.87%"],
 [661,1035,209,"19.89% 91.41%,16.32% 24.57%,24.85% 4.18%,26.32% 2.73%,27.30% 2.24%,29.26% 1.75%,31.70% 1.25%,43.45% 1.20%,45.90% 1.68%,47.86% 2.63%,49.33% 4.07%,73.18% 30.82%,79.10% 38.78%,80.57% 41.26%,81.54% 43.25%,83.88% 66.48%,83.82% 72.36%,83.31% 74.32%,82.33% 75.31%,51.30% 95.93%,49.33% 96.89%,47.86% 97.37%,42.95% 98.32%,31.67% 98.26%,29.22% 97.76%,25.31% 96.77%,23.35% 95.79%,20.39% 92.86%"],
 [829,1001,253,"98.17% 28.54%,82.62% 68.95%,79.38% 73.40%,66.37% 90.25%,65.96% 90.65%,50.63% 92.29%,32.79% 79.95%,30.76% 78.34%,27.50% 75.51%,27.09% 75.11%,1.79% 37.80%,1.00% 36.19%,1.01% 34.98%,1.41% 33.77%,1.81% 32.96%,3.40% 31.34%,4.99% 30.52%,6.18% 30.11%,8.96% 29.28%,33.83% 23.30%,65.38% 20.93%,92.17% 21.27%,94.16% 21.68%,95.35% 22.09%,96.95% 22.91%,98.14% 24.12%,98.55% 24.93%,98.56% 27.34%"],
 [1044,1033,210,"15.49% 54.92%,29.04% 28.81%,50.81% 1.20%,61.55% 1.20%,67.43% 6.46%,67.92% 6.94%,85.76% 30.30%,97.36% 57.86%,83.58% 84.28%,83.09% 84.76%,55.20% 98.33%,54.22% 98.33%,27.30% 82.32%,15.49% 55.41%"]
];
function atlasCell(atlas,key){const index=atlas.keys.indexOf(key);return index<0?null:{src:atlas.src,key,index,columns:atlas.columns,rows:atlas.rows,column:index%atlas.columns,row:Math.floor(index/atlas.columns),crop:(atlas===CREATURE_ATLAS?CREATURE_CROPS:EQUIPMENT_CROPS)[index]}}
function creatureArt(key){return atlasCell(CREATURE_ATLAS,key)}
// The acorn apprentice mallet is the same painted weapon carried by its maker, boss4.
const ACORN_MALLET_CROP=[580,955,145,'25.52% 3.45%,35.86% 6.21%,45.52% 8.97%,53.79% 14.48%,62.07% 22.76%,67.59% 37.24%,64.14% 48.97%,57.93% 56.55%,50.34% 63.45%,66.90% 92.41%,65.52% 94.48%,63.45% 94.48%,47.59% 68.28%,33.79% 68.97%,20.00% 64.83%,11.03% 56.55%,8.28% 44.83%,8.97% 33.79%,15.17% 20.69%,22.76% 16.55%'];
function itemArt(item){const art=atlasCell(EQUIPMENT_ATLAS,item.painting);return item.painting==='acornblade'?{...art,src:CREATURE_ATLAS.src,crop:ACORN_MALLET_CROP}:art}
function paintAtlas(frame,img,art,alt=''){
 if(!art)return false;
 frame.setAttribute('data-art-key',art.key);frame.setAttribute('data-art-cell',String(art.index));
 img.src=art.src;img.alt=alt;img.decoding='async';img.classList.add('oil-art-image');
 const [x,y,size,outline]=art.crop;
 img.style.width=img.style.height=1254/size*100+'%';
 img.style.left=-x/size*100+'%';img.style.top=-y/size*100+'%';
 frame.style.clipPath='polygon('+outline+')';
 return true;
}
function createAtlasArt(art,className,alt=''){
 const frame=document.createElement('span'),img=document.createElement('img');
 frame.className='oil-art-frame '+className;img.className='oil-art-image';img.loading='lazy';
 paintAtlas(frame,img,art,alt);frame.append(img);return frame;
}
// Decode once, retain successful images, and never let an old request repaint a new encounter.
const battleImages=new Map();
let battleSceneKey='',battleSceneRequest=0,battleSceneRetryAt=0,battleWarmStarted=false;
function loadBattleImage(src){
 if(battleImages.has(src))return battleImages.get(src);
 const promise=new Promise(resolve=>{
  let attempt=0;
  function start(){
   const img=new Image();let settled=false;
   const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);img.onload=null;img.onerror=null;
    if(ok)resolve(img);else if(++attempt<2)start();else resolve(null)};
   const timer=setTimeout(()=>finish(false),12000);
   img.decoding='async';img.onload=async()=>{try{if(img.decode)await img.decode();finish(img.naturalWidth>0)}catch{finish(false)}};
   img.onerror=()=>finish(false);img.src=src;
  }
  start();
 });
 battleImages.set(src,promise);
 promise.then(img=>{if(!img&&battleImages.get(src)===promise)battleImages.delete(src)});
 return promise;
}
function warmBattleImages(){
 if(battleWarmStarted)return;battleWarmStarted=true;
 const sources=[CREATURE_ATLAS.src,EQUIPMENT_ATLAS.src,'art/mosslight-clearing.png','art/mosslight-adventurer.png'];
 // One background download at a time leaves bandwidth for the current encounter.
 (async()=>{for(const src of sources)await loadBattleImage(src)})();
}
function renderBattleScene(){
 if(typeof Image==='undefined')return;
 const arena=$('arena'),species=boss?(bossId===3?'owl':bossId===4?'hedgehog':'guardian'):currentMob.toLowerCase().replace(/^elite/,'');
 const actor=creatureArt(boss?'boss'+bossId:currentMob);
 const name=boss?BOSSES[bossId].name:MOBS[currentMob].name,background=sceneImage();
 const key=[background,actor.key,name].join('|');
 if(key===battleSceneKey&&(!battleSceneRetryAt||Date.now()<battleSceneRetryAt))return;
 battleSceneKey=key;battleSceneRetryAt=0;const request=++battleSceneRequest;
 arena.setAttribute('aria-busy','true');$('scene-load-status').hidden=false;$('scene-load-status').textContent='숲의 풍경을 불러오는 중…';
 Promise.all([loadBattleImage(background),loadBattleImage(actor.src),loadBattleImage('art/mosslight-adventurer.png')]).then(images=>{
  if(request!==battleSceneRequest)return;
  arena.setAttribute('aria-busy','false');
  if(images.some(img=>!img)){
   // Keep the last complete scene instead of displaying a broken image.
   battleSceneRetryAt=Date.now()+30000;$('scene-load-status').textContent='풍경 연결 중 · 자동으로 다시 불러옵니다';return;
  }
  arena.style.backgroundImage='url("'+background+'")';
  paintAtlas($('painted-enemy'),$('enemy-actor'),actor,name);
  arena.classList.toggle('layered-scene',true);arena.setAttribute('data-species',species);$('scene-load-status').hidden=true;
  warmBattleImages();
 });
}

// Combat visuals are deterministic presentation; rewards are credited only in damage().
let encounterSerial=0,cinemaSignature='',rewardPainted='',rewardReview=false;
let combatFxSerial=0,impactSerial=0,heroStrikeDuration=550,heroContactAt=0,heroStrikeAnimation=null,pendingHeroContact=null;const strikeTimers={},combatFxTimers=new Map(),impactTimers=new Map();
function quietCombatEffects(){return s.effectsLite||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||document.hidden}
function clearCombatEffects(keepHeroStrike=false){
 for(const timer of combatFxTimers.values())clearTimeout(timer);combatFxTimers.clear();$('combat-fx').replaceChildren();
 for(const key of ['hero','contact','enemy','skill','victory','critical']){if(keepHeroStrike&&(key==='hero'||key==='contact'))continue;clearTimeout(strikeTimers[key]);strikeTimers[key]=null}
 if(!keepHeroStrike){pendingHeroContact=null;heroContactAt=0;heroStrikeAnimation=null;$('arena').classList.remove('hero-striking','hero-critical')}
 for(const timer of impactTimers.values())clearTimeout(timer);impactTimers.clear();$('impact-layer').replaceChildren();$('arena').classList.remove('enemy-striking','heavy-impact','skill-charging','impact-flash','enemy-critical-hit');$('arena').setAttribute('data-cast-skill','');
}
function appendCombatBurst(burst,duration=760){
 const layer=$('combat-fx');layer.append(burst);
 while(layer.children.length>5){const oldest=layer.children[0];clearTimeout(combatFxTimers.get(oldest));combatFxTimers.delete(oldest);oldest.remove()}
 combatFxTimers.set(burst,setTimeout(()=>{burst.remove();combatFxTimers.delete(burst)},duration));return true;
}
// All skill particles share the combat layer's five-burst budget and use fixed geometry.
function emitEncounterEffect(skill,event='cast',hit=true){
 if(skill?.field)return event==='cast'&&emitFieldAttack(skill,hit);
 if(!skill||!['cast','arrive','victory'].includes(event)||quietCombatEffects()||s.paused)return false;
 const burst=document.createElement('div');burst.className='combat-burst encounter-fx skill-'+skill.id+' skill-'+event;
 for(const part of ['source','path','impact']){const node=document.createElement('i');node.className='skill-'+part;if(part==='source')node.textContent=skill.glyph;burst.append(node)}
 for(let i=0;i<6;i++){const node=document.createElement('i');node.className='skill-fragment';const angle=(i*60-30)*Math.PI/180;node.style.cssText='--i:'+i+';--dx:'+Math.round(Math.cos(angle)*94)+'px;--dy:'+Math.round(Math.sin(angle)*68)+'px;--turn:'+(i*60)+'deg';burst.append(node)}
 return appendCombatBurst(burst,event==='cast'?1050:1250);
}
function castEnemySkill(skill,hit=true){
 if(!skill)return false;
 const arena=$('arena');
 if(skill.field){arena.setAttribute('data-cast-skill','');void arena.offsetWidth}
 const shown=emitEncounterEffect(skill,'cast',hit);
 if(shown){clearTimeout(strikeTimers.skill);arena.setAttribute('data-field-contact',hit?'hit':'dodge');arena.setAttribute('data-cast-skill',skill.id);strikeTimers.skill=setTimeout(()=>arena.setAttribute('data-cast-skill',''),skill.field?1350:1050)}
 return shown;
}
function emitCombatEffect(kind){
 if(quietCombatEffects()||s.paused)return false;const burst=document.createElement('div');
 burst.className='combat-burst fx-'+kind;burst.style.cssText='--tilt:'+((combatFxSerial++%3-1)*12)+'deg';
 const ring=document.createElement('i');ring.className='fx-ring';burst.append(ring);
 for(let i=0;i<6;i++){const spark=document.createElement('i');spark.className='fx-spark';const angle=(i*60+combatFxSerial*17)*Math.PI/180;spark.style.cssText='--dx:'+Math.round(Math.cos(angle)*74)+'px;--dy:'+Math.round(Math.sin(angle)*52)+'px;--turn:'+(i*60)+'deg';burst.append(spark)}
 return appendCombatBurst(burst);
}
function encounterKind(){return boss?(bossTier==='mystic'?'mystic':bossTier==='elite'?'elite-boss':'boss'):currentMob==='treasure'?'treasure':MOBS[currentMob]?.elite?'elite':'normal'}
function sceneImage(){return 'art/mosslight-clearing.png'}
function renderEncounter(){const arena=$('arena'),kind=encounterKind(),victory=['victory','results'].includes(phase);const signature=[kind,bossId,currentMob,encounterSerial,phase].join('|');arena.classList.toggle('hero-defeated',phase==='defeated');arena.classList.toggle('scene-paused',s.paused||document.hidden);arena.classList.toggle('scene-victory',victory);arena.classList.toggle('cinema-lite',s.effectsLite);$('fx-toggle').setAttribute('aria-pressed',String(!s.effectsLite));$('fx-toggle').textContent=s.effectsLite?'연출 간소화':'연출 풍부하게';if(quietCombatEffects()||s.paused)clearCombatEffects();if(signature!==cinemaSignature){const finishingStrike=['loot','victory'].includes(phase)&&cinemaSignature===[kind,bossId,currentMob,encounterSerial,'combat'].join('|');clearCombatEffects(finishingStrike);cinemaSignature=signature;arena.setAttribute('data-encounter',kind);$('encounter-rank').textContent=({normal:'FOREST ENCOUNTER',elite:'ELITE HUNT',boss:'BOSS EXPEDITION','elite-boss':'ELITE BOSS',mystic:'MYSTIC BOSS',treasure:'GOLDEN ENCOUNTER'})[kind];$('encounter-trait').textContent=({normal:'숲의 작은 만남',elite:'강인한 개체 · 전용 수집품',boss:'숲의 수호자 · 보스 전리품','elite-boss':'보스 HP ×8 · 공격 ×3 · 전리품 ×3',mystic:'보스 HP ×60 · 공격 ×12 · 전리품 ×12',treasure:'황금 보물여우 · 확정 희귀 재료'})[kind];$('encounter-intro').className='encounter-intro';if(kind!=='normal'&&!victory&&phase==='combat'){void $('encounter-intro').offsetWidth;$('encounter-intro').classList.add('reveal')}$('intro-rank').textContent=({elite:'ELITE',boss:'GUARDIAN','elite-boss':'ELITE GUARDIAN',mystic:'MYSTIC AWAKENING',treasure:'A GOLDEN MIRACLE'})[kind]||'';$('intro-name').textContent=boss?BOSS_TIERS[bossTier].name+' · '+BOSSES[bossId].name:MOBS[currentMob].name;const particles=$('scene-particles');particles.replaceChildren();for(let i=0;i<18;i++){const p=document.createElement('i');p.className='scene-mote';p.style.cssText='--i:'+i+';left:'+(8+(i*37)%85)+'%;top:'+(20+(i*23)%64)+'%;animation-delay:-'+(i*.43)+'s';particles.append(p)}if(kind==='treasure'){if(phase==='combat')emitEncounterEffect(FOX_SKILL,'arrive');else if(phase==='victory')queueFoxVictory()}}
$('enemy-intent').hidden=phase!=='combat';$('enemy-intent-text').textContent=phase==='combat'?(enemySkill()?.name||'다음 공격')+' '+Math.max(0,enemyInterval()-enemyClock).toFixed(1)+'초':'';$('enemy-intent-fill').style.width=Math.min(100,enemyClock/enemyInterval()*100)+'%';$('arena').classList.toggle('attack-approaching',phase==='combat'&&enemyInterval()-enemyClock<.45);$('reward-reopen').hidden=!s.battleReward;if(victory){$('battle-status').textContent='✦ 승리 · 전리품 확인';$('reward-label').textContent='보상이 가방에 저장되었습니다.'}
}
// CSS animations may start a frame after synchronous reward rendering. The live
// shoulder timeline, not elapsed wall time, decides when the blade lands/finishes.
function atHeroPose(key,progress,callback,delay){
 function check(){
  if(quietCombatEffects()||s.paused){clearCombatEffects();return}
  const animation=heroStrikeAnimation;
  if(animation&&animation.playState!=='idle'){
   const current=animation.currentTime,remaining=current===null?32:heroStrikeDuration*progress-current;
   if(remaining>0){strikeTimers[key]=setTimeout(check,Math.min(32,remaining));return}
  }
  strikeTimers[key]=null;callback();
 }
 strikeTimers[key]=setTimeout(check,Math.max(0,delay));
}
function animateStrike(received=false,critical=false,heavy=false){
 if(quietCombatEffects()||s.paused)return;
 const arena=$('arena'),key=received?'enemy':'hero';
 // Extra strikes from passives share the active swing instead of restarting its windup.
 if(!received&&strikeTimers.hero!=null){if(critical&&!arena.classList.contains?.('hero-critical')){const pose=heroStrikeAnimation?.currentTime;arena.classList.remove('hero-striking');arena.classList.add('hero-critical');heroStrikeAnimation=heroShoulderAnimation();syncCriticalPose(pose)}return}
 clearTimeout(strikeTimers[key]);
 if(received)arena.classList.remove('enemy-striking','heavy-impact');else{arena.classList.remove('hero-striking','hero-critical');heroStrikeDuration=Math.min(550,850/speed());heroContactAt=Date.now()+heroStrikeDuration*.66;arena.style.setProperty?arena.style.setProperty('--hero-strike-duration',heroStrikeDuration+'ms'):arena.style['--hero-strike-duration']=heroStrikeDuration+'ms'}
 void arena.offsetWidth;arena.classList.add(received?'enemy-striking':critical?'hero-critical':'hero-striking');if(heavy)arena.classList.add('heavy-impact');
 if(received){strikeTimers.enemy=setTimeout(()=>{arena.classList.remove('enemy-striking','heavy-impact');strikeTimers.enemy=null},650);return}
 // Query only the articulated shoulder; this also flushes the new animation style.
 heroStrikeAnimation=heroShoulderAnimation();
 atHeroPose('hero',1,()=>{arena.classList.remove('hero-striking','hero-critical');heroStrikeAnimation=null},heroStrikeDuration);
}
function heroShoulderAnimation(){return $('arena').querySelector('.hero-arm')?.getAnimations?.().find(animation=>['hero-overhead-shoulder','hero-critical-shoulder'].includes(animation.animationName))||null}
function syncCriticalPose(pose){if(!Number.isFinite(pose))return;for(const selector of ['.hero-arm','.hero-sword-hand','.hero-motion','.sword-arc'])for(const animation of $('arena').querySelector(selector)?.getAnimations?.()||[])if(animation.animationName?.startsWith('hero-critical-'))animation.currentTime=pose}
function queueFoxVictory(){
 const serial=encounterSerial;atHeroPose('victory',Math.min(1,.66+70/heroStrikeDuration),()=>{if(serial===encounterSerial&&phase==='victory')emitEncounterEffect(FOX_SKILL,'victory')},Math.max(0,heroContactAt-Date.now())+70);
}
function captureBattleReward({kind,tier,name,gold,bossId:firstId,gearStart,firstClear,seconds}){const newGear=s.gear.filter(g=>Number(g.id.slice(1))>=gearStart);const remaining=newGear.slice();const rows=[];for(const drop of lastLoot){if(ITEMS[drop.key].slot){for(let i=0;i<drop.count;i++){const at=remaining.findIndex(g=>g.key===drop.key),g=at>=0?remaining.splice(at,1)[0]:null;rows.push({key:drop.key,count:1,gear:g?JSON.parse(JSON.stringify(g)):null})}}else{const row=rows.find(x=>x.key===drop.key&&!x.gear);if(row)row.count+=drop.count;else rows.push({key:drop.key,count:drop.count,gear:null})}}
if(kind==='boss'){const k=firstId+'_'+tier,r=s.fieldNotes.bosses[k]||{wins:0,best:null};r.wins++;r.best=r.best===null?seconds:Math.min(r.best,seconds);s.fieldNotes.bosses[k]=r}
s.battleReward={id:String(Date.now())+'-'+s.total,kind,tier,name,gold,rows,firstClear,bossId:firstId,seconds,createdAt:Date.now()};s.rewardPending=true;rewardReview=false;rewardPainted='';phase='victory';phaseLeft=1.8;hp=0;attackClock=0;enemyClock=0;save();}
function paintReward(){const report=s.battleReward;if(!report)return;const signature=report.id+'|'+rewardReview;if(signature===rewardPainted)return;rewardPainted=signature;$('victory-dialog').setAttribute('data-tier',report.kind==='treasure'?'treasure':report.tier);$('victory-eyebrow').textContent=report.kind==='treasure'?'GOLDEN TREASURE FOUND':report.tier==='mystic'?'MYSTIC BOSS DEFEATED':report.tier==='elite'?'ELITE BOSS DEFEATED':'EXPEDITION COMPLETE';$('victory-name').textContent=report.name;$('victory-subtitle').textContent=(report.firstClear?'첫 격파 달성 · ':'')+(report.kind==='boss'?'전투 '+report.seconds.toFixed(1)+'초':'특별한 만남의 전리품');$('victory-gold').textContent='+'+report.gold.toLocaleString('ko-KR');$('victory-count').textContent=report.rows.reduce((n,x)=>n+x.count,0)+'개 획득';$('victory-items').replaceChildren();const rows=report.rows.slice().sort((a,b)=>rarityRank(ITEMS[a.key].rarity)-rarityRank(ITEMS[b.key].rarity));rows.forEach((row,i)=>{const item=ITEMS[row.key],card=document.createElement('article');card.className='victory-item '+item.rarity;card.style.animationDelay=(.2+i*.16)+'s';const emblem=document.createElement('span');emblem.className='victory-item-emblem';paintItemIcon(emblem,item);const type=document.createElement('small');type.textContent=RARITIES[item.rarity]+(row.gear?' · 장비':' · 재료');const title=document.createElement('strong');title.textContent=item.name;const count=document.createElement('b');count.textContent='×'+row.count;card.append(emblem,type,title,count);if(row.gear){const options=document.createElement('details'),summary=document.createElement('summary');summary.textContent='획득 옵션 확인'+(row.gear.exceptional?' · 대성공':'');options.append(summary);const base=document.createElement('p');base.textContent=gearText(row.gear)+' / '+optionText(row.gear)+(row.gear.ward?' / 가호 +'+pct(row.gear.ward):'');options.append(base);for(const line of row.gear.potentials||[]){const p=document.createElement('p');p.className='quality-'+line.grade;p.textContent=potentialLine(line);options.append(p)}options.ontoggle=()=>{if(options.open&&s.rewardPending){s.rewardAuto=false;$('reward-auto').checked=false;save()}};card.append(options)}$('victory-items').append(card)});$('reward-auto').checked=s.rewardAuto;$('reward-auto-label').hidden=rewardReview;$('victory-continue').textContent=rewardReview?'기록 닫기':'전리품 확인 · 모험 계속';$('victory-receipt').textContent='골드와 아이템은 이미 가방에 저장됐습니다. 이 창을 다시 열어도 중복 지급되지 않습니다.';}
function showBattleReward(review=false){if(!s.battleReward)return false;rewardReview=review;paintReward();if(!$('victory-dialog').open)$('victory-dialog').showModal();return true}
function finishBattleReward(){const pending=s.rewardPending;s.rewardPending=false;rewardReview=false;rewardPainted='';$('victory-dialog').close();if(pending){boss=false;phase='loot';phaseLeft=.8;hp=0;save();render();renderLoot()}return pending}
function stepBattleReward(dt){if(phase==='victory'){phaseLeft-=dt;if(phaseLeft<=0){phase='results';phaseLeft=18;showBattleReward();save()}return true}if(phase==='results'){if(!$('victory-dialog').open)showBattleReward();if(s.rewardAuto){phaseLeft=Math.max(0,phaseLeft-dt);if(phaseLeft<=0){finishBattleReward();return true}}$('reward-return-time').textContent=s.rewardAuto?Math.ceil(phaseLeft)+'초 후 자동 사냥으로 복귀':'천천히 확인하세요 · 자동 복귀 꺼짐';return true}return false}
function loadBattleReward(){try{const raw=JSON.parse(readSaveRaw())||{};s.rewardAuto=raw.rewardAuto!==false;s.effectsLite=raw.effectsLite===true;const r=raw.battleReward;if(r&&['boss','treasure'].includes(r.kind)&&typeof r.id==='string'&&typeof r.name==='string'&&Number.isFinite(r.gold)&&Array.isArray(r.rows)){s.battleReward={...r,tier:Object.hasOwn(BOSS_TIERS,r.tier)?r.tier:'normal',seconds:Math.max(0,Number(r.seconds)||0),rows:r.rows.filter(x=>ITEMS[x?.key]&&Number.isInteger(x.count)&&x.count>0).map(x=>({...x,gear:x.gear&&x.gear.key===x.key&&ITEMS[x.key].slot?x.gear:null}))};s.rewardPending=raw.rewardPending===true}else{s.battleReward=null;s.rewardPending=false}}catch{s.battleReward=null;s.rewardPending=false;s.rewardAuto=true;s.effectsLite=false}}

// Potential lines are rolled once, persisted, and only equipped instances contribute.
const POTENTIALS={
 atkFlat:{name:'공격력',unit:'flat',min:6,max:90},atkPct:{name:'공격력',min:.02,max:.18},
 speedFlat:{name:'공격속도',unit:'speed',min:.01,max:.12},speedPct:{name:'공격속도',min:.01,max:.08},
 critical:{name:'치명타 확률',min:.005,max:.05},leech:{name:'피해 흡수',min:.002,max:.03},chain:{name:'연속 타격 확률',min:.005,max:.06},
 hpFlat:{name:'최대 HP',unit:'flat',min:50,max:700},hpPct:{name:'최대 HP',min:.02,max:.18},
 defFlat:{name:'방어력',unit:'flat',min:3,max:55},defPct:{name:'방어력',min:.01,max:.12},
 reduction:{name:'피해감소',min:.003,max:.04},bossReduction:{name:'보스 피해감소',min:.01,max:.10},
 regen:{name:'전투 중 HP 재생 / 초',min:.0005,max:.004},dodge:{name:'피격 시 회피 확률',min:.005,max:.06},rage:{name:'피격 후 4초 공격력',min:.10,max:.50},
 moveFlat:{name:'이동속도',unit:'move',min:.01,max:.12},movePct:{name:'이동속도',min:.01,max:.12},cooldown:{name:'보스 원정 대기시간 감소',min:.01,max:.20},
 drop:{name:'드롭률 (합산)',min:.01,max:.20},gold:{name:'골드 획득 (합산)',min:.01,max:.25},
 dropMore:{name:'드롭률 증폭 (옵션끼리 합산)',min:.01,max:.50},goldMore:{name:'골드 증폭 (옵션끼리 합산)',min:.01,max:.50},
 trinket:{name:'소소한 체력',unit:'flat',min:12,max:100},pocket:{name:'잔돈 수집 · 골드',min:.015,max:.06}
};
const POTENTIAL_POOLS={
 weapon:[['atkFlat',25],['atkPct',25],['speedFlat',15],['speedPct',15],['critical',5],['leech',3],['chain',.3],['trinket',6],['pocket',5.7]],
 chest:[['hpFlat',22],['hpPct',20],['defFlat',20],['defPct',20],['reduction',4],['bossReduction',4],['regen',3],['dodge',.5],['rage',.5],['trinket',6]],
 legs:[['hpFlat',22],['hpPct',20],['defFlat',20],['defPct',20],['reduction',4],['bossReduction',4],['regen',3],['dodge',.5],['rage',.5],['trinket',6]],
 boots:[['moveFlat',30],['movePct',40],['dodge',5],['cooldown',10],['speedPct',1],['trinket',7],['pocket',7]],
 ring:[['drop',36],['gold',36],['dropMore',.5],['goldMore',.5],['trinket',14],['pocket',13]]
};
const POTENTIAL_COUNTS={common:0,rare:1,epic:2,legendary:3,mythic:4};
const POTENTIAL_GRADES=['잔잔','선명','찬란','기적'];
let potentialGearId=null;
function potentialScale(key,tier,type){const rarity=({common:0,rare:.55,epic:.8,legendary:1,mythic:1.2})[ITEMS[key].rarity];return rarity*(1+(gearTier({tier})-1)*(POTENTIALS[type].unit==='flat'?.45:.07))}
function potentialGrade(roll){return roll<.8?0:roll<.97?1:roll<.998?2:3}
function rollPotentials(key,rng=Math.random,tier=1){
 const count=POTENTIAL_COUNTS[ITEMS[key].rarity],pool=POTENTIAL_POOLS[ITEMS[key].slot].slice(),lines=[];
 for(let i=0;i<count;i++){let roll=rng()*pool.reduce((n,x)=>n+x[1],0),at=pool.length-1;for(let j=0;j<pool.length;j++){roll-=pool[j][1];if(roll<0){at=j;break}}
  const [[type]]=pool.splice(at,1),spec=POTENTIALS[type],grade=potentialGrade(rng()),bounds=[[0,.25],[.25,.5],[.5,.8],[.8,1]][grade],ratio=bounds[0]+(bounds[1]-bounds[0])*Math.pow(rng(),2);
  const value=(spec.min+(spec.max-spec.min)*ratio)*potentialScale(key,tier,type);lines.push({type,grade,value:spec.unit==='flat'?Math.max(1,Math.round(value)):Math.round(value*10000)/10000});
 }return lines;
}
function validPotentials(g){
 const rarity=ITEMS[g.key].rarity,count=POTENTIAL_COUNTS[rarity];if(!count)return [];
 // Legacy rolls retain their actual values and line count until explicitly rerolled.
 const range=g.potentialVersion===2?[count,count]:({rare:[0,1],epic:[1,2],legendary:[2,3],mythic:[3,5]})[rarity];
 if(!Array.isArray(g.potentials)||g.potentials.length<range[0]||g.potentials.length>range[1])return null;
 const allowed=new Set(POTENTIAL_POOLS[ITEMS[g.key].slot].map(x=>x[0])),seen=new Set();
 for(const p of g.potentials){const spec=POTENTIALS[p?.type];if(!spec||!allowed.has(p.type)||seen.has(p.type)||!Number.isInteger(p.grade)||p.grade<0||p.grade>3||!Number.isFinite(p.value)||p.value<0||p.value>Math.max(spec.max,spec.max*potentialScale(g.key,gearTier(g),p.type))+.5001)return null;seen.add(p.type)}return g.potentials;
}
function potentialSum(type){let total=0;for(const id of Object.values(s.slots)){const g=s.gear.find(x=>x.id===id);if(g)for(const p of g.potentials||[])if(p.type===type)total+=p.value}return total}
function potentialProduct(type){return 1+potentialSum(type)}
function expeditionReduction(){return Math.min(.4,potentialSum('cooldown'))}
function dodgeChance(){return Math.min(.2,potentialSum('dodge'))}
function bossMitigation(){return Math.min(.25,potentialSum('bossReduction')+.02*specialPower('foxward'))}
function potentialLine(p){const spec=POTENTIALS[p.type];let value=spec.unit==='flat'?String(p.value):spec.unit==='speed'?p.value.toFixed(3)+'회/초':spec.unit==='move'?p.value.toFixed(3)+'m/s':pct(p.value);return '['+POTENTIAL_GRADES[p.grade]+'] '+spec.name+' +'+value+(p.type==='rage'?' (×'+(1+p.value).toFixed(2)+')':'')}
function potentialRows(node,lines){node.replaceChildren();for(const line of lines||[]){const p=document.createElement('p');p.className='potential-line quality-'+line.grade;p.textContent=potentialLine(line);node.append(p)}if(!lines?.length){const p=document.createElement('p');p.textContent='일반은 잠재 없음 · 이전 장비는 재설정하면 현재 줄 수가 적용됩니다.';node.append(p)}}
function potentialCost(g){const rarity=ITEMS[g.key].rarity;return ({rare:{gold:180,items:{stone_rare:1,crystal:2}},epic:{gold:800,items:{stone_epic:1,crystal:8}},legendary:{gold:2400,items:{stone_legendary:1,dust:3}},mythic:{gold:7000,items:{stone_mythic:1,core:3,dust:5}}})[rarity]||null}
function canReroll(g){const cost=g&&potentialCost(g);return !!cost&&s.gold>=cost.gold&&Object.entries(cost.items).every(([k,n])=>(s.inventory[k]||0)>=n)}
function openPotential(id){const g=s.gear.find(x=>x.id===id);if(!g)return false;potentialGearId=id;hideGearTip();refreshPotentialDialog();$('potential-dialog').showModal();return true}
function refreshPotentialDialog(){if(!potentialGearId)return;const g=s.gear.find(x=>x.id===potentialGearId);if(!g){potentialGearId=null;$('potential-dialog').close();return}$('potential-name').textContent=ITEMS[g.key].name+' · '+RARITIES[ITEMS[g.key].rarity];$('potential-base').textContent=gearText(g)+' / '+optionText(g)+(g.ward?' / 숲의 가호 +'+pct(g.ward):'');potentialRows($('potential-lines'),g.potentials);renderGearComparison($('potential-comparison'),g);$('potential-rules').textContent='희귀 1 · 영웅 2 · 전설 3 · 신화 4줄 / 잔잔 80%, 선명 17%, 찬란 2.8%, 기적 0.2% · 등급·티어에 따라 수치 상승'+(g.potentialVersion===2?'':' · 이전 장비: 기존 옵션 보존, 재설정 시 새 규칙 적용');const cost=potentialCost(g);$('potential-cost').textContent=cost?'골드 '+fmt(s.gold)+' / '+fmt(cost.gold)+' G · '+Object.entries(cost.items).map(([k,n])=>ITEMS[k].name+' '+(s.inventory[k]||0)+' / '+n).join(' · '):'일반 장비는 잠재가 없습니다.';$('potential-reroll').disabled=!canReroll(g);$('potential-reroll').textContent=cost?'비용 사용 · 전체 잠재 재설정':'잠재 없음';const pool=POTENTIAL_POOLS[ITEMS[g.key].slot];$('potential-pool').replaceChildren();for(const [key,w] of pool){const p=document.createElement('p'),spec=POTENTIALS[key],scale=potentialScale(g.key,gearTier(g),key),format=v=>spec.unit==='flat'?Math.max(1,Math.round(v)):spec.unit==='speed'?v.toFixed(3)+'회/초':spec.unit==='move'?v.toFixed(3)+'m/s':pct(v);p.textContent=spec.name+' · 첫 줄 '+w+'% · '+format(spec.min*scale)+'~'+format(spec.max*scale);$('potential-pool').append(p)}}
function rerollPotential(id,rng=Math.random){if(!canMutate())return false;let g=s.gear.find(x=>x.id===id);if(!canReroll(g))return false;const cost=potentialCost(g),lines=rollPotentials(g.key,rng,gearTier(g));s.gold-=cost.gold;for(const [k,n] of Object.entries(cost.items))s.inventory[k]-=n;if(g.quantity>1){g.quantity--;const oldId=g.id;g={...g,id:'g'+s.nextGearId++,quantity:1};s.gear.push(g);if(s.slots[ITEMS[g.key].slot]===oldId)s.slots[ITEMS[g.key].slot]=g.id}g.potentials=lines;g.potentialVersion=2;potentialGearId=g.id;s.heroHp=Math.min(s.heroHp,heroMaxHp());upgradeRenderSignature='';syncLegacySlots();save();render();renderLoot();refreshPotentialDialog();notify('잠재 재설정 완료 · '+lines.length+'줄');return true}
function potentialProtected(g){return (g.potentials||[]).some(p=>p.grade>=2||['critical','leech','chain','reduction','bossReduction','regen','dodge','rage','dropMore','goldMore','cooldown'].includes(p.type))}
const LOADOUT_ROLES={
 balanced:{name:'균형 준비',icon:'◈',desc:'기본 능력과 잠재를 고르게 비교합니다.',focus:'처음이라면 균형 준비부터 시작하세요.'},
 hunt:{name:'숲 순찰',icon:'⌁',desc:'공격·공격 속도·이동을 우선합니다.',focus:'반복 사냥과 지역 이동에 맞춰 빠르게 순환합니다.'},
 boss:{name:'수호자 공략',icon:'♜',desc:'생존·피해 감소·단일 공격을 우선합니다.',focus:'이동보다 버티는 힘을 챙기세요. 승리를 보장하는 점수는 아닙니다.'},
 gather:{name:'보물 수집',icon:'✧',desc:'드롭·골드·이동을 우선합니다.',focus:'안정적으로 이기는 지역에서 재료와 골드를 모으세요.'}
};
function roleWeight(type,role){
 const offense=['atkFlat','atkPct','speedFlat','speedPct','critical','chain','rage'];
 const survival=['hpFlat','hpPct','defFlat','defPct','reduction','bossReduction','regen','dodge','leech','trinket'];
 const income=['drop','gold','dropMore','goldMore','pocket'];
 const movement=['moveFlat','movePct'];
 if(role==='hunt')return offense.includes(type)?1.5:movement.includes(type)?2:survival.includes(type)?.65:1;
 if(role==='boss')return type==='bossReduction'?3:survival.includes(type)?1.8:offense.includes(type)?1.25:movement.includes(type)||income.includes(type)?.25:1;
 if(role==='gather')return income.includes(type)?3:movement.includes(type)?1.5:offense.includes(type)?.7:survival.includes(type)?.6:1;
 return 1;
}
function potentialScore(g,role='balanced'){return (g.potentials||[]).reduce((n,p)=>n+p.value*roleWeight(p.type,role)*({atkFlat:8,atkPct:1000,speedFlat:500,speedPct:500,critical:400,leech:600,chain:600,hpFlat:1,hpPct:300,defFlat:8,defPct:150,reduction:2000,bossReduction:1000,regen:10000,dodge:1800,rage:200,moveFlat:100,movePct:100,cooldown:200,drop:100,gold:60,dropMore:180,goldMore:120,trinket:1,pocket:60}[p.type]||0),0)}
function advancePotential(dt){s.potentialBuff.left=Math.max(0,s.potentialBuff.left-dt);if(s.potentialBuff.left===0)s.potentialBuff.power=0;if(phase==='combat'&&s.heroHp>0)s.heroHp=Math.min(heroMaxHp(),s.heroHp+heroMaxHp()*Math.min(.01,potentialSum('regen'))*dt)}
function potentialHitEffects(dealt,rng=Math.random){if(s.heroHp>0)s.heroHp=Math.min(heroMaxHp(),s.heroHp+Math.min(heroMaxHp()*.02,dealt*Math.min(.06,potentialSum('leech'))));if(phase==='combat'&&rng()<Math.min(.1,potentialSum('chain'))){damage(attack()*.6);passiveNotice('잠재 · 연속 타격!')}}

const TRAILS=[
 {name:'이슬 맺힌 오솔길',icon:'❧',material:'crystal',relics:['이슬 잎맥','빛나는 씨앗','숲의 나침반']},
 {name:'반딧불 개울',icon:'✧',material:'dust',relics:['물결 조약돌','반딧불 등불','은빛 물방울']},
 {name:'잠든 돌의 정원',icon:'◇',material:'seal',relics:['이끼 문양','작은 석판','정원의 열쇠']}
];

const $=id=>document.getElementById(id), KEY='mosslight.save.v1';
const persistence=MosslightSaves.create(()=>localStorage);
let saveImportReloading=false;
const readSaveRaw=()=>persistence.readRaw();
const fresh=()=>({v:1,gold:50,stage:1,kills:0,total:0,attack:0,speed:0,crit:0,paused:false,lastSeen:Date.now(),coolUntil:0,inventory:{},equipped:null,weapon:null,bossWins:[0,0,0,0,0],move:0,discovered:[],encounters:{},defeated:{},journey:null,gearVersion:1,gear:[],slots:{ring:null,weapon:null,boots:null},nextGearId:1,highestStage:1,claimedMilestones:[],heroHp:null,vitality:0,guard:0,healUntil:0,deaths:0});
let s=fresh(),storageOK=true;
s.farmMode=false;s.expeditionReadyAt=0;try{const raw=JSON.parse(readSaveRaw())||{};s.farmMode=raw.farmMode===true;s.expeditionReadyAt=Math.max(0,Number(raw.expeditionReadyAt)||0)}catch{}
let quickBossId=null,quickBossSignature='';
s.potentialBuff={left:0,power:0};try{const raw=JSON.parse(readSaveRaw())||{};s.potentialBuff={left:Math.max(0,Math.min(4,Number(raw.potentialBuff?.left)||0)),power:Math.max(0,Math.min(.5,Number(raw.potentialBuff?.power)||0))}}catch{}
try{const raw=JSON.parse(readSaveRaw());if(raw&&raw.v===1){for(const k of ['gold','stage','kills','total','attack','speed','crit','lastSeen','coolUntil','move','vitality','guard','healUntil','deaths'])if(Number.isFinite(raw[k])&&raw[k]>=0)s[k]=raw[k];s.stage=Math.max(1,Math.floor(s.stage));s.attack=Math.min(500,Math.floor(s.attack));s.speed=Math.min(30,Math.floor(s.speed));s.crit=Math.min(45,Math.floor(s.crit));s.kills=Math.min(80,Math.floor(s.kills));s.move=Math.min(100,Math.floor(s.move));s.discovered=Array.isArray(raw.discovered)?raw.discovered.filter(k=>typeof k==='string'):[];s.encounters=raw.encounters&&typeof raw.encounters==='object'?raw.encounters:{};s.defeated=raw.defeated&&typeof raw.defeated==='object'?raw.defeated:{};s.journey=raw.journey&&typeof raw.journey==='object'?raw.journey:null;s.gearVersion=raw.gearVersion===1?1:0;s.gear=Array.isArray(raw.gear)?raw.gear:[];s.slots=raw.slots&&typeof raw.slots==='object'?raw.slots:{ring:null,weapon:null,boots:null};s.nextGearId=Math.max(1,Number(raw.nextGearId)||1);s.highestStage=Math.max(s.stage,Number.isFinite(raw.highestStage)?Math.floor(raw.highestStage):s.stage);s.claimedMilestones=Array.isArray(raw.claimedMilestones)?[...new Set(raw.claimedMilestones.filter(n=>Number.isInteger(n)&&n>=6))]:[];s.vitality=Math.min(100,Math.floor(s.vitality));s.guard=Math.min(100,Math.floor(s.guard));s.heroHp=Number.isFinite(raw.heroHp)?Math.max(0,raw.heroHp):null;s.paused=raw.paused===true;s.inventory=raw.inventory&&typeof raw.inventory==='object'?Object.fromEntries(Object.entries(raw.inventory).filter(([k,v])=>Number.isInteger(v)&&v>0&&v<1e12)):{};s.equipped=typeof raw.equipped==='string'?raw.equipped:null;s.weapon=typeof raw.weapon==='string'?raw.weapon:null;s.bossWins=Array.isArray(raw.bossWins)?[0,1,2,3,4].map(i=>Math.max(0,Math.floor(Number(raw.bossWins[i])||0))):[0,0,0,0,0];}}catch{storageOK=false}
try{const raw=JSON.parse(readSaveRaw())||{};s.balanceVersion=raw.balanceVersion||0;s.expedition=['queued','active','ready'].includes(raw.expedition)?raw.expedition:'idle';s.expeditionWins=Math.min(3,Math.max(0,Math.floor(raw.expeditionWins||0)));s.expeditionClears=Math.max(0,Math.floor(raw.expeditionClears||0));s.expeditionStage=Math.max(1,Math.floor(raw.expeditionStage||s.stage));s.blockLeft=Math.max(0,Math.min(2,raw.blockLeft||0));s.blockCooldown=Math.max(0,Math.min(7,raw.blockCooldown||0));}catch{}
s.expedition=s.expedition||'idle';s.expeditionWins=s.expeditionWins||0;s.expeditionClears=s.expeditionClears||0;s.blockLeft=s.blockLeft||0;s.blockCooldown=s.blockCooldown||0;
loadTrails();let trailSignature='';
loadFieldNotes();let findJournalSignature='',fieldNoteSignature='',specialSignature='';
s.research={hunt:0,elite:0,boss:0};s.researchClears=0;
try{const raw=JSON.parse(readSaveRaw())||{};for(const k of Object.keys(s.research))s.research[k]=Math.max(0,Math.min(({hunt:79,elite:2,boss:1})[k],Math.floor(Number(raw.research?.[k])||0)));s.researchClears=Math.max(0,Math.floor(Number(raw.researchClears)||0));}catch{}
let researchSignature='',gearSort='newest',bagSort='default',pendingBulk=null;
const PASSIVES={light:{name:'빛의 일격',rarity:'common',weight:70,desc:'전투 12초마다 공격력 180% 자동 타격'},guard:{name:'숲의 방벽',rarity:'rare',weight:10,desc:'피격 시 15% 확률로 해당 피해 35% 감소'},heal:{name:'응급 재생',rarity:'rare',weight:10,desc:'HP 40% 이하일 때 최대 HP 12% 자동 회복 · 재사용 20초'},haste:{name:'바람의 축복',rarity:'epic',weight:8,desc:'공격속도 6% 상시 증가'},leech:{name:'생명의 이슬',rarity:'legendary',weight:1.8,desc:'일반 공격 피해의 2% 흡수 · 1회 회복 최대 HP의 2%'},echo:{name:'새벽의 메아리',rarity:'mythic',weight:.2,desc:'일반 공격 후 5% 확률로 공격력 400% 추가 타격'}};
s.passives={};s.passiveClock={light:0,heal:20};s.draws=0;s.drawResult='';
try{const raw=JSON.parse(readSaveRaw())||{};for(const key of Object.keys(PASSIVES))s.passives[key]=Math.max(0,Math.min(5,Math.floor(Number(raw.passives?.[key])||0)));for(const key of ['light','heal'])s.passiveClock[key]=Math.max(0,Math.min(key==='light'?12:20,Number.isFinite(raw.passiveClock?.[key])?raw.passiveClock[key]:(key==='heal'?20:0)));s.draws=Math.max(0,Math.floor(Number(raw.draws)||0));}catch{}

const SPECIAL_PASSIVES={foxluck:{name:'여우의 직감',weight:60,desc:'드롭률 +3% (별도 곱연산)'},foxward:{name:'옥빛 수호',weight:30,desc:'보스 피해감소 +2%p (기존 25% 상한 공유)'},foxspirit:{name:'별여우 동행',weight:10,desc:'공격력 +3% (별도 곱연산)'}};
s.specialPassives={};s.specialActive=null;s.specialDraws=0;
try{const raw=JSON.parse(readSaveRaw())||{};for(const key of Object.keys(SPECIAL_PASSIVES))s.specialPassives[key]=Math.max(0,Math.min(3,Math.floor(Number(raw.specialPassives?.[key])||0)));s.specialActive=Object.hasOwn(SPECIAL_PASSIVES,raw.specialActive)&&s.specialPassives[raw.specialActive]?raw.specialActive:null;s.specialDraws=Math.max(0,Math.floor(Number(raw.specialDraws)||0))}catch{}
function specialPower(key){return s.specialActive===key&&s.specialPassives[key]?1+(s.specialPassives[key]-1)*.15:0}
function drawSpecial(rng=Math.random){if(!canMutate())return false;if(!(s.inventory.jadeorb>=1))return false;s.inventory.jadeorb--;s.specialDraws++;const key=pickPassive(SPECIAL_PASSIVES,rng);const lv=s.specialPassives[key]||0;let text='';if(!lv){s.specialPassives[key]=1;if(!s.specialActive)s.specialActive=key;text='신규 획득'}else if(lv<3&&rng()<(lv===1?.6:.3)){s.specialPassives[key]++;text='강화 성공'}else{award('skillstone',1);text=lv===3?'최대 레벨 중복 · 스킬석 1개 반환':'강화 실패 · 스킬석 1개 반환'}s.drawResult='특수 · '+SPECIAL_PASSIVES[key].name+' / '+text;notify(s.drawResult);log(s.drawResult);save();render();renderLoot();return key}
function renderSpecial(){const signature=JSON.stringify([s.inventory.jadeorb,s.specialDraws,s.specialActive,s.specialPassives]);if(signature===specialSignature)return;specialSignature=signature; $('special-wallet').textContent='옥구슬 '+(s.inventory.jadeorb||0)+'개 · 누적 '+s.specialDraws+'회';$('special-draw').disabled=!(s.inventory.jadeorb>=1);for(const [key,p] of Object.entries(SPECIAL_PASSIVES)){const lv=s.specialPassives[key]||0;$('special-'+key).textContent=p.name+' · '+p.weight+'% · '+(lv?'Lv.'+lv+'/3':'미보유')+' · '+(s.specialActive===key?'활성 중':lv?'활성화':'옥구슬로 획득');$('special-'+key).disabled=!lv;$('special-'+key).setAttribute('aria-pressed',String(s.specialActive===key))}}

const passivePower=key=>s.passives[key]?1+(s.passives[key]-1)*.2:0;
const BOSS_BALANCE=[
 {hp:7200,attack:46,penetration:.15,regen:.001,interval:2.4,every:4,power:1.65,skill:'왕관 박치기'},
 {hp:54000,attack:180,penetration:.20,regen:.0015,interval:2.2,every:4,power:1.8,skill:'돌뿌리 내려찍기'},
 {hp:360000,attack:440,penetration:.25,regen:.002,interval:2,every:3,power:1.65,skill:'숲울림 돌진'},
 {hp:780000,attack:650,penetration:.30,regen:.0025,interval:2.3,every:4,power:1.9,skill:'달빛 날갯짓'},
 {hp:1800000,attack:1000,penetration:.35,regen:.003,interval:2.5,every:3,power:1.75,skill:'도토리 망치'}
];
// Elite skill visuals observe the species attack defined by MOB_TEMPOS.
// They never add damage, random draws, status ailments or save fields.
const BOSS_SKILL_VISUALS=[
 {id:'crown',cue:'왕관의 금빛 파동',glyph:'♛'},
 {id:'root',cue:'솟구치는 돌뿌리',glyph:'◆'},
 {id:'charge',cue:'숲을 가르는 녹색 충격파',glyph:'✦'},
 {id:'moon',cue:'초승달과 은빛 깃털',glyph:'☾'},
 {id:'acorn',cue:'도토리 망치의 낙하',glyph:'♠'}
];
const ELITE_SKILLS={
 eliteSlime:{id:'moss',name:'이끼 탄성 강타',cue:'응축한 이끼 파동',glyph:'◆'},
 eliteMushroom:{id:'spore',name:'보랏빛 포자 폭발',cue:'퍼져 나가는 포자 고리',glyph:'✺'},
 eliteMoth:{id:'wing',name:'반짝 날개 칼바람',cue:'교차하는 빛의 날개',glyph:'✧'},
 eliteSnail:{id:'shell',name:'나선껍질 파동',cue:'겹쳐지는 나선 고리',glyph:'◎'},
 eliteRabbit:{...FIELD_SKILLS.rabbit,name:'새싹 맹렬 할퀴기',cue:'낮게 뛰어들어 앞발로 깊게 할퀩니다'}
};
const FOX_SKILL={id:'fox',name:'황금 꼬리 유성',cue:'황금빛 궤적과 옥빛 잔광',glyph:'✦'};
function enemySkill(){return boss?(bossCharged()?{...BOSS_SKILL_VISUALS[bossId],name:BOSS_BALANCE[bossId].skill}:null):currentMob==='treasure'?FOX_SKILL:ELITE_SKILLS[currentMob]||FIELD_SKILLS[currentMob]||null}
let bossStrikes=0;
function bossFrenzy(){return boss&&phase==='combat'&&hp>0&&hp/maxHp<=.35}
function bossCharged(){return boss&&(bossStrikes+1)%BOSS_BALANCE[bossId].every===0}
function bossBaseAttack(id,tier='normal'){return Math.round(BOSS_BALANCE[id].attack*BOSS_TIERS[tier].attack)}
function bossPenetration(id,tier='normal'){return Math.min(.6,BOSS_BALANCE[id].penetration+({normal:0,elite:.1,mystic:.2})[tier])}
// Future regeneration-reduction effects enter here; no anti-heal items are active yet.
function bossRegenPerSecond(id,tier='normal',reduction=0){return bossHealth(id,tier)*BOSS_BALANCE[id].regen*(1-Math.max(0,Math.min(1,Number.isFinite(reduction)?reduction:0)))}
function bossDefenseText(id,tier='normal'){return '방어 관통 '+pct(bossPenetration(id,tier))+' · 초당 재생 '+fmt(bossRegenPerSecond(id,tier))+' HP ('+pct(BOSS_BALANCE[id].regen)+')'}
function regenerateBoss(dt){if(boss&&phase==='combat'&&!s.paused&&hp>0)hp=Math.min(maxHp,hp+bossRegenPerSecond(bossId,bossTier)*dt)}
function bossPatternText(id){const b=BOSS_BALANCE[id];return bossDefenseText(id)+' · '+b.every+'번째 공격마다 '+b.skill+' ×'+b.power+' · HP 35% 이하 공격 +15%, 공격 간격 −15%'}
function renderBossPattern(){
 const active=phase==='combat',skill=active?enemySkill():null,charged=active&&boss&&bossCharged(),frenzy=active&&bossFrenzy(),remaining=Math.max(0,enemyInterval()-enemyClock);
 $('boss-pattern').hidden=!(active&&(boss||(skill&&(!skill.field||MOBS[currentMob]?.elite))));$('arena').classList.toggle('boss-charging',charged);$('arena').classList.toggle('boss-frenzy',frenzy);
 $('arena').setAttribute('data-skill',skill?.id||'');
 $('arena').classList.toggle('skill-charging',!!skill&&(boss||remaining<=.8)&&!s.paused&&!quietCombatEffects());
 if(!active||(!boss&&!skill))return;
 $('boss-pattern-name').textContent=(frenzy?'격앙 · ':'')+(skill?skill.name+' 준비':'수호자의 공세');
 $('boss-pattern-detail').textContent=skill?skill.cue+' · '+remaining.toFixed(1)+'초 · 예상 피해 '+fmt(incomingDamage()):'강타까지 '+(BOSS_BALANCE[bossId].every-bossStrikes%BOSS_BALANCE[bossId].every)+'회 · HP 35%부터 격앙';
}

const BOSS_TIERS={normal:{name:'일반',hp:1,attack:1,loot:1,cooldown:1,time:60},elite:{name:'엘리트',hp:8,attack:3,loot:3,cooldown:2,time:90},mystic:{name:'미스틱',hp:60,attack:12,loot:12,cooldown:4,time:120}};
s.bossReadyAt=[0,0,0,0,0];s.bossVariantWins={elite:0,mystic:0};
try{const raw=JSON.parse(readSaveRaw())||{};s.bossReadyAt=[0,1,2,3,4].map(i=>Number.isFinite(raw.bossReadyAt?.[i])?Math.max(0,raw.bossReadyAt[i]):0);for(const tier of ['elite','mystic'])s.bossVariantWins[tier]=Math.max(0,Math.floor(Number(raw.bossVariantWins?.[tier])||0));}catch{}
let bossDockSignature='';let bossTier='normal',bossEncounterStage=1,codexBossTier='normal',tickRendering=false,upgradeRenderSignature='',passiveRenderSignature='',bossListSignature='';
let phase='combat',phaseLeft=0,travelTotal=0,currentMob='slime',lastLoot=[],codexSelected='slime',codexFilter='mob';
let enemyClock=0,gearPopoverId=null;
let bossId=0,bossGate=false,boss=false,bossLeft=30,hp=0,maxHp=0,attackClock=0,lastTick=Date.now(),hiddenAt=null,toastTimer;
const attack=()=>attackAtLevel(s.attack);
const speed=()=>speedAtLevel(s.speed);
const crit=()=>Math.min(.75,.05+Math.min(30,s.crit)*.015+potentialSum('critical'));
const health=()=>Math.round(45*Math.pow(1.23,s.stage-1));
const reward=()=>Math.round(10*Math.pow(1.12,s.stage-1));
const requiredKills=()=>Math.min(24,12+2*Math.floor((s.stage-1)/5));
const bossHealth=(id,tier='normal',level=s.highestStage)=>Math.round(BOSS_BALANCE[id].hp*BOSS_TIERS[tier].hp);
const goldMultiplier=()=>(1+gearStat('ring','gold')+potentialSum('gold')+potentialSum('pocket'))*(1+collectionBonus('gold'))*potentialProduct('goldMore')*(1+trailBonus());
const fmt=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':Math.floor(n).toLocaleString('ko-KR');
const names=['이끼 숲의 입구','반딧불 오솔길','고대의 숲','끝없는 녹음'];
const upgrades={vitality:{name:'체력 단련',base:45,rate:1.20,max:100},guard:{name:'방어 훈련',base:55,rate:1.20,max:100},move:{name:'탐험 보폭',base:80,rate:1.18,max:30},attack:{name:'검 연마',base:30,rate:1.22,max:500},speed:{name:'바람의 장화',base:65,rate:1.35,max:30},crit:{name:'별빛 부적',base:95,rate:1.30,max:30}};
let buyMode=1;
const upgradePrice=(k,level)=>Math.floor(upgrades[k].base*Math.pow(upgrades[k].rate,level)*(['speed','crit','move'].includes(k)&&level>=10?1.5*Math.pow(1.06,level-10):1));
const cost=k=>upgradePrice(k,s[k]);
function notify(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5000)}
function log(msg){const p=document.createElement('p'),t=document.createElement('time');t.textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false});const text=document.createElement('span');text.textContent=msg;p.append(t,text);$('logs').prepend(p);while($('logs').children.length>4)$('logs').lastChild.remove()}
function save(){if(saveImportReloading)return false;if(!persistence.check()){storageOK=false;renderSaveStatus();return false}s.highestStage=Math.max(s.highestStage,s.stage);s.lastSeen=Date.now();s.journey={phase,phaseLeft,travelTotal,currentMob,boss,bossId,bossGate,bossLeft,bossTier,bossEncounterStage,bossStrikes,hp,maxHp,lastLoot,enemyClock,attackClock};try{if(!persistence.write(JSON.stringify(s)))throw Error(persistence.message);storageOK=true;$('save-status').textContent='✓ 자동 저장됨';$('saved-time').textContent='이 기기에 진행 상황 저장'}catch{storageOK=false;$('save-status').textContent='저장 불가';$('saved-time').textContent='브라우저 저장을 허용해 주세요'}renderSaveStatus();return storageOK}
const regionIndex=()=>Math.min(3,Math.floor((s.stage-1)/5));
const heroMaxHp=()=>hpAtLevel(s.vitality);
const heroDefense=()=>defenseAtLevel(s.guard);
function enemyAttack(){return Math.round((boss?bossBaseAttack(bossId,bossTier)*(bossFrenzy()?1.15:1)*(bossCharged()?BOSS_BALANCE[bossId].power:1):18*Math.pow(1.2,s.stage-1)*MOBS[currentMob].atk))}
const enemyInterval=()=>boss?BOSS_BALANCE[bossId].interval*(bossFrenzy()?.85:1)*(bossCharged()?1.35:1):MOBS[currentMob].interval;
function mobTempoText(key){const m=MOBS[key];return m.tempo+' · 공격 간격 '+m.interval.toFixed(2)+'초'}
const mitigation=()=>Math.min(.3,(equippedGear('chest')?.ward||0)+(equippedGear('legs')?.ward||0)+collectionBonus('reduction')+potentialSum('reduction'));
function incomingDamage(){return Math.max(1,Math.round(Math.max(0,enemyAttack()-heroDefense()*(boss?1-bossPenetration(bossId,bossTier):1))*(1-mitigation())*(boss?1-bossMitigation():1)))}
function defeatHero(){clearCombatEffects();const wasBoss=boss;s.potentialBuff={left:0,power:0};s.blockLeft=0;boss=false;s.heroHp=0;s.deaths++;phase='defeated';phaseLeft=8;travelTotal=8;attackClock=0;enemyClock=0;lastLoot=[];if(!wasBoss){s.stage=Math.max(1,s.stage-1);s.kills=0;s.safetyDefeats=Math.min(3,s.safetyDefeats+1);if(s.autoSafety&&s.safetyDefeats>=3){s.farmMode=true;log('안전 사냥 · 연속 사망으로 현재 지역 반복 사냥을 켰습니다. 장비를 준비한 뒤 자동 돌파를 다시 켜세요.')}}log('전투 불능 · 8초 후 회복'+(!wasBoss?' / 한 단계 후퇴':''));notify(s.autoSafety&&s.safetyDefeats>=3?'반복 사망으로 안전 사냥을 켰어요. 체력·방어를 준비한 뒤 돌파를 재개하세요.':'쓰러졌어요. 방어구와 생존 능력을 강화해 보세요.');save();renderLoot()}
function monsterHit(rng=Math.random){if(phase!=='combat'||s.paused||s.heroHp<=0)return false;const pendingDamage=incomingDamage(),heavy=boss&&bossCharged(),skill=enemySkill();if(boss)bossStrikes++;if(rng()<dodgeChance()){passiveNotice('잠재 · 공격 회피!');$('hero-damage').textContent='회피';animateStrike(true,false,heavy);castEnemySkill(skill,false);$('last-impact').textContent=(skill?skill.name+' · ':'')+'잠재 회피 · 받은 피해 0';render();return true}const blocked=passivePower('guard')>0&&rng()<.15; const hit=Math.max(1,Math.round(pendingDamage*(blocked?1-.35*passivePower('guard'):1)));s.blockLeft=0;showImpact(hit,false,true,blocked,heavy);castEnemySkill(skill);if(skill)$('last-impact').textContent=skill.name+' · 받은 피해 '+fmt(hit)+(blocked?' · 방어 성공':'');s.heroHp=Math.max(0,s.heroHp-hit);if(s.heroHp>0&&potentialSum('rage')>0){s.potentialBuff={left:4,power:Math.min(.5,potentialSum('rage'))};passiveNotice('잠재 · 4초간 공격력 ×'+(1+s.potentialBuff.power).toFixed(2))}const fx=$('hero-damage');fx.textContent='−'+fmt(hit);fx.classList.remove('hit');void fx.offsetWidth;fx.classList.add('hit');if(s.heroHp<=0)defeatHero();render();return true}
const movementSpeed=()=>moveAtLevel(s.move);
const regionPenalty=()=>[1,1.2,1.45,1.8][regionIndex()];
const travelDistance=()=> (3+Math.min(12,(s.stage-1)*.18))*regionPenalty();
const travelSeconds=()=>Math.max(1.2,travelDistance()/Math.pow(Math.max(1,movementSpeed()),.85));
const rareChance=()=>Math.min(.1,.0001*luck()*(s.equipped?1.5:1));
function ordinaryMobPool(){return regionIndex()===0?['slime','mushroom','snail']:regionIndex()===1?['slime','mushroom','moth','snail','rabbit']:['mushroom','moth','snail','rabbit']}
function chooseMob(rng=Math.random){if(rng()<rareChance())return 'treasure';if(s.stage>=3&&rng()<.04){const elites=s.stage>=6?(s.stage>=11?['eliteSlime','eliteMushroom','eliteMoth','eliteSnail','eliteRabbit']:['eliteSlime','eliteMushroom','eliteMoth','eliteSnail']):['eliteSlime','eliteMushroom'];return elites[Math.min(elites.length-1,Math.floor(rng()*elites.length))]}const pool=ordinaryMobPool();return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))]}
function spawn(){encounterSerial++;if(boss)bossStrikes=0;phase='combat';phaseLeft=0;if(!boss)currentMob=chooseMob();const id=boss?'boss'+bossId:currentMob;s.encounters[id]=(Number(s.encounters[id])||0)+1;maxHp=boss?bossHealth(bossId,bossTier,bossEncounterStage):Math.round(health()*MOBS[currentMob].hp);hp=maxHp;attackClock=0;enemyClock=0;if(currentMob==='treasure'&&!boss){log('희귀 조우! 황금 보물여우가 나타났어요.');notify('✦ 황금 보물여우 등장! 보물을 놓치지 마세요.')}if(!boss&&MOBS[currentMob].elite){log('엘리트 조우 · '+MOBS[currentMob].name);notify('◆ 엘리트 등장! 강한 공격에 대비하세요.')}save();renderCodex()}
function beginTravel(){phase='travel';travelTotal=travelSeconds();phaseLeft=travelTotal;attackClock=0;save()}
function startRecovery(){phase='loot';phaseLeft=.8;hp=0;attackClock=0;save()}
function offline(ms){if(persistence.status==='conflict'||s.rewardPending||s.paused||boss||phase==='defeated'||s.journey?.boss===true||s.journey?.phase==='defeated'||!Number.isFinite(ms)||ms<15000)return;const seconds=Math.min(Math.max(0,ms/1000),28800);const combatSeconds=Math.max(1,Math.ceil(health()/(attack()*(1+crit()))))/speed();const estimatedDps=Math.max(...ordinaryMobPool().map(key=>Math.max(1,Math.round(Math.max(0,18*Math.pow(1.2,s.stage-1)*MOBS[key].atk-heroDefense())*(1-mitigation())))/MOBS[key].interval));if(heroMaxHp()/estimatedDps<combatSeconds*1.4){log('현재 지역에서 생존이 어려워 오프라인 골드를 얻지 못했어요.');return}const rate=reward()/(combatSeconds+.8+travelSeconds())*.5;const gain=Math.floor(seconds*rate*goldMultiplier());if(gain>0){s.gold+=gain;log('쉬는 동안 모은 골드 +'+fmt(gain)+' G');notify('다시 오셨네요! 오프라인 보상 +'+fmt(gain)+' G')}}
function upgradeQuote(k,mode=1){if(!Object.hasOwn(upgrades,k)||![1,10,100,'max'].includes(mode))throw Error('올바르지 않은 강화 선택입니다.');const spec=upgrades[k],remaining=spec.max-s[k];let count=0,total=0;const limit=mode==='max'?remaining:Math.min(mode,remaining);for(let i=0;i<limit;i++){const price=upgradePrice(k,s[k]+i);if(mode==='max'&&total+price>s.gold)break;total+=price;count++}return {count,total,target:s[k]+count,canAfford:count>0&&total<=s.gold,capped:remaining<=0,nextCost:cost(k)}}
function upgrade(k,mode=1){if(!canMutate())return {ok:false,reason:'다른 탭의 진행을 새로고침해 주세요.'};const quote=upgradeQuote(k,mode);if(!quote.canAfford)return {ok:false,reason:quote.capped?'최대 레벨입니다.':'골드가 부족합니다.'};s.gold-=quote.total;s[k]=quote.target;log(upgrades[k].name+' +'+quote.count+'회 · '+fmt(quote.total)+' G 사용');save();render();renderLoot();return {ok:true,level:s[k],gold:s.gold,count:quote.count,spent:quote.total}}
function upgradeValue(k,level){if(k==='vitality')return fmt(hpAtLevel(level));if(k==='guard')return fmt(defenseAtLevel(level));if(k==='attack')return fmt(attackAtLevel(level));if(k==='speed')return speedAtLevel(level).toFixed(2)+'/s';if(k==='crit')return pct(Math.min(.75,.05+level*.015+potentialSum('critical')));return moveAtLevel(level).toFixed(2)+'m/s'}
function renderUpgrades(){const signature=JSON.stringify([s.gold,buyMode,...Object.keys(upgrades).map(k=>s[k]),s.slots,s.discovered.length,s.bossWins,s.highestStage,s.passives]);if(signature===upgradeRenderSignature)return;upgradeRenderSignature=signature;for(const k of Object.keys(upgrades)){const q=upgradeQuote(k,buyMode),b=$(k+'-buy');$(k+'-level').textContent='Lv.'+s[k]+' / '+upgrades[k].max;b.disabled=!q.canAfford;b.textContent=q.capped?'최대 레벨':q.count>0?q.count+'회 강화\n◆ '+fmt(q.total)+' G':'골드 부족\n◆ '+fmt(q.nextCost)+' G';b.title=q.capped?'최대 레벨에 도달했습니다.':(q.count||1)+'회 총 비용: '+(q.count?q.total:q.nextCost).toLocaleString('ko-KR')+' 골드';b.setAttribute('aria-label',upgrades[k].name+' '+b.title);$(k+'-effect').textContent=upgradeValue(k,s[k])+(q.count?' → '+upgradeValue(k,q.target):'');} $('forge-gold').textContent='◆ '+fmt(s.gold)+' G';}
function setBuyMode(mode){if(![1,10,100,'max'].includes(mode))return false;buyMode=mode;for(const id of ['1','10','100','max'])$('buy-mode-'+id).setAttribute('aria-pressed',String(String(mode)===id));renderUpgrades();return true}
function damage(amount,critical=false){if(!Number.isFinite(amount)||amount<=0)return;if(phase!=='combat'||s.paused)return;hp-=amount;showImpact(amount,critical);if(hp<=0){const wasBoss=boss;const gearStart=s.nextGearId;const victoryName=wasBoss?BOSSES[bossId].name:MOBS[currentMob].name;const wonSpecial=wasBoss||currentMob==='treasure';const victorySeconds=wasBoss?Math.max(0,BOSS_TIERS[bossTier].time-bossLeft):0;let extraCombatGold=0;const defeatedId=wasBoss?'boss'+bossId:currentMob;if(wasBoss&&bossTier!=='normal'){s.bossVariantWins[bossTier]++;const variantId=defeatedId+'_'+bossTier;s.defeated[variantId]=(Number(s.defeated[variantId])||0)+1;}s.defeated[defeatedId]=(Number(s.defeated[defeatedId])||0)+1;const g=Math.floor((wasBoss?[600,2400,9600,18000,36000][bossId]*(bossTier==='mystic'?12:bossTier==='elite'?3:1):reward()*(MOBS[currentMob]?.elite?4:currentMob==='treasure'?20:1))*goldMultiplier());s.gold+=g;s.total++;if(wasBoss){s.bossWins[bossId]++;log(BOSS_TIERS[bossTier].name+' '+BOSSES[bossId].name+' 격파! +'+fmt(g)+' G');lastLoot=rollLoot(true,bossId);if(s.bossWins[bossId]===1){const firstKey=['ring','scoutboots','mossblade','owlcoat','acornblade'][bossId];const firstGear=award(firstKey,1,Math.random,BOSSES[bossId].name,bossGearTier(bossId,bossTier));lastLoot.push({key:firstKey,count:1});log('첫 격파 보상! '+ITEMS[firstKey].name+' · '+optionText(firstGear));}boss=true;if(bossGate){s.stage++;s.highestStage=Math.max(s.highestStage,s.stage);s.kills=0;log('다음 스테이지가 열렸어요.')}notify('보스 처치! 전리품을 인벤토리에서 확인하세요.')}else{s.safetyDefeats=0;lastLoot=rollLoot(false);s.kills=Math.min(requiredKills(),s.kills+1);if(s.total%3===1)log(MOBS[currentMob].name+' 처치 · +'+fmt(g)+' G');if(s.kills>=requiredKills()){if(s.farmMode){s.kills=0}else{s.stage++;s.highestStage=Math.max(s.highestStage,s.stage);s.kills=0;log('스테이지 '+s.stage+'에 도착했어요.')}}}progressTrail(wasBoss,defeatedId);progressResearch(wasBoss,defeatedId);if(wonSpecial)captureBattleReward({kind:wasBoss?'boss':'treasure',tier:wasBoss?bossTier:'normal',name:victoryName,gold:g+extraCombatGold,bossId,gearStart,firstClear:wasBoss&&s.bossWins[bossId]===1,seconds:victorySeconds});else startRecovery();renderLoot()}render()}
function startBoss(id=0,rng=Math.random,normalOnly=false){if(!canMutate())return false;if(s.rewardPending||phase==='defeated'||s.heroHp<=0||boss||s.paused||(currentMob==='treasure'&&phase==='combat')||!Number.isInteger(id)||id<0||id>=BOSSES.length||!bossUnlocked(id)||bossRemaining(id)>0)return false;bossId=id;bossGate=false;bossTier=normalOnly===true?'normal':rollBossTier(rng);bossEncounterStage=s.highestStage;boss=true;bossLeft=BOSS_TIERS[bossTier].time;s.bossReadyAt[id]=Date.now()+bossCooldown(id,bossTier)*1000;spawn();$('boss-dialog').close();$('quick-boss-dialog').close();showView('battle');log(BOSS_TIERS[bossTier].name+' '+BOSSES[id].name+' 등장 · 제한 '+bossLeft+'초');notify(BOSS_TIERS[bossTier].name+' 보스 등장!');render();return true}
function render(){if(tickRendering)return;renderCrafting();renderFieldNotes();renderResearch();renderFarmMode();renderQuickBoss();renderBossDock();renderExpedition();renderPassives();const region=Math.min(3,Math.floor((s.stage-1)/5));$('gold').textContent=fmt(s.gold);$('stage').textContent='STAGE '+s.stage+'–'+Math.min(requiredKills(),s.kills+1);$('zone').textContent=names[region];$('enemy-name').textContent=boss?BOSS_TIERS[bossTier].name+' '+BOSSES[bossId].name+' · BOSS':MOBS[currentMob].name+(MOBS[currentMob].elite?' · ELITE':'');$('enemy-hp-label').textContent=fmt(Math.max(0,hp))+' / '+fmt(maxHp);$('enemy-hp').style.width=Math.max(0,hp/maxHp*100)+'%';$('progress-label').textContent=s.kills+' / '+requiredKills();$('progress-bar').style.width=s.kills/requiredKills()*100+'%';$('reward-label').textContent=boss?'남은 시간 '+Math.ceil(bossLeft)+'초':'처치 보상 +'+fmt(Math.floor(reward()*(MOBS[currentMob]?.elite?4:currentMob==='treasure'?20:1)*goldMultiplier()))+' G';$('battle-status').textContent=s.paused?'Ⅱ 모험 쉬는 중':boss?'● 보스 전투 중':'● 자동 사냥 중';$('pause').textContent=s.paused?'▶ 사냥 재개':'Ⅱ 일시 정지';$('arena').classList.toggle('boss-arena',boss);$('boss').disabled=phase==='defeated'||boss||s.paused||(currentMob==='treasure'&&phase==='combat');$('boss').textContent=boss?'♜ 전투 중':'♜ 보스 원정';$('battle-hint').textContent=boss?BOSS_TIERS[bossTier].time+'초 안에 처치하세요. 패시브가 자동 발동합니다.':!bossUnlocked(0)?'첫 보스 해금까지 몬스터 '+(10-s.total)+'마리 · 보스 원정에서 보상을 확인하세요.':'스테이지는 자동 진행됩니다. 보스 원정에서 재도전 시간을 확인하세요.';$('atk').textContent=fmt(attack());$('speed').textContent=speed().toFixed(2)+'/s';$('crit').textContent=Math.round(crit()*100)+'%';$('hero-level').textContent='Lv. '+(1+Math.floor(s.total/10));$('title-text').textContent=s.stage<6?'작은 모험의 시작':'숲이 기억하는 모험가';renderUpgrades();renderHero();renderHeroStats();renderTravel();renderEncounter();renderBossPattern();$('boss-timer').hidden=!boss||phase!=='combat';$('boss-seconds').textContent=Math.max(0,bossLeft).toFixed(1);$('boss-time-fill').style.width=Math.max(0,bossLeft/BOSS_TIERS[bossTier].time*100)+'%';$('boss-timer').classList.toggle('urgent',bossLeft<=10);$('chapter-label').textContent='챕터 1 · 지역 '+(region+1)+' / 4';for(let i=0;i<4;i++){const el=$('journey-'+i);el.classList.toggle('active',i===region);el.querySelector('b').textContent=i===region?'탐험 중':i<region?'완료':'잠김'}}
$('pause').onclick=()=>{s.paused=!s.paused;save();render()};$('boss').onclick=openQuickBoss;for(const k of Object.keys(upgrades))$(k+'-buy').onclick=()=>upgrade(k,buyMode);$('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=()=>$('help-dialog').close();
const ITEMS={
"jadeorb":{"name": "황금여우의 옥구슬", "icon": "◉", "rarity": "mythic", "desc": "황금 보물여우 전용 기본 5% 드롭. 드롭률 적용, 최종 25% 상한. 특수 패시브 상점에서 1개로 1회 뽑기."},"snailshell":{"name": "이슬 나선껍질", "icon": "◌", "rarity": "rare", "desc": "이슬 달팽이와 엘리트 달팽이의 제작 재료."},"budfluff":{"name": "새싹 솜털", "icon": "❧", "rarity": "rare", "desc": "새싹 토끼와 엘리트 토끼의 제작 재료."},"royalshell":{"name": "왕관 등딱지", "icon": "⬡", "rarity": "epic", "desc": "왕관 쓴 꼬마 거북 전용 재료. 왕관등갑 제작에 사용."},"runestone":{"name": "잠든 돌의 룬", "icon": "◇", "rarity": "epic", "desc": "낮잠꾸러기 돌돌이 전용 재료. 룬각반 제작에 사용."},"groveheart":{"name": "몽글 숲의 심장", "icon": "❖", "rarity": "epic", "desc": "숲길 대장 몽글이 전용 재료. 숲울림검 제작에 사용."},"moonfeather":{"name": "루루의 달깃", "icon": "✧", "rarity": "epic", "desc": "달잠 부엉이 루루 전용 재료."},"acorniron":{"name": "밤톨의 호박철", "icon": "◆", "rarity": "epic", "desc": "도토리 기사 밤톨 전용 재료."},"owlcoat":{"name": "달깃 탐사 망토", "icon": "♜", "rarity": "epic", "slot": "chest", "hp": 210, "armor": 10, "desc": "상의 · HP +210 / 방어 +10. 루루 첫 격파 보상."},"acornblade":{"name": "밤톨 연습 망치", "icon": "⚔", "rarity": "epic", "slot": "weapon", "damage": 0.27, "desc": "무기 · 공격력 +27%. 밤톨 첫 격파 보상."},"shellcoat":{"name": "왕관등갑", "icon": "♜", "rarity": "legendary", "slot": "chest", "hp": 300, "armor": 28, "desc": "상의 · HP +300 / 방어 +28. 꼬마 거북 전용 설계도 제작."},"runelegs":{"name": "잠든 룬각반", "icon": "Ⅱ", "rarity": "legendary", "slot": "legs", "hp": 140, "armor": 55, "desc": "하의 · HP +140 / 방어 +55. 돌돌이 전용 설계도 제작."},"groveblade":{"name": "숲울림검", "icon": "⚔", "rarity": "legendary", "slot": "weapon", "damage": 0.42, "desc": "무기 · 공격력 +42%. 몽글이 전용 설계도 제작."},"moonboots":{"name": "월영 발걸음", "icon": "🥾", "rarity": "legendary", "slot": "boots", "movement": 0.44, "desc": "신발 · 이동속도 +44%. 루루 전용 설계도 제작."},"acorncoat":{"name": "호박철 맹세", "icon": "♜", "rarity": "mythic", "slot": "chest", "hp": 460, "armor": 34, "desc": "상의 · HP +460 / 방어 +34. 밤톨 전용 설계도 제작."},"foxring":{"name": "여우별 옥가락지", "icon": "◎", "rarity": "mythic", "slot": "ring", "gold": 0.8, "luck": 1.2, "desc": "반지 · 골드 +80% / 드롭 +120%. 보물여우 전용 설계도 제작."},"dewboots":{"name": "이슬 산책화", "icon": "🥾", "rarity": "epic", "slot": "boots", "movement": 0.22, "desc": "신발 · 이동속도 +22%. 달팽이 껍질 제작."},"budcoat":{"name": "새싹 솜누비", "icon": "♜", "rarity": "epic", "slot": "chest", "hp": 170, "armor": 15, "desc": "상의 · HP +170 / 방어 +15. 토끼 솜털 제작."},"bp_shellcoat":{"name": "왕관등갑 설계도", "icon": "▧", "rarity": "legendary", "blueprint": "shellcoat", "desc": "왕관 쓴 꼬마 거북 전용 드롭. 최초 획득으로 제작법 영구 해금. 제작 시 설계도는 소모하지 않습니다. 중복은 재료로 자동 전환됩니다."},"bp_runelegs":{"name": "잠든 룬각반 설계도", "icon": "▧", "rarity": "legendary", "blueprint": "runelegs", "desc": "낮잠꾸러기 돌돌이 전용 드롭. 최초 획득으로 제작법 영구 해금. 제작 시 설계도는 소모하지 않습니다. 중복은 재료로 자동 전환됩니다."},"bp_groveblade":{"name": "숲울림검 설계도", "icon": "▧", "rarity": "legendary", "blueprint": "groveblade", "desc": "숲길 대장 몽글이 전용 드롭. 최초 획득으로 제작법 영구 해금. 제작 시 설계도는 소모하지 않습니다. 중복은 재료로 자동 전환됩니다."},"bp_moonboots":{"name": "월영 발걸음 설계도", "icon": "▧", "rarity": "legendary", "blueprint": "moonboots", "desc": "달잠 부엉이 루루 전용 드롭. 최초 획득으로 제작법 영구 해금. 제작 시 설계도는 소모하지 않습니다. 중복은 재료로 자동 전환됩니다."},"bp_acorncoat":{"name": "호박철 맹세 설계도", "icon": "▧", "rarity": "mythic", "blueprint": "acorncoat", "desc": "도토리 기사 밤톨 전용 드롭. 최초 획득으로 제작법 영구 해금. 제작 시 설계도는 소모하지 않습니다. 중복은 재료로 자동 전환됩니다."},"bp_foxring":{"name": "여우별 옥가락지 설계도", "icon": "▧", "rarity": "mythic", "blueprint": "foxring", "desc": "황금 보물여우 전용 드롭. 최초 획득으로 제작법 영구 해금. 제작 시 설계도는 소모하지 않습니다. 중복은 재료로 자동 전환됩니다."},

 seal:{name:'숲 조사 증표',icon:'❧',rarity:'rare',desc:'반복 조사 의뢰를 자동 완료하면 얻습니다. 영웅 제작 장비의 재료입니다.'},
 mossblade:{name:'이끼빛 정찰검',icon:'⚔',rarity:'epic',slot:'weapon',damage:.24,desc:'무기 · 공격력 +24%. 조사 증표로 제작하는 영웅 장비.'},
 scoutcoat:{name:'숲지기 탐사복',icon:'♜',rarity:'epic',slot:'chest',hp:190,armor:12,desc:'상의 · 최대 HP +190, 방어력 +12. 제작 시 가호 10%.'},
 scoutlegs:{name:'숲지기 탐사 바지',icon:'Ⅱ',rarity:'epic',slot:'legs',hp:65,armor:36,desc:'하의 · 최대 HP +65, 방어력 +36. 제작 시 가호 10%.'},
 scoutboots:{name:'반딧불 길잡이 신발',icon:'🥾',rarity:'epic',slot:'boots',movement:.24,desc:'신발 · 이동속도 +24%. 조사 증표로 제작하는 영웅 장비.'},

 stone_common:{name:'일반 강화석',icon:'◇',rarity:'common',desc:'일반 장비 분해 재료. 추후 장비 강화에 사용하며 현재는 보관합니다.'},
 stone_rare:{name:'희귀 강화석',icon:'◇',rarity:'rare',desc:'희귀 잠재 재설정과 조사 증표를 이용한 영웅 장비 제작에 사용합니다.'},
 stone_epic:{name:'영웅 강화석',icon:'◇',rarity:'epic',desc:'영웅 장비 분해 재료. 같은 등급 장비의 잠재 옵션 재설정에 사용합니다.'},
 stone_legendary:{name:'전설 강화석',icon:'◇',rarity:'legendary',desc:'전설 장비 분해 재료. 같은 등급 장비의 잠재 옵션 재설정에 사용합니다.'},
 stone_mythic:{name:'신화 강화석',icon:'◇',rarity:'mythic',desc:'신화 장비 분해 재료. 같은 등급 장비의 잠재 옵션 재설정에 사용합니다.'},
 skillstone:{name:'작은 숲의 스킬석',icon:'◈',rarity:'epic',desc:'패시브 상점에서 3개로 1회 뽑기. 일반 0.5%, 엘리트 2.5%, 보스 6% 기본 드롭률. 드롭률 장비 적용.'},
 dew:{name:'단단한 이슬방울',icon:'◆',rarity:'epic',desc:'엘리트 슬라임 전용 수집품. 이슬 수집 세트에 사용합니다.'},
 cap:{name:'반짝 버섯 단추',icon:'✦',rarity:'epic',desc:'엘리트 버섯 전용 수집품.'},
 moonshard:{name:'푸른 달빛 조각',icon:'◇',rarity:'epic',desc:'엘리트 나방 전용 수집품.'},
 medal:{name:'작은 숲의 훈장',icon:'❖',rarity:'legendary',desc:'엘리트가 1% 확률로 남기는 희귀 수집품. 드롭률 영향을 받습니다.'},
 practiceblade:{name:'나뭇가지 연습검',icon:'⚔',rarity:'rare',slot:'weapon',damage:.12,desc:'무기 · 기본 공격력 +12%. 제작으로 얻는 첫 연습검.'},
 moss:{name:'말랑한 이끼',icon:'♧',rarity:'common',desc:'슬라임이 남긴 재료. 첫 행운 장신구 제작에 사용합니다.'},
 crystal:{name:'숲의 결정',icon:'◇',rarity:'rare',desc:'숲의 마력이 깃든 재료. 첫 행운 장신구 제작에 사용합니다.'},
 dust:{name:'별빛 가루',icon:'✧',rarity:'epic',desc:'희귀한 수집 재료. 상위 행운 장신구 제작에 사용합니다.'},
 seed:{name:'태초의 씨앗',icon:'❖',rarity:'mythic',desc:'극악 확률로 발견되는 수집품. 숲의 첫 생명을 품고 있습니다.'},
 core:{name:'수호자의 핵',icon:'⬡',rarity:'rare',desc:'모든 보스의 확정 보상. 상위 행운 장신구 제작에 사용합니다.'},
 leaf:{name:'잎새 행운 반지',icon:'♧',rarity:'rare',slot:'ring',gold:.1,luck:.25,desc:'반지 · 기본 드롭률 +25%, 골드 획득량 +10%. 개별 추가 옵션은 장비창에서 확인하세요.'},
 charm:{name:'별빛 행운 반지',icon:'✦',rarity:'epic',slot:'ring',gold:.2,luck:.5,desc:'반지 · 기본 드롭률 +50%, 골드 획득량 +20%. 개별 추가 옵션은 장비창에서 확인하세요.'},
 ring:{name:'수호자의 반지',icon:'◎',rarity:'epic',slot:'ring',gold:.35,luck:.75,desc:'반지 · 기본 드롭률 +75%, 골드 획득량 +35%. 보스와 보물여우가 드롭합니다.'},
 crown:{name:'태초의 인장 반지',icon:'♛',rarity:'mythic',slot:'ring',gold:.6,luck:1.5,desc:'반지 · 기본 드롭률 +150%, 골드 획득량 +60%. 보스와 보물여우가 드롭합니다.'},
 spore:{name:'보랏빛 포자',icon:'♧',rarity:'common',desc:'걷는 버섯의 작은 포자. 몬스터 도감 수집 재료입니다.'},wing:{name:'달빛 날개가루',icon:'✧',rarity:'rare',desc:'달빛 나방이 남긴 빛나는 수집 재료입니다.'},amber:{name:'황금 여우의 호박석',icon:'◆',rarity:'legendary',desc:'보물여우만 남기는 확정 전리품. 극히 드문 만남을 증명하는 수집품입니다.'},
 boots:{name:'숲길 탐험화',icon:'🥾',rarity:'rare',slot:'boots',movement:.15,desc:'신발 · 기본 이동속도 +15%. 모은 재료로 제작하는 기본 탐험 장비입니다.'},windboots:{name:'수호자의 바람 장화',icon:'🥾',rarity:'legendary',slot:'boots',movement:.4,desc:'신발 · 기본 이동속도 +40%. 보스가 드롭하는 상위 장비입니다.'},royalblade:{name:'태초의 파수검',icon:'⚔',rarity:'mythic',slot:'weapon',damage:.8,desc:'무기 · 기본 공격력 +80%. 숲길 대장 몽글이와 미스틱 보스에게서 얻습니다.'},
 tunic:{name:'새싹 모험복',icon:'♜',rarity:'rare',slot:'chest',hp:100,armor:5,desc:'상의 · 기본 최대 HP +100, 방어력 +5. 추가 옵션이 두 능력치에 적용됩니다.'},trousers:{name:'숲길 경갑',icon:'Ⅱ',rarity:'rare',slot:'legs',hp:30,armor:20,desc:'하의 · 기본 최대 HP +30, 방어력 +20.'},guardiancoat:{name:'수호자의 흉갑',icon:'♜',rarity:'legendary',slot:'chest',hp:350,armor:20,desc:'상의 · 기본 최대 HP +350, 방어력 +20. 보스와 보물여우의 전리품.'},guardianlegs:{name:'수호자의 각반',icon:'Ⅱ',rarity:'legendary',slot:'legs',hp:100,armor:60,desc:'하의 · 기본 최대 HP +100, 방어력 +60. 보스와 보물여우의 전리품.'},
 sunblade:{name:'여명의 검',icon:'⚔',rarity:'legendary',slot:'weapon',damage:.35,weapon:true,desc:'보스·보물여우 무기 · 장착 시 공격력 +35%. 장신구와 함께 사용 가능.'}
};
for(const key of ["jadeorb", "snailshell", "budfluff", "royalshell", "runestone", "groveheart", "moonfeather", "acorniron", "owlcoat", "acornblade", "shellcoat", "runelegs", "groveblade", "moonboots", "acorncoat", "foxring", "dewboots", "budcoat", "bp_shellcoat", "bp_runelegs", "bp_groveblade", "bp_moonboots", "bp_acorncoat", "bp_foxring"])ITEMS[key].discoveryBonus=.002;
for(const [key,item] of Object.entries(ITEMS))item.painting=item.blueprint?'blueprint':item.slot?key:MATERIAL_ART[key];
const BOSSES=[{name:'왕관 쓴 꼬마 거북',unlock:1,desc:'몬스터 10마리 처치 시 해금'},{name:'낮잠꾸러기 돌돌이',unlock:6,desc:'스테이지 6 도달 시 해금'},{name:'숲길 대장 몽글이',unlock:11,desc:'스테이지 11 도달 시 해금'}, {name:'달잠 부엉이 루루',unlock:16,desc:'스테이지 16 도달 시 해금'}, {name:'도토리 기사 밤톨',unlock:21,desc:'스테이지 21 도달 시 해금'}];
const MOBS={
"snail":{"name": "이슬 달팽이", "image": "snail-sprite.webp", "sprite": true, "hp": 1.3, "atk": 1.1, "habitat": "스테이지 1+ · 나선껍질 수집", "drops": [["snailshell", 0.6], ["crystal", 0.2], ["boots", 0.012]]},"rabbit":{"name": "새싹 토끼", "image": "rabbit-sprite.webp", "sprite": true, "hp": 1.35, "atk": 1.15, "habitat": "스테이지 6+ · 새싹 솜털 수집", "drops": [["budfluff", 0.6], ["moss", 0.35], ["tunic", 0.025]]},"eliteSnail":{"name": "반짝 등껍질 달팽이", "image": "snail-sprite.webp", "sprite": true, "elite": true, "hp": 5, "atk": 2.8, "habitat": "스테이지 6+ · 엘리트 · 나선껍질 확정", "drops": [["snailshell", 1], ["dew", 0.2], ["medal", 0.01], ["crystal", 0.6]]},"eliteRabbit":{"name": "씩씩한 새싹 토끼", "image": "rabbit-sprite.webp", "sprite": true, "elite": true, "hp": 5.2, "atk": 2.8, "habitat": "스테이지 11+ · 엘리트 · 솜털 확정", "drops": [["budfluff", 1], ["cap", 0.2], ["medal", 0.01], ["dust", 0.3]]},

 eliteSlime:{name:'단단한 이끼 슬라임',elite:true,image:'cute-slime.webp',hp:4,habitat:'스테이지 3+ · 엘리트 조우 4% 중 무작위 · HP 4배 / 골드 4배',drops:[['moss',1],['dew',.35],['medal',.01],['tunic',.12],['crystal',.7]]},
 eliteMushroom:{name:'씩씩한 보라버섯',elite:true,image:'cute-mushroom.webp',hp:4.8,habitat:'스테이지 3+ · 엘리트 조우 4% 중 무작위 · HP 4.8배 / 골드 4배',drops:[['spore',1],['cap',.35],['medal',.01],['trousers',.12],['crystal',.7]]},
 eliteMoth:{name:'반짝 날개 나방',elite:true,image:'moth.webp',hp:5.6,habitat:'스테이지 6+ · 엘리트 조우 4% 중 무작위 · HP 5.6배 / 골드 4배',drops:[['wing',1],['moonshard',.35],['medal',.01],['charm',.025],['dust',.4]]},
 slime:{name:'이끼 슬라임',image:'cute-slime.webp',hp:1,habitat:'스테이지 1–10 · 높은 확률의 이끼 재료',drops:[['moss',.7],['crystal',.25],['dust',.02],['leaf',.01],['tunic',.025],['seed',.0001]]},
 mushroom:{name:'걷는 보라버섯',image:'mushroom.webp',hp:1.2,habitat:'모든 지역 · 포자와 숲의 결정',drops:[['spore',.7],['moss',.35],['crystal',.3],['dust',.03],['leaf',.012],['boots',.01],['trousers',.025],['seed',.00012]]},
 moth:{name:'달빛 나방',image:'moth.webp',hp:1.4,habitat:'스테이지 6 이상 · 별빛 가루가 풍부한 적',drops:[['wing',.7],['crystal',.45],['dust',.08],['charm',.005],['boots',.02],['seed',.00015]]},
 treasure:{name:'황금 보물여우',image:'treasure.webp',hp:6,habitat:'모든 지역 · 이동 완료마다 극악 확률로 조우',drops:[['amber',1],['dust',1],['seed',1],['ring',.2],['sunblade',.1],['crown',.01],['guardiancoat',.15],['guardianlegs',.15]]}
};
// Agile enemies strike first against an untrained hero; heavier bodies wind up longer.
// Per-hit strength offsets cadence so fast enemies do not inherit heavy-strike damage.
const MOB_TEMPOS={
 slime:{interval:2.4,atk:1,tempo:'느긋한 탄성'},
 mushroom:{interval:2.6,atk:1.15,tempo:'신중한 포자 준비'},
 snail:{interval:3.2,atk:1.35,tempo:'느린 껍질 강타'},
 rabbit:{interval:.95,atk:.65,tempo:'민첩한 도약'},
 moth:{interval:.85,atk:.7,tempo:'재빠른 날갯짓'},
 eliteSlime:{interval:1.8,atk:2.8,tempo:'응축된 탄성'},
 eliteMushroom:{interval:2.3,atk:3.1,tempo:'묵직한 포자 폭발'},
 eliteSnail:{interval:2.8,atk:3.6,tempo:'느린 나선 강타'},
 eliteRabbit:{interval:.8,atk:1.5,tempo:'연속 도약'},
 eliteMoth:{interval:.7,atk:1.4,tempo:'쉴 틈 없는 칼바람'},
 treasure:{interval:.85,atk:2.2,tempo:'날쌘 꼬리 유성'}
};
for(const [key,tempo] of Object.entries(MOB_TEMPOS))Object.assign(MOBS[key],tempo);
const BOSS_TABLES=[[["core", 1], ["royalshell", 1], ["crystal", 0.75], ["ring", 0.08], ["guardiancoat", 0.04], ["bp_shellcoat", 0.02]], [["core", 1], ["runestone", 1], ["dust", 0.55], ["guardianlegs", 0.07], ["windboots", 0.04], ["bp_runelegs", 0.02]], [["core", 1], ["groveheart", 1], ["dust", 0.8], ["sunblade", 0.1], ["royalblade", 0.01], ["bp_groveblade", 0.018]], [["core", 1], ["moonfeather", 1], ["wing", 1], ["windboots", 0.08], ["crown", 0.008], ["bp_moonboots", 0.018]], [["core", 1], ["acorniron", 1], ["crystal", 1], ["guardiancoat", 0.1], ["guardianlegs", 0.1], ["crown", 0.008], ["bp_acorncoat", 0.006]]];
const BOSS_GEAR_POOLS=[
 ['ring','scoutcoat','scoutboots'],
 ['scoutlegs','guardiancoat','boots'],
 ['mossblade','sunblade','guardianlegs'],
 ['owlcoat','windboots','charm'],
 ['acornblade','guardiancoat','guardianlegs']
];
for(const [key,mob] of Object.entries(MOBS))if(!mob.elite&&key!=='treasure')mob.drops=mob.drops.filter(([key])=>!ITEMS[key].slot);
MOBS.treasure.drops.push(["jadeorb",.05],["bp_foxring",.03]);
for(const m of Object.values(MOBS))m.drops.push(['skillstone',m.elite?.025:m.name==='황금 보물여우'?.1:.005]);for(const table of BOSS_TABLES)table.push(['skillstone',.06]);
for(const k of Object.keys(s.inventory))if(ITEMS[k]&&s.inventory[k]>0&&!s.discovered.includes(k))s.discovered.push(k);
const known=k=>s.discovered.includes(k);
const itemName=k=>known(k)?ITEMS[k].name:'???';
const RARITIES={common:'일반',rare:'희귀',epic:'영웅',legendary:'전설',mythic:'신화'};
let selectedItem='moss',inventoryFilter='owned';
const SLOT_NAMES={weapon:'무기',chest:'상의',legs:'하의',boots:'신발',ring:'반지'};
let gearFilter='all',gearPage=0,selectedGearId=null,equipmentSignature='',gearTipTimer=null;
const GEAR_PAGE_SIZE=24;
// Chapter 1 grants T1–T3. Read legacy T4–T8 separately so saves and rerolls keep their stats.
const CHAPTER_GEAR_TIER_CAP=3;
function gearTier(g){return Number.isInteger(g?.tier)?Math.max(1,Math.min(8,g.tier)):1}
function gearTierMultiplier(g){return 1+(gearTier(g)-1)*.20}
function fieldGearTier(stage=s.stage){return Math.max(1,Math.min(CHAPTER_GEAR_TIER_CAP,1+Math.floor((stage-1)/5)))}
function bossGearTier(id,tier='normal'){return Math.min(CHAPTER_GEAR_TIER_CAP,id+1+({normal:0,elite:1,mystic:2})[tier])}
function makeGear(key,rng=Math.random,legacy=false,quantity=1,tier=1){const g={tier:legacy?1:Math.min(CHAPTER_GEAR_TIER_CAP,gearTier({tier})),id:'g'+s.nextGearId++,key,locked:false,roll:legacy?0:Math.min(30,1+Math.floor(rng()*30)),exceptional:legacy?false:rng()<.05,quantity,ward:!legacy&&['chest','legs'].includes(ITEMS[key].slot)&&rng()<.1?(1+Math.min(2,Math.floor(rng()*3)))/100:0};g.potentialVersion=2;g.potentials=rollPotentials(key,rng,gearTier(g));s.gear.push(g);return g}
function equippedGear(slot){return s.gear.find(g=>g.id===s.slots[slot]&&ITEMS[g.key]?.slot===slot)||null}
function gearStat(slot,stat){const g=equippedGear(slot);return g?(ITEMS[g.key][stat]||0)*gearTierMultiplier(g)*(1+g.roll/100*(g.exceptional?1.5:1)):0}
function syncLegacySlots(){s.equipped=equippedGear('ring')?.key||null;s.weapon=equippedGear('weapon')?.key||null}
const oldRing=s.equipped,oldWeapon=s.weapon;
s.gear=s.gear.filter(g=>g&&typeof g.id==='string'&&ITEMS[g.key]?.slot&&Number.isInteger(g.roll)&&g.roll>=0&&g.roll<=30).map(g=>({...g,tier:gearTier(g),ward:['chest','legs'].includes(ITEMS[g.key].slot)&&Number.isFinite(g.ward)?Math.max(0,Math.min(.03,g.ward)):0,exceptional:g.exceptional===true,locked:g.locked===true,quantity:Math.max(1,Math.floor(Number(g.quantity)||1))}));
s.nextGearId=Math.max(s.nextGearId,1,...s.gear.map(g=>(Number(g.id.slice(1))||0)+1));
if(!s.gearVersion){s.gear=[];s.slots={ring:null,weapon:null,boots:null};for(const [key,count] of Object.entries(s.inventory)){if(ITEMS[key]?.slot&&count>0){const g=makeGear(key,Math.random,true,count);if(key===oldRing)s.slots.ring=g.id;if(key===oldWeapon)s.slots.weapon=g.id}}s.gearVersion=1}
for(const g of s.gear)g.potentials=validPotentials(g)??rollPotentials(g.key);
for(const slot of Object.keys(SLOT_NAMES))if(!equippedGear(slot))s.slots[slot]=null;
syncLegacySlots();
const luck=()=>(1+gearStat('ring','luck')+potentialSum('drop'))*(1+collectionBonus('luck'))*potentialProduct('dropMore')*(1+.03*specialPower('foxluck'));
function award(key,count=1,rng=Math.random,source='모험 보상',tier=1){const fresh=!known(key);s.inventory[key]=(s.inventory[key]||0)+count;if(fresh)s.discovered.push(key);let last=null;if(ITEMS[key].slot)for(let i=0;i<count;i++)last=makeGear(key,rng,false,1,tier);recordFind(key,count,source,fresh);return last}
function gearText(g){const item=ITEMS[g.key];const stats=item.slot==='ring'?[['luck','드롭률'],['gold','골드']]:item.slot==='weapon'?[['damage','공격력']]:item.slot==='chest'||item.slot==='legs'?[['hp','최대 HP'],['armor','방어력']]:[['movement','이동속도']];return 'T'+gearTier(g)+' · '+stats.map(([k,label])=>{const v=item[k]*gearTierMultiplier(g)*(1+g.roll/100*(g.exceptional?1.5:1));return label+' +'+(k==='hp'||k==='armor'?v.toFixed(1):pct(v))}).join(' · ')}
function optionText(g){return g.roll===0?'기존 장비 · 기본 성능 유지':'추가 옵션 +'+g.roll+'%'+(g.exceptional?' × 1.5 = +'+(g.roll*1.5)+'% · 대성공':'')}
function equipGear(id){if(!canMutate())return false;const g=s.gear.find(x=>x.id===id);if(!g)return false;const slot=ITEMS[g.key].slot;s.slots[slot]=s.slots[slot]===id?null:id;syncLegacySlots();s.heroHp=Math.min(s.heroHp,heroMaxHp());hideGearTip();save();render();renderLoot();return true}
const chance=p=>Math.min(1,p*luck());
const lootChance=p=>Math.min(1,chance(p));
const pct=p=>(p*100).toLocaleString('ko-KR',{maximumFractionDigits:6})+'%';
const bossUnlocked=id=>s.bossWins[id]>0||(id===0?s.total>=10:s.highestStage>=BOSSES[id].unlock);
function rollLoot(isBoss,id=0,rng=Math.random){const drops=[];for(const [dropKey,p] of isBoss?BOSS_TABLES[id]:MOBS[currentMob].drops){const natural=rng()<itemDropChance(dropKey,p,isBoss,bossTier),eligible=isBoss&&!!ITEMS[dropKey].blueprint&&!known(dropKey),guaranteed=eligible&&(s.blueprintMisses[dropKey]||0)>=59;if(eligible){if(natural||guaranteed)s.blueprintMisses[dropKey]=0;else s.blueprintMisses[dropKey]=(s.blueprintMisses[dropKey]||0)+1}if(natural||guaranteed){if(guaranteed&&!natural)log('보스 연구 완성 · '+ITEMS[dropKey].name+' 확정 발견');const duplicate=ITEMS[dropKey].blueprint&&known(dropKey),key=duplicate?'dust':dropKey;const count=duplicate?3:isBoss&&key==='core'?id+1:1;if(duplicate)log(ITEMS[dropKey].name+' 중복 · 별빛 가루 3개로 전환');const gear=award(key,count,rng,isBoss?BOSSES[id].name:MOBS[currentMob].name,isBoss?bossGearTier(id,bossTier):fieldGearTier());drops.push({key,count});if(gear)log(ITEMS[key].name+' · '+optionText(gear));log('획득! '+ITEMS[key].name+' ×'+count);if(['epic','legendary','mythic'].includes(ITEMS[key].rarity)){notify('✦ '+RARITIES[ITEMS[key].rarity]+' 발견! '+ITEMS[key].name);$('loot-announcement').textContent='최근 희귀 획득 · '+ITEMS[key].name;}}}if(isBoss){const pool=BOSS_GEAR_POOLS[id],key=pool[Math.max(0,Math.min(pool.length-1,Math.floor(rng()*pool.length)))],tier=bossGearTier(id,bossTier);award(key,1,rng,BOSSES[id].name,tier);drops.push({key,count:1});log('보스 선택 전리품 · T'+tier+' '+ITEMS[key].name);if(bossTier!=='normal'){const bonusPool=bossTier==='mystic'?['royalblade','crown']:pool;const bonus=bonusPool[Math.max(0,Math.min(bonusPool.length-1,Math.floor(rng()*bonusPool.length)))];award(bonus,1,rng,BOSSES[id].name,tier);drops.push({key:bonus,count:1});const stones=bossTier==='mystic'?10:3;award('skillstone',stones);drops.push({key:'skillstone',count:stones});log(BOSS_TIERS[bossTier].name+' 추가 확정 · T'+tier+' '+ITEMS[bonus].name+' / 스킬석 '+stones+'개')}}return drops}
function equip(key){const g=s.gear.filter(x=>x.key===key).sort((a,b)=>b.roll*(b.exceptional?1.5:1)-a.roll*(a.exceptional?1.5:1))[0];return g?equipGear(g.id):false}
const RECIPES={"shellcoat":{"royalshell": 12, "snailshell": 80, "core": 20, "stone_epic": 4},"runelegs":{"runestone": 12, "crystal": 100, "core": 20, "stone_epic": 4},"groveblade":{"groveheart": 15, "budfluff": 80, "core": 25, "stone_epic": 5},"moonboots":{"moonfeather": 15, "wing": 100, "core": 25, "stone_epic": 5},"acorncoat":{"acorniron": 25, "core": 60, "stone_legendary": 5, "seal": 40},"foxring":{"amber": 3, "dust": 100, "core": 60, "stone_legendary": 5},"dewboots":{"snailshell": 40, "seal": 4, "stone_rare": 3},"budcoat":{"budfluff": 40, "seal": 4, "stone_rare": 3},mossblade:{seal:5,moss:60,crystal:20,stone_rare:3},scoutcoat:{seal:5,moss:50,dust:5,stone_rare:3},scoutlegs:{seal:5,spore:50,dust:5,stone_rare:3},scoutboots:{seal:6,wing:20,crystal:20,stone_rare:3},practiceblade:{moss:20,spore:10},leaf:{moss:15,crystal:5},charm:{dust:10,core:10},boots:{spore:15,crystal:8},tunic:{moss:12,crystal:3},trousers:{spore:10,crystal:4}};
const CRAFT_GOLD={"shellcoat":12000,"runelegs":14000,"groveblade":18000,"moonboots":20000,"acorncoat":70000,"foxring":70000,"dewboots":1600,"budcoat":1600,mossblade:1800,scoutcoat:1600,scoutlegs:1600,scoutboots:2000,practiceblade:180,leaf:150,charm:650,boots:220,tunic:100,trousers:120};
const CRAFT_LABELS={"shellcoat":"왕관등갑","runelegs":"잠든 룬각반","groveblade":"숲울림검","moonboots":"월영 발걸음","acorncoat":"호박철 맹세","foxring":"여우별 옥가락지","dewboots":"이슬 산책화","budcoat":"새싹 솜누비",mossblade:'영웅 정찰검',scoutcoat:'영웅 탐사복',scoutlegs:'영웅 탐사 바지',scoutboots:'영웅 길잡이 신발',practiceblade:'연습 무기',leaf:'초급 반지',charm:'상급 반지',boots:'신발',tunic:'상의',trousers:'하의'};
let craftFilter='all',craftRarity='all',craftReadyOnly=true,craftSignature='';
function canCraft(key){return Object.hasOwn(RECIPES,key)&&(!ITEMS['bp_'+key]||known('bp_'+key))&&s.gold>=CRAFT_GOLD[key]&&Object.entries(RECIPES[key]).every(([k,v])=>(s.inventory[k]||0)>=v)}
function craft(key){if(!canMutate())return false;hideCraftTip();const recipe=RECIPES[key];if(!canCraft(key))return false;s.gold-=CRAFT_GOLD[key];for(const [k,v] of Object.entries(recipe))s.inventory[k]-=v;const gear=award(key,1,Math.random,'장비 제작',fieldGearTier(s.highestStage));selectedItem=key;selectedGearId=gear?.id||null;log(ITEMS[key].name+' 제작 · '+optionText(gear));notify('제작 완료! '+CRAFT_GOLD[key]+' G를 사용했어요.');save();render();renderLoot();return true}
function hideGearTip(){clearTimeout(gearTipTimer);gearPopoverId=null;$('gear-tooltip').hidden=true}
function renderGearComparison(node,g){
 node.replaceChildren();const current=equippedGear(ITEMS[g.key].slot),intro=document.createElement('p');intro.textContent=current?'현재 장착: '+ITEMS[current.key].name+' · '+gearText(current):'현재 장착 없음 · 빈 슬롯과 비교';node.append(intro);
 const types=[...new Set([...(current?.potentials||[]),...(g.potentials||[])].map(p=>p.type))];
 for(const type of types){const spec=POTENTIALS[type],old=(current?.potentials||[]).filter(p=>p.type===type),next=(g.potentials||[]).filter(p=>p.type===type),from=old.reduce((n,p)=>n+p.value,0),to=next.reduce((n,p)=>n+p.value,0),delta=to-from,format=v=>spec.unit==='flat'?String(Math.round(v)):spec.unit==='speed'?v.toFixed(3)+'회/초':spec.unit==='move'?v.toFixed(3)+'m/s':pct(v),row=document.createElement('p');row.className='comparison-row '+(delta>0?'gain':delta<0?'loss':'same');row.textContent=spec.name+' · 현재 '+format(from)+' → 선택 '+format(to)+' ('+(delta>=0?'+':'−')+format(Math.abs(delta))+') · '+(old.length?old.map(p=>POTENTIAL_GRADES[p.grade]).join('/'):'없음')+' → '+(next.length?next.map(p=>POTENTIAL_GRADES[p.grade]).join('/'):'없음');node.append(row)}
 if(!types.length){const row=document.createElement('p');row.textContent='비교할 잠재 옵션 없음';node.append(row)}
}
function showGearTip(g,anchor){clearTimeout(gearTipTimer);if(!g)return;gearPopoverId=g.id;const item=ITEMS[g.key],tip=$('gear-tooltip');tip.setAttribute('data-rarity',item.rarity);$('tip-name').textContent=item.name;$('tip-rarity').textContent=RARITIES[item.rarity]+' · '+SLOT_NAMES[item.slot]+(g.exceptional?' · 대성공':'');$('tip-stats').textContent=gearText(g);$('tip-option').textContent=optionText(g);$('tip-rare').hidden=!g.ward;$('tip-rare').textContent=g.ward?'◆ 숲의 가호 · 피해감소 +'+pct(g.ward):'';const equipped=equippedGear(item.slot);$('tip-comparison').textContent=equipped?(equipped.id===g.id?'현재 장착 중':'현재 장비: '+gearText(equipped)+(equipped.ward?' · 숲의 가호 +'+pct(equipped.ward):'')):'이 슬롯에 장착한 장비가 없습니다.';potentialRows($('tip-potentials'),g.potentials);renderGearComparison($('tip-potential-comparison'),g);positionItemTip(tip,anchor,330)}
function gearButton(g,slotView=false){const item=ITEMS[g.key],b=document.createElement('button');b.className='gear-tile '+item.rarity+(s.slots[item.slot]===g.id?' equipped':'')+(g.exceptional?' exceptional':'')+(g.ward?' warded':'');b.setAttribute('aria-describedby','gear-tooltip');b.setAttribute('aria-label',item.name+' T'+gearTier(g)+' 옵션 확인');const icon=document.createElement('span');icon.className='gear-icon';paintItemIcon(icon,item);const name=document.createElement('strong');name.textContent=item.name;const tag=document.createElement('small');tag.textContent='T'+gearTier(g)+' · '+(slotView?SLOT_NAMES[item.slot]:RARITIES[item.rarity])+(s.slots[item.slot]===g.id?' · 장착':'')+(g.quantity>1?' ×'+g.quantity:'')+(g.exceptional?' ✦':'')+(g.ward?' ◆ 가호':'');b.append(icon,name,tag);b.onmouseenter=()=>showGearTip(g,b);b.onmouseleave=hideGearTip;b.onfocus=()=>showGearTip(g,b);b.onblur=()=>hideGearTip();b.onclick=()=>{selectedGearId=g.id;openPotential(g.id)};return b}
function renderEquipment(){
 for(const key of ['all',...Object.keys(SLOT_NAMES)]){$('gear-category-'+key).setAttribute('aria-pressed',String(gearFilter===key));$('gear-count-'+key).textContent=s.gear.filter(g=>key==='all'||ITEMS[g.key].slot===key).reduce((n,g)=>n+g.quantity,0)}$('gear-list-title').textContent=gearFilter==='all'?'전체 장비':SLOT_NAMES[gearFilter];const signature=JSON.stringify([s.gear,s.slots,gearFilter,gearSort,gearPage,s.loadoutRole]);$('gear-effects').textContent='HP '+fmt(heroMaxHp())+' · 방어 '+fmt(heroDefense())+' · 공격력 '+fmt(attack())+' · 이동 '+movementSpeed().toFixed(2)+'m/s · 드롭 ×'+luck().toFixed(2);if(signature===equipmentSignature)return;equipmentSignature=signature;renderLoadoutPlan();hideGearTip();const slots=$('equipment-slots');slots.replaceChildren();for(const slot of Object.keys(SLOT_NAMES)){const g=equippedGear(slot);if(g)slots.append(gearButton(g,true));else{const empty=document.createElement('div');empty.className='empty-gear-slot';const title=document.createElement('strong');title.textContent=SLOT_NAMES[slot];const hint=document.createElement('small');hint.textContent='미장착';empty.append(title,hint);slots.append(empty)}}
 $('gear-effects').textContent='HP '+fmt(heroMaxHp())+' · 방어 '+fmt(heroDefense())+' · 공격력 '+fmt(attack())+' · 이동 '+movementSpeed().toFixed(2)+'m/s · 드롭 ×'+luck().toFixed(2);
 const list=$('gear-list');list.replaceChildren();const gears=s.gear.filter(g=>gearFilter==='all'||ITEMS[g.key].slot===gearFilter).slice().sort((a,b)=>gearSort==='rarity'?rarityRank(ITEMS[b.key].rarity)-rarityRank(ITEMS[a.key].rarity)||gearScore(b)-gearScore(a):Number(b.id.slice(1))-Number(a.id.slice(1)));$('gear-visible-count').textContent=gears.reduce((n,g)=>n+g.quantity,0)+'개 보유';if(!gears.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='보유 장비가 없습니다. 사냥이나 제작으로 모아 보세요.';list.append(empty)}const pageItems=gearPageItems(gears);$('gear-page-status').textContent=(gearPage+1)+' / '+Math.max(1,Math.ceil(gears.length/GEAR_PAGE_SIZE))+' 페이지 · '+gears.length+'묶음';$('gear-page-prev').disabled=gearPage===0;$('gear-page-next').disabled=(gearPage+1)*GEAR_PAGE_SIZE>=gears.length;for(const g of pageItems){const row=document.createElement('div');row.className='gear-cell '+ITEMS[g.key].rarity;row.append(gearButton(g));const action=document.createElement('button');action.className='gear-action';action.textContent=s.slots[ITEMS[g.key].slot]===g.id?'해제':'장착';action.onclick=()=>equipGear(g.id);const actions=document.createElement('div');actions.className='gear-actions';const lock=document.createElement('button');lock.className='gear-lock';lock.textContent=g.locked?'잠금 해제':'잠금';lock.setAttribute('aria-pressed',String(g.locked));lock.setAttribute('aria-label',ITEMS[g.key].name+' '+(g.locked?'잠금 해제':'잠금'));lock.onclick=()=>toggleGearLock(g.id);const salvage=document.createElement('button');salvage.className='gear-salvage';salvage.textContent=g.locked?'잠금 중':s.slots[ITEMS[g.key].slot]===g.id?'장착 중':'분해';salvage.disabled=g.locked||s.slots[ITEMS[g.key].slot]===g.id;salvage.title=g.locked?'잠금을 해제한 뒤 분해할 수 있습니다.':s.slots[ITEMS[g.key].slot]===g.id?'장착을 해제한 뒤 분해할 수 있습니다.':'보상을 확인한 뒤 분해';salvage.setAttribute('aria-label',ITEMS[g.key].name+' 분해 보상 확인');salvage.onclick=()=>previewDismantle(g.id);actions.append(action,salvage,lock);row.append(actions);list.append(row)}
}
let craftTipKey=null,craftTipTimer=null,craftTipPinned=false;
function hideCraftTip(){clearTimeout(craftTipTimer);craftTipKey=null;craftTipPinned=false;$('craft-tooltip').hidden=true}
function requirementText(name,owned,needed){return (owned>=needed?'✓ 준비 완료':'부족 '+fmt(needed-owned))+' · '+name+' '+fmt(owned)+' / '+fmt(needed)}
function showCraftTip(key,anchor){
 if(!Object.hasOwn(RECIPES,key))return;clearTimeout(craftTipTimer);craftTipKey=key;$('craft-tooltip').classList.toggle('pinned',craftTipPinned);
 $('craft-tip-name').textContent=known(key)?ITEMS[key].name:CRAFT_LABELS[key]+' 설계도';
 const list=$('craft-tip-materials');list.replaceChildren();
 for(const [k,n] of Object.entries(RECIPES[key])){const row=document.createElement('p'),owned=s.inventory[k]||0;row.textContent=requirementText(ITEMS[k].name,owned,n);row.className=owned>=n?'enough':'missing';list.append(row)}
 if(ITEMS['bp_'+key]){const row=document.createElement('p'),unlocked=known('bp_'+key);row.textContent=unlocked?'✓ 설계도 해금 완료':'설계도 미획득 · '+sourceText('bp_'+key);row.className=unlocked?'enough':'missing';list.append(row)}
 $('craft-tip-gold').textContent=requirementText('골드 (G)',s.gold,CRAFT_GOLD[key]);$('craft-tip-gold').className=s.gold>=CRAFT_GOLD[key]?'enough':'missing';
 const materialsReady=Object.entries(RECIPES[key]).every(([k,n])=>(s.inventory[k]||0)>=n);
 $('craft-tip-status').textContent=canCraft(key)?'✓ 모든 준비 완료 · T'+fieldGearTier(s.highestStage)+' 제작 가능':(materialsReady?'✓ 필요 재료 모두 수집 완료 · ':'')+craftNeeds(key).map(x=>x.key==='gold'?'골드 부족':x.key.startsWith('bp_')?'설계도 필요':'').filter(Boolean).join(' · ')+(materialsReady?'':' · 부족한 재료를 더 모아 주세요.');
 positionItemTip($('craft-tooltip'),anchor,310);
}
function renderCrafting(){
 const signature=JSON.stringify([craftReadyOnly,craftFilter,craftRarity,s.inventory,s.discovered,s.gold,s.highestStage]);if(signature===craftSignature)return;craftSignature=signature;
 let visible=0;
 for(const key of Object.keys(RECIPES)){
  const ready=canCraft(key),slot=ITEMS[key].slot,card=$('recipe-card-'+key),materials=Object.entries(RECIPES[key]),collected=materials.filter(([k,n])=>(s.inventory[k]||0)>=n).length;
  card.hidden=!((!craftReadyOnly||ready)&&(craftFilter==='all'||slot===craftFilter||(craftFilter==='armor'&&['chest','legs'].includes(slot)))&&(craftRarity==='all'||ITEMS[key].rarity===craftRarity));if(!card.hidden)visible++;
  $('craft-'+key).disabled=!ready;$('craft-'+key).textContent=ITEMS['bp_'+key]&&!known('bp_'+key)?'설계도 미획득':'T'+fieldGearTier(s.highestStage)+' 제작 · '+CRAFT_GOLD[key]+' G';
  card.className='recipe-card '+ITEMS[key].rarity;$('recipe-'+key).textContent=known(key)?ITEMS[key].name:CRAFT_LABELS[key]+' 설계도';
  $('recipe-ready-'+key).textContent=ready?'✓ 제작 준비 완료':collected===materials.length?'✓ 재료 수집 완료':'재료 '+collected+' / '+materials.length+'종 준비';
 }
 $('craft-ready-only').checked=craftReadyOnly;$('craft-empty').hidden=visible>0;
 $('craft-empty').textContent=craftReadyOnly?'현재 조건에서 제작 가능한 장비가 없습니다. ‘제작 가능만’ 체크를 해제하면 필요한 재료와 설계도를 확인할 수 있어요.':'선택한 종류·등급에 해당하는 설계도가 없습니다.';
 if(craftTipKey&&!$('craft-tooltip').hidden){if($('recipe-card-'+craftTipKey).hidden)hideCraftTip();else showCraftTip(craftTipKey,$('recipe-info-'+craftTipKey))}
}

function renderHeroStats(){const fields={'stat-hp':fmt(Math.max(0,s.heroHp))+' / '+fmt(heroMaxHp()),'stat-defense':fmt(heroDefense()),'stat-reduction':Math.round(mitigation()*100)+'%','stat-move':movementSpeed().toFixed(2)+'m/s','stat-drop':'×'+luck().toFixed(3),'stat-gold':'×'+goldMultiplier().toFixed(3),'stat-crit-damage':'×2.00','stat-expedition':pct(expeditionReduction()),'stat-dodge':pct(dodgeChance()),'stat-boss-reduction':pct(bossMitigation()),'stat-regen':pct(Math.min(.01,potentialSum('regen')))+'/초','stat-leech':pct(Math.min(.06,potentialSum('leech'))+.02*passivePower('leech')),'stat-chain':pct(Math.min(.1,potentialSum('chain')))};for(const [id,value] of Object.entries(fields))$(id).textContent=value;}
function renderHero(){s.heroHp=Math.min(s.heroHp,heroMaxHp());$('hero-hp-label').textContent=fmt(Math.max(0,s.heroHp))+' / '+fmt(heroMaxHp());$('hero-hp-fill').style.width=Math.max(0,s.heroHp/heroMaxHp()*100)+'%';$('hero-hp-box').classList.toggle('critical',s.heroHp/heroMaxHp()<.3);$('hero-danger').textContent=s.heroHp/heroMaxHp()<.3?'위험 · HP와 방어 장비를 강화하세요':'적 공격까지 '+Math.max(0,enemyInterval()-enemyClock).toFixed(1)+'초';$('hero-danger').hidden=phase!=='combat';$('hero-defense').textContent='방어 '+heroDefense()+' · 피해 감소 '+Math.round(mitigation()*100)+'%';$('enemy-attack-info').textContent=phase==='combat'?'적 공격 '+enemyAttack()+' · '+(!boss?MOBS[currentMob].tempo+' · ':'')+enemyInterval().toFixed(2)+'초마다 / 다음 공격 '+Math.max(0,enemyInterval()-enemyClock).toFixed(1)+'초':'비전투 중';if(boss&&phase==='combat')$('enemy-attack-info').textContent+=' · '+bossDefenseText(bossId,bossTier);}
function renderLoot(){
 refreshPotentialDialog();
 $('luck-value').textContent='드롭 확률 ×'+luck().toFixed(2);$('equipped-label').textContent='챕터 1 · 신규 장비 T1~T3 / 희귀도 별도 · 티어마다 기본 능력치 +20%p · 이전 장비 유지';
 $('inventory-count').textContent=Object.keys(ITEMS).filter(k=>s.inventory[k]>0).length+'종 보유';
 const visibleKeys=Object.keys(ITEMS).filter(k=>s.inventory[k]>0&&(inventoryFilter!=='gear'||ITEMS[k].slot)&&(inventoryFilter!=='materials'||(!ITEMS[k].slot&&!ITEMS[k].blueprint))&&(inventoryFilter!=='blueprints'||ITEMS[k].blueprint));if(!visibleKeys.includes(selectedItem))selectedItem=visibleKeys[0]||null;
 const grid=$('inventory-grid');grid.replaceChildren();
 for(const [key,item] of Object.entries(ITEMS).sort((a,b)=>bagSort==='rarity'?rarityRank(b[1].rarity)-rarityRank(a[1].rarity):0)){if(!(s.inventory[key]>0))continue;if(inventoryFilter==='materials'&&(item.slot||item.blueprint))continue;if(inventoryFilter==='blueprints'&&!item.blueprint)continue;if(inventoryFilter==='gear'&&!item.slot)continue;const b=document.createElement('button');b.className='item-slot '+(known(key)?item.rarity:'unknown')+(selectedItem===key?' selected':'')+(!s.inventory[key]?' unowned':'');b.setAttribute('aria-label',itemName(key)+' '+(s.inventory[key]||0)+'개');b.setAttribute('aria-pressed',String(selectedItem===key));const icon=document.createElement('span');icon.className='item-symbol';if(known(key))paintItemIcon(icon,item);else icon.textContent='?';const name=document.createElement('strong');name.textContent=itemName(key);const count=document.createElement('small');count.textContent=(Object.keys(SLOT_NAMES).some(slot=>equippedGear(slot)?.key===key)?'장착 · ':'')+'×'+fmt(s.inventory[key]||0);b.append(icon,name,count);b.onclick=()=>{selectedItem=key;renderLoot()};grid.append(b)}
 if(!grid.children.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='아직 획득한 아이템이 없어요. 사냥을 계속해 보세요.';grid.append(empty)}
 const item=ITEMS[selectedItem];$('item-title').textContent=item?item.name+' · '+RARITIES[item.rarity]:'선택한 아이템이 없습니다';$('item-description').textContent=item?item.desc:'사냥으로 얻은 아이템이 이곳에 표시됩니다.';$('equip-item').hidden=!item?.slot;$('equip-item').disabled=!item?.slot;$('equip-item').textContent='최고 옵션 장비 장착 / 해제';
 renderCrafting();
 renderBossList();
 renderCodex();renderEquipment();renderCollection();renderFieldNotes();
}
$('equip-item').onclick=()=>equip(selectedItem);$('craft-leaf').onclick=()=>craft('leaf');$('craft-charm').onclick=()=>craft('charm');$('craft-boots').onclick=()=>craft('boots');$('craft-tunic').onclick=()=>craft('tunic');$('craft-trousers').onclick=()=>craft('trousers');$('inventory-filter').onchange=e=>{inventoryFilter=e.target.value;renderLoot()};$('close-boss').onclick=()=>$('boss-dialog').close();
function renderTravel(){
 const travelling=['loot','travel','defeated'].includes(phase);$('adventure-status').textContent='STAGE '+s.stage+' · '+(s.paused?'쉬는 중':boss?'보스 전투':phase==='defeated'?'회복 중':phase==='travel'?'숲길 이동':phase==='loot'?'전리품 정리':'자동 사냥');$('arena').classList.toggle('travelling',travelling);$('arena').classList.toggle('elite-boss',boss&&bossTier==='elite');$('arena').classList.toggle('mystic-boss',boss&&bossTier==='mystic');$('arena').classList.toggle('elite-encounter',!!MOBS[currentMob].elite&&!boss&&!travelling);$('arena').classList.toggle('rare-encounter',currentMob==='treasure'&&!boss&&!travelling);renderBattleScene();$('travel-overlay').hidden=!travelling;
 $('travel-title').textContent=phase==='defeated'?'전투 불능 · 야영지에서 회복 중':phase==='loot'?'전리품을 챙기는 중':'다음 적을 향해 이동 중';$('travel-description').textContent=phase==='defeated'?Math.max(0,phaseLeft).toFixed(1)+'초 후 HP를 회복해 다시 출발합니다.':phase==='loot'?(lastLoot.length?lastLoot.map(x=>ITEMS[x.key].name+' ×'+x.count).join(' · '):'골드를 챙기고 잠시 숨을 고릅니다.'):(s.paused?'일시 정지됨':phaseLeft.toFixed(1)+'초 후 도착');$('travel-fill').style.width=(phase==='travel'||phase==='defeated'?Math.max(0,1-phaseLeft/travelTotal)*100:Math.max(0,1-phaseLeft/.8)*100)+'%';
 $('movement-summary').textContent='이동속도 '+movementSpeed().toFixed(2)+'m/s · 거리 '+travelDistance().toFixed(1)+'m · 다음 이동 '+travelSeconds().toFixed(1)+'초';$('terrain-summary').textContent=['평탄한 숲길 · 페널티 없음','젖은 오솔길 · 이동시간 +20%','뒤엉킨 뿌리 · 이동시간 +45%','깊은 늪지 · 이동시간 +80%'][regionIndex()];
 $('auto-safety').setAttribute('aria-pressed',String(s.autoSafety));$('auto-safety').textContent=s.autoSafety?'연속 사망 보호 켜짐':'연속 사망 보호 꺼짐';if(travelling){$('battle-status').textContent=s.paused?'Ⅱ 모험 쉬는 중':phase==='defeated'?'✚ 회복 중':phase==='loot'?'✦ 전리품 정리 중':'› 숲길 이동 중';$('enemy-name').textContent='전투 종료';$('enemy-hp-label').textContent='';}
}
function renderCodex(){
 const entities=codexFilter==='boss'?BOSSES.map((b,i)=>({id:'boss'+i,name:b.name,image:bossSprite(i),desc:b.desc+' · '+BOSS_TIERS[codexBossTier].name+' / HP ×'+BOSS_TIERS[codexBossTier].hp+' / 공격 ×'+BOSS_TIERS[codexBossTier].attack,drops:BOSS_TABLES[i]})):Object.entries(MOBS).map(([id,m])=>({id,...m,image:id==='mushroom'?'cute-mushroom.webp':m.image,desc:m.habitat+' · '+mobTempoText(id)}));if(!entities.some(x=>x.id===codexSelected))codexSelected=entities[0].id;
 const picker=$('codex-entities');picker.replaceChildren();for(const e of entities){const b=document.createElement('button');b.textContent=e.name;b.className=codexSelected===e.id?'active':'';b.setAttribute('aria-pressed',String(codexSelected===e.id));b.onclick=()=>{codexSelected=e.id;renderCodex()};picker.append(b)}
 const entity=entities.find(e=>e.id===codexSelected);$('boss-tier-picker').hidden=codexFilter!=='boss';$('codex-name').textContent=(codexFilter==='boss'?BOSS_TIERS[codexBossTier].name+' ':'')+entity.name;$('codex-description').textContent=entity.desc+(codexFilter==='boss'?' · '+bossDefenseText(Number(entity.id.slice(4)),codexBossTier)+' · 첫 격파 확정: '+itemName(['ring','scoutboots','mossblade','owlcoat','acornblade'][Number(entity.id.slice(4))])+' (아래 확률 추첨과 별도)'+bossGuaranteedText(codexBossTier,Number(entity.id.slice(4))):'');paintAtlas($('painted-codex'),$('codex-image'),creatureArt(entity.id),entity.name);$('codex-kills').textContent='기록된 처치 '+(Number(s.defeated[entity.id])||0)+'회 · 발견 '+entity.drops.filter(([k])=>known(k)).length+' / '+entity.drops.length+'종';
 const body=$('drop-body');body.replaceChildren();for(const [key,p] of entity.drops){const tr=document.createElement('tr');tr.className=known(key)?'':'undiscovered';for(const [column,txt] of [known(key)?ITEMS[key].name:'???',p>=.5?'높음':p>=.1?'보통':p>=.01?'낮음':p>=.001?'매우 낮음':'극악',pct(p),pct(itemDropChance(key,p,codexFilter==='boss',codexBossTier)),known(key)?'발견':codexFilter==='boss'&&ITEMS[key].blueprint?'미발견 · 보장까지 '+(60-(s.blueprintMisses[key]||0))+'회':'미발견'].entries()){const td=document.createElement('td');if(column===0&&known(key)){const name=document.createElement('span'),icon=document.createElement('span');name.className='drop-item-name';paintItemIcon(icon,ITEMS[key]);const label=document.createElement('span');label.textContent=txt;name.append(icon,label);td.append(name)}else td.textContent=txt;tr.append(td)}body.append(tr)}
 $('rare-chance').textContent='보물여우 등장 확률 '+pct(rareChance())+' / 매 조우';$('rare-formula').textContent='기본 0.01% × 드롭 배율 '+luck().toFixed(2)+(s.equipped?' × 장신구 추가 보정 1.5':' · 장신구 미장착');
}
$('codex-mobs').onclick=()=>{codexFilter='mob';$('codex-mobs').classList.add('active');$('codex-bosses').classList.remove('active');renderCodex()};$('codex-bosses').onclick=()=>{codexFilter='boss';$('codex-bosses').classList.add('active');$('codex-mobs').classList.remove('active');renderCodex()};
const COLLECTION_SETS=[
 {name:'이슬과 새싹의 친구들',keys:['snailshell','budfluff'],bonuses:{gold:.01},hint:'달팽이와 토끼의 전용 재료를 발견하세요.'},
 {name:'다섯 수호자의 이야기',keys:['royalshell','runestone','groveheart','moonfeather','acorniron'],bonuses:{luck:.02},hint:'다섯 보스의 전용 재료를 한 번씩 발견하세요.'},
 {name:'전설을 그리는 손',keys:['bp_shellcoat','bp_runelegs','bp_groveblade','bp_moonboots'],bonuses:{attack:.01},hint:'보스 4종의 전용 전설 설계도를 발견하세요.'},
 {name:'튼튼한 숲의 친구들',keys:['dew','cap'],bonuses:{attack:.08},hint:'스테이지 3부터 엘리트 슬라임과 버섯에게 도전하세요.'},
 {name:'반짝이는 숲의 조각',keys:['dew','cap','moonshard'],bonuses:{luck:.08,movement:.05},hint:'세 종류 엘리트의 전용 재료를 모으세요.'},
 {name:'작은 숲의 수호 증표',keys:['dew','cap','moonshard','medal'],bonuses:{reduction:.02},hint:'엘리트의 희귀 훈장까지 모으면 영구 피해감소 +3%.'},
 {name:'첫 탐험 준비 완료',keys:['practiceblade','tunic','trousers','boots'],bonuses:{gold:.05},hint:'첫 무기와 방어구를 제작해 보세요.'},
 {name:'숲의 첫 선물',keys:['moss','crystal','spore'],bonuses:{attack:.05},hint:'슬라임과 버섯을 사냥해 보세요.'},
 {name:'달빛을 담은 병',keys:['dust','wing','seed'],bonuses:{luck:.05},hint:'달빛 나방과 희귀한 만남을 찾아보세요.'},
 {name:'행운의 고리',keys:['leaf','charm','ring'],bonuses:{gold:.1},hint:'제작과 보스 원정으로 반지를 모으세요.'},
 {name:'모험가의 준비',keys:['sunblade','boots','windboots'],bonuses:{attack:.1,movement:.05},hint:'무기와 두 종류의 신발을 발견하세요.'},
 {name:'태초의 보물함',keys:['amber','crown','royalblade'],bonuses:{attack:.15,luck:.1},hint:'보물여우와 최상위 보스에게 도전하세요.'}
];
for(const set of COLLECTION_SETS)for(const key of Object.keys(set.bonuses))set.bonuses[key]=Math.max(.03,set.bonuses[key]);
const bonusLabels={attack:'공격력',gold:'골드 획득',luck:'드롭률',movement:'이동속도',reduction:'피해감소'};
function discoveredCount(){return Object.keys(ITEMS).filter(known).length}
function collectionBonus(stat){let value=0;if(stat==='attack')value=discoveryAttack()+bossTrophyBonus()+Math.floor((s.highestStage-1)/5)*.03;if(stat==='gold')value=Math.floor((s.highestStage-1)/5)*.01;for(const set of COLLECTION_SETS)if(set.keys.every(known))value+=set.bonuses[stat]||0;return value}
function milestoneTargets(){const targets=[6,11,16,21,31,51];const next=61+10*Math.max(0,Math.floor((s.highestStage-51)/10));for(let n=61;n<=next;n+=10)targets.push(n);return targets}
function milestoneReward(n){return {gold:n*80,core:Math.max(1,Math.floor(n/10))}}
function rollMilestoneGear(rng=Math.random){const roll=rng();const pool=roll<.01?['sunblade','windboots','guardiancoat','guardianlegs']:roll<.10?['charm','mossblade','scoutcoat','scoutlegs','scoutboots']:roll<.65?['leaf','practiceblade','tunic','trousers','boots']:null;return pool?pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))]:null}
function claimMilestone(n,rng=Math.random){if(!canMutate())return false;if(!Number.isInteger(n)||!milestoneTargets().includes(n)||s.highestStage<n||s.claimedMilestones.includes(n))return false;const prize=milestoneReward(n);s.claimedMilestones.push(n);s.gold+=prize.gold;award('core',prize.core);const key=rollMilestoneGear(rng);if(key)award(key,1,rng,'스테이지 '+n+' 돌파',fieldGearTier(n));else award('crystal',5);const result=key?'T'+fieldGearTier(n)+' '+ITEMS[key].name:'숲의 결정 5개';log('STAGE '+n+' 돌파 보상 · '+result);notify('돌파 보상 · '+fmt(prize.gold)+' G / '+result);save();render();renderLoot();return true}
function bonusDescription(bonuses){return Object.entries(bonuses).map(([k,v])=>bonusLabels[k]+' +'+pct(v)).join(' · ')}
let achievementSignature='',achievementTipTimer=null;
function achievementSources(stat){const rows=[];if(stat==='attack'){rows.push(['발견 보너스 · 기존 1% / 확장 0.2%',discoveryAttack()],['보스 트로피',bossTrophyBonus()],['최고 스테이지',Math.floor((s.highestStage-1)/5)*.03])}if(stat==='gold')rows.push(['최고 스테이지',Math.floor((s.highestStage-1)/5)*.01]);for(const set of COLLECTION_SETS)if(set.keys.every(known)&&set.bonuses[stat])rows.push([set.name,set.bonuses[stat]]);return rows}
function hideAchievementTip(){clearTimeout(achievementTipTimer);$('achievement-tooltip').hidden=true}
function showAchievementTip(anchor,title,lines){clearTimeout(achievementTipTimer);$('achievement-tip-title').textContent=title;const body=$('achievement-tip-body');body.replaceChildren();for(const line of lines){const row=document.createElement('p');row.textContent=line;body.append(row)}positionItemTip($('achievement-tooltip'),anchor,310)}
function achievementHover(button,title,lines){button.setAttribute('aria-describedby','achievement-tooltip');const show=()=>showAchievementTip(button,title,typeof lines==='function'?lines():lines);button.onmouseenter=show;button.onmouseleave=hideAchievementTip;button.onfocus=show;button.onblur=hideAchievementTip;button.onclick=show;return button}
function achievementBadge(title,icon,state,done,lines){const b=document.createElement('button');b.className='achievement-badge'+(done?' earned':'');const glyph=document.createElement('span');glyph.className='achievement-icon';glyph.textContent=icon;const name=document.createElement('strong');name.textContent=title;const status=document.createElement('small');status.textContent=state;b.append(glyph,name,status);return achievementHover(b,title,lines)}
function renderCollection(){
 const count=discoveredCount(),completed=COLLECTION_SETS.filter(x=>x.keys.every(known)).length;const targets=milestoneTargets(),ready=targets.filter(n=>n<=s.highestStage&&!s.claimedMilestones.includes(n)),next=targets.find(n=>n>s.highestStage);
 $('collection-count').textContent=count+' / '+Object.keys(ITEMS).length+'종 발견';$('collection-progress').style.width=count/Object.keys(ITEMS).length*100+'%';$('collection-highest').textContent='STAGE '+s.highestStage;$('collection-rank').textContent=s.highestStage>=51?'태초의 개척자':s.highestStage>=21?'깊은 숲의 탐험가':s.highestStage>=11?'숲길의 길잡이':'새싹 수집가';
 $('collection-summary').textContent='발견 보너스 공격력 +'+pct(discoveryAttack())+' · 세트 '+completed+'/'+COLLECTION_SETS.length+' · 보스 트로피 '+s.bossWins.filter(n=>n>0).length+'/'+BOSSES.length;
 $('milestone-summary').textContent='최고 기록 5단계마다 공격력 +3%p · 골드 +1%p. 현재 기록 보너스: 공격력 +'+pct(Math.floor((s.highestStage-1)/5)*.03)+' / 골드 +'+pct(Math.floor((s.highestStage-1)/5)*.01);
 $('goal-label').textContent=ready.length?'받을 수 있는 돌파 보상 '+ready.length+'개':'다음 목표 STAGE '+next;$('goal-detail').textContent='최고 '+s.highestStage+' · 발견 '+count+'/'+Object.keys(ITEMS).length;$('tab-collection').textContent='수집·목표'+(ready.length?' ('+ready.length+')':'');
 const signature=JSON.stringify([s.discovered,s.bossWins,s.highestStage,s.claimedMilestones]);if(signature===achievementSignature)return;achievementSignature=signature;hideAchievementTip();
 const effects=$('collection-bonuses');effects.replaceChildren();const icons={attack:'⚔',luck:'✦',gold:'◆',movement:'»',reduction:'◇'};for(const stat of ['attack','luck','gold','movement','reduction']){const card=document.createElement('button');card.className='achievement-effect';const label=document.createElement('span');label.textContent=icons[stat]+' '+bonusLabels[stat];const value=document.createElement('strong');value.textContent='+'+pct(collectionBonus(stat));const hint=document.createElement('small');hint.textContent='영구 적용 · 출처 보기';card.append(label,value,hint);achievementHover(card,bonusLabels[stat]+' · 획득 효과',()=>{const sources=achievementSources(stat);return [...(sources.length?sources.map(([name,value])=>name+' +'+pct(value)):['아직 획득한 보너스가 없습니다.']),'합계 +'+pct(collectionBonus(stat)),stat==='reduction'?'피해감소는 장비와 합산 · 최대 30%. 방어력 차감 후 적용됩니다.':'업적 효과끼리는 합산하고, 장비 효과와 곱해집니다.']});effects.append(card)}
 const sets=$('collection-sets');sets.replaceChildren();for(const set of COLLECTION_SETS){const done=set.keys.every(known);sets.append(achievementBadge(set.name,done?'✦':'◇',done?'완성 · 적용 중':set.keys.filter(known).length+' / '+set.keys.length+' 발견',done,()=>[bonusDescription(set.bonuses),...set.keys.map(k=>(known(k)?'✓ '+ITEMS[k].name:'◇ ??? · 미발견')),set.hint,done?'획득 완료 · 소모하거나 해제해도 효과 유지':'모든 항목을 발견하면 자동으로 효과 적용']))}
 const trophies=$('collection-trophies');trophies.replaceChildren();BOSSES.forEach((b,i)=>{const earned=s.bossWins[i]>0;trophies.append(achievementBadge(b.name,earned?'♜':'◇',earned?'획득 완료':'첫 격파 필요',earned,()=>['첫 격파 보상: 영구 공격력 +'+(i<3?3:1)+'%',b.desc,'처치 기록 '+s.bossWins[i]+'회',earned?'공격력 +'+(i<3?3:1)+'% 적용 중':'보스를 한 번 처치하면 자동 획득']))});
 const list=$('milestone-list');list.replaceChildren();const pending=targets.filter(n=>!s.claimedMilestones.includes(n));for(const n of pending.slice(0,6)){const prize=milestoneReward(n),unlocked=s.highestStage>=n,row=document.createElement('article');row.className='milestone-compact'+(unlocked?' ready':'');const badge=achievementBadge('STAGE '+n,'⚑',unlocked?'보상 수령 가능':s.highestStage+' / '+n+' 도달',unlocked,()=>['조건: STAGE '+n+' 도달','보상: '+fmt(prize.gold)+' G',itemName('core')+' '+prize.core+'개','T'+fieldGearTier(n)+' 장비 · 희귀 55% / 영웅 9% / 전설 1% · 결정 5개 35%','신화 제외 · 드롭률 영향 없음','이 보상은 한 번만 수령할 수 있습니다.']);const button=document.createElement('button');button.className='milestone-claim';button.textContent=unlocked?'받기':'미달성';button.disabled=!unlocked;button.onclick=()=>claimMilestone(n);row.append(badge,button);list.append(row)}$('milestone-claimed').textContent='보상 '+s.claimedMilestones.length+'개 수령 완료 · 51단계 이후 10단계마다 새 보상';

}
loadGrowthProtection();s.balanceVersion=4;s.kills=Math.min(s.kills,requiredKills());
s.heroHp=s.heroHp===null?heroMaxHp():Math.min(s.heroHp,heroMaxHp());
loadBattleReward();
const resumed=s.journey;
offline(Date.now()-s.lastSeen);
if(resumed&&MOBS[resumed.currentMob]&&['combat','loot','travel','defeated','victory','results'].includes(resumed.phase)&&Number.isFinite(resumed.hp)&&Number.isFinite(resumed.maxHp)&&resumed.maxHp>0){lastLoot=Array.isArray(resumed.lastLoot)?resumed.lastLoot.filter(x=>x&&Object.hasOwn(ITEMS,x.key)&&Number.isInteger(x.count)&&x.count>0):[];enemyClock=Math.max(0,Number(resumed.enemyClock)||0);currentMob=resumed.currentMob;phase=resumed.phase;phaseLeft=Math.max(0,Number(resumed.phaseLeft)||0);travelTotal=Math.max(.8,Number(resumed.travelTotal)||travelSeconds());boss=resumed.boss===true;bossId=Math.max(0,Math.min(BOSSES.length-1,Math.floor(Number(resumed.bossId)||0)));bossGate=false;bossStrikes=Math.max(0,Math.min(10000,Math.floor(Number(resumed.bossStrikes)||0)));bossTier=Object.hasOwn(BOSS_TIERS,resumed.bossTier)?resumed.bossTier:'normal';bossEncounterStage=Math.max(1,Number(resumed.bossEncounterStage)||s.highestStage);bossLeft=Math.max(.1,Math.min(BOSS_TIERS[bossTier].time,Number(resumed.bossLeft)||BOSS_TIERS[bossTier].time));attackClock=Math.max(0,Math.min(1/speed(),Number(resumed.attackClock)||0));enemyClock=Math.min(enemyClock,enemyInterval());maxHp=boss?bossHealth(bossId,bossTier,bossEncounterStage):resumed.maxHp;hp=phase==='combat'?Math.max(1,Math.min(maxHp,resumed.hp*(boss?maxHp/resumed.maxHp:1))):0;}else spawn();
if(['victory','results'].includes(phase)&&(!s.rewardPending||!s.battleReward)){boss=false;phase='loot';phaseLeft=.8}s.rewardPending=['victory','results'].includes(phase)&&!!s.battleReward;if(phase==='results')showBattleReward();
if(boss&&s.bossReadyAt[bossId]===0)s.bossReadyAt[bossId]=Date.now()+bossCooldown(bossId,bossTier)*1000;if(!boss&&s.kills>=requiredKills()){if(!s.farmMode)s.stage++;s.highestStage=Math.max(s.highestStage,s.stage);s.kills=0;beginTravel();log('완료된 스테이지를 복구하고 다음 구역으로 이동합니다.')}if(s.heroHp<=0&&phase!=='defeated')defeatHero();
log('HP와 방어력을 확인하고 모험을 준비하세요.');render();renderLoot();save();
function stepCombat(dt){if(!Number.isFinite(dt)||dt<=0||persistence.status==='conflict')return;if(document.hidden||s.paused||$('boss-dialog').open)return;if(stepBattleReward(dt)){render();return}advanceTrail(dt);advancePotential(dt);if(phase==='defeated'){phaseLeft-=dt;if(phaseLeft<=0){s.heroHp=heroMaxHp();beginTravel();log('회복 완료 · 다시 모험을 시작합니다.')}render();return}if(phase==='loot'||phase==='travel'){s.heroHp=Math.min(heroMaxHp(),s.heroHp+heroMaxHp()*.05*dt);phaseLeft-=dt;if(phaseLeft<=0){if(phase==='loot')beginTravel();else{spawn();renderLoot()}}render();return}if(boss){bossLeft-=dt;if(bossLeft<=0){boss=false;lastLoot=[];beginTravel();log('시간 초과 · 강화 후 다시 도전해 보세요.');notify('보스 도전이 끝났어요.');renderLoot();render();return}}regenerateBoss(dt);advancePassives(dt);if(phase!=='combat'){render();return}attackClock+=dt;enemyClock+=dt;
while(phase==='combat'){
 const heroInterval=1/speed(),foeInterval=enemyInterval(),heroDue=attackClock-heroInterval,foeDue=enemyClock-foeInterval;
 if(heroDue<-1e-9&&foeDue<-1e-9)break;
 // Greater overdue time means an earlier attack. Exact ties favor the defender.
 if(foeDue>=-1e-9&&(heroDue<-1e-9||foeDue>=heroDue-1e-9)){enemyClock=Math.max(0,enemyClock-foeInterval);monsterHit();}
 else{attackClock=Math.max(0,attackClock-heroInterval);const c=Math.random()<crit();const dealt=Math.min(hp,attack()*(c?2:1));damage(attack()*(c?2:1),c);potentialHitEffects(dealt);if(s.heroHp>0&&passivePower('leech'))s.heroHp=Math.min(heroMaxHp(),s.heroHp+Math.min(heroMaxHp()*.02,dealt*.02*passivePower('leech')));if(phase==='combat'&&passivePower('echo')&&Math.random()<.05){damage(attack()*4*passivePower('echo'),true);passiveNotice('새벽의 메아리 자동 발동')}}
}
render()}
setInterval(()=>{if(!$('view-boss').hidden)renderBossList();const now=Date.now(),dt=Math.max(0,Math.min((now-lastTick)/1000,.5));lastTick=now;tick(dt)},100);
setInterval(()=>{if(!document.hidden)save()},5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){$('arena').classList.add('scene-paused');hiddenAt=Date.now();save()}else{if(hiddenAt){offline(Date.now()-hiddenAt);hiddenAt=null;save()}lastTick=Date.now();render()}});window.addEventListener('pagehide',save);
const context=document.modelContext;if(context?.registerTool){const lifecycle=new AbortController();const defs=[{name:'read_adventure',description:'현재 모험의 골드, 스테이지, 강화 상태를 읽습니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({gold:s.gold,stage:s.stage,attack:s.attack,speed:s.speed,crit:s.crit,paused:s.paused})},{name:'upgrade_adventurer',description:'골드를 사용해 선택한 능력치를 한 번 강화합니다.',inputSchema:{type:'object',properties:{upgrade:{type:'string',enum:['attack','speed','crit','move','vitality','guard']}},required:['upgrade'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input!=='object'||!Object.hasOwn(upgrades,input.upgrade))throw Error('강화 종류가 올바르지 않습니다.');return upgrade(input.upgrade)}}];for(const def of defs){try{Promise.resolve(context.registerTool(def,{signal:lifecycle.signal})).catch(()=>{})}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}

const VIEW_NAMES={boss:['EXPEDITION BOARD','보스 원정'],shop:['PASSIVE SHOP','작은 숲의 패시브 상점'],battle:['CHAPTER 01 / THE LITTLE FOREST','오늘도, 숲으로.'],equipment:['EQUIPMENT','모험을 함께할 장비'],inventory:['BACKPACK','차곡차곡 모은 보물'],codex:['FIELD GUIDE','숲속 친구들 도감'],journey:['ADVENTURE NOTES','우리의 모험 기록'],collection:['COLLECTION & RECORDS','모을수록, 더 멀리']};
let activeView='battle';
function showView(key,focus=false){if(!Object.hasOwn(VIEW_NAMES,key))return false;activeView=key;hideCraftTip();hideGearTip();hideAchievementTip();for(const id of Object.keys(VIEW_NAMES)){const chosen=id===key;$('view-'+id).hidden=!chosen;$('tab-'+id).setAttribute('aria-selected',String(chosen));$('tab-'+id).tabIndex=chosen?0:-1;}[$('view-eyebrow').textContent,$('view-title').textContent]=VIEW_NAMES[key];if(key==='boss')renderBossList();if(key==='shop')renderPassives();if(key==='equipment')renderEquipment();if(key==='inventory')renderLoot();if(key==='codex')renderCodex();if(key==='collection')renderCollection();if(focus)$('tab-'+key).focus();window.scrollTo({top:0,behavior:'instant'});return true}
const viewKeys=['battle','boss','equipment','inventory','shop','collection','codex','journey'];for(const key of viewKeys){$('tab-'+key).onclick=()=>showView(key);$('tab-'+key).onkeydown=e=>{let i=viewKeys.indexOf(key);if(e.key==='ArrowRight'||e.key==='ArrowDown')i=(i+1)%viewKeys.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')i=(i+viewKeys.length-1)%viewKeys.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=viewKeys.length-1;else return;e.preventDefault();showView(viewKeys[i],true)}}

$('open-collection').onclick=()=>showView('collection');

for(const mode of ['sets','milestones'])$('show-'+mode).onclick=()=>{for(const other of ['sets','milestones']){$(other+'-pane').hidden=other!==mode;$('show-'+other).setAttribute('aria-pressed',String(other===mode))}};

$('close-gear-tip').onclick=hideGearTip;document.addEventListener('keydown',e=>{if(e.key==='Escape')hideGearTip()});window.addEventListener('scroll',hideGearTip,{passive:true});window.addEventListener('resize',hideGearTip);


$('gear-list').onscroll=hideGearTip;

for(const mode of [1,10,100,'max'])$('buy-mode-'+mode).onclick=()=>setBuyMode(mode);

for(const key of Object.keys(RECIPES)){$('craft-'+key).onclick=()=>craft(key);const info=$('recipe-info-'+key);info.onmouseenter=()=>{if(!craftTipPinned)showCraftTip(key,info)};info.onmouseleave=()=>{if(!craftTipPinned)hideCraftTip()};info.onfocus=()=>{if(!craftTipPinned)showCraftTip(key,info)};info.onblur=()=>{if(!craftTipPinned)hideCraftTip()};info.onclick=()=>{craftTipPinned=true;showCraftTip(key,info)}}
$('close-craft-tip').onclick=hideCraftTip;window.addEventListener('scroll',hideCraftTip,{passive:true});window.addEventListener('resize',hideCraftTip);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideCraftTip()});

$('close-achievement-tip').onclick=hideAchievementTip;window.addEventListener('scroll',hideAchievementTip,{passive:true});window.addEventListener('resize',hideAchievementTip);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideAchievementTip()});


function setCraftFilter(filter){if(!['all','ring','armor','weapon','boots'].includes(filter))return false;craftFilter=filter;for(const k of ['all','ring','armor','weapon','boots'])$('craft-filter-'+k).setAttribute('aria-pressed',String(k===filter));hideCraftTip();renderCrafting();return true}
$('craft-ready-only').onchange=e=>{craftReadyOnly=e.target.checked;hideCraftTip();renderCrafting()};
for(const filter of ['all','ring','armor','weapon','boots'])$('craft-filter-'+filter).onclick=()=>setCraftFilter(filter);
$('craft-practiceblade').onclick=()=>craft('practiceblade');

function loadTrails(){
 let raw={};try{raw=JSON.parse(readSaveRaw())||{}}catch{}
 const old=raw.trails||{},num=(v,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
 s.trails={version:2,route:num(old.route,2),step:num(old.step,2),points:num(old.points,old.version===2?150:90)*(old.version===2?1:150/90),seconds:num(old.seconds,old.version===2?1500:300)*(old.version===2?1:5),laps:num(old.laps,1e9),relics:Array.isArray(old.relics)?[...new Set(old.relics.filter(v=>Number.isInteger(v)&&v>=0&&v<9))]:[],visits:[0,1,2].map(i=>num(old.visits?.[i],1e9)),history:Array.isArray(old.history)?old.history.filter(v=>typeof v==='string').slice(0,4):[]};
 // Retire the combat override; carry unfinished legacy progress into exploration.
 if(!raw.trails&&['queued','active','ready'].includes(raw.expedition)){s.trails.points=raw.expedition==='ready'?150:Math.min(100,(Number(raw.expeditionWins)||0)*33);s.trails.seconds=raw.expedition==='ready'?1500:0}
 s.expedition='idle';s.expeditionWins=0;
}
function trailBonus(){return (s.trails?.relics.length||0)*.01+Math.min(.06,(s.trails?.laps||0)*.002)}
function trailPace(){return 1+Math.min(.15,Math.max(0,(Math.sqrt(movementSpeed())-1)*.12))}
function trailNote(text){s.trails.history.unshift(text);s.trails.history=s.trails.history.slice(0,4);log('자동 탐사 · '+text)}
function progressTrail(wasBoss,id){if(s.total<10)return;const t=s.trails;t.points=Math.min(150,t.points+(wasBoss?10:id==='treasure'?8:MOBS[id]?.elite?4:1));resolveTrail()}
function advanceTrail(dt){if(s.total<10||s.heroHp<=0||['defeated','victory','results'].includes(phase))return;s.trails.seconds=Math.min(1500,s.trails.seconds+Math.max(0,Math.min(1,dt))*trailPace());resolveTrail()}
function resolveTrail(rng=Math.random){
 const t=s.trails;if(s.total<10)return;
 const route=TRAILS[t.route];
 while(t.step<3&&t.points>=[30,90,150][t.step]&&t.seconds>=[300,900,1500][t.step]){
  const step=t.step++;
  if(step===0){award(route.material,1);trailNote(route.name+' · 흔적 발견 / '+ITEMS[route.material].name+' ×1')}
  else if(step===1){
   const base=t.route*3,missing=[0,1,2].map(i=>base+i).filter(i=>!t.relics.includes(i));
   // First visit and each fifth survey protect long-term collection from bad luck.
   const guaranteed=t.visits[t.route]%5===0&&missing.length;
   const relic=guaranteed?missing[0]:base+rollTrailRelic(rng);
   if(!t.relics.includes(relic)){t.relics.push(relic);trailNote('유물 발견 · '+route.relics[relic-base]+' / 수집 효과 상승');notify('✧ 새 탐사 유물! '+route.relics[relic-base])}
   else{award(route.material,2);trailNote('중복 유물 연구 · '+ITEMS[route.material].name+' ×2')}
   t.visits[t.route]++;
  }else{
   const gold=Math.max(250,Math.round(reward()*40));s.gold+=gold;award(route.material,6);award('skillstone',1);award('seal',2);
   if(rng()<.1){award('skillstone',1);trailNote('보급 도착 · '+gold+' G / 재료 ×6 / 스킬석 ×2 / 조사 증표 ×2')}
   else trailNote('보급 도착 · '+gold+' G / '+ITEMS[route.material].name+' ×6 / 스킬석 ×1 / 조사 증표 ×2');
   t.laps++;t.route=(t.route+1)%3;t.points=0;t.seconds=0;t.step=0;notify('탐사 완료 · 보상 자동 지급 / 다음 숲길로 출발');save();renderLoot();return;
  }
  save();renderLoot();
 }
}
function expeditionFight(){return false}
function startExpedition(){return false}
function claimExpedition(){return false}
function renderExpedition(){
 const t=s.trails,route=TRAILS[t.route],unlocked=s.total>=10;
 const running=unlocked&&!s.paused&&!document.hidden&&s.heroHp>0&&!['defeated','victory','results'].includes(phase);$('trail-state').textContent=running?'● 탐사 진행 중':'○ 대기 중';$('trail-state').setAttribute('data-running',String(running));$('trail-shortcut').textContent='자동 탐사 '+Math.floor(Math.min(t.points/150,t.seconds/1500)*100)+'% · '+(running?'진행':'대기')+' ›';$('expedition-title').textContent=route.icon+' 숲길 자동 탐사 · '+route.name;
 $('expedition-info').textContent=!unlocked?'몬스터 '+(10-s.total)+'마리 처치 후 자동 출발':s.paused?'일시정지 · 사냥 재개 시 탐사 진행':phase==='defeated'?'회복 대기 · 탐사 진행 보존':['victory','results'].includes(phase)?'전리품 확인 대기 · 확인 후 탐사 재개':['흔적 발견','유물 조사','보급 도착'][t.step]+'까지 · 흔적 '+t.points+' / '+[30,90,150][t.step]+' · 탐사 '+Math.floor(t.seconds)+' / '+[300,900,1500][t.step]+'초 · 다음 목표까지 '+Math.ceil(Math.max(0,[300,900,1500][t.step]-t.seconds)/trailPace())+'초'+(t.points<[30,90,150][t.step]?' / 사냥 흔적 수집 중':' / 흔적 충족');
 $('expedition-record').textContent='완주 '+t.laps+'회 · 유물 '+t.relics.length+'/9 · 최대 HP·골드 각각 +'+(trailBonus()*100).toFixed(1)+'%'+(s.expeditionClears?' · 이전 원정 '+s.expeditionClears+'회':'');
 $('trail-progress').style.width=(Math.min(t.points/150,t.seconds/1500)*100)+'%';
 $('trail-next').textContent='자동 순환 → '+TRAILS[(t.route+1)%3].name+' · 기본 25분 / 이동 보정 ×'+trailPace().toFixed(2)+' · 완주 시 HP·골드 +0.2%p (훈련 최대 6%)';
 $('trail-log').textContent=t.history.join('\n')||'숲을 사냥하며 흔적을 모으세요. 쓰러져도 탐사 기록은 유지됩니다.';
 const signature=t.relics.join(',')+'|'+t.route;if(signature===trailSignature)return;trailSignature=signature;
 $('trail-collection').replaceChildren();TRAILS.forEach((r,index)=>{const card=document.createElement('div');card.className='trail-route'+(index===t.route?' current':'');const title=document.createElement('strong');title.textContent=r.icon+' '+r.name;const line=document.createElement('p');line.textContent=r.relics.map((name,i)=>t.relics.includes(index*3+i)?'◆ '+name:'◇ ???').join(' · ');card.append(title,line);$('trail-collection').append(card)});
}

function paintImpact(amount,critical=false,received=false,blocked=false,heavy=false){
 if(quietCombatEffects()||s.paused)return;
 emitCombatEffect(blocked?'guard':received?(heavy?'heavy':'hurt'):critical?'critical':'slash');
 const layer=$('impact-layer'),n=document.createElement('span'),position=impactSerial++;
 n.className='impact-number'+(critical?' critical-hit':'')+(received?' received-hit':'');n.textContent=(blocked?'방어 ':critical?'치명타 ':'')+(received?'−':'')+fmt(amount);
 n.style.left=(received?24:48+(position*7)%15)+'%';n.style.top=(received?67:38+(position*5)%12)+'%';layer.append(n);while(layer.children.length>10){const oldest=layer.children[0];clearTimeout(impactTimers.get(oldest));impactTimers.delete(oldest);oldest.remove()}impactTimers.set(n,setTimeout(()=>{n.remove();impactTimers.delete(n)},1600));
 const arena=$('arena');arena.classList.remove('impact-flash');void arena.offsetWidth;arena.classList.add('impact-flash');
 if(critical&&!received){clearTimeout(strikeTimers.critical);arena.classList.remove('enemy-critical-hit');void arena.offsetWidth;arena.classList.add('enemy-critical-hit');strikeTimers.critical=setTimeout(()=>{arena.classList.remove('enemy-critical-hit');strikeTimers.critical=null},620)}
}
function showImpact(amount,critical=false,received=false,blocked=false,heavy=false){
 $('encounter-intro').classList.remove('reveal');animateStrike(received,critical,heavy);
 $('last-impact').textContent=received?'받은 피해 '+fmt(amount)+(blocked?' · 방어 성공':''):'준 피해 '+fmt(amount)+(critical?' · 치명타':'');
 if(received){paintImpact(amount,critical,received,blocked,heavy);return}
 if(quietCombatEffects()||s.paused)return;
 if(pendingHeroContact){pendingHeroContact.amount+=amount;pendingHeroContact.critical||=critical;return}
 pendingHeroContact={amount,critical,serial:encounterSerial};
 atHeroPose('contact',.66,()=>{const hit=pendingHeroContact;pendingHeroContact=null;if(hit&&hit.serial===encounterSerial&&['combat','loot','victory'].includes(phase))paintImpact(hit.amount,hit.critical)},Math.max(0,heroContactAt-Date.now()));
}


function positionItemTip(tip,anchor,preferredWidth){const pad=12,gap=10,rect=anchor.getBoundingClientRect(),width=Math.min(preferredWidth,window.innerWidth-pad*2);tip.style.width=width+'px';tip.style.maxHeight=Math.max(80,window.innerHeight-pad*2)+'px';tip.hidden=false;const height=tip.getBoundingClientRect().height;let left=rect.left,top=rect.top-height-gap;if(rect.right+gap+width<=window.innerWidth-pad){left=rect.right+gap;top=rect.top}else if(rect.left-gap-width>=pad){left=rect.left-gap-width;top=rect.top}else if(top<pad){top=rect.bottom+gap}tip.style.left=Math.max(pad,Math.min(window.innerWidth-width-pad,left))+'px';tip.style.top=Math.max(pad,Math.min(window.innerHeight-height-pad,top))+'px';}
document.addEventListener('pointerdown',()=>{hideGearTip();hideCraftTip();hideAchievementTip()},true);
document.addEventListener('scroll',()=>{hideGearTip();hideCraftTip();hideAchievementTip()},true);

for(const category of ['all',...Object.keys(SLOT_NAMES)])$('gear-category-'+category).onclick=()=>{gearFilter=category;gearPage=0;hideGearTip();renderEquipment()};

function passiveNotice(message){$('passive-event').textContent=message;}
function advancePassives(dt){if(phase!=='combat'||s.paused||s.heroHp<=0)return;s.passiveClock.heal=Math.min(20,s.passiveClock.heal+dt);if(passivePower('heal')&&s.heroHp<=heroMaxHp()*.4&&s.passiveClock.heal>=20){s.passiveClock.heal=0;const recovery=heroMaxHp()*.12*passivePower('heal');s.heroHp=Math.min(heroMaxHp(),s.heroHp+recovery);passiveNotice('응급 재생 · HP +'+fmt(recovery))}if(passivePower('light')){s.passiveClock.light+=dt;if(s.passiveClock.light>=12){s.passiveClock.light-=12;damage(attack()*1.8*passivePower('light'));passiveNotice('빛의 일격 자동 발동')}}}
function drawPassive(rng=Math.random){if(!canMutate())return false;if((s.inventory.skillstone||0)<3)return false;s.inventory.skillstone-=3;s.draws++;const key=pickPassive(PASSIVES,rng);const level=s.passives[key]||0;if(level>=5){s.inventory.skillstone++;s.drawResult=PASSIVES[key].name+' · 최대 레벨 중복 / 스킬석 1개 반환'}else if(level===0||rng()<passiveUpgradeChance(level)){s.passives[key]=level+1;s.drawResult=PASSIVES[key].name+' · '+(level?'강화 성공! Lv.'+(level+1):'신규 획득 Lv.1')}else{s.inventory.skillstone++;s.drawResult=PASSIVES[key].name+' · 강화 실패 / Lv.'+level+' 유지 · 스킬석 1개 반환'}log('패시브 뽑기 · '+s.drawResult);notify(s.drawResult);save();render();renderLoot();return key}
function renderPassives(){renderSpecial();const signature=JSON.stringify([s.inventory.skillstone,s.draws,s.drawResult,s.passives]);if(signature===passiveRenderSignature)return;passiveRenderSignature=signature;const stones=s.inventory.skillstone||0;$('shop-stones').textContent=stones+'개';$('passive-draw').disabled=stones<3;$('shop-draw-count').textContent='누적 '+s.draws+'회';$('draw-result').textContent=s.drawResult||'스킬석을 모아 첫 패시브를 만나 보세요.';const owned=Object.keys(PASSIVES).filter(k=>s.passives[k]);$('passive-summary').textContent=owned.length?owned.map(k=>PASSIVES[k].name+' Lv.'+s.passives[k]).join(' · '):'보유 패시브 없음 · 상점에서 스킬석으로 획득';for(const [key,p] of Object.entries(PASSIVES)){const lv=s.passives[key]||0;$('passive-level-'+key).textContent=lv?'Lv.'+lv+' / 5 · '+(lv<5?'다음 강화 '+Math.round(passiveUpgradeChance(lv)*100)+'%':'최대 레벨'):'미보유';$('passive-effect-'+key).textContent=p.desc+(lv>1?' · 효과량 ×'+passivePower(key).toFixed(1):'');$('passive-card-'+key).classList.toggle('owned',lv>0)}}
$('passive-draw').onclick=()=>drawPassive();$('open-passive-shop').onclick=()=>showView('shop');

function passiveUpgradeChance(level){return [1,.8,.6,.4,.2,0][Math.max(0,Math.min(5,level))]}
function baseGearScore(g){if(!g)return -1;const item=ITEMS[g.key],mult=gearTierMultiplier(g)*(1+g.roll/100*(g.exceptional?1.5:1));if(item.slot==='weapon')return (item.damage||0)*mult*1000;if(item.slot==='ring')return ((item.luck||0)*100+(item.gold||0)*60)*mult;if(item.slot==='boots')return (item.movement||0)*mult*100;return ((item.hp||0)+(item.armor||0)*8)*mult+(g.ward||0)*2000}
function equipRecommended(){if(!canMutate())return false;let changed=0;for(const slot of Object.keys(SLOT_NAMES)){const current=equippedGear(slot),best=recommendedGear(slot);if(best&&best.id!==current?.id){s.slots[slot]=best.id;changed++}}syncLegacySlots();s.heroHp=Math.min(s.heroHp,heroMaxHp());hideGearTip();save();render();renderLoot();notify(changed?'추천 장비 '+changed+'부위 장착 완료':s.gear.length?'현재 추천 장비를 모두 장착 중입니다.':'장비를 획득하면 추천 비교가 표시됩니다.');return changed}
function salvageReward(g){const rarity=ITEMS[g.key].rarity;return {stone:'stone_'+rarity,gold:({common:5,rare:10,epic:20,legendary:40,mythic:80})[rarity]}}
let pendingDismantle=null;
function previewDismantle(id){const g=s.gear.find(x=>x.id===id);if(!g||g.locked||s.slots[ITEMS[g.key].slot]===id)return false;pendingBulk=null;pendingDismantle=id;$('salvage-confirm').textContent='1개 분해';const reward=salvageReward(g);$('salvage-name').textContent=ITEMS[g.key].name+' · '+RARITIES[ITEMS[g.key].rarity];$('salvage-options').textContent=gearText(g)+' / '+optionText(g)+(g.ward?' / 숲의 가호 +'+pct(g.ward):'')+' / 잠재: '+(g.potentials||[]).map(potentialLine).join(' · ');$('salvage-reward').textContent=ITEMS[reward.stone].name+' 1개 + '+reward.gold+' G';$('salvage-count').textContent='보유 '+g.quantity+'개 중 1개를 분해합니다. 이 장비는 복구할 수 없습니다.';hideGearTip();$('salvage-dialog').showModal();return true}
function dismantleGear(id){if(!canMutate())return false;const g=s.gear.find(x=>x.id===id);if(!g||g.locked||s.slots[ITEMS[g.key].slot]===id||!(s.inventory[g.key]>0))return false;const reward=salvageReward(g);s.inventory[g.key]--;if(g.quantity>1)g.quantity--;else s.gear=s.gear.filter(x=>x.id!==id);award(reward.stone);s.gold+=reward.gold;if(selectedGearId===id&&!s.gear.some(x=>x.id===id))selectedGearId=null;pendingDismantle=null;hideGearTip();$('salvage-dialog').close();log(ITEMS[g.key].name+' 분해 · '+ITEMS[reward.stone].name+' +1 / '+reward.gold+' G');save();render();renderLoot();return true}
$('equip-recommended').onclick=()=>{const changed=equipRecommended();if(changed===0){$('loadout-details').open=true;$('loadout-details').scrollIntoView?.({block:'nearest',behavior:'smooth'})}};$('salvage-confirm').onclick=()=>pendingBulk?confirmBulkDismantle():dismantleGear(pendingDismantle);$('salvage-cancel').onclick=()=>{pendingDismantle=null;pendingBulk=null;$('salvage-dialog').close()};

function tick(dt){if(!Number.isFinite(dt)||dt<=0)return;if(persistence.status==='conflict')return;if(document.hidden||s.paused||$('boss-dialog').open)return;tickRendering=true;try{stepCombat(dt)}finally{tickRendering=false;render()}}
function bossRemaining(id){return Math.max(0,Math.ceil((s.bossReadyAt[id]-Date.now())/1000))}
function bossCooldown(id,tier='normal'){return Math.ceil([1800,3600,7200,9000,10800][id]*BOSS_TIERS[tier].cooldown*(1-expeditionReduction()))}
function bossTierChances(){return {elite:Math.min(.6,.1*luck()),mystic:Math.min(.1,.001*luck())}}
function rollBossTier(rng=Math.random){const p=bossTierChances(),roll=rng();return roll<p.mystic?'mystic':roll<p.mystic+p.elite?'elite':'normal'}
function bossDropChance(p,tier='normal'){return Math.min(1,p*luck()*BOSS_TIERS[tier].loot)}
function bossGuaranteedText(tier,id=0){return ' · T'+bossGearTier(id,tier)+' 장비 확정: '+BOSS_GEAR_POOLS[id].map(k=>ITEMS[k].name).join(' / ')+' 중 균등 추첨 1개'+(tier==='normal'?'':tier==='elite'?' · 같은 후보 추가 1개 + 스킬석 3개':' · 태초의 파수검 / 태초의 인장 반지 중 추가 1개 + 스킬석 10개')}

function formatBossTime(seconds){seconds=Math.ceil(seconds);return Math.floor(seconds/3600)?Math.floor(seconds/3600)+'시간 '+Math.floor(seconds%3600/60)+'분':Math.floor(seconds/60)+'분 '+seconds%60+'초'}
function renderBossList(){
 const signature=JSON.stringify([s.highestStage,s.total,s.bossWins,s.paused,boss,s.bossReadyAt.map((_,i)=>bossRemaining(i))]);if(signature===bossListSignature)return;bossListSignature=signature;
 $('boss-entry-note').textContent='보스를 클릭해 능력치·보상·준비도를 확인하고 입장하세요.';
 const chances=bossTierChances();$('boss-variant-chances').textContent='변이 확률 · 엘리트 '+pct(chances.elite)+' / 미스틱 '+pct(chances.mystic);
 const list=$('boss-list');if(!list.children.length)BOSSES.forEach((b,id)=>{const card=document.createElement('button');card.className='boss-card boss-select';card.setAttribute('aria-label',b.name+' 상세 보기');const art=createAtlasArt(creatureArt('boss'+id),'boss-card-art',b.name),content=document.createElement('div');content.className='boss-card-content';const h=document.createElement('h3');h.textContent=b.name;const status=document.createElement('p');content.append(h,status);card.append(art,content);card.onclick=()=>{openQuickBoss();selectQuickBoss(id)};list.append(card)});
 BOSSES.forEach((b,id)=>{const remaining=bossRemaining(id);list.children[id].children[1].children[1].textContent=(!bossUnlocked(id)?b.desc:remaining?'대기 '+formatBossTime(remaining):'도전 가능')+' · T'+bossGearTier(id)+' · 상세 보기 ›'});
}
for(const tier of Object.keys(BOSS_TIERS))$('codex-tier-'+tier).onclick=()=>{codexBossTier=tier;for(const other of Object.keys(BOSS_TIERS))$('codex-tier-'+other).setAttribute('aria-pressed',String(other===tier));renderCodex()};

function renderBossDock(){const remaining=BOSSES.map((_,i)=>bossRemaining(i)),ready=BOSSES.map((_,i)=>i).filter(id=>bossUnlocked(id)&&remaining[id]===0),signature=JSON.stringify([remaining,ready,s.total,boss,s.paused,s.expedition,phase==='defeated']);if(signature===bossDockSignature)return;bossDockSignature=signature;$('dock-ready-count').textContent=ready.length?ready.length+'곳 도전 가능':'원정 대기';$('header-boss-state').textContent=boss?'전투 중':ready.length?ready.length+'곳 준비 완료':'대기 확인';$('dock-boss-summary').textContent=boss?'보스 전투가 진행 중입니다.':!bossUnlocked(0)?'첫 원정까지 몬스터 '+(10-s.total)+'마리':ready.length?'준비된 원정을 확인하고 출발하세요.':'재도전을 기다리며 장비를 준비하세요.';for(let id=0;id<BOSSES.length;id++){$('dock-boss-name-'+id).textContent=BOSSES[id].name;$('dock-boss-time-'+id).textContent=!bossUnlocked(id)?(id===0?'10마리 처치':'STAGE '+BOSSES[id].unlock):remaining[id]?formatBossTime(remaining[id]):'도전 가능';$('dock-boss-time-'+id).classList.toggle('available',bossUnlocked(id)&&remaining[id]===0)}$('dock-boss-action').classList.toggle('ready',ready.length>0);}
$('dock-boss-action').onclick=openQuickBoss;$('header-boss').onclick=openQuickBoss;

function updateNavigationOrientation(){$('game-navigation').setAttribute('aria-orientation',window.innerWidth<=800?'horizontal':'vertical')}
updateNavigationOrientation();window.addEventListener('resize',updateNavigationOrientation);

function rarityRank(r){return ['common','rare','epic','legendary','mythic'].indexOf(r)}
$('gear-sort').onchange=e=>{gearSort=e.target.value;gearPage=0;renderEquipment()};
$('bag-sort').onchange=e=>{bagSort=e.target.value;renderLoot()};
function bulkCandidates(limit){const protectedIds=new Set();for(const role of Object.keys(LOADOUT_ROLES))for(const slot of Object.keys(SLOT_NAMES)){const best=recommendedGear(slot,role);if(best)protectedIds.add(best.id)}return s.gear.filter(g=>!g.locked&&s.slots[ITEMS[g.key].slot]!==g.id&&(rarityRank(ITEMS[g.key].rarity)<=1||(!protectedIds.has(g.id)&&!g.exceptional&&!g.ward&&!potentialProtected(g)))&&rarityRank(ITEMS[g.key].rarity)<=limit&&rarityRank(ITEMS[g.key].rarity)<=2&&(gearFilter==='all'||ITEMS[g.key].slot===gearFilter))}
function previewBulkDismantle(){const limit=Number($('bulk-rarity').value);if(![0,1,2].includes(limit))return false;const candidates=bulkCandidates(limit);if(!candidates.length){notify('분해 대상 없음 · 장착/잠금 상태와 등급·분류를 확인하세요. 영웅 추천·특수 옵션은 개별 분해할 수 있습니다.');return false}pendingDismantle=null;pendingBulk={limit,ids:candidates.map(g=>g.id)};let gold=0,count=0;const stones={};for(const g of candidates){const r=salvageReward(g);count+=g.quantity;gold+=r.gold*g.quantity;stones[r.stone]=(stones[r.stone]||0)+g.quantity}$('salvage-name').textContent='미장착 장비 '+count+'개 일괄 분해';$('salvage-options').textContent='희귀 이하는 추천·대성공·가호도 포함합니다. 잠금·장착은 제외하며, 영웅의 추천·특수 옵션 및 전설·신화는 보호합니다.';$('salvage-reward').textContent=Object.entries(stones).map(([k,n])=>ITEMS[k].name+' '+n+'개').join(' / ')+' + '+gold+' G';$('salvage-count').textContent='현재 분류에 표시되는 대상만 분해합니다. 분해한 장비는 복구할 수 없습니다.';$('salvage-confirm').textContent=count+'개 일괄 분해';hideGearTip();$('salvage-dialog').showModal();return true}
function confirmBulkDismantle(){if(!canMutate())return false;if(!pendingBulk)return false;const request=pendingBulk;pendingBulk=null;const ids=new Set(request.ids);const targets=bulkCandidates(request.limit).filter(g=>ids.has(g.id));let count=0;for(const g of targets){const n=Math.min(g.quantity,s.inventory[g.key]||0);if(!n)continue;const r=salvageReward(g);s.inventory[g.key]-=n;g.quantity-=n;award(r.stone,n);s.gold+=r.gold*n;count+=n}s.gear=s.gear.filter(g=>g.quantity>0);selectedGearId=null;$('salvage-dialog').close();save();render();renderLoot();notify('장비 '+count+'개 분해 완료');return count}
$('bulk-salvage').onclick=previewBulkDismantle;
function progressResearch(wasBoss,id){s.research.hunt++;if(wasBoss)s.research.boss++;else if(MOBS[id]?.elite)s.research.elite++;const goals={hunt:80,elite:3,boss:2};for(const k of Object.keys(goals)){if(s.research[k]<goals[k])continue;s.research[k]-=goals[k];s.researchClears++;award('seal',k==='hunt'?1:k==='elite'?2:3);if(k==='hunt'){award('crystal',4);s.gold+=120}else if(k==='elite')award('dust',1);else award('skillstone',1);log('조사 의뢰 자동 완료 · '+({hunt:'숲 순찰',elite:'엘리트 관찰',boss:'보스 연구'})[k]);notify('조사 완료! 증표로 영웅 장비를 제작해 보세요.')}}
function renderResearch(){const signature=JSON.stringify([s.research,s.researchClears,s.inventory.seal]);if(signature===researchSignature)return;researchSignature=signature;$('research-summary').textContent='증표 '+(s.inventory.seal||0)+'개 · 누적 '+s.researchClears+'회 완료';for(const [k,n] of Object.entries({hunt:80,elite:3,boss:2})){$('research-'+k).textContent=s.research[k]+' / '+n;$('research-bar-'+k).style.width=s.research[k]/n*100+'%'}}

function gearScore(g,role='balanced'){if(!g)return -1;const slot=ITEMS[g.key].slot,type=slot==='weapon'?'atkPct':slot==='boots'?'movePct':slot==='ring'?'drop':'hpFlat';return baseGearScore(g)*roleWeight(type,role)+potentialScore(g,role)}
function recommendedGear(slot,role=s.loadoutRole){let best=equippedGear(slot);for(const g of s.gear)if(ITEMS[g.key].slot===slot&&gearScore(g,role)>gearScore(best,role)+1e-8)best=g;return best}
function setLoadoutRole(role){if(!Object.hasOwn(LOADOUT_ROLES,role)||!canMutate())return false;s.loadoutRole=role;save();renderEquipment();return true}
function renderLoadoutPlan(){
 const role=LOADOUT_ROLES[s.loadoutRole];$('loadout-focus').textContent=role.focus;
 for(const key of Object.keys(LOADOUT_ROLES))$('loadout-'+key).setAttribute('aria-pressed',String(s.loadoutRole===key));
 const list=$('loadout-plan');list.replaceChildren();let changes=0;
 for(const slot of Object.keys(SLOT_NAMES)){const current=equippedGear(slot),best=recommendedGear(slot),changed=best&&best.id!==current?.id;const row=document.createElement('div');row.className='loadout-choice'+(changed?' suggested':'');const label=document.createElement('small');label.textContent=SLOT_NAMES[slot];const name=document.createElement('strong');name.textContent=best?ITEMS[best.key].name:'장비를 모아 주세요';const note=document.createElement('span');note.textContent=changed?'교체 추천 · '+(current?ITEMS[current.key].name+'에서':'빈 슬롯에서'):best?'현재 장비 유지':'사냥 또는 제작으로 획득';row.append(label,name,note);list.append(row);if(changed)changes++}
 $('equip-recommended').textContent=changes?role.name+' · '+changes+'부위 장착':'추천 장비 다시 확인';$('equip-recommended').disabled=!canMutate();
}
function gearPageItems(gears){gearPage=Math.min(Math.max(0,gearPage),Math.max(0,Math.ceil(gears.length/GEAR_PAGE_SIZE)-1));return gears.slice(gearPage*GEAR_PAGE_SIZE,(gearPage+1)*GEAR_PAGE_SIZE)}
function changeGearPage(delta){gearPage+=delta;equipmentSignature='';renderEquipment()}

function attackAtLevel(level){return Math.round((10*Math.pow(1.12,level)*(1+gearStat('weapon','damage'))*(1+collectionBonus('attack'))+potentialSum('atkFlat'))*(1+potentialSum('atkPct'))*(1+(s.potentialBuff.left>0?s.potentialBuff.power:0))*(1+.03*specialPower('foxspirit')))}
function speedAtLevel(level){return Math.min(3,(1+Math.min(30,level)*.03+potentialSum('speedFlat'))*(1+.06*passivePower('haste'))*(1+potentialSum('speedPct')))}
function hpAtLevel(level){return Math.round((140*Math.pow(1.08,level)+gearStat('chest','hp')+gearStat('legs','hp')+potentialSum('hpFlat')+potentialSum('trinket'))*(1+potentialSum('hpPct'))*(1+trailBonus()))}
function defenseAtLevel(level){return Math.round((8+level*2+gearStat('chest','armor')+gearStat('legs','armor')+potentialSum('defFlat'))*(1+potentialSum('defPct')))}
function moveAtLevel(level){return (1+Math.min(30,level)*.015+potentialSum('moveFlat'))*(1+gearStat('boots','movement'))*(1+collectionBonus('movement'))*(1+potentialSum('movePct'))}
$('potential-close').onclick=()=>{potentialGearId=null;$('potential-dialog').close()};
$('potential-dialog').addEventListener('cancel',()=>{potentialGearId=null});
$('potential-reroll').onclick=()=>rerollPotential(potentialGearId);

$('victory-continue').onclick=finishBattleReward;
$('victory-dialog').addEventListener('cancel',e=>{e.preventDefault();finishBattleReward()});
$('reward-auto').onchange=e=>{s.rewardAuto=e.target.checked;save()};
$('reward-reopen').onclick=()=>showBattleReward(!s.rewardPending);
$('fx-toggle').onclick=()=>{s.effectsLite=!s.effectsLite;clearCombatEffects();save();renderEncounter()};

function bossEntryReason(id){if(s.rewardPending)return '전리품 확인을 마쳐 주세요.';if(boss)return '보스와 전투 중입니다.';if(s.paused)return '사냥을 재개하면 입장할 수 있습니다.';if(phase==='defeated'||s.heroHp<=0)return '모험가가 회복 중입니다.';if(currentMob==='treasure'&&phase==='combat')return '보물여우 전투를 먼저 마쳐 주세요.';if(!bossUnlocked(id))return BOSSES[id].desc;const wait=bossRemaining(id);return wait?'재도전까지 '+formatBossTime(wait):''}
function openQuickBoss(){quickBossId=null;quickBossSignature='';renderQuickBoss(true);$('quick-boss-dialog').showModal();return true}
function selectQuickBoss(id){if(!Number.isInteger(id)||id<0||id>=BOSSES.length)return false;quickBossId=id;quickBossSignature='';renderQuickBoss(true);$('quick-boss-list').children[id]?.scrollIntoView?.({block:'nearest',inline:'center'});return true}
// A read-only normal-boss projection. Optional procs and healing are deliberately excluded.
function preparationStats(){return {damage:attack()/(s.potentialBuff.left>0?1+s.potentialBuff.power:1),speed:speed(),critical:crit(),currentHp:s.heroHp,maxHp:heroMaxHp(),defense:heroDefense(),reduction:mitigation(),bossReduction:bossMitigation()}}
function projectBossPreparation(id,stats=preparationStats()){
 if(!Number.isInteger(id)||!BOSS_BALANCE[id]||!['damage','speed','critical','currentHp','maxHp','defense','reduction','bossReduction'].every(key=>Number.isFinite(stats[key]))||stats.damage<=0||stats.speed<=0||stats.maxHp<=0)return null;
 const pattern=BOSS_BALANCE[id],health=bossHealth(id),meanHit=stats.damage*(1+stats.critical);
 let enemyHp=health,heroHp=Math.min(stats.currentHp,stats.maxHp),attackTime=0,enemyTime=0,strikes=0,damageTaken=0,deathAt=heroHp<=0?0:null,killAt=null;
 for(let step=1;step<600;step++){
  const time=step/10;enemyHp=Math.min(health,enemyHp+bossRegenPerSecond(id)*.1);attackTime+=.1;enemyTime+=.1;
  while(attackTime>=1/stats.speed&&enemyHp>0){attackTime-=1/stats.speed;enemyHp-=meanHit}
  if(enemyHp<=0){killAt=time;break}
  const interval=()=>pattern.interval*(enemyHp/health<=.35?.85:1)*((strikes+1)%pattern.every===0?1.35:1);
  while(enemyTime>=interval()){
   enemyTime-=interval();const heavy=(strikes+1)%pattern.every===0,frenzy=enemyHp/health<=.35;
   const raw=Math.round(bossBaseAttack(id)*(frenzy?1.15:1)*(heavy?pattern.power:1));
   const hit=Math.max(1,Math.round(Math.max(0,raw-stats.defense*(1-bossPenetration(id)))*(1-stats.reduction)*(1-stats.bossReduction)));
   strikes++;heroHp-=hit;damageTaken+=hit;if(deathAt===null&&heroHp<=0)deathAt=time;
  }
 }
 return {killAt,deathAt,damageTaken,remainingHp:heroHp,remainingBossHp:Math.max(0,enemyHp),status:deathAt!==null?'survival':killAt===null?'time':'ready'};
}
function renderBossPreparation(id){
 const result=projectBossPreparation(id),card=$('boss-preparation');
 if(!result){card.setAttribute('data-status','unknown');$('boss-preparation-status').textContent='현재 능력치를 확인해 주세요';$('boss-preparation-time').textContent='계산 불가';$('boss-preparation-hp').textContent='계산 불가';$('boss-preparation-tip').textContent='능력치가 계산 범위를 벗어났습니다.';return}
 card.setAttribute('data-status',result.status);
 $('boss-preparation-status').textContent={survival:'생존 준비를 먼저 살펴보세요',time:'기본 공격 화력을 보완해 보세요',ready:'기본 전투 기준으로 도전 범위입니다'}[result.status];
 $('boss-preparation-time').textContent=result.killAt?result.killAt.toFixed(1)+'초 / 60초':'60초 초과 예상';
 $('boss-preparation-hp').textContent=result.deathAt!==null?result.deathAt.toFixed(1)+'초에 체력 소진 예상':'종료 시 약 '+fmt(result.remainingHp)+' HP';
 $('boss-preparation-tip').textContent=result.status==='survival'?(s.heroHp<heroMaxHp()*.8?'현재 체력이 낮습니다. 이동 중 회복한 뒤 다시 확인하세요.':'체력·방어·피해 감소 옵션을 준비하거나, 공격을 높여 전투 시간을 줄여 보세요.'):result.status==='time'?'공격력·공격 속도를 준비하세요. 보유 패시브의 추가 피해는 아래 계산에 포함하지 않았습니다.':'일반 원정으로 공략을 익혀 보세요. 변이는 체력과 공격력이 더 높습니다.';
}
function renderQuickBoss(force=false){if(!force&&!$('quick-boss-dialog').open)return;const signature=JSON.stringify([quickBossId,s.total,s.highestStage,s.heroHp>0,s.paused,boss,s.rewardPending,phase,s.expedition,currentMob,s.bossReadyAt.map((_,i)=>bossRemaining(i)),s.blueprintMisses,s.discovered,luck(),expeditionReduction(),attack(),speed(),crit(),Math.round(s.heroHp),heroMaxHp(),heroDefense(),mitigation(),bossMitigation()]);if(signature===quickBossSignature)return;quickBossSignature=signature;const list=$('quick-boss-list');if(force||!list.children.length){list.replaceChildren();BOSSES.forEach((b,id)=>{const btn=document.createElement('button');btn.className='quick-boss-row';btn.setAttribute('aria-pressed',String(quickBossId===id));const icon=createAtlasArt(creatureArt('boss'+id),'quick-boss-art');const title=document.createElement('strong');title.textContent=b.name;const status=document.createElement('small');status.id='quick-boss-status-'+id;btn.append(icon,title,status);btn.onclick=()=>selectQuickBoss(id);list.append(btn)})}BOSSES.forEach((b,id)=>{const status=list.children[id].children[2];status.textContent=!bossUnlocked(id)?b.desc:bossRemaining(id)?'대기 '+formatBossTime(bossRemaining(id)):'도전 가능';list.children[id].setAttribute('aria-pressed',String(quickBossId===id))});const id=quickBossId;$('quick-boss-detail').hidden=id===null;$('quick-boss-prompt').hidden=id!==null;if(id===null)return;renderBossPreparation(id);const b=BOSSES[id],ch=bossTierChances();const defenseFactor=(1-mitigation())*(1-bossMitigation()),hit=Math.max(1,Math.round((bossBaseAttack(id)-heroDefense()*(1-bossPenetration(id)))*defenseFactor)),heavy=Math.max(1,Math.round((bossBaseAttack(id)*BOSS_BALANCE[id].power-heroDefense()*(1-bossPenetration(id)))*defenseFactor));$('quick-boss-survival').textContent='현재 방어 기준 · 일반 공격 약 '+fmt(hit)+' / 강타 약 '+fmt(heavy)+' 피해 · 회피·방벽·격앙 제외';const rec=s.fieldNotes.bosses[id+'_normal'];$('quick-boss-history').textContent=rec?'업데이트 후 일반 격파 '+rec.wins+'회 · 최고 기록 '+(Number.isFinite(rec.best)?rec.best.toFixed(1)+'초':'시간 기록 없음'):'새 기록에 도전하세요 · 일반/엘리트/미스틱 기록은 따로 저장됩니다.';$('quick-boss-name').textContent=b.name;$('quick-boss-story').textContent=['작은 왕관을 지키는 숲 입구의 거북. 첫 보스 장비를 노려보세요.','오래된 돌길에서 잠든 수호자. 첫 보스보다 충분한 공격력과 방어력이 필요합니다.','깊은 숲길을 지키는 대장. 장비와 잠재를 갖춘 뒤 도전하는 장기 목표입니다.','달빛 가지의 졸린 부엉이. 달깃과 월영 설계도를 지킵니다.','숲 가장자리 도토리 기사. 호박철과 도토리 설계도를 지킵니다.'][id]+' · '+bossPatternText(id);$('quick-boss-stats').textContent='HP '+fmt(bossHealth(id))+' · 공격 '+bossBaseAttack(id)+' · 60초 / '+bossDefenseText(id);$('quick-boss-estimate').textContent='관통·재생을 반영한 예상 시간은 준비 점검에서 확인하세요 · 패시브/변이 미반영';$('quick-boss-blueprint').textContent=blueprintProgressText(id);$('quick-boss-rewards').textContent='첫 격파: '+ITEMS[['ring','scoutboots','mossblade','owlcoat','acornblade'][id]].name+' · 전용 재료 확정 · 전용 설계도 '+pct(itemDropChance('bp_'+['shellcoat','runelegs','groveblade','moonboots','acorncoat'][id],BOSS_TABLES[id].find(x=>ITEMS[x[0]].blueprint)[1],true))+' (일반, 현재 드롭률)'+bossGuaranteedText('normal',id);$('quick-boss-variants').textContent='엘리트 '+pct(ch.elite)+' / 미스틱 '+pct(ch.mystic)+' · 엘리트 장비 T'+bossGearTier(id,'elite')+' / 미스틱 T'+bossGearTier(id,'mystic')+' · 관통 +10 / +20%p · 변이 탐색에서만 추첨';$('quick-boss-wait').textContent='일반 원정 대기 '+formatBossTime(bossCooldown(id))+' · 입장 시 시작';const reason=bossEntryReason(id);$('quick-boss-reason').textContent=reason||'준비되었습니다. 입장하면 보스 전투가 시작됩니다.';$('quick-boss-enter').disabled=!!reason;$('quick-boss-normal').disabled=!!reason;}
function renderFarmMode(){$('farm-mode').setAttribute('aria-pressed',String(s.farmMode));$('farm-mode').textContent=s.farmMode?'현재 지역 반복 사냥':'자동 스테이지 돌파';$('farm-mode-note').textContent=s.farmMode?'처치 목표를 채워도 현재 지역에서 재료를 모읍니다.':'처치 목표를 채우면 다음 스테이지로 이동합니다.'}
$('quick-boss-close').onclick=()=>$('quick-boss-dialog').close();
$('quick-boss-enter').onclick=()=>{if(quickBossId!==null)startBoss(quickBossId)};
$('farm-mode').onclick=()=>{s.farmMode=!s.farmMode;save();render()};

$('craft-rarity').onchange=e=>{craftRarity=e.target.value;setCraftFilter(craftFilter)};

$('special-draw').onclick=()=>drawSpecial();for(const key of Object.keys(SPECIAL_PASSIVES))$('special-'+key).onclick=()=>{if(!s.specialPassives[key])return;s.specialActive=s.specialActive===key?null:key;save();render();renderLoot()};

function paintItemIcon(el,item){el.replaceChildren();const art=itemArt(item);if(!art){el.textContent=item.icon;return}const frame=createAtlasArt(art,'premium-item-art '+item.rarity);frame.children[0].onerror=()=>{el.textContent=item.icon};el.append(frame)}
function itemDropChance(key,p,isBoss,tier='normal'){const base=isBoss?bossDropChance(p,tier):lootChance(p);return key==='jadeorb'?Math.min(.25,base):ITEMS[key]?.blueprint?Math.min(.25,base):base}
function bossSprite(id){return id===0?'moss-turtle-sprite.webp':id===3?'owl-sprite.webp':id===4?'hedgehog-sprite.webp':'forest-golem-sprite.webp'}

function loadFieldNotes(){
 let raw={};try{raw=JSON.parse(readSaveRaw())||{}}catch{}
 s.fieldNotes={target:typeof raw.fieldNotes?.target==='string'?raw.fieldNotes.target:null,finds:Array.isArray(raw.fieldNotes?.finds)?raw.fieldNotes.finds.filter(x=>x&&typeof x.key==='string'&&Number.isFinite(x.at)&&typeof x.source==='string').slice(0,12):[],bosses:{}};
 for(const [key,r] of Object.entries(raw.fieldNotes?.bosses||{})){if(!/^\d+_(normal|elite|mystic)$/.test(key)||!r)continue;s.fieldNotes.bosses[key]={wins:Math.max(0,Math.floor(Number(r.wins)||0)),best:Number.isFinite(r.best)&&r.best>=0?r.best:null}}
}
function itemSources(key){
 const rows=[];for(const [id,m] of Object.entries(MOBS)){const entry=m.drops.find(x=>x[0]===key);if(entry)rows.push({id,name:m.name,chance:itemDropChance(key,entry[1],false),boss:false})}
 BOSSES.forEach((b,id)=>{const entry=BOSS_TABLES[id].find(x=>x[0]===key);const choice=BOSS_GEAR_POOLS[id].includes(key)?1/BOSS_GEAR_POOLS[id].length:0;if(entry||choice)rows.push({id:'boss'+id,name:b.name,chance:1-(1-(entry?itemDropChance(key,entry[1],true,'normal'):0))*(1-choice),boss:true})});return rows;
}
function sourceText(key){const rows=itemSources(key);if(rows.length)return rows.map(x=>x.name+' '+pct(x.chance)).join(' · ');if(key.startsWith('stone_'))return RARITIES[key.slice(6)]+' 장비 분해';if(key==='seal')return '반복 조사 의뢰 / 돌의 정원 탐사';if(RECIPES[key])return '장비 제작';return '탐사·수집·원정 보상'}
function pinRecipe(key){if(!Object.hasOwn(RECIPES,key))return false;s.fieldNotes.target=s.fieldNotes.target===key?null:key;save();renderFieldNotes();notify(s.fieldNotes.target?'제작 목표 고정 · '+ITEMS[key].name:'제작 목표 해제');return true}
function recordFind(key,count,source,fresh){
 const item=ITEMS[key];if(!item||(!fresh&&!item.slot))return;if(!fresh&&!['legendary','mythic'].includes(item.rarity))return;
 s.fieldNotes.finds.unshift({key,count,source,at:Date.now(),fresh:!!fresh});s.fieldNotes.finds=s.fieldNotes.finds.slice(0,12);
 if(fresh&&item.blueprint&&!s.fieldNotes.target)s.fieldNotes.target=item.blueprint;
}
function renderFieldNotes(){
 const signatureState=JSON.stringify([s.fieldNotes,s.inventory,selectedItem,Math.floor(s.gold),luck(),s.discovered]);if(signatureState===fieldNoteSignature)return;fieldNoteSignature=signatureState;
 const target=Object.hasOwn(RECIPES,s.fieldNotes.target)?s.fieldNotes.target:null;const sources=$('item-source');sources.textContent=selectedItem?'획득처 · '+sourceText(selectedItem):'';
 $('item-blueprint-open').hidden=!ITEMS[selectedItem]?.blueprint;
 $('pinned-target-name').textContent=target?'제작 목표 · '+ITEMS[target].name:'나의 다음 보물';
 $('pinned-target-body').textContent=target?(!ITEMS['bp_'+target]||known('bp_'+target)?Object.entries(RECIPES[target]).map(([k,n])=>requirementText(ITEMS[k].name,s.inventory[k]||0,n)).join(' · ')+' · 골드 '+fmt(s.gold)+'/'+fmt(CRAFT_GOLD[target]):'설계도 미획득 · '+sourceText('bp_'+target)):'제작창에서 목표를 고정하면 필요한 재료와 진행도를 이곳에서 볼 수 있어요.';
 $('pinned-target-status').textContent=target?(canCraft(target)?'✦ 모든 준비 완료 · 제작 가능':'사냥·원정·분해로 재료를 모으세요'):'선택은 자유 · 자동 사냥은 계속됩니다';const needs=craftNeeds(target);$('pinned-target-sources').hidden=!target||!needs.length;$('pinned-target-needs').replaceChildren();for(const need of needs){const row=document.createElement('li');row.textContent=need.name+' '+fmt(need.missing)+'개 부족 · '+need.source;$('pinned-target-needs').append(row)}
 for(const key of Object.keys(RECIPES)){$('pin-'+key).textContent=target===key?'◆ 추적 중':'◇ 목표';$('pin-'+key).setAttribute('aria-pressed',String(target===key))}
 const signature=JSON.stringify(s.fieldNotes.finds);if(signature===findJournalSignature)return;findJournalSignature=signature;
 const list=$('find-journal');list.replaceChildren();for(const row of s.fieldNotes.finds){const item=ITEMS[row.key];if(!item)continue;const line=document.createElement('div');line.className='find-row '+item.rarity;const icon=document.createElement('span');paintItemIcon(icon,item);const text=document.createElement('span');const name=document.createElement('strong');name.textContent=(row.fresh?'NEW · ':'')+item.name;const sub=document.createElement('small');sub.textContent=row.source+' · '+new Date(row.at).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});text.append(name,sub);line.append(icon,text);list.append(line)}
 if(!list.children.length){const empty=document.createElement('p');empty.textContent='첫 발견과 전설·신화 장비 획득이 이곳에 기록됩니다.';list.append(empty)}
}
function discoveryAttack(){return Object.entries(ITEMS).reduce((sum,[key,item])=>sum+(known(key)?item.discoveryBonus??.01:0),0)}
function bossTrophyBonus(){return s.bossWins.reduce((n,w,i)=>n+(w>0?(i<3?.03:.01):0),0)}

for(const key of Object.keys(RECIPES))$('pin-'+key).onclick=()=>pinRecipe(key);$('pinned-target-open').onclick=()=>showView('inventory');$('item-blueprint-open').onclick=()=>{const key=ITEMS[selectedItem]?.blueprint;if(key){setCraftFilter(ITEMS[key].slot==='chest'||ITEMS[key].slot==='legs'?'armor':ITEMS[key].slot);pinRecipe(key)}};

function pickPassive(pool,rng=Math.random){const roll=Math.min(9999,Math.max(0,Math.floor(rng()*10000)));let sum=0;for(const [key,p] of Object.entries(pool)){sum+=Math.round(p.weight*100);if(roll<sum)return key}return Object.keys(pool).at(-1)}

// Save management is additive; no automated reset or destructive recovery.
let pendingSaveImport=null;
function renderSaveStatus(){
 const blocked=persistence.status!=='ready';
 $('save-warning').hidden=!blocked&&!(!storageOK);
 $('save-warning').textContent=persistence.status==='protected'?'기존 기록을 읽을 수 없어 원본을 보존했습니다. 내보내기로 보관 후 정상 백업을 가져오세요. 현재 플레이는 임시 진행입니다.':persistence.status==='conflict'?'다른 탭에서 진행이 저장되어 이 탭을 멈췄습니다. 새로고침 후 이어가세요.':blocked||!storageOK?'저장 불가 · 현재 진행을 내보내기로 보관하세요.':'';
 if(blocked){$('save-status').textContent=persistence.status==='conflict'?'탭 충돌 · 일시 정지':'원본 보존 · 임시 진행';$('saved-time').textContent='기존 저장 기록은 덮어쓰지 않습니다.';}
 try{$('save-backup').hidden=!persistence.backup()}catch{$('save-backup').hidden=true}
}
function saveExportText(){
 if(persistence.status==='protected'||persistence.status==='conflict')return persistence.original()||JSON.stringify(s);
 save();return persistence.original()||JSON.stringify(s);
}
function downloadSave(raw,name){const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('save-export').onclick=()=>downloadSave(saveExportText(),'mosslight-save-'+Date.now()+'.json');
$('save-backup').onclick=()=>{try{const raw=persistence.backup();if(raw)downloadSave(raw,'mosslight-before-import.json')}catch{notify('백업을 읽을 수 없습니다.')}};
$('save-import').onclick=()=>{$('save-file').value='';$('save-file').click()};
$('save-file').onchange=async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{if(file.size>10*1024*1024)throw Error('저장 파일은 10MB 이하여야 합니다.');const raw=await file.text(),data=MosslightSaves.validate(raw);
  if((data.gear||[]).some(g=>!Object.hasOwn(ITEMS,g.key)||!ITEMS[g.key].slot))throw Error('알 수 없는 장비가 포함되어 있습니다.');
  pendingSaveImport=raw;$('save-import-summary').textContent='STAGE '+(data.stage||1)+' · 골드 '+fmt(data.gold||0)+' · 장비 '+(data.gear?.length||0)+'개. 확인하면 현재 진행이 이 기록으로 교체됩니다.';$('save-import-dialog').showModal();
 }catch(e){pendingSaveImport=null;notify('가져오기 실패 · '+e.message)}
};
$('save-import-confirm').onclick=()=>{if(!pendingSaveImport)return;try{saveImportReloading=true;persistence.replace(pendingSaveImport);pendingSaveImport=null;window.location.reload()}catch(e){saveImportReloading=false;notify('원본 유지 · '+e.message)}};
$('save-import-cancel').onclick=()=>{pendingSaveImport=null;$('save-import-dialog').close()};
$('save-import-dialog').addEventListener('cancel',()=>{pendingSaveImport=null});
window.addEventListener('storage',event=>{if(event.key===KEY&&persistence.status==='ready'&&!persistence.check()){s.paused=true;renderSaveStatus();render()}});
renderSaveStatus();

function canMutate(){return !saveImportReloading&&persistence.status!=='conflict'&&(persistence.status!=='ready'||persistence.check());}
document.addEventListener('click',event=>{if(!canMutate()&&!['save-export','save-backup'].includes(event.target.closest?.('button')?.id)){event.preventDefault();event.stopImmediatePropagation();renderSaveStatus();}},true);

function loadGrowthProtection(){
 let raw={};try{raw=JSON.parse(readSaveRaw())||{}}catch{}
 s.loadoutRole=Object.hasOwn(LOADOUT_ROLES,raw.loadoutRole)?raw.loadoutRole:'balanced';s.autoSafety=raw.autoSafety!==false;s.safetyDefeats=Number.isInteger(raw.safetyDefeats)?Math.max(0,Math.min(3,raw.safetyDefeats)):0;
 s.blueprintMisses={};for(const table of BOSS_TABLES)for(const [key] of table)if(ITEMS[key].blueprint)s.blueprintMisses[key]=Number.isInteger(raw.blueprintMisses?.[key])?Math.max(0,Math.min(59,raw.blueprintMisses[key])):0;
}
function blueprintProgressText(id){const key=BOSS_TABLES[id].find(([k])=>ITEMS[k].blueprint)?.[0];return !key?'':known(key)?'✓ 전용 설계도 영구 해금 완료':'보스 연구 · '+(s.blueprintMisses[key]||0)+'/60회 미획득 · 앞으로 최대 '+(60-(s.blueprintMisses[key]||0))+'회 격파 내 전용 설계도 확정 (변이 포함 · 업데이트 이후 기록)';}
$('auto-safety').onclick=()=>{s.autoSafety=!s.autoSafety;s.safetyDefeats=0;save();render()};

function toggleGearLock(id){if(!canMutate())return false;const g=s.gear.find(x=>x.id===id);if(!g)return false;g.locked=!g.locked;save();renderEquipment();notify(g.locked?'장비 잠금 · 단일/일괄 분해에서 보호됩니다.':'장비 잠금 해제');return true;}

// One 10000-slot draw reproduces the old independent 65% / (35%*80%) / (35%*20%) probabilities.
function rollTrailRelic(rng=Math.random){const roll=Math.min(9999,Math.max(0,Math.floor(rng()*10000)));return roll<6500?0:roll<9300?1:2;}

$('quick-boss-normal').onclick=()=>{if(quickBossId!==null)startBoss(quickBossId,Math.random,true)};

function craftNeeds(key){
 if(!Object.hasOwn(RECIPES,key))return [];
 const rows=[],blueprint='bp_'+key;
 if(Object.hasOwn(ITEMS,blueprint)&&!known(blueprint))rows.push({key:blueprint,name:ITEMS[blueprint].name,missing:1,source:sourceText(blueprint)});
 for(const [material,count] of Object.entries(RECIPES[key])){const missing=Math.max(0,count-(s.inventory[material]||0));if(missing)rows.push({key:material,name:ITEMS[material].name,missing,source:sourceText(material)});}
 if(s.gold<CRAFT_GOLD[key])rows.push({key:'gold',name:'골드',missing:Math.ceil(CRAFT_GOLD[key]-s.gold),source:'일반 사냥 · 생존 가능한 오프라인 사냥 · 보스 원정'});
 return rows;
}

for(const role of Object.keys(LOADOUT_ROLES))$('loadout-'+role).onclick=()=>setLoadoutRole(role);
$('gear-page-prev').onclick=()=>changeGearPage(-1);$('gear-page-next').onclick=()=>changeGearPage(1);

$('boss-preparation-equip').onclick=()=>{$('quick-boss-dialog').close();setLoadoutRole('boss');showView('equipment')};

// Clear cosmetic work when hidden or when OS motion preferences change.
window.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>{clearCombatEffects();renderEncounter()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearCombatEffects()});

// Static crafting mounts use the same illustrations as the saved inventory.
for(const key of Object.keys(RECIPES))paintItemIcon($('recipe-info-'+key).querySelector('span'),ITEMS[key]);
paintAtlas($('painted-dock'),$('dock-portrait'),creatureArt('boss0'),BOSSES[0].name);

// Explicit reset replaces only this game's save and keeps the prior record as a backup.
function resetProgress(){if($('reset-input').value!=='초기화')return false;try{saveImportReloading=true;persistence.replace(JSON.stringify(fresh()));window.location.reload();return true}catch(e){saveImportReloading=false;$('reset-error').textContent='초기화하지 않았습니다 · '+e.message;return false}}
$('save-reset').onclick=()=>{$('reset-input').value='';$('reset-confirm').disabled=true;$('reset-error').textContent='';$('reset-dialog').showModal()};
$('reset-input').oninput=()=>{$('reset-confirm').disabled=$('reset-input').value!=='초기화'};
$('reset-confirm').onclick=resetProgress;$('reset-cancel').onclick=()=>$('reset-dialog').close();
$('trail-shortcut').onclick=()=>{document.querySelector('.trail-details').open=true;document.querySelector('.expedition-strip').scrollIntoView({behavior:'smooth',block:'center'})};
