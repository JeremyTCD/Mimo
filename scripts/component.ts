export abstract class Component {
    public initialize(): void {
        if (this.canInitialize()) {
            this.setup();
            this.registerListeners();
        }
    }

    protected abstract canInitialize(): boolean;
    protected abstract setup(): void;
    protected abstract registerListeners(): void;
}

