export class State {
    public static Generate(size: number): string {
        let state = '';
        for (let i = 0; i < size; i++) {
            const value = Math.round((Math.random() * 255));
            state += value < 16 ? `0${value.toString(16)}` : value.toString(16);
        }
        return state;
    }
}
