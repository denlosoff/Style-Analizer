import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { SpaceData, Style, Axis, ProjectionMode } from '../types';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';

interface VisualizationProps {
    spaceData: SpaceData;
    projectionMode: ProjectionMode;
    activeAxisIds: string[];
    isClusteringEnabled: boolean;
    clusterAssignments: number[] | null;
    clusterNames: Record<number, string>;
    projectionData: number[][] | null;
    isCalculatingProjection: boolean;
    projectionError: string | null;
    selectedStyleId: string | null;
    dimension: 1 | 2 | 3;
    onPointClick: (styleId: string) => void;
    onPointDoubleClick: (styleId:string) => void;
    filteredStyleIds: string[];
}

const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/fallback/50/50';
const MIDPOINT_SCORE = (AXIS_SCORE_MAX + AXIS_SCORE_MIN) / 2;


const Visualization: React.FC<VisualizationProps> = ({
    spaceData,
    projectionMode,
    activeAxisIds,
    isClusteringEnabled,
    clusterAssignments,
    clusterNames,
    projectionData,
    isCalculatingProjection,
    projectionError,
    selectedStyleId,
    dimension,
    onPointClick,
    onPointDoubleClick,
    filteredStyleIds,
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [rotation, setRotation] = useState({ x: 20, y: -30 });

    const clusterColors = d3.scaleOrdinal(d3.schemeCategory10);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;
        
        const { width, height } = containerRef.current.getBoundingClientRect();
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        svg.selectAll('*').remove(); // Clear previous render

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const renderMessage = (message: string) => {
             g.append('text')
                .attr('x', innerWidth / 2)
                .attr('y', innerHeight / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .text(message);
        }

        if (isCalculatingProjection) {
            renderMessage(`Calculating ${projectionMode.toUpperCase()} projection...`);
            return;
        }
        if (projectionError) {
            renderMessage(projectionError);
            return;
        }
        
        // Manual Mode Rendering
        if (projectionMode === 'manual') {
            if (activeAxisIds.length === 0 || !activeAxisIds[0]) {
                 renderMessage('Select an axis to begin visualization.');
                return;
            }
            if (dimension >= 2 && !activeAxisIds[1]) {
                renderMessage('Select a Y axis for 2D visualization.');
                return;
            }
            if (dimension >= 3 && !activeAxisIds[2]) {
                renderMessage('Select a Z axis for 3D visualization.');
                return;
            }
        }
        
        // Projection Mode Prereq Check
        if (projectionMode !== 'manual' && !projectionData) {
            renderMessage(`Select source axes for ${projectionMode.toUpperCase()} projection.`);
            return;
        }

        if (dimension < 3) {
            let allPointsData, xScale, yScale, xAxisLabel, yAxisLabel;
            
            if (projectionMode === 'manual') {
                const activeAxes = activeAxisIds.map(id => spaceData.axes.find(a => a.id === id)).filter((a): a is Axis => !!a);
                xAxisLabel = activeAxes[0]?.name || '';
                yAxisLabel = activeAxes[1]?.name || '';

                xScale = d3.scaleLinear().domain([AXIS_SCORE_MIN - 0.5, AXIS_SCORE_MAX + 0.5]).range([0, innerWidth]);
                yScale = dimension === 2
                    ? d3.scaleLinear().domain([AXIS_SCORE_MIN - 0.5, AXIS_SCORE_MAX + 0.5]).range([innerHeight, 0])
                    : d3.scaleLinear().domain([-1, 1]).range([innerHeight / 2, innerHeight / 2]);

                allPointsData = spaceData.styles.map(style => ({
                    id: style.id, name: style.name,
                    x: style.scores[activeAxisIds[0]!] ?? MIDPOINT_SCORE,
                    y: dimension === 2 ? (style.scores[activeAxisIds[1]!] ?? MIDPOINT_SCORE) : 0,
                    isScored: style.scores[activeAxisIds[0]!] !== undefined && (dimension === 1 || style.scores[activeAxisIds[1]!] !== undefined),
                    coverImageUrl: style.images[style.coverImageIndex ?? 0] || FALLBACK_IMAGE_URL,
                }));
            } else { // UMAP or PCA 1D/2D
                xAxisLabel = `${projectionMode.toUpperCase()} 1`;
                yAxisLabel = `${projectionMode.toUpperCase()} 2`;
                
                allPointsData = spaceData.styles.map((style, i) => ({
                    id: style.id, name: style.name,
                    x: projectionData![i][0],
                    y: dimension === 2 ? projectionData![i][1] : 0,
                    isScored: true, // always scored for projection
                    coverImageUrl: style.images[style.coverImageIndex ?? 0] || FALLBACK_IMAGE_URL,
                }));
                
                const xExtent = d3.extent(allPointsData, d => d.x) as [number, number];
                const yExtent = dimension === 2 ? d3.extent(allPointsData, d => d.y) as [number, number] : [-1, 1];
                
                xScale = d3.scaleLinear().domain([xExtent[0] - (xExtent[1]-xExtent[0])*0.1, xExtent[1] + (xExtent[1]-xExtent[0])*0.1]).range([0, innerWidth]);
                yScale = dimension === 2 
                    ? d3.scaleLinear().domain([yExtent[0] - (yExtent[1]-yExtent[0])*0.1, yExtent[1] + (yExtent[1]-yExtent[0])*0.1]).range([innerHeight, 0])
                    : d3.scaleLinear().domain([-1, 1]).range([innerHeight / 2, innerHeight / 2]);
            }
            
            const visiblePointsData = allPointsData.filter(p => filteredStyleIds.includes(p.id));

            const xAxis = d3.axisBottom(xScale);
            g.append('g')
                .attr('transform', `translate(0, ${dimension === 2 ? innerHeight : innerHeight / 2})`)
                .call(xAxis)
                .selectAll('text').attr('fill', 'white');
            g.selectAll('.domain, .tick line').attr('stroke', 'gray');
            g.append('text').attr('x', innerWidth / 2).attr('y', innerHeight + 40).attr('text-anchor', 'middle').attr('fill', 'white').text(xAxisLabel);

            if (dimension === 2) {
                const yAxis = d3.axisLeft(yScale);
                g.append('g').call(yAxis).selectAll('text').attr('fill', 'white');
                g.selectAll('.domain, .tick line').attr('stroke', 'gray');
                g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerHeight / 2).attr('y', -40).attr('text-anchor', 'middle').attr('fill', 'white').text(yAxisLabel);
            }

            const pointSize = (id: string) => selectedStyleId === id ? 40 : 30;
            const halfPointSize = (id: string) => pointSize(id) / 2;

            g.append('defs').append('clipPath').attr('id', 'point-clip')
                .append('circle').attr('cx', 15).attr('cy', 15).attr('r', 15);

            const groups = g.selectAll('g.point').data(visiblePointsData, (d: any) => d.id).join('g')
                .attr('class', 'point')
                .attr('transform', d => `translate(${xScale(d.x) - halfPointSize(d.id)}, ${yScale(d.y) - halfPointSize(d.id)})`)
                .style('cursor', 'pointer')
                .style('opacity', d => d.isScored ? 1 : 0.4)
                .on('click', (e, d) => onPointClick(d.id))
                .on('dblclick', (e, d) => onPointDoubleClick(d.id));
            
            groups.append('circle')
                .attr('cx', d => halfPointSize(d.id))
                .attr('cy', d => halfPointSize(d.id))
                .attr('r', d => halfPointSize(d.id) + 5)
                .attr('fill', 'none')
                .attr('stroke', d => {
                    if (!clusterAssignments) return 'transparent';
                    const originalIndex = spaceData.styles.findIndex(s => s.id === d.id);
                    if (originalIndex === -1) return 'transparent';
                    return clusterColors(clusterAssignments[originalIndex].toString());
                })
                .attr('stroke-width', 3);

            groups.append('image').attr('href', d => d.coverImageUrl).attr('width', d => pointSize(d.id)).attr('height', d => pointSize(d.id))
                .attr('clip-path', 'url(#point-clip)').attr('transform', d => `scale(${pointSize(d.id)/30})`);
            
            groups.append('circle').attr('cx', d => halfPointSize(d.id)).attr('cy', d => halfPointSize(d.id)).attr('r', d => halfPointSize(d.id) + 2)
                .attr('fill', 'none').attr('stroke', d => selectedStyleId === d.id ? 'white' : 'transparent').attr('stroke-width', 3);
            
            g.selectAll('text.label').data(visiblePointsData, (d: any) => d.id).join('text')
                .attr('class', 'label').attr('x', d => xScale(d.x)).attr('y', d => yScale(d.y) - halfPointSize(d.id) - 8)
                .attr('text-anchor', 'middle').attr('fill', 'white').style('font-size', '12px')
                .style('pointer-events', 'none').text(d => d.name);

        } else { // 3D LOGIC
            // ... (3D projection logic identical for both modes, just data source changes) ...
            type PointElementData = { id: string; name: string; type: 'point'; coverImageUrl: string; isScored: boolean; data: { x: number; y: number; z: number; }; };
            type AxisElementData = { id: string; type: 'axis'; label: string | undefined; start: { x: number; y: number; z: number; }; end: { x: number; y: number; z: number; }; color: string; };
            type ProjectedPoint = PointElementData & { x: number; y: number; z: number; };
            type ProjectedAxis = AxisElementData & { x1: number; y1: number; z1: number; x2: number; y2: number; z2: number; z: number; };
            type ProjectedElement = ProjectedPoint | ProjectedAxis;

            const scale3D = Math.min(innerWidth, innerHeight) / 2.5;
            const center = { x: innerWidth / 2, y: innerHeight / 2 };
            
            let axesData: AxisElementData[];
            let allPointsData: PointElementData[];

            if (projectionMode === 'manual') {
                const normalizeScore = (score: number | undefined) => {
                    const s = score === undefined ? MIDPOINT_SCORE : score;
                    return ((s - AXIS_SCORE_MIN) / (AXIS_SCORE_MAX - AXIS_SCORE_MIN) - 0.5) * 2;
                };
                 allPointsData = spaceData.styles.map(style => ({
                    id: style.id, name: style.name, type: 'point',
                    coverImageUrl: style.images[style.coverImageIndex ?? 0] || FALLBACK_IMAGE_URL,
                    isScored: activeAxisIds.every(id => id && style.scores[id] !== undefined),
                    data: { 
                        x: normalizeScore(style.scores[activeAxisIds[0]!]),
                        y: normalizeScore(style.scores[activeAxisIds[1]!]),
                        z: normalizeScore(style.scores[activeAxisIds[2]!]),
                    }
                }));
                 axesData = [
                    { id: 'x-axis', type: 'axis', label: spaceData.axes.find(a => a.id === activeAxisIds[0])?.name, start: {x: -1, y: 0, z: 0}, end: {x: 1, y: 0, z: 0}, color: '#FF7777' },
                    { id: 'y-axis', type: 'axis', label: spaceData.axes.find(a => a.id === activeAxisIds[1])?.name, start: {x: 0, y: -1, z: 0}, end: {x: 0, y: 1, z: 0}, color: '#77FF77' },
                    { id: 'z-axis', type: 'axis', label: spaceData.axes.find(a => a.id === activeAxisIds[2])?.name, start: {x: 0, y: 0, z: -1}, end: {x: 0, y: 0, z: 1}, color: '#7777FF' },
                ];
            } else { // UMAP or PCA 3D
                const extents = [
                    d3.extent(projectionData!, d => d[0]),
                    d3.extent(projectionData!, d => d[1]),
                    d3.extent(projectionData!, d => d[2]),
                ];
                const scales = extents.map(e => d3.scaleLinear().domain(e!).range([-1, 1]));
                allPointsData = spaceData.styles.map((style, i) => ({
                     id: style.id, name: style.name, type: 'point',
                    coverImageUrl: style.images[style.coverImageIndex ?? 0] || FALLBACK_IMAGE_URL,
                    isScored: true,
                    data: { x: scales[0](projectionData![i][0]), y: scales[1](projectionData![i][1]), z: scales[2](projectionData![i][2]) }
                }));
                axesData = [
                    { id: 'x-axis', type: 'axis', label: `${projectionMode.toUpperCase()} 1`, start: {x: -1, y: 0, z: 0}, end: {x: 1, y: 0, z: 0}, color: '#FF7777' },
                    { id: 'y-axis', type: 'axis', label: `${projectionMode.toUpperCase()} 2`, start: {x: 0, y: -1, z: 0}, end: {x: 0, y: 1, z: 0}, color: '#77FF77' },
                    { id: 'z-axis', type: 'axis', label: `${projectionMode.toUpperCase()} 3`, start: {x: 0, y: 0, z: -1}, end: {x: 0, y: 0, z: 1}, color: '#7777FF' },
                ];
            }
            const visiblePointsData = allPointsData.filter(p => filteredStyleIds.includes(p.id));

            const sinX = Math.sin(rotation.x * Math.PI / 180), cosX = Math.cos(rotation.x * Math.PI / 180);
            const sinY = Math.sin(rotation.y * Math.PI / 180), cosY = Math.cos(rotation.y * Math.PI / 180);

            const project = (p: {x: number, y: number, z: number}) => {
                let y1 = p.y * cosX - p.z * sinX, z1 = p.y * sinX + p.z * cosX;
                let x2 = p.x * cosY + z1 * sinY, z2 = -p.x * sinY + z1 * cosY;
                return { x: x2 * scale3D + center.x, y: y1 * scale3D + center.y, z: z2 };
            };
            
            const elements: ProjectedElement[] = ([...visiblePointsData, ...axesData] as (PointElementData | AxisElementData)[]).map(el => {
                if (el.type === 'point') return { ...el, ...project(el.data) };
                const pStart = project(el.start), pEnd = project(el.end);
                return { ...el, x1: pStart.x, y1: pStart.y, z1: pStart.z, x2: pEnd.x, y2: pEnd.y, z2: pEnd.z, z: (pStart.z + pEnd.z) / 2 };
            }).sort((a, b) => a.z - b.z);

            svg.append('defs').append('clipPath').attr('id', 'point-clip-3d').append('circle').attr('cx', 0).attr('cy', 0).attr('r', 15);
            const selection = g.selectAll('g.element').data(elements, (d: ProjectedElement) => d.id);
            selection.exit().remove();
            const enter = selection.enter().append('g').attr('class', 'element');
            const axisGroups = enter.filter((d): d is ProjectedAxis => d.type === 'axis');
            axisGroups.append('line').attr('stroke-width', 2);
            axisGroups.append('text').attr('text-anchor', 'middle').style('font-size', '14px');
            const pointGroups = enter.filter((d): d is ProjectedPoint => d.type === 'point')
                .style('cursor', 'pointer').on('click', (e, d) => onPointClick(d.id)).on('dblclick', (e, d) => onPointDoubleClick(d.id));
            
            pointGroups.append('circle').attr('class', 'cluster-ring').attr('fill', 'none');
            pointGroups.append('image').attr('clip-path', 'url(#point-clip-3d)');
            pointGroups.append('circle').attr('class', 'selection-ring').attr('fill', 'none');
            pointGroups.append('text').attr('class', 'label').attr('text-anchor', 'middle').attr('fill', 'white').style('pointer-events', 'none');
            const merged = selection.merge(enter);
            const mergedAxes = merged.filter((d): d is ProjectedAxis => d.type === 'axis') as d3.Selection<SVGGElement, ProjectedAxis, SVGGElement, unknown>;
            const mergedPoints = merged.filter((d): d is ProjectedPoint => d.type === 'point') as d3.Selection<SVGGElement, ProjectedPoint, SVGGElement, unknown>;
            mergedAxes.select<SVGLineElement>('line').attr('x1', d => d.x1).attr('y1', d => d.y1).attr('x2', d => d.x2).attr('y2', d => d.y2)
                .attr('stroke', d => d.color).attr('stroke-opacity', d => 0.5 + (d.z + 1) / 2 * 0.5);
            mergedAxes.select<SVGTextElement>('text').attr('x', d => d.x2).attr('y', d => d.y2 - 10).attr('fill', d => d.color).text(d => d.label);
            const pointSize = (d: ProjectedPoint) => (selectedStyleId === d.id ? 20 : 15) * (0.6 + (d.z + 1) / 2 * 0.6);
            mergedPoints.attr('transform', d => `translate(${d.x}, ${d.y})`).attr('opacity', d => (d.isScored ? 0.7 : 0.35) + (d.z + 1) / 2 * 0.3);
            
            mergedPoints.select<SVGCircleElement>('circle.cluster-ring')
                .attr('r', d => pointSize(d) + 5)
                .attr('stroke-width', 3)
                .attr('stroke', d => {
                    if (!clusterAssignments) return 'transparent';
                    const originalIndex = spaceData.styles.findIndex(s => s.id === d.id);
                    if (originalIndex === -1) return 'transparent';
                    return clusterColors(clusterAssignments[originalIndex].toString());
                });

            mergedPoints.select<SVGImageElement>('image').attr('href', d => d.coverImageUrl).attr('x', d => -pointSize(d)).attr('y', d => -pointSize(d))
                .attr('width', d => pointSize(d) * 2).attr('height', d => pointSize(d) * 2);
            mergedPoints.select<SVGCircleElement>('circle.selection-ring').attr('r', d => pointSize(d) + 2).attr('stroke', d => selectedStyleId === d.id ? 'white' : 'transparent').attr('stroke-width', 3);
            mergedPoints.select<SVGTextElement>('text.label').attr('y', d => -pointSize(d) - 8).attr('font-size', d => 12 * (0.8 + (d.z + 1) / 2 * 0.4)).text(d => d.name);
            const drag = d3.drag().on('drag', (event) => setRotation(current => ({ y: current.y + event.dx * 0.5, x: current.x - event.dy * 0.5 })));
            svg.call(drag as any);
        }
    }, [spaceData, activeAxisIds, selectedStyleId, onPointClick, onPointDoubleClick, dimension, rotation, projectionMode, projectionData, isCalculatingProjection, projectionError, clusterAssignments, clusterColors, clusterNames, isClusteringEnabled, filteredStyleIds]);

    return (
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative">
            <svg ref={svgRef}></svg>
            {isClusteringEnabled && clusterAssignments && (
                <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-80 p-3 rounded-lg text-white text-sm max-w-xs pointer-events-auto">
                    <h4 className="font-bold mb-2">Cluster Legend</h4>
                    <ul className="space-y-1">
                        {Array.from<number>(new Set(clusterAssignments)).sort((a,b) => a - b).map(clusterId => (
                            <li key={clusterId} className="flex items-center">
                                <span 
                                    className="w-4 h-4 rounded-full mr-2 border border-white/50 flex-shrink-0"
                                    style={{ backgroundColor: clusterColors(clusterId.toString()) }}
                                ></span>
                                <span>{clusterNames[clusterId] || `Cluster ${clusterId + 1}`}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Visualization;
