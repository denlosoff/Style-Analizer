/**
 * @file Principal Component Analysis (PCA) implementation.
 * This utility provides a function to perform PCA on a given dataset.
 * It includes helpers for matrix operations, data standardization, and
 * eigenvalue decomposition via the Jacobi algorithm.
 */

// #region Matrix/Vector Helpers

/**
 * Calculates the mean of a 1D array of numbers.
 */
function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculates the standard deviation of a 1D array of numbers.
 */
function std(arr: number[], arrMean: number): number {
    const variance = arr.reduce((a, b) => a + (b - arrMean) ** 2, 0) / (arr.length -1);
    return Math.sqrt(variance);
}

/**
 * Standardizes a matrix by column (feature), subtracting the mean and dividing by the standard deviation.
 * @returns An object containing the standardized matrix, and the means and standard deviations for each column.
 */
function standardize(matrix: number[][]): { standardized: number[][], means: number[], stds: number[] } {
    const numCols = matrix[0].length;
    const means = Array(numCols).fill(0);
    const stds = Array(numCols).fill(0);

    for (let j = 0; j < numCols; j++) {
        const col = matrix.map(row => row[j]);
        const colMean = mean(col);
        const colStd = std(col, colMean);
        means[j] = colMean;
        stds[j] = colStd === 0 ? 1 : colStd; // Avoid division by zero for constant columns
    }

    const standardized = matrix.map(row => 
        row.map((val, j) => (val - means[j]) / stds[j])
    );

    return { standardized, means, stds };
}

/**
 * Transposes a 2D matrix.
 */
function transpose(matrix: number[][]): number[][] {
    if (!matrix.length || !matrix[0].length) return [];
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Calculates the dot product of two vectors.
 */
function dot(v1: number[], v2: number[]): number {
    return v1.reduce((sum, val, i) => sum + val * v2[i], 0);
}

/**
 * Multiplies two matrices.
 */
function multiplyMatrices(A: number[][], B: number[][]): number[][] {
    const result: number[][] = Array(A.length).fill(0).map(() => Array(B[0].length).fill(0));
    const B_T = transpose(B);

    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            result[i][j] = dot(A[i], B_T[j]);
        }
    }
    return result;
}

/**
 * Calculates the covariance matrix for a given data matrix.
 * Assumes the input matrix is already mean-centered.
 */
function covariance(matrix: number[][]): number[][] {
    const n = matrix.length; // number of samples
    const p = matrix[0].length; // number of features
    const covMatrix: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
    
    const matrixT = transpose(matrix);

    for (let i = 0; i < p; i++) {
        for (let j = i; j < p; j++) {
            const cov = dot(matrixT[i], matrixT[j]) / (n - 1);
            covMatrix[i][j] = cov;
            covMatrix[j][i] = cov;
        }
    }
    return covMatrix;
}

// #endregion

// #region Jacobi Eigenvalue Decomposition
// A robust algorithm for finding the eigenvalues and eigenvectors of a real symmetric matrix.
// Adapted from various public domain sources.

function jacobiEigenvalueDecomposition(matrix: number[][], maxIterations = 100, tolerance = 1e-10): { eigenvalues: number[], eigenvectors: number[][] } {
    const n = matrix.length;
    let A = matrix.map(row => [...row]); // Make a mutable copy
    // FIX: Explicitly type `V` as `number[][]`. Without this, TypeScript infers a too-narrow type `(1 | 0)[][]`
    // from the identity matrix initialization, causing type errors when updating it with float values.
    let V: number[][] = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((__, j) => (i === j ? 1 : 0))); // Identity matrix

    for (let iter = 0; iter < maxIterations; iter++) {
        let maxVal = 0;
        let p = 0, q = 1;

        // Find the largest off-diagonal element
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(A[i][j]) > maxVal) {
                    maxVal = Math.abs(A[i][j]);
                    p = i;
                    q = j;
                }
            }
        }

        if (maxVal < tolerance) {
            break; // Converged
        }

        // Perform Jacobi rotation
        const app = A[p][p];
        const aqq = A[q][q];
        const apq = A[p][q];
        
        const phi = 0.5 * Math.atan2(2 * apq, aqq - app);
        const c = Math.cos(phi);
        const s = Math.sin(phi);

        const App = c * c * app + s * s * aqq - 2 * s * c * apq;
        const Aqq = s * s * app + c * c * aqq + 2 * s * c * apq;
        const Apq = 0;

        A[p][p] = App;
        A[q][q] = Aqq;
        A[p][q] = Apq;
        A[q][p] = Apq;

        for (let k = 0; k < n; k++) {
            if (k !== p && k !== q) {
                const Akp = A[k][p];
                const Akq = A[k][q];
                A[k][p] = c * Akp - s * Akq;
                A[p][k] = A[k][p];
                A[k][q] = s * Akp + c * Akq;
                A[q][k] = A[k][q];
            }
        }

        // Update eigenvectors
        for (let k = 0; k < n; k++) {
            const Vkp = V[k][p];
            const Vkq = V[k][q];
            V[k][p] = c * Vkp - s * Vkq;
            V[k][q] = s * Vkp + c * Vkq;
        }
    }

    const eigenvalues = A.map((_, i) => A[i][i]);
    return { eigenvalues, eigenvectors: V };
}

// #endregion

/**
 * Performs Principal Component Analysis on a dataset.
 * @param dataMatrix A 2D array where rows are samples and columns are features.
 * @param nComponents The number of principal components to return.
 * @returns A 2D array of the data projected onto the principal components, or null on error.
 */
export function pca(dataMatrix: number[][], nComponents: number): number[][] | null {
    if (!dataMatrix || dataMatrix.length === 0 || dataMatrix[0].length === 0 || dataMatrix[0].length < nComponents) {
        return null;
    }

    // 1. Standardize the data matrix
    const { standardized } = standardize(dataMatrix);

    // 2. Calculate the covariance matrix
    const covMatrix = covariance(standardized);

    // 3. Calculate eigenvalues and eigenvectors
    const { eigenvalues, eigenvectors } = jacobiEigenvalueDecomposition(covMatrix);
    const eigenvectorsT = transpose(eigenvectors);

    // 4. Sort eigenvectors by descending eigenvalues
    const pairs = eigenvalues.map((val, i) => ({ eigenvalue: val, eigenvector: eigenvectorsT[i] }));
    pairs.sort((a, b) => b.eigenvalue - a.eigenvalue);

    // 5. Select the top `nComponents` eigenvectors
    const principalComponents = pairs.slice(0, nComponents).map(p => p.eigenvector);

    // 6. Project the original standardized data onto the principal components
    const principalComponentsMatrix = transpose(principalComponents);
    const projectedData = multiplyMatrices(standardized, principalComponentsMatrix);

    return projectedData;
}