class DebounceService {

    public createDebounceFunction = (debouncee: () => void, debounceTime: number): () => void => {
        let timeoutID: number;

        return (): void => {
            window.clearTimeout(timeoutID);
            timeoutID = window.setTimeout(debouncee, debounceTime);
        };
    }
}

export default DebounceService;