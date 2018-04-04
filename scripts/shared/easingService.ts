import { injectable } from 'inversify';

@injectable()
export default class EasingService{
    public getEaseOutQuadEasingValue(elapsed: number): number{
        return 2 * elapsed - elapsed * elapsed;
    }
}