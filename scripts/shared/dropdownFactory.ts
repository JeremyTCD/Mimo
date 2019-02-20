import { injectable } from "inversify";
import Dropdown from './dropdown';
import OverlayService from "./overlayService";

@injectable()
export default class DropdownService {
    public constructor(private _overlayService: OverlayService) {
    }

    public build(rootElement: HTMLElement,
        onExpand?: () => void,
        onCollapse?: () => void,
        onDropdownButtonClick?: () => void,
        defaultTranslateToTop = true,
        defaultAnimate = true,
        defaultDisableBodyScroll = true,
        defaultLimitDropdownBodyMaxHeight = true) {
        return new Dropdown(rootElement,
            this._overlayService,
            onExpand,
            onCollapse,
            onDropdownButtonClick,
            defaultTranslateToTop,
            defaultAnimate,
            defaultDisableBodyScroll,
            defaultLimitDropdownBodyMaxHeight);
    }
}
