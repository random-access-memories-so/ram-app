import { Metadata } from "./metadata";

const RAM_CREATORS: string[] = (process.env.REACT_APP_RAM_CREATORS as string).split(',')

export const isRAM = (metadata: Metadata): boolean => {
    return (metadata.data.creators
        && metadata.data.creators.length > 0
        && RAM_CREATORS.includes(metadata.data.creators[0].address))
        ?? false;
};

export const isBlockjam = (name: string) => name.startsWith('Model') || name.startsWith('BLOCKJAM');

const MIXTAPES: string[] = [
    'RAM Mixtape Volume 1'
];