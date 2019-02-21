import { injectable } from 'inversify';

@injectable()
export default class DebounceService {
    public createTimeoutDebounceFunction = (debouncee: (...args: any[]) => void, debounceTime: number): () => void => {
        let timeoutID: number;

        return (): void => {
            window.clearTimeout(timeoutID);
            timeoutID = window.setTimeout(debouncee, debounceTime);
        };
    }
}
