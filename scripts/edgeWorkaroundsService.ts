class EdgeWorkAroundsService {

    // If an element has a max-height < its actual height, and overflow is set to auto, edge correctly adds a scrollbar.
    // If max-height is changed to none or any value that is >= the element's height, there should no longer be a scrollbar.
    // Edge however, attempts to render the scrollbar AFTER calculating and assigning the element its correct height. If this 
    // causes overflow (from contents of the element wrapping), the scrollbar remains. This means that even an element with
    // height auto can have a random scrollbar in edge.
    public overflowBugWorkaround(element: HTMLElement) {
        element.style.overflowY = 'hidden';
        // Trigger layout
        element.clientHeight;
        element.style.overflowY = '';
    }
}

export default new EdgeWorkAroundsService();