import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

export const dynamicNoSSR = <T>(
    loader: () => Promise<{ default: ComponentType<T> } | ComponentType<T>>
) => {
    return dynamic<T>(loader, { ssr: false });
};