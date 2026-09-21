import {timetominutes} from './time.js';

export const checkOverlap = (fromTime, firstend , secondFrom, secondEnd) => {
    return (timetominutes(fromTime) < timetominutes(secondEnd) && timetominutes(firstend) > timetominutes(secondFrom));
}