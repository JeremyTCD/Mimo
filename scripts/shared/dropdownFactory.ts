import { injectable } from "inversify";
import Dropdown from './dropdown';

@injectable()
export default class DropdownService {
    public build(
        contentOuterWrapperElement: HTMLElement,
        contentInnerWrapperElement: HTMLElement,
        toggleElement: HTMLElement,
        headerAndContentWrapperElement: HTMLElement) {

        return new Dropdown(contentOuterWrapperElement, contentInnerWrapperElement, toggleElement, headerAndContentWrapperElement);
    }
}
