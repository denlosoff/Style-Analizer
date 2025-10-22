import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { SpaceData, Style, Axis } from '../types';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';

interface VisualizationProps {
    spaceData: SpaceData;
    activeAxisIds: string[];
    selectedStyleId: string | null;
    dimension: 1 | 2 | 3;
    onPointClick: (styleId: string) => void;
    onPointDoubleClick: (styleId:string) => void;
}

const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const FALLBACK_IMAGE_URL = 'https://picsum.photos/seed/fallback/50/50';
const MIDPOINT_SCORE = (AXIS_SCORE_MAX + AXIS_SCORE_MIN) / 2;


const Visualization: React.FC<VisualizationProps> = ({
    spaceData,
    activeAxisIds,
    selectedStyleId,
    dimension,
    onPointClick,
    onPointDoubleClick,
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [rotation, setRotation] = useState({ x: 20, y: -30 });

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
        
        if (dimension < 3) {
            if (activeAxisIds.length === 0 || !activeAxisIds[0]) {
                 g.append('text')
                    .attr('x', innerWidth / 2)
                    .attr('y', innerHeight / 2)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white')
                    .text('Select an axis to begin visualization.');
                return;
            }

            const activeAxes = activeAxisIds.map(id => spaceData.axes.find(a => a.id === id)).filter((a): a is Axis => !!a);
            
            const xScale = d3.scaleLinear()
                .domain([AXIS_SCORE_MIN - 0.5, AXIS_SCORE_MAX + 0.5])
                .range([0, innerWidth]);

            const yScale = dimension === 2
                ? d3.scaleLinear().domain([AXIS_SCORE_MIN - 0.5, AXIS_SCORE_MAX + 0.5]).range([innerHeight, 0])
                : d3.scaleLinear().domain([-1, 1]).range([innerHeight / 2, innerHeight / 2]);

            const xAxis = d3.axisBottom(xScale);
            g.append('g')
                .attr('transform', `translate(0, ${dimension === 2 ? innerHeight : innerHeight / 2})`)
                .call(xAxis)
                .selectAll('text')
                .attr('fill', 'white');
            g.selectAll('.domain, .tick line').attr('stroke', 'gray');

            g.append('text')
                .attr('x', innerWidth / 2)
                .attr('y', innerHeight + 40)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .text(activeAxes[0]?.name || '');

            if (dimension === 2) {
                 if(!activeAxisIds[1]) {
                    g.append('text')
                        .attr('x', innerWidth / 2)
                        .attr('y', innerHeight / 2)
                        .attr('text-anchor', 'middle')
                        .attr('fill', 'white')
                        .text('Select a Y axis for 2D visualization.');
                    return;
                }
                const yAxis = d3.axisLeft(yScale);
                g.append('g').call(yAxis)
                .selectAll('text')
                .attr('fill', 'white');
                g.selectAll('.domain, .tick line').attr('stroke', 'gray');
                g.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -innerHeight / 2)
                    .attr('y', -40)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white')
                    .text(activeAxes[1]?.name || '');
            }

            const pointsData = spaceData.styles.map(style => {
                const hasX = activeAxisIds[0] ? style.scores[activeAxisIds[0]] !== undefined : false;
                const hasY = dimension === 1 || (activeAxisIds[1] ? style.scores[activeAxisIds[1]] !== undefined : false);
                return {
                    id: style.id,
                    name: style.name,
                    x: hasX ? style.scores[activeAxisIds[0]!] : MIDPOINT_SCORE,
                    y: dimension === 2 ? (hasY ? style.scores[activeAxisIds[1]!] : MIDPOINT_SCORE) : 0,
                    isScored: hasX && (dimension === 1 || hasY),
                    coverImageUrl: style.images[style.coverImageIndex ?? 0] || FALLBACK_IMAGE_URL,
                }
            });

            const pointSize = (id: string) => selectedStyleId === id ? 40 : 30;
            const halfPointSize = (id: string) => pointSize(id) / 2;

            g.append('defs').append('clipPath').attr('id', 'point-clip')
                .append('circle').attr('cx', 15).attr('cy', 15).attr('r', 15);

            const groups = g.selectAll('g.point')
                .data(pointsData, (d: any) => d.id)
                .join('g')
                .attr('class', 'point')
                .attr('transform', d => `translate(${xScale(d.x) - halfPointSize(d.id)}, ${yScale(d.y) - halfPointSize(d.id)})`)
                .style('cursor', 'pointer')
                .style('opacity', d => d.isScored ? 1 : 0.4)
                .on('click', (e, d) => onPointClick(d.id))
                .on('dblclick', (e, d) => onPointDoubleClick(d.id));

            groups.append('image')
                .attr('href', d => d.coverImageUrl)
                .attr('width', d => pointSize(d.id))
                .attr('height', d => pointSize(d.id))
                .attr('clip-path', 'url(#point-clip)')
                .attr('transform', d => `scale(${pointSize(d.id)/30})`);
            
            groups.append('circle')
                .attr('cx', d => halfPointSize(d.id))
                .attr('cy', d => halfPointSize(d.id))
                .attr('r', d => halfPointSize(d.id) + 2)
                .attr('fill', 'none')
                .attr('stroke', d => selectedStyleId === d.id ? 'white' : 'transparent')
                .attr('stroke-width', 3);
            
            g.selectAll('text.label')
                .data(pointsData, (d: any) => d.id)
                .join('text')
                .attr('class', 'label')
                .attr('x', d => xScale(d.x))
                .attr('y', d => yScale(d.y) - halfPointSize(d.id) - 8)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .text(d => d.name);

        } else { // 3D LOGIC
            // FIX: Define explicit types for 3D elements to help TypeScript with discriminated unions.
            type PointElementData = {
                id: string;
                name: string;
                type: 'point';
                coverImageUrl: string;
                isScored: boolean;
                data: { x: number | undefined; y: number | undefined; z: number | undefined; };
            };
            type AxisElementData = {
                id: string;
                type: 'axis';
                label: string | undefined;
                start: { x: number; y: number; z: number; };
                end: { x: number; y: number; z: number; };
                color: string;
            };

            type ProjectedPoint = PointElementData & { x: number; y: number; z: number; };
            type ProjectedAxis = AxisElementData & {
                x1: number; y1: number; z1: number;
                x2: number; y2: number; z2: number; z: number;
            };
            type ProjectedElement = ProjectedPoint | ProjectedAxis;

             if (activeAxisIds.filter(id => id).length < 3) {
                 g.append('text')
                    .attr('x', innerWidth / 2)
                    .attr('y', innerHeight / 2)
                    .attr('text-anchor', 'middle')
                    .attr('fill', 'white')
                    .text('Select 3 axes for 3D visualization.');
                return;
            }

            const scale3D = Math.min(innerWidth, innerHeight) / 2.5;
            const center = { x: innerWidth / 2, y: innerHeight / 2 };

            const normalizeScore = (score: number | undefined) => {
                const s = score === undefined ? MIDPOINT_SCORE : score;
                return ((s - AXIS_SCORE_MIN) / (AXIS_SCORE_MAX - AXIS_SCORE_MIN) - 0.5) * 2;
            };

            const sinX = Math.sin(rotation.x * Math.PI / 180);
            const cosX = Math.cos(rotation.x * Math.PI / 180);
            const sinY = Math.sin(rotation.y * Math.PI / 180);
            const cosY = Math.cos(rotation.y * Math.PI / 180);

            const project = (p: {x: number | undefined, y: number | undefined, z: number | undefined}) => {
                const normX = normalizeScore(p.x), normY = normalizeScore(p.y), normZ = normalizeScore(p.z);
                let y1 = normY * cosX - normZ * sinX;
                let z1 = normY * sinX + normZ * cosX;
                let x2 = normX * cosY + z1 * sinY;
                let z2 = -normX * sinY + z1 * cosY;
                return { x: x2 * scale3D + center.x, y: y1 * scale3D + center.y, z: z2 };
            };

            const midScore = (AXIS_SCORE_MAX + AXIS_SCORE_MIN) / 2;
            const axesData: AxisElementData[] = [
                { id: 'x-axis', type: 'axis', label: spaceData.axes.find(a => a.id === activeAxisIds[0])?.name, start: {x: AXIS_SCORE_MIN, y: midScore, z: midScore}, end: {x: AXIS_SCORE_MAX, y: midScore, z: midScore}, color: '#FF7777' },
                { id: 'y-axis', type: 'axis', label: spaceData.axes.find(a => a.id === activeAxisIds[1])?.name, start: {x: midScore, y: AXIS_SCORE_MIN, z: midScore}, end: {x: midScore, y: AXIS_SCORE_MAX, z: midScore}, color: '#77FF77' },
                { id: 'z-axis', type: 'axis', label: spaceData.axes.find(a => a.id === activeAxisIds[2])?.name, start: {x: midScore, y: midScore, z: AXIS_SCORE_MIN}, end: {x: midScore, y: midScore, z: AXIS_SCORE_MAX}, color: '#7777FF' },
            ];

            const pointsData: PointElementData[] = spaceData.styles
                .map(style => {
                    const isScored = activeAxisIds.every(id => id && style.scores[id] !== undefined);
                    return {
                        id: style.id, name: style.name, type: 'point',
                        coverImageUrl: style.images[style.coverImageIndex ?? 0] || FALLBACK_IMAGE_URL,
                        isScored: isScored,
                        data: { x: style.scores[activeAxisIds[0]!], y: style.scores[activeAxisIds[1]!], z: style.scores[activeAxisIds[2]!] }
                    }
                });
            
            const elements: ProjectedElement[] = ([...pointsData, ...axesData] as (PointElementData | AxisElementData)[]).map(el => {
                if (el.type === 'point') {
                    return { ...el, ...project(el.data) };
                } else {
                    const pStart = project(el.start);
                    const pEnd = project(el.end);
                    return { ...el, x1: pStart.x, y1: pStart.y, z1: pStart.z, x2: pEnd.x, y2: pEnd.y, z2: pEnd.z, z: (pStart.z + pEnd.z) / 2 };
                }
            });

            elements.sort((a, b) => a.z - b.z);

            svg.append('defs').append('clipPath').attr('id', 'point-clip-3d')
                .append('circle').attr('cx', 0).attr('cy', 0).attr('r', 15);

            const selection = g.selectAll('g.element').data(elements, (d: ProjectedElement) => d.id);
            selection.exit().remove();
            
            const enter = selection.enter().append('g').attr('class', 'element');
            
            // FIX: Use type guards in filters to properly type D3 selections.
            const axisGroups = enter.filter((d): d is ProjectedAxis => d.type === 'axis');
            axisGroups.append('line').attr('stroke-width', 2);
            axisGroups.append('text').attr('text-anchor', 'middle').style('font-size', '14px');
            
            const pointGroups = enter.filter((d): d is ProjectedPoint => d.type === 'point')
                .style('cursor', 'pointer')
                .on('click', (event, d) => onPointClick(d.id))
                .on('dblclick', (event, d) => onPointDoubleClick(d.id));

            pointGroups.append('image').attr('clip-path', 'url(#point-clip-3d)');
            pointGroups.append('circle').attr('fill', 'none');
            pointGroups.append('text').attr('class', 'label').attr('text-anchor', 'middle').attr('fill', 'white').style('pointer-events', 'none');

            const merged = selection.merge(enter);
            
            // FIX: Split merged selection into points and axes to handle different properties.
            const mergedAxes = merged.filter((d): d is ProjectedAxis => d.type === 'axis') as d3.Selection<SVGGElement, ProjectedAxis, SVGGElement, unknown>;
            const mergedPoints = merged.filter((d): d is ProjectedPoint => d.type === 'point') as d3.Selection<SVGGElement, ProjectedPoint, SVGGElement, unknown>;

            mergedAxes.select<SVGLineElement>('line')
                .attr('x1', d => d.x1).attr('y1', d => d.y1).attr('x2', d => d.x2).attr('y2', d => d.y2)
                .attr('stroke', d => d.color).attr('stroke-opacity', d => 0.5 + (d.z + 1) / 2 * 0.5);
            mergedAxes.select<SVGTextElement>('text')
                .attr('x', d => d.x2).attr('y', d => d.y2 - 10).attr('fill', d => d.color).text(d => d.label);

            const pointSize = (d: ProjectedPoint) => (selectedStyleId === d.id ? 20 : 15) * (0.6 + (d.z + 1) / 2 * 0.6);

            mergedPoints
                .attr('transform', d => `translate(${d.x}, ${d.y})`)
                .attr('opacity', d => (d.isScored ? 0.7 : 0.35) + (d.z + 1) / 2 * 0.3);

            mergedPoints.select<SVGImageElement>('image')
                .attr('href', d => d.coverImageUrl)
                .attr('x', d => -pointSize(d))
                .attr('y', d => -pointSize(d))
                .attr('width', d => pointSize(d) * 2)
                .attr('height', d => pointSize(d) * 2);
            
            mergedPoints.select<SVGCircleElement>('circle')
                .attr('r', d => pointSize(d) + 2)
                .attr('stroke', d => selectedStyleId === d.id ? 'white' : 'transparent')
                .attr('stroke-width', 3);

            mergedPoints.select<SVGTextElement>('text.label')
                .attr('y', d => -pointSize(d) - 8)
                .attr('font-size', d => 12 * (0.8 + (d.z + 1) / 2 * 0.4))
                .text(d => d.name);

            const drag = d3.drag().on('drag', (event) => {
                setRotation(current => ({ y: current.y + event.dx * 0.5, x: current.x - event.dy * 0.5 }));
            });
            svg.call(drag as any);
        }
    }, [spaceData, activeAxisIds, selectedStyleId, onPointClick, onPointDoubleClick, dimension, rotation]);

    return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing"><svg ref={svgRef}></svg></div>;
};

export default Visualization;
