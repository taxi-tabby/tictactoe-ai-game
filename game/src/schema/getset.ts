class VariableGetSet<T> {
    private _value: T;

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        this._value = newValue;
    }
}

export default VariableGetSet;