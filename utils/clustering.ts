
export function kmeans(data: number[][], k: number, maxIterations = 100): { clusters: number[]; centroids: number[][] } {
    if (k <= 0 || data.length < k) {
        return { clusters: Array(data.length).fill(0), centroids: [] };
    }
    
    // Use only distinct data points for initial centroid selection to avoid issues
    const distinctData = Array.from(new Set(data.map(p => JSON.stringify(p)))).map(p => JSON.parse(p) as number[]);
    if (distinctData.length < k) {
        // Not enough unique points to form k clusters, return a single cluster
        return { clusters: Array(data.length).fill(0), centroids: [] };
    }

    // 1. Initialize centroids by randomly picking K distinct data points
    let centroids: number[][] = [];
    const usedIndices = new Set<number>();
    while (centroids.length < k) {
        const index = Math.floor(Math.random() * distinctData.length);
        if (!usedIndices.has(index)) {
            centroids.push([...distinctData[index]]);
            usedIndices.add(index);
        }
    }

    let clusters = new Array(data.length).fill(-1);
    let changed = true;

    const distance = (p1: number[], p2: number[]): number => {
        return Math.sqrt(p1.reduce((sum, val, i) => sum + (val - p2[i])**2, 0));
    };

    for (let iter = 0; iter < maxIterations && changed; iter++) {
        changed = false;
        
        // 2. Assign each point to the closest centroid
        data.forEach((point, i) => {
            let minDistance = Infinity;
            let closestCentroidIndex = -1;
            centroids.forEach((centroid, j) => {
                const d = distance(point, centroid);
                if (d < minDistance) {
                    minDistance = d;
                    closestCentroidIndex = j;
                }
            });
            if (clusters[i] !== closestCentroidIndex) {
                clusters[i] = closestCentroidIndex;
                changed = true;
            }
        });

        // 3. Recalculate centroids as the mean of all points in a cluster
        const newCentroids: number[][] = Array.from({ length: k }, () => new Array(data[0].length).fill(0));
        const counts: number[] = new Array(k).fill(0);

        data.forEach((point, i) => {
            const clusterIndex = clusters[i];
            point.forEach((val, dim) => {
                newCentroids[clusterIndex][dim] += val;
            });
            counts[clusterIndex]++;
        });

        newCentroids.forEach((centroid, i) => {
            if (counts[i] > 0) {
                centroids[i] = centroid.map(val => val / counts[i]);
            } else {
                // If a cluster becomes empty, re-initialize its centroid to a random distinct point
                // to prevent the number of clusters from decreasing.
                const newCentroidIndex = Math.floor(Math.random() * distinctData.length);
                centroids[i] = [...distinctData[newCentroidIndex]];
            }
        });
    }

    return { clusters, centroids };
}
