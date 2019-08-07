import { injectable } from 'inversify';

@injectable()
export default class ThrottleService {
    public createThrottledFunction = (target: (...args: any[]) => void): () => void => {
        let queued = false;
        let wrappedTarget = () => { target(); queued = false; };

        return (): void => {
            if (!queued) {
                requestAnimationFrame(wrappedTarget);
                queued = true;
            }
        };
    }
}
