import { createSubscriber } from 'svelte/reactivity';
import { equal } from '@wry/equality';
import type { ApolloClient, DocumentNode, OperationVariables, TypedDocumentNode } from '@apollo/client/core';
import type { DefaultContext, ErrorLike, ErrorPolicy, FetchPolicy, FetchResult } from '@apollo/client';
import { observeOn, asapScheduler } from 'rxjs';

import { ApolloClientContext } from '../../provider/context.js';

export interface SubscriptionOptions<TData = any, TVariables extends OperationVariables = OperationVariables> {
	variables?: Partial<TVariables>;
	client?: ApolloClient;
	context?: DefaultContext;
	skip?: boolean;
	shouldResubscribe?: boolean | ((options?: SubscriptionOptions<TData, TVariables>) => boolean);
	onData?: (data: TData) => void;
	onError?: (error: ErrorLike) => void;
	onComplete?: () => void;
	ignoreResults?: boolean;
	errorPolicy?: ErrorPolicy;
	fetchPolicy?: FetchPolicy;
	extensions?: Record<string, unknown>;
}

export class Subscription<TData = any, TVariables extends OperationVariables = OperationVariables> {
	// Apollo
	private client: ApolloClient;

	// Query
	private query: DocumentNode | TypedDocumentNode<TData, TVariables>;
	private options?: SubscriptionOptions<TData, TVariables>;
	private lastStartOptions?: SubscriptionOptions<TData, TVariables>;

	// Internals
	private _next = () => {};
	private _unsubscribe = () => {};
	private _subscribe: () => void;
	private _state: { data: TData | undefined; error: ErrorLike | undefined; loading: boolean } = {
		data: undefined,
		error: undefined,
		loading: false
	};

	constructor(
		query: DocumentNode | TypedDocumentNode<TData, TVariables>,
		options?: SubscriptionOptions<TData, TVariables>
	) {
		this.client = options?.client || ApolloClientContext.get();
		this.query = query;
		this.options = options;

		this._subscribe = createSubscriber((update) => {
			this._next = update;
			// stop listening when all the effects are destroyed
			return () => this._unsubscribe();
		});

		// Auto-start to mirror useSubscription behavior
		this.execute(this.options);
	}

	private setState(partial: Partial<typeof this._state>) {
		const nextState = { ...this._state, ...partial };
		if (!equal(nextState, this._state)) {
			this._state = nextState;
			// Respect ignoreResults: do not cause reactive updates if true
			if (!this.options?.ignoreResults) {
				this._next();
			}
		}
	}

	execute(nextOptions?: SubscriptionOptions<TData, TVariables>) {
		const prevIgnore = this.options?.ignoreResults;
		const opts = this.mergeOptions(nextOptions);

		// If ignoreResults toggled to true, reset data immediately
		if (!prevIgnore && opts.ignoreResults) {
			this.setState({ data: undefined });
		}

		// Handle skip
		if (opts.skip) {
			this.stop();
			this.setState({ loading: false });
			return;
		}

		// Determine whether to resubscribe
		const shouldResubscribe = typeof opts.shouldResubscribe === 'function'
			? opts.shouldResubscribe(opts)
			: opts.shouldResubscribe;

		if (shouldResubscribe === false) {
			return;
		}

		// Cleanup any existing subscription
		this.stop();

		// Start new subscription
		this.setState({ loading: true, error: undefined });

		const client = opts.client || this.client;
		const observable = client.subscribe<TData, TVariables>({
			query: this.query,
			variables: opts.variables as TVariables,
			context: opts.context,
			fetchPolicy: opts.fetchPolicy,
			errorPolicy: opts.errorPolicy,
			extensions: opts.extensions
		} as any);

		this.lastStartOptions = { ...opts };

		const subscription = observable
			.pipe(observeOn(asapScheduler))
			.subscribe({
				next: (result: FetchResult<TData>) => {
					if (result?.data != null) {
						this.setState({ data: result.data as TData, loading: false, error: undefined });
						opts.onData?.(result.data as TData);
					} else {
						this.setState({ loading: false });
					}
				},
				error: (error: ErrorLike) => {
					this.setState({ error, loading: false });
					opts.onError?.(error);
				},
				complete: () => {
					this.setState({ loading: false });
					opts.onComplete?.();
				}
			});

		this._unsubscribe = () => subscription.unsubscribe();
	}

	restart() {
		const startOptions = this.lastStartOptions || this.options;
		this.stop();
		this.execute(startOptions);
	}

	stop() {
		this._unsubscribe();
		this._unsubscribe = () => {};
	}

	private mergeOptions(nextOptions?: SubscriptionOptions<TData, TVariables>) {
		this.options = { ...this.options, ...nextOptions };
		return this.options || {};
	}

	// Reactive getters
	get data() {
		this._subscribe();
		return this._state.data;
	}

	get error() {
		this._subscribe();
		return this._state.error;
	}

	get loading() {
		this._subscribe();
		return this._state.loading;
	}

	get variables() {
		this._subscribe();
		return this.options?.variables as Partial<TVariables> | undefined;
	}
}
