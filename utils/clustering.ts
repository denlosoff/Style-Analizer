// Helper function to calculate Euclidean distance between two points
const distance = (p1: number[], p2: number[]): number => {
    return Math.sqrt(p1.reduce((sum, val, i) => sum + (val - p2[i])**2, 0));
};

export function kmeans(data: number[][], k: number, maxIterations = 100): { clusters: number[]; centroids: number[][]; inertia: number; } {
    if (k <= 0 || data.length < k) {
        return { clusters: Array(data.length).fill(0), centroids: [], inertia: 0 };
    }
    
    // Use only distinct data points for initial centroid selection to avoid issues
    const distinctData = Array.from(new Set(data.map(p => JSON.stringify(p)))).map(p => JSON.parse(p) as number[]);
    if (distinctData.length < k) {
        // Not enough unique points to form k clusters, return a single cluster
        return { clusters: Array(data.length).fill(0), centroids: [], inertia: 0 };
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

    let inertia = 0;
    data.forEach((point, i) => {
        const centroid = centroids[clusters[i]];
        if (centroid) {
            inertia += distance(point, centroid) ** 2;
        }
    });

    return { clusters, centroids, inertia };
}


/**
 * Finds the optimal number of clusters (k) using the Silhouette Score method.
 * This method measures how well-separated and compact the clusters are.
 * A higher silhouette score indicates better-defined clusters.
 */
export async function findOptimalK(data: number[][], minK: number, maxK: number): Promise<number> {
    if (data.length < 2) {
        return minK;
    }

    let bestK = minK;
    let maxSilhouette = -Infinity;

    for (let k = minK; k <= maxK; k++) {
        // Stop if k is greater than the number of available data points
        if (k > data.length) {
            break;
        }

        const { clusters } = kmeans(data, k);
        
        // Calculate average silhouette score for this k
        let totalSilhouette = 0;
        let validPoints = 0;

        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const clusterId = clusters[i];
            
            let a = 0; // Average distance to other points in the same cluster
            let sameClusterCount = 0;
            const otherClusterDistances: Record<number, { sum: number, count: number }> = {};

            for (let j = 0; j < data.length; j++) {
                if (i === j) continue;
                
                const otherPoint = data[j];
                const otherClusterId = clusters[j];
                const dist = distance(point, otherPoint);

                if (clusterId === otherClusterId) {
                    a += dist;
                    sameClusterCount++;
                } else {
                    if (!otherClusterDistances[otherClusterId]) {
                        otherClusterDistances[otherClusterId] = { sum: 0, count: 0 };
                    }
                    otherClusterDistances[otherClusterId].sum += dist;
                    otherClusterDistances[otherClusterId].count++;
                }
            }

            a = sameClusterCount > 0 ? a / sameClusterCount : 0;
            
            const avgOtherClusterDistances = Object.values(otherClusterDistances).map(v => v.sum / v.count);
            
            if (avgOtherClusterDistances.length === 0) {
                // This happens if all points are in one cluster. Silhouette is 0.
                continue;
            }

            const b = Math.min(...avgOtherClusterDistances);

            const silhouette = (b - a) / Math.max(a, b);
            
            if (!isNaN(silhouette)) {
                totalSilhouette += silhouette;
                validPoints++;
            }
        }
        
        const avgSilhouette = validPoints > 0 ? totalSilhouette / validPoints : 0;

        if (avgSilhouette > maxSilhouette) {
            maxSilhouette = avgSilhouette;
            bestK = k;
        }

        // Yield to the event loop to prevent freezing the UI
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return bestK;
}