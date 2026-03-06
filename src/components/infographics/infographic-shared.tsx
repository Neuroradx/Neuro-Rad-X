'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const GradientText = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
        {children}
    </span>
);

/** SectionIcon: use `path` for Heroicons SVG path, or `icon` for a Lucide component. */
export type SectionIconProps = (
    | { path: string; icon?: never; className?: string }
    | { path?: never; icon: React.ElementType; className?: string }
) & { className?: string };

export const SectionIcon = (props: SectionIconProps) => {
    const className = cn('infographic-section-icon', props.className ?? 'text-primary');
    if ('path' in props && props.path) {
        return (
            <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={props.path} />
            </svg>
        );
    }
    if ('icon' in props && props.icon) {
        const Icon = props.icon;
        return <Icon className={className} />;
    }
    return null;
};

export const InfographicLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="infographic-layout space-y-8">
        {children}
    </div>
);

type InfographicSectionSpan = 1 | 2 | 3;

export interface InfographicSectionProps {
    /** Heroicons path (d="...") or Lucide icon component */
    iconPath?: string;
    icon?: React.ElementType;
    title: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** Grid span on md+: 1 = one column, 2 = full width, 3 = three columns (when grid supports it) */
    span?: InfographicSectionSpan;
}

export const InfographicSection = ({
    iconPath,
    icon,
    title,
    children,
    className,
    span = 1,
}: InfographicSectionProps) => (
    <Card
        className={cn(
            'infographic-card',
            span === 2 && 'md:col-span-2',
            span === 3 && 'md:col-span-2 lg:col-span-3',
            className
        )}
    >
        <CardHeader>
            <CardTitle className="flex items-center text-xl">
                {iconPath && <SectionIcon path={iconPath} />}
                {icon && <SectionIcon icon={icon} />}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);
