import { injectable } from "inversify";
 
import * as Tippy from 'tippy.js'; // TODO tippy 3+ does not work, tooltips appear but aren't animated

@injectable()
export default class TooltipService {
    public setupElement(element: HTMLElement, placement: string, text: string = null) {
        if (text) {
            element.setAttribute('title', text);
        }

        Tippy(element, {
            placement: placement,
            duration: 200,
            hideOnClick: false,
            trigger: 'manual',
            animateFill: false
        });
        let tooltip = (element as any)._tippy;
        element.addEventListener('click', () => {
            if (!tooltip.state.visible) {
                tooltip.show();
            }
        });
        element.addEventListener('mouseleave', (event: MouseEvent) => {
            // Chrome bug - https://stackoverflow.com/questions/47649442/click-event-effects-mouseenter-and-mouseleave-on-chrome-is-it-a-bug
            // related target is the element that the mouse entered into - https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/relatedTarget
            if (!event.relatedTarget) {
                return;
            }

            if (tooltip.state.visible) {
                tooltip.hide();
            }
        });
    }
}
