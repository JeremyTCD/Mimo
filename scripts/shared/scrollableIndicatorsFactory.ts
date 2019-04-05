import { injectable } from "inversify";
import ScrollableIndicators from "./scrollableIndicators";
import { ScrollableIndicatorsAxis } from "./scrollableIndicatorsAxis";

@injectable()
export default class ScrollableIndicatorsFactory {
    public build(rootElement: HTMLElement, scrollableIndicatorsAxis: ScrollableIndicatorsAxis) : ScrollableIndicators {
        return new ScrollableIndicators(rootElement, scrollableIndicatorsAxis);
    }
}
