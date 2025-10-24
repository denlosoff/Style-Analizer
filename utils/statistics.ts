
import type { Axis, Style } from '../types';

/**
 * Calculates the mean of an array of numbers.
 */
function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculates the Pearson correlation coefficient between two arrays of numbers.
 * It only considers pairs where both x and y values are defined.
 */
export function calculatePearsonCorrelation(x: (number | undefined)[], y: (number | undefined)[]): number | null {
    const validPairs = x
        .map((val, i) => [val, y[i]])
        .filter((pair): pair is [number, number] => pair[0] !== undefined && pair[1] !== undefined);

    if (validPairs.length < 2) {
        return null; // Not enough data to calculate correlation
    }

    const n = validPairs.length;
    const xData = validPairs.map(p => p[0]);
    const yData = validPairs.map(p => p[1]);

    const meanX = mean(xData);
    const meanY = mean(yData);

    let numerator = 0;
    let sumSqX = 0;
    let sumSqY = 0;

    for (let i = 0; i < n; i++) {
        const devX = xData[i] - meanX;
        const devY = yData[i] - meanY;
        numerator += devX * devY;
        sumSqX += devX ** 2;
        sumSqY += devY ** 2;
    }

    const denominator = Math.sqrt(sumSqX * sumSqY);

    if (denominator === 0) {
        return 0; // No variation in at least one of the variables
    }

    return numerator / denominator;
}

export type CorrelationMatrix = Record<string, Record<string, number | null>>;

/**
 * Calculates the correlation matrix for all pairs of axes based on style scores.
 */
export function calculateCorrelationMatrix(axes: Axis[], styles: Style[]): CorrelationMatrix {
    const matrix: CorrelationMatrix = {};

    const axisScores: Record<string, (number | undefined)[]> = {};
    axes.forEach(axis => {
        axisScores[axis.id] = styles.map(style => style.scores[axis.id]);
    });

    for (let i = 0; i < axes.length; i++) {
        const axis1 = axes[i];
        matrix[axis1.id] = {};
        for (let j = 0; j < axes.length; j++) {
            const axis2 = axes[j];
            if (i === j) {
                matrix[axis1.id][axis2.id] = 1.0;
            } else {
                 const correlation = calculatePearsonCorrelation(axisScores[axis1.id], axisScores[axis2.id]);
                 matrix[axis1.id][axis2.id] = correlation;
            }
        }
    }
    return matrix;
}
