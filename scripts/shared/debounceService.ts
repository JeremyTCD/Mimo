import { injectable, inject } from 'inversify';

@injectable()
export default class DebounceService {
    public createTimeoutDebounceFunction = (debouncee: () => void, debounceTime: number): () => void => {
        let timeoutID: number;

        return (): void => {
            window.clearTimeout(timeoutID);
            timeoutID = window.setTimeout(debouncee, debounceTime);
        };
    }

    public createRafDebounceFunction = (debouncee: () => void): () => void => {
        let timeoutID: number;

        return (): void => {
            cancelAnimationFrame(timeoutID);
            timeoutID = requestAnimationFrame(debouncee);
        };
    }
}
