declare module 'lodash/debounce' {
	function debounce<T extends (...args: any[]) => any>(fn: T, wait?: number): T & { cancel(): void };
	export = debounce;
}
