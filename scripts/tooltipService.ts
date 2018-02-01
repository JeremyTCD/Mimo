import * as Tippy from 'tippy.js';

class TooltipService {
    public setupElement(element: HTMLElement, text: string, placement: string) {
        element.setAttribute('title', text);
        Tippy(element, {
            placement: placement,
            duration: 400,
            hideOnClick: false,
            trigger: 'manual',
            animateFill: false
        });
        let tooltip = (element as any)._tippy;
        element.addEventListener('click', (event: Event) => {
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

export default new TooltipService();
