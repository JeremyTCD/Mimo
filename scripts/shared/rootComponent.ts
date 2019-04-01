import { injectable } from 'inversify';
import Component from "./component";

// Root components correspond to the direct children of <body> and <div id="core">.
@injectable()
export default abstract class RootComponent implements Component {
    private _childComponents: Component[];

    protected addChildComponents(...components: Component[]): void {
        this._childComponents = components;
    }

    public setupRootOnDomInteractive(): void {
        this.setupOnDomInteractive();

        if (!this._childComponents) {
            return;
        }

        for (let i = 0; i < this._childComponents.length; i++) {
            let childComponent = this._childComponents[i];

            if (childComponent.enabled()) {
                this._childComponents[i].setupOnDomInteractive();
            }
        }
    }

    public setupRootOnLoad(): void {
        this.setupOnLoad();

        if (!this._childComponents) {
            return;
        }

        for (let i = 0; i < this._childComponents.length; i++) {
            let childComponent = this._childComponents[i];

            if (childComponent.enabled()) {
                this._childComponents[i].setupOnLoad();
            }
        }
    }

    abstract enabled(): boolean;

    abstract setupOnDomInteractive(): void;

    abstract setupOnLoad(): void;
}
