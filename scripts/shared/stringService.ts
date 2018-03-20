import { injectable, inject } from 'inversify';

@injectable()
export default class StringService {
    public contains(str, val): boolean {
        if (!val) {
            return true;
        }
        if (str.
            toLowerCase().
            indexOf(val.toLowerCase()) > -1) {
            return true;
        }
        return false;
    }
}
