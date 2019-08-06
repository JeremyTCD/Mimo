import { injectable } from "inversify";
import ScrollableIndicators from "./scrollableIndicators";
import { ScrollableIndicatorsAxis } from "./scrollableIndicatorsAxis";

@injectable()
export default class ScrollableIndicatorsFactory {
    public tryBuild(rootElement: HTMLElement, scrollableIndicatorsAxis: ScrollableIndicatorsAxis) : ScrollableIndicators {
        if (!rootElement) {
            return null;
        }

        return new ScrollableIndicators(rootElement, scrollableIndicatorsAxis);
    }
}
