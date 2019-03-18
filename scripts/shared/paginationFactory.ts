import { injectable } from 'inversify';
import Pagination from './pagination';

@injectable()
export default class PaginationFactory {
    public build(rootElement: HTMLElement,
        maxNumItemsPerPage: number = 5,
        maxNumPageButtons: number = 5,
        onRenderPage?: (rootElement: HTMLElement) => void): Pagination {
        return new Pagination(rootElement, maxNumItemsPerPage, maxNumPageButtons, onRenderPage);
    }
}